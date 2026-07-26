---
'@insession/design-system': minor
---

`Slider` / `SegmentedControl` / `ToggleGroup`（`ToolButton`）を追加した（#53）

いずれも消費側（insession-app）が legacy CSS や `<input type="range">` で手組みしていたものを DS に上げたもの。振る舞いは Base UI へ委譲し、DS 側はトークンベースの見た目だけを持つ（#6 / #22 と同じ方針）。

- **`Slider`** — Base UI の `slider` へ委譲。`label` と `valueLabel`（整形済み文字列を受ける。単位付けは消費側の責務）を持つ。消費側は音量スライダー3種と whiteboard のペン太さ・不透明度で計6箇所を `<input type="range">` + `::-webkit-slider-thumb` / `::-moz-range-thumb` のブラウザ別記述で手組みしており、track の塗り分けも `linear-gradient` を自前で組み立てていた。
- **`SegmentedControl`** — Base UI の `radio-group` へ委譲。`items` を渡すだけで組める。**`ToggleGroup` ではなく `RadioGroup` に載せた**理由は README に書いた（セグメンテッドコントロールは常に1つが選択されている＝未選択状態が無いので、`aria-pressed` ベースの `ToggleGroup` では全部 off を型でも a11y でも許してしまう）。
- **`ToggleGroup` / `ToolButton`** — Base UI の `toggle-group` / `toggle` へ委譲。ツールバーの排他選択。`multiple` で複数選択にもできる。消費側は whiteboard（`whiteboard-chip`）と伝言ゲーム（`canvas-relay-draw-tool`）で**同じ構造の legacy CSS を2セット**持っていた。

⚠ `Slider` の Indicator には position 系のクラスを置いていない。Base UI が Indicator へ `position: relative` を**inline style で**当てるため `absolute` を書いても無効になる（実測で確認）。効かないクラスを残すと「絶対配置で組んである」という誤読を招くため置かない。
