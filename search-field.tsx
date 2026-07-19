import type { InputHTMLAttributes } from 'react';
import Icon from './icons/icon.tsx';

// 検索入力（純粋 leaf UI）。claude design "INSESSION Design System" 準拠（ON SESSION #682）。
// Input と同系の surface-2 面 + 1.5px border + radius-md + focus-within リング。左に search
// アイコンを固定表示する(常時 search 固定なので Input の prefix とは別プリミティブにしてある)。
// i18n は持たない(placeholder は呼び出し側が渡す)。
export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  className?: string;
};

const FIELD =
  'flex items-center gap-2 w-full bg-surface-2 border-[1.5px] border-solid border-border rounded-md px-3.5 py-2.5 transition-[border-color,box-shadow] duration-(--dur-fast) focus-within:border-info focus-within:shadow-focus';
const CONTROL =
  'flex-1 min-w-0 border-none outline-none bg-transparent text-md text-text placeholder:text-text-faint';

export default function SearchField({ className = '', ...rest }: SearchFieldProps) {
  return (
    <div className={`${FIELD} ${className}`.trim()}>
      <Icon name="search" size={16} className="shrink-0 text-text-faint" />
      <input className={CONTROL} {...rest} />
    </div>
  );
}
