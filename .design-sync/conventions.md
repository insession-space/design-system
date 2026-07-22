# InSession UI — 使い方の規約（design agent 向け）

## セットアップ / ラップ

- Provider は**不要**。全コンポーネントは純粋 leaf（context 不要、文言・ハンドラは props 注入）。
- **ダークテーマが既定で唯一のテーマ**。`styles.css` の `body` ルールが暗背景（`var(--bg)`）と文字色（`var(--text)`）・フォント（`var(--font-body)` = JetBrains Mono）を当てる。ページ側で `body` の背景を白などに上書きしないこと — このDSのコンポーネントは暗背景前提の配色で、白地では見えなくなる。
- バンドルの `DsSurface` export はプレビュー専用シム。**実デザインでは使わない**（背景は body から当たる）。
- コンポーネントは `window.InSessionUi.*`（例: `InSessionUi.Button`）。

## スタイリングの流儀

このDSは **Tailwind v4 + CSSカスタムプロパティのトークン**。ただし同梱 CSS は**アプリで実際に使われたユーティリティのみを含むコンパイル済みCSS**（実行時JITなし）。したがって:

1. **コントロールはまずライブラリコンポーネントで**（Button / Input / Tabs / Modal…）。見た目は variant / tone / size props が担う（例: `<Button variant="accent">`, `<Lozenge tone="success">`, `<Toast tone="error">`）。
2. **レイアウトの糊**は基本ユーティリティ（存在確認済み: `flex` `grid` `items-center` `gap-4` `p-4` `text-sm` `font-bold` `bg-surface` `text-text-dim` `rounded-card` `border-border` など）を使ってよいが、**任意の Tailwind クラスが存在する保証はない**。珍しいクラスは効かない可能性がある → その場合は inline style + トークン変数で書く: `style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)' }}`。
3. **生の hex / マジックナンバーは書かない** — 必ずトークンを参照する。

主要トークン（すべて `var(--…)` で参照可能・`_ds_bundle.css` の `:root` に定義）:

| 系統 | トークン |
|---|---|
| 背景/面 | `--color-bg` `--color-bg-elevated` `--color-surface` `--color-fill` `--color-scrim` |
| 文字 | `--color-text`（`--text`）, `--color-text-dim` 系, `--color-on-accent` `--color-on-fill` |
| ブランド | `--color-mint` `--color-cyan` `--color-accent`（コーラル） |
| 意味色 | `--color-success(-surface/-border)` `--color-danger(-surface/-border)` `--color-info(-surface/-border)` `--color-link` |
| 枠/フォーカス | `--color-border` `--color-border-strong` `--color-focus-ring` |
| 角丸 | `--radius-sm/-md/-lg` `--radius-card` `--radius-chip` `--radius-pill` `--radius-panel` `--radius-sheet` |
| フォント | `--font-body` `--font-display` `--font-mono`（全て JetBrains Mono ベース） |
| モーション | `--ease-spring` `--ease-out` `--ease-in-out` |

トンマナ: **控えめ・洗練**。tinted surface + 細ボーダー + subtle な状態変化が基本。派手なグラデーション/グローは使わない。

## 真実の在り処

- トークンとクラスの全定義: `styles.css` → `_ds_bundle.css`（@import 済み。スタイリング前にここを読む）。
- 各コンポーネントの API と用例: `components/components/<Name>/<Name>.d.ts` と `<Name>.prompt.md`。

## 典型的な組み方

```tsx
const { Button, Input, Tabs, StatusBadge } = window.InSessionUi;

<div className="flex flex-col gap-4 p-4"
     style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
  <Tabs tabs={[{ key: 'watch', label: 'Watch Party' }, { key: 'chat', label: 'チャット' }]}
        value="watch" onChange={() => {}} />
  <Input label="動画" placeholder="YouTube URL または動画ID" />
  <div className="flex items-center gap-4">
    <Button variant="primary">追加</Button>
    <Button variant="ghost">キャンセル</Button>
    <StatusBadge tone="success" dot pulse>LIVE</StatusBadge>
  </div>
</div>
```
