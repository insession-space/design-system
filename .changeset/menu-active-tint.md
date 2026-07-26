---
"@insession/design-system": patch
---

メニューの `active` 行の green tint が表示されていなかったのを直した（#17）

`Menu.Item` / `RadioItem` / `CheckboxItem` / `PlainItem` に `active` を渡したとき、テキスト色（green）は出るのに**背景の tint（`--color-success` 10%）が出ていなかった**。

**これは 2.x の回帰ではなく 1.x から続いていた不具合。** #9 の移行作業中に実測で気づいたが、当時は「振る舞いの委譲のみで見た目は変えない」方針だったため changeset に記録だけ残していた。

## 原因

行の基底クラス（`MENU_ROW_BASE`）に `bg-transparent` があり、`active` 分岐の tint と**同じクラス属性に両方が並んでいた**。どちらもクラス1つで特異度が同じなので、勝敗は**配布 CSS の出力順**で決まる。

```
color-mix(in srgb,var(--color-success) 10%,transparent)  idx=20987   ← 負ける
.bg-transparent                                          idx=22906   ← 後勝ち
```

結果、**「静止時は tint なし、hover / キーボードハイライト時だけ tint が出る」**という中途半端な状態になっていた（`hover:` / `data-highlighted:` のバリアント付きルールは出力順が後なので勝つ）。

## 直し方

**`MENU_ROW_BASE` から `bg-transparent` を外し、`toneClassName` / `plainToneClassName` が背景を排他的に出す**形にした（`active` なら tint、それ以外なら `bg-transparent`）。

`bg-transparent` を単に落とすだけにしないのは、DS が preflight を配っていないため `PlainItem`（`<button>`）に UA 既定の `buttonface` 背景が残るから。排他で出せば両方満たせる。

## 修正後の実測（Storybook / 算出スタイル）

| 行 | 描画要素 | 背景 |
| --- | --- | --- |
| `active` な `Menu.Item` | `<div>` | **`color(srgb 0.192 0.769 0.494 / 0.1)`** |
| `active` な `RadioItem` / `CheckboxItem` | `<div>` | **同上** |
| `active` な `PlainItem` | `<button>` | **同上** |
| 非 `active` の行 | 両方 | `rgba(0, 0, 0, 0)` |
| `danger` 行 | 両方 | 透明・文字色 `rgb(255, 107, 107)` を維持 |

hover / キーボードハイライト時の 20% tint も引き続き出るので、**静止 10% → ハイライト 20%** で区別が付く状態は保たれている。
