---
'@insession/design-system': minor
---

Popover.Popup / Menu.Popup に `padding` / `scroll` prop を追加し、Menu の active 行の green tint が出ない不具合を直す

**`padding` / `scroll` prop の追加（#21）**

2.0 では `panelPadding` / `panelScroll` 専用 props を廃止し、「打ち消したい呼び出し側は `className` で `p-0` / `max-h-none overflow-visible` を渡す」という契約にしていたが、**この打ち消しは成立していなかった**。クラス属性の並び順は CSS の勝敗に無関係で、同一プロパティのユーティリティは配布 CSS の**出力順**で決まるため。実測（Tailwind 4.3.2）では `.p-0`(163644) < `.p-3`(163880)、`.overflow-visible`(154257) < `.overflow-y-auto`(154325) で base 側が勝ち、`.max-h-none`(147707) > `.max-h-80`(147416) だけ偶然打ち消せるという一貫性のない状態だった（padding と overflow は効かず max-height だけ効く）。

「打ち消す」のをやめ、**そもそも出さない**方式に戻した。

```tsx
{/* v1 の panelPadding={false} panelScroll={false} 相当 */}
<Popover.Popup padding={false} scroll={false}>{children}</Popover.Popup>
```

いずれも既定 `true` なので、**何も指定しなければ 2.0.x と同じ見た目**（p-3 + max-h-80 の内部スクロール）。`Menu.Popup` も同じ契約に揃えた。2.0.x で important 接尾辞（`p-0!`）により回避していた消費側は、prop へ置き換えられる（回避策のままでも動く）。

**Menu の active 行の green tint が出ない不具合の修正（#17）**

`MENU_ROW_BASE` に `bg-transparent` が入っており、配布 CSS 上で `.bg-transparent`(22906) が tint の `color-mix` ルール(20987) より後に出力されるため、静止時の 10% tint が打ち消されていた（1.x から続いていた不具合。`hover:` / `data-highlighted:` のバリアント付きルールは出力順で勝つため、「静止時は tint なし・カーソルが来たときだけ tint が出る」という中途半端な状態だった）。

行の背景色を `toneClassName` / `plainToneClassName` 側が**排他的に**出すようにした（active なら tint、それ以外は `bg-transparent`）。同じクラス属性に両方が並ばなくなるので出力順の勝負自体が発生しない。preflight を配っていない環境で `Menu.PlainItem`（`<button>`）に UA 既定の背景が残る問題も、非 active 分岐が `bg-transparent` を出すため起きない。

実測（Chrome, 算出スタイル）: active 行が静止時 `success 10%` → ハイライト時 `success 20%`、danger / 既定 tone は変化なし。
