---
'@insession/design-system': patch
---

Tabs: 行幅に収まらないタブ列を横スクロールできるようにした。`TAB_WIDTH.default` が `flex-none`（縮まない）で `Tabs.List` に `overflow-x` が無かったため、タブが多いとそのままはみ出して切れていた（insession-app のコミュニティ画面がモバイル幅で実際にそうなっていた）。`overflow-x-auto` + `overscroll-x-contain` を足し、スクロールバーは隠す。`overflow-x` を指定すると `overflow-y` も visible ではなくなり、Tab のアクティブ下線（`after:-bottom-px`）がクリップされて消えるため `pb-px` で 1px 逃がしている。折り返し（flex-wrap）にしないのは、下線とアクティブ下線が段ごとに分かれて見た目が崩れるため。既に収まっているタブ列の見た目は変わらない。
