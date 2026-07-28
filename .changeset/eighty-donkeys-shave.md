---
'@insession/design-system': patch
---

検証チャネルを `pnpm verify` / `pnpm verify:full` に一本化し、カタログ網羅と a11y を機械検査で守るようにした（#120）。

- `pnpm verify`（型検査・lint・タイポグラフィ・カタログ網羅・ビルド・配布 CSS・パッケージ内容）と `pnpm verify:full`（+ カタログのビルド + 全 story への axe）を追加。CI は個別チェックを列挙せずこの2つを呼ぶだけにしたので、手元の確認と CI が構造的にズレなくなった
- `pnpm check:stories` を追加。public export したコンポーネントが story で一度も描画されていなければ CI で落ちる
- `pnpm check:package` を追加。CI にインラインで埋まっていた tarball 検査をスクリプトへ切り出し、手元でも実行できるようにした。あわせて `exports` が指す先が実際に同梱されているかも見る
- Storybook に `@storybook/addon-a11y` + `@storybook/addon-vitest` を導入し、全 story（206 件）を実ブラウザで描画して axe を掛ける（違反があれば CI が落ちる）
- `RingTimer` に `ariaLabel` を追加。`role="progressbar"` にアクセシブルな名前が無く「何の進捗か」が支援技術へ伝わっていなかった（省略時は `caption`、それも無ければ「残り時間」）

`color-contrast` は一時的に抑制している（色トークンの再設計が要るため別 Issue）。それ以外の見た目・出荷物（`dist` / 配布 CSS / 型）は変更していない。
