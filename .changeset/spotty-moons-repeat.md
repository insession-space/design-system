---
"@insession/design-system": patch
---

Button: 消費側の className で variant / size のスタイルを上書きできるようにする（#137）

`Button` の class 文字列の組み立てを単純連結から tailwind-merge へ置き換えた。同じ CSS プロパティの
ユーティリティが後勝ちで1つに畳まれるので、`<Button variant="ghost" className="text-accent">` が
`!`（important 接尾辞）なしで効くようになる（従来は variant 側の `text-info` が配布 CSS の
出力順で勝っていた）。`px-*` / `py-*` / `text-<size>` / `bg-*` / `border-*` / `font-*` も同様。

出荷済みの見た目は変えていない（全 variant × 全 size の computed style が実ブラウザで一致することを
確認済み）。消費側に既にある `!` も従来どおり効く（important は別グループとして扱われるため、
効きすぎることもない）。
