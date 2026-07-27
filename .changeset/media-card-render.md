---
'@insession/design-system': minor
---

`MediaCard` が `render` プロップを受け取れるようになった。

- 背景: 消費側（insession-app の `SpaceCard`）は「カード全体がクリック可能」な UI を、`<button>` の中に `<div>` を置く content model 違反を避けるため `<Card render={<button type="button" />} onClick={…}>` と自前で組んでいた。`MediaCard` へ寄せようとすると `MediaCardProps` が `Omit<ComponentProps<'div'>, …>` ベースで `render` を型に持たず、内部の `Card` へ流し込めなかった。
- 対策: `MediaCardProps` のベースを `ComponentProps<'div'>` から `Surface`（`surface.tsx`）と同じ `useRender.ComponentProps<'div'>` に揃え、`render` をそのまま内部の `Card` へ通すようにした。あわせて `interactive`（ホバーの持ち上げ + フォーカスリング）も通せるようにした。これにより `<MediaCard render={<button type="button" />} interactive onClick={…} …/>` の1要素でクリック可能なメディアカードを描ける。
- `interactive` の既定値は従来と同じ `false` で、`render` を渡さない既存の `<MediaCard cover=… title=… />` 呼び出しは一切変更なしで従来どおり `<div>`（Card）として描画され、見た目も変わらない（追加のみで破壊的変更ではない）。
- `MediaCard` が持つ「並び・余白・truncate の取り決めだけを持ち、プロダクト固有の意味づけは持たない」という設計は崩していない。今回増やしたのは「要素の実体を差し替える口」（`render`）と「相互作用の見た目」（`interactive`）の2つだけで、`onPlay` のような用途固定の props は足していない。
