# design-sync NOTES — InSession Design System (@insession/design-system)

claude.ai/design プロジェクト: **InSession UI** (`b683a5a6-eea2-4cf5-af15-f848f9415a4f`)。
`projectId` は失うと復元できないので `config.json` から絶対に消さない。

## 現在の構成（2026-07-28 の再同期時点）

- 配布は **dist ビルド配布**（`exports['.']` = `./dist/index.js`、型は `./dist/index.d.ts`）。生成は `tsup` + Tailwind CLI（`buildCmd` = `pnpm build`）。
- パッケージは単独リポジトリのルート。`stories/` も直下。
- **同期対象 57 コンポーネント**、11 グループ（`actions` `data-display` `feedback` `foundations` `inputs` `layout` `navigation` `overlays` `page` `patterns` `surfaces`）。前回同期（22件・単一 `components` グループ）から大きく育ち、グループも再編された。
- グローバル名は **`InsessionDesignSystem`**（`pkg` から自動導出）。`InSessionUi` は旧モノレポ時代（`@in-session/ui`）の名前で**もう存在しない**。
- ビルド前提: Node 22.18 / pnpm 10 / esbuild は `.ds-sync` にローカル install。

## この再同期（2026-07-28）で直したこと

- **[GENERAL] `config.json` の `//` コメントキーが弾かれるようになった。** 新しいコンバータは未知キーで即エラー（`✗ config: unknown key "//"`）になり、何もビルドしない。コメントは config に書かず、この NOTES に書く。
- **[GENERAL] `.design-sync/ds-surface.tsx` が `var(--bg)` / `var(--text)` を参照していて背景が当たっていなかった。** Tailwind v4 の `@theme` が出すのは `--color-*` 系で、`--bg` / `--text` は**存在しない**。未定義 `var()` は透明にフォールバックするため、白地に暗テーマ配色＝ラッパー無しと同じ状態になっていた（全コンポーネントに影響）。`--color-bg` / `--color-text` へ修正済み。**トークン名を変えたらこのファイルも追随させること。**
- **[GENERAL] `conventions.md` の記述が実ビルドと乖離していた**（詳細は下記「conventions.md の検証」）。
- `[TITLE_UNMAPPED]` 3件を解消: `Foundations/Elevation` はトークンカタログなので `null`、`Inputs/Segmented & Slider` → `SegmentedControl`、`Inputs/Upload & Color` → `UploadTile`。**titleMap のキーは build ログが出す正規化名**（空白なしの `Segmented&Slider` 形式）。
- `[GRID_OVERFLOW]` 2件: `RingTimer` → `cardMode: "single"` + `primaryStory: "Normal"`（fixed 配置がセル外に出る）、`Tabs` → `cardMode: "column"`（セル幅超過）。
- `Icon` の `viewport` を `900x1400` → `900x2000` に拡大。プレビュー側は DsSurface の padding のぶん本文幅が狭く、storybook が 8 列のところ 7 列になって縦に伸び、ギャラリー下端（「専用アイコン」節）が切れていた。**アイコンを増やしたらまた超過しうる。**
- `PageLayout` に `cardMode: "single"`（下記 close 参照）。
- **手動シードの残骸を削除した。** 前回 #974 で手書き登録した `components/components/{RingTimer,StepFlow}/` は、**アンカーが記録していないため差分の deletePaths に出ない**。今回は正規の `components/feedback/RingTimer` / `components/navigation/StepFlow` が生成されたので、リモートを `list_files` して手で消した。**アップロード後は必ず `list_files` で孤児を確認すること。**

## 既知の正常（新しい警告と区別するため）

- **ストーリーのカタログ見出し・説明文だけ両側で書体が違う。** `stories/tokens.tsx` の `Section` が `font-body` / `text-text-dim` という **Tailwind ユーティリティ**を使っており、これらは storybook ビルドの `@source "../stories"` でのみ生成される（配布 `dist/styles.css` には無い）。**部品本体は両側とも DS の CSS で描画されているので問題ない。** スキル規定どおり「ストーリー側の装飾」として許容。
- **`[ASSETS_BLOCKED] example.invalid`**: `Avatar` / `UserLabel` のストーリーが**意図的に壊れた画像 URL** でフォールバック（頭文字表示）を見せている。サンドボックスの問題ではなく、両側とも意図どおりの描画。
- **`IconButton` の ghost variant は暗背景で透明**＝シート上「空」に見えるが両側同一で正常。
- オーバーレイ系（`Modal` / `BottomSheet` / `ConfirmModal` / `Popover` / `SplitModal`）のストーリーは**閉状態（クリックで開くトリガー）**を描画する。開いたオーバーレイの中身は storybook 側も未検証。**オーバーレイの見た目を変えたら手動確認が要る。**
- `[STORY_CAP]`: `MessageItem`(17) / `UserLabel`(10) は既定 cap 6 で採点。tail のストーリーは個別採点されていない。

