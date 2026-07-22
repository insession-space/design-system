# design-sync NOTES — InSession UI (@in-session/ui)

## セットアップの学び（初回同期 2026-07-22）

- [GENERAL] `@in-session/ui` は**ビルドなしのソース直配布**（`exports['.']` = `./index.ts`、dist なし）。converter へは `--entry foundation/ui/index.ts` を渡す（esbuild が .tsx を直接バンドル、bundle 90KB）。
- [GENERAL] コンポーネント発見は `.d.ts` の PascalCase export 基準なので、`buildCmd`（config 記載）で `tsc --emitDeclarationOnly --outDir dist` を**同期前に必ず実行**する。さらに2点必要:
  1. 生成された d.ts の re-export 指定子が `./avatar.tsx` のままだと ts-morph が解決できず 0 symbols になる → `sed` で `.tsx'`→`.js'` に書き換える（buildCmd に含めた）。`--rewriteRelativeImportExtensions` は宣言ファイルには効かなかった。
  2. `foundation/ui/package.json` に `"types": "dist/index.d.ts"` を追加した（dts 抽出のエントリ解決が `pj.types || 'index.d.ts'` のため。コミット済み想定）。
- [GENERAL] CSS は `[CSS_FROM_STORYBOOK]` に任せる（Tailwind v4 の @theme トークンは storybook ビルドの compiled CSS が唯一の静的成果物。cssEntry 指定不要。174KB）。
- [GENERAL] フォント: アプリは `@fontsource/jetbrains-mono` の 400/700 を `apps/web/src/main.tsx` で import する。**Storybook 自体はフォントを import していない**（リファレンスもフォールバック描画）ため、(1) `cfg.extraFonts` で fontsource の 400.css/700.css を同梱し、(2) `.design-sync/sb-reference/iframe.html` に同じ @font-face（latin/latin-ext 400/700、`fonts-jbm/`）を手動注入した。**sb-reference を再ビルドしたら注入をやり直すこと**。日本語グリフは JetBrains Mono に無く Hiragino Sans / Noto Sans JP フォールバック（アプリ本番と同じ挙動なので許容）。
- `[TOKENS_MISSING] --drift / --rot / --danmaku-lane / --accent` は**予期される未定義**: 前3つはリアクション弾幕がランタイムに inline style で設定する変数、`--accent` は emoji-picker-react 上書きが参照する legacy 変数（style.css に定義なし）。DS トークンではない。対処不要。
- ストーリー題名の除外/マッピング: `ChatLog(EventBubble)`（@in-session/space-core 依存・DS 外）と `Navigation`（apps/web の SideNav・DS 外）、`Foundations/*`（Colors/Tokens/Typography のトークンカタログ・component export に対応なし）は titleMap null で除外。`Status`→`StatusBadge`、`Icons`→`Icon`、`Controls`→`Checkbox`、`Primitives`→`Avatar` にマップ。
- `[GRID_OVERFLOW]` Avatar（Modal ストーリーが幅超過）→ `overrides.Avatar.cardMode: "column"`。

## 検証キャンペーンの学び（fan-out 3バッチ・2026-07-22）

- 全18バッチ対象コンポーネントで生成プレビューがそのまま一致（owned preview 作成ゼロ）。
- BottomSheet/ConfirmModal/Popover/SplitModal/Modal: ストーリーは**閉状態（クリックで開くトリガー）**を描画するため [PORTAL?] は発火せず cardMode single 不要。開いたオーバーレイの中身は両側とも未検証（storybook 側の制約）。
- IconButton の ghost variant は暗背景で透明＝シート上「空」に見えるが両側同一で正常。
- Icon(Gallery) はストーリーが縦長(1175px)でキャプチャ viewport(900x700) を超過 → `overrides.Icon.viewport: "900x1400"` を設定（viewport 変更は grade contract に含まれるため要フルビルド+再採点）。

## Re-sync risks（次回同期の監視リスト）

- **sb-reference 再ビルドでフォント注入が消える**: `.design-sync/sb-reference/iframe.html` への JetBrains Mono @font-face 注入（`fonts-jbm/`）は手動。sb-reference を作り直したら再注入しないと比較が両側フォールバックになり、フォント欠落が見えなくなる。
- **buildCmd の d.ts 生成 + sed 書き換えは必須前提**: `foundation/ui/dist/` が無い/古いと発見0件または古い Props で同期される。config の buildCmd（tsc emit + `.tsx'`→`.js'` sed）を必ず先に実行。
- **オーバーレイ系（Modal/BottomSheet/ConfirmModal/Popover/SplitModal）は閉状態のみ検証済み**: 開いたオーバーレイの中身は storybook 側もクリック起動のため両側未検証。オーバーレイの見た目を変えた場合は手動確認が要る。
- **Avatar(Primitives) は 10 ストーリーを --max-stories 10 で全採点済み**。既定 cap(6) のままの再キャプチャでは tail 4 本のシートが撮られない点に注意。
- **[TOKENS_MISSING] の 4 変数と IconButton ghost の「空」見えは既知の正常**（本文参照）。新しい警告が出たらそれは新規。
- **conventions.md の語彙は 2026-07-22 のビルドで実在検証済み**: トークン名/クラス名/props（Tabs.tabs/value、StatusBadge.tone に live 無し等）。DS の API 変更時は再検証。
- **ビルドの前提**: Node 22.18 / pnpm 10 / esbuild は .ds-sync ローカル install。`window.InSessionUi`。
