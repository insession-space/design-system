---
"@insession/design-system": minor
---

面プリミティブ(`Surface` / `Paper` / `Card` / `Panel`)と、`theme.css` に elevation スケール(`--shadow-elevation-0`〜`4`。既存の `--shadow-soft` / `-popover` / `-overlay` を参照する別名トークンで、新しい影の実値は追加していない)を追加した。`elevation` プロパティ1つで背景/境界/影の3点セットが決まり、既存の Card(2) / Popover・Menu(3) / Modal(4) と同じ組に対応する。
