import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './spinner.tsx';

// DS のボタン（純粋 leaf UI）。legacy CSS の base button / button.ghost / 各所の danger 系を
// トークン経由のユーティリティで再構成し、variant / size / loading・disabled を一本化する。
// トンマナ: tinted surface + 細ボーダー + ホバー時のみ控えめな発光（shadow-glow）。
// フォーカスは shadow-focus（focus-ring トークン）。i18n は持たない（ラベルは children）。
export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // 読み込み中。スピナーを表示し操作不可にする（disabled と同様に押せない）。
  loading?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { className?: string };

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-pill border border-solid font-display font-bold tracking-[0.04em] cursor-pointer select-none transition-[transform,box-shadow,background,color] duration-(--dur-fast) ease-spring enabled:active:scale-[0.97] disabled:opacity-(--disabled-opacity) disabled:cursor-not-allowed focus-visible:shadow-focus focus-visible:outline-none';

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-tint-12 border-border-strong text-mint-soft enabled:hover:bg-tint-16 enabled:hover:shadow-glow',
  ghost:
    'bg-tint-5 border-border text-text-dim enabled:hover:bg-tint-12 enabled:hover:text-text enabled:hover:shadow-glow',
  danger:
    'bg-danger-surface border-danger-border text-danger enabled:hover:bg-danger-border enabled:hover:shadow-glow',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-6 py-3',
  lg: 'text-md px-7 py-3.5',
};

const SPINNER_SIZE: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 16 };

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`.trim()}
      {...rest}
    >
      {loading && <Spinner size={SPINNER_SIZE[size]} />}
      {children}
    </button>
  );
}
