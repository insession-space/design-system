import type { ReactNode } from 'react';
import Icon from './icons/icon.tsx';

// トースト / スナックバー（純粋 leaf UI）。既定は画面下部中央に固定表示（fixed）。
// DS(claude design "INSESSION Design System" #663)の Toast: surface + 1px border + 左3px の tone 色ボーダー +
// radius-md + shadow-popover。title(13.5/700) / message(12.5/text-dim) / action(tone 色のテキストボタン) +
// onAction / onClose(close アイコン)。tone は info / success(=live green) / warn / danger（error は danger の別名）。
// アイコンは props 注入（このパッケージの Icon を呼び出し側が渡す）で、色は tone に追従する。i18n は持たない。
//
// variant='snackbar' は legacy feature 側 .snackbar の見た目を1pxも変えずに再現する専用パレット
// （bg=snackbar-surface / padding 11px 20px / gap 9px / success=border-strong+mint / error=soft pink）。
export type ToastTone = 'success' | 'error' | 'info' | 'warn' | 'danger';
export type ToastVariant = 'default' | 'snackbar';

// snackbar variant の tone→(border 色 / icon 色) マップ。
const SNACKBAR_TONE: Record<ToastTone, { border: string; icon: string }> = {
  success: { border: 'border-border-strong', icon: 'text-success' },
  error: { border: 'border-snackbar-danger-border', icon: 'text-snackbar-danger' },
  info: { border: 'border-border-strong', icon: 'text-success' },
  warn: { border: 'border-border-strong', icon: 'text-warning' },
  danger: { border: 'border-snackbar-danger-border', icon: 'text-snackbar-danger' },
};

// DS(default) variant の tone→(左ボーダー色 / 前景色)。error は danger の別名。
const DS_TONE: Record<ToastTone, { border: string; text: string }> = {
  info: { border: 'border-l-info', text: 'text-info' },
  success: { border: 'border-l-success', text: 'text-success' },
  warn: { border: 'border-l-warning', text: 'text-warning' },
  danger: { border: 'border-l-danger', text: 'text-danger' },
  error: { border: 'border-l-danger', text: 'text-danger' },
};

// 固定表示。中央寄せの transform は snackbar-in キーフレーム（translate(-50%,0) で終わる）に委ねる。
const FIXED =
  'fixed bottom-[26px] left-1/2 z-(--z-snackbar) pointer-events-none animate-[snackbar-in_var(--dur-slow)_var(--ease-spring)_both]';

export type ToastProps = {
  children?: ReactNode;
  tone?: ToastTone;
  // 見た目のバリアント。既定 'default'（DS トースト）。'snackbar' は legacy .snackbar 互換パレット。
  variant?: ToastVariant;
  // 行頭アイコン（省略可）。色は tone に追従する。
  icon?: ReactNode;
  // DS トーストの見出し / 本文（default variant）。children を渡した場合はそれを本文として使う。
  title?: ReactNode;
  message?: ReactNode;
  // 末尾のテキストアクション（tone 色）とハンドラ。
  action?: ReactNode;
  onAction?: () => void;
  // 閉じるアフォーダンス（close アイコン）を出す。
  onClose?: () => void;
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
  title,
  message,
  action,
  onAction,
  onClose,
  fixed = true,
  role = 'status',
  className = '',
}: ToastProps) {
  // snackbar は legacy .snackbar を1pxも変えずに再現する（pill / children ベース）。
  if (variant === 'snackbar') {
    const t = SNACKBAR_TONE[tone];
    return (
      <div
        role={role}
        className={`inline-flex items-center gap-[9px] rounded-pill border border-solid bg-snackbar-surface px-5 py-[11px] text-[14px] text-text shadow-overlay ${t.border}${
          fixed ? ` ${FIXED}` : ''
        } ${className}`.trim()}
      >
        {icon && (
          <span className={`${t.icon} text-[13px] font-extrabold`} aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </div>
    );
  }

  // DS default: surface + 左3px tone ボーダー + radius-md + shadow-popover。
  const t = DS_TONE[tone];
  return (
    <div
      role={role}
      className={`inline-flex min-w-[280px] max-w-[420px] items-start gap-3 rounded-md border border-solid border-border border-l-[3px] bg-surface px-[15px] py-[13px] text-text shadow-popover ${t.border}${
        fixed ? ` ${FIXED}` : ''
      } ${className}`.trim()}
    >
      {icon && (
        <span className={`mt-px shrink-0 ${t.text}`} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        {title != null && <span className="text-[13.5px] font-bold text-text">{title}</span>}
        {message != null && (
          <span className="text-[12.5px] leading-[1.5] text-text-dim">{message}</span>
        )}
        {children}
      </div>
      {action != null && (
        <button
          type="button"
          onClick={onAction}
          className={`shrink-0 whitespace-nowrap border-none bg-transparent text-[12.5px] font-bold ${t.text} cursor-pointer`}
        >
          {action}
        </button>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="close"
          className="shrink-0 inline-flex border-none bg-transparent p-0 text-text-dim cursor-pointer"
        >
          <Icon name="close" size={17} />
        </button>
      )}
    </div>
  );
}
