import type { ButtonHTMLAttributes, ReactNode } from 'react';

// アイコンのみの正方形ボタン（純粋 leaf UI）。claude design "INSESSION Design System" 準拠（loophub #682）。
// variant: surface(既定。surface-2 面 + border + hover surface-hover) / accent(coral 塗り) /
// ghost(透明地・hover のみ面が付く)。icon は呼び出し側が `.mi` span か Icon(icons/icon.tsx) を渡す
// (Material Symbols の ligature 名を使う箇所があるため、Button と違い IconName 限定にしない)。
// aria-label は必須(label prop)。i18n は持たない。
export type IconButtonVariant = 'surface' | 'accent' | 'ghost';

export type IconButtonProps = {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  // 一辺の長さ(px)。既定 36。
  size?: number;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

const VARIANT: Record<IconButtonVariant, string> = {
  surface:
    'bg-surface-2 border border-solid border-border text-text-dim enabled:hover:bg-surface-hover enabled:hover:text-text',
  accent:
    'bg-accent border border-solid border-transparent text-on-accent enabled:hover:brightness-[.93]',
  ghost:
    'bg-transparent border border-solid border-transparent text-text-dim enabled:hover:bg-surface-hover',
};

export default function IconButton({
  label,
  icon,
  variant = 'surface',
  size = 36,
  type = 'button',
  className = '',
  disabled,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled}
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-md cursor-pointer transition-colors duration-(--dur-fast) disabled:cursor-not-allowed disabled:opacity-(--disabled-opacity) focus-visible:shadow-focus focus-visible:outline-none ${VARIANT[variant]} ${className}`.trim()}
      {...rest}
    >
      {icon}
    </button>
  );
}
