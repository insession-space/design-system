# @insession/design-system

InSession と loophub が共有するデザインシステム。**純粋 leaf UI プリミティブ + デザイントークン**を提供する。

アプリ固有のロジックには依存しない（i18n の `t`・ルーター・認証などは全て props で注入する）。依存は `react` / `react-dom` の peer だけ。

- npm: [`@insession/design-system`](https://www.npmjs.com/package/@insession/design-system)
- 消費側: `insession-space/insession-app`（InSession 本体・admin・lp・help）、`insession-space/loophub`（web・lp）

## セットアップ（消費側アプリ）

```bash
pnpm add @insession/design-system
```

アプリの CSS で、Tailwind → トークン → `@source` の3点を書く。

```css
@import "tailwindcss";
@import "@insession/design-system/theme.css";
/* パスは「この CSS ファイルから、自分のパッケージの node_modules」への相対パス。下記の注意を読むこと */
@source "../node_modules/@insession/design-system/dist";
```

> ⚠ **`@source` は必須。** これが無いとコンポーネント内のクラス名から Tailwind ユーティリティが生成されず、**ビルドは通るのにスタイルが部分的に欠ける**。クラス名は DOM に出るのに対応する CSS が無い状態で、エラーもワーニングも出ない。
>
> **しかも「全崩れ」にはならない。** Vite のモジュールグラフ経由で一部のクラスは拾われるため、一見それらしく描画される。実測では CSS の約4割が欠けた状態でビルドが緑になった。
>
> ⚠ **pnpm workspace では `@source` をリポジトリルートの `node_modules` に向けてはいけない。** pnpm は依存を**それを宣言したパッケージ自身の `node_modules`** にリンクし、ルートには置かない。したがって `apps/web/src/style.css` からの正しいパスは `../node_modules/...`（= `apps/web/node_modules/...`）で、`../../../node_modules/...`（リポジトリルート）は**空振りする**。
>
> | 消費側の構成 | `style.css` の位置 | 正しい `@source` |
> | --- | --- | --- |
> | pnpm workspace | `apps/<app>/src/style.css` | `../node_modules/@insession/design-system/dist` |
> | 単一パッケージ | `src/style.css` | `../node_modules/@insession/design-system/dist` |
>
> **CI でビルド成果物を検査すること。** 生成CSSに DS 由来のユーティリティ（アプリのソースには書かれていないもの。例 `bg-accent` / `rounded-card`）が入っているかを確かめれば、この事故を機械的に防げる。loophub の `scripts/check-ds-styles.mjs` が実装例。

```tsx
import { Button, Badge, Modal } from '@insession/design-system';
```

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

### テーマ

`theme.css` は**ダーク単一トーン**で、`[data-theme]` のライトテーマオーバーレイを含まない。ライト/ダークを切り替えるアプリは自分側でオーバーレイを持つ。

## 開発

```bash
pnpm install
pnpm storybook      # カタログ（http://localhost:6006）
pnpm build          # dist（js + d.ts）を tsup で生成
pnpm typecheck
pnpm check          # Biome lint + format
```

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

`tsup.config.ts` は `minify: false` にしている。消費側の Tailwind が `dist` を `@source` で走査してユーティリティを生成するため、**クラス名の文字列リテラルが壊れると上記の「スタイルが静かに消える」障害を引き起こす**。

## リリース

Changesets でバージョンを採番し、`main` への push で npm へ publish する。

```bash
pnpm changeset      # 変更の intent を積む
```

`main` に push されると Version PR が作られ、それをマージすると `release.yml` が npm publish する。

**publish は npm の Trusted Publishing（OIDC）で行う。トークンは使わない。** `release.yml` は `id-token: write` を持ち、`NPM_TOKEN` を**意図的に env へ渡していない**（changesets/action は env に `NPM_TOKEN` があればトークン publish を優先するため、渡すと OIDC が使われなくなる）。

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
*.tsx                 プリミティブ（button / input / modal / popover / …）
icons/                アイコン（icon.tsx の PATHS が単一ソース）
stories/              Storybook のカタログ
.storybook/           Storybook 設定（preview.css がトークン読み込みの最小例）
.design-sync/         DesignSync（claude.ai/design 連携）の設定
tsup.config.ts        配布物ビルド
```

## 履歴

このパッケージは `insession-space/insession-app`（モノレポ）の `foundation/ui`（さらに前は `packages/ui`）として開発されていた `@in-session/ui` を、リポジトリ分割時に独立させて改名したもの。改名前の変更履歴は `CHANGELOG.md` にそのまま残している。
