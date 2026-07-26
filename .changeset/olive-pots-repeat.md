---
"@insession/design-system": patch
---

内部のディレクトリ構成を整理し、出荷物のソースを `src/` 配下（`components/` / `icons/` / `styles/`）へ集約した。

公開 API と `exports` のキー（`.` / `./styles.css` / `./theme.css` / `./base.css` / `./components.css`）は変更していないため、**消費側の import は一切変わらない**。移行前後で `dist/index.js` の生成コードはバイト単位で同一、`dist/styles.css` も 59,310 バイト・クラス 524 種・`@keyframes` 7 種で完全一致していることを確認済み。
