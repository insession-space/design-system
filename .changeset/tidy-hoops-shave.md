---
"@insession/design-system": patch
---

fix(icon): `waving_hand` を Material Symbols Outlined の公式パスへ差し替え

これまで `waving_hand` には Material Symbols / レガシー Material Icons のどれとも一致しない出所不明のパスが入っており、「指の分かれていない塊状の手」として描画されていた（公式にあるモーション弧2本も欠けていた）。Material Symbols Outlined (FILL@0 / wght@400 / GRAD@0 / opsz@24) の公式パスへ差し替え、あわせて `PATHS`（`0 0 24 24`）から `EXTRA_PATHS` + `CUSTOM_VIEWBOX`（`0 -960 960 960`）へ移設した。`IconName` は変わらないため消費側の変更は不要。
