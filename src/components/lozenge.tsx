import type { ReactNode } from 'react';
import { twMerge } from '../lib/tw-merge.ts';

// DS の Lozenge（純粋 leaf UI）。claude design "INSESSION Design System" の Lozenge 仕様に準拠（#463）。
// 状態やメタ情報の小ラベル（LIVE / PENDING / REC / BETA 等）。モノスペース大文字・塗り控えめ・非操作。
// StatusBadge（点 + ラベルの枠付きピル。継続的な状態）とは用途が別で、こちらは mono の状態タグ。
// tone でセマンティック色を切替える。dot で先頭に同色ドットを出す。i18n は持たない。
// 塗りは視認性確保のため -surface-strong 系トークンを使う(#765)。
export type LozengeTone = 'success' | 'warning' | 'accent' | 'info' | 'neutral';

const TONE: Record<LozengeTone, string> = {
  success: 'text-success bg-success-surface-strong',
  warning: 'text-warning bg-warning-surface-strong',
  accent: 'text-accent-soft bg-tint-22',
  info: 'text-info bg-info-surface-strong',
  // neutral は tint(accent 色相)ではなく中立の面を使う。tint を濃くすると accent tone と
  // 見分けが付かなくなるため、面は surface-3・文字は text-text で濃度を確保する(#765)。
  neutral: 'text-text bg-surface-3',
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
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-body text-xs font-semibold uppercase tracking-pill',
        TONE[tone],
        className,
      )}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-pill ${DOT[tone]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
