import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Icon from './icons/icon.tsx';

// DS の Chip（純粋 leaf UI）。claude design "INSESSION Design System" の Chip 仕様に準拠（#463 / #663）。
// タップできる要素（クイック返信・フィルター・タグ・入力トークン）。非対話の status ラベルは Badge を使う。
// 既定=surface-2 + border-strong、selected=accent tint(12%) + accent 枠(55%) + accent 文字 + check。
// pill、12.5px、weight は selected?700:600。pad は DS の3系統（removable / avatar / 既定）。
// avatar は 22x22 の円（label + color。既定は success green）。removable は末尾に close(text-dim)。
// i18n は持たない（ラベルは children）。
export type ChipAvatar = {
  // 円内の1〜2文字。
  label: ReactNode;
  // 円の背景色（CSS 色。省略時は success green）。
  color?: string;
};

export type ChipProps = {
  // 選択状態。true で accent tint + 枠 + チェックになる。
  selected?: boolean;
  // 行頭アイコン（任意。selected 時は check が優先されるため出さない）。
  icon?: ReactNode;
  // 行頭のアバター円（任意）。
  avatar?: ChipAvatar;
  // 末尾に × を出し、クリックで onRemove を呼ぶ（入力トークン用）。
  removable?: boolean;
  onRemove?: () => void;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { className?: string };

const BASE =
  'inline-flex items-center gap-1.5 rounded-pill border border-solid text-[12.5px] cursor-pointer select-none transition-colors duration-(--dur-fast)';
// DS の3系統の pad。removable=6/10/6/14、avatar=5/13/5/5、既定=7/14。
const PAD_DEFAULT = 'px-3.5 py-[7px]';
const PAD_REMOVABLE = 'pl-[14px] pr-2.5 py-1.5';
const PAD_AVATAR = 'pl-[5px] pr-[13px] py-[5px]';
const DEFAULT = 'bg-surface-2 border-border-strong text-text font-semibold enabled:hover:bg-surface-hover';
// selected 枠は DS の accent 55%。tint は bg-tint-12 を維持。
const SELECTED =
  'bg-tint-12 border-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] text-accent font-bold';

export default function Chip({
  selected = false,
  icon,
  avatar,
  removable = false,
  onRemove,
  children,
  type = 'button',
  className = '',
  ...rest
}: ChipProps) {
  const pad = removable ? PAD_REMOVABLE : avatar ? PAD_AVATAR : PAD_DEFAULT;
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`${BASE} ${pad} ${selected ? SELECTED : DEFAULT} ${className}`.trim()}
      {...rest}
    >
      {avatar && (
        <span
          className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-pill bg-success text-xs font-bold text-white"
          style={avatar.color ? { background: avatar.color } : undefined}
          aria-hidden="true"
        >
          {avatar.label}
        </span>
      )}
      {selected ? <Icon name="check" size={16} /> : icon}
      {children}
      {removable && (
        <span
          role="button"
          tabIndex={-1}
          aria-label="remove"
          className="inline-flex text-text-dim"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          <Icon name="close" size={15} />
        </span>
      )}
    </button>
  );
}
