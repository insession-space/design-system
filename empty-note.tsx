import type { ReactNode } from 'react';

// 空リスト/エラー時の一行メッセージ（純粋 leaf UI）。文言は t() 済みを children で渡す。
// 旧 .empty-note（+ .media-tabs / .search-dropdown コンテキスト上書き）を @theme トークン
// 経由のユーティリティへ移行した。padding/揃えは文脈ごとに competing utility を出さないよう
// variant で切り替える（class 文字列の後付けでは Tailwind の生成順に負ける落とし穴を避ける）。
export type EmptyNoteProps = {
  children: ReactNode;
  // 'default'=中央寄せ・広め（既定）/ 'compact'=左寄せ・詰め（キュー/履歴タブ）/
  // 'dropdown'=左寄せ・検索候補ドロップダウン内。
  variant?: 'default' | 'compact' | 'dropdown';
};

const VARIANT: Record<NonNullable<EmptyNoteProps['variant']>, string> = {
  default: 'px-4 py-5 text-center',
  compact: 'px-1 py-3.5 text-left',
  dropdown: 'px-4 py-[18px] text-left',
};

export default function EmptyNote({ children, variant = 'default' }: EmptyNoteProps) {
  return (
    <p className={`${VARIANT[variant]} text-base leading-[1.7] text-text-faint`}>{children}</p>
  );
}
