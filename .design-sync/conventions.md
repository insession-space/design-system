# InSession UI — 使い方の規約（design agent 向け）

## セットアップ / ラップ

- Provider は**不要**。全コンポーネントは純粋 leaf（context 不要。文言・ハンドラ・データは props で注入する）。
- コンポーネントは **`window.InsessionDesignSystem.*`**（例: `window.InsessionDesignSystem.Button`）。
- **配布 CSS は `body` / `html` に何も当てない。** `:root` にトークンを定義するだけなので、**ページの地色・文字色・フォントは自分で当てること**。これを省くと白地に暗テーマ配色のコンポーネントが載り、テキストもボーダーもほぼ見えなくなる。ルート要素に必ず次を書く:

  ```tsx
  <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
    {/* ここに UI */}
  </div>
  ```

- **既定はダーク。** ライトは `<html data-theme="light">` を立てると `:root[data-theme="light"]` のオーバーレイで同じトークン名のまま値が切り替わる。どちらの場合もトークン参照で書いていれば追従する。
- バンドルの `DsSurface` export は design-sync のプレビュー専用シム。**実デザインでは使わない**（上のルート要素で代替する）。

## スタイリングの流儀

このDSは **Tailwind v4 + CSS カスタムプロパティのトークン**。ただし同梱 CSS は**実際に使われたユーティリティだけを含むコンパイル済み CSS**（実行時 JIT なし）。したがって:

1. **コントロールはまずライブラリコンポーネントで**（Button / Input / Textarea / Tabs / Modal / Toast …）。見た目は variant / tone / size props が担う。
   - `Button variant`: `primary` `accent` `secondary` `ghost` `danger` `live` `join` `apple`
   - `StatusBadge tone` / `Lozenge tone`: `success` `warning` `danger` `info` `neutral`（`Lozenge` は `danger` の代わりに `accent`）。`StatusBadge` は `dot` / `pulse` も取る
   - `Icon` は名前指定: `<Icon name="star" size={16} />`
2. **`Modal` / `Popover` / `Tabs` / `Toast` / `SideNav` は compound namespace**。単体タグではなくサブコンポーネントで組む（例: `Tabs.Root` / `Tabs.List` / `Tabs.Tab` / `Tabs.Panel`）。API は各 `.d.ts` / `.prompt.md` を読むこと。
3. **レイアウトの糊**は基本ユーティリティ（実在確認済み: `flex` `flex-col` `grid` `items-center` `gap-4` `p-4` `text-sm` `font-bold` `bg-surface` `text-text-dim` `rounded-card` `border-border`）を使ってよいが、**任意の Tailwind クラスが存在する保証はない**。珍しいクラスは効かない → その場合は inline style + トークン変数で書く。
4. **生の hex / マジックナンバーは書かない** — 必ずトークンを参照する。

主要トークン（`_ds_bundle.css` の `:root` に実在。すべて `var(--…)` で参照）:

| 系統 | トークン |
|---|---|
| 背景/面 | `--color-bg` `--color-bg-elevated` `--color-surface` `--color-surface-2` `--color-surface-3` `--color-surface-hover` `--color-fill` |
| 文字 | `--color-text` `--color-text-dim` `--color-text-faint` `--color-on-accent` `--color-on-fill` |
| ブランド/意味色 | `--color-accent`（コーラル） `--color-accent-2` `--color-accent-soft` `--color-success(-surface/-border)` `--color-warning(-surface/-border)` `--color-danger(-surface/-border)` `--color-info(-surface/-border)` `--color-link` |
| 枠/フォーカス | `--color-border` `--color-border-strong` `--color-focus-ring` `--focus-ring-width` |
| 角丸 | `--radius-xs/-sm/-md` `--radius-card` `--radius-chip` `--radius-pill` `--radius-panel` `--radius-sheet` |
| 影/段 | `--shadow-soft` `--shadow-popover` `--shadow-overlay` `--shadow-focus` |
| フォント | `--font-body` `--font-display` `--font-mono`（すべて JetBrains Mono ベース） |
| 字送り/字間 | `--text-display` `--text-h1` `--text-h2` `--text-body` `--text-label` `--text-small` |
| モーション | `--ease-spring` `--ease-out` `--ease-in-out` `--dur-fast/-base/-slow` |
| 重なり | `--z-nav` `--z-sticky` `--z-dropdown` `--z-popover-portal` `--z-modal` `--z-snackbar` |

トンマナ: **控えめ・洗練**。tinted surface + 細ボーダー + subtle な状態変化が基本。派手なグラデーション/グローは使わない。

## 真実の在り処

- トークンとクラスの全定義: `styles.css` → `_ds_bundle.css`（`@import` 済み。スタイリング前にここを読む）。
- 各コンポーネントの API と用例: `components/<group>/<Name>/<Name>.d.ts` と `<Name>.prompt.md`。`<group>` は `actions` `data-display` `feedback` `foundations` `inputs` `layout` `navigation` `overlays` `page` `patterns` `surfaces` の11種。

## 典型的な組み方

```tsx
const { Button, Input, Tabs, StatusBadge, CountChip } = window.InsessionDesignSystem;

<div style={{ minHeight: '100dvh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
  <div className="flex flex-col gap-4 p-4"
       style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
    <Tabs.Root defaultValue="watch">
      <Tabs.List ariaLabel="セクション">
        <Tabs.Tab value="watch">Watch Party<CountChip animated>3</CountChip></Tabs.Tab>
        <Tabs.Tab value="chat">チャット</Tabs.Tab>
      </Tabs.List>
    </Tabs.Root>
    <Input label="動画" placeholder="YouTube URL または動画ID" />
    <div className="flex items-center gap-4">
      <Button variant="primary">追加</Button>
      <Button variant="ghost">キャンセル</Button>
      <StatusBadge tone="success" dot pulse>LIVE</StatusBadge>
    </div>
  </div>
</div>
```
