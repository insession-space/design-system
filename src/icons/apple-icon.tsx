// Apple ロゴアイコン（純粋 SVG・props 不要）。Apple ログインボタンに使う。
// `GoogleIcon` と対になる部品。DS に Google だけがあり Apple が無かったため、
// 消費側（insession-app）が `user-signin-apple-btn` として legacy CSS で手組みしていた（#53）。
//
// ⚠ 単色。Apple の Human Interface Guidelines は「黒地には白、白地には黒」を要求するので、
// **色は fill="currentColor" で呼び出し側のテキスト色に従わせる**（GoogleIcon がブランド
// 多色で固定なのとは事情が違う）。ボタン側で `text-text` / `text-white` を当てて使う。
export default function AppleIcon() {
  return (
    // ⚠ `GoogleIcon` は `.google-icon`（中身は `flex-shrink: 0` の1行）を使っているが、
    // ここは同等の Tailwind ユーティリティ `shrink-0` で書く。部品 CSS を1行のために
    // 増やす必要が無く、`pnpm check:styles`（DOM に出るクラスに対応ルールがあるかの検査）
    // も素通しできる。実際この検査が「`.apple-icon` に対応ルールが無い」を捕まえた。
    <svg className="shrink-0" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.02 9.55c.01-1.62.86-3.07 2.23-3.9a4.6 4.6 0 0 0-3.6-1.94c-1.5-.16-3.1.87-3.7.87-.62 0-1.9-.84-3.06-.82C3.28 3.79 1.7 4.9.83 6.65c-1.13 2.3-.66 5.6.7 8.02.71 1.24 1.6 2.63 2.78 2.59 1.1-.04 1.53-.72 2.9-.72 1.36 0 1.74.72 2.9.7 1.2-.02 2-1.3 2.72-2.55.5-.87.73-1.32 1.13-2.3-1.6-.62-2.94-2.17-2.94-4.84Z"
      />
      <path
        fill="currentColor"
        d="M11.36 2.9c.64-.78.94-1.79.85-2.8-.99.1-1.9.6-2.55 1.37-.63.72-.97 1.68-.87 2.66 1 .04 1.94-.43 2.57-1.23Z"
      />
    </svg>
  );
}
