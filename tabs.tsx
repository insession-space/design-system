import type { ReactNode } from 'react';

// タブ / セグメンテッドコントロール（純粋 leaf UI）。legacy の .side-tabs / .tab-btn（下線式タブ）を
// トークン経由のユーティリティで再構成する。media-tabs・playlist サブタブ・sticker picker タブなどの
// 別実装を将来この一本へ寄せる。見た目: 透明地 + アクティブ下にシアンの下線がスプリングで伸びる。
// i18n は持たない（label は t() 済みを渡す）。
export type TabItem = {
  key: string;
  label: ReactNode;
  // ラベル右の付随要素（件数 CountChip 等）。
  badge?: ReactNode;
};

export type TabsProps = {
  tabs: TabItem[];
  value: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
  // タブ行の末尾に置く付随要素（ミニアクション等）。タブとは別扱いで右端に並ぶ。
  trailing?: ReactNode;
  // タブリスト全体（role=tablist の div）に足す追加クラス。並び/余白の文脈調整用。
  className?: string;
  // 幅の振る舞い。'default'=内容幅で左詰め（media-tabs 等）。'fill'=各タブが均等に伸びて
  // 行幅いっぱいを占める（legacy 基底 .tab-btn の flex:1 相当。playlist サブタブ / sticker タブ）。
  variant?: 'default' | 'fill';
};

const TAB_BASE =
  "relative inline-flex items-center justify-center gap-1.5 border-none bg-transparent py-3 font-display text-smd font-bold tracking-[0.1em] text-text-faint shadow-none transition-colors duration-(--dur-base) cursor-pointer hover:text-text-dim after:absolute after:inset-x-[12%] after:-bottom-px after:h-0.5 after:origin-center after:scale-x-0 after:rounded-[2px] after:bg-cyan after:transition-transform after:duration-(--dur-base) after:ease-spring after:content-['']";
const TAB_WIDTH: Record<'default' | 'fill', string> = {
  default: 'flex-none px-3.5',
  fill: 'flex-1 px-1.5',
};
const TAB_ACTIVE = 'text-text after:scale-x-100';

export default function Tabs({
  tabs,
  value,
  onChange,
  ariaLabel,
  trailing,
  className = '',
  variant = 'default',
}: TabsProps) {
  const tabClass = `${TAB_BASE} ${TAB_WIDTH[variant]}`;
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex border-b border-solid border-border ${className}`.trim()}
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${tabClass}${active ? ` ${TAB_ACTIVE}` : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
            {tab.badge}
          </button>
        );
      })}
      {trailing}
    </div>
  );
}
