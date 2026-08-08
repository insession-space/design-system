---
"@insession/design-system": patch
---

fix(toast): snackbar variant の `info` トーンのアイコン色を緑（`text-success`）から `text-info` へ修正

`snackbar` variant の `info` トーンは、アイコン色に `text-success`（緑）を割り当てており、`success` トーンと見分けがつかなかった（`success` からのコピペと思われる）。同じファイルの default variant 用マップ（`DS_TONE.info`）は正しく `text-info` を使っている。`info` を本来のセマンティック色 `text-info` へ揃えた。
