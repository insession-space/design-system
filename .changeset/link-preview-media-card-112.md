---
'@insession/design-system': minor
---

`LinkPreview` を `MediaCard` ベースに作り替える（#112）。**見た目が変わる。**

実アプリ（InSession の space チャット）で読みづらいという問題が2つ出たため:

1. **テキスト全体に下線が入っていた。** カード全体を1つの `<a>` にしているが、`<a>` にはブラウザ既定の下線が残る（配布 CSS に preflight の `a` リセットが無い）。`text-decoration` は**祖先から子孫のインラインボックスへ描画される**ので、中の `<span>` で `text-decoration: none` を書いても線は消えない。→ 根に `no-underline` を当てた（これが唯一の正しい対処）。
2. **画像がアスペクト比に収まらなかった。** 画像枠に `aspect-[1.91/1]`（arbitrary value）を使っていたため、消費側の Tailwind の生成に乗らず縦長の OG 画像がそのまま出て、チャットのログが1件のプレビューで埋まっていた。→ `MediaCard` のカバー枠（`aspect-video` + `overflow-hidden` + full-bleed）に委譲した。標準ユーティリティなので消費側での生成漏れが起きない。

**変更点:**

| 以前 | 現在 |
| --- | --- |
| `Surface` + 自前の画像枠 + サイト名 / タイトル / 説明の3行 | `MediaCard` に委譲 |
| 画像は 1.91:1（arbitrary value） | カバーは **16:9**（`aspect-video`・full-bleed） |
| タイトル・説明とも `line-clamp-2` | タイトル・メタとも **1行 truncate** |
| 説明文を表示 | **表示しない**（縦幅を食わないため。`LinkPreviewMeta` の型からは消していない） |
| サイト名 → タイトル の順 | **タイトル**（太字）→ **サイト名**（メタ行）の順 |

タイトルが無いページでは空のタイトル行を出さず、サイト名（またはホスト名）を主役に繰り上げる。

a11y は据え置き — OG 画像は装飾（`alt=""` / `aria-hidden`）、リンクのアクセシブル名は「タイトル + サイト名」。`loading` も `MediaCard` と同じ形（カバー + タイトル + メタ）の Skeleton にした。
