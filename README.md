# @insession/design-system

InSession と loophub が共有するデザインシステム。**純粋 leaf UI プリミティブ + デザイントークン**を提供する。

アプリ固有のロジックには依存しない（i18n の `t`・ルーター・認証などは全て props で注入する）。依存は `react` / `react-dom` の peer だけ。

- npm: [`@insession/design-system`](https://www.npmjs.com/package/@insession/design-system)
- **カタログ（Storybook）: https://design-system.insession.space/**
- 消費側: `insession-space/insession-app`（InSession 本体・admin・lp・help）、`insession-space/loophub-app`（web・lp）

## セットアップ（消費側アプリ）

```bash
pnpm add @insession/design-system
```

**CSS を1枚読むだけ。Tailwind は要らない。**

```ts
import '@insession/design-system/styles.css';
```

```tsx
import { Button, Badge, Modal } from '@insession/design-system';
```

`styles.css` は publish 時にプリビルドされた配布 CSS で、**デザイントークン + 部品 CSS + このパッケージが使う Tailwind ユーティリティ**を全部含む（約 53KB / gzip 約 9KB）。消費側のビルド設定に依存しないので、Tailwind を使っていないプロダクトでも、v3 のプロダクトでも、そのまま使える。

> ⚠ **DOM に出るクラス名（`inline-flex` `bg-accent` `px-[22px]` …）は公開契約ではない。** CSS のフックにしないこと。将来セマンティックなクラス名（`.ds-button--accent` 等）へ移行する予定で、そのとき `import` する側は変えずに済む設計にしている。

### 3つの CSS 入口

| 入口 | 中身 | 使うとき |
| --- | --- | --- |
| `@insession/design-system/styles.css` | トークン + 部品 CSS + ユーティリティ（プリビルド） | **既定。** これ1枚で完結する |
| `@insession/design-system/theme.css` | デザイントークン（`@theme`）のみ | Tailwind を使う消費側が、**自分のマークアップ**にも DS トークン（`bg-accent` 等）を使いたいとき |
| `@insession/design-system/components.css` | 部品 CSS と `@keyframes` のみ | 後述の `@source` 方式を続ける消費側が、ユーティリティで表現できない部品 CSS だけを足すとき |

自分のマークアップでも DS トークンを使いたい Tailwind 消費側は、両方読むのが素直（`:root` への変数出力は重複するが無害）。

```css
@import "tailwindcss";
@import "@insession/design-system/theme.css";   /* 自分のマークアップで bg-accent 等を使うため */
```

```ts
import '@insession/design-system/styles.css';    /* DS 自身の描画のため */
```

### レイヤーと上書き

`styles.css` の中身は `@layer theme, base, components, utilities` に入っている。つまり:

- **消費側が `className` でユーティリティを足せば部品 CSS を上書きできる**（`<Modal className="w-[600px]">`）。
- **レイヤーに属さない消費側の CSS は、この CSS のすべてより強い。** 最終的な決定権は消費側にある。

**preflight（Tailwind のグローバルリセット）は配らない。** 消費側のページ全体の既定値を書き換えてしまうため。コンポーネントが実際に必要とする最小限（`box-sizing` とフォームコントロールのフォント継承）だけを `@layer base` に持っている（`base.css`）。

### 従来方式（`@source` で dist を走査する）から移行する

1.3.x までは「消費側の Tailwind v4 が `@source` でこのパッケージの `dist` を走査してユーティリティを生成する」契約だった。この方式は**まだ動く**が、新規採用は非推奨。

```css
/* 従来方式。動くが非推奨 */
@import "tailwindcss";
@import "@insession/design-system/theme.css";
@import "@insession/design-system/components.css";   /* ★ 1.4.0 以降はこれも必要 */
@source "../node_modules/@insession/design-system/dist";
```

非推奨にした理由:

- **Tailwind v4 を使っていないプロダクトが採用できない。**
- **`@source` の指定を間違えると、ビルドは緑のままスタイルだけが静かに欠ける。** クラス名は DOM に出るのに対応する CSS が無く、エラーもワーニングも出ない。しかも Vite のモジュールグラフ経由で一部は拾われるため「全崩れ」にならず気づきにくい（実測で CSS の約4割が欠けた状態でビルドが緑になった）。
- **pnpm workspace では `@source` をリポジトリルートの `node_modules` に向けても空振りする。** pnpm は依存を*それを宣言したパッケージ自身の* `node_modules` にリンクし、ルートには置かない。正しいパスは `apps/<app>/src/style.css` から見て `../node_modules/...`。

`styles.css` へ移行すると、この失敗モード自体が消える（ユーティリティ生成が publish 時に済んでいるため）。

### ⚠ `minimumReleaseAge` を設定している環境では除外指定が必要（将来の pnpm 更新時）

サプライチェーン対策で pnpm の `minimumReleaseAge`（publish 直後の版を install させない待機時間・**分単位**）を設定している場合、**publish したての DS が待機時間中 install できなくなる**。自前のパッケージなので除外して問題ない。

> 実測メモ: `~/.npmrc` に `minimum-release-age=7200`（= 5日）がある環境で 1.3.1 の publish 直後に
> `pnpm install` したが**ブロックされなかった**。pnpm 10.12.1 はこの設定を強制しないため（`pnpm config get`
> が値を返すのは単に設定を読み出しているだけで、機能の有無とは無関係）。**pnpm を更新すると効き始めて
> 詰まる**ので、先に除外を入れておくのが安全。

消費側リポジトリの `pnpm-workspace.yaml` に書いてコミットすると、開発者ごとのグローバル設定に依存せず揃う。

```yaml
# pnpm-workspace.yaml
minimumReleaseAgeExclude:
  - "@insession/design-system"
```

> 除外するのは**自分たちが publish する first-party パッケージだけ**にすること。サードパーティへの待機は攻撃対策として意味があるので外さない。

### テーマ（ライト / ダーク）

**ダークが既定。ライトは `<html data-theme="light">` のときだけ効く。**

```html
<html data-theme="light">  <!-- ライト -->
<html data-theme="dark">   <!-- ダーク -->
<html>                     <!-- ダーク（属性なしでも既定はダーク） -->
```

- **ダーク固定のプロダクトは何もしなくてよい。** ライトのオーバーレイは属性が付くまで不活性。
- **切り替えるプロダクトは html の `data-theme` を書き換えるだけ。** トークンを自分で持つ必要はない。
- 切り替え対象は**参照元の生値だけ**。ティント面（`--color-tint-*`）とセマンティック面（`--color-*-surface`）は `color-mix(…, var(--color-bg))` の合成なので `--color-bg` の変化に自動追従する。リンク色と `--color-accent` も `--color-mint` / `--color-mint-soft` の参照なので追従する。
- 要素単位で部分的に切り替えたい場合は、`:root[…]` ではなく `[data-theme="light"]` 版を自分側で足す（DS のセレクタは html 要素だけに効く）。

Storybook のツールバーに Theme トグルがあり、カタログ上でライト/ダークを見比べられる。

> 📌 1.4.x までは `theme.css` がダーク単一トーンで、ライトは**消費側が自前で持つ**契約だった。その結果、同じライト値が insession-app（`apps/web`）と loophub（`apps/web` / `apps/lp`）に重複していた。1.5.0 でここへ一本化した（移設前に3者の値を突き合わせ、**loophub の17トークンは insession-app の30トークンの部分集合で値も完全一致**であることを確認している）。

## Base UI ベースのプリミティブ

**振る舞いを持つプリミティブはすべて [Base UI](https://base-ui.com)（`@base-ui/react`）へ委譲している。** DS 側が持つのはトークンベースの見た目だけ。

| | 移行 | 得たもの |
| --- | --- | --- |
| `Popover` / `Menu` / `Modal` / `ConfirmModal` / `Tabs` | v2 | 衝突回避・フォーカストラップ・スクロールロック・矢印キーナビ・typeahead |
| `Checkbox` / `Radio` / `Toggle` / `Input` / `Textarea` | v3 | label 紐付け・`aria-invalid` / `aria-describedby`・roving tabIndex |
| `BottomSheet` / `Toast` | v3 | スナップ付きドラッグ・キュー管理・自動 dismiss・aria-live |
| `Stepper` / `Avatar` / `SearchField` / `Button` / `IconButton` / `RingTimer` | v3 | 矢印キーでの数値増減・画像フォールバック・`focusableWhenDisabled`・`role="progressbar"` |

`Badge` / `Chip` / `Lozenge` / `Spinner` / `EmptyNote` / `LogoMark` / `Icon` 系 / `Status` / `Link` / `Composer` は**振る舞いを持たない見た目部品**なので Base UI に載せていない（相当パートが無いか、載せても得るものが無い）。`StepFlow` は `<ol>`/`<li>` + `aria-current="step"` というネイティブのセマンティクスで表現している（`role="progressbar"` は中身が読み上げ対象から外れるため不適切）。`SplitModal` は `Modal` / `BottomSheet` 経由で間接的に載っている。

オーバーレイ系はパートを組み合わせる compound API。

```tsx
<Popover.Root open={open} onOpenChange={(o) => !o && close()}>
  <Popover.Trigger>開く</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner side="bottom" align="end">
      <Popover.Popup>{children}</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

自前で持っていた配置計算・外側クリック・Esc・フォーカス管理をやめたことで、**衝突回避（フリップ/シフト）・フォーカストラップ・スクロールロック・矢印キーナビ・typeahead** が付いた。**見た目は移行前と同じ**（トークンのユーティリティは DS 側に残っている）。

**v1 からの移行手順は `CHANGELOG.md` の 2.0.0 の項に props 単位の対応表がある。** 以下は移行時に踏みやすい点。

### パネルの padding / 内部スクロールを切る

`Popover.Popup` と `Menu.Popup` は既定で内側 padding（`p-3`）と最大高さ + 内部スクロール（`max-h-80 overflow-y-auto`）を持つ。ヘッダー固定 + リストだけスクロールのように独自の高さを組みたいときは **props で切る**（v1 の `panelPadding` / `panelScroll` と同じ既定・同じ意味）。

```tsx
<Popover.Popup padding={false} scroll={false} className="flex max-h-[220px] flex-col overflow-hidden">
  <div className="shrink-0 border-b border-solid border-border px-4 py-3">固定ヘッダー</div>
  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{items}</div>
</Popover.Popup>
```

> ⚠ **`className` で `p-0` / `overflow-visible` を渡して打ち消すことはできない**（2.0.0 ではそう案内していたが誤りだった。#21）。**クラス属性の並び順は CSS の勝敗に無関係**で、同一プロパティのユーティリティは配布 CSS の**出力順**で決まる。実測では `.p-3` が `.p-0` より後ろに出力されるため打ち消せなかった。`className` での上書きが成立するのは、`data-*` バリアントのようにバリアント付きが base より後に出力されるケースだけ。

### ⚠ Base UI の Menu パートは `Popover.Popup` の中では使えない

`Menu.Item` / `RadioItem` / `Separator` などは `Menu.Root` の React context を要求するため、`Popover.Popup` の中に置くと **`MenuRootContext is missing` で throw する**（型検査もビルドも通り、Popover を開いた瞬間に初めて落ちるので気づきにくい）。用途で使い分ける。

| やりたいこと | 使うもの |
| --- | --- |
| 独立して開閉するメニュー（矢印キーナビ・typeahead が効く） | `Menu.Root` / `Trigger` / `Portal` / `Positioner` / `Popup` / `Item` … |
| Popover のパネルにヘッダとメニュー行を混在させる（通知センター等） | `Menu.PlainList` / `Menu.PlainItem`（振る舞いを持たない見た目のみ。v1 の `Menu` / `MenuItem` と同じ props） |

### ⚠ Modal を別ドキュメント（PiP）へ出すなら `container` を明示する

v1 は `ownerDocument` から描画先を自動検出していたが、Base UI の Portal は明示指定が必要。Document Picture-in-Picture へモーダルを出す場合は `<Modal.Portal container={pipDocument.body}>` を渡す。

### フォーム系プリミティブ（v3 以降）

`Checkbox` / `Radio` / `Toggle` / `Input` / `Textarea` も Base UI へ委譲した。**`Toggle` / `Input` / `Textarea` は props シグネチャが変わっていない。** 変わったのは次の2つ。

```tsx
{/* Checkbox: onChange(ChangeEvent) → onCheckedChange(checked) */}
<Checkbox checked={v} onCheckedChange={setV} label="通知を受け取る" />

{/* Radio: 単体 → Radio.Group + Radio.Item（矢印キー移動 / roving tabIndex が付く） */}
<Radio.Group value={val} onValueChange={setVal} aria-label="公開範囲">
  <Radio.Item value="all" label="全員に公開" />
  <Radio.Item value="private" label="非公開" />
</Radio.Group>
```

`Input` / `Textarea` に `error` を渡すと `aria-invalid` と `aria-describedby` が張られ、支援技術からエラーが入力欄に紐付く（v2 までは素の `<span>` で紐付いていなかった）。

> ⚠ **Base UI の Checkbox / Radio / Switch に `disabled:` ユーティリティは効かない。** これらが描画するのは `<span>`（`nativeButton` の既定が false）で、CSS の `:disabled` 疑似クラスはフォーム要素にしか適用されないため。**`data-disabled:` を使うこと。** 型検査もビルドも通ってしまい、disabled が視覚的に無効化されないまま出荷される（この移行でも一度踏んだ）。`Menu.Item` も同じ理由で `data-disabled:` を使っている。

> ⚠ **`<button>` を描画する Base UI Button でも `disabled:` は避ける。** `focusableWhenDisabled` を渡すと `disabled` 属性を出さず **`aria-disabled` に切り替わる**ため（disabled なボタンがキーボードナビから消える問題への対処）、`:disabled` / `:enabled` がマッチしなくなる。`Button` / `IconButton` / `Stepper` は `data-disabled:` / `hover:not-data-disabled:` に統一してある。

### ⚠ `FIELD_BOX_BASE` は縦 padding を持たない

`Input` / `Textarea` / `SearchField` が共有する field の見た目定数（`FIELD_BOX_BASE`）は、**横 padding だけを持ち縦は持たない**。Input / Textarea は `py-3`、SearchField は `py-2.5` と一段浅く、共通側に `py-3` を置くと呼び出し側の `py-2.5` では**打ち消せない**（同一プロパティのユーティリティは配布 CSS の出力順で決まる。#21 と同じ構図）。この定数を使うときは**縦 padding を必ず自分で指定する**こと。

### Toast は Provider + キューになった（v3）

**`<Toast title=… />` を自分で置く使い方は廃止した。** Base UI の Toast は「Provider が持つキューに add して Viewport が描画する」命令的 API で、見た目部品として単体では置けない。

```tsx
// アプリのルートに1度だけ
<Toast.Provider>
  <App />
  <Toast.Viewport />
</Toast.Provider>

// 呼び出し側
const toast = Toast.useToast();
toast.add({ title: '保存しました', description: '…', data: { tone: 'success' } });
```

`tone` / `variant` / `icon` は `data` に載せる。これで**キュー管理・自動 dismiss・スワイプで閉じる・重ね表示・aria-live リージョンへの通知**が付いた。

> ⚠ DS は本来「アプリ依存を持たない純粋 leaf UI」だが、**Toast だけは Provider を持つ**。キュー管理を伴う通知はアプリ全体で1つの出口を共有する必要があり、部品単体では成立しないため。方針からの意図的な逸脱。

### ⚠ Drawer / BottomSheet は位置を CSS 変数で受け取る

Base UI の Drawer は**位置を自分で当てず CSS 変数として出すだけ**。`components.css` の `.bottom-sheet` が `transform: translateY(calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px)))` でそれを反映している。同様のことを自前でやる場合、この transform を書かないと**シートが常にフルハイトで表示される**（型検査もビルドも通る）。

## レイアウト / Surface / Page プリミティブ

**並び・面・画面骨格を担う3グループのプリミティブ。** いずれも見た目のトークン（色/影/角丸）と並びのロジック（flex/grid）を分けて持ち、Page 系は前の2グループを組み合わせて作られている（DOM を深くしすぎない範囲で、独自の flex/面ロジックは再実装しない）。

| グループ | コンポーネント | 用途 |
| --- | --- | --- |
| レイアウト | `Stack` / `VStack` / `HStack` | flex コンテナの基底 / 縦積み・横並びの固定ラッパー |
| | `Grid` | `columns` / `gap` をブレークポイント別に指定できるレスポンシブグリッド |
| | `Spacer` | flex 中で余白を食う不可視の伸縮要素（左右分離など） |
| | `Divider` | 水平/垂直の区切り線 |
| | `Center` | 子要素を縦横中央に置く器 |
| | `Container` | 最大幅 + 中央寄せ + 左右パディング |
| Surface | `Surface` | 面の基底（`elevation` 1軸で背景/境界/影が決まる） |
| | `Paper` | elevation=1 固定。境界のみの控えめな面 |
| | `Card` | elevation 既定2。padding/radius がカードらしい既定値 |
| | `Panel` | elevation=1 固定。サイドバー/セクション囲み用に radius だけ変える |
| Page | `AppBar` | 画面上端のバー。left/center/right の3スロット、center が伸びる |
| | `Toolbar` | バー内外で使える水平ツール列（`role="toolbar"`） |
| | `PageHeader` | 見出しブロック（title 必須、description/actions は任意） |
| | `PageLayout` | 画面骨格。appBar/sidebar/footer のスロット + メイン。`scroll` でスクロールの主体を選ぶ |
| | `Footer` | 画面下端の領域。上端の境界 + `Gap` 語彙の padding |

> ⚠ **`PageLayout` の `scroll` は「どこがスクロールするか」を決める。既定は `'page'`。**
> - `scroll="page"` — ページ全体が内容ぶん伸び、**ブラウザ側**がスクロールする（LP / ドキュメント型）。外枠は `min-h-dvh` で「最低でも画面いっぱい」を保証するだけで、メインに高さ制約を付けない。AppBar を画面に残したいときは `AppBar` 側の `sticky`（既定 true）が担う。
> - `scroll="body"` — 外枠を `h-dvh` で画面高さに固定し、**本文だけ**がスクロールする（アプリシェル型）。AppBar / Footer は動かない。
>
> この2つを取り違えると「スクロールしない」「AppBar の sticky が効かない」という形で崩れる。`scroll="body"` はメイン側に `min-h-0` が必須で（これが無いと flex item が子の内容ぶん伸びて `h-dvh` を突き破り、`overflow-y-auto` に有効な高さ制約が生まれない）、逆に `scroll="page"` でメインに `overflow-y-auto` を付けると `position: sticky` の追従先がメインになって AppBar が固定されなくなる。`PageLayout` はこの組み合わせを prop 1つに閉じ込めているので、**`className` で高さや overflow を上書きしないこと**。

### elevation スケールの対応表

`Surface` の `elevation` は 0〜4 の1軸で「背景 + 境界 + 影」の組を決める。`theme.css` に追加した `--shadow-elevation-0`〜`4` は**既存の `--shadow-soft` / `-popover` / `-overlay` を参照するだけの別名トークン**で、新しい影の実値は増やしていない。

| elevation | 背景 | 境界 | 影 | 既存の対応 |
| --- | --- | --- | --- | --- |
| 0 | なし | なし | なし | 素の器 |
| 1 | `bg-bg-elevated` | `border-border` | なし | Paper / Panel |
| 2 | `bg-surface` | `border-border` | `shadow-elevation-2`（= 既存 `shadow-soft`） | Card |
| 3 | `bg-surface` | `border-border-strong` | `shadow-elevation-3`（= 既存 `shadow-popover`） | Popover / Menu |
| 4 | `bg-surface` | `border-border` | `shadow-elevation-4`（= 既存 `shadow-overlay`） | Modal |

- **既存の `shadow-soft` / `shadow-popover` / `shadow-overlay` は廃止していない。** elevation スケールはその上に載る意味論の別名で、既存コンポーネントの見た目は一切変わっていない。
- **ダーク（既定）では背景ランプの明度差が高さの主表現、ライトでは `--color-shadow` を青みグレーにした薄い影が主表現**になる。参照先の `--elev-*` が既にテーマ別の値を持っているため自動で切り替わり、**コンポーネント側は `elevation` prop の1軸しか見ていない**（テーマ分岐は持たない）。

### 移行ガイド（Tailwind 直書き → プリミティブ）

消費側（insession-app / loophub-app）で繰り返し書かれている Tailwind 直書きパターンは、以下のプリミティブに置き換えられる。

| これまで | これから |
| --- | --- |
| `<div className="flex flex-col gap-3">` | `<VStack gap="md">` |
| `<div className="flex items-center gap-2">` | `<HStack gap="sm" align="center">` |
| `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">` | `<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="md">` |
| `<div className="rounded-card border border-border bg-surface p-4 shadow-soft">` | `<Card padding="lg">` |
| `<div className="mx-auto w-full max-w-[1024px] px-4">` | `<Container size="lg">` |

