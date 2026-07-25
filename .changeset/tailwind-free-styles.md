---
'@insession/design-system': minor
---

消費側の Tailwind 依存を外し、パッケージを自己完結させた。

**`@insession/design-system/styles.css` を追加した。** publish 時にプリビルドした配布 CSS（トークン + 部品 CSS + このパッケージが使うユーティリティ、約 53KB / gzip 約 9KB）で、これ1枚を読むだけで動く。消費側に Tailwind v4 は不要になり、`@source` の設定ミスで「ビルドは緑のままスタイルが静かに欠ける」失敗モードも消える。

**パッケージ内に定義が無かった CSS を移植した（`components.css`）。** 以下は定義が消費側 insession-app の legacy CSS にしか存在せず、publish された中身だけでは完成していなかった。そのため **insession-app の外では静かに崩れていた**:

- `.modal` / `.modal-backdrop` / `.modal-close` / `.modal h2` → Modal の既定経路（`title`/`footer` を渡さない呼び方）と、それに載る ConfirmModal / ProfileModal
- `.bottom-sheet*` → BottomSheet 全体
- `.google-icon` → GoogleIcon
- `@keyframes card-in` / `fade-in` / `pop-in` / `snackbar-in` / `ring-timer-urgent-pulse` → Modal / BottomSheet / Badge / Toast(snackbar) / RingTimer のアニメーション

**その他:**

- `base.css` を追加。コンポーネントが前提にする最小リセット（`box-sizing` とフォームコントロールのフォント継承）のみを `@layer base` に持つ。Tailwind の preflight は消費側のページ全体を書き換えるので配らない。
- `--radius-sheet: 22px` をトークンに追加（BottomSheet が参照する）。
- `scripts/check-styles.mjs` を追加し CI に組み込んだ。「クラス名は DOM に出るのに CSS が無い」欠損を機械的に検出する。
- Storybook を「消費側と同じ経路」（`dist/styles.css` のみからコンポーネントを描く）に変更した。従来はカタログ側で独自にユーティリティを生成していたため、上記の欠損を見逃す構造だった。
- BottomSheet の × 閉じるボタンに flex の中央揃えを足した（移植元はグリフが左上に寄っていた）。既存の消費側 insession-app は自分の legacy CSS で描画を続けるため影響を受けない。

**破壊的変更ではない。** 従来方式（`theme.css` + `@source`）はそのまま動く。ただしその方式を続ける場合は、上記の部品 CSS を得るために `@insession/design-system/components.css` の import を足すこと。
