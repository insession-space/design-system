import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type * as React from 'react';
import { createContext, useContext } from 'react';

// タブ / セグメンテッドコントロール（純粋 leaf UI）。legacy の .side-tabs / .tab-btn（下線式タブ）を
// トークン経由のユーティリティで再構成する。media-tabs・playlist サブタブ・sticker picker タブなどの
// 別実装を将来この一本へ寄せる。見た目は DS(claude design "INSESSION Design System" #463)の
// 下線タブに準拠: 透明地 + アクティブ下に accent(コーラル)の 2px 下線がスプリングで伸びる
// (after:bg-accent)。非アクティブは text-faint→hover text-dim。件数は Tab の children に
// CountChip 等を直接置く(DS の count バッジ相当)。i18n は持たない（label は t() 済みを渡す）。
//
// Base UI の Tabs(#6)へ委譲する薄い compound ラッパー。従来は tabs:TabItem[] + value/onChange の
// 配列 API だったが、Base UI 化で <Tabs.Root><Tabs.List><Tabs.Tab/></Tabs.List><Tabs.Panel/>
// </Tabs.Root> の compound API へ変える。獲得できるもの: 矢印キーでのタブ移動・Home/End・
// disabled タブのスキップ(Base UI が Composite で実装済み。以前は自前で role だけ当てて
// キーボード操作が無かった)。
//
// 使い方(compound): <Tabs.Root defaultValue="queue"><Tabs.List ariaLabel="...">
// <Tabs.Tab value="queue">キュー<CountChip>3</CountChip></Tabs.Tab>...{trailing}</Tabs.List>
// <Tabs.Panel value="queue">...</Tabs.Panel></Tabs.Root>

// hover:bg-transparent hover:shadow-none active:scale-100 active:bg-transparent は、プリフライト未使用で
// タブが <button> 要素であるため露出する legacy グローバル button:hover(glow+teal 背景)/button:active(scale)
// を打ち消し、旧 .tab-btn:hover/:active(transparent・shadow none・transform none)の挙動へ完全一致させる(#448)。
// アクティブ状態は旧実装では JS で value===tab.key を比較して TAB_ACTIVE を足していたが、Base UI の
// Tabs.Tab は選択中に data-active を出す(docs: tabs.md の Tab Data Attributes)ため、
// data-active: バリアントで表現する(動的クラス生成は禁止のため文字列リテラルで書く)。
const TAB_BASE =
  "relative inline-flex items-center justify-center gap-1.5 border-none bg-transparent py-3 font-display text-smd font-bold tracking-widest text-text-faint shadow-none transition-colors duration-(--dur-base) cursor-pointer hover:text-text-dim hover:bg-transparent hover:shadow-none active:scale-100 active:bg-transparent after:absolute after:inset-x-[12%] after:-bottom-px after:h-0.5 after:origin-center after:scale-x-0 after:rounded-xs after:bg-accent after:transition-transform after:duration-(--dur-base) after:ease-spring after:content-[''] data-active:text-text data-active:after:scale-x-100";
const TAB_WIDTH: Record<'default' | 'fill', string> = {
  default: 'flex-none px-3.5',
  fill: 'flex-1 px-1.5',
};

// variant は List に置く: 呼び出し側が「行全体を fill にする/しない」を1箇所で決める既存の
// 使い方(旧 <Tabs variant="fill" tabs={...}/>)を保ち、Tab 1つ1つに繰り返し指定させない。
// Tab 側は Context 越しに読むだけの薄い実装にする。
const TabsVariantContext = createContext<'default' | 'fill'>('default');

const Root = BaseTabs.Root;
export type TabsRootProps = React.ComponentProps<typeof BaseTabs.Root>;

