---
"@insession/design-system": minor
---

Button のボーダー消失を直し、Sign in with Apple 用 variant を追加する（#58 / #35 / #71 / #72）

- **#58 `Button variant="secondary"` の 2px アウトラインが描かれない問題を修正。** BASE の `border-transparent` と variant の `border-text` が同じ utilities レイヤーの `border-color` ユーティリティで、勝敗が配布 CSS の出力順で決まり BASE が勝っていた（実測 `border-top-color: rgba(0, 0, 0, 0)`）。`border-color` を **variant 側だけ**が持つ構造に変え、同一プロパティのユーティリティが同時に並ばないようにした（#17 / #21 と同じ方針）。消費側の `border-text!` 応急処置は外せる。
- **#72 `variant="apple"` を追加。** Apple HIG に沿った黒地 / 白文字 / 白ロゴで、ライトテーマでも黒地を維持する（`--color-apple` / `--color-on-apple` / `--color-apple-hover` を追加）。hover は黒地では効かない `brightness` ではなく面の変化で出す。
- **#35 field の枠幅を仕様どおり 1.5px にする。** 裸の任意値（`border-[1.5px]`）は Tailwind v4 が border-color 側と解釈しうる曖昧な書き方で、生成されないと DOM にクラスだけが出て枠が 1px になる。型を明示した書き方へ統一し（`Input` / `Textarea` / `SearchField` / `Composer` / `UploadTile`）、`pnpm check:styles` に任意値ユーティリティの生成検査を足した。
- **#71 `Stepper` の +/- ボタンに `cursor-pointer` を追加。** DS の他のボタン系だけが持っていて Stepper に無く、「押せることが分からない」状態だった。
