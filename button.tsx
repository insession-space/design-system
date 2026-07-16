import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './spinner.tsx';

// DS のボタン（純粋 leaf UI）。claude design "INSESSION Design System" のボタン仕様に準拠（#463）。
// variant: primary=中立塗り(fill) / accent=コーラル / secondary=2px アウトライン / ghost=テキスト(info) /
//   danger=危険(アプリ固有・DS外だが必要) / join=ライブ緑の pill + 先頭ドット(Join session)。
// radius は DS の md(10px)、join のみ pill。font 15px、weight は primary/accent/secondary/danger/join=700・
// ghost=600。disabled は DS の沈んだ面(surface-3 + text-dim)。ホバーは DS の控えめさに合わせ opacity/tint の
// 微変化に留める（旧ブランドの glow は使わない）。フォーカスは shadow-focus。i18n は持たない（ラベルは children）。
export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'join';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // 読み込み中。スピナーを表示し操作不可にする（disabled と同様に押せない）。
  loading?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { className?: string };

// border-2 を基底に置き、secondary(2px 枠)と他(透明枠)で外形を揃える(box-border)。
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md border-2 border-solid border-transparent box-border font-display cursor-pointer select-none transition-[transform,opacity,background,color,box-shadow] duration-(--dur-fast) ease-spring enabled:active:scale-[0.97] disabled:bg-surface-3 disabled:text-text-dim disabled:border-transparent disabled:cursor-not-allowed disabled:shadow-none focus-visible:shadow-focus focus-visible:outline-none';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-fill text-on-fill font-bold enabled:hover:opacity-90',
  accent: 'bg-accent text-on-accent font-bold enabled:hover:opacity-90',
  secondary: 'bg-transparent border-text text-text font-bold enabled:hover:bg-tint-5',
  ghost: 'bg-transparent text-info font-semibold enabled:hover:bg-info-surface',
  danger:
    'bg-danger-surface border-danger-border text-danger font-bold enabled:hover:bg-danger-border',
  join: 'rounded-pill bg-success text-white font-bold enabled:hover:opacity-90',
};

// DS の padding。primary/accent/danger/join は 12/22。ghost は横を詰める(テキストボタン)。
const SIZE: Record<ButtonSize, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-md px-[22px] py-3',
  lg: 'text-md px-7 py-3.5',
};
const GHOST_PAD = 'px-3.5';

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
  const pad = variant === 'ghost' ? `${SIZE[size]} ${GHOST_PAD}` : SIZE[size];
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${BASE} ${VARIANT[variant]} ${pad} ${className}`.trim()}
      {...rest}
    >
      {variant === 'join' && !loading && (
        <span className="h-2 w-2 rounded-pill bg-white" aria-hidden="true" />
      )}
      {loading && <Spinner size={SPINNER_SIZE[size]} />}
      {children}
    </button>
  );
}
