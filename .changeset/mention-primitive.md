---
"@insession/design-system": minor
---

Mention: `@` メンション候補サジェスト用のプリミティブを追加

テキスト入力欄の中でトリガー文字（既定は `@` と全角 `＠`）を検出し、候補リストを Popover 上に
出す汎用プリミティブ。Base UI の Popover に委譲しており、行の見た目は Menu の行をそのまま
再利用する（新しい見た目は作っていない）。

- **入力欄の value は消費側が所有する。** DS は `inputRef` から value / selectionStart を読むだけで
  書き換えない。確定時は `onSelect(item, range)` で「置き換えるべき範囲」を渡し、実際の置換は
  消費側が行う（controlled な入力欄の state と乖離させないため、また挿入後の整形がアプリごとに
  違うため）
- 候補は `items` で受け取る純粋な leaf。「誰が候補か」「AI Agent かどうか」といったドメイン概念は
  持たず、種別表示は `badge` に ReactNode を渡して表現する
- ↑↓ で移動 / Enter・Tab で確定 / Esc で閉じる。**IME 変換確定の Enter は奪わない**
- キー操作は入力欄に張った native capture リスナで処理して `stopPropagation()` するため、
  `Composer` の「Enter で送信」と**Composer を変更せずに**共存する
- 候補が開いてもフォーカスは入力欄に残る（`initialFocus` / `finalFocus` を無効化）
- 入力欄側の `aria-expanded` / `aria-controls` / `aria-activedescendant` は DS が付け外しする
- `anchor` で候補パネルの基準要素を指定できる。`Composer` のように「入力欄 + 下段アクション行」の
  複合を使う場合は外側の器を渡す（textarea を基準にすると下向きフリップ時にアクション行へ重なる）
