import { Switch } from '@base-ui/react/switch';
import type * as React from 'react';

// DS の Switch（トグル。純粋 leaf UI）。claude design "INSESSION Design System" の Switch 仕様に準拠（#463 / #663）。
// 振る舞いは Base UI の Switch へ委譲する（#22）。DS 側はトークンベースの見た目だけを持つ。
// track 46x26 の pill、on=success(green) / off=border-strong、knob 20x20 の白丸 + 微ドロップシャドウ、
// off=left3 / on=left23 を transition。disabled は opacity 0.5 + not-allowed。
// signature は移行前から変えていない（checked / onChange / label / disabled）。onChange は
// 「引数なしトグル」のままで、Base UI の onCheckedChange から呼び直している。
// prefers-reduced-motion はクラス文字列に併記した抑制ユーティリティで尊重する。消費側アプリの
// style.css には依存しない(#121。依存していた頃は loophub と DS 単体で抑制が効いていなかった)。
//
// Base UI へ委譲して得たもの: 隠しネイティブ input による form 連携（name / value / form）、
// readOnly、Field との自動連携（Field.Root の中に置けば label / error が紐付く）、
// role="switch" + aria-checked の管理。
//
// ⚠ 状態別のクラスは data-checked: / data-unchecked: バリアントではなく className の
// 関数形（state => string）で **排他的に** 出す（#17 の教訓）。同一プロパティ（ここでは
// background-color）のユーティリティを1つのクラス属性に同時に並べると、勝敗が配布 CSS の
// 出力順で決まってしまい、意図しない方が勝つ事故が起きる。排他で出せばその勝負自体が起きない。
// Base UI の Switch.Root の props を継承しつつ、DS の既存契約だけ差し替える。
//   - onChange: 移行前と同じ「引数なしトグル」。Base UI の onCheckedChange は内部で使うので外に出さない
//   - label: aria-label として使う（Toggle はラベルテキストを描画しない部品なので Switch.Root
//     側の意味とは別。名前が衝突しないよう Omit してから足す）
//   - className: 関数形ではなく文字列で受ける
// これにより name / value / form / readOnly / inputRef / 任意の aria-* / data-* が通る。
export type ToggleProps = Omit<
  React.ComponentProps<typeof Switch.Root>,
  'className' | 'render' | 'onCheckedChange' | 'onChange' | 'aria-label'
> & {
  onChange?: () => void;
  label?: string;
  className?: string;
};

// ⚠ disabled は `disabled:` ではなく `data-disabled:` で書く。Base UI の Switch.Root が
// 描画するのは `<span role="switch">` で（nativeButton 既定が false）、CSS の :disabled
// 疑似クラスはフォーム要素にしか適用されないため効かない。移行時にここを `disabled:` の
// まま残すと、型検査もビルドも通り disabled が視覚的に無効化されないまま出荷される
// （実測で opacity:1 / cursor:pointer のままだった）。menu.tsx の Item も同じ理由で
// data-disabled: を使っている。
const TRACK =
  'relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-pill border border-solid border-transparent p-0 transition-colors motion-reduce:transition-none duration-(--dur-fast) cursor-pointer data-disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:forced-colors:text-[color:GrayText] focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring';
const KNOB =
  'absolute top-[3px] h-5 w-5 rounded-pill bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-[left] motion-reduce:transition-none duration-(--dur-fast)';

// ⚠ checked にデフォルト値（= false）を入れないこと。常に checked を渡すと Switch.Root が
// 必ず controlled 扱いになり、継承した defaultChecked が無視される（`<Toggle defaultChecked />`
// が初期 ON にならない）。undefined のまま渡せば Base UI が uncontrolled として扱い、
// defaultChecked 未指定なら OFF 始まりなので移行前（checked 既定 false）と同じ表示になる。
export default function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  ...rest
}: ToggleProps) {
  return (
    <Switch.Root
      checked={checked}
      disabled={disabled}
      aria-label={label}
      // 移行前の onClick={onChange}（引数なしトグル）と同じ呼び方を保つ。
      onCheckedChange={() => onChange?.()}
      className={(state) =>
        `${TRACK} ${state.checked ? 'bg-success forced-colors:border-[Highlight]' : 'bg-border-strong'} ${className}`.trim()
      }
      {...rest}
    >
      <Switch.Thumb
        className={(state) => `${KNOB} ${state.checked ? 'left-[23px]' : 'left-[3px]'}`}
      />
    </Switch.Root>
  );
}
