import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId, useState } from 'react';

// DS のテキスト入力（純粋 leaf UI）。claude design "INSESSION Design System" の Inputs 仕様に準拠（#463 / #663）。
// ラベルは mono・大文字（Label caps）。DS どおり focused を state 追跡し、label/border/ring を切替える:
//   error → accent（枠 + ラベル + 下メッセージ）、focused → info（枠 + ラベル + リング）、default → text-dim / border。
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

const LABEL = 'font-mono text-xs font-semibold tracking-widest uppercase transition-colors';
// field(ラッパー)。surface-2 / border 1.5px / radius md / pad 12x14。focus リング/枠色は状態で足す。
const FIELD =
  'flex items-center w-full bg-surface-2 border-[1.5px] border-solid rounded-md px-3.5 py-3 transition-[border-color,box-shadow] duration-(--dur-fast)';
const CONTROL =
  'flex-1 min-w-0 border-none outline-none bg-transparent text-md text-text placeholder:text-text-faint';

export default function Input({
  label,
  error,
  prefix,
  id,
  onFocus,
  onBlur,
  className = '',
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const invalid = error != null && error !== false;
  const [focused, setFocused] = useState(false);
  // 状態の優先度: error > focused > default。
  const labelColor = invalid ? 'text-accent' : focused ? 'text-info' : 'text-text-dim';
  const fieldState = invalid
    ? 'border-accent'
    : focused
      ? 'border-info shadow-focus'
      : 'border-border';
  return (
    <div className={`flex flex-col gap-[7px] ${className}`.trim()}>
      {label != null && (
        <label htmlFor={inputId} className={`${LABEL} ${labelColor}`}>
          {label}
        </label>
      )}
      <div className={`${FIELD} ${fieldState}`}>
        {prefix != null && (
          <span className="mr-0.5 shrink-0 font-mono text-md text-text-dim">{prefix}</span>
        )}
        <input
          id={inputId}
          aria-invalid={invalid || undefined}
          className={CONTROL}
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
      {invalid && <span className="text-xs text-accent">{error}</span>}
    </div>
  );
}
