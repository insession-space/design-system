---
"@insession/design-system": minor
---

TypingIndicator（入力中インジケーター）を追加し、Composer の送信アイコンを一回り大きくした（#138）

- `TypingIndicator`: ドット3つ + 短い文言の1行。文言は props 注入、`reserveSpace`（既定 true）で非表示時も行の高さを確保するのでレイアウトが飛ばない。`aria-live="polite"` 付き
- ドットの `@keyframes typing-in` / `typing-dot` を `components.css` に定義。従来この定義は消費側アプリの CSS にしかなく、DS 単体ではアニメーションが静かに死んでいた
- `Composer` の送信アイコンを 16→18px（compact は 14→16px）へ。ボタンの外寸は据え置きなのでレイアウトは変わらない
