---
'@insession/design-system': minor
---

`SideNav.Account` を追加する。左レール最下部に常設するログインユーザーのエリアで、行（アバター + 名前 + 補助テキスト + 上下シェブロン）と、押したときに開くアカウントメニューをセットで持つ。

```tsx
<SideNav.Account
  name="Cameron Yang"
  subtitle="cam@untitledui.com"
  status="live"
  menuLabel="アカウントメニュー"
  items={[
    { key: 'profile', icon: 'account_circle', label: 'マイプロフィール' },
    { key: 'signout', icon: 'logout', label: 'サインアウト', separatorBefore: true, danger: true },
  ]}
  onSelect={(key) => …}
/>
```

- メニューは既存の `Menu`（Base UI）で組むため、矢印キー移動・typeahead・フォーカストラップがそのまま効く。レール最下部にあるので**上方向**へ開き、幅はトリガー行に揃う
- 項目は `items` 配列。`separatorBefore` で区切り線、`danger` で警告色、`disabled` で操作不可
- `items` を渡さなければ行だけを描く（表示専用）。込み入ったメニューが要るときは `Menu` を直接組む
- 行の中身は既存の `UserLabel` に委譲するのでアバター寸法と文字サイズが常に連動する。既定 `size='sm'` はレール既定幅 232px で名前が省略されずに収まる段
- 開閉アフォーダンス用に `unfold_more` アイコンを追加した
