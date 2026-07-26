# @insession/design-system

## 3.2.0

### Minor Changes

- 3af9806: フィードの 1 件分を組み立てる複合コンポーネント `FeedItem` / `FeedItemAttachment` を追加した。

  プリミティブ（`src/components/`）と区別するため、複合コンポーネントの置き場所として `src/ui-kit/` を新設した。Storybook のカテゴリは `UI Kit/`。

  `FeedItem` は見た目だけを持ち、文言の解決（i18n）・データ更新・画面遷移は呼び出し側の責務にしている。`timeLabel` / `message` は整形済みの文字列を受け取り、アバター・サムネイル・アクションはスロットで差す。

### Patch Changes

- 65a2dab: `PageHeader` の `title` に ReactNode を渡せなかったのを修正した。`PageHeaderProps` が `Omit<ComponentProps<'div'>, 'className'>` を広げていたため、HTML の `title` 属性(`string`)と `title: ReactNode` が交差して `ReactNode & string` に潰れ、要素を渡すと型エラーになっていた（アイコンやブランドドット付きの見出しが書けない）。`title` も Omit するようにした。

  他のプリミティブの props（`gap` / `align` / `padding` / `elevation` / `size` / `wrap` など）は `div` の HTMLAttributes に同名が無く衝突しないことを型レベルで確認済み。

## 3.1.0

### Minor Changes

- c85149c: BottomSheet に `defaultSnapPoint` を追加する

  開いた直後の高さを `'mid'`(既定・従来どおり) / `'full'` から選べるようにした。

  Popup の高さは常にフル(94dvh)で、snapPoint までの差分は `translateY()` で押し下げて表現している。
  そのため `'mid'` では **Popup の下端 26dvh 分がビューポートの外に出る**。中身が「上から順に読む
  リスト」なら問題にならないが、**下端に固定された入力欄や送信ボタンは画面外に落ちて、ユーザーが
  一度シートを上へスワイプするまで触れない**。insession-app のモバイルチャットで実際にこれを踏んで
  いた（ビューポート 844px に対し入力欄が 955..1063px = 完全に画面外。`'full'` なら 736..844px）。

  スナップ先自体は `'mid'` / `'full'` の 2 点で従来と変わらず、既定値も `'mid'` なので既存の
  消費側の挙動は変わらない。

- f1a14b6: 画面骨格プリミティブ(`AppBar` / `Toolbar` / `PageHeader` / `PageLayout` / `Footer`)を追加した。既存のレイアウト(`Stack` 系)/ Surface プリミティブを組み合わせて作っており、新しい並び・面のロジックは持たない。あわせて README に新プリミティブ一覧・elevation スケールの対応表・Tailwind 直書きからの移行ガイドを追記した。
- f1a14b6: 面プリミティブ(`Surface` / `Paper` / `Card` / `Panel`)と、`theme.css` に elevation スケール(`--shadow-elevation-0`〜`4`。既存の `--shadow-soft` / `-popover` / `-overlay` を参照する別名トークンで、新しい影の実値は追加していない)を追加した。`elevation` プロパティ 1 つで背景/境界/影の 3 点セットが決まり、既存の Card(2) / Popover・Menu(3) / Modal(4) と同じ組に対応する。
- f1a14b6: レイアウトプリミティブ（`Stack` / `VStack` / `HStack` / `Grid` / `Spacer` / `Divider` / `Center` / `Container`）を追加した。`gap`（Stack / Grid）と `columns`（Grid）はブレークポイント別に指定できるレスポンシブ値（`Responsive<T>`）を受け付ける。

## 3.0.1

### Patch Changes

- 83fdff4: 内部のディレクトリ構成を整理し、出荷物のソースを `src/` 配下（`components/` / `icons/` / `styles/`）へ集約した。

  公開 API と `exports` のキー（`.` / `./styles.css` / `./theme.css` / `./base.css` / `./components.css`）は変更していないため、**消費側の import は一切変わらない**。移行前後で `dist/index.js` の生成コードはバイト単位で同一、`dist/styles.css` も 59,310 バイト・クラス 524 種・`@keyframes` 7 種で完全一致していることを確認済み。

## 3.0.0

### Major Changes