⚠ **`className` は逃げ道として残っているが、props を正とする。** 生の Tailwind ユーティリティに直接戻すと、DS 側でトークン（gap の刻み・elevation の組・コンテナ幅など）を変更しても消費側へ伝播しなくなる。

## 開発

```bash
pnpm install
pnpm storybook      # カタログ（http://localhost:6006）
pnpm build          # dist を生成（build:js = tsup で js + d.ts / build:css = 配布 CSS）
pnpm typecheck
pnpm check          # Biome lint + format
pnpm check:styles   # 配布 CSS がコンポーネントの参照を満たしているか（要 pnpm build）
```

### `pnpm check:styles` が守っているもの

このパッケージは長らく「**publish された中身だけでは完成しない**」状態だった。コンポーネントが `className="modal-backdrop"` や `animate-[card-in_…]` を参照しているのに、その定義はパッケージ内に無く、消費側 insession-app の legacy CSS にしか存在しなかった。クラス名は DOM に出るのに CSS が無いので、**型検査もビルドも lint も緑のまま、insession-app 以外では見た目だけが静かに崩れる**（Modal 既定経路 / BottomSheet / GoogleIcon / 各種アニメーションが該当した）。

人間のレビューで気づける類の欠損ではないので、`scripts/check-styles.mjs` が CI で機械的に検査する:

