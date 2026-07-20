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
  // 所属グループの key（groups 指定時のみ使用。未指定は先頭グループ扱い #766）。
  group?: string;
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
  // タブを見出し付きグループへ分割する（#766: プレイリストタブの「自分/スペース」分割）。
  // 未指定なら従来どおりのフラット表示（DOM・見た目とも完全に据え置き）。
  groups?: { key: string; label: ReactNode }[];
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

function renderTabButton(
  tab: TabItem,
  active: boolean,
  tabClass: string,
  onChange: (key: string) => void,
) {
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
}

export default function Tabs({
  tabs,
  value,
  onChange,
  ariaLabel,
  trailing,
  className = '',
  variant = 'default',
  groups,
}: TabsProps) {
  const tabClass = `${TAB_BASE} ${TAB_WIDTH[variant]}`;
  // border-t-0 border-x-0 は必須: プリフライト未使用のため border-solid が全辺の border-style を
  // solid にし、border-b で未指定の上/左/右の border-width が既定 medium(3px) のまま枠として出る。
  // 明示的に 0 にして legacy .side-tabs(border-bottom のみ)へ一致させる(#448 リグレッション修正)。
  const outerClassName =
    `flex border-t-0 border-x-0 border-b border-solid border-border ${className}`.trim();

  if (!groups) {
    return (
      <div role="tablist" aria-label={ariaLabel} className={outerClassName}>
        {tabs.map((tab) => renderTabButton(tab, tab.key === value, tabClass, onChange))}
        {trailing}
      </div>
    );
  }

  // グループ表示（#766）: グループごとに縦積み(見出し + タブ行)し、グループ幅はタブ数比例の
  // flexGrow で配分する。2つ目以降のグループには左区切り線を足す(同じ理由で他3辺は0を明示)。
  // tablist はフラット時と同じく外側の1つだけに置き、グループ分割は視覚的なものに留める
  // (グループごとに tablist を分けると「選択タブが1つも無い tablist」ができ、排他的な
  //  1タブセットという意味が壊れるため)。見出しは装飾なので aria-hidden で AT から隠す。
  return (
    <div role="tablist" aria-label={ariaLabel} className={outerClassName}>
      {groups.map((group, i) => {
        const groupTabs = tabs.filter((tab) => (tab.group ?? groups[0].key) === group.key);
        if (groupTabs.length === 0) return null;
        return (
          <div
            key={group.key}
            role="presentation"
            data-tab-group={group.key}
            className={`flex flex-col${i > 0 ? ' border-y-0 border-r-0 border-l border-solid border-border' : ''}`}
            style={{ flexGrow: groupTabs.length, flexBasis: 0 }}
          >
            <span
              aria-hidden="true"
              className="px-1.5 pt-1.5 text-center font-display text-2xs font-bold tracking-[0.12em] text-text-faint"
            >
              {group.label}
            </span>
            <div role="presentation" className="flex">
              {groupTabs.map((tab) => renderTabButton(tab, tab.key === value, tabClass, onChange))}
            </div>
          </div>
        );
      })}
      {trailing}
    </div>
  );
}
