import type { ReactNode } from 'react';

// タブ / セグメンテッドコントロール（純粋 leaf UI）。legacy の .side-tabs / .tab-btn（下線式タブ）を
// トークン経由のユーティリティで再構成する。media-tabs・playlist サブタブ・sticker picker タブなどの
// 別実装を将来この一本へ寄せる。見た目は DS(claude design "INSESSION Design System" #463)の
// 下線タブに準拠: 透明地 + アクティブ下に accent(コーラル)の 2px 下線がスプリングで伸びる
// (after:bg-accent)。非アクティブは text-faint→hover text-dim。件数は badge スロットへ
// CountChip を渡す(DS の count バッジ相当)。i18n は持たない（label は t() 済みを渡す）。
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

// hover:bg-transparent hover:shadow-none active:scale-100 active:bg-transparent は、プリフライト未使用で
// タブが <button> 要素であるため露出する legacy グローバル button:hover(glow+teal 背景)/button:active(scale)
// を打ち消し、旧 .tab-btn:hover/:active(transparent・shadow none・transform none)の挙動へ完全一致させる(#448)。
const TAB_BASE =
  "relative inline-flex items-center justify-center gap-1.5 border-none bg-transparent py-3 font-display text-smd font-bold tracking-[0.1em] text-text-faint shadow-none transition-colors duration-(--dur-base) cursor-pointer hover:text-text-dim hover:bg-transparent hover:shadow-none active:scale-100 active:bg-transparent after:absolute after:inset-x-[12%] after:-bottom-px after:h-0.5 after:origin-center after:scale-x-0 after:rounded-[2px] after:bg-accent after:transition-transform after:duration-(--dur-base) after:ease-spring after:content-['']";
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
      // border-t-0 border-x-0 は必須: プリフライト未使用のため border-solid が全辺の border-style を
      // solid にし、border-b で未指定の上/左/右の border-width が既定 medium(3px) のまま枠として出る。
      // 明示的に 0 にして legacy .side-tabs(border-bottom のみ)へ一致させる(#448 リグレッション修正)。
      className={`flex border-t-0 border-x-0 border-b border-solid border-border ${className}`.trim()}
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
