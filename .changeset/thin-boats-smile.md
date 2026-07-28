---
"@insession/design-system": major
---

アクセント塗りの上のラベルを白へ戻し、accent ボタンの塗りを accent 本体へ戻した（#122 / #130 の撤回）。

- `--color-on-accent` を `#17160f`（ダークインク）から `#ffffff` へ戻した。ToggleGroup / StepFlow / FeedItem / Button / IconButton など、`text-on-accent` を使う箇所すべてが白抜きになる。
- `--color-accent-fill`（dark `#df7e67` / light `#d65a3f`）を**削除**し、Button の accent variant の塗りを `bg-accent` へ戻した。DS 内外に他の利用箇所は無い（消費側の実使用ゼロを実測）。

⚠ **breaking**: `--color-accent-fill` / `bg-accent-fill` は解決されなくなる。また、この組み合わせ（accent 塗り + 白ラベル）は WCAG 1.4.3 の 4.5:1 を意図的に満たさない（dark 2.84:1 / light 3.10:1）。コントラストを上げる必要が出たときは、ラベルを暗インクに戻すのではなく塗り側（accent）を暗くすること。
