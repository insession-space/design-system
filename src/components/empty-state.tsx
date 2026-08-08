import type { ReactNode } from 'react';
import Icon, { type IconName } from '../icons/icon.tsx';
import { twMerge } from '../lib/tw-merge.ts';

// 空状態のカード（純粋 leaf UI）。EmptyNote が「一行だけのそっけない不在の告知」なのに対し、
// こちらは アイコン + タイトル + ヒント + CTA で「なぜ空なのか / 次に何をすればよいか」まで
// 伝える。セクション単位の空状態はこちらを使う（EmptyNote はキュー/履歴タブや検索候補の
// ドロップダウンなど、一行で足りる密度の高い文脈に残す）。
// 文言は t() 済みを props で渡す（DS は i18n を持たない）。
// 出自: insession-app の features/community/components/community-empty.tsx にあった
// CommunityEmptyState。コミュニティ画面だけのローカル実装だったものを DS へ引き上げた。
export type EmptyStateProps = {
  // 状態を表すアイコン（Icon の name をそのまま渡す）。
  icon: IconName;
  // 何が無いのかを一行で。
  title: string;
  // 次にどうすればよいかの補足。省略可。
  hint?: string;
  // CTA など。Button を渡すことを想定。
  action?: ReactNode;
  // レイアウト都合の上書き（グリッドを跨ぐ col-span 等）。造形は上書きしない前提。
  className?: string;
};

export default function EmptyState({ icon, title, hint, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface/40 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-tint-8 text-accent">
        <Icon name={icon} size={24} />
      </span>
      <div className="flex flex-col gap-1">
        <div className="text-base font-bold text-text">{title}</div>
        {hint && <div className="text-sm leading-normal text-text-dim">{hint}</div>}
      </div>
      {action}
    </div>
  );
}
