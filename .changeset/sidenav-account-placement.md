---
"@insession/design-system": minor
---

SideNav.Account のメニュー配置を `side` / `align` / `sideOffset` で指定できるようにした（#169）。既定は従来どおり `side="top"` / `align="start"` / `sideOffset` は Menu の既定値なので、既存の利用側の見た目は変わらない。`side` が縦方向（`top` / `bottom`）以外のときはトリガー幅への追従（`--anchor-width`）を適用しないので、レールの横へ出してもメニューがレール幅に固定されない。
