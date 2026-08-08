import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { LinkPreviewMeta } from '../components/link-preview.tsx';

// MessageItem の「本文に貼られた URL のリンク先プレビュー」の非同期ライフサイクル(取得・重複除去・
// abort・cleanup)を1つの hook に閉じ込める(#83 / #93)。実際の HTTP 取得は呼び出し側が渡す
// `fetchLinkPreview` に委ね、ここは「対象 URL の決定」「二重取得の抑止」「stale 結果の破棄」
// 「描く URL の選別」だけを持つ。MessageItem 本体からこの塊を切り出すことで、レイアウト JSX と
// 取得ロジックがそれぞれ独立して読める(振る舞いは移動前と同一)。

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

export type UseLinkPreviewsArgs = {
  children: ReactNode;
  fetchLinkPreview?: (url: string, signal: AbortSignal) => Promise<LinkPreviewMeta | null>;
  previewUrls?: string[];
  maxLinkPreviews: number;
};

export type UseLinkPreviewsResult = {
  // 解決済みのプレビュー。値が LinkPreviewMeta なら成功、null なら「取得失敗/データ無し」。
  // key が無い URL は「取得中」。
  previews: Record<string, LinkPreviewMeta | null>;
  // 実際に描く URL(取得中 or 成功のみ。null 確定は除外)。
  visiblePreviewUrls: string[];
};

export function useLinkPreviews({
  children,
  fetchLinkPreview,
  previewUrls,
  maxLinkPreviews,
}: UseLinkPreviewsArgs): UseLinkPreviewsResult {
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

  return { previews, visiblePreviewUrls };
}