## `close` で受理した1件

- **`PageLayout`（Default）** — 内容・構成・スタイルは storybook と完全一致だが、**プレビュー側のみ下端の Footer が欠ける**。`PageLayout` は `h-dvh` 前提で、カードラッパー `DsSurface` が上下 16px の padding を足すぶん必ずビューポートを超過する（`viewport` を広げても `h-dvh` が追随するので解消しない）。ラッパーの padding を外すと全コンポーネントのカードが窮屈になるため、出荷カード側のみ `cardMode: "single"` で封じ込めた。

## conventions.md の検証（2026-07-28 に全面書き直し）

前回の記述はリポジトリ分割前の前提が残っており、**生成されるデザインを確実に壊す**内容だった。実ビルドに対して機械検証して修正済み:

| 旧記述 | 実態 |
| --- | --- |
| `window.InSessionUi.*` | **`window.InsessionDesignSystem.*`**。これだけで design agent のコードが全て `undefined` になる |
| 「`styles.css` の `body` ルールが暗背景を当てる」 | **`body` / `html` ルールは配布 CSS に存在しない**（`:root` のトークン定義のみ）。地色・文字色・フォントは生成側で当てる必要がある |
| `<Tabs tabs={[...]} value onChange>` | Tabs は **compound namespace**（`Tabs.Root/.List/.Tab/.Panel`）。`Modal` `Popover` `SideNav` `Toast` も同様 |
| `--bg` `--text` `--color-mint` `--color-cyan` `--color-scrim` `--radius-lg` | いずれも**実在しない** |
| 「ダークが唯一のテーマ」 | `<html data-theme="light">` でライトのオーバーレイが効く |
| `components/components/<Name>/` | **`components/<group>/<Name>/`**（11グループ） |

**DS の API・トークン名・グループ構成を変えたら conventions.md を再検証すること。** 検証は `ds-bundle/_ds_bundle.css` の `:root` に対するトークン名 grep と、`ds-bundle/components/<group>/<Name>/<Name>.d.ts` の props 確認で機械的にできる。

## Re-sync risks（次回同期の監視リスト）

- **`conventions.md` は `readmeHeader` として README 先頭に入り、design agent のシステムプロンプトに載る。** ここに実在しない名前を書くと agent はそれを信じて壊れたコードを吐き、しかも静かに失敗する。**必ず実ビルドに対して grep で検証する。**
- **`ds-surface.tsx` はトークン名に依存する。** `--color-*` の改名で無言で効かなくなる（背景が透明になるだけでエラーは出ない）。プレビューが白地になっていたら真っ先にここを疑う。
- **アップロード後の `list_files` で孤児を確認する。** アンカー外のファイル（過去の手動シード、グループ再編前のパス）は差分に出ない。
- **`Toggle` は同期対象から外れた。** `Toggle` / `ToggleGroup` / `Slider` / `ColorInput` / `ColorSwatchGroup` / `ToolButton` / `AppleIcon` / `GoogleIcon` は**バンドルには入っているがカード・`.d.ts` は出ない** — storybook shape は「1ストーリー題名 = 1コンポーネント」なので、`Controls` / `Segmented & Slider` / `Upload & Color` のように複数部品を1題名に同居させると代表1つしか登録されない。個別カードが要るならリポジトリ側でストーリーを分割する。
- **`.gitignore` が `.design-sync/previews/` を無視している。** スキルの前提では owned preview は**コミットされる durable set**。現状 owned preview は1つも無いので実害は出ていないが、将来 owned preview を作るなら `.gitignore` からこの行を外さないと新しいクローンで消える。
- **sb-reference のフォント手動注入はもう不要**（解消済み）。`.storybook/preview.tsx` が `@fontsource/jetbrains-mono` を直接 import するようになったため、旧 NOTES にあった `iframe.html` への `@font-face` 手動注入は要らない。
- **RingTimer / StepFlow の手動シード問題は解消済み**（コンバータ生成物に置き換わり、旧パスも削除した）。
