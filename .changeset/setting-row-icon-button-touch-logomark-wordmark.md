---
'@insession/design-system': minor
---

`IconButton` にタッチ端末向けの `touchSize` を足し、設定行の `SettingRow` を追加し、`LogoMark` のワードマークを差し替え可能にする（#60 / #73 / #74）。**破壊的変更は無い**（既存 props の意味・既定値・見た目はいずれも据え置き）。

**`IconButton`（#60）**: 寸法をインライン style ではなくユーティリティ + CSS 変数で当てるようにし、`touchSize`（`@media (pointer: coarse)` のときに保証する最小の一辺）を追加した。

```tsx
<IconButton label="リアクション" icon={…} size={30} touchSize={44} />
```

- 従来は `style={{ width, height }}` だったため、インライン style があらゆるセレクタより強く、消費側が `@media (pointer: coarse)` やユーティリティで**上書きできなかった**（insession-app のリアクション送信ボタンが legacy CSS の 44px から 30px に縮み、Apple HIG のタップターゲット下限を割った）
- `touchSize` 省略時はタッチ端末でも `size` のまま。**既存呼び出しの見た目は変わらない**（実測: 既定 36px は 36x36px のまま / `size=30` は touch 環境でも 30x30px）
- 寸法がクラス側に移ったので、`className="max-md:size-11"` のようなバリアント付きユーティリティでも広げられる（実測で 44x44px）。`min-*` は `width`/`height` より常に強く、バリアント付きは base より後に出力されるため、クラスの並び順に依存しない

**`SettingRow`（#73・新規）**: 「ラベル（+ 説明）+ 末尾のコントロール」からなる設定行。

```tsx
<SettingRow
  label="効果音"
  description="チャットの受信やリアクションで音を鳴らす"
  trailing={<Toggle checked={sound} onChange={toggle} label="効果音" />}
/>
```

- **既定は非対話**（`<div>`）。`href` → `<a>` / `onClick` → `<button>`（`UserLabel` と同じ流儀）
- **対話的にしても `trailing` は対話要素の外（兄弟）に置く**ので、`<button>` の中に `<button>` / `<input>` が入る不正な DOM が構造的に起きない。廃止した `ListRow` は `<button>` 固定でこれができず、insession-app #1172 のアカウント設定 14 行が**1行も載せられなかった**
- `descriptionLines` で説明文を 1 行省略 / 2〜3 行クランプ / 折り返し（既定）から選べる（旧 `ListRow` は `truncate` 固定だった）
- `icon` / `chevron` / `danger` / `disabled` / `ariaLabel` も持つ

**`LogoMark` / `BrandImage`（#74）**: ワードマークの `"LOOPHUB"` ハードコードをやめ、`wordmark`（`ReactNode`。**既定は従来どおり `'LOOPHUB'`**）と `mark`（マーク自体の差し替え）を追加した。あわせてライト/ダークで画像を出し分けるだけの `BrandImage` を追加した。

```tsx
<LogoMark size={24} showWordmark wordmark="INSESSION" />
<BrandImage src={logoDark} lightSrc={logoLight} alt="InSession" height={28} />
```

- DS は2プロダクト（InSession / loophub）で共有するので、新しい呼び出しは `wordmark` を明示する
- `BrandImage` は `<html data-theme="light">` の判定を DS 側へ引き取る（insession-app では利用箇所8つが `[[data-theme=light]_&]:hidden` の任意バリアント文字列を複製していた）。⚠ 表示切り替えなので**両方の画像が読み込まれる**（ロゴのような小さな SVG 前提）
