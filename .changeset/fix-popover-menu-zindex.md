---
"@insession/design-system": patch
---

`Popover` / `Menu` のパネルの `z-index` が無効だったのを直した（#14）

2.0.0 では `POPOVER_POPUP_BASE`（`Popover.Popup` と `Menu.Popup` が共有）に `z-[var(--z-popover-portal,35)]` を当てていたが、**Base UI では `Popup` が `position: static`** で、位置決めをしているのは親の `Positioner` である。CSS 仕様上 `position: static` の要素に `z-index` は効かないため、**指定が完全に無効だった**。

実測（loophub-app で 2.0.0 を動かして確認）:

```
DIV  pos=static     z=35     ← Popup。z-index が付いているが static なので無効
DIV  pos=absolute   z=auto   ← Positioner。位置決めはここ。z-index を持っていなかった
```

パネルの上に **DOM 上で前にある `z-index: 5` の要素**を置くと `elementFromPoint` がその要素を返した = **パネルが覆われた**。

`z-index` を `Positioner`（positioned な要素）へ移した。修正後は同じ手順でパネルが覆われないことを確認済み（`Positioner` が `pos=absolute z=35`、`Popup` は `z=auto`）。

- `POPOVER_POPUP_BASE` から `z-index` のユーティリティを外した
- **`POPOVER_POSITIONER_BASE`** を新設して export し、`Popover.Positioner` と `Menu.Positioner` の既定クラスに当てた。呼び出し側が `className` で上書きできるようマージでは前に置いている
- フォールバック付きの任意値記法（`z-[var(--z-popover-portal,35)]`）は維持（`theme.css` を import しない consumer で `z-index: auto` に落ちないため。#885 由来）

`Modal` / `ConfirmModal` は影響を受けない（`Dialog.Viewport` / `AlertDialog.Viewport` という **positioned な要素**に `zIndex` を当てているため元から正しく効いていた）。重なり順が `--z-modal`(100) > `--z-popover-portal`(35) のままであることも確認済み。

2.0.0 の PR 本文に「非 portal の Popover の z-index を消費側で確認すること」と申し送っていたが、**そもそも値が適用されていなかった**ので、どちらの値でもなかったというのが正確な状態だった。
