---
"@insession/design-system": minor
---

Callout（dismissible なインライン告知バー）を追加した（#211）

特定の UI（プレーヤー等）の直上に置く用途で、画面隅に浮く Toast/Snackbar とは別物。`tone`（info / warning / danger / success）ごとに既定アイコンを持ち、`icon={null}` で領域ごと非表示にできる。`onDismiss` を渡したときだけ × ボタンを描画し、表示/非表示の状態管理そのものは消費側の責務とする。素の div + `Record<CalloutTone, string>` の tone マップという既存の Lozenge / Badge と同じ書式で、Base UI や cva は使っていない。