- 37c20fe: フォーム系プリミティブ（Checkbox / Radio / Toggle / Input / Textarea）を Base UI へ移行した（#22）

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

  Base UI の Radio は選択状態を親の RadioGroup（`value` / `onValueChange`）から解決する設計で、個々の Radio が `checked` を受け取る形にはできない。矢印キーでのグループ内移動と roving tabIndex（グループ全体で tab stop が 1 つだけ）は、この構造が前提。

  ```tsx
  // 2.x
  {
    opts.map((o) => (
      <Radio
        key={o.key}
        name="visibility"
        checked={val === o.key}
        onChange={() => setVal(o.key)}
        label={o.label}
      />
    ));
  }

  // 3.0
  <Radio.Group
    name="visibility"
    value={val}
    onValueChange={setVal}
    aria-label="公開範囲"
  >
    {opts.map((o) => (
      <Radio.Item key={o.key} value={o.key} label={o.label} />
    ))}
  </Radio.Group>;
  ```

  `Radio.Group` は既定で縦積み（`flex flex-col gap-2.5`）。横並びにしたいときは `className` で上書きする。

  ## 非破壊の変更

  - **`Toggle`** — props（`checked` / `onChange`（引数なしトグル）/ `label` / `disabled`）は移行前と完全に同じ。内部が Base UI の Switch になり、隠しネイティブ input による form 連携（`name` / `value` / `form`）と `readOnly` が使えるようになった
  - **`Input` / `Textarea`** — props シグネチャは移行前と同じ。内部で `useId` + `htmlFor` の手組みをやめ、Field.Label / Field.Control の自動紐付けに委譲した。`Input` から見た目の定数（`FIELD_LABEL` / `FIELD_BOX_BASE` / `FIELD_CONTROL`）と状態関数（`fieldLabelColor` / `fieldBoxState`）を export し、Textarea と共有するようにした（移行前は同じ文字列を二重に持っていた）

  ## a11y の改善（実測で確認）

  - **エラーが入力欄に紐付くようになった。** `error` を渡すと `aria-invalid="true"` + `aria-describedby` がエラー要素に張られる（移行前は素の `<span>` で、支援技術からエラーが入力欄に紐付いていなかった）
  - **Radio に roving tabIndex が付いた。** グループ内の tab stop が 1 つだけになり、矢印キーで選択を移動できる（移行前は全ての Radio が tab stop で、矢印キーは効かなかった）
  - Checkbox / Radio のラベルクリックが Field.Label 経由になった（`<button>` は HTML 仕様上 labelable element ではないため `<label htmlFor>` が使えない）。**二重トグルが起きないことを実測で確認済み**

  ## 移行時の落とし穴（消費側が同種の実装をするとき用）

  **`disabled:` は効かない。`data-disabled:` を使うこと。** Base UI の Checkbox / Radio / Switch が描画するのは `<span>` で（`nativeButton` の既定が false）、CSS の `:disabled` 疑似クラスはフォーム要素にしか適用されない。この移行でも一度踏んでおり、型検査もビルドも通ったまま disabled が視覚的に無効化されない状態になった（実測で `opacity: 1` / `cursor: pointer` のままだった）。

  **状態別のクラスは `data-checked:` バリアントではなく `className` の関数形（`(state) => string`）で排他的に出している。** 同一プロパティ（`background-color` / `border-color`）のユーティリティを 1 つのクラス属性に同時に並べると、勝敗が配布 CSS の出力順で決まってしまうため（#21 / #17 と同じ構図）。

  **`cursor` は `<label>` に継承されない。** ラベルテキスト上だけカーソルが変わらない状態になるため、`cursor-[inherit]` を明示して行に追従させている。なお Tailwind に `cursor-inherit` ユーティリティは無く、子孫セレクタ記法（`[&_label]:cursor-pointer`）は**ソース走査で拾われず配布 CSS に生成されなかった**（`check:styles` は素のクラス名しか見ないのでこの欠損を検出できない）。

  **disabled が親から降ってくる経路がある。** `<Radio.Group disabled>` では各 `Radio.Item` の `disabled` prop は `undefined` のままなので、それだけを見ると円だけ無効化されてラベル側が通常表示で残る。`has-[>[data-disabled]]`（**直接の子**に限定）で拾っている。子孫全体（`has-[[data-disabled]]`）にすると、ラベル内に `data-disabled` を持つ装飾ノードがあるだけで誤判定する。

  ## その他

  - `Toggle` の `checked` にデフォルト値を持たせていない。常に `checked` を渡すと `Switch.Root` が必ず controlled 扱いになり、`defaultChecked` が無視される（`<Toggle defaultChecked />` が初期 ON にならない）
  - Storybook に回帰ネットを追加した: `Controls > Switches`（Toggle は story が無く見た目の回帰を検出できなかった）/ `Controls > RadioGroupDisabled`（親から降る disabled）/ `Controls > Uncontrolled`（`defaultChecked` / `defaultValue`）
  - `Checkbox` の `indeterminate` は対応しない（移行前も持っておらず、DS に中間状態のアイコンが無いため）