1. ソースの `animate-[NAME_…]` に対し `@keyframes NAME` が配布 CSS にあるか
2. `className` に書かれた素のクラス名が、配布 CSS にセレクタとして存在するか
3. トークンが `:root` に出ているか / preflight を巻き込んでいないか / ユーティリティ生成が生きているか

**Storybook も同じ理由で「消費側と同じ経路」で描く。** `.storybook/preview.css` は `dist/styles.css` だけからコンポーネントのスタイルを取り、stories 自身のページ組みの分だけを `source(none)` + `@source "../stories"` で追加生成する。ここでコンポーネント本体を走査対象に戻すと、配布 CSS の欠損をカタログが埋めてしまい、上記の見逃しが再発する。

### 消費側と同時に開発する（ローカル参照）

publish を挟まずに変更を消費側アプリへ反映させるには、消費側リポジトリで一時的にローカルを指す。

```bash
# design-system 側
pnpm build

# 消費側（insession-app / loophub）で package.json に追記して pnpm install
#   "pnpm": { "overrides": { "@insession/design-system": "file:../design-system" } }
```

作業が終わったら `overrides` を外し、publish 済みバージョンへ戻すこと。**`overrides` を付けたまま lockfile をコミットしない。**

### ⚠ minify を有効にしないこと

