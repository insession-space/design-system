import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import Icon from './icons/icon.tsx';

// DS のチェックボックス（純粋 leaf UI）。claude design "INSESSION Design System" の Controls 仕様に準拠（#463）。
// 22x22 / radius 6(chip)。off=2px 枠、on=fill 塗り + on-fill のチェック。ネイティブ input を視覚的に隠し
// (a11y/フォーカス維持)、隣の span を状態で描画する。i18n は持たない（label は children 相当の prop）。
export type CheckboxProps = {
  checked: boolean;
  label?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'>;

export default function Checkbox({ checked, label, id, className = '', ...rest }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={`inline-flex cursor-pointer select-none items-center gap-3 ${className}`.trim()}
    >
      <input id={inputId} type="checkbox" checked={checked} className="peer sr-only" {...rest} />
      <span
        className={`grid h-[22px] w-[22px] place-items-center rounded-chip border-2 border-solid transition-colors peer-focus-visible:shadow-focus ${
          checked
            ? 'border-fill bg-fill text-on-fill'
            : 'border-border-strong bg-transparent text-transparent'
        }`}
      >
        <Icon name="check" size={15} />
      </span>
      {label != null && <span className="text-md text-text">{label}</span>}
    </label>
  );
}
