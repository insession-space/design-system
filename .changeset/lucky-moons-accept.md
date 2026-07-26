---
"@insession/design-system": minor
---

`Accordion` / `AccordionItem` を追加。一覧の各行を要約1行に圧縮し、開いた1件だけが中身を出す折りたたみリスト（単一開閉）。スレッド一覧のように件数が増えてもページの縦の長さと DOM のノード数を一定に保ちたい場面で使う。

- 完全な制御コンポーネント（`value: string | null` / `onChange`）。開閉 state は DS が持たない
- `AccordionItem` は `leading` / `title` / `summary` / `meta` のスロットを持つ。閉じているとき `summary` は `summaryLines`（既定 2）行でクランプし、開くと全文になる
- a11y: ヘッダは `<button>`、`aria-expanded` / `aria-controls` / パネルの `role="region"` + `aria-labelledby`。↑ ↓ / Home / End で item 間をフォーカス移動し、`disabled` な item はスキップする。タップ領域は 44px 以上
- 開閉は grid-template-rows `0fr → 1fr` でアニメーションし、`prefers-reduced-motion: reduce` では抑制する
