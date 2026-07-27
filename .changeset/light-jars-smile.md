---
'@insession/design-system': minor
---

`SideNav` のリンクから UA 既定の下線を取り除き、打ち消しを `Link` に一元化する。

- `SideNav.Account` の `href` 付きメニュー項目を DS の `Link` で描くようにした。DS は preflight を配らないため、素の `<a>` では下線が残っていた（`Menu` の行クラスは `no-underline` を持たない）
- `SideNav.Brand` の下線打ち消しも `linkClass` 由来にした
- `Link` に **`bare` variant** を追加した（`no-underline cursor-pointer`。色を出さない）。`wrapper` の `text-inherit` は、自前の色クラスを持つ要素（`Menu.Item` の tone など）へ重ねると特異度が同じで配布 CSS の出力順しだいに色を潰す（実測で `danger` の警告色が消えた）。色を持つ要素へ下線打ち消しだけを足すときは `bare` を使う
- `Link` の `children` を任意にした。Base UI の `render` に渡す器として使う場合（`<Menu.Item render={<Link variant="bare" href="…" />}>`）、children は Base UI 側が注入するため
