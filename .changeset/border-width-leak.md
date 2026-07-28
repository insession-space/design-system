---
"@insession/design-system": patch
---

単辺の border-* に border-solid を併記していた箇所で、消費側に 3px の枠線が出ていたのを直す

`border-b border-solid` と書くと border-style は4辺すべてに付く。Tailwind のプリフライトを
読み込む環境では border-width の既定が 0 なので下辺だけの線になるが、**プリフライトを使わない
消費側では border-width の既定 medium(3px) が残り3辺に出て、要素が枠で囲まれて見える**。

対象は AppBar / Footer(page.tsx)・Modal のフッター・SplitModal(ヘッダー / ナビ列 / フッター /
モバイルの行)の計9箇所。他3辺を 0 にする指定を添えた(`border-0` は shorthand で単辺指定との
勝敗が生成 CSS の出力順で決まるため使わない)。

このバグは DS 自身の Storybook では見えない(プリフライトを読み込むため)ので、
`pnpm check:border-width` を追加して verify で機械的に止める。
