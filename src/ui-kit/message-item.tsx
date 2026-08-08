import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import Avatar from '../components/avatar.tsx';
import IconButton from '../components/icon-button.tsx';
import { HStack, VStack } from '../components/layout.tsx';
import LinkPreview, { type LinkPreviewMeta } from '../components/link-preview.tsx';
import Icon, { type IconName } from '../icons/icon.tsx';
import { TRANSITION_COLORS } from '../lib/class-presets.ts';
import { twMerge } from '../lib/tw-merge.ts';
import { hasSlotContent } from './slot.ts';
import UserLabel from './user-label.tsx';

// 「誰かの投稿1件」を表す複合コンポーネント(#83)。UserLabel / IconButton を束ねるので
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
// ── レイアウトは Slack のメッセージ行と同じ2カラム(#180) ──────
// avatarSrc を渡したときは「左カラム = アバター / 右カラム = ヘッダー(名前 + 時刻 + actions)・
// 本文・リンクプレビュー・リアクション」の2カラムで組む。以前は UserLabel に src を渡して
// アバターをヘッダー行の"内側"に持たせていたため、本文以下はコンテナの左端から始まり
// アバターの真下に潜っていた(本文の左端が名前の左端と揃わない)。アバターを MessageItem 側の
// 左カラムへ出すことで、右カラムの中身が機械的に名前の左端へ揃う。
// アバターは align="start" でヘッダー行の上端に合わせる(Slack と同じく、アバターの高さが
// ヘッダー行より高いぶんは本文1行目の横に並ぶ)。
// avatarSrc 省略時は左カラム自体を作らず、従来どおり単一カラムのコンパクト表示にする
// (アバターが無いのにインデントだけ残ると、宛先の無い余白になる)。
//
// ── 表示名は必ず UserLabel に委譲する ───────────────────
// 表示名の押せる/押せない分岐(href/onClick/disabled)は UserLabel の実装そのものに委ねる。
// アバターは上記のとおり MessageItem 側が持つので、UserLabel には常に hideAvatar を渡し、
// ヘッダー行の「名前 + trailing(時刻)」だけを担わせる(size="sm" は名前の文字サイズ
// text-small と結び付いているので変えない — アバターを外に出しても文字サイズは従来どおり)。
//
// ── アクション群はホバー/フォーカス時のみ見せる ───────────
// 既定で opacity-0 にして視覚的なノイズを減らすが、キーボード操作でも到達できないと
// 操作不能になるため group-focus-within:opacity-100 を必ず併記する(opacity は非表示でも
// tab 移動自体は止めない実装なので、これが無いとフォーカスは移るのに見えない状態が起きる)。
// レイアウトが飛ばないよう absolute にはせず、ヘッダー行の中に領域を確保したまま
// opacity だけを切り替える(表示/非表示で他要素の位置が動かない)。
// この opacity 制御は actions(IconButton 群)にだけ当て、actionsSlot には当てない
// (下記 actionsSlot の説明を参照)。
//
// ── タイムスタンプは UserLabel の trailing に渡す(#97) ────────
// 以前は外側の HStack align="baseline" で名前とタイムスタンプを兄弟として並べていたが、
// UserLabel 自身の内側は HStack align="center" のフレックスで、その最初の要素はテキストを
// 持たないアバターの <div>。フレックスの first baseline はこのアバター div から合成される
// ため、外側の align="baseline" は「名前のベースライン」ではなくアバターの下端を基準にして
// しまい、実測(ヘッドレス Chromium)でアバター有りのとき時刻が 1.84px ずれていた。
// trailing は名前と同じ flex 行のテキスト同士として描かれるため、アバターの有無や
// href/onClick による要素分岐に関係なくベースラインが一致する(user-label.tsx のコメント参照)。
//
// ── actionsSlot: ヘッダー右に任意のノードを置ける口(#97) ────
// actions は `{icon,label,onClick}` の配列しか表現できず、Popover を伴うアクション
// (絵文字ピッカー等)を表現できない。消費側(insession-app)はこれを MessageItem の
// "兄弟"として行方向 flex の中に横並びで置かざるを得なかったが、アクション UI は非表示
// (opacity-0)でも in-flow のため常時レイアウト幅を占有し、本文の折り返し幅を奪っていた
// (実測で本文が約100px 分狭くなり早期折り返しが起きていた)。actionsSlot はヘッダー行の
// 中(actions と同じ領域、actions の後ろ)に任意のノードを描画できる差し込み口を用意し、
// 消費側が兄弟として置く必要をなくす。表示/非表示の制御(ホバー時のみ見せる、タッチ端末で
// data-actions-open を使う等)は消費側が独自に持っているため、DS 側の ACTIONS_VISIBILITY を
// 被せると衝突する。そのため actionsSlot には opacity 制御を当てず、shrink-0 のコンテナに
// 入れるだけにする。
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
  // ヘッダー右側(actions の後ろ)に置く任意のノード。Popover を伴うアクション
  // (絵文字ピッカー等)のように actions では表現できない UI 向け。actions と併存できる。
  // opacity による表示/非表示の制御は当てない(表示/非表示は消費側の責務。上記コメント参照)。
  actionsSlot?: ReactNode;
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
  'opacity-0 transition-opacity motion-reduce:transition-none duration-(--dur-fast) group-hover:opacity-100 group-focus-within:opacity-100';

