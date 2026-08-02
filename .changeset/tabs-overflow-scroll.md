---
'@insession/design-system': patch
---

Tabs: 行幅に収まらないタブ列を横スクロールできるようにし、モバイル幅では文字を一段小さくした。

`TAB_WIDTH.default` が `flex-none`（縮まない）で `Tabs.List` に `overflow-x` が無かったため、タブが多いとそのままはみ出して切れていた（insession-app のコミュニティ画面がモバイル幅で実際にそうなっていた）。`overflow-x-auto` + `overscroll-x-contain` を足し、スクロールバーは隠す。`overflow-x` を指定すると `overflow-y` も visible ではなくなり、Tab のアクティブ下線（`after:-bottom-px`）がクリップされて消えるため `pb-px` で 1px 逃がしている。折り返し（flex-wrap）にしないのは、下線とアクティブ下線が段ごとに分かれて見た目が崩れるため。

あわせて、モバイル幅（sm 未満）のタブを `text-xs`（11px）/ `tracking-wider`（0.05em）にした。日本語ラベルは字数がそのまま幅になり 0.1em の字間が余計に幅を食うため、6タブで 442px → 408px（約8%）縮み、1画面に入るタブが1つ増える。sm 以上は従来どおり `text-sm`（12px）/ `tracking-widest`（0.1em）。既に収まっているタブ列の見た目は sm 以上では変わらない。
