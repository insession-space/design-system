import type { ReactNode } from 'react';

// トースト / スナックバー（純粋 leaf UI）。feature 固有だった snackbar の見た目を踏襲しつつ DS に
// 集約する。既定は画面下部中央に固定表示（fixed）。tone でアクセント色（アイコン/枠）を切替える。
// アイコンは props 注入（このパッケージの Icon を呼び出し側が渡す）。i18n は持たない。
export type ToastTone = 'success' | 'error' | 'info';

const TONE: Record<ToastTone, { border: string; icon: string }> = {
  success: { border: 'border-success-border', icon: 'text-success' },
  error: { border: 'border-danger-border', icon: 'text-danger' },
  info: { border: 'border-info-border', icon: 'text-info' },
};

export type ToastProps = {
  children: ReactNode;
  tone?: ToastTone;
  // 行頭アイコン（省略可）。色は tone に追従する。
  icon?: ReactNode;
  // 画面下部中央に固定表示する（既定 true）。false で inline 配置（カタログ/埋め込み用）。
  fixed?: boolean;
  // スクリーンリーダーへの通知の緊急度。既定 'status'（polite）、エラー等は 'alert'。
  role?: 'status' | 'alert';
  className?: string;
};

const BASE =
  'inline-flex items-center gap-2.5 rounded-pill border border-solid bg-surface-2 px-5 py-3 text-base text-text shadow-overlay';
// 固定表示。中央寄せの transform は snackbar-in キーフレーム（translate(-50%,0) で終わる）に委ねる。
const FIXED =
  'fixed bottom-[26px] left-1/2 z-(--z-snackbar) pointer-events-none animate-[snackbar-in_var(--dur-slow)_var(--ease-spring)_both]';

export default function Toast({
  children,
  tone = 'success',
  icon,
  fixed = true,
  role = 'status',
  className = '',
}: ToastProps) {
  return (
    <div
      role={role}
      className={`${BASE} ${TONE[tone].border}${fixed ? ` ${FIXED}` : ''} ${className}`.trim()}
    >
      {icon && (
        <span className={`inline-flex ${TONE[tone].icon}`} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}
