---
'@insession/design-system': minor
---

`MessageItem` を追加する。「誰かの投稿1件」を表す複合コンポーネントで、InSession の space 内チャット発言にも loophub のスレッド投稿/コメントにも使える汎用部品として作った。

```tsx
<MessageItem
  authorName="川村静哉"
  authorHref="/u/kawamura"
  timestamp="01:03"
  reactions={[{ emoji: '🙂', count: 1, reacted: true, label: 'にっこり', onClick }]}
  actions={[
    { icon: 'push_pin', label: 'ピン留め', onClick },
    { icon: 'reply', label: '返信', onClick },
    { icon: 'add_reaction', label: 'リアクション', onClick },
  ]}
>
  本文
</MessageItem>
```

- ヘッダー行の表示名は既存の `UserLabel` に委譲する(押せる/押せない分岐も `UserLabel` 任せ)
- `avatarSrc` を渡すとアバター付き、省略するとアバター無しのコンパクト表示になる
- `actions` はホバー/キーボードフォーカス時のみ表示される(`group-focus-within` を併記しキーボード操作でも到達できる)
- `reactions` のピルは既存の `Chip`(`selected`)を使い、`reacted: true` のものを視覚的に強調する

これに合わせて `UserLabel` に `hideAvatar?: boolean`(既定 `false`)を追加した。true のときアバターの `div` ごと描画しない。既存呼び出し側の見た目・挙動は変わらない(省略時の既定はアバター表示のまま)。
