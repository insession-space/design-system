---
'@insession/design-system': minor
---

`MessageItem` に OGP リンクプレビュー(fetcher 注入)と、新規コンポーネント `LinkPreview` を追加した(#93)。**破壊的変更は無い**（`fetchLinkPreview` 未指定なら既存の描画と完全に同じ）。

**`LinkPreview`(新規・`src/components/link-preview.tsx`)**: メタデータを props で受け取るだけの presentational コンポーネント。大きい OG 画像を上に、その下にサイト名 → タイトル → 説明文(1〜2行クランプ)を縦積みする。

```tsx
<LinkPreview
  meta={{ url, title, description, siteName, imageUrl }}
  loading={false}
/>
```

- 画像が無いメタデータなら画像領域自体を出さない
- カード全体を1つの `<a>` として描く(`Surface` の `render` prop)。OG 画像は装飾扱い(`alt=""` / `aria-hidden`)にし、リンクのアクセシブル名は「タイトル + サイト名」で構成する
- `loading` の間は `Skeleton` でプレースホルダを出す

**`MessageItem`**: fetcher 注入の口を追加した。

```tsx
<MessageItem
  fetchLinkPreview={(url, signal) => fetchOgpMetadata(url, signal)}
  maxLinkPreviews={1}
>
  記事はこちら https://example.com/article です
</MessageItem>
```

- `@insession/design-system` は public npm の presentational パッケージであり、fetch / network を自身で持たない。そのため実際の HTTP 取得(OGP の HTML パース・CORS/SSRF 対策・キャッシュを含む)は消費側(insession-app / loophub-app、別リポジトリ別 Issue)に委ね、DS は `fetchLinkPreview` という関数を受け取る口だけを持つ
- `fetchLinkPreview` 省略時は対象 URL の計算自体を行わず、既存の呼び出しに一切影響しない
- 本文(`children`)が文字列(または文字列を含む配列)のときだけ URL を自動検出する。`children` に JSX を渡す呼び出し側のため、対象 URL を明示できる `previewUrls?: string[]` も用意した(指定時は自動検出を行わない)
- `maxLinkPreviews?: number`(既定 1)で表示件数の上限を変更できる
- 取得は `AbortController` で管理し、unmount / 対象 URL 変化時に in-flight を abort する(unmount 後に setState しない)。同じ URL への重複呼び出しも抑制する
- `fetchLinkPreview` が `null` を返す/reject する場合はカードを出さず、エラー UI も出さない(本文だけが残る)

`src/index.ts` から `LinkPreview` / `LinkPreviewProps` / `LinkPreviewMeta` を追加 export した。