`tsup.config.ts` は `minify: false`、`build:css` も minify しない。従来方式（`@source` で `dist` を走査してユーティリティを生成する）の消費側がまだ居るため、**クラス名の文字列リテラルが壊れると上記の「スタイルが静かに消える」障害を引き起こす**。配布 CSS は gzip で約 9KB に落ちるので、minify の実利はほとんど無い。

## カタログの公開（GitHub Pages + カスタムドメイン）

カタログは `main` への push で `.github/workflows/storybook.yml` が `pnpm build-storybook` → GitHub Pages（Actions ビルド方式）へデプロイし、**https://design-system.insession.space/** で公開される。

**このリポジトリでホストしている理由**: カタログは元々 insession-app（モノレポ）で公開していたが、org 移管で private リポジトリの GitHub Pages が使えなくなった（Free プランは private Pages 非対応で deploy が 422 になる）。design-system は public なので Pages が使え、リポジトリ分割でストーリーもここへ移設済みなので、本来ここが正しい置き場所。

### ドメインの構成（3箇所が揃って初めて動く）

| 場所 | 設定 |
| --- | --- |
| `.storybook/public/CNAME` | `design-system.insession.space`。`staticDirs: ['./public']` で `storybook-static/CNAME` として成果物に入る |
| GitHub Pages 設定 | Settings → Pages → Custom domain（＝`gh api -X PUT repos/insession-space/design-system/pages -f cname=design-system.insession.space`）+ Enforce HTTPS |
| Cloudflare DNS（`insession.space` ゾーン） | `design-system` を **CNAME → `insession-space.github.io`**、**Proxy status = DNS only（プロキシ無効）** |

