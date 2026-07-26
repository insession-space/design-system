// Storybook 内部の衝突（Issue #19）への回避策。
//
// ── 何が起きるか ────────────────────────────────────────────
// ストーリーを開いた状態からサイドバーで Docs ページへ画面内遷移すると、ページが
// 描画されず `TypeError: Illegal invocation` になる。URL 直打ち / リロードでは起きない。
//
// ── なぜ起きるか ────────────────────────────────────────────
// 1. story を描画すると storybook/internal/csf の enhanceContext が userEvent のために
//    `HTMLElement.prototype.focus` を **アクセサ（get/set）へ差し替える**:
//
//      get() { return this.ownerDocument?.defaultView ? … : noopFocus }
//
// 2. Docs ページは Storybook 自身の UI（storybook/internal/components）を preview iframe
//    内に読み込む。これは react-aria を同梱していて、setupGlobalFocusEvents が
//
//      focus = windowObject.HTMLElement.prototype.focus   // ← プロトタイプから直接読む
//
//    と読んで既存実装をラップする。
//
// 3. その読み取りで 1. の getter が `this = HTMLElement.prototype` で呼ばれる。
//    プロトタイプはノードではないので `this.ownerDocument`（Node のネイティブ getter）が
//    Illegal invocation を投げる。`?.` は「throw を防ぐ」わけではないので効かない。
//
// つまり Storybook の csf addon と、Storybook 自身が同梱する react-aria の衝突。
// 我々のコードや Base UI は関与していない（.storybook を main の状態へ戻しても再現する）。
//
// ── 何をするか ─────────────────────────────────────────────
// 1. の getter を包み、**要素以外のレシーバから読まれたときは getter を呼ばずに
// 素の実装を返す**。要素越しの読み取りは元の getter へそのまま委譲するので、
// Storybook の userEvent 向けの挙動は保たれる。
//
// ── いつ消せるか ────────────────────────────────────────────
// 上流が直したら不要になる。関連: storybookjs/storybook#31243
// （同じ setupGlobalFocusEvents と focus アクセサの衝突。SB9 で報告済み）
// storybook を上げたときは、この回避策を外して Issue #19 の再現手順を試すこと。

// 包んだ getter に付ける印。多重適用を避ける。
const GUARD_FLAG = '__dsFocusAccessorGuard';

type FocusFn = (this: HTMLElement, options?: FocusOptions) => void;

export function guardFocusAccessor(): void {
  if (typeof HTMLElement === 'undefined' || typeof document === 'undefined') return;

  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus');
  // まだ Storybook がパッチしていない（= 素の関数）なら何もしない。
  if (!descriptor?.get) return;
  if (GUARD_FLAG in descriptor.get) return;

  const storybookGet = descriptor.get;

  // プロトタイプから読まれたときに返す実装。要素越しに1度だけ読み出して取り出す
  // （getter は要素を渡せば正常に動く）。ここで固定しておくのが要点 — 読むたびに
  // 取り直すと、react-aria が「読んで包んで書き戻す」ため自分自身を包み続ける。
  const fallback = storybookGet.call(document.createElement('div')) as FocusFn;

  function guardedGet(this: unknown): FocusFn {
    // instanceof はネイティブ getter を触らないので、ここでは throw しない。
    // HTMLElement.prototype 自身は HTMLElement のインスタンスではないため false になる。
    if (!(this instanceof HTMLElement)) return fallback;
    return storybookGet.call(this) as FocusFn;
  }
  Object.defineProperty(guardedGet, GUARD_FLAG, { value: true });

  Object.defineProperty(HTMLElement.prototype, 'focus', {
    configurable: true,
    // setter はそのまま通す。react-aria はラップした関数をここへ書き戻す。
    set: descriptor.set,
    get: guardedGet,
  });
}
