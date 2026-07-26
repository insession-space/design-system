import { Field } from '@base-ui/react/field';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';

// DS のテキスト入力（純粋 leaf UI）。claude design "INSESSION Design System" の Inputs 仕様に準拠（#463 / #663）。
// label と control の紐付け・error メッセージの aria 連携を Base UI の Field へ委譲する（#22）。
// DS 側はトークンベースの見た目だけを持つ。
//
// **props シグネチャは移行前から変えていない**（label / error / prefix + input の属性）。
// 変わったのは内部だけ:
//   - useId + htmlFor の手組み → Field.Label / Field.Control が自動で紐付ける
//   - aria-invalid の手当て → Field.Root の invalid から出る。error は Field.Error として
//     描画され aria-describedby が張られる（移行前は素の <span> で、支援技術から
//     エラーが入力欄に紐付いていなかった）
//
// focus の追跡だけは自前の useState を維持している。ラッパーの <div>（prefix を横に
// 並べるための箱）は Base UI のパートではないため Field の state を直接受け取れず、
// group-has-[…] のバリアントで代替すると error / focused / default が同じプロパティを
// 奪い合ってしまうため（#17 の衝突と同じ構図）。優先度を JS 側で解決して1つだけ出す。
//
// ラベルは mono・大文字（Label caps）。状態で label/border/ring を切替える:
//   error → accent（枠 + ラベル + 下メッセージ）、focused → info（枠 + ラベル + リング）、
//   default → text-dim / border。
// field は surface-2 / border 1.5px / radius md(10) / pad 12/14 / font 15。prefix は field 内・input 左に
// mono の接頭辞（例 insession.app/r/）を text-dim で置く。i18n は持たない（label / error は文字列を受け取る）。
export type InputProps = {
  label?: ReactNode;
  // エラーメッセージ。指定すると error 状態（accent 枠 + 下にメッセージ）になる。
  error?: ReactNode;
  // field 内・input の左に置く mono の接頭辞（任意）。例: 'insession.app/r/'。
  prefix?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

// Input / Textarea で共有する見た目。並べて置いたときに揃うのが要件なので、
// 値を変えるときは必ず両方に効くこの定数を変えること。
export const FIELD_LABEL =
  'font-mono text-xs font-semibold tracking-widest uppercase transition-colors';
// ⚠ **縦 padding はここに含めない。** Input / Textarea は py-3 だが SearchField は py-2.5 と
// 一段浅く、共通側に py-3 を持たせると呼び出し側の py-2.5 では打ち消せない（同一プロパティの
// ユーティリティは配布 CSS の出力順で勝敗が決まる。#21 と同じ構図で、実測でも py-3 が勝った）。
// 「打ち消す」のをやめ、**縦 padding は各コンポーネントが必ず自分で指定する**契約にする。
export const FIELD_BOX_BASE =
  'flex w-full bg-surface-2 border-[1.5px] border-solid rounded-md px-3.5 transition-[border-color,box-shadow] duration-(--dur-fast)';
export const FIELD_CONTROL =
  'flex-1 min-w-0 border-none outline-none bg-transparent text-md text-text placeholder:text-text-faint';

// 状態の優先度: error > focused > default。
export function fieldLabelColor(invalid: boolean, focused: boolean) {
  if (invalid) return 'text-accent';
  return focused ? 'text-info' : 'text-text-dim';
}
export function fieldBoxState(invalid: boolean, focused: boolean) {
  if (invalid) return 'border-accent';
  return focused ? 'border-info shadow-focus' : 'border-border';
}

export default function Input({
  label,
  error,
  prefix,
  onFocus,
  onBlur,
  className = '',
  disabled,
  ...rest
}: InputProps) {
  const invalid = error != null && error !== false;
  const [focused, setFocused] = useState(false);
  return (
    <Field.Root
      disabled={disabled}
      invalid={invalid}
      className={`flex flex-col gap-[7px] ${className}`.trim()}
    >
      {label != null && (
        <Field.Label className={`${FIELD_LABEL} ${fieldLabelColor(invalid, focused)}`}>
          {label}
        </Field.Label>
      )}
      <div className={`${FIELD_BOX_BASE} items-center py-3 ${fieldBoxState(invalid, focused)}`}>
        {prefix != null && (
          <span className="mr-0.5 shrink-0 font-mono text-md text-text-dim">{prefix}</span>
        )}
        <Field.Control
          className={FIELD_CONTROL}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </div>
      {/* match を明示するのが要点。既定（match 未指定）の Field.Error は **ネイティブの
          ValidityState** を見て出し分ける仕様で、DS のように「アプリ側が判定した error を
          props で受け取る」使い方では rendered=false のままになり、control に
          aria-describedby が張られない（表示はされるのに支援技術からエラーが入力欄に
          紐付かない）。invalid のときだけこの要素を描画しているので match={true} でよい。 */}
      {invalid && (
        <Field.Error match className="text-xs text-accent">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}
