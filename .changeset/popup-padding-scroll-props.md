---
"@insession/design-system": minor
---

`Popover.Popup` / `Menu.Popup` に `padding` / `scroll` props を足した（#21）

2.0.0 で `panelPadding` / `panelScroll` の専用 props を廃止し「外したい呼び出し側は `className` で `p-0` / `max-h-none overflow-visible` を渡して打ち消す」契約にしたが、**この打ち消しは効かなかった。**

**クラス属性の並び順は CSS の勝敗に無関係で、同一プロパティのユーティリティは配布 CSS の出力順で決まる。** 実測（insession-app の本番ビルド CSS / Tailwind 4.3.2）:

| クラス | 出力位置 | 勝敗 |
| --- | --- | --- |
| `.p-0` | idx 163644 | 負ける |
| `.p-3` | idx 163880 | **これが適用される** |
| `.overflow-visible` | idx 154257 | 負ける |
| `.overflow-y-auto` | idx 154325 | **これが適用される** |
| `.max-h-none` | idx 147707 | たまたま勝つ |

つまり `max-height` だけ偶然効いて padding と overflow は効かない、という一貫性のない状態だった。実害として消費側（insession-app の通知センター / MiniProfile）に **v1 に無かった 12px の padding と内部スクロール**が付いていた。

**「打ち消す」のをやめ、そもそも出さない方式へ戻した。** v1 が `panelPadding` / `panelScroll` という props を持っていたのは正しかった。

```tsx
<Popover.Popup padding={false} scroll={false} className="flex max-h-[220px] flex-col overflow-hidden">
  <div className="shrink-0 border-b border-solid border-border px-4 py-3">固定ヘッダー</div>
  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{items}</div>
</Popover.Popup>
```

- `padding` / `scroll` はどちらも**既定 true**（v1 の `panelPadding` / `panelScroll` と同じ既定）。**既定の見た目は 2.0 から変わらない**ので、既存の呼び出し側は無変更で動く
- `POPOVER_POPUP_BASE` から padding とスクロールを外し、`POPOVER_POPUP_PADDING`（`p-3`）と `POPOVER_POPUP_SCROLL`（`max-h-80 overflow-y-auto`）として分離・export した
- `Popover.Popup` と `Menu.Popup` で組み立てを共有する（`popupBase` / `mergePopupClassName`）
- **Base UI の `className` は `string | ((state) => string)` の union を受ける**ので、関数形をそのまま文字列連結して関数の実装がクラス名に埋め込まれないよう、形ごとに分けて合成している
- `README.md` に「`className` では打ち消せない」理由を実測つきで明記し、`padding` / `scroll` の使い方を追記した
- Storybook に `Popover / Panel Options` story を追加（既定 / `padding={false}` / `padding={false} scroll={false}` を並べて比較できる）

修正後の実測（Storybook / 算出スタイル）:

| story | padding | max-height | overflow-y |
| --- | --- | --- | --- |
| 既定 | 12px | 320px | auto |
| `padding={false}` | **0px** | 320px | auto |
| `padding={false} scroll={false}` | **0px** | **220px**（独自指定） | **hidden** |

これにより消費側は Tailwind v4 の important 接尾辞（`p-0!`）に頼らなくてよくなる（insession-app は現在その回避策を使っている。insession-space/insession-app#1107）。
