---
'@insession/design-system': minor
---

Icon に 10 種を追加（arrow_back / bolt / build / cloud_off / error / mail / refresh / route / search_off / verified）。

loophub-app が Material Symbols の webfont を `.mi` クラスで自前描画していた（62 箇所）のを DS の `Icon` へ寄せるための引き取り。loophub が使う 20 種のうちこの 10 種だけが DS に無く、それが webfont 方式を残す唯一の理由になっていた。

- 追加のみで既存 `IconName` の変更・削除は無い（破壊的変更なし）
- `bolt` はクラシックな Material Icons に存在せず Material Symbols にしか無いため、`sticker` と同じく `EXTRA_PATHS` + `CUSTOM_VIEWBOX`（`0 -960 960 960`）で持つ
- `search_off` の原典は path + polygon の 2 要素だが、`Icon` は単一 path しか描かないので polygon を同一 `d` のサブパスへ変換した（座標は原典のまま・fill-rule も既定の nonzero のままで見た目は原典と同じ）
- 10 種すべてヘッドレス Chromium で実レンダリングし、図形が壊れていないことを確認済み
