---
"@insession/design-system": minor
---

feat(drawer): 画面端からスライドインする Drawer プリミティブを追加

`Modal`(中央) / `BottomSheet`(下) / `Popover`(アンカー基準) では作れなかった「左右の端から高さいっぱいの板が滑り出る」表現を DS 側に持たせた。Base UI の Dialog に載せているので、backdrop クリック / Esc / フォーカストラップ / スクロールロックは自前実装なしで付いてくる。

- `side`: `'left'`(既定) / `'right'`。上下は `BottomSheet` の役目なので扱わない
- `width`: 既定 `min(320px, 86vw)`。中身が自分で幅を持つ場合（`SideNav` は 232px 固定）は `'auto'` を渡す
- スタイルはユーティリティのみで完結させ、`components.css` には置いていない（`@source` で dist を走査する消費側にも届かせるため）
- `prefers-reduced-motion: reduce` ではスライドのトランジションを止める