- 9849eff: オーバーレイ系プリミティブ（BottomSheet / Toast）を Base UI へ移行した（#23）

  これで DS のプリミティブは**すべて Base UI ベース**になった（#6 でオーバーレイ、#22 でフォーム系、本 PR で残り）。

  ## `BottomSheet` — Base UI の Drawer へ（**props は非破壊**）

  `open` / `onClose` / `ariaLabel` / `closeLabel` / `closeOnEsc` は移行前と同じ。内部で捨てたものが大きい。

  - **Pointer Events による自前のドラッグ実装（約 60 行）** — `setPointerCapture` / `pointermove` / スナップ計算を全部やめ、Drawer の `snapPoints={[0.68, 0.94]}` に置き換えた（`MID_RATIO` / `FULL_RATIO` の値はそのまま）
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
  {
    show && (
      <Toast
        tone="success"
        title="保存しました"
        onClose={() => setShow(false)}
      />
    );
  }

  // 3.0 — アプリのルートに Provider + Viewport を1度だけ置く
  <Toast.Provider>
    <App />
    <Toast.Viewport />
  </Toast.Provider>;

  // 呼び出し側
  const toast = Toast.useToast();
  toast.add({
    title: "保存しました",
    description: "…",
    data: { tone: "success" },
  });
  ```

  `tone` / `variant` / `icon` は `data` に載せる（`ToastData` 型）。`variant='snackbar'` の legacy 互換パレットは維持し、**ピクセル同一を実測で確認済み**（pill / `radius 999px` / `bg rgba(16,22,25,.94)`）。

  得られたもの: **キュー管理・`timeout` による自動 dismiss・スワイプで閉じる・複数トーストの重ね表示・aria-live リージョンへの通知**。移行前は `role="status"` を要素に直接置いていただけで、後から出たトーストが読み上げられる保証が無かった。

  > ⚠ DS は本来「アプリ依存を持たない純粋 leaf UI」の方針だが、**Toast だけは Provider を持つ**（＝消費側のアプリ構造に踏み込む）。キュー管理を伴う通知はアプリ全体で 1 つの出口を共有する必要があり、部品単体では成立しないため。方針からの意図的な逸脱。

  ## 移行時の落とし穴

  **`useToastManager` はトップレベルからは型としてしか export されていない**（`@base-ui/react/toast` の `index.d.ts` が `export type * from "./useToastManager.js"`）。値として使うには名前空間経由（`Toast.useToastManager`）で参照する。

  ## カタログ（Storybook）についての注意

  `Components/Toast` のカタログ上では **DS トーストの左 3px tone ボーダーが 1px の既定ボーダー色で表示される**。`.storybook/preview.css` が `dist/styles.css` を読んだ**後に** stories 用のユーティリティを追加生成する構成のため、stories が使っている `.border`（`border-width: 1px`）が `.border-l-[3px]` より後に出力されて勝つのが原因。**配布 CSS だけを読む消費側では正しく 3px / tone 色が出る**ことを実測で確認済み（この現象は移行前の Toast も同じクラス構成だったため、本 PR による回帰ではない）。

- bedd05c: 残りのプリミティブを Base UI へ移行し、`useDismiss` を削除した（#33）

  棚卸ししたところ、振る舞いを持つプリミティブがまだ残っていた。ここで片付けて **DS のプリミティブはすべて Base UI ベース**になった（#6 オーバーレイ → #22 フォーム系 → #23 BottomSheet / Toast → 本 PR）。

  ## 破壊的変更

  ### `useDismiss` を削除した

  `Popover` を Base UI 化（#6）した時点で役目を終えており、**DS 内の利用はゼロ**だった（`index.ts` から export だけが残っていた）。消費側がまだ import している場合は、`Popover.Root` の `closeOnEsc` / `closeOnOutside`、または Base UI の `useDismiss` 相当へ置き換えること。

  ### `Stepper` は値が `<input>` になった

  表示専用の `<span>` から `NumberField.Input` に変わり、**値を直接編集できる**ようになった。`value` / `min` / `max` / `step` / `onChange` / `disabled` / `decLabel` / `incLabel` はそのまま。`valueLabel`（入力欄の aria-label）を追加した — 編集可能になったので、何の数値なのかを支援技術へ伝えるために渡すことを推奨する。

  ## 得られたもの

  |                         | 移行先                         | 効果                                                                                                                                                                                                               |
  | ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `Stepper`               | `number-field`                 | **矢印キー（↑↓）で増減できる**（PageUp/Down は largeStep）。値の直接入力。min/max による端の disabled 判定と clamp が自動に（移行前は `disabled={disabled \|\| value <= min}` と `Math.min/max` を手書きしていた） |
  | `Avatar`                | `avatar`                       | **壊れた `src` で fallback 円に切り替わる**。移行前は無条件で `<img>` を描いていたため、URL が壊れていても画像が割れたまま残った                                                                                   |
  | `SearchField`           | `field` + `input`              | **#22 の取りこぼしだった。** label と control が自動で紐付く。Input と見た目の定数を共有し、二重管理を解消                                                                                                         |
  | `Button` / `IconButton` | `button`                       | `focusableWhenDisabled` が使えるようになった（**disabled なボタンはキーボードナビから消える**問題への対処）。`render` prop で `<a>` 等に差し替えも可能                                                             |
  | `RingTimer`             | `progress`                     | `role="progressbar"` + `aria-valuenow/min/max` + `aria-valuetext` が付いた。描画は従来どおり conic-gradient                                                                                                        |
  | `StepFlow`              | （Base UI ではなくネイティブ） | `<ol>`/`<li>` + `aria-current="step"`。下記参照                                                                                                                                                                    |

  ## `StepFlow` は Progress に載せなかった

  当初 `progress` へ載せる想定だったが、**`role="progressbar"` は不適切**と判断して見送った。progressbar は「40% 完了」のような単一の数値を伝えるロールで、**要素の中身が読み上げ対象から外れる**。StepFlow が伝えたいのは「どのステップに居るか」という**ラベル付きの位置**なので、数値に潰すと情報が減る。

  代わりにネイティブの正しいセマンティクス（順序付きリスト + `aria-current="step"`）を与えた。移行前は素の `<div>` の入れ子で、順序も現在位置も伝わっていなかった。見た目は変わらない（`list-none` / `m-0` / `p-0` でマーカーと既定余白を消している。実測で確認済み）。

  ## `Avatar` は DS 経路だけ移行した

  **legacy 経路（`status` / `ring` を使わない呼び出し）は据え置き。** 「素の img/span を返す」後方互換に消費側の `.avatar` / `.auth-avatar` が依存しており、`Avatar.Root` でラップすると DOM が 1 階層増えて既存の CSS セレクタが外れるため。同じ理由で、legacy 経路には fallback 切り替えも入らない（後方互換とのトレードオフ）。

  なお DS 経路では、画像の有無に関わらず Root に背景色を置くようにした（移行前は `src` があるとき `bg-transparent`）。読み込み失敗時に fallback の文字が地なしで出てしまうため。**透過 PNG のときだけ移行前と差が出る**が、fallback が成立する方を優先した。

  ## 移行時の落とし穴

  **`focusableWhenDisabled` を使うと `disabled` 属性が `aria-disabled` に置き換わる**（`utils/useFocusableWhenDisabled.js`）。そのとき CSS の `:disabled` / `:enabled` 疑似クラスはマッチしなくなり、**disabled が視覚的に無効化されないうえ hover まで効いてしまう**。`Button` / `IconButton` / `Stepper` のボタンは `disabled:` / `enabled:hover:` をやめ、**`data-disabled:` / `hover:not-data-disabled:`** に統一した（Base UI Button は state の disabled を常に `data-disabled` として出すので、これで両方の経路を 1 つの書き方で拾える）。

  **`FIELD_BOX_BASE` から縦 padding を外した。** Input / Textarea は `py-3`、SearchField は `py-2.5` と一段浅いが、共通側に `py-3` を持たせると呼び出し側の `py-2.5` では打ち消せない（同一プロパティのユーティリティは配布 CSS の出力順で決まる。#21 と同じ構図で、実測でも `py-3` が勝って padding が 12px になっていた）。**縦 padding は各コンポーネントが必ず自分で指定する**契約にした。

  **`check-styles.mjs` はコメント内のクラス属性も実クラス名として拾う。** ソースを正規表現で走査するため、コメントに例を書くと存在しないクラスで検査が落ちる（実際に踏んだ）。

  ## 別途対応が必要な発見（#35 に切り出した）

  **`border-[1.5px]` が配布 CSS に生成されていない。** `Input` / `Textarea` / `SearchField` の field 枠は 1.5px のつもりだが、実測では **1px** で描かれている（`dist/styles.css` に `.border-\[1\.5px\]` が 0 件）。**移行前から同じ**なので本 PR による回帰ではないが、DS 全体で意図した枠幅が出ていない。直すと見た目が変わる（1px → 1.5px）ため、意図的な変更として別途判断する。`check:styles` は任意値クラスを検査対象にしていないので、この種の欠損を今後も拾えない点も #35 に含めた。

## 2.1.0

### Minor Changes

- 18abd6b: `Popover.Popup` / `Menu.Popup` に `padding` / `scroll` props を足した（#21）

  2.0.0 で `panelPadding` / `panelScroll` の専用 props を廃止し「外したい呼び出し側は `className` で `p-0` / `max-h-none overflow-visible` を渡して打ち消す」契約にしたが、**この打ち消しは効かなかった。**

  **クラス属性の並び順は CSS の勝敗に無関係で、同一プロパティのユーティリティは配布 CSS の出力順で決まる。** 実測（insession-app の本番ビルド CSS / Tailwind 4.3.2）:

  | クラス              | 出力位置   | 勝敗                 |
  | ------------------- | ---------- | -------------------- |
  | `.p-0`              | idx 163644 | 負ける               |
  | `.p-3`              | idx 163880 | **これが適用される** |
  | `.overflow-visible` | idx 154257 | 負ける               |
  | `.overflow-y-auto`  | idx 154325 | **これが適用される** |
  | `.max-h-none`       | idx 147707 | たまたま勝つ         |

  つまり `max-height` だけ偶然効いて padding と overflow は効かない、という一貫性のない状態だった。実害として消費側（insession-app の通知センター / MiniProfile）に **v1 に無かった 12px の padding と内部スクロール**が付いていた。

  **「打ち消す」のをやめ、そもそも出さない方式へ戻した。** v1 が `panelPadding` / `panelScroll` という props を持っていたのは正しかった。

  ```tsx
  <Popover.Popup
    padding={false}
    scroll={false}
    className="flex max-h-[220px] flex-col overflow-hidden"
  >
    <div className="shrink-0 border-b border-solid border-border px-4 py-3">
      固定ヘッダー
    </div>
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

  | story                            | padding | max-height            | overflow-y |
  | -------------------------------- | ------- | --------------------- | ---------- |
  | 既定                             | 12px    | 320px                 | auto       |
  | `padding={false}`                | **0px** | 320px                 | auto       |
  | `padding={false} scroll={false}` | **0px** | **220px**（独自指定） | **hidden** |

  これにより消費側は Tailwind v4 の important 接尾辞（`p-0!`）に頼らなくてよくなる（insession-app は現在その回避策を使っている。insession-space/insession-app#1107）。

