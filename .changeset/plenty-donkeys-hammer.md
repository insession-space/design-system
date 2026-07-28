---
'@insession/design-system': minor
---

a11y: キーボードフォーカスを可視化し、モーション抑制と強制カラーモードを DS 単体で完結させる (#121)

**フォーカスリングが実質不可視だったのを修正した。** `--shadow-focus` は α が 0.16 しかなく、背景へ合成した実効コントラストが 1.16〜1.25:1（WCAG 1.4.11 は 3:1 必須）しかない。それを 17 部品が `focus-visible:outline-none` と併記していたため、ブラウザ既定の可視アウトラインを消したうえで見えないリングに差し替える形になっており、キーボードユーザーはフォーカス位置を判別できなかった。

既に定義済みで基準を満たしていた `--color-focus-ring`（dark 5.71:1 / light 4.63:1）・`--focus-ring-width`・`--focus-ring-offset` をトークン参照のまま使うアウトラインへ置き換えた。値の単一ソースは `theme.css` のままで、部品側に `2px` 等の直書きはしない。フォーカスしていない通常表示のレンダリング結果は変わらない。

代替のフォーカス表現を持たず完全に不可視だった `Stepper` の数値入力と `Composer` にもフォーカス表示を追加した（Composer は器側に `focus-within` で出す。`Input` / `Textarea` / `SearchField` は従来どおり枠色の変化で示す）。

**`prefers-reduced-motion` の抑制を DS の配布物だけで完結させた。** Spinner の回転・RingTimer の脈動・各部品のトランジションは、ソースコメントに反して消費側アプリの `style.css` にしか抑制規則が無く、DS のプリビルド CSS だけを読む loophub・DS 単体利用・Storybook では止まっていなかった（RingTimer の脈動は無限アニメーション）。抑制を部品のクラス文字列側に持たせ、取り込み方（`@source` 方式 / プリビルド CSS 方式）に依らず届くようにした。実態と食い違っていたコメントも修正した。

**`forced-colors`（Windows ハイコントラスト）に対応した。** 強制カラーモードでは `background-color` と `box-shadow` が無効化されるため、面の色だけで状態を示していた SegmentedControl / ToggleGroup の選択中は判別不能だった。選択中・チェック済み・オン・ハイライト行をシステム色で示し、無効状態は `GrayText` へ寄せた。
