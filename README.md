# @insession/design-system

InSession と loophub が共有するデザインシステム。**純粋 leaf UI プリミティブ + デザイントークン**を提供する。

アプリ固有のロジックには依存しない（i18n の `t`・ルーター・認証などは全て props で注入する）。依存は `react` / `react-dom` の peer だけ。

- npm: [`@insession/design-system`](https://www.npmjs.com/package/@insession/design-system)
- **カタログ（Storybook）: https://design-system.insession.space/**
- 消費側: `insession-space/insession-app`（InSession 本体・admin・lp・help）、`insession-space/loophub-app`（web・lp）

## カタログのカテゴリ体系

Storybook のサイドバーは役割ベースで並んでいる: `Foundations` / `Layout` / `Surfaces` /
`Actions` / `Inputs` / `Data Display` / `Feedback` / `Overlays` / `Navigation` / `Page` / `Patterns`。
各カテゴリに何を置くか（`Layout` と `Surfaces` の違いなど）の判断基準は、カタログの
**Overview / カテゴリの分け方** ページ参照。

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

### タイポグラフィ

**セマンティック階層が既定。** サイズだけでなく weight / line-height / letter-spacing を役割ごとに焼き込んであるので、当てるだけで DS の見た目になり `font-bold` 等の併記が要らない。

| クラス | px / line-height / weight | 用途 |
| --- | --- | --- |
| `text-display` | 44 / 1.0 / 800 / -0.02em | LP のヒーロー。最大段 |
| `text-h1` | 32 / 1.05 / 800 / -0.015em | ページ見出し |
| `text-h2` | 22 / 1.15 / 700 | セクション見出し |
| `text-body` | 16 / 1.5 / 500 | 本文 |
| `text-small` | 14 / 1.45 / 500 | 補足の文章 |
| `text-label` | 11 / 1.0 / 600 / 0.14em | caps ラベル（`uppercase` と併用） |

**補助スケールはサイズだけを与える下位ユーティリティ。** weight を自分で決めたい UI の細部（バッジ・ボタン・入力・メタ情報）で使う。段は 4 つだけ。

| クラス | px / line-height | 用途 |
| --- | --- | --- |
| `text-lg` | 16 / 1.4 | モーダルのタイトル |
| `text-base` | 14 / 1.45 | ボタン・入力・設定行のラベル |
| `text-sm` | 12 / 1.4 | 補助テキスト・ヘルプ・カウンタ |
| `text-xs` | 11 / 1.35 | バッジ・タイムスタンプ・最小のメタ情報 |

- **サイズが重なる段があるのは意図的。** `text-base`(14px) と `text-small`(14px)、`text-lg`(16px) と `text-body`(16px) の違いは **weight / line-height を持つかどうか**。文章はセマンティック、weight を自分で決めたい UI 細部は補助スケール。
- **中間の値が欲しくなったら、それは段を足すサインではない。** 補助スケールで表現できない役割が隠れているサインなので、セマンティック階層側で考える。
- **`line-height` に `normal` を使わない。** 実行環境のフォントが行高を決めてしまい、同じ `font-size` でも行送りがブレる。全段に実数を焼き込んである。
- **フォントは `font-body` だけを使う。** `--font-display` / `--font-body` / `--font-mono` は3つとも JetBrains Mono で同値なので、使い分けても見た目は変わらず誤解を生むだけ。トークン定義は消費側の互換のため別名として残している（唯一の例外は `LogoMark` のワードマークで、Archivo をロゴ専用に差し替えるときの足場）。

> 📌 4.5.x までは生スケール（`text-2xs`〜`text-6xl` の13段）とセマンティック階層が並存し、値も衝突していた（`text-base`=`text-small`=14px）。ほぼ1px刻みで「13px と 14px のどちらが正か」を決められず、`text-[12.5px]` のような任意値が積み上がった結果、画面や機能ごとに文字サイズが少しずつ違う状態になっていた。#117 でセマンティック1本へ統一し、逸脱は `pnpm check:typography` が CI で止める。

## Base UI ベースのプリミティブ

**振る舞いを持つプリミティブはすべて [Base UI](https://base-ui.com)（`@base-ui/react`）へ委譲している。** DS 側が持つのはトークンベースの見た目だけ。

| | 移行 | 得たもの |
| --- | --- | --- |
| `Popover` / `Menu` / `Modal` / `ConfirmModal` / `Tabs` | v2 | 衝突回避・フォーカストラップ・スクロールロック・矢印キーナビ・typeahead |
| `Checkbox` / `Radio` / `Toggle` / `Input` / `Textarea` | v3 | label 紐付け・`aria-invalid` / `aria-describedby`・roving tabIndex |
| `BottomSheet` / `Toast` | v3 | スナップ付きドラッグ・キュー管理・自動 dismiss・aria-live |
| `Stepper` / `Avatar` / `SearchField` / `Button` / `IconButton` / `RingTimer` | v3 | 矢印キーでの数値増減・画像フォールバック・`focusableWhenDisabled`・`role="progressbar"` |
| `Slider` / `SegmentedControl` / `ToggleGroup`（`ToolButton`） / `ColorSwatchGroup` | v3.3 | 矢印 / Home / End / PageUp-Down・タッチとポインタの正規化・min/max/step の丸め・roving tabIndex・`aria-pressed` / `aria-checked` の管理 |

### `SegmentedControl` はなぜ `ToggleGroup` ではなく `RadioGroup` に載っているか

セグメンテッドコントロールは**常にどれか1つが選択されている**（未選択状態が無い）。`ToggleGroup`（`aria-pressed`）は「押されていない状態」が正当なので、全部 off の状態を型でも a11y でも許してしまう。`RadioGroup` なら `value` が常に1つに定まり、読み上げも「n個中n番目」になる。

用途で選ぶ:

| 使うもの | いつ |
| --- | --- |
| `SegmentedControl` | 言語 / テーマ / 種別など、**1つが必ず選ばれている**切り替え |
| `ToggleGroup` + `ToolButton` | ツールバーの道具選択。`multiple` で複数同時 on にもできる（太字 + 斜体など） |
| `Tabs` | **表示するパネルを切り替える**とき（`SegmentedControl` はパネルを持たない値の選択） |

`Badge` / `Chip` / `Lozenge` / `Spinner` / `EmptyNote` / `LogoMark` / `BrandImage` / `Icon` 系 / `Status` / `Link` / `Composer` / `UserLabel` / `SettingRow` / `UploadTile` / `ColorInput` は**振る舞いを持たない見た目部品**なので Base UI に載せていない（相当パートが無いか、載せても得るものが無い）。`UserLabel` は `href` / `onClick` を受けて操作可能になるが、素の `<a href>` / `<button onClick>` で足りる（開閉も選択状態もキーボードナビゲーションも持たない）。`UploadTile` / `ColorInput` はネイティブの `<input type="file">` / `<input type="color">` が機能を持っているので、DS が足すのは見た目とドラッグ&ドロップの状態管理だけ。`StepFlow` は `<ol>`/`<li>` + `aria-current="step"` というネイティブのセマンティクスで表現している（`role="progressbar"` は中身が読み上げ対象から外れるため不適切）。`SplitModal` は `Modal` / `BottomSheet` 経由で間接的に載っている。

### 設定行は `SettingRow`（末尾に対話要素を置ける行）

「ラベル + 説明 + 末尾の `Toggle` / `SegmentedControl` / `Button`」からなる**設定行**は `SettingRow` を使う。

```tsx
<SettingRow
  label="効果音"
  description="チャットの受信やリアクションで音を鳴らす"
  trailing={<Toggle checked={sound} onChange={toggle} label="効果音" />}
/>
```

- **既定は非対話**（`<div>`）。`href` → `<a>` / `onClick` → `<button>`（`UserLabel` と同じ流儀で、真偽値 prop は持たない）
- **対話的にしても `trailing` は対話要素の外（兄弟）に描く。** `<button>` の中に `<button>` / `<input>` が入る不正な DOM が構造的に起きないので、行を押す操作と末尾のコントロールの操作が両立する（廃止した `ListRow` は `<button>` 固定でこれができなかった）
- 説明文は既定で折り返す。1 行省略や 2〜3 行クランプは `descriptionLines` で選ぶ
- 面（背景・境界）は持たないので、`Paper` / `Card` の中に `Divider` で区切って並べる

### ⚠ タップ領域は `IconButton` の `touchSize` で確保する

`IconButton` の `size` は**ユーティリティ + CSS 変数**で当てている（インライン style ではない）。タッチ端末で押される操作系は `touchSize` に **44**（Apple HIG のタップターゲット下限）を渡す。

```tsx
<IconButton label="リアクション" icon={…} size={30} touchSize={44} />
```

`touchSize` は `@media (pointer: coarse)` のときの**最小**の一辺で、省略時はタッチでも `size` のまま（既存呼び出しの見た目を変えないための既定）。`className="max-md:size-11"` のようなバリアント付きユーティリティでも広げられる。

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

### ⚠ BASE と variant は同じプロパティのユーティリティを持たない（Button）

`Button` の `BASE` は **`border-color` を持たない**。BASE の `border-transparent` と `secondary` の `border-text` はどちらも同じ utilities レイヤーの `border-color` ユーティリティで詳細度が等しく、**勝敗が配布 CSS の出力順で決まって BASE 側が勝っていた**（実測で `secondary` の `border-top-color` が `rgba(0, 0, 0, 0)` ＝ 仕様の 2px アウトラインが描かれず、消費側に `border-text!` という `!important` の応急処置を書かせていた。#58）。`Toggle` / `Radio` が #17 / #21 で採った「状態別クラスは**排他的に**1つだけ出す」方針と同じで、`border-color` は **variant 側だけ**が持つ。

**`ButtonVariant` を足すときは、`background-color` / `color` / `border-color` をそれぞれちょうど1つずつ書くこと**（`border-*` を書き忘れると枠色がブラウザ既定の `currentColor` になる）。`data-disabled:` / `hover:` 付きのユーティリティは `[data-disabled]` / `:hover` のぶん詳細度が一段高く、素のユーティリティに常に勝つので BASE に置いてよい。

### Sign in with Apple 用の `variant="apple"`（v4.2）

Apple の HIG が「黒地・白文字・白ロゴ」を規定しているため、`Button` に専用の variant を持つ。`--color-apple` / `--color-on-apple` はテーマオーバーレイを持たず、**ライトテーマでも黒地のまま**。hover は `brightness` が黒地では効かない（乗算なので黒のまま）ため、白を少量混ぜた `--color-apple-hover` への面変化で表現する。`AppleIcon` は `currentColor` に従うのでロゴも白になる。

```tsx
<Button variant="apple" icon={<AppleIcon />}>Sign in with Apple</Button>
```

### ⚠ 任意値ユーティリティは型を明示する

`border-[1.5px]` のような**裸の任意値**は Tailwind v4 が別プロパティ（この場合 `border-color`）の任意値と解釈しうる曖昧な書き方で、実際に**ユーティリティが生成されず、DOM にクラスは出るのに枠が既定の 1px で描かれる**欠損を出荷したことがある（#35）。長さなら `border-[length:1.5px]` のように型を明示する。`pnpm check:styles` は**ソース中の任意値ユーティリティが配布 CSS に生成されているか**も検査する（この種の欠損の回帰ネット）。

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

### 余白スケール（`gap` / `padding`）の対応表

`Stack` / `Grid` の `gap` と `Surface` の `padding` は**同じ語彙・同じ刻み**を共有する（並べて使ったときに余白の見た目が一致するようにするため）。

| 値 | px | `gap` | `padding` |
| --- | --- | --- | --- |
| `none` | 0 | `gap-0` | `p-0` |
| `xs` | 4 | `gap-1` | `p-1` |
| `xs.5` | 6 | `gap-1.5` | `p-1.5` |
| `sm` | 8 | `gap-2` | `p-2` |
| `md` | 12 | `gap-3` | `p-3` |
| `lg` | 16 | `gap-4` | `p-4` |
| `xl` | 24 | `gap-6` | `p-6` |
| `2xl` | 32 | `gap-8` | `p-8` |

> ⚠ **`xs.5`（6px）は #57 で足した半刻み。** カード内の詰まった縦積み（アバター + 名前）で自然に出る寸法だが、`xs`(4) と `sm`(8) の間に段が無いために消費側が `Stack` に載せられず `className` で組むことになっていた。**`2xs` とは呼ばない** —— t シャツスケールでは `2xs` は「`xs` より小さい」を意味するのに実際は `xs` より大きく、逆の印象を与えるため。Tailwind 自身の半刻み（`gap-1.5`）に合わせた `xs.5` なら、`xs` と `sm` の間にあることが名前だけで分かる。**これ以上の任意値は許さない**（`gap` に任意値を通すと DS 側で刻みを変えても消費側へ伝播しなくなり、スケールを持つ意味が消える）。

### elevation スケールの対応表

`Surface` の `elevation` は 0〜4 の1軸で「背景 + 境界 + 影」の組を決める。`theme.css` に追加した `--shadow-elevation-0`〜`4` は**既存の `--shadow-soft` / `-popover` / `-overlay` を参照するだけの別名トークン**で、新しい影の実値は増やしていない。

| elevation | 背景 | 境界 | 影 | 既存の対応 |
| --- | --- | --- | --- | --- |
| 0 | なし | なし | なし | 素の器 |
| 1 | `bg-bg-elevated` | `border-border` | なし | Paper / Panel |
| 2 | `bg-surface` | `border-border` | `shadow-elevation-2`（= 既存 `shadow-soft`） | Card |
| 3 | `bg-surface` | `border-border-strong` | `shadow-elevation-3`（= 既存 `shadow-popover`） | Popover / Menu |
| 4 | `bg-surface` | `border-border` | `shadow-elevation-4`（= 既存 `shadow-overlay`） | Modal |

#### elevation に直交する2軸（`tone` / `shadow`）

**`elevation` の段は増やさず、面の色だけ・影だけを切る直交プロパティを持つ（#57）。** 段を足すと「1〜4 が Paper / Card / Popover / Modal に対応する」という既存の意味が薄まるうえ、必要だったのは「2 の影だけ落としたい」「1 の背景だけ tint にしたい」という**組の一部差し替え**であって新しい段ではなかったため。

| prop | 値 | 効果 |
| --- | --- | --- |
| `tone` | `'default'`（既定） | 背景は `elevation` が決めるもの |
| | `'tint'` | 背景だけ `bg-tint-5`（地の色をわずかに持ち上げただけの面）。境界と影は `elevation` のまま |
| `shadow` | `'auto'`（既定） | 影は `elevation` が決めるもの |
| | `'none'` | 影だけ落とす（背景と境界は欲しいが浮かせたくない面。リストの中に並ぶ行） |

```tsx
// ❌ これまで（className で1プロパティだけ上書き）
<Surface elevation={2} className="shadow-none">…</Surface>
<Surface elevation={1} className="bg-tint-5">…</Surface>

// ✅ これから
<Surface elevation={2} shadow="none">…</Surface>
<Surface elevation={1} tone="tint">…</Surface>
```

⚠ **新しい影の実値もトークンも増やしていない。** `tint-5` は `theme.css` の既存トークン、`shadow="none"` は既存の組から影を引くだけ。**既定値が従来と同一なので、既存の呼び出しの見た目は 1px も動かない。**

⚠ **境界は `elevation` だけが決める（直交軸を持たせていない）。** 4辺すべてに境界を引けない場所（AppBar は下端だけ / Footer は上端だけ）は `Surface` を使わず `ELEVATION_BG` / `ELEVATION_BORDER_COLOR` を直接引く設計になっており、境界の軸をここへ足すと同じことを2通りで表現できてしまうため。

### クリックできる面（`render`）

`Surface` / `Paper` / `Card` / `Panel` は **Base UI の `useRender` ベースの `render` プロップ**を持つ（#56。`SideNav` と同じ流儀）。面そのものを任意の要素として描けるので、クリックできるカードを1要素で書ける。

```tsx
// ❌ これまで（「リセットした <button> > Surface」の入れ子）
<button type="button" className="border-none bg-transparent p-0 text-left shadow-none">
  <Card>…</Card>
</button>

// ✅ これから
<Card render={<button type="button" />} interactive onClick={…}>…</Card>
```

- **DOM が1段浅くなる**うえ、`<button>` の中に `<div>` を置く **content model 違反**も同時に消える。
- **消費側は打ち消しユーティリティ（`border-none bg-transparent p-0 shadow-none`）を書かなくてよい。** 面（背景 / 境界 / 影 / padding）は `elevation` 側のクラスが当て、UA 既定のボタン外観（OS の面・枠・`text-align: center`・マージン・`appearance`）は DS が `render` を渡されたときだけ打ち消す。
- **打ち消しは `render` を渡したときだけ当てる。** `m-0` / `text-left` は同じプロパティのユーティリティ（`mt-4` / `text-center`）と強さが並ぶため、既定の `<div>` にまで常時当てると消費側の `className` が勝てるかどうかが Tailwind の出力順に依存してしまう。
- ホバーの持ち上げとフォーカスリングは従来どおり `interactive` が担う（`render` は要素の実体を替えるだけで、インタラクションの見た目は持たない）。
- **`render` を足したのは面プリミティブだけ。** 他のプリミティブが `render` を Omit しているのは意図的で、一括導入はしない。

既存コンポーネントとの対応をもう少し細かく言うと:

| 既存コンポーネント | 現在の面 | 対応する段 |
| --- | --- | --- |
| `Card` 相当の面 | `bg-surface` + `border-border` + `shadow-soft` | **2** |
| `Popover` / `Menu` のポップアップ | `bg-surface` + `border-border-strong` + `shadow-popover` | **3** |
| `Modal` のポップアップ | `bg-surface` + `border-border` + `shadow-overlay` | **4** |
| `Toast`（snackbar 経路） | `bg-snackbar-surface` + `shadow-overlay` | **4**（面の色だけテーマに追従しない意図的な例外） |
| `BottomSheet` | `bg-bg` + `border-border`（下辺なし）+ **上向きの専用影** `0 -16px 34px -18px` | **スケール外** |

> ⚠ **`BottomSheet` は意図的にこのスケールに載っていない。** 画面下端から出る面なので影を上向きに落とす必要があり、下向き前提の `--elev-*` をそのまま使えない（`components.css` に専用の `box-shadow` を持つ）。`Surface` の `elevation` で BottomSheet の見た目を再現しようとしないこと。

- **既存の `shadow-soft` / `shadow-popover` / `shadow-overlay` は廃止していない。** elevation スケールはその上に載る意味論の別名で、既存コンポーネントの見た目は一切変わっていない。
- **ダーク（既定）では背景ランプの明度差が高さの主表現、ライトでは `--color-shadow` を青みグレーにした薄い影が主表現**になる。参照先の `--elev-*` が既にテーマ別の値を持っているため自動で切り替わり、**コンポーネント側は `elevation` prop の1軸しか見ていない**（テーマ分岐は持たない）。

### 移行ガイド（Tailwind 直書き → プリミティブ）

消費側（insession-app / loophub-app）で繰り返し書かれている Tailwind 直書きパターンは、以下のプリミティブに置き換えられる。

| これまで | これから |
| --- | --- |
| `<div className="flex flex-col gap-3">` | `<VStack gap="md">` |
| `<div className="flex flex-col gap-1.5">` | `<VStack gap="xs.5">` |
| `<div className="flex items-center gap-2">` | `<HStack gap="sm" align="center">` |
| `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">` | `<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="md">` |
| `<div className="rounded-card border border-border bg-surface p-4 shadow-soft">` | `<Card padding="lg">` |
| `<Surface elevation={2} className="shadow-none">` | `<Surface elevation={2} shadow="none">` |
| `<Surface elevation={1} className="bg-tint-5">` | `<Surface elevation={1} tone="tint">` |
| `<button className="border-none bg-transparent p-0 text-left shadow-none"><Card>…</Card></button>` | `<Card render={<button type="button" />} interactive>` |
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
pnpm check:typography  # タイポグラフィがスケールから逸脱していないか（ソースだけを見るのでビルド不要）
pnpm check:stories  # public export したコンポーネントがカタログに載っているか
pnpm check:package  # publish される tarball の中身が意図どおりか（要 pnpm build）
pnpm test:a11y      # 全 story を実ブラウザで描画して axe を掛ける
```

### `pnpm verify` — PR 前に緑にするコマンド

**PR を出す前に `pnpm verify:full` を通すこと。これが CI と同じ判定**で、CI（`.github/workflows/ci.yml`）は個別のチェックを列挙せずこのスクリプトを呼ぶだけにしてある。列挙すると「CI では走るが手元では走らない」チェックが静かに生まれ、手元の確認が CI と一致しなくなるため。検査を足すときは `package.json` の `verify` / `verify:full` に足す。

| コマンド | 中身 | 用途 |
| --- | --- | --- |
| `pnpm verify` | typecheck → check → check:typography → check:stories → build → check:styles → check:package | 手元の反復用。実ブラウザを起動しないので速い |
| `pnpm verify:full` | `verify` + build-storybook + test:a11y | **CI と同一**。PR 前とマージ前はこちら |

`test:a11y` は Playwright の Chromium を使う。初回だけ `pnpm exec playwright install chromium` が要る。

### `pnpm check:styles` が守っているもの

このパッケージは長らく「**publish された中身だけでは完成しない**」状態だった。コンポーネントが `className="modal-backdrop"` や `animate-[card-in_…]` を参照しているのに、その定義はパッケージ内に無く、消費側 insession-app の legacy CSS にしか存在しなかった。クラス名は DOM に出るのに CSS が無いので、**型検査もビルドも lint も緑のまま、insession-app 以外では見た目だけが静かに崩れる**（Modal 既定経路 / BottomSheet / GoogleIcon / 各種アニメーションが該当した）。

人間のレビューで気づける類の欠損ではないので、`scripts/check-styles.mjs` が CI で機械的に検査する:

1. ソースの `animate-[NAME_…]` に対し `@keyframes NAME` が配布 CSS にあるか
2. `className` に書かれた素のクラス名が、配布 CSS にセレクタとして存在するか
3. トークンが `:root` に出ているか / preflight を巻き込んでいないか / ユーティリティ生成が生きているか

**Storybook も同じ理由で「消費側と同じ経路」で描く。** `.storybook/preview.css` は `dist/styles.css` だけからコンポーネントのスタイルを取り、stories 自身のページ組みの分だけを `source(none)` + `@source "../stories"` で追加生成する。ここでコンポーネント本体を走査対象に戻すと、配布 CSS の欠損をカタログが埋めてしまい、上記の見逃しが再発する。

### `pnpm check:typography` が守っているもの

タイポグラフィの逸脱も、`check:styles` が防いでいる欠損と同じく **型検査もビルドも lint も緑のまま通る**。しかもこちらは人間のレビューでも「13px と 14px のどちらが正か」を毎回思い出せないと止められない。`scripts/check-typography.mjs` が CI で検査する:

1. 廃止した段（`text-2xs` / `smd` / `md` / `xl` / `2xl` 以上）を使っていないか
2. `font-size` の任意値（`text-[13px]` 等）を使っていないか
3. トークンで書ける `leading-[…]` / `tracking-[…]` を任意値で書いていないか
4. コンポーネントが `font-display` / `font-mono` を使っていないか（`LogoMark` のワードマークだけ例外）
5. `src/styles/*.css` に `font-size` の直書きが無いか（`var(--text-*)` 経由か）
6. `theme.css` の不変条件 — 廃止トークンが残っていないか、全サイズトークンが `line-height` を実数で持つか、Tailwind 既定の段が `initial` で潰されているか

> ⚠ **段を廃止するとき、`@theme` から自分の上書きを削るだけでは足りない。** `text-xl` 以上は Tailwind の既定テーマにも存在するので、上書きを消すと**既定値（`text-xl`=20px / `2xl`=24px / … / `6xl`=60px）が表に出てくる**。クラス名は DOM に出て CSS も当たるため、型検査もビルドも lint も緑のまま、廃止したはずの段が DS の意図とは違うサイズで生き続ける。`--text-xl: initial;` のように明示的に潰すこと（`theme.css` に記述済み。検査 6 がこれを見張る）。

テキストでない `font-size`（閉じるボタンの「×」グリフの寸法など）は、直前に `typography-scale-exempt` の注記を置くと除外できる。**アイコングリフのサイズはタイポグラフィの契約の外**という線引きで、ここを本文スケールに乗せると、アイコンの大きさを変えたいだけでテキストの段を触ることになる。

日本語を含む文字列リテラルは走査しない。Storybook の `note` はクラス名を**文章として**含むため、素朴に走査すると誤検出する（`className` に日本語が入ることは実質無いので、この線引きで足りる）。

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
