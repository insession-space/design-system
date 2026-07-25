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
@source "../../node_modules/@insession/design-system/dist";
```

> ⚠ **`@source` は必須。** これが無いとコンポーネント内のクラス名から Tailwind ユーティリティが生成されず、**ビルドは通るのにスタイルだけが静かに消える**（クラス名は DOM に出るが対応する CSS が無い状態になる）。パスは各アプリの `style.css` から `node_modules` への相対パスに合わせる。pnpm では `node_modules` 配下が symlink になるため、**初回セットアップ時は必ず実ビルドして見た目を目視確認する**こと。

```tsx
import { Button, Badge, Modal } from '@insession/design-system';
```

### ⚠ `minimumReleaseAge` を設定している環境では除外指定が必要

サプライチェーン対策で pnpm の `minimumReleaseAge`（publish 直後の版を install させない待機時間・**分単位**）を設定している場合、**publish したての DS が数日間 install できない**。自前のパッケージなので除外して問題ない。消費側リポジトリの `pnpm-workspace.yaml` に書いてコミットすると、開発者ごとのグローバル設定に依存せず揃う。

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

`package.json` の `publishConfig.registry` で公開レジストリを明示している。**これを外さないこと** — 開発機の `~/.npmrc` が社内プロキシを `registry` に設定していると、publish がプロキシ宛になって公開レジストリに出ない。

ローカルから手で publish する場合も同様に宛先を確認する。

```bash
npm whoami --registry https://registry.npmjs.org   # 公開レジストリでのログイン確認
pnpm build && npm publish                          # publishConfig.registry が効く
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