> ⚠ **Cloudflare のプロキシ（オレンジの雲）は無効にする。** GitHub は Let's Encrypt 証明書の発行にドメインが GitHub Pages のサーバへ直接解決できることを要求するため、プロキシ有効だと証明書が発行されず Enforce HTTPS が有効化できない。

> ⚠ **設定の順序**: GitHub は custom domain を設定する時点でドメインの解決を検証する。**DNS レコードを先に入れる**こと（先に Pages 側を設定すると `Domain does not resolve to the GitHub Pages server` で 422 になる）。証明書の発行には数分〜十数分かかり、それまで Enforce HTTPS は有効化できない。

Actions ビルド方式では実際に効いているのは GitHub Pages 側の設定で、成果物の `CNAME` は参照されない。それでもリポジトリに置いてあるのは、**どのドメインで出しているかをコードに記録し、Pages 設定が失われたときの復元源にするため**。

旧 URL（`https://insession-space.github.io/design-system/`）は GitHub がカスタムドメインへリダイレクトするので、既存のリンクは壊れない。消費側リポジトリ（insession-app / loophub-app）のドキュメントに残る旧 URL も、必要になった時点でそれぞれのリポジトリで差し替える（リポジトリを跨いだ変更は別 PR）。

## リリース

Changesets でバージョンを採番し、`main` への push で npm へ publish する。