export type TabsListProps = React.ComponentProps<typeof BaseTabs.List> & {
  // 幅の振る舞い。'default'=内容幅で左詰め（media-tabs 等）。'fill'=各タブが均等に伸びて
  // 行幅いっぱいを占める（legacy 基底 .tab-btn の flex:1 相当。playlist サブタブ / sticker タブ）。
  variant?: 'default' | 'fill';
  // タブ行の末尾に置く付随要素（ミニアクション等）。タブとは別扱いで右端に並ぶ。
  // Base UI の Tabs.List は子を CompositeRoot でそのまま描画するだけで、Tab 以外の要素は
  // 単に非フォーカス対象の DOM として並ぶだけ（矢印キー移動の対象にならない）ため、tab
  // ではない子を混ぜても壊れない(node_modules 同梱の TabsList 実装で確認済み)。
  trailing?: React.ReactNode;
  ariaLabel?: string;
};

function TabsList({
  variant = 'default',
  trailing,
  ariaLabel,
  className = '',
  children,
  ...props
}: TabsListProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <BaseTabs.List
        aria-label={ariaLabel}
        // border-t-0 border-x-0 は必須: プリフライト未使用のため border-solid が全辺の border-style を
        // solid にし、border-b で未指定の上/左/右の border-width が既定 medium(3px) のまま枠として出る。
        // 明示的に 0 にして legacy .side-tabs(border-bottom のみ)へ一致させる(#448 リグレッション修正)。
        className={`flex border-t-0 border-x-0 border-b border-solid border-border ${className}`.trim()}
        {...props}
      >
        {children}
        {trailing}
      </BaseTabs.List>
    </TabsVariantContext.Provider>
  );
}

export type TabsTabProps = React.ComponentProps<typeof BaseTabs.Tab>;

function TabsTab({ className = '', ...props }: TabsTabProps) {
  const variant = useContext(TabsVariantContext);
  return (
    <BaseTabs.Tab className={`${TAB_BASE} ${TAB_WIDTH[variant]} ${className}`.trim()} {...props} />
  );
}

// Base UI Tabs の Panel をそのまま薄く再 export する(既定クラスは付けない。DS はパネルの
// 見た目を規定していないため。旧 DS は tablist だけを提供し panel は消費側が持っていた)。
// Root/List/Tab だけを使い Panel を使わない旧来の使い方も、Panel が無くても Root/List/Tab は
// 単独で成立する(Base UI の Panel は任意パーツで Root が要求しない)ため引き続き成立する。
const Panel = BaseTabs.Panel;
export type TabsPanelProps = React.ComponentProps<typeof BaseTabs.Panel>;

// Tabs.Indicator は使わない: Base UI の Indicator は「1本の下線が横スライドする」表現(CSS変数
// --active-tab-left/--active-tab-width で1要素を移動させる)だが、このDSの見た目は「各タブ自身の
// after: 疑似要素がスプリングで独立に伸び縮みする」表現(TAB_BASE の after:scale-x-0→data-active
// 時 after:scale-x-100)で、Indicator の表現とは別物。既存の見た目を変えないため Indicator は
// 使わず、各 Tab 自身の data-active による after: だけで表現する。

export const Tabs = {
  Root,
  List: TabsList,
  Tab: TabsTab,
  Panel,
};

// 旧 API → 新 API 対応表(オーケストレーターが README/changeset へ転記する想定)
//
// <Tabs tabs={[{key,label,badge}]} value={value} onChange={setValue} ariaLabel trailing
//   variant className/>
// ↓
// <Tabs.Root value={value} onValueChange={setValue}>
//   <Tabs.List ariaLabel={ariaLabel} variant="default|fill" trailing={trailing} className={cls}>
//     <Tabs.Tab value="key">ラベル{badge}</Tabs.Tab>
//     （タブを列挙）
//   </Tabs.List>
//   {/* 従来は panel を持たなかった。パネルが要る呼び出し側は Tabs.Panel を追加で使う */}
//   <Tabs.Panel value="key">...</Tabs.Panel>
// </Tabs.Root>
//
// - TabItem 型は廃止。badge は呼び出し側が Tab の children に直接書く(gap-1.5 は TAB_BASE に残す)。
// - defaultValue(非制御)も Base UI Root がそのまま提供する。
