---
'@insession/design-system': minor
---

`UploadTile` / `ColorSwatchGroup` / `ColorInput` / `ListRow` / `AppleIcon` を追加した（#53）

`Slider` / `SegmentedControl` / `ToggleGroup` に続く後半4種。いずれも消費側（insession-app）が legacy CSS や打ち消しユーティリティで手組みしていたものを DS に上げたもの。

- **`UploadTile`** — 破線タイル + 隠しファイル入力。消費側はこの構造を**8箇所で手組み**しており（コミュニティのスタンプ追加 ×2 / カバー画像 / スタンプピッカー ×2 / 個人設定 ×3）、`min-h-35` と `min-h-[172px]` のように寸法だけが揺れていた。ドラッグ&ドロップにも対応する（`dragenter` / `dragleave` は子要素を跨ぐたびに発火するので深さを数える。数えないと子の上を通過した瞬間に枠がちらつく）。⚠ `<button>` の中に `<input>` を入れずに **`<label>` を面にした** — インタラクティブ要素の入れ子は HTML 仕様違反でクリックが二重発火する。label なら `input.click()` の呼び出しすら不要になる。
- **`ColorSwatchGroup` / `ColorInput`** — パレット選択（Base UI の `radio-group` 委譲）と任意色選択。消費側は `whiteboard-color-input` と `canvas-relay-draw-swatch` という**同じ構造の legacy CSS を2セット**持っていた。⚠ `<input type="color">` はブラウザ既定の枠・余白をベンダー別疑似要素でしか消せないため、**input を親より一段大きく広げ、親の `overflow-hidden` で既定の枠を切り落とす**実装にした（配布 CSS にベンダー疑似要素のルールを足さずに済む）。
- **`ListRow`** — 画面内に置くクリックできる行。`MenuPlainItem` とは別部品にした。`MenuPlainItem` は `role="menu"` の中の `role="menuitem"` として振る舞う前提で、**メニュー外に置くとセマンティクスが嘘になる**（メニューでないものを menu として読み上げる）。消費側は同じ形を `bg-transparent border-none shadow-none p-0` のような**打ち消しユーティリティの列**で毎回書いていた（打ち消しが必要なのは legacy の素の `button {}` が塗りと padding を与えているため）。
- **`AppleIcon`** — `GoogleIcon` と対になる部品。DS に Google だけがあり Apple が無かったため、消費側が `user-signin-apple-btn` として手組みしていた。⚠ 色は `currentColor` に従わせる（Apple の HIG が「黒地には白、白地には黒」を要求するため。GoogleIcon がブランド多色で固定なのとは事情が違う）。

なお `pnpm check:styles`（DOM に出るクラスに対応する CSS があるかの検査）が `AppleIcon` の `.apple-icon` を「対応ルール無し」で捕まえた。`GoogleIcon` の `.google-icon` は中身が `flex-shrink: 0` の1行だけなので、`AppleIcon` は部品 CSS を増やさず `shrink-0` ユーティリティで書いた。
