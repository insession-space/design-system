import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './spinner.tsx';

// DS のボタン（純粋 leaf UI）。claude design "INSESSION Design System" のボタン仕様に準拠（#463）。
// variant: primary=中立塗り(fill) / accent=コーラル / secondary=2px アウトライン / ghost=テキスト(info) /
//   danger=危険(アプリ固有・DS外だが必要) / join=ライブ緑の pill + 先頭ドット(Join session)。
// radius は既定 DS の md(10px)。pill prop で rounded-pill、join は常に pill。font 15px、weight は primary/accent/secondary/danger/join=700・
// ghost=600。disabled は DS の沈んだ面(surface-3 + text-dim)。ホバーは DS の控えめさに合わせ opacity/tint の
// 微変化に留める（旧ブランドの glow は使わない）。フォーカスは shadow-focus。i18n は持たない（ラベルは children）。
export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'join';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // 読み込み中。スピナーを表示し操作不可にする（disabled と同様に押せない）。
  loading?: boolean;
  // pill 形状(rounded-pill)にする。既定は DS の md(rounded-md)。ポップオーバー内の
  // コンパクトなアップロード導線など丸い体裁が欲しい箇所で使う(#517)。join は歴史的に常に pill。
  pill?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { className?: string };

// border-2 を基底に置き、secondary(2px 枠)と他(透明枠)で外形を揃える(box-border)。
// 角丸(rounded-md / rounded-pill)は同一ユーティリティの競合を避けるため BASE に含めず
// radius として一方だけを組み立てて付与する(#517)。
const BASE =
  'inline-flex items-center justify-center gap-2 border-2 border-solid border-transparent box-border font-display cursor-pointer select-none transition-[transform,opacity,background,color,box-shadow] duration-(--dur-fast) ease-spring enabled:active:scale-[0.97] disabled:bg-surface-3 disabled:text-text-dim disabled:border-transparent disabled:cursor-not-allowed disabled:shadow-none focus-visible:shadow-focus focus-visible:outline-none';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-fill text-on-fill font-bold enabled:hover:opacity-90',
  accent: 'bg-accent text-on-accent font-bold enabled:hover:opacity-90',
  secondary: 'bg-transparent border-text text-text font-bold enabled:hover:bg-tint-5',
  ghost: 'bg-transparent text-info font-semibold enabled:hover:bg-info-surface',
  danger:
    'bg-danger-surface border-danger-border text-danger font-bold enabled:hover:bg-danger-border',
  join: 'bg-success text-white font-bold enabled:hover:opacity-90',
};

// DS の padding。primary/accent/danger/join は 12/22。ghost は横を詰める(テキストボタン)。
// xs はポップオーバー/モバイル向けのコンパクト(#517)。
const SIZE: Record<ButtonSize, string> = {
  xs: 'text-xs px-3 py-1.5',
  sm: 'text-sm px-4 py-2',
  md: 'text-md px-[22px] py-3',
  lg: 'text-md px-7 py-3.5',
};
const GHOST_PAD = 'px-3.5';

const SPINNER_SIZE: Record<ButtonSize, number> = { xs: 12, sm: 13, md: 15, lg: 16 };

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  pill = false,
  type = 'button',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const pad = variant === 'ghost' ? `${SIZE[size]} ${GHOST_PAD}` : SIZE[size];
  // join は歴史的に常に pill 形状。それ以外は pill prop に従う。
  const radius = pill || variant === 'join' ? 'rounded-pill' : 'rounded-md';
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${BASE} ${radius} ${VARIANT[variant]} ${pad} ${className}`.trim()}
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
