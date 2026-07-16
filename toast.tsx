import type { ReactNode } from 'react';

// トースト / スナックバー（純粋 leaf UI）。既定は画面下部中央に固定表示（fixed）。tone でアクセント色
// （アイコン/枠）を切替える。アイコンは props 注入（このパッケージの Icon を呼び出し側が渡す）。i18n は持たない。
// variant='snackbar' は legacy feature 側 .snackbar の見た目を1pxも変えずに再現する専用パレット
// （bg=snackbar-surface / padding 11px 20px / gap 9px / success=border-strong+mint / error=soft pink）。
export type ToastTone = 'success' | 'error' | 'info';
export type ToastVariant = 'default' | 'snackbar';

// variant ごとの tone→(border 色 / icon 色) マップ。
const TONE: Record<ToastVariant, Record<ToastTone, { border: string; icon: string }>> = {
  default: {
    success: { border: 'border-success-border', icon: 'text-success' },
    error: { border: 'border-danger-border', icon: 'text-danger' },
    info: { border: 'border-info-border', icon: 'text-info' },
  },
  // legacy .snackbar / .snackbar.error の配色。success(既定)は border-strong + mint アイコン、
  // error は soft pink(danger 赤とは別系統)。info は snackbar では未使用なので success に倣う。
  snackbar: {
    success: { border: 'border-border-strong', icon: 'text-success' },
    error: { border: 'border-snackbar-danger-border', icon: 'text-snackbar-danger' },
    info: { border: 'border-border-strong', icon: 'text-success' },
  },
};

// variant ごとの箱（surface / padding / gap / 文字サイズ）。border/tone 色は TONE 側で足す。
// snackbar は legacy .snackbar が line-height を指定せず body 継承だったため text-base(line-height:normal)
// ではなく font-size のみの text-[14px] を使い、高さを1pxも変えない。
const BOX: Record<ToastVariant, string> = {
  default: 'gap-2.5 bg-surface-2 px-5 py-3 text-base',
  snackbar: 'gap-[9px] bg-snackbar-surface px-5 py-[11px] text-[14px]',
};
const BASE = 'inline-flex items-center rounded-pill border border-solid text-text shadow-overlay';
// 固定表示。中央寄せの transform は snackbar-in キーフレーム（translate(-50%,0) で終わる）に委ねる。
const FIXED =
  'fixed bottom-[26px] left-1/2 z-(--z-snackbar) pointer-events-none animate-[snackbar-in_var(--dur-slow)_var(--ease-spring)_both]';

export type ToastProps = {
  children: ReactNode;
  tone?: ToastTone;
  // 見た目のバリアント。既定 'default'（DS トースト）。'snackbar' は legacy .snackbar 互換パレット。
  variant?: ToastVariant;
  // 行頭アイコン（省略可）。色は tone に追従する。
  icon?: ReactNode;
  // 画面下部中央に固定表示する（既定 true）。false で inline 配置（カタログ/埋め込み用）。
  fixed?: boolean;
  // スクリーンリーダーへの通知の緊急度。既定 'status'（polite）、エラー等は 'alert'。
  role?: 'status' | 'alert';
  className?: string;
};

export default function Toast({
  children,
  tone = 'success',
  variant = 'default',
  icon,
  fixed = true,
  role = 'status',
  className = '',
}: ToastProps) {
  const t = TONE[variant][tone];
  // snackbar は legacy .snackbar-icon(inline span / font-size 13 / weight 800)を再現し、
  // アイコン行ボックスの高さを1pxも変えない。default は従来どおり inline-flex。
  const iconClass =
    variant === 'snackbar' ? `${t.icon} text-[13px] font-extrabold` : `inline-flex ${t.icon}`;
  return (
    <div
      role={role}
      className={`${BASE} ${BOX[variant]} ${t.border}${fixed ? ` ${FIXED}` : ''} ${className}`.trim()}
    >
      {icon && (
        <span className={iconClass} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}