### Patch Changes

- bc0d4e4: メニューの `active` 行の green tint が表示されていなかったのを直した（#17）

  `Menu.Item` / `RadioItem` / `CheckboxItem` / `PlainItem` に `active` を渡したとき、テキスト色（green）は出るのに**背景の tint（`--color-success` 10%）が出ていなかった**。

  **これは 2.x の回帰ではなく 1.x から続いていた不具合。** #9 の移行作業中に実測で気づいたが、当時は「振る舞いの委譲のみで見た目は変えない」方針だったため changeset に記録だけ残していた。

  ## 原因

  行の基底クラス（`MENU_ROW_BASE`）に `bg-transparent` があり、`active` 分岐の tint と**同じクラス属性に両方が並んでいた**。どちらもクラス 1 つで特異度が同じなので、勝敗は**配布 CSS の出力順**で決まる。

  ```
  color-mix(in srgb,var(--color-success) 10%,transparent)  idx=20987   ← 負ける
  .bg-transparent                                          idx=22906   ← 後勝ち
  ```

  結果、**「静止時は tint なし、hover / キーボードハイライト時だけ tint が出る」**という中途半端な状態になっていた（`hover:` / `data-highlighted:` のバリアント付きルールは出力順が後なので勝つ）。

  ## 直し方

  **`MENU_ROW_BASE` から `bg-transparent` を外し、`toneClassName` / `plainToneClassName` が背景を排他的に出す**形にした（`active` なら tint、それ以外なら `bg-transparent`）。

  `bg-transparent` を単に落とすだけにしないのは、DS が preflight を配っていないため `PlainItem`（`<button>`）に UA 既定の `buttonface` 背景が残るから。排他で出せば両方満たせる。

  ## 修正後の実測（Storybook / 算出スタイル）

  | 行                                       | 描画要素   | 背景                                      |
  | ---------------------------------------- | ---------- | ----------------------------------------- |
  | `active` な `Menu.Item`                  | `<div>`    | **`color(srgb 0.192 0.769 0.494 / 0.1)`** |
  | `active` な `RadioItem` / `CheckboxItem` | `<div>`    | **同上**                                  |
  | `active` な `PlainItem`                  | `<button>` | **同上**                                  |
  | 非 `active` の行                         | 両方       | `rgba(0, 0, 0, 0)`                        |
  | `danger` 行                              | 両方       | 透明・文字色 `rgb(255, 107, 107)` を維持  |

  hover / キーボードハイライト時の 20% tint も引き続き出るので、**静止 10% → ハイライト 20%** で区別が付く状態は保たれている。

## 2.0.1

### Patch Changes

- 60ae323: `Popover` / `Menu` のパネルの `z-index` が無効だったのを直した（#14）

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

## 2.0.0

### Major Changes

