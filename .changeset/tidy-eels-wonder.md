---
'@insession/design-system': minor
---

`SideNav.Account` のメニュー項目を `href`（リンク）にも対応させる。

```tsx
items={[
  { key: 'profile', icon: 'account_circle', label: 'マイプロフィール', href: '/users/me' },
  { key: 'help',    icon: 'help',           label: 'ヘルプ', href: 'https://…', external: true },
  { key: 'signout', icon: 'logout',         label: 'サインアウト', danger: true }, // href 無し＝操作
]}
```

- `href` を渡した項目は `<a href>` として描かれる（`role="menuitem"` は保たれる）。操作（`onSelect` だけ）だと中クリック / Cmd+クリックでの別タブ・リンクのコピーができず、読み上げも「リンク」にならないため
- `external` で別タブ（`target="_blank"` + `rel="noopener noreferrer"`）になり、行末に `open_in_new` が出る（`SideNav.Item` の `external` と同じ扱い）
- `href` 付きの項目でも `onSelect(key)` は従来どおり呼ばれる（計測や後処理のフック）
- `disabled` の項目は `href` があっても `<a>` にしない（HTML の `<a>` に `disabled` は無く、遷移が止まらないため）
