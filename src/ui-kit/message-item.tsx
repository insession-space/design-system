import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import Chip from '../components/chip.tsx';
import IconButton from '../components/icon-button.tsx';
import { HStack, VStack } from '../components/layout.tsx';
import LinkPreview, { type LinkPreviewMeta } from '../components/link-preview.tsx';
import Icon, { type IconName } from '../icons/icon.tsx';
import UserLabel from './user-label.tsx';

// 「誰かの投稿1件」を表す複合コンポーネント(#83)。UserLabel / Chip / IconButton を束ねるので
// src/ui-kit/ に置く。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// InSession の space 内チャット発言にも、loophub のスレッド投稿/コメントにも使える汎用部品と
// して作る。そのため props 名・型名は `chat*` のようなチャット固有の語彙を避け、
// 「投稿(message)」という中立的な語彙で統一する。
//
// 次はいずれも呼び出し側の責務として持たない:
//   - 時刻の整形・相対時刻("3分前" 等)。`timestamp` は整形済みの文字列を受け取るだけ。
//   - i18n・ルーター・認証。表示名の遷移/操作は UserLabel に委ね、authorHref/authorOnClick で
//     注入する。
//   - リアクションピッカー(絵文字選択 UI)そのもの。`add_reaction` のような action は
//     onClick を発火するだけで、ピッカーを開く/閉じるのは呼び出し側が持つ。
//   - 連続投稿のグルーピング・日付区切り・投稿リストのコンテナ(別 Issue の範囲)。
//
// ── 表示名は必ず UserLabel に委譲する ───────────────────
// 表示名の押せる/押せない分岐(href/onClick/disabled)は UserLabel の実装そのものに委ねる。
// UserLabel は自身の HStack の中にアバター(hideAvatar で出し分け)+ 名前を持つので、
// ヘッダー行では UserLabel をそのまま置き、その"外側"(兄弟要素)にタイムスタンプを置く
// (UserLabel の subtitle は名前の"下"にしか出せないため、名前の"横"に置く用途には使えない)。
// avatarSrc を渡したときは UserLabel に src をそのまま渡してアバター付きレイアウトにし、
// 省略時は hideAvatar でコンパクト表示にする。
//
// ── アクション群はホバー/フォーカス時のみ見せる ───────────
// 既定で opacity-0 にして視覚的なノイズを減らすが、キーボード操作でも到達できないと
// 操作不能になるため group-focus-within:opacity-100 を必ず併記する(opacity は非表示でも
// tab 移動自体は止めない実装なので、これが無いとフォーカスは移るのに見えない状態が起きる)。
// レイアウトが飛ばないよう absolute にはせず、ヘッダー行の中に領域を確保したまま
// opacity だけを切り替える(表示/非表示で他要素の位置が動かない)。
//
// ── OGP リンクプレビュー(#93): fetcher 注入で network を持ち込まない ─────
// 本文に貼られた URL のリンク先を `LinkPreview`(src/components/link-preview.tsx)カードで
// 見せる機能を持つが、`@insession/design-system` は public npm の presentational パッケージ
// であり fetch / axios 等の network 実装を一切持たない(依存境界を壊すため禁止)。そこで
// 実際の HTTP 取得は呼び出し側に委ね、DS は `fetchLinkPreview` という**関数を受け取る口**だけを
// 持つ。DS が持つのはあくまで「本文からの URL 検出」「非同期ライフサイクル(loading / 成功 /
// 失敗)」「abort」「重複取得の抑制」という UI 側のロジックまで。実際の HTTP 取得・OGP の
// HTML パース・CORS/SSRF 対策・キャッシュは消費側(insession-app / loophub-app、別リポジトリ
// 別 Issue)の責務。
// `fetchLinkPreview` 省略時は既存の描画と完全に同じにする(effect 自体を起動しない)ことで、
// 既存の呼び出し側にゼロ影響にする(#93 受け入れ条件)。
//
// `previewUrls` という「逃げ道」が要る理由: `children` は `ReactNode` 型であり、DS が
// 機械的に URL を検出できるのは中身が**文字列(または文字列を含む配列)のときだけ**
// (React 要素や number 等からは本文相当の文字列を安全に取り出せない)。したがって
// children に JSX(リンク済みテキスト・添付コンポーネント等)を渡す呼び出し側のために、
// 対象 URL を明示できる `previewUrls` を用意する。`previewUrls` が明示されたら
// それを優先し、本文からの自動検出は行わない(二重検出による意図しない URL 混入を避ける)。