- 707b60a: Popover / Menu / Modal / ConfirmModal / Tabs の振る舞いを [Base UI](https://base-ui.com)（`@base-ui/react`）へ委譲し、compound API へ移行した（#6）

  **破壊的変更。** これらのコンポーネントは props を渡す単一コンポーネントではなくなり、`Popover.Root` / `Popover.Trigger` / … のパートを組み合わせる形になった。見た目は変えていない（移行前の Storybook と矩形・色を突き合わせて一致を確認済み）。

  ## なぜ

  フローティング系・ダイアログ系の振る舞いをすべて自前で持っていた。`popover.tsx` は 431 行で placement をクラスマップ（`top-[calc(100%+8px)] left-0` 等）で表現し、portal 版は `getBoundingClientRect()` の実測配置を自前で回していた。その結果:

  - **Popover にフリップ・シフト（衝突回避）が無く、ビューポート端で見切れていた**
  - **Modal に focus trap も scroll lock も閉じた後のフォーカス復帰も無かった**
  - **Menu に矢印キーナビ・typeahead が無く、実質マウス専用だった**
  - **Tabs に矢印キーでのタブ移動が無かった**

  WAI-ARIA 準拠の振る舞いはプロダクトの差別化に寄与しない。Base UI（unstyled / headless。styling を一切持たない）へ委譲し、DS は「トークンでの見た目」だけを持つ構造にした。

  ## 得られたもの（実機で計測して確認）

  |                       | 移行前                                 | 移行後                                                                                                                                                                                                                                                                                     |
  | --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | Popover の衝突回避    | 無し                                   | 下端で `data-side` が `bottom`→`top` に反転しビューポート内に収まる。右端では `align=end` ではみ出し 0                                                                                                                                                                                     |
  | Modal の scroll lock  | `body` の overflow は `visible` のまま | 開くと `hidden`                                                                                                                                                                                                                                                                            |
  | Modal の focus trap   | 無し                                   | `body` 直下の兄弟すべてに `data-base-ui-inert` + `aria-hidden`                                                                                                                                                                                                                             |
  | Menu のキーボード操作 | 無し                                   | 矢印キー / Home / End / typeahead（"v"→Version, "d"→Delete …）。tone ごとにハイライトの面色が出る（既定=`surface-hover` / danger=`danger-surface` / active=success 20% tint）。`disabled` 行はハイライト対象に含まれるが面色は出さず、フォーカスリング（`--shadow-focus`）だけで位置を示す |
  | Tabs のキーボード操作 | 無し                                   | 矢印キー / Home / End / 端でラップ / Space・Enter で選択                                                                                                                                                                                                                                   |
  | ConfirmModal の role  | `dialog`                               | `alertdialog`（背景クリックで閉じない = 確認ダイアログとして正しい）                                                                                                                                                                                                                       |

  ## 依存の変更

  **`@base-ui/react@1.6.0` が `dependencies` に入った（バージョン完全固定）。** DS にとって初めての runtime 依存で、`@floating-ui/react-dom` / `@floating-ui/utils` / `use-sync-external-store` / `@babel/runtime` / `@base-ui/utils` を引き連れる。消費側は `pnpm add` するだけでよい（peer にはしていない）。

  `dist/index.js` は 80KB（移行前 61KB）。Base UI 自体はバンドルせず external 参照なので、この増分は DS 自身のコード分。`date-fns` / `@date-fns/tz` は Base UI の peer に載っているが `optional: true`（日付系コンポーネント用）なので install 不要。

  > 旧パッケージ名 `@base-ui-components/react` は `1.0.0-rc.0` で deprecated になり `@base-ui/react` へ改名されている。新しい名前を使うこと。

  ## 移行手順

  ### Popover

  ```tsx
  // 移行前
  <Popover open={open} onClose={close} trigger={<button>開く</button>}
    placement="bottom-end" panelClassName="w-80" panelPadding={false} portal mobileSheet>
    {children}
  </Popover>

  // 移行後
  <Popover.Root open={open} onOpenChange={(o) => !o && close()}>
    <Popover.Trigger>開く</Popover.Trigger>
    <Popover.Portal>                             {/* portal={false} 相当なら Portal を挟まない */}
      <Popover.Positioner side="bottom" align="end" mobileSheet>
        <Popover.Popup className="w-80 p-0">     {/* panelPadding={false} 相当は p-0 で打ち消す */}
          {children}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
  ```

  `placement` の対応: `bottom-start` → `side="bottom" align="start"`（既定）/ `bottom-end` → `side="bottom" align="end"` / `top-start` → `side="top" align="start"` / `top-end` → `side="top" align="end"`。

  専用 props の `panelClassName` / `panelShadow` / `panelPadding` / `panelScroll` は廃止し、`Popover.Popup` の `className` に一本化した。既定は移行前と同じ（padding あり / `max-h-80` スクロールあり / DS の popover 影）で、打ち消したいときだけユーティリティを足す（`p-0` / `max-h-none overflow-visible`）。

  ### Menu — 2 系統ある

  **a) 独立して開閉するメニュー**（キーボードナビ・typeahead が効く）: `Menu.Root` / `Trigger` / `Portal` / `Positioner` / `Popup` / `Item` / `RadioGroup` / `RadioItem` / `CheckboxItem` / `Separator` / `Group` / `GroupLabel` / `SubmenuRoot` / `SubmenuTrigger`。

  **b) Popover のパネルに行だけ載せる**（移行前と同じ、振る舞いを持たない見た目のみ）: `Menu.PlainList` / `Menu.PlainItem`。

  **Base UI の Menu パートは `Menu.Root` の React context を要求するため、`Popover.Popup` の中では使えない**（`MenuRootContext is missing` で throw する）。ヘッダとメニュー行を 1 つのパネルに混在させる通知センターのような UI は (b) を使う。移行前の `Menu` / `MenuItem` はそのまま `Menu.PlainList` / `Menu.PlainItem` に読み替えられる（props も同じ）。

  `role` prop でラジオ/チェックボックスを切り替えていた箇所は、(a) では `Menu.RadioItem` / `Menu.CheckboxItem` というパートに分かれた。`onSelect` は `onClick` になった。

  ### Modal

  ```tsx
  // 移行前
  <Modal onClose={close} title="通知設定" footer={<Button/>} width="min(760px, 94vw)">{children}</Modal>

  // 移行後
  <Modal.Root open={open} onOpenChange={(o) => !o && close()}>
    <Modal.Portal>
      <Modal.Backdrop />
      <Modal.Popup variant="ds" style={{ width: 'min(760px, 94vw)' }}>
        <div className="flex items-center justify-between gap-3 border-b border-solid border-border px-[18px] py-4">
          <Modal.Title>通知設定</Modal.Title>
          <Modal.Close variant="ds" aria-label={t('close')} />
        </div>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer><Button /></Modal.Footer>
      </Modal.Popup>
    </Modal.Portal>
  </Modal.Root>
  ```

  `variant` は `'legacy'`（既定。`.modal` / `.modal-backdrop` / `.modal-close` の従来クラスを使う経路。`.modal h2` / `.modal button[type="submit"]` のグローバル装飾に依存している消費側はこちら）と `'ds'`（トークンのユーティリティで title / body / footer を組む体裁）。移行前の「`title`/`footer` を渡すと DS 構造」という暗黙の切り替えを明示した。

  `width` は `Modal.Popup` の `style` へ。`ariaLabel` は `aria-label` の透過。`closeLabel` は `Modal.Close` の `aria-label`（i18n は props 注入のまま維持）。`as='form'` + `onSubmit` は `render` に一本化した:

  ```tsx
  <Modal.Popup render={<form onSubmit={handleSubmit} />}>…</Modal.Popup>
  ```

  ### ConfirmModal

  外部 props は変わらない（`tone` の見た目も同一）。内部実装が Base UI AlertDialog になり、**背景クリックで閉じなくなった**（確認ダイアログとして正しい挙動）。背景クリックで閉じることに依存していた箇所があれば見直すこと。

  ### Tabs

  ```tsx
  // 移行前
  <Tabs tabs={[{ key: 'queue', label: 'キュー', badge: <CountChip n={3} /> }]}
    value={value} onChange={setValue} variant="fill" trailing={<IconButton/>} />

  // 移行後
  <Tabs.Root value={value} onValueChange={setValue}>
    <Tabs.List variant="fill" trailing={<IconButton />}>
      <Tabs.Tab value="queue">キュー<CountChip n={3} /></Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="queue">…</Tabs.Panel>   {/* 任意。移行前は panel を持たなかった */}
  </Tabs.Root>
  ```

  `TabItem` 型は廃止。`badge` は `Tabs.Tab` の children に直接書く。アクティブ状態は JS 比較ではなく Base UI の `data-active` 属性で表現するようになった（下線アニメーションと `variant` の見た目は移行前と同一）。

  ## 変えていないもの

  - **`useDismiss` は残した。** 消費側が DS の Popover を経由せず自前のドロップダウンに使っており、Document Picture-in-Picture 対応（`ownerDocument.defaultView` からリスナーを張る）という Base UI に無い要件を持つ。
  - `SplitModal` / `BottomSheet` / `ProfileModal` / `Toast` / `Checkbox` / `Radio` / `Toggle` などは移行対象外（`SplitModal` は新しい `Modal` API に追随させただけで見た目・挙動は不変）。

  ## 移行中に見つけた既存バグ（このリリースでは直していない）

  **メニューの `active` 行の green tint（10%）は、v1 でも表示されていなかった。** 行の基底クラスにある `bg-transparent` が配布 CSS 上で tint より後に出力されるため打ち消される（`.bg-transparent` の方が後勝ち）。`origin/main` の実測でも `active` 行の背景は透明だった。

  このリリースは「振る舞いの委譲のみで見た目は変えない」方針なので**意図的に直していない**（直すと v1 に無かった tint が出て見た目が変わる）。ハイライト時（hover / キーボード）の 20% tint は特異度と出力順が勝つため正しく表示される。恒久対応は別 Issue で。

  ## 消費側で確認が必要なこと

  - **PiP（Document Picture-in-Picture）へモーダルを出している箇所**は改修が必要。移行前は `ownerDocument` から描画先を自動検出していたが、Base UI では `Modal.Portal` の `container` prop で明示指定する。
  - **非 portal の Popover の z-index。** 移行前は portal 有無で `--z-dropdown`(30) / `--z-popover-portal`(35) を使い分けていたが、Popup 自身が portal されたかを知れないため常に後者に統一した。30〜35 の間に z-index を持つ要素と重なる箇所がないか確認すること。
  - **`mobileSheet` を内部スクロールコンテナの中のトリガーで使っている箇所。** `mobileSheet` 時は `positionMethod="fixed"` になるため、そのコンテナのスクロールに追従しない。

