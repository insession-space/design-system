---
'@insession/design-system': minor
---

面プリミティブに `render` を、`elevation` に直交する `tone` / `shadow` 軸を、余白スケールに `xs.5`（6px）を足す

- **`Surface` / `Paper` / `Card` / `Panel` に `render` プロップ**（Base UI の `useRender`。`SideNav` と同じ流儀）。`<Card render={<button type="button" />} interactive onClick={…}>` で**クリックできるカードを1要素で描ける**ようになり、「リセットした `<button>` > `Surface`」の入れ子と、消費側が書いていた打ち消しユーティリティ（`border-none bg-transparent p-0 shadow-none`）が不要になる。`<button>` の中に `<div>` を置く content model 違反も解消する。UA 既定のボタン外観（`appearance` / マージン / `text-align: center`）の打ち消しは **`render` を渡したときだけ** DS 側で当てる（#56）
- **`Surface` に `tone`（`'default' | 'tint'`）と `shadow`（`'auto' | 'none'`）**。`elevation` の段（1〜4 = Paper / Card / Popover / Modal）は増やさず、面の色だけ・影だけを切る直交軸として足した。消費側が `className="shadow-none"` / `className="bg-tint-5"` と1プロパティだけ上書きしていたパターンを props で表現できる。**新しい影の実値・トークンは追加していない**（#57）
- **`Gap` / `SurfacePadding` に `xs.5`（6px = `gap-1.5` / `p-1.5`）**。`xs`(4px) と `sm`(8px) の間に段が無く `Stack` に載せられなかったレイアウトを吸収する。`2xs` は「`xs` より小さい」と誤読されるため採らない（#57）

既定値は従来と同一なので、**既存の呼び出しの見た目は変わらない**（追加のみ）。
