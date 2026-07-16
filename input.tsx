import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';

// DS のテキスト入力（純粋 leaf UI）。claude design "INSESSION Design System" の Inputs 仕様に準拠（#463）。
// ラベルは mono・大文字（Label caps）。既定=border、フォーカス=info 枠 + info リング、
// error=accent 枠 + エラーテキスト。field は surface-2 / border 1.5px / radius md(10) / pad 12/14 / font 15。
// i18n は持たない（label / error は文字列を受け取る）。
export type InputProps = {
  label?: ReactNode;
  // エラーメッセージ。指定すると error 状態（accent 枠 + 下にメッセージ）になる。
  error?: ReactNode;
  // ラベルと field の間に挟む補助要素（任意）。
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

const LABEL = 'font-mono text-xs font-semibold tracking-[0.1em] uppercase';
const FIELD =
  'w-full bg-surface-2 border-[1.5px] border-solid rounded-md px-3.5 py-3 text-md text-text placeholder:text-text-faint outline-none transition-[border-color,box-shadow] duration-(--dur-fast)';

export default function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const invalid = error != null && error !== false;
  return (
    <div className={`flex flex-col gap-[7px] ${className}`.trim()}>
      {label != null && (
        <label
          htmlFor={inputId}
          className={`${LABEL} ${invalid ? 'text-accent' : 'text-text-dim'}`}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={invalid || undefined}
        className={`${FIELD} ${
          invalid
            ? 'border-accent'
            : 'border-border focus-visible:border-info focus-visible:shadow-focus'
        }`}
        {...rest}
      />
      {invalid && <span className="text-xs text-accent">{error}</span>}
    </div>
  );
}
