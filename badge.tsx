import type { ReactNode } from 'react';

// 小さな強調バッジ群（純粋 leaf UI）。旧 .count-chip / .tab-badge / .nav-new-badge /
// .live-badge を集約する。色・角丸・タイポは @theme トークン経由のユーティリティ。
// live は擬似要素のパルス点 + space-card 側の絶対配置に依存するため、当面は legacy class
// (.live-badge) を再利用する（段階移行。マークアップだけ Badge に寄せる）。

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
      className={`inline-flex items-center justify-center min-w-[17px] h-[17px] px-[5px] rounded-pill bg-success-surface text-success text-xs font-extrabold tracking-normal${
        animated ? ' animate-[pop-in_0.3s_var(--ease-spring)]' : ''
      } ${className}`.trim()}
    >
      {children}
    </span>
  );
}

// 汎用バッジ。new=新着（旧 .nav-new-badge）/ live=配信中（旧 .live-badge。legacy class 温存）。
export type BadgeProps = {
  children: ReactNode;
  variant: 'new' | 'live';
  className?: string;
};

export function Badge({ children, variant, className = '' }: BadgeProps) {
  if (variant === 'live') {
    // パルス点(::before) + space-card の絶対配置は legacy .live-badge を使う（段階移行）。
    return <span className={`live-badge ${className}`.trim()}>{children}</span>;
  }
  return (
    <span
      className={`shrink-0 inline-flex items-center px-[7px] py-0.5 rounded-pill bg-success-surface text-success text-2xs font-extrabold tracking-[0.06em] uppercase ${className}`.trim()}
    >
      {children}
    </span>
  );
}