### Minor Changes

- 15788e4: `Textarea` プリミティブを追加した。

  DS は `Input`（1 行）と `Composer`（チャット送信欄。送信ボタンと添付を内包する専用部品）は持っていたが、**汎用の複数行入力が無かった**。そのため消費側は raw な `<textarea>` を置き、見た目はアプリ側のグローバル CSS（`textarea { … }`）で与えるしかなかった。insession-app にも 4 箇所の raw な textarea が残っており、`apps/web/src/style.css` に 38 行のグローバル定義を抱えていた。

  ラベル（mono caps）・field（surface-2 + 1.5px border + radius md）・状態の優先度（error > focused > default）と色は **`Input` と完全に同一**。フォームで並べたときに揃うことが要件なので、値を変えるときは両方まとめて変えること。

  textarea 固有の差分は 3 点だけ:

  - field を `items-center` ではなく `items-stretch` にする（複数行なので中央寄せは不要）
  - `rows` の既定を **4** にする（HTML 既定の 2 行は狭い）
  - `resize` prop で方向を選べる（既定 `'vertical'`。横に伸ばせると親のレイアウトが崩れるため `'none'` も用意）

  ライト/ダーク両テーマで `Input` と並べた見た目・focus リング・error 表示を実ブラウザで確認済み。

## 1.5.0

### Minor Changes

- 76bc475: ライトテーマを DS に取り込んだ。`<html data-theme="light">` だけでライトになる。

  これまで `theme.css` はダーク単一トーンで、ライトは**消費側が自前でオーバーレイを持つ**契約だった。結果として同じライト値が insession-app（`apps/web`）と loophub（`apps/web` / `apps/lp`）に重複し、DS の README にも「値は揃えて保守する」と書かれた三重管理になっていた。ここへ一本化した。

  移設前に 3 者の値を突き合わせ、**loophub の 17 トークンは insession-app の 30 トークンの部分集合で、値も完全に一致**していることを確認している。insession-app 固有で DS が持たない 3 つ（`--color-visibility-public` / `-followers` / `-community`）は移していない。

  **設計:**

  - **ダークが既定。** `@theme` の値がそのままダークのトーンで、ライトのオーバーレイは `data-theme="light"` が付くまで不活性。**ダーク固定のプロダクトは何も意識しなくてよい。**
  - **ダーク側（`[data-theme="dark"]`）の再宣言は置かない。** 移設元には 25 トークン分あったが、全て `@theme` の既定値と完全一致だったため、持ち込むと同じ値の二重管理が DS 側に移るだけになる。属性なしと `"dark"` はどちらも `:root` の値で成立する。
  - オーバーレイは**どの `@layer` にも属さない**ので `@theme` の出力（theme レイヤー）より必ず強い。詳細度でも `:root[data-theme="light"]`(0,2,0) > `:root`(0,1,0) なので、消費側の取り込み方に依らず効く。
  - 上書きするのは**参照元の生値だけ**（27 トークン）。ティント面とセマンティック面は `color-mix(…, var(--color-bg))` の合成なので追従する。
  - セレクタは `:root[…]` で html 要素だけに効く。要素単位の部分切替が必要なプロダクトは自分側で足す。

  **Storybook にツールバーの Theme トグルを追加した。** これが無いとライト値を目視検証できなかった。`scripts/check-styles.mjs` にもオーバーレイの回帰検査を足した（存在すること・レイヤー外にあること・面やティントを二重に書いていないこと・ダーク側の再宣言が無いこと）。

## 1.4.1

### Patch Changes

- 7221f60: ライセンスを MIT にした（`LICENSE` を追加し、`package.json` の `license` を `UNLICENSED` から `MIT` へ）。

  public リポジトリで npm にも公開しているのに `license` が `UNLICENSED`（=「許諾しない」の明示）のままで、**InSession / loophub 以外のプロダクトは法的に採用できない**状態だった。他プロダクトへ配る前提と矛盾していたので改めた。

  著作権表示は `Copyright (c) 2026 INSESSION Space`。`LICENSE` は `files` に明示し、CI の npm pack 検査でも同梱を必須にした。

