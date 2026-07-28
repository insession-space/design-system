import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import type * as React from 'react';
import type { ReactNode } from 'react';

// DS のセグメンテッドコントロール（純粋 leaf UI。#53）。
// 「並んだ選択肢のうち1つが必ず選ばれている」切り替え。振る舞いは Base UI の
// RadioGroup / Radio へ委譲し、DS 側は見た目だけを持つ（#22 の方針）。
//
// なぜ ToggleGroup ではなく RadioGroup に載せたか: セグメンテッドコントロールは
// **常にどれか1つが選択されている**（未選択状態が無い）。ToggleGroup（`aria-pressed`）は
// 「押されていない状態」が正当なので、全部 off の状態を型でも a11y でも許してしまう。
// RadioGroup なら `value` が常に1つに定まり、読み上げも「n個中n番目」になる。
// 矢印キーでの移動と roving tabIndex も radio のセマンティクスとして正しく付く。
//
// なぜ必要だったか: 消費側（insession-app）が legacy `.segmented-btn` で
// 言語切替 / テーマ切替 / フィードバック種別（bug / feature）の3箇所を手組みしていた。
// いずれも「素の button に三項演算で active クラスを足す」形だった。
//
// ⚠ 状態別のクラスは `data-checked:` バリアントではなく className の関数形
// （state => string）で **排他的に** 出す（#17 の教訓）。選択時と非選択時で
// background-color / color が入れ替わるため、同一クラス属性に両方を並べると
// 勝敗が配布 CSS の出力順で決まってしまう。
//
// ⚠ `disabled:` ではなく `data-disabled:` で書く。Base UI の Radio.Root が描画するのは
// `<span role="radio">` で、`:disabled` 疑似クラスはフォーム要素にしか適用されない
// （radio.tsx / toggle.tsx と同じ）。

export type SegmentedControlItem = {
  value: string;
  label: ReactNode;
  // アイコンのみ / アイコン + ラベルのとき行頭に出す。
  icon?: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps = Omit<
  React.ComponentProps<typeof RadioGroup>,
  'className' | 'render' | 'children'
> & {
  items: SegmentedControlItem[];
  // グループ全体の用途を読み上げる（視覚的な見出しを持たない使い方が多いため）。
  ariaLabel?: string;
  // 幅いっぱいに等分割する（設定画面の行に置くとき）。既定は内容幅。
  fill?: boolean;
  className?: string;
};

// トラック。セグメントの隙間から地の面が見える構造なので、面は surface-2 に置く。
const TRACK =
  'inline-flex items-center gap-0.5 rounded-md border border-solid border-border bg-surface-2 p-0.5';

const SEGMENT =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 min-w-(--control-hit-size) pointer-coarse:min-h-(--control-touch-size) pointer-coarse:min-w-(--control-touch-size) rounded-[7px] border-none bg-transparent px-3 py-1.5 font-body text-sm font-semibold whitespace-nowrap transition-colors motion-reduce:transition-none duration-(--dur-fast) focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring data-disabled:cursor-not-allowed data-disabled:forced-colors:text-[color:GrayText] data-disabled:opacity-50';

export default function SegmentedControl({
  items,
  ariaLabel,
  fill = false,
  className = '',
  ...rest
}: SegmentedControlProps) {
  return (
    <RadioGroup
      aria-label={ariaLabel}
      className={`${TRACK} ${fill ? 'flex w-full' : ''} ${className}`.trim()}
      {...rest}
    >
      {items.map((item) => (
        <Radio.Root
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={(state) =>
            `${SEGMENT} ${fill ? 'flex-1' : ''} ${
              state.checked
                ? 'bg-surface text-text shadow-elevation-1 forced-colors:text-[color:Highlight]'
                : 'text-text-dim hover:text-text'
            }`.trim()
          }
        >
          {item.icon}
          {item.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
