---
"@insession/design-system": major
---

Popover / Menu / Modal / ConfirmModal / Tabs の振る舞いを [Base UI](https://base-ui.com)（`@base-ui/react`）へ委譲し、compound API へ移行した（#6）

**破壊的変更。** これらのコンポーネントは props を渡す単一コンポーネントではなくなり、`Popover.Root` / `Popover.Trigger` / … のパートを組み合わせる形になった。見た目は変えていない（移行前の Storybook と矩形・色を突き合わせて一致を確認済み）。

## なぜ

フローティング系・ダイアログ系の振る舞いをすべて自前で持っていた。`popover.tsx` は 431 行で placement をクラスマップ（`top-[calc(100%+8px)] left-0` 等）で表現し、portal 版は `getBoundingClientRect()` の実測配置を自前で回していた。その結果:

- **Popover にフリップ・シフト（衝突回避）が無く、ビューポート端で見切れていた**
- **Modal に focus trap も scroll lock も閉じた後のフォーカス復帰も無かった**
- **Menu に矢印キーナビ・typeahead が無く、実質マウス専用だった**
- **Tabs に矢印キーでのタブ移動が無かった**

WAI-ARIA 準拠の振る舞いはプロダクトの差別化に寄与しない。Base UI（unstyled / headless。styling を一切持たない）へ委譲し、DS は「トークンでの見た目」だけを持つ構造にした。

## 得られたもの（実機で計測して確認）

| | 移行前 | 移行後 |
| --- | --- | --- |
| Popover の衝突回避 | 無し | 下端で `data-side` が `bottom`→`top` に反転しビューポート内に収まる。右端では `align=end` ではみ出し 0 |
| Modal の scroll lock | `body` の overflow は `visible` のまま | 開くと `hidden` |
| Modal の focus trap | 無し | `body` 直下の兄弟すべてに `data-base-ui-inert` + `aria-hidden` |
| Menu のキーボード操作 | 無し | 矢印キー / Home / End / typeahead（"v"→Version, "d"→Delete …）。tone ごとにハイライトの面色が出る（既定=`surface-hover` / danger=`danger-surface` / active=success 20% tint）。`disabled` 行はハイライト対象に含まれるが面色は出さず、フォーカスリング（`--shadow-focus`）だけで位置を示す |
| Tabs のキーボード操作 | 無し | 矢印キー / Home / End / 端でラップ / Space・Enter で選択 |
| ConfirmModal の role | `dialog` | `alertdialog`（背景クリックで閉じない = 確認ダイアログとして正しい） |

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

### Menu — 2系統ある

**a) 独立して開閉するメニュー**（キーボードナビ・typeahead が効く）: `Menu.Root` / `Trigger` / `Portal` / `Positioner` / `Popup` / `Item` / `RadioGroup` / `RadioItem` / `CheckboxItem` / `Separator` / `Group` / `GroupLabel` / `SubmenuRoot` / `SubmenuTrigger`。

**b) Popover のパネルに行だけ載せる**（移行前と同じ、振る舞いを持たない見た目のみ）: `Menu.PlainList` / `Menu.PlainItem`。

**Base UI の Menu パートは `Menu.Root` の React context を要求するため、`Popover.Popup` の中では使えない**（`MenuRootContext is missing` で throw する）。ヘッダとメニュー行を1つのパネルに混在させる通知センターのような UI は (b) を使う。移行前の `Menu` / `MenuItem` はそのまま `Menu.PlainList` / `Menu.PlainItem` に読み替えられる（props も同じ）。

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