## 1.4.0

### Minor Changes

- 15a4206: 消費側の Tailwind 依存を外し、パッケージを自己完結させた。

  **`@insession/design-system/styles.css` を追加した。** publish 時にプリビルドした配布 CSS（トークン + 部品 CSS + このパッケージが使うユーティリティ、約 53KB / gzip 約 9KB）で、これ 1 枚を読むだけで動く。消費側に Tailwind v4 は不要になり、`@source` の設定ミスで「ビルドは緑のままスタイルが静かに欠ける」失敗モードも消える。

  **パッケージ内に定義が無かった CSS を移植した（`components.css`）。** 以下は定義が消費側 insession-app の legacy CSS にしか存在せず、publish された中身だけでは完成していなかった。そのため **insession-app の外では静かに崩れていた**:

  - `.modal` / `.modal-backdrop` / `.modal-close` / `.modal h2` → Modal の既定経路（`title`/`footer` を渡さない呼び方）と、それに載る ConfirmModal / ProfileModal
  - `.bottom-sheet*` → BottomSheet 全体
  - `.google-icon` → GoogleIcon
  - `@keyframes card-in` / `fade-in` / `pop-in` / `snackbar-in` / `ring-timer-urgent-pulse` → Modal / BottomSheet / Badge / Toast(snackbar) / RingTimer のアニメーション

  **その他:**

  - `base.css` を追加。コンポーネントが前提にする最小リセット（`box-sizing` とフォームコントロールのフォント継承）のみを `@layer base` に持つ。Tailwind の preflight は消費側のページ全体を書き換えるので配らない。
  - `--radius-sheet: 22px` をトークンに追加（BottomSheet が参照する）。
  - `scripts/check-styles.mjs` を追加し CI に組み込んだ。「クラス名は DOM に出るのに CSS が無い」欠損を機械的に検出する。
  - Storybook を「消費側と同じ経路」（`dist/styles.css` のみからコンポーネントを描く）に変更した。従来はカタログ側で独自にユーティリティを生成していたため、上記の欠損を見逃す構造だった。
  - BottomSheet の × 閉じるボタンに flex の中央揃えを足した（移植元はグリフが左上に寄っていた）。既存の消費側 insession-app は自分の legacy CSS で描画を続けるため影響を受けない。

  **破壊的変更ではない。** 従来方式（`theme.css` + `@source`）はそのまま動く。ただしその方式を続ける場合は、上記の部品 CSS を得るために `@insession/design-system/components.css` の import を足すこと。

> **このパッケージは `@in-session/ui` から `@insession/design-system` へ改名されました**
> （リポジトリ分割時。旧モノレポ `insession-space/insession-app` の `foundation/ui` が
> `insession-space/design-system` として独立し、npm へ公開されました）。
> 以下の履歴は改名前の記述をそのまま残しています（当時のパッケージ名は `@in-session/ui`、
> ソースの置き場所は `packages/ui` → `foundation/ui` でした）。

## 1.3.1

### Patch Changes

- 7d8a565: DS の tinted surface（`--color-tint-*` / `--color-*-surface(-strong)`）を不透過化。テーマ背景 `var(--color-bg)` への color-mix 合成で、既定背景上の見え方は従来と同一のままバッジ/ロゼンジ等の塗りが透けなくなる。透明度が必要な装飾（CD 盤の光沢・ボイス発話グロー・スキャングラデ）は `color-mix(…, transparent)` をその場で使う形へ置換して透過を維持。

## 1.3.0

### Minor Changes

- f137883: コミュニティ画面の再設計（#1027）: 「みんなの様子」を「トピック」に改名、投稿入力を DS 共通の Composer（@in-session/ui 新設。Enter 送信・Shift+Enter 改行・IME ガード・自動伸長）へ統一し space チャットと共通化、「スペース」タブ新設（コミュニティのスペースをホームから移行）、「設定」タブ新設（名前・説明文の編集 / 招待リンク / コミュニティ削除。owner 限定・サーバー側 PATCH/DELETE /api/communities/:id 追加）、コミュニティの emoji アバター表示を全廃

### Patch Changes

- 436523e: コミュニティ入力欄のスタイル修正（#1038 フォローアップ）: Composer の送信ボタンに legacy グローバル button スタイル（灰色塗り・padding）が透過していたのをリセットしアイコン表示に修正、スレッド返信ブロックの意図しない四辺枠線を解消（border-0 で左線のみに）、コミュニティ入力欄から定型文ボタン/チップを撤去（ユーザー要望）

## 1.2.0

### Minor Changes

- f1cc47a: 伝言ゲーム（whiteboard plugin relay-game モード）の UI をデザインコンプへ刷新した（#974）。ロビーは参加スロットグリッド + 募集中バッジ + 過去ゲーム一覧、プレイ中は円形カウントダウンタイマー・ステップ進行・提出状況のサイドレール（狭幅では上部ストリップ）、お絵描きはペン 5 種/インク 9 色/太さスライダーのフローティングツールバー（usketch freedraw の外部制御イベントで駆動・relay では設定を localStorage に永続化しない）、結果はチェーンカード + confetti になった。汎用部品として RingTimer / StepFlow を @in-session/ui へ追加（Storybook ストーリー付き。サーバー/WS プロトコルは無変更）。

### Patch Changes

- f96bcf5: Habitat Phase 2「社会性と生きた環境」を追加した（#982）。親密度（creature_relations テーブル・近接/遊びで蓄積・ユーザーをまたいで永続）と再会 greet、性格 4 軸（uid から決定論生成・経験で微小ドリフト・DB 永続化）、感情エモート、短期の天気（チャット盛況 →bloom / Watch Party 再生 →dusk+集合 / 深夜少人数 →night+蛍+添い寝。すべて行動 AI への入力）、アンビエントモード（スペース画面下端の帯。スペース設定と個人設定の両方で OFF 可・モバイル既定 OFF）。モバイル判定の単一ソースとして foundation/ui に MOBILE_LAYOUT_MQ を新設。

## 1.1.3

### Patch Changes

