import type { ReactNode } from 'react';

// DS の Lozenge（純粋 leaf UI）。claude design "INSESSION Design System" の Lozenge 仕様に準拠（#463）。
// 状態やメタ情報の小ラベル（LIVE / PENDING / REC / BETA 等）。モノスペース大文字・塗り控えめ・非操作。
// StatusBadge（点 + ラベルの枠付きピル。継続的な状態）とは用途が別で、こちらは mono の状態タグ。
// tone でセマンティック色を切替える。dot で先頭に同色ドットを出す。i18n は持たない。
export type LozengeTone = 'success' | 'warning' | 'accent' | 'info' | 'neutral';

const TONE: Record<LozengeTone, string> = {
  success: 'text-success bg-success-surface',
  warning: 'text-warning bg-warning-surface',
  accent: 'text-accent bg-tint-12',
  info: 'text-info bg-info-surface',
  neutral: 'text-text-dim bg-tint-8',
};
const DOT: Record<LozengeTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  accent: 'bg-accent',
  info: 'bg-info',
  neutral: 'bg-text-faint',
};

export type LozengeProps = {
  tone?: LozengeTone;
  // 先頭に同色のドットを出す（LIVE 等の含意）。
  dot?: boolean;
  children: ReactNode;
  className?: string;
};

export default function Lozenge({
  tone = 'neutral',
  dot = false,
  children,
  className = '',
}: LozengeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.08em] ${TONE[tone]} ${className}`.trim()}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-pill ${DOT[tone]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