```bash
pnpm changeset      # 変更の intent を積む
```

`main` に push されると Version PR が作られ、それをマージすると `release.yml` が npm publish する。

**publish は npm の Trusted Publishing（OIDC）で行う方針。トークンは使わない。** `release.yml` は `id-token: write` を持ち、`NPM_TOKEN` を**意図的に env へ渡していない**（changesets/action は env に `NPM_TOKEN` があればトークン publish を優先するため、渡すと OIDC が使われなくなる）。

### ⚠ OIDC publish が成立するには3つの条件が揃う必要がある

1.4.0 の publish 試行で**3つとも欠けていることが判明した**。

**① runner の npm が 11.5.1 以降であること（最初にここで詰まった）**

**Trusted Publishing の OIDC 交換を実装しているのは npm CLI 本体で、11.5.1 以降が必要。** Node の同梱 npm では届かない。

| | 同梱 npm |
| --- | --- |
| Node 22.23.1 | 10.9.8 |
| Node 24.0.0 | 11.3.0 |

どちらも 11.5.1 未満なので、**Node のバージョン選択では解決しない**。`release.yml` は `npm install -g npm@11` を明示的に実行している。これを外すと npm は OIDC 交換を行わず、認証情報なしで publish しようとして下記の 404 になる。

publish は changesets が内部で `npm publish` を呼ぶので、pnpm ではなく **npm CLI 自体の版**が効く。

