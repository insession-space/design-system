---
'@insession/design-system': major
---

**破壊的変更: `ListRow` を廃止し、人の行は `UserLabel` へ集約した。**

`UserLabel` が `href` / `onClick` を受け取れるようになった。`href` を渡すと `<a>`、`onClick` を
渡すと `<button>`、どちらも無ければ従来どおり `<div>` を描く。あわせて `target` / `rel` /
`disabled` / `ariaLabel` を追加した。操作可能なときに必要な打ち消し（`bg-transparent` /
`border-none` / `p-0` / `text-left` / `no-underline`）と、`cursor` ・ hover の面 ・
focus リング ・ disabled 表現は DS 側が持つので、消費側はユーティリティの列を書かなくてよい。

`ListRow` は次の理由で廃止した。

- **人の行に使うと `UserLabel` の保証が効かない。** `ListRow` は `icon` と `label` を別々に
  受けるため、アバター寸法と文字サイズを呼び出し側が個別に指定することになり、`UserLabel` が
  防いでいる「アバターだけ大きい / 文字だけ大きい」ずれが再び起きる
- **`UserLabel` を入れられない。** `ListRow` は `label` を `<span className="truncate">` で包む
  実装で、ルートが `<div>` の `UserLabel` を渡すと `<span><div>` という不正なネストになり、
  `truncate` も効かなくなる
- **汎用の行部品としては窮屈だった。** `icon` / `label` / `description` / `trailing` /
  `chevron` という固定スロットに収まらない行（時刻を先頭に置く履歴行など）が実際にあり、
  スロットを増やし続けるか手組みに戻るかの二択になっていた

移行方法:

```tsx
// 人の行（プロフィールへ遷移する / モーダルを開く）
- <ListRow icon={<Avatar name={name} src={src} size={40} />} label={name} onClick={open} />
+ <UserLabel name={name} src={src} onClick={open} />

// 人以外の行（設定行など）は素の <button> + HStack/VStack で組む
- <ListRow icon={<Icon name="extension" size={24} />} label={name} description={hint} chevron />
+ <button type="button" className="…" onClick={…}>
+   <HStack gap="md" align="center">…</HStack>
+ </button>
```

`ListRow` の利用は insession-app の3箇所のみで loophub は未使用のため、影響範囲は限定的。
