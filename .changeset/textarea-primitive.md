---
'@insession/design-system': minor
---

`Textarea` プリミティブを追加した。

DS は `Input`（1行）と `Composer`（チャット送信欄。送信ボタンと添付を内包する専用部品）は持っていたが、**汎用の複数行入力が無かった**。そのため消費側は raw な `<textarea>` を置き、見た目はアプリ側のグローバル CSS（`textarea { … }`）で与えるしかなかった。insession-app にも4箇所の raw な textarea が残っており、`apps/web/src/style.css` に38行のグローバル定義を抱えていた。

ラベル（mono caps）・field（surface-2 + 1.5px border + radius md）・状態の優先度（error > focused > default）と色は **`Input` と完全に同一**。フォームで並べたときに揃うことが要件なので、値を変えるときは両方まとめて変えること。

textarea 固有の差分は3点だけ:

- field を `items-center` ではなく `items-stretch` にする（複数行なので中央寄せは不要）
- `rows` の既定を **4** にする（HTML 既定の2行は狭い）
- `resize` prop で方向を選べる（既定 `'vertical'`。横に伸ばせると親のレイアウトが崩れるため `'none'` も用意）

ライト/ダーク両テーマで `Input` と並べた見た目・focus リング・error 表示を実ブラウザで確認済み。
