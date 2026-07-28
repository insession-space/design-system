import type { ReactNode } from 'react';
import Icon, { type IconName } from '../icons/icon.tsx';

// Badge（非対話の status/meta ラベル。純粋 leaf UI）。claude design "INSESSION Design System" 準拠（#463 / #663）。
// タップできる要素は Chip、継続的な状態の点+枠は StatusBadge、mono-caps の状態タグは Lozenge を使う
// （役割分離。Lozenge は tone 名が別語彙のため統合はせず併存させる）。
// TONES: live(green) / warn(amber) / danger(coral=accent。DS 定義) / info(blue) /
//   neutral(text-dim + surface-3) / pro(on-fill + fill)。colored tone は pill、neutral/pro は radius-sm の角丸矩形。
// mono / 11px / 600。props: tone / dot(6px 色点) / icon(13) / shape('pill'|'rounded' で上書き)。
// 後方互換: 旧 `variant`('new'|'live') を temporarily 受ける（'new'=live tone の uppercase 小バッジ、
//   'live'=live tone + dot）。パルス点や絶対配置は space-card 側の演出へ切り離した（legacy .live-badge 廃止）。
export type BadgeTone = 'live' | 'warn' | 'danger' | 'info' | 'neutral' | 'pro';

// 件数チップ（旧 .count-chip / .tab-badge）。tab 側は出現アニメを持つので animated で切替。
export type CountChipProps = {
  children: ReactNode;
  animated?: boolean;
  // 配置場所ごとの位置調整(例: Bottom Navアイコンへの絶対配置重ね)用の追加クラス。
  className?: string;
};

export function CountChip({ children, animated = false, className = '' }: CountChipProps) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-pill bg-success-surface-strong text-success text-xs font-extrabold tracking-normal${
        animated ? ' animate-[pop-in_0.3s_var(--ease-spring)] motion-reduce:animate-none' : ''
      } ${className}`.trim()}
    >
      {children}
    </span>
  );
}

const TONE: Record<BadgeTone, string> = {
  live: 'text-success bg-success-surface',
  warn: 'text-warning bg-warning-surface',
  danger: 'text-accent-soft bg-tint-12',
  info: 'text-info bg-info-surface',
  neutral: 'text-text-dim bg-surface-3',
  pro: 'text-on-fill bg-fill',
};
const DOT: Record<BadgeTone, string> = {
  live: 'bg-success',
  warn: 'bg-warning',
  danger: 'bg-accent',
  info: 'bg-info',
  neutral: 'bg-text-faint',
  pro: 'bg-on-fill',
};
// colored tone は pill、neutral/pro は角丸矩形（DS）。
const PILL_TONES: BadgeTone[] = ['live', 'warn', 'danger', 'info'];

export type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  // 先頭に同色のドットを出す（LIVE 等の含意）。
  dot?: boolean;
  // 先頭のアイコン（IconName なら size13、ReactNode はそのまま）。
  icon?: IconName | ReactNode;
  // 形状の上書き（既定は tone から導出）。
  shape?: 'pill' | 'rounded';
  className?: string;
  // 後方互換: 旧 API（'new'=新着 / 'live'=配信中）。tone 指定があればそちらを優先。
  variant?: 'new' | 'live';
};

export function Badge({
  children,
  tone,
  dot = false,
  icon,
  shape,
  className = '',
  variant,
}: BadgeProps) {
  // 旧 variant → tone/装飾の導出。'new' と 'live' はどちらも live(green) tone。
  const resolvedTone: BadgeTone = tone ?? 'neutral';
  const legacyTone: BadgeTone = variant ? 'live' : resolvedTone;
  const showDot = dot || variant === 'live';
  const legacyNew = variant === 'new';
  const isPill = shape ? shape === 'pill' : PILL_TONES.includes(legacyTone);
  const shapeClass = isPill ? 'rounded-pill' : 'rounded-chip';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 font-body text-xs font-semibold ${TONE[legacyTone]} ${shapeClass}${
        legacyNew ? ' uppercase tracking-tag' : ''
      } ${className}`.trim()}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-pill ${DOT[legacyTone]}`} aria-hidden="true" />
      )}
      {icon != null &&
        (typeof icon === 'string' ? <Icon name={icon as IconName} size={13} /> : icon)}
      {children}
    </span>
  );
}