- 24e2a30: foundation/ui 自体の DS 逸脱を解消: --shadow-_ を間接参照（--elev-_）化しテーマ上書き可能に、tracking 任意値を tracking-tag/pill トークン化、rounded-[2px] を rounded-xs へ。loophub の light 影上書きを --elev-\* に追随、help のテーマコピーに tracking トークンを補完

## 1.1.2

### Patch Changes

- ccb0e5b: 参加者パネル（`.cp-popover`。`overflow-y:auto`）内で MiniProfile を開くと、パネルの overflow にカードがクリップされて左側が見えなくなる問題を直した（#885）。`foundation/ui/popover.tsx` の `Popover` に `portal` オプションを追加し、指定時はパネルを `createPortal` で `document.body` 直下へ出し、トリガーの実測位置から `position:fixed` で配置するようにした（既定 `false` で他 consumer の従来挙動は変えていない）。

  あわせて、portal 化に伴う副作用（フォーカス移動・トリガーのスクロールアウト・入場アニメ中の誤ったサイズでの位置確定）にも対応した: open 時にパネル内へ focus を移し close でトリガーへ戻す、`aria-owns` で DOM 非隣接になったトリガーとパネルの関連を明示、`ResizeObserver` でパネルの後発サイズ変化に追従、トリガーがスクロールでクリップ境界の外に出たら `onClose()` せず `visibility:hidden` で隠して再表示可能にする、といった調整を行っている。

## 1.1.1

### Patch Changes

- 177f397: 通知ポップオーバーがライトテーマで崩れて見える不具合を修正した（#867）。原因は Tailwind v4 が `@theme` 内の `--shadow-*` を**ビルド時にリテラル展開**して `.shadow-*` ユーティリティを生成する挙動にあり、`:root[data-theme="light"]` での同名トークン上書きがユーティリティには一切効いていなかった。legacy CSS の `box-shadow: var(--shadow-popover)` はランタイム参照なので正しく追従しており、この非対称のせいで「UserMenu と 🧩 スイッチャーは正常なのに、DS の `shadow-*` ユーティリティを使う通知パネルだけライトテーマでダーク影（`inset 0 1px 0 rgba(255,255,255,.06)` の白い内側ハイライト付き）が当たる」状態になっていた。白背景の上端にこのハイライトが線を引くため、ヘッダーとリストが別々の面に分離して見えていた。

  影の実値を `--elev-*` トークンへ移し、`@theme` 側は `--shadow-x: var(--elev-x)` の参照だけを持つ形にして、`shadow-soft` / `shadow-popover` / `shadow-overlay` の全ユーティリティがライト/ダークにランタイム追従するようにした（同じ不具合を抱えていた `shadow-soft` / `shadow-overlay` も併せて解消）。影の値そのものは変えていない。

  あわせて UserMenu / 🧩 ステージスイッチャーを「正」として通知パネルの見た目を揃えた: `shadow-popover-strong`（#564 で導入、唯一の利用者が通知パネルだった）を廃止して既定の `shadow-popover` に統一、`--z-dropdown` を 30→50 にして UserMenu / 🧩 のハードコード `z-index: 50` をトークン参照へ寄せ、🧩 の `border-radius: 14px` ハードコードを `var(--radius-card)`（16px）に揃えた。

  共通 `Popover` には `panelPadding` / `panelScroll`（いずれも既定 `true` で従来挙動）を追加し、「ヘッダー固定＋本文だけスクロール」なパネルを `p-0!` / `overflow-hidden!` / `max-h-...!` の `!` 打ち消し連鎖なしに書けるようにした。狭幅ビューポートで横にはみ出さないよう `max-w-[calc(100vw-24px)]` のクランプも入れている。

## 1.1.0

### Minor Changes

- 7d26fe9: 設定モーダルの 2 ペイン外殻を `@in-session/ui` の `SplitModal` に集約した（#842）。スペース設定とアカウント設定が同じ左 nav 構造を各々でベタ書きしていた重複を解消し、両方が共通プリミティブを使うようにした。合わせて、狭い画面（560px 以下）では左右 2 ペインを縮めるのをやめ、「セクション一覧 → タップで詳細 → 戻る」のドリルダウンにレイアウトごと差し替えるようにした。ネイティブの設定アプリと同じ操作感になり、セクションが増えても窮屈にならない。広い画面の見た目と、スペース設定のモバイルがボトムシートで開く挙動は従来どおり。

### Patch Changes

- 0cc1d3f: デザインシステムの Button / IconButton に `xs` サイズを追加し、DS（claude.ai/design の INSESSION Design System）と実装の食い違いを解消した（#854）。DS 側の Button は `sm` / `md` の 2 段階しか定義しておらず、リポジトリの `foundation/ui/button.tsx` が既に持っていた `xs` が DS に載っていない状態だった。DS の Button を `xs`（padding 6px 12px・font 11px）を含む 3 段階に揃え、IconButton も同じ呼称のサイズトークン（`xs` 30 / `sm` 34 / `md` 38）で指定できるようにした（従来の数値 px 指定も引き続き動く）。合わせて legacy CSS 側にも素の `button` の既定サイズを打ち消せる `.btn-xs` を用意し、密な UI（インライン行アクション・ポップオーバー内・コンパクトなモバイル面）で使えるようにした。既存の `sm` / `md` の見た目は変えていない。
- 9f63b09: 設定モーダル（ユーザー設定・スペース設定）のドリルダウン切替の閾値を 560px から 768px へ引き上げた（#861）。タブレットや狭い PC ウィンドウの幅だと、レール(214px)+本文の 2 ペイン表示が窮屈だったため、より広い幅からドリルダウン（一覧 → タップで詳細）に切り替わるようにした。

## 1.0.2

### Patch Changes

- aa448a1: loophub のヘッダー崩れを修正し、ブランドロゴを 48px にする

  ヘッダー行の子要素に `shrink-0` が無く、幅が足りないと全要素が等しく縮んで「新規リクエスト」ボタンのラベルが縦折り返しになり、検索欄が潰れて placeholder が重なっていた。検索欄だけが `min-w` の下限まで縮む構成に整理し、他の子は固有幅を保つようにした。あわせて `SearchField` プリミティブから `w-full` を外し、幅は呼び出し側が決める形にした。

## 1.0.1

### Patch Changes

- 7747ac5: 共通 UI コンポーネント群の配置を foundation 配下のモノレポ構成へ再編