// ── actions のアイコンボタン寸法(#142) ──────────────────────
// 28px は押しづらかったので、IconButton の既定と同じ 36px へ上げた。ただしヘッダー行の
// 高さは UserLabel(size="sm")側の strut(実測 21.3px)ではなく**このボタンの高さ**が決めて
// おり、素で上げるとヘッダー行が 28px → 36px に伸びてメッセージ1件ごとの縦リズムが変わる
// (実測)。そこで actions のコンテナに上下 -4px のネガティブマージンを当て、行の高さを
// 従来どおり 28px に保ったままボタンだけを大きくする。ghost なので普段は面を持たず、
// はみ出す 4px が隣接要素の見た目に触ることはない(ホバー時の面が上下 4px ぶん広がるだけで、
// 本文の1行目にはかからないことを実測で確認済み)。
// ⚠ ネガティブマージンは actions にだけ当てる。actionsSlot は消費側のノードなので触らない。
const ACTION_BUTTON_SIZE = 36;
const ACTIONS_ROW_HEIGHT_COMPENSATION = '-my-1';

// ── 左カラムのアバター寸法(#180) ────────────────────────
// Slack のメッセージ行と同じ 36px。UserLabel(size="sm")が内包していた 24px は、アバターが
// ヘッダー行の中にしか無かった前提の寸法で、左カラムとして独立させると小さすぎる。
// UserLabel の SIZE レコード(24/40/56)には無い値なので、size を上げる(= 名前の文字サイズも
// 一緒に変わる)のではなく MessageItem 側で Avatar を直接描いて寸法だけを決める。
// シェイプ(rounded-pill)は Avatar の既定のまま変えない。
const AVATAR_SIZE = 36;

// ── リアクションピル(#103) ─────────────────────────────
// Chip ではなく専用の button で描く。Chip の既定は「クイック返信/フィルター/タグ」向けの
// 12.5px + px-3.5 py-[7px] で、主役が絵文字1文字+数字しかないリアクションピルには余白が
// 過大になり、絵文字だけが小さく見える。さらに Chip の selected は accent tint の面に accent の
// 文字を載せるため、数字が背景に溶ける。
// ⚠ これを Chip に className を渡して打ち消すことはできない。Tailwind の同一プロパティの
// ユーティリティ(px-3.5 と px-2、bg-tint-22 と bg-surface-2)は「クラスを後ろに書いた方」ではなく
// 「生成CSSで後に来た方」が勝つため、上書きが効くかがビルド順に依存してしまう。Chip 本体
// (＝フィルター/タグ/入力トークンとしての見た目)は変えられないので、ここで閉じる。
const REACTION_BASE = `inline-flex items-center gap-1 rounded-pill border border-solid px-2 py-1 cursor-pointer select-none ${TRANSITION_COLORS}`;
const REACTION_DEFAULT = 'bg-surface-2 border-border-strong enabled:hover:bg-surface-hover';
// 押している状態は「面」ではなく accent の枠で示す。tint の面を敷くと、その上に載る数字が
// どの色でも同系色に寄って読みづらくなるため(#103)。数字は常に text 色なのでコントラストは
// 押している/いないに関わらず保たれる。
const REACTION_SELECTED = 'bg-surface-2 border-accent enabled:hover:bg-surface-hover';

