---
'@insession/design-system': patch
---

fix(MediaRow/MediaCard): 行の背景を surface に、カバー画像を full-bleed に

- `MediaRow`: ルート要素が `bg-surface-2`（背景面より一段濃い、浮かせるための面）で塗られており、リスト行として周囲より沈んで見えていた。標準の背景面 `bg-surface` に揃えて Card 等と同じ段に載せる（#107）
- `MediaCard`: カバー画像が `Card padding="lg"` の内側に収まって上・左・右に 16px の余白が入っていたのを、`-mx-4 -mt-4` で打ち消してカード端まで出す。あわせて上側の角丸を Card と同じ `rounded-t-card`（16px）に合わせる（#108）
