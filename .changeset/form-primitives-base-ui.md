---
'@insession/design-system': major
---

フォーム系プリミティブ（Checkbox / Radio / Toggle / Input / Textarea）を Base UI へ移行した（#22）

`@base-ui/react` の `checkbox` / `radio` + `radio-group` / `switch` / `field` へ振る舞いを委譲し、DS 側はトークンベースの見た目だけを持つ構造にした（#6 で Popover / Menu / Modal / ConfirmModal / Tabs に対して行ったのと同じ方針）。**見た目は移行前と同じ**（算出スタイルを実測して確認済み）。

## 破壊的変更

### `Checkbox` — `onChange` → `onCheckedChange`

Base UI の Checkbox は `<button role="checkbox">`（実体は `<span>`）を描画し、フォーム連携用の `<input>` を内部に隠し持つ。DS から `React.ChangeEvent` を組み立てて渡すことはできないため、状態通知を `onCheckedChange(checked)` に変えた。

```tsx
<Checkbox checked={v} onChange={(e) => set(e.target.checked)} />   // 2.x
<Checkbox checked={v} onCheckedChange={(c) => set(c)} />           // 3.0
```

`label` / `disabled` / `name` / `id` / `className` はそのまま。`defaultChecked` / `readOnly` / `required` が使えるようになった。

### `Radio` — 単体コンポーネント → `Radio.Group` + `Radio.Item`

Base UI の Radio は選択状態を親の RadioGroup（`value` / `onValueChange`）から解決する設計で、個々の Radio が `checked` を受け取る形にはできない。矢印キーでのグループ内移動と roving tabIndex（グループ全体で tab stop が1つだけ）は、この構造が前提。

```tsx
// 2.x
{opts.map((o) => (
  <Radio key={o.key} name="visibility" checked={val === o.key}
         onChange={() => setVal(o.key)} label={o.label} />
))}

// 3.0
<Radio.Group name="visibility" value={val} onValueChange={setVal} aria-label="公開範囲">
  {opts.map((o) => <Radio.Item key={o.key} value={o.key} label={o.label} />)}
</Radio.Group>
```

`Radio.Group` は既定で縦積み（`flex flex-col gap-2.5`）。横並びにしたいときは `className` で上書きする。

## 非破壊の変更

- **`Toggle`** — props（`checked` / `onChange`（引数なしトグル）/ `label` / `disabled`）は移行前と完全に同じ。内部が Base UI の Switch になり、隠しネイティブ input による form 連携（`name` / `value` / `form`）と `readOnly` が使えるようになった
- **`Input` / `Textarea`** — props シグネチャは移行前と同じ。内部で `useId` + `htmlFor` の手組みをやめ、Field.Label / Field.Control の自動紐付けに委譲した。`Input` から見た目の定数（`FIELD_LABEL` / `FIELD_BOX_BASE` / `FIELD_CONTROL`）と状態関数（`fieldLabelColor` / `fieldBoxState`）を export し、Textarea と共有するようにした（移行前は同じ文字列を二重に持っていた）

## a11y の改善（実測で確認）

- **エラーが入力欄に紐付くようになった。** `error` を渡すと `aria-invalid="true"` + `aria-describedby` がエラー要素に張られる（移行前は素の `<span>` で、支援技術からエラーが入力欄に紐付いていなかった）
- **Radio に roving tabIndex が付いた。** グループ内の tab stop が1つだけになり、矢印キーで選択を移動できる（移行前は全ての Radio が tab stop で、矢印キーは効かなかった）
- Checkbox / Radio のラベルクリックが Field.Label 経由になった（`<button>` は HTML 仕様上 labelable element ではないため `<label htmlFor>` が使えない）。**二重トグルが起きないことを実測で確認済み**

## 移行時の落とし穴（消費側が同種の実装をするとき用）

**`disabled:` は効かない。`data-disabled:` を使うこと。** Base UI の Checkbox / Radio / Switch が描画するのは `<span>` で（`nativeButton` の既定が false）、CSS の `:disabled` 疑似クラスはフォーム要素にしか適用されない。この移行でも一度踏んでおり、型検査もビルドも通ったまま disabled が視覚的に無効化されない状態になった（実測で `opacity: 1` / `cursor: pointer` のままだった）。

**状態別のクラスは `data-checked:` バリアントではなく `className` の関数形（`(state) => string`）で排他的に出している。** 同一プロパティ（`background-color` / `border-color`）のユーティリティを1つのクラス属性に同時に並べると、勝敗が配布 CSS の出力順で決まってしまうため（#21 / #17 と同じ構図）。

**`cursor` は `<label>` に継承されない。** ラベルテキスト上だけカーソルが変わらない状態になるため、`cursor-[inherit]` を明示して行に追従させている。なお Tailwind に `cursor-inherit` ユーティリティは無く、子孫セレクタ記法（`[&_label]:cursor-pointer`）は**ソース走査で拾われず配布 CSS に生成されなかった**（`check:styles` は素のクラス名しか見ないのでこの欠損を検出できない）。

**disabled が親から降ってくる経路がある。** `<Radio.Group disabled>` では各 `Radio.Item` の `disabled` prop は `undefined` のままなので、それだけを見ると円だけ無効化されてラベル側が通常表示で残る。`has-[>[data-disabled]]`（**直接の子**に限定）で拾っている。子孫全体（`has-[[data-disabled]]`）にすると、ラベル内に `data-disabled` を持つ装飾ノードがあるだけで誤判定する。

## その他

- `Toggle` の `checked` にデフォルト値を持たせていない。常に `checked` を渡すと `Switch.Root` が必ず controlled 扱いになり、`defaultChecked` が無視される（`<Toggle defaultChecked />` が初期 ON にならない）
- Storybook に回帰ネットを追加した: `Controls > Switches`（Toggle は story が無く見た目の回帰を検出できなかった）/ `Controls > RadioGroupDisabled`（親から降る disabled）/ `Controls > Uncontrolled`（`defaultChecked` / `defaultValue`）
- `Checkbox` の `indeterminate` は対応しない（移行前も持っておらず、DS に中間状態のアイコンが無いため）
