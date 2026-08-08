import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Field } from '@base-ui/react/field';
import type * as React from 'react';
import type { ReactNode } from 'react';
import Icon from '../icons/icon.tsx';
import { FOCUS_RING } from '../lib/class-presets.ts';
import { twMerge } from '../lib/tw-merge.ts';

// DS のチェックボックス（純粋 leaf UI）。claude design "INSESSION Design System" の Controls 仕様に準拠（#463）。
// 振る舞いは Base UI の Checkbox へ委譲する（#22）。DS 側はトークンベースの見た目だけを持つ。
// 22x22 / radius 6(chip)。off=2px 枠、on=fill 塗り + on-fill のチェック。i18n は持たない（label は prop）。
//
// ── 移行に伴う破壊的変更（2.x → 3.0）─────────────────────
// `onChange`(React.ChangeEvent<HTMLInputElement>) を受けていたが、Base UI の Checkbox は
// **`onCheckedChange(checked, eventDetails)`** で状態を通知する。Root が描画するのは
// `<button role="checkbox">` で、フォーム連携用の `<input>` は Base UI が内部に隠し持つため、
// DS から ChangeEvent を組み立てて渡すことはできない。`onCheckedChange` へ移行すること。
//
//   <Checkbox checked={v} onChange={(e) => set(e.target.checked)} />   // 2.x
//   <Checkbox checked={v} onCheckedChange={(c) => set(c)} />           // 3.0
//
// ラベルの紐付けは Base UI の Field.Label に委譲した。`<label htmlFor>` が使えないため
// （HTML 仕様上 `<button>` は labelable element ではなく for の対象にできない）。Field.Label は
// control の id を自動で解決して紐付けるので、クリックでの toggle とスクリーンリーダーの
// 読み上げが両方とも成立する。
//
// ⚠ 状態別のクラスは data-checked: バリアントではなく className の関数形（state => string）で
// **排他的に** 出す（#17 の教訓）。同一プロパティ（border-color / background-color / color）の
// ユーティリティを1つのクラス属性に同時に並べると、勝敗が配布 CSS の出力順で決まってしまう。
// Base UI の Checkbox.Root の props をそのまま継承する（`form` / `value` / `inputRef` /
// 任意の aria-* / data-* が通るようにするため。手で列挙すると必ず取りこぼす）。
// DS 側で差し替えるのは className（関数形ではなく文字列で受ける）と、追加の label だけ。
// render は DS が Indicator の中身を決めているので外に出さない。
export type CheckboxProps = Omit<
  React.ComponentProps<typeof BaseCheckbox.Root>,
  'className' | 'render'
> & {
  label?: ReactNode;
  className?: string;
};

// ⚠ disabled は `disabled:` ではなく `data-disabled:` で書く。Base UI の Checkbox.Root が
// 描画するのは `<span role="checkbox">` で、CSS の :disabled 疑似クラスはフォーム要素にしか
// 適用されないため効かない（toggle.tsx / menu.tsx と同じ理由）。
const BOX = `relative grid h-[22px] w-[22px] place-items-center rounded-chip before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:size-(--control-hit-size) pointer-coarse:before:size-(--control-touch-size) before:content-[""] border-2 border-solid p-0 transition-colors motion-reduce:transition-none ${FOCUS_RING}`;

// disabled の見た目（薄く + not-allowed）は box だけでなく **ラベルを含む行全体** に効かせる。
// has-[[data-disabled]] にしているのは、disabled が親から降ってくる経路があるため
// （Radio の RadioGroup disabled 相当。Checkbox でも Field.Root 経由で降りうる）。
// ラッパー自身の disabled prop だけを見ると、その経路を取りこぼして「操作できないのに
// 有効に見える」行が残る。子孫に data-disabled が立っていれば当たる形にしておく。
// cursor は行全体で1箇所に決める（子に cursor-pointer を置くと親の not-allowed に勝つ）。
const ROW =
  'inline-flex select-none items-center gap-3 min-h-(--control-hit-size) pointer-coarse:min-h-(--control-touch-size) pointer-coarse:min-w-(--control-touch-size) cursor-pointer has-[>[data-disabled]]:cursor-not-allowed has-[>[data-disabled]]:opacity-50';

// ⚠ ラベル(Field.Label = <label>)には cursor-[inherit] を当てる。cursor は継承プロパティだが
// 実測すると <label> だけ default のままで（行が pointer でも継承されない）、移行前の
// 「ラベルテキスト上でも pointer」から回帰する。inherit を明示すれば行の cursor
// （pointer / disabled 時 not-allowed）にそのまま追従するので、状態ごとの出し分けが要らない。
// 子孫セレクタ（[&_label]:cursor-pointer）でも書けるが、その記法は Tailwind のソース走査で
// 拾われず配布 CSS に生成されなかった（実測。check:styles は素のクラス名しか見ないので
// この欠損を検出できない）。
const LABEL = 'cursor-[inherit] text-base text-text';

export default function Checkbox({ label, className = '', disabled, ...rest }: CheckboxProps) {
  return (
    <Field.Root disabled={disabled} className={twMerge(ROW, className)}>
      <BaseCheckbox.Root
        disabled={disabled}
        className={(state) =>
          `${BOX} ${
            state.checked
              ? 'border-fill bg-fill text-on-fill forced-colors:border-[Highlight] forced-colors:text-[color:Highlight]'
              : 'border-control-border bg-transparent text-transparent'
          }`
        }
        {...rest}
      >
        {/* Indicator は checked のときだけ描画される。移行前は常に Icon を置いて色を
            transparent にしていたが、22x22 の枠はチェックの有無で変わらないため
            レイアウトは同一に保たれる。
            indeterminate は移行前も持っていなかったので対応しない（DS に中間状態の
            アイコンが無く、見た目の仕様も決まっていないため）。 */}
        <BaseCheckbox.Indicator
          render={(props) => (
            <span {...props}>
              <Icon name="check" size={15} />
            </span>
          )}
        />
      </BaseCheckbox.Root>
      {label != null && <Field.Label className={LABEL}>{label}</Field.Label>}
    </Field.Root>
  );
}
