---
'@insession/design-system': major
---

残りのプリミティブを Base UI へ移行し、`useDismiss` を削除した（#33）

棚卸ししたところ、振る舞いを持つプリミティブがまだ残っていた。ここで片付けて **DS のプリミティブはすべて Base UI ベース**になった（#6 オーバーレイ → #22 フォーム系 → #23 BottomSheet / Toast → 本 PR）。

## 破壊的変更

### `useDismiss` を削除した

`Popover` を Base UI 化（#6）した時点で役目を終えており、**DS 内の利用はゼロ**だった（`index.ts` から export だけが残っていた）。消費側がまだ import している場合は、`Popover.Root` の `closeOnEsc` / `closeOnOutside`、または Base UI の `useDismiss` 相当へ置き換えること。

### `Stepper` は値が `<input>` になった

表示専用の `<span>` から `NumberField.Input` に変わり、**値を直接編集できる**ようになった。`value` / `min` / `max` / `step` / `onChange` / `disabled` / `decLabel` / `incLabel` はそのまま。`valueLabel`（入力欄の aria-label）を追加した — 編集可能になったので、何の数値なのかを支援技術へ伝えるために渡すことを推奨する。

## 得られたもの

| | 移行先 | 効果 |
| --- | --- | --- |
| `Stepper` | `number-field` | **矢印キー（↑↓）で増減できる**（PageUp/Down は largeStep）。値の直接入力。min/max による端の disabled 判定と clamp が自動に（移行前は `disabled={disabled \|\| value <= min}` と `Math.min/max` を手書きしていた） |
| `Avatar` | `avatar` | **壊れた `src` で fallback 円に切り替わる**。移行前は無条件で `<img>` を描いていたため、URL が壊れていても画像が割れたまま残った |
| `SearchField` | `field` + `input` | **#22 の取りこぼしだった。** label と control が自動で紐付く。Input と見た目の定数を共有し、二重管理を解消 |
| `Button` / `IconButton` | `button` | `focusableWhenDisabled` が使えるようになった（**disabled なボタンはキーボードナビから消える**問題への対処）。`render` prop で `<a>` 等に差し替えも可能 |
| `RingTimer` | `progress` | `role="progressbar"` + `aria-valuenow/min/max` + `aria-valuetext` が付いた。描画は従来どおり conic-gradient |
| `StepFlow` | （Base UI ではなくネイティブ） | `<ol>`/`<li>` + `aria-current="step"`。下記参照 |

## `StepFlow` は Progress に載せなかった

当初 `progress` へ載せる想定だったが、**`role="progressbar"` は不適切**と判断して見送った。progressbar は「40% 完了」のような単一の数値を伝えるロールで、**要素の中身が読み上げ対象から外れる**。StepFlow が伝えたいのは「どのステップに居るか」という**ラベル付きの位置**なので、数値に潰すと情報が減る。

代わりにネイティブの正しいセマンティクス（順序付きリスト + `aria-current="step"`）を与えた。移行前は素の `<div>` の入れ子で、順序も現在位置も伝わっていなかった。見た目は変わらない（`list-none` / `m-0` / `p-0` でマーカーと既定余白を消している。実測で確認済み）。

## `Avatar` は DS 経路だけ移行した

**legacy 経路（`status` / `ring` を使わない呼び出し）は据え置き。** 「素の img/span を返す」後方互換に消費側の `.avatar` / `.auth-avatar` が依存しており、`Avatar.Root` でラップすると DOM が1階層増えて既存の CSS セレクタが外れるため。同じ理由で、legacy 経路には fallback 切り替えも入らない（後方互換とのトレードオフ）。

なお DS 経路では、画像の有無に関わらず Root に背景色を置くようにした（移行前は `src` があるとき `bg-transparent`）。読み込み失敗時に fallback の文字が地なしで出てしまうため。**透過 PNG のときだけ移行前と差が出る**が、fallback が成立する方を優先した。

## 移行時の落とし穴

**`focusableWhenDisabled` を使うと `disabled` 属性が `aria-disabled` に置き換わる**（`utils/useFocusableWhenDisabled.js`）。そのとき CSS の `:disabled` / `:enabled` 疑似クラスはマッチしなくなり、**disabled が視覚的に無効化されないうえ hover まで効いてしまう**。`Button` / `IconButton` / `Stepper` のボタンは `disabled:` / `enabled:hover:` をやめ、**`data-disabled:` / `hover:not-data-disabled:`** に統一した（Base UI Button は state の disabled を常に `data-disabled` として出すので、これで両方の経路を1つの書き方で拾える）。

**`FIELD_BOX_BASE` から縦 padding を外した。** Input / Textarea は `py-3`、SearchField は `py-2.5` と一段浅いが、共通側に `py-3` を持たせると呼び出し側の `py-2.5` では打ち消せない（同一プロパティのユーティリティは配布 CSS の出力順で決まる。#21 と同じ構図で、実測でも `py-3` が勝って padding が 12px になっていた）。**縦 padding は各コンポーネントが必ず自分で指定する**契約にした。

**`check-styles.mjs` はコメント内のクラス属性も実クラス名として拾う。** ソースを正規表現で走査するため、コメントに例を書くと存在しないクラスで検査が落ちる（実際に踏んだ）。

## 別途対応が必要な発見（#35 に切り出した）

**`border-[1.5px]` が配布 CSS に生成されていない。** `Input` / `Textarea` / `SearchField` の field 枠は 1.5px のつもりだが、実測では **1px** で描かれている（`dist/styles.css` に `.border-\[1\.5px\]` が 0 件）。**移行前から同じ**なので本 PR による回帰ではないが、DS 全体で意図した枠幅が出ていない。直すと見た目が変わる（1px → 1.5px）ため、意図的な変更として別途判断する。`check:styles` は任意値クラスを検査対象にしていないので、この種の欠損を今後も拾えない点も #35 に含めた。