**② npm 側: Trusted Publisher の登録**

npm の package settings で、このリポジトリを Trusted Publisher として登録する。未登録だと OIDC トークンが認証情報に交換されないため、**既存パッケージへの `PUT` が `E404 Not Found` で拒否される**（npm は権限不足を 403 ではなく 404 で返す。パッケージの存在を隠すため）。

> 📌 ① と ② はどちらが欠けても**まったく同じ 404** になる。エラー文言では切り分けられないので、まず runner の npm 版を確認すること（`npm -v` を1行足すだけでよい）。

> https://www.npmjs.com/package/@insession/design-system/access → Trusted Publisher
>
> | 項目 | 値 |
> | --- | --- |
> | Publisher | GitHub Actions |
> | Organization or user | `insession-space` |
> | Repository | `design-system` |
> | Workflow filename | `release.yml` |
> | Environment | （空欄。`release.yml` は environment を使わない） |

**③ GitHub org 側: Actions による PR 作成の許可（未設定 → Version PR が作られない）**

これは publish ではなく**採番**の側の条件。① ② が揃っていなくても、ここが欠けると Version PR が作られないので採番が進まない。

`release.yml` はワークフロー側で `pull-requests: write` を宣言しているが、それとは別に **org のポリシー**が Actions による PR 作成を禁止していると弾かれる。

