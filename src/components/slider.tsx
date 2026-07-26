import { Field } from '@base-ui/react/field';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import type * as React from 'react';
import type { ReactNode } from 'react';
import { FIELD_LABEL, fieldLabelColor } from './input.tsx';

// DS のスライダー（純粋 leaf UI。#53）。振る舞いは Base UI の Slider へ委譲し、
// DS 側はトークンベースの見た目だけを持つ（#22 と同じ方針）。
//
// なぜ必要だったか: 消費側（insession-app）が `<input type="range">` + 自前 CSS で
// 音量スライダーを3種（カセット / レコード / CD プレイヤーの overlay）、whiteboard の
// ペン太さ・不透明度で3箇所、計6箇所を手組みしていた。`::-webkit-slider-thumb` と
// `::-moz-range-thumb` をブラウザ別に書き分ける必要があり、trackの塗り分け（値までを
// accent、以降を border）も自前で `background: linear-gradient(...)` を組み立てていた。
//
// Base UI へ委譲して得たもの: キーボード操作（矢印 / Home / End / PageUp/Down）、
// タッチとポインタの正規化、min/max/step の丸め、RTL、複数 thumb（range スライダー）、
// form 連携（name / 隠し input）、Field との自動連携。
//
// ⚠ 状態別のクラスは `data-dragging:` 等のバリアントではなく className の関数形
// （state => string）で **排他的に** 出す（#17 の教訓）。同一プロパティのユーティリティを
// 1つのクラス属性に同時に並べると、勝敗が配布 CSS の出力順で決まってしまう。
//
// ⚠ `disabled:` ではなく `data-disabled:` で書く。Base UI が描画するのは `<div>` /
// `<span role="slider">` で、CSS の `:disabled` 疑似クラスはフォーム要素にしか適用され
// ないため効かない（toggle.tsx / radio.tsx と同じ理由）。

// Base UI の props をそのまま継承する（`name` / `orientation` / `minStepsBetweenValues` /
// 任意の aria-* / data-* が通るようにするため。手で列挙すると必ず取りこぼす）。
// DS が差し替えるのは className（関数形ではなく文字列で受ける）と、足す label / valueLabel。
export type SliderProps = Omit<
  React.ComponentProps<typeof BaseSlider.Root>,
  'className' | 'render'
> & {
  // 上部に出すラベル。Input と同じ mono / uppercase / tracking-widest の FIELD_LABEL。
  label?: ReactNode;
  // ラベル行の右端に出す現在値の表示。**整形済みの文字列を受け取る**
  // （`80%` / `12px` のような単位付けは消費側の責務。DS は i18n もフォーマットも持たない）。
  valueLabel?: ReactNode;
  className?: string;
};

const TRACK = 'relative h-1.5 w-full grow rounded-pill bg-border';
// Indicator は「min から現在値まで」を塗る。
// ⚠ position は書かない。Base UI が Indicator へ `position: relative` を **inline style で**
// 当てるため、`absolute` を足しても inline に負けて無効になる（実測で
// `style="position: relative"` が出ていた）。効かないクラスを残すと「絶対配置で組んである」
// という誤読を招くので置かない。inset/width も Base UI が inline で入れる。
const INDICATOR = 'rounded-pill bg-accent';
const THUMB =
  'size-4 rounded-pill bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-(--dur-fast) focus-visible:shadow-focus focus-visible:outline-none';

export default function Slider({
  label,
  valueLabel,
  disabled = false,
  className = '',
  ...rest
}: SliderProps) {
  return (
    <Field.Root
      disabled={disabled}
      className={`flex w-full flex-col gap-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 ${className}`.trim()}
    >
      {(label || valueLabel) && (
        <div className="flex items-baseline justify-between gap-2">
          {label ? (
            <Field.Label className={`${FIELD_LABEL} ${fieldLabelColor(false, false)}`}>
              {label}
            </Field.Label>
          ) : (
            <span />
          )}
          {valueLabel ? (
            // 数字が並ぶので tabular-nums。値が動いても幅が揺れない。
            <span className="font-mono text-xs text-text-dim tabular-nums">{valueLabel}</span>
          ) : null}
        </div>
      )}
      <BaseSlider.Root disabled={disabled} {...rest}>
        <BaseSlider.Control className="flex w-full touch-none items-center py-2 select-none">
          <BaseSlider.Track className={TRACK}>
            <BaseSlider.Indicator className={INDICATOR} />
            {/* Thumb は values の数だけ描かれる（単一値なら1つ、range なら2つ）。
                render prop で受けないと複数 thumb のとき key が付かないため、
                Base UI の推奨どおり Thumb を1つ書いて内部で複製させる。 */}
            <BaseSlider.Thumb
              className={(state) =>
                `${THUMB} ${state.dragging ? 'scale-115' : 'scale-100'} ${
                  state.disabled ? 'cursor-not-allowed' : 'cursor-grab'
                }`
              }
            />
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
    </Field.Root>
  );
}