export type MessageItemReaction = {
  // 絵文字そのもの("🙂" 等)。
  emoji: ReactNode;
  // 押した人数。
  count: number;
  // 自分がこのリアクションを押しているか。true で視覚的に強調する。
  reacted?: boolean;
  // 絵文字の意味を伝える読み上げ用ラベル("にっこり" 等)。絵文字だけでは読み上げられない/
  // 意味が伝わらないため必須にする。
  label: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export type MessageItemAction = {
  // src/icons/icon.tsx のアイコン名("push_pin" / "reply" / "add_reaction" 等)。
  icon: IconName;
  // 読み上げ用ラベル。IconButton の aria-label になる。
  label: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export type MessageItemProps = {
  // 投稿者の表示名。UserLabel へそのまま渡す。
  authorName: string;
  // 投稿者名を押せるリンクにする。UserLabel の href と同じ挙動(中クリックで別タブ等)。
  authorHref?: string;
  // 投稿者名を押せるボタンにする。href と併用時は href が優先され、これはそのハンドラになる。
  authorOnClick?: (e: MouseEvent<HTMLElement>) => void;
  // 整形済みの時刻文字列("01:03" 等)。DS は時刻整形ロジックを持たないためそのまま表示する。
  timestamp?: ReactNode;
  // アバター画像 URL。省略時はアバター無しのコンパクト表示になる。
  avatarSrc?: string | null;
  // 投稿本文。テキストに限らずリンク・添付なども差し込める。
  children?: ReactNode;
  // リアクションピルの並び。省略/空配列ならリアクション行を出さない。
  reactions?: MessageItemReaction[];
  // ホバー/フォーカス時に出るアクションアイコン群。省略/空配列なら領域自体を出さない。
  actions?: MessageItemAction[];
  // OGP メタデータの取得を呼び出し側へ委ねる口。`signal` は abort 用(unmount / 対象 URL
  // 変化時に MessageItem が abort する)。メタデータが無い/取得失敗のときは null を返す
  // (reject してもよいが、その場合カードを出さず黙って握り潰す)。省略時は本機能自体が
  // 無効になり、既存の描画と完全に同じになる。
  fetchLinkPreview?: (url: string, signal: AbortSignal) => Promise<LinkPreviewMeta | null>;
  // プレビュー対象 URL を呼び出し側が明示する口。指定時は本文からの自動検出を行わない
  // (children が ReactNode で機械的に検出できないケースの逃げ道。上部コメント参照)。
  previewUrls?: string[];
  // プレビューを表示する上限件数。既定 1。
  maxLinkPreviews?: number;
  className?: string;
};

// https?:// で始まる URL を実用的な精度で検出する。末尾に付きがちな句読点や閉じ括弧は
// リンク先そのものの一部でないことが多いため落とす(完全な URL 仕様準拠のパーサではない)。
const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;
const TRAILING_PUNCTUATION = /[)\]}>.,;:!?、。」』]+$/;

function extractUrls(text: string): string[] {
  const matches = text.match(URL_PATTERN);
  if (matches == null) return [];
  return matches.map((match) => match.replace(TRAILING_PUNCTUATION, ''));
}

// children(ReactNode)から自動検出できるのは「文字列」および「文字列を含む配列」のときだけ。
// それ以外の ReactNode(要素・数値・真偽値等)は無視する(previewUrls を使う想定)。
function extractUrlsFromChildren(children: ReactNode): string[] {
  const parts: string[] = [];
  const nodes = Array.isArray(children) ? children : [children];
  for (const node of nodes) {
    if (typeof node === 'string') parts.push(node);
  }
  return extractUrls(parts.join('\n'));
}

// 重複を除去しつつ順序を保ち、上限件数で打ち切る。
function resolveTargetUrls(urls: string[], max: number): string[] {
  const unique = Array.from(new Set(urls));
  return unique.slice(0, Math.max(0, max));
}

