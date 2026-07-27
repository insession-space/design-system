---
'@insession/design-system': minor
---

汎用の `Skeleton` と、`MessageItem`(#83)向けの `MessageItemSkeleton` を追加する(#87)。投稿一覧のような取得に時間がかかるリストで、読み込み中に「これから出る形」を見せてレイアウトシフトを防げるようにする。

```tsx
<Skeleton width={120} height={14} />   // 矩形
<Skeleton circle size={24} />          // 円(アバターのプレースホルダ)
<Skeleton.Text lines={2} />            // テキスト複数行(最終行だけ短くする)

<MessageItemSkeleton />                               // 既定: アバター無し・本文1行・リアクション無し
<MessageItemSkeleton avatar lines={3} reactions={2} />
```

- `Skeleton` の面には shimmer(淡いハイライトが左→右へ流れる)アニメーションが付く。`prefers-reduced-motion: reduce` では静止した面になる
- 装飾要素なので `aria-hidden="true"`。「読み込み中」であることの読み上げ(`aria-busy` / live region)は呼び出し側の責務
- `MessageItemSkeleton` は `MessageItem` と同じ VStack/HStack の gap・寸法でヘッダー行/本文/リアクション行を組んでおり、実データに差し替わったときのレイアウトシフトが最小になる。ホバーアクションのプレースホルダは出さない(読み込み中は操作できないため)

⚠ shimmer の `@keyframes skeleton-shimmer` は `src/styles/components.css` に追加した。**従来方式(`@source` で `dist` を走査する)の消費側は、`@insession/design-system/components.css` を import していないと shimmer だけが静かに効かない**(面自体は出るのでビルドもエラーも通る)。README の記載どおり、1.4.0 以降は `components.css` の import が必要な点を改めて明記する。