// 投稿者名を押せるようにしている(href / onClick)ときだけ、その内側に載る時刻を「押せない飾り」に
// 落とすためのハンドラ。preventDefault が <a href> の遷移を、stopPropagation が <button> の
// onClick への伝播を止める。
// ⚠ 残る経路: <a href> を右クリックしてコンテキストメニューから「新しいタブで開く」を選ぶ操作は
// DOM イベントでは止められない。<a> の中に入れた子要素である以上これは避けられないので、時刻を
// 完全に不活性にしたい消費側は authorHref ではなく authorOnClick(=<button>。中クリック/
// コンテキストメニューで遷移しない)を使う。
function swallowActivation(e: MouseEvent<HTMLElement>) {
  e.preventDefault();
  e.stopPropagation();
}

// 中クリックは mousedown の時点で「新しいタブで開く」の対象が決まるブラウザがあるため、
// 中ボタン(button === 1)のときだけ mousedown も止める。左クリックは止めない — 止めると
// 投稿者名側のフォーカス移動やテキスト選択まで壊れるため。
function swallowMiddleMouseDown(e: MouseEvent<HTMLElement>) {
  if (e.button === 1) {
    e.preventDefault();
    e.stopPropagation();
  }
}

export default function MessageItem({
  authorName,
  authorHref,
  authorOnClick,
  timestamp,
  avatarSrc,
  children,
  reactions,
  actions,
  actionsSlot,
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

  const hasHeaderTrailing = (actions != null && actions.length > 0) || hasSlotContent(actionsSlot);
  // 投稿者名を押せるようにしているか(href / onClick)。UserLabel は操作可能なとき行全体を
  // <a>/<button> にするので、trailing に載せた時刻もその操作領域の"内側"に入る。時刻は
  // 押しても何も起きない飾りなので、操作可能なときだけ次の2点で無害化する(#97):
  //   - ポインタ: 時刻のクリック/中クリックを止める(押してもプロフィールへ遷移しない)。
  //   - 読み上げ: 時刻を aria-hidden にし、代わりに UserLabel へ ariaLabel(表示名のみ)を
  //     渡してリンク名が「表示名 + 時刻」に汚れないようにする。そのままだと時刻が支援技術から
  //     消えてしまうので、操作領域の"外側"に sr-only の時刻を1つ置いて読み上げを維持する。
  // 押せないとき(既定)は素の <div> なのでこの手当ては不要 — DOM を増やさない。
  const authorInteractive = authorHref != null || authorOnClick != null;
  const hasInertTimestamp = authorInteractive && timestamp != null;

  // アバターの有無で左カラムを作るかが変わる(#180)。null 明示も「無し」として扱う
  // (従来の hideAvatar={avatarSrc == null} と同じ判定に揃える)。
  const hasAvatar = avatarSrc != null;

  // 右カラム(アバター無しのときは単一カラム)の中身。アバターの有無で分岐するのは"外枠"だけに
  // したいので、中身はここで一度だけ組む。
  const stack = (
    <>
      <HStack gap="sm" align="center" justify="between">
        <UserLabel
          name={authorName}
          href={authorHref}
          onClick={authorOnClick}
          hideAvatar
          size="sm"
          ariaLabel={hasInertTimestamp ? authorName : undefined}
          trailing={
            timestamp != null ? (
              <span
                className="font-body text-xs text-text-dim"
                aria-hidden={hasInertTimestamp || undefined}
                onClick={hasInertTimestamp ? swallowActivation : undefined}
                // 中クリック(新しいタブで開く)は click ではなく auxclick / mousedown の経路を
                // 通るので、onClick だけでは <a> の既定動作を止められない。両方を塞ぐ。
                onAuxClick={hasInertTimestamp ? swallowActivation : undefined}
                onMouseDown={hasInertTimestamp ? swallowMiddleMouseDown : undefined}
              >
                {timestamp}
              </span>
            ) : undefined
          }
        />
        {hasInertTimestamp && <span className="sr-only">{timestamp}</span>}
        {hasHeaderTrailing && (
          <HStack gap="xs" className="shrink-0">
            {actions != null && actions.length > 0 && (
              <HStack
                gap="xs"
                className={`${ACTIONS_VISIBILITY} ${ACTIONS_ROW_HEIGHT_COMPENSATION}`}
              >
                {actions.map((action) => (
                  <IconButton
                    key={action.label}
                    label={action.label}
                    icon={<Icon name={action.icon} size={20} />}
                    variant="ghost"
                    size={ACTION_BUTTON_SIZE}
                    onClick={action.onClick}
                  />
                ))}
              </HStack>
            )}
            {actionsSlot}
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
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: 絵文字は重複しうるため index を使う
              key={index}
              type="button"
              aria-pressed={reaction.reacted ?? false}
              aria-label={`${reaction.label} ${reaction.count}`}
              onClick={reaction.onClick}
              className={`${REACTION_BASE} ${reaction.reacted ? REACTION_SELECTED : REACTION_DEFAULT}`}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {reaction.emoji}
              </span>
              <span
                className={`text-xs leading-none tabular-nums text-text ${
                  reaction.reacted ? 'font-bold' : 'font-semibold'
                }`}
              >
                {reaction.count}
              </span>
            </button>
          ))}
        </HStack>
      )}
    </>
  );

  // group はアクション群のホバー/フォーカス表示の起点になるので、アバターも含む最も外側の
  // 要素に置く(アバターの上をホバーしてもアクションが出る)。w-full は min-w-0 が
  // 「縮むことを許可」するだけで幅を取り切る指定ではないための併記(#97)。行方向 flex
  // の子として置かれたとき(消費側が MessageActionBar 等と横並びにする場合)、与えられた
  // 幅を使い切って本文の折り返し幅を最大化する。
  const rootClass = twMerge('group w-full min-w-0', className);

  if (!hasAvatar) {
    // アバター無し = 従来どおりの単一カラム。左カラムもインデントも作らない(#180)。
    return (
      <VStack gap="xs" className={rootClass}>
        {stack}
      </VStack>
    );
  }

  // Avatar は status / ring を指定しないと legacy 経路(見た目を消費側 CSS に依存)を返すため、
  // UserLabel と同じく必ず `ds` を渡して DS 経路で描画させる。
  const avatarNode = <Avatar ds name={authorName} src={avatarSrc} size={AVATAR_SIZE} />;

  return (
    <HStack gap="sm" align="start" className={rootClass}>
      {/* アバターは隣の名前と同じ情報しか持たないので、入れ物ごと支援技術から隠す(UserLabel が
          自身のアバターに対してやっているのと同じ理由 — 隠さないと Avatar の alt と
          fallback の頭文字で名前が二重に読まれる)。
          ⚠ 投稿者名を押せるようにしているとき(authorHref / authorOnClick)は、アバターも同じ
          操作の当たり判定にする。#180 でアバターを UserLabel の外へ出す前は、アバターが
          UserLabel の <a>/<button> の内側にあったため押せていた — ここを素の div にすると
          「アバターを押してプロフィールを開く」が黙って効かなくなる(回帰)。
          読み上げと tab 順は名前側だけで足りているので、こちらは aria-hidden + tabIndex={-1} で
          支援技術・キーボードの両方から外し、ポインタの当たり判定だけを持たせる
          (同じ遷移先が2回読まれる/2回 tab で止まるのを避ける)。 */}
      {authorHref != null ? (
        <a
          href={authorHref}
          onClick={authorOnClick}
          aria-hidden="true"
          tabIndex={-1}
          className="flex shrink-0"
        >
          {avatarNode}
        </a>
      ) : authorOnClick != null ? (
        <button
          type="button"
          onClick={authorOnClick}
          aria-hidden="true"
          tabIndex={-1}
          className="flex shrink-0 cursor-pointer border-none bg-transparent p-0"
        >
          {avatarNode}
        </button>
      ) : (
        <div aria-hidden="true" className="shrink-0">
          {avatarNode}
        </div>
      )}
      {/* min-w-0 が無いと flex の既定(min-width: auto)により本文の折り返し・truncate が
          効かない。flex-1 で残り幅を取り切る(#97 の折り返し幅の担保をここで引き継ぐ)。 */}
      <VStack gap="xs" className="min-w-0 flex-1">
        {stack}
      </VStack>
    </HStack>
  );
}
