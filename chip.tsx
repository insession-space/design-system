import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Icon from './icons/icon.tsx';

// DS の Chip（純粋 leaf UI）。claude design "INSESSION Design System" の Chip 仕様に準拠（#463）。
// タップできる要素（クイック返信・フィルター・タグ・入力トークン）。既定=surface-2 + border-2、
// selected=accent tint(12%) + accent 枠 + accent 文字 + チェック。pill、12.5px/600、pad 7/14。
// i18n は持たない（ラベルは children）。
export type ChipProps = {
  // 選択状態。true で accent tint + 枠 + チェックになる。
  selected?: boolean;
  // 行頭アイコン（任意）。
  icon?: ReactNode;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { className?: string };

const BASE =
  'inline-flex items-center gap-1.5 rounded-pill border border-solid text-sm font-semibold px-3.5 py-[7px] cursor-pointer select-none transition-colors duration-(--dur-fast)';
const DEFAULT = 'bg-surface-2 border-border-strong text-text enabled:hover:bg-surface-hover';
const SELECTED = 'bg-tint-12 border-accent text-accent font-bold';

export default function Chip({
  selected = false,
  icon,
  children,
  type = 'button',
  className = '',
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`${BASE} ${selected ? SELECTED : DEFAULT} ${className}`.trim()}
      {...rest}
    >
      {icon}
      {children}
      {selected && <Icon name="check" size={15} />}
    </button>
  );
}
