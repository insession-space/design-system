---
"@insession/design-system": minor
---

MessageItem に `avatarBgColor` を追加。アバターの地の色（`var(--color-surface)` などのトークン）を消費側が選べるようにした。透過のある画像（ドット絵のキャラクター等）をアバターにしたとき、既定の地（bg-info）が透けて見えるのを避けるため。省略時の描画は従来どおり。
