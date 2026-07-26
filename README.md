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

**DS のプリミティブはすべて [Base UI](https://base-ui.com)（`@base-ui/react`）へ振る舞いを委譲している。** DS 側が持つのはトークンベースの見た目だけ。

| | 移行 | 得たもの |
| --- | --- | --- |
| `Popover` / `Menu` / `Modal` / `ConfirmModal` / `Tabs` | v2 | 衝突回避・フォーカストラップ・スクロールロック・矢印キーナビ・typeahead |
| `Checkbox` / `Radio` / `Toggle` / `Input` / `Textarea` | v3 | label 紐付け・`aria-invalid` / `aria-describedby`・roving tabIndex |
| `BottomSheet` / `Toast` | v3 | スナップ付きドラッグ・キュー管理・自動 dismiss・aria-live |

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
index.ts              公開窓口（外部はここ経由で import する）
theme.css             デザイントークンの契約（@theme）
base.css              コンポーネントが前提にする最小リセット（preflight は配らない）
components.css        ユーティリティで表現していない部品 CSS と @keyframes
styles.src.css        配布 CSS のビルド入力（publish しない）
*.tsx                 プリミティブ（button / input / modal / popover / …）
icons/                アイコン（icon.tsx の PATHS が単一ソース）
stories/              Storybook のカタログ
.storybook/           Storybook 設定（preview.css が消費側と同じ経路の再現）
.storybook/public/    成果物へそのままコピーされる静的ファイル（CNAME = 公開ドメイン）
scripts/              check-styles.mjs（配布 CSS の欠損検査）
.design-sync/         DesignSync（claude.ai/design 連携）の設定
tsup.config.ts        配布物（js + d.ts）のビルド
```

配布されるのは `dist/`（`index.js` / `index.d.ts` / `styles.css`）と `theme.css` / `base.css` / `components.css` / `LICENSE`。

## ライセンス

[MIT](./LICENSE) © INSESSION Space

1.4.0 までは `package.json` の `license` が `UNLICENSED` のままだった。public リポジトリで npm にも公開しているのに、この表記では **InSession / loophub 以外は法的に使えない**（`UNLICENSED` は「許諾しない」の明示）。他プロダクトへ配る前提と矛盾していたので MIT に改めた。

## 履歴

このパッケージは `insession-space/insession-app`（モノレポ）の `foundation/ui`（さらに前は `packages/ui`）として開発されていた `@in-session/ui` を、リポジトリ分割時に独立させて改名したもの。改名前の変更履歴は `CHANGELOG.md` にそのまま残している。