// アクション群は既定で隠し、ホバー/フォーカス時だけ見せる。group-focus-within を必ず
// 併記することで、キーボードで tab 移動してきたときも見える(#83 受け入れ条件)。
const ACTIONS_VISIBILITY =
  'opacity-0 transition-opacity duration-(--dur-fast) group-hover:opacity-100 group-focus-within:opacity-100';

export default function MessageItem({
  authorName,
  authorHref,
  authorOnClick,
  timestamp,
  avatarSrc,
  children,
  reactions,
  actions,
  fetchLinkPreview,
  previewUrls,
  maxLinkPreviews = 1,
  className = '',
}: MessageItemProps) {
  // fetchLinkPreview 未指定なら対象 URL を計算すらしない(既存呼び出しに副作用ゼロにする)。
  const targetUrls =
    fetchLinkPreview == null
      ? []
      : resolveTargetUrls(previewUrls ?? extractUrlsFromChildren(children), maxLinkPreviews);
  // 配列は毎レンダーで新しい参照になりうるため、effect の依存には内容を畳んだ文字列を使う
  // (そのままだと URL 集合が変わっていなくても effect が無駄に再実行され、abort → 再取得が
  // 起き続けてしまう)。
  const targetUrlsKey = JSON.stringify(targetUrls);

  // 解決済みのプレビュー。値が LinkPreviewMeta なら成功、null なら「取得失敗/データ無し
  // だったので何も描かない」ことを覚えておくためのマーカー(key が無ければ「取得中」)。
  const [previews, setPreviews] = useState<Record<string, LinkPreviewMeta | null>>({});
  // 同じ URL に対して fetchLinkPreview を二重に呼ばないための既視 URL 台帳。
  // レンダーを跨いで残す(state にすると更新のたびに再レンダーが要るため ref で十分)。
  const requestedRef = useRef<Set<string>>(new Set());
  // cleanup(unmount 時含む)で「まだ解決していない URL」を requestedRef から取り除けるよう、
  // 最新の previews を ref にも同期しておく。
  const previewsRef = useRef(previews);
  previewsRef.current = previews;
  // fetchLinkPreview は「常に最新のものを ref 経由で呼ぶ」形にして effect の依存から外す。
  // 呼び出し側が `fetchLinkPreview={(url, signal) => …}` のようにインライン関数を渡すのは
  // ごく自然な書き方だが、それだと親が再レンダーするたびに関数の identity が変わり、
  // 依存に積んでいると「cleanup で in-flight を abort → 台帳から外す → 再取得」が
  // 毎レンダー繰り返される(チャットのように親が頻繁に再レンダーする画面では、
  // プレビューが永久に解決しないまま取得だけが走り続ける)。取得の起動条件は
  // 「対象 URL の集合が変わったか」だけであるべきなので、関数は ref で最新を参照する。
  const fetchLinkPreviewRef = useRef(fetchLinkPreview);
  fetchLinkPreviewRef.current = fetchLinkPreview;

  // targetUrls は毎レンダーで新しい配列になりうるが、依存には内容を畳んだ targetUrlsKey
  // だけを使う(そのまま targetUrls を依存に積むと、URL 集合が変わっていなくても参照が
  // 変わるたびに effect が再実行され、abort → 再取得が起き続けてしまうため)。
  // biome-ignore lint/correctness/useExhaustiveDependencies: targetUrls(および派生する .filter/.length)と fetchLinkPreview を意図的に依存から外し、内容ベースの targetUrlsKey だけを使う(理由は直前のコメント)。
  useEffect(() => {
    const fetcher = fetchLinkPreviewRef.current;
    // noImplicitReturns 対策で早期リターンにも no-op のクリーンアップを明示する
    // (下の本流と戻り値の形を揃える)。
    if (fetcher == null || targetUrls.length === 0) return () => {};
    const controller = new AbortController();
    // このタイミングで未取得の URL だけを対象にする(既に requestedRef にある URL は
    // 別の effect 実行で取得済み/取得中なので呼ばない)。
    const urlsToFetch = targetUrls.filter((url) => !requestedRef.current.has(url));
    for (const url of urlsToFetch) {
      requestedRef.current.add(url);
      fetcher(url, controller.signal)
        .then((meta) => {
          // abort 後(unmount / 対象 URL 変化)の結果は stale なので捨てる。
          if (controller.signal.aborted) return;
          setPreviews((prev) => ({ ...prev, [url]: meta }));
        })
        .catch(() => {
          // abort による reject(unmount / 対象 URL 変化で意図的に起こしたもの)は想定内
          // なので、ここでは何もしない(console へも出さない)。stale な結果を捨てるだけ。
          if (controller.signal.aborted) return;
          // 本当の失敗(ネットワークエラー・パース失敗等)も黙って握り潰す — カードを出さず、
          // エラー UI も出さない(#93 受け入れ条件)。呼び出し側が診断したい場合は
          // fetchLinkPreview 自身の実装内でログを取る想定(DS 側では出さない)。
          setPreviews((prev) => ({ ...prev, [url]: null }));
        });
    }
    return () => {
      controller.abort();
      // 解決前に abort された URL は「取得中」のまま固まらないよう台帳から外し、
      // 対象 URL に再び戻ってきたときに再取得できるようにする。
      for (const url of urlsToFetch) {
        if (!(url in previewsRef.current)) requestedRef.current.delete(url);
      }
    };
  }, [targetUrlsKey]);

  // 「取得中(key 無し)」か「成功(meta あり)」の URL だけを描く。null(取得失敗/データ無し)で
  // 確定した URL は完全に外す — targetUrls をそのまま並べると、全件 null に落ちたときに
  // 中身が空の VStack が残り、親が gap 付きの flex column なので**高さ 0 でも余分な間隔が
  // 生まれてしまう**(「カードもエラーも出さず本文だけが残る」約束が崩れる)。
  const visiblePreviewUrls = targetUrls.filter((url) => previews[url] !== null);

  return (
    // group はアクション群のホバー/フォーカス表示の起点になる。
    <VStack gap="xs" className={`group min-w-0 ${className}`.trim()}>
      <HStack gap="sm" align="center" justify="between">
        <HStack gap="sm" align="baseline" className="min-w-0">
          <UserLabel
            name={authorName}
            href={authorHref}
            onClick={authorOnClick}
            src={avatarSrc}
            hideAvatar={avatarSrc == null}
            size="sm"
          />
          {timestamp != null && (
            <span className="shrink-0 font-body text-xs text-text-dim">{timestamp}</span>
          )}
        </HStack>
        {actions != null && actions.length > 0 && (
          <HStack gap="xs" className={`shrink-0 ${ACTIONS_VISIBILITY}`}>
            {actions.map((action) => (
              <IconButton
                key={action.label}
                label={action.label}
                icon={<Icon name={action.icon} size={16} />}
                variant="ghost"
                size={28}
                onClick={action.onClick}
              />
            ))}
          </HStack>
        )}
      </HStack>
      {children != null && (
        <div className="min-w-0 whitespace-pre-wrap break-words font-body text-small text-text">
          {children}
        </div>
      )}
      {visiblePreviewUrls.length > 0 && (
        <VStack gap="xs">
          {visiblePreviewUrls.map((url) => {
            const resolved = previews[url];
            // key が無ければまだ解決していない = ローディング中。
            return (
              <LinkPreview key={url} meta={resolved ?? undefined} loading={resolved == null} />
            );
          })}
        </VStack>
      )}
      {reactions != null && reactions.length > 0 && (
        <HStack gap="xs" wrap className="mt-0.5">
          {reactions.map((reaction, index) => (
            <Chip
              // biome-ignore lint/suspicious/noArrayIndexKey: 絵文字は重複しうるため index を使う
              key={index}
              selected={reaction.reacted}
              // 押しているかは面と枠(accent tint + accent 枠)で示す。check は出さない —
              // 絵文字の隣にチェックが並ぶと、何に対する肯定なのかが読めなくなるため。
              showCheck={false}
              aria-label={`${reaction.label} ${reaction.count}`}
              onClick={reaction.onClick}
            >
              <span aria-hidden="true">{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </Chip>
          ))}
        </HStack>
      )}
    </VStack>
  );
}
