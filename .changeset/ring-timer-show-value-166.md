---
"@insession/design-system": minor
---

RingTimer: 中央の数字を出さないモード（`showValue`）・リングの太さ指定（`thickness`）・リング色の差し替え（`ringColor`）を追加

バッジのような小さい寸法（16px 前後）でリングを進捗インジケータとして使えるようにした。

- `showValue`（既定 `true`）を `false` にすると中央の残り秒数と caption を描かない。`role="progressbar"` / `aria-valuenow` / `aria-valuetext` / アクセシブルな名前は維持するので、数字を消しても支援技術には残り時間が伝わる
- `thickness`（px）でリングの太さを固定できる。未指定なら従来どおり直径の 14%（マスク 72%/73% と同値）で、既存の呼び出しの見た目は変わらない
- `ringColor` でリングの色を差し替えられる。既定は従来どおり `var(--color-accent)`。`currentColor` を渡すと親のテキスト色に追従するので、文字色で状態を出し分けている呼び出し側とリング色を揃えられる
