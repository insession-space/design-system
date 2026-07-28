import { Field } from '@base-ui/react/field';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import type * as React from 'react';
import type { ReactNode } from 'react';

// DS のラジオ（純粋 leaf UI）。claude design "INSESSION Design System" の Controls 仕様に準拠（#463）。
// 振る舞いは Base UI の Radio / RadioGroup へ委譲する（#22）。DS 側は見た目だけを持つ。
// 22x22 の円 / 2px 枠。選択時は枠を text 色にし、中央に 10px の accent ドットを出す。
//
// ── 移行に伴う破壊的変更（2.x → 3.0）─────────────────────
// **`Radio` は単体コンポーネントではなくなり、`Radio.Group` + `Radio.Item` の compound になった。**
// Base UI の Radio は選択状態を親の RadioGroup（`value` / `onValueChange`）から解決する設計で、
// 個々の Radio が `checked` を受け取る形にはできない（RadioRoot は group context の
// `checkedValue` と自分の `value` を突き合わせて checked を決める）。
// 矢印キーでのグループ内移動・1つだけ tab stop になる roving tabIndex は、この構造が前提。
//
//   <Radio checked={v === 'a'} onChange={() => set('a')} label="A" />   // 2.x
//   <Radio.Group value={v} onValueChange={set}>                        // 3.0
//     <Radio.Item value="a" label="A" />
//   </Radio.Group>
//
// ラベルの紐付けは Base UI の Field.Label に委譲した（`<button>` は HTML 仕様上 labelable
// element ではなく `<label htmlFor>` の対象にできないため）。checkbox.tsx と同じ方針。
//
// ⚠ 状態別のクラスは data-checked: バリアントではなく className の関数形（state => string）で
// **排他的に** 出す（#17 の教訓）。同一プロパティ（border-color / transform）のユーティリティを
// 1つのクラス属性に同時に並べると、勝敗が配布 CSS の出力順で決まってしまう。

// Base UI の props をそのまま継承する（`form` / `inputRef` / 任意の aria-* / data-* が
// 通るようにするため。手で列挙すると必ず取りこぼす）。DS が差し替えるのは className
// （関数形ではなく文字列で受ける）と、RadioItem に足す label だけ。
export type RadioGroupProps = Omit<
  React.ComponentProps<typeof BaseRadioGroup>,
  'className' | 'render'
> & {
  className?: string;
};

export type RadioItemProps = Omit<
  React.ComponentProps<typeof BaseRadio.Root>,
  'className' | 'render'
> & {
  label?: ReactNode;
  className?: string;
};

const CIRCLE =
  'relative grid h-[22px] w-[22px] place-items-center rounded-pill before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:size-(--control-hit-size) pointer-coarse:before:size-(--control-touch-size) before:content-[""] border-2 border-solid bg-transparent p-0 transition-colors motion-reduce:transition-none focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring';
const DOT =
  'h-2.5 w-2.5 rounded-pill bg-accent forced-colors:bg-[Highlight] transition-transform motion-reduce:transition-none duration-(--dur-fast)';

// disabled の見た目は行全体（円 + ラベル）に効かせる。checkbox.tsx と同じ理由・同じ形。
// ⚠ has-[[data-disabled]] にしているのが要点で、`<Radio.Group disabled>` のように
// **親から disabled が降ってくる**経路では Item 自身の disabled prop は undefined のまま
// なので、それだけを見ると円だけ無効化されてラベル側が通常表示のまま残る。
// Base UI は group の disabled を各 Radio.Root の data-disabled として出すので、
// 子孫にその属性があれば当たる形にしておけば両方の経路を拾える。
// ⚠ また `disabled:` ではなく `data-disabled:` 系で書くこと。Base UI の Radio.Root が
// 描画するのは `<span role="radio">` で、CSS の :disabled 疑似クラスはフォーム要素にしか
// 適用されないため効かない（toggle.tsx / checkbox.tsx と同じ）。
const ROW =
  'inline-flex select-none items-center gap-3 min-h-(--control-hit-size) pointer-coarse:min-h-(--control-touch-size) pointer-coarse:min-w-(--control-touch-size) cursor-pointer has-[>[data-disabled]]:cursor-not-allowed has-[>[data-disabled]]:opacity-50';

// ラベルに cursor-[inherit] を当てる理由は checkbox.tsx のコメント参照
// （<label> は行の cursor を継承しないため、明示しないと移行前の見た目から回帰する）。
const LABEL = 'cursor-[inherit] text-base text-text';

// 既定は縦積み（移行前は呼び出し側が並べていたが、グループが要るようになったので
// レイアウトの既定をここで持つ）。横並びにしたいときは className で上書きする。
function RadioGroup({ children, className = '', ...rest }: RadioGroupProps) {
  return (
    <BaseRadioGroup className={`flex flex-col gap-2.5 ${className}`.trim()} {...rest}>
      {children}
    </BaseRadioGroup>
  );
}

function RadioItem({ label, disabled, className = '', ...rest }: RadioItemProps) {
  return (
    <Field.Root disabled={disabled} className={`${ROW} ${className}`.trim()}>
      <BaseRadio.Root
        disabled={disabled}
        className={(state) =>
          `${CIRCLE} ${state.checked ? 'border-text' : 'border-control-border'}`
        }
        {...rest}
      >
        {/* Indicator は checked のときだけ描画される。移行前は常にドットを置いて
            scale-0 / scale-100 で出し入れしていたが、ドットは 22x22 の円の中央に
            absolute 相当（place-items-center）で載るだけなのでレイアウトは変わらない。
            transition-transform motion-reduce:transition-none は「出現時に scale が付く」表現を維持するために残す。 */}
        <BaseRadio.Indicator className={DOT} />
      </BaseRadio.Root>
      {label != null && <Field.Label className={LABEL}>{label}</Field.Label>}
    </Field.Root>
  );
}

export const Radio = {
  Group: RadioGroup,
  Item: RadioItem,
};
