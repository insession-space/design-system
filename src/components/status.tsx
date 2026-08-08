import type { ReactNode } from 'react';
import { twMerge } from '../lib/tw-merge.ts';

// ステータス表現（純粋 leaf UI）。オンライン/実行中/エラー等の状態を、セマンティックカラー
// トークンに沿って表す。feature ごとに個別だった app-running-dot / 参加者オンライン点 /
// pomodoro 実行中表示などを DS に集約する。
// - StatusDot: 状態を点だけで示す最小表現（アバター隅・行頭など）。
// - StatusBadge: 点 + ラベルのピル。Badge(new/live の一過性強調) とは用途が別で、こちらは
//   「継続的な状態」を表す。
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const DOT_TONE: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-text-faint',
};

export type StatusDotProps = {
  tone?: StatusTone;
  // 直径(px)。既定 8。
  size?: number;
  // 明滅（生存・実行中の含意）。
  pulse?: boolean;
  // スクリーンリーダー向けラベル（i18n は props 注入）。省略時は装飾扱い。
  label?: string;
  className?: string;
};

export function StatusDot({
  tone = 'neutral',
  size = 8,
  pulse = false,
  label,
  className = '',
}: StatusDotProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: size, height: size }}
      className={twMerge(
        'inline-block shrink-0 rounded-pill',
        DOT_TONE[tone],
        pulse ? ' animate-pulse' : '',
        className,
      )}
    />
  );
}

const BADGE_TONE: Record<StatusTone, string> = {
  success: 'bg-success-surface text-success border-success-border',
  warning: 'bg-warning-surface text-warning border-warning-border',
  danger: 'bg-danger-surface text-danger border-danger-border',
  info: 'bg-info-surface text-info border-info-border',
  neutral: 'bg-tint-8 text-text-dim border-border',
};

export type StatusBadgeProps = {
  tone?: StatusTone;
  children: ReactNode;
  // 先頭に状態点を出す。
  dot?: boolean;
  // dot を明滅させる。
  pulse?: boolean;
  className?: string;
};

export function StatusBadge({
  tone = 'neutral',
  children,
  dot = false,
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-solid px-2 py-0.5 text-xs font-extrabold uppercase tracking-tag',
        BADGE_TONE[tone],
        className,
      )}
    >
      {dot && <StatusDot tone={tone} size={6} pulse={pulse} />}
      {children}
    </span>
  );
}
