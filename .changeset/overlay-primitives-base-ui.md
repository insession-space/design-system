---
'@insession/design-system': major
---

オーバーレイ系プリミティブ（BottomSheet / Toast）を Base UI へ移行した（#23）

これで DS のプリミティブは**すべて Base UI ベース**になった（#6 でオーバーレイ、#22 でフォーム系、本 PR で残り）。

## `BottomSheet` — Base UI の Drawer へ（**props は非破壊**）

`open` / `onClose` / `ariaLabel` / `closeLabel` / `closeOnEsc` は移行前と同じ。内部で捨てたものが大きい。

- **Pointer Events による自前のドラッグ実装（約60行）** — `setPointerCapture` / `pointermove` / スナップ計算を全部やめ、Drawer の `snapPoints={[0.68, 0.94]}` に置き換えた（`MID_RATIO` / `FULL_RATIO` の値はそのまま）
- `window` への `keydown` リスナーによる Esc close → Drawer 標準
- backdrop クリック + 中身側の `stopPropagation` → `Drawer.Backdrop` 標準
- `if (!open) return null` の手動アンマウント → `Drawer.Portal`

併せて、移行前に無かった**フォーカストラップ・スクロールロック・閉じた後のフォーカス復帰**が付いた。

高さの扱いが変わっている（見た目の結果は同じ）。移行前は `mode('mid'|'full')` を state で持って `.bottom-sheet--mid`(68dvh) / `--full`(94dvh) を切り替えていたが、**高さは常にフル（94dvh）にして「どこまでせり出すか」を transform で表現する**方式にした。`.bottom-sheet--mid` は使わなくなったので削除した。

> ⚠ **Base UI の Drawer は位置を自分で当てず、CSS 変数として出すだけ。** `components.css` の `.bottom-sheet` に `transform: translateY(calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px)))` を足して反映している。これを書かないと**シートが常にフルハイトで表示される**（型検査もビルドも通る）。

`SplitModal` は BottomSheet / Modal の API が変わっていないため**変更不要**（768px 以下のドリルダウン維持を実測で確認）。

## `Toast` — Base UI の Toast へ（**破壊的変更**）

**`<Toast title=… />` を自分で置く使い方は廃止した。** Base UI の Toast は「Provider が持つキューに add して Viewport が描画する」命令的 API で、`ToastRoot` は `toast` オブジェクトと ToastProviderContext を要求するため、見た目部品として単体で置くことはできない。

```tsx
// 2.x — 表示制御は消費側が useState で持っていた
{show && <Toast tone="success" title="保存しました" onClose={() => setShow(false)} />}

// 3.0 — アプリのルートに Provider + Viewport を1度だけ置く
<Toast.Provider>
  <App />
  <Toast.Viewport />
</Toast.Provider>

// 呼び出し側
const toast = Toast.useToast();
toast.add({ title: '保存しました', description: '…', data: { tone: 'success' } });
```

`tone` / `variant` / `icon` は `data` に載せる（`ToastData` 型）。`variant='snackbar'` の legacy 互換パレットは維持し、**ピクセル同一を実測で確認済み**（pill / `radius 999px` / `bg rgba(16,22,25,.94)`）。

得られたもの: **キュー管理・`timeout` による自動 dismiss・スワイプで閉じる・複数トーストの重ね表示・aria-live リージョンへの通知**。移行前は `role="status"` を要素に直接置いていただけで、後から出たトーストが読み上げられる保証が無かった。

> ⚠ DS は本来「アプリ依存を持たない純粋 leaf UI」の方針だが、**Toast だけは Provider を持つ**（＝消費側のアプリ構造に踏み込む）。キュー管理を伴う通知はアプリ全体で1つの出口を共有する必要があり、部品単体では成立しないため。方針からの意図的な逸脱。

## 移行時の落とし穴

**`useToastManager` はトップレベルからは型としてしか export されていない**（`@base-ui/react/toast` の `index.d.ts` が `export type * from "./useToastManager.js"`）。値として使うには名前空間経由（`Toast.useToastManager`）で参照する。

## カタログ（Storybook）についての注意

`Components/Toast` のカタログ上では **DS トーストの左3px tone ボーダーが 1px の既定ボーダー色で表示される**。`.storybook/preview.css` が `dist/styles.css` を読んだ**後に** stories 用のユーティリティを追加生成する構成のため、stories が使っている `.border`（`border-width: 1px`）が `.border-l-[3px]` より後に出力されて勝つのが原因。**配布 CSS だけを読む消費側では正しく 3px / tone 色が出る**ことを実測で確認済み（この現象は移行前の Toast も同じクラス構成だったため、本 PR による回帰ではない）。
