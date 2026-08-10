---
'@insession/design-system': minor
---

ラベル系部品のトーン語彙を統一し、使い分けの基準をカタログに書く

状態を色で表す部品（`Status` / `Lozenge` / `Badge` / `CountChip`）が、それぞれ独立にトーンの文字列ユニオンを持っていた。**同じ緑を出すのに `tone="live"` と `tone="success"` の 2 通りの書き方**があり、琥珀も `warn` と `warning` に割れていて、部品を乗り換えるたびに呼び出し側の書き換えが要った。

**描画は変わらない。** 旧名は別名として受け続け、既定値も動かしていない。

### 追加

- `SemanticTone` 型（`success` / `warning` / `danger` / `info` / `neutral`）を公開した。状態を色で表す部品が共有するトーン語彙の単一ソース。新しく同種の部品を足すときは独自のユニオンを書かずにこれを使う。
- `Lozenge` に `danger` トーン。それまで Lozenge には赤が無く、「失敗」「期限切れ」のような否定的な工程状態を出せなかった（`accent` のコーラルで代用するしかなく、`Chip` の selected と紛らわしかった）。
- `CountChip` に `tone` prop。既定は `success` で従来と同じ。以前は緑に固定されており、未読を `danger`、下書きを `neutral` で出すといった出し分けができなかった。
- `--color-danger-surface-strong`。`#765` は `success` / `warning` / `info` にだけ `-strong` を足して `danger` を飛ばしていたので対称にした。
- `BadgeToneLegacy` 型（旧 tone 名）。

### `Badge` の tone 名を正名へ

`live` → `success`、`warn` → `warning`、`danger` → `accent`。旧名は別名として受け続けるので**呼び出し側の変更は不要**（描画も 1px 変わらない）。ただし新しいコードでは正名を使うこと。将来のメジャーで旧名を落とす。

`danger` → `accent` の改名は名前と実態のズレを解消するもの。`Badge` の `danger` が描画するのは**赤ではなくコーラル**で、同じ `tone="danger"` でも `StatusBadge` は赤を出していた。**同名で別色**は呼び出し側から予測できない。色そのものは DS 仕様なので動かさず、名前を実態に合わせた。

**`Badge` に赤は無い。** 真の赤が要る状態表現には `StatusBadge` か `Lozenge` の `danger` を使う。

### カタログ

`Overview.mdx` に「ラベル系6部品の使い分け」の節を足した。上から順に答えて最初に当たったものを選ぶ判断フロー、各部品が表すものの一覧、やってはいけないこと 6 項目。

この 3 分割（数値 / 状態 / 分類・対話）は Atlassian（Badge / Lozenge / Tag）と Primer（CounterLabel / Label / Token）が独立に到達した同じ軸にあたる。ただし名前は業界と逆で、Atlassian の `Badge` は数値を指すがこの DS の `Badge` は状態、数値は `CountChip` にあたる — その点も明記した。

`Lozenge` / `CountChip` / `Badge` の story を正名と新トーンに合わせて更新した。