```
HttpError: GitHub Actions is not permitted to create or approve pull requests.
```

> https://github.com/organizations/insession-space/settings/actions → Workflow permissions →
> **「Allow GitHub Actions to create and approve pull requests」** をON

リポジトリ側（`Settings → Actions → General`）の同名項目は、org が許可するまで変更できない（API は `409 Conflict` を返す）。

> 📌 **1.3.1 までの publish は OIDC ではなく手動だった。** レジストリ上の 1.3.1 は `_npmUser` が個人アカウントで **provenance attestation を持たない**（`dist.attestations: null`）。Trusted Publishing 経由なら必ず provenance が付くので、OIDC は使われていない。`release.yml` が導入されてから実際に走ったのは 1.4.0 が初回で、そこで上記2点の未設定が露見した。

`package.json` の `publishConfig.registry` で公開レジストリを明示している。**これを外さないこと** — 開発機の `~/.npmrc` が社内プロキシを `registry` に設定していると、publish がプロキシ宛になって公開レジストリに出ない。

### ローカルから publish する場合

npm はアカウントの 2FA か「bypass 2FA 付き granular access token」を要求するので、CI（OIDC）経由が基本。どうしても手で出す場合:

```bash
npm whoami --registry https://registry.npmjs.org   # 公開レジストリでのログイン確認
pnpm build && npm publish --otp=<code>             # 2FA 有効時は OTP が必要
```

## 構成

```
src/                  出荷物のソース（ここだけが dist に入る）
  index.ts            公開窓口（外部はここ経由で import する）
  components/         プリミティブ（button / input / modal / popover / …）
  icons/              アイコン（icon.tsx の PATHS が単一ソース）
  breakpoints.ts      レイアウト用のメディアクエリ定数
  styles/
    theme.css         デザイントークンの契約（@theme）
    base.css          コンポーネントが前提にする最小リセット（preflight は配らない）
    components.css    ユーティリティで表現していない部品 CSS と @keyframes
    styles.src.css    配布 CSS のビルド入力（publish しない）
stories/              Storybook のカタログ
.storybook/           Storybook 設定（preview.css が消費側と同じ経路の再現）
.storybook/public/    成果物へそのままコピーされる静的ファイル（CNAME = 公開ドメイン）
scripts/              check-styles.mjs（配布 CSS の欠損検査）
.design-sync/         DesignSync（claude.ai/design 連携）の設定
tsup.config.ts        配布物（js + d.ts）のビルド
```

配布されるのは `dist/`（`index.js` / `index.d.ts` / `styles.css`）と `src/styles/` の `theme.css` / `base.css` / `components.css`、および `LICENSE`。

> 📌 CSS の import パス（`@insession/design-system/theme.css` 等）は `exports` のキーであってリポジトリ内の配置とは独立している。ソースが `src/styles/` へ移っても**消費側の書き方は変わらない**。

⚠ `src/styles/styles.src.css` の `@source "../components/*.tsx"` / `@source "../icons/*.tsx"` は配布 CSS のユーティリティ生成の走査対象。ここを壊すと**ビルドは緑のまま CSS だけが静かに欠ける**（`pnpm check:styles` が検出する）。ソースを移動するときは必ず一緒に直すこと。

## ライセンス

[MIT](./LICENSE) © INSESSION Space

1.4.0 までは `package.json` の `license` が `UNLICENSED` のままだった。public リポジトリで npm にも公開しているのに、この表記では **InSession / loophub 以外は法的に使えない**（`UNLICENSED` は「許諾しない」の明示）。他プロダクトへ配る前提と矛盾していたので MIT に改めた。

## 履歴

このパッケージは `insession-space/insession-app`（モノレポ）の `foundation/ui`（さらに前は `packages/ui`）として開発されていた `@in-session/ui` を、リポジトリ分割時に独立させて改名したもの。改名前の変更履歴は `CHANGELOG.md` にそのまま残している。
