---
'@insession/design-system': patch
---

Menu の active 行の green tint が静止時に表示されない不具合を直した（#17）

`MENU_ROW_BASE` に `bg-transparent` が入っており、配布 CSS 上で `.bg-transparent`(idx 22906) が tint の `color-mix` ルール(idx 20987) より**後に出力される**ため、静止時の 10% tint が打ち消されていた。どちらもクラス1つで特異度が同じなので、クラス属性の並び順ではなく出力順で決まる（#21 と同じ構図）。

`hover:` / `data-highlighted:` のバリアント付きルールは出力順が後で勝つため、**「静止時は tint なし・カーソルが来たときだけ tint が出る」**という中途半端な状態になっていた。1.x から続いていた不具合（#9 の移行時に実測で気づいたが「見た目は変えない」方針だったため changeset に記録だけ残していた）。

行の背景色を `toneClassName` / `plainToneClassName` 側が**排他的に**出すようにした（active なら tint、それ以外は `bg-transparent`）。同じクラス属性に両方が並ばなくなるので、出力順の勝負自体が発生しない。`bg-transparent` を単に消さないのは、preflight を配っていない環境で `Menu.PlainItem`（`<button>`）に UA 既定の背景が残るため。

実測（Chrome の算出スタイル。`transition` を切って計測）:

| | 静止時 | ハイライト時 |
| --- | --- | --- |
| `active` | `success 10%` ← 修正前は透明 | `success 20%` |
| `danger` | 透明 | `danger-surface` |
| 既定 | 透明 | `surface-hover` |

`Item` / `RadioItem` / `CheckboxItem` / `PlainItem` すべてで確認。
