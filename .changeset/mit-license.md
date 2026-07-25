---
'@insession/design-system': patch
---

ライセンスを MIT にした（`LICENSE` を追加し、`package.json` の `license` を `UNLICENSED` から `MIT` へ）。

public リポジトリで npm にも公開しているのに `license` が `UNLICENSED`（=「許諾しない」の明示）のままで、**InSession / loophub 以外のプロダクトは法的に採用できない**状態だった。他プロダクトへ配る前提と矛盾していたので改めた。

著作権表示は `Copyright (c) 2026 INSESSION Space`。`LICENSE` は `files` に明示し、CI の npm pack 検査でも同梱を必須にした。
