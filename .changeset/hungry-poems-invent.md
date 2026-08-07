---
'@insession/design-system': minor
---

絵文字ピッカー（`EmojiPicker`）と `:` ショートコード補完（`EmojiSuggest`）を追加した（#190）。

- `EmojiPicker` — Popover で開き、選ばれた絵文字を `onSelect(emoji)` で返す。リアクション追加にも本文への挿入にも使える。トリガーの見た目は `triggerClassName` / `children` で全て差し替えられ、PiP 等で別ドキュメントへ出すための `container` も受ける。配色は `--epr-*` の CSS 変数経由で DS のトークンへ繋いであるので、ライト/ダークの切替に自動で追従する。消費側が CSS で潰していたカテゴリナビの非表示（描画不具合の回避）も DS 側の既定に取り込んだ。
- `EmojiSuggest` — 入力欄で `:smile` のように打つと候補が出て、確定すると**絵文字そのもの**が本文に入る（ショートコード文字列は残らない）。絵文字はドメインに依存しないので、辞書と検索は DS 側が持つ。
- 内部リファクタとして、`Mention` が持っていたトリガー検出・キーボード操作・ARIA・Popover の組み方を `Suggest` へ切り出し、`Mention` と `EmojiSuggest` が共有するようにした。**`Mention` の props も挙動も変えていない。**

`emoji-picker-react` を dependency に追加した（消費側は自分の node_modules から解決する。DS の dist にはバンドルされない）。
