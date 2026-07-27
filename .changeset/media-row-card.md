---
'@insession/design-system': minor
---

`MediaRow` / `MediaCard` / `MediaThumbnail` を追加する（#94）。破壊的変更は無い（新規コンポーネントのみ）。

**`MediaRow`（キュー/プレイリストの1行）**:

```tsx
<MediaRow
  dragHandle
  thumbnail={<MediaThumbnail quality="4K" duration="3:32"><img … /></MediaThumbnail>}
  title="深夜のプレイリスト特集"
  subtitle="1番目 · Seiya が追加"
  actions={
    <>
      <IconButton label="再生" icon={<Icon name="play_arrow" />} variant="ghost" touchSize={44} />
      <IconButton label="お気に入りに追加" icon={<Icon name="star_outline" />} variant="ghost" touchSize={44} />
      <IconButton label="キューから削除" icon={<Icon name="close" />} variant="ghost" touchSize={44} />
    </>
  }
/>
```

**`MediaCard`（メディア/ライブのカード）**:

```tsx
<MediaCard
  cover={<img … />}
  overlay={
    <>
      <Badge tone="live" dot>LIVE</Badge>
      <CircleBadge><Icon name="public" size={14} /></CircleBadge>
    </>
  }
  title="Working hard"
  meta="1 watching · playing · late night"
  footer={<AvatarStack people={people} size={28} />}
/>
```

- `dragHandle` / `thumbnail` / `actions`（`MediaRow`）、`cover` / `overlay` / `footer`（`MediaCard`）はいずれも `ReactNode` のスロットで、`onPlay` / `isStarred` / `watchingCount` のような用途固定の意味づけ props は持たない。`title` / `subtitle` / `meta` も**整形済みの文字列**（または `ReactNode`）を受け取るだけで、i18n・データ取得・`kind: 'space-live' | …` のようなプロダクト固有の union は持たない
- サムネイルの尺・画質オーバーレイは補助コンポーネント `MediaThumbnail`（`src` または `children` / `duration` / `quality` / `alt`）に切り出した。画質ラベルは既存の `Badge`（`tone="neutral"`）を流用する
- `MediaCard` のバッジ列に置く正円バッジとして `CircleBadge` も追加した（`Badge` はピル/角丸矩形専用のため）
- ドラッグハンドルは装飾のみ（`aria-hidden="true"`）。実際の DnD 操作は消費側の責務
