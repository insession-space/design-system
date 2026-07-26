import type { ComponentProps } from 'react';

// 面プリミティブ(Surface / Paper / Card / Panel。純粋 leaf UI)。
// layout.tsx が「並び・余白・揃え」だけを扱い色/面/角丸を持たないのに対し、こちらは逆に
// 「背景 + 境界 + 影」という1つの高さ(elevation)軸だけを扱う。既存の Modal / Popover / Menu が
// 個別に持っていた面のクラス文字列(modal.tsx の DS_POPUP_CLASS・popover.tsx の
// POPOVER_POPUP_BASE 等)はそれぞれの用途に特化しているため置き換えない。Surface はそれらが
// 暗黙に前提していた「段」を汎用コンポーネントとして切り出したもの。

export type Elevation = 0 | 1 | 2 | 3 | 4;

// elevation ごとの「背景 + 境界 + 影」の3点セット。theme.css の @theme に追加した
// --shadow-elevation-* 別名トークン(既存 --shadow-soft/-popover/-overlay を参照するだけで
// 実値は増やさない)と対応させる。ダーク/ライトの表現差は参照先の --elev-* が既に持っている
// (ダークは背景ランプの明度差、ライトは --color-shadow を青みグレーにした薄い影)ので、
// ここにテーマ分岐は要らない — elevation という1軸だけを見ればよい。
//   0: 素の器(背景/境界/影いずれも無し)
//   1: bg-bg-elevated + border-border(影なし)。Paper / Panel の「境界のみの控えめな面」
//   2: bg-surface + border-border + shadow-elevation-2(= 既存 shadow-soft と同値)。Card
//   3: bg-surface + border-border-strong + shadow-elevation-3(= 既存 shadow-popover と同値)。
//      既存の Popover / Menu と同じ組
//   4: bg-surface + border-border + shadow-elevation-4(= 既存 shadow-overlay と同値)。
//      既存の Modal と同じ組
// 3点セットは合成済みの1本の文字列ではなく「背景 / 境界色 / 影」に分けて持つ。理由は
// **境界を4辺すべてに引けない場所があるから** — AppBar は下端だけ(border-b)、Footer は上端だけ
// (border-t)に境界を持つのが正しい見た目で、合成済みの `border border-solid border-border` を
// そのまま当てると4辺に線が出てしまう。分けておけば page.tsx 側が「背景と境界色は同じ段の
// トークンを使い、辺だけ自分で選ぶ」ことができ、段の定義がこのファイルの1箇所に留まる。
export const ELEVATION_BG: Record<Elevation, string> = {
  0: '',
  1: 'bg-bg-elevated',
  2: 'bg-surface',
  3: 'bg-surface',
  4: 'bg-surface',
};

export const ELEVATION_BORDER_COLOR: Record<Elevation, string> = {
  0: '',
  1: 'border-border',
  2: 'border-border',
  3: 'border-border-strong',
  4: 'border-border',
};

export const ELEVATION_SHADOW: Record<Elevation, string> = {
  0: '',
  1: '',
  2: 'shadow-elevation-2',
  3: 'shadow-elevation-3',
  4: 'shadow-elevation-4',
};

// Surface 自身(4辺に境界を引く汎用の面)が使う合成形。上の3マップから組み立てるので、
// 段の定義を足す/変えるときに直すのは上の3つだけで済む。
const ELEVATION_CLASS: Record<Elevation, string> = {
  0: '',
  1: `${ELEVATION_BG[1]} border border-solid ${ELEVATION_BORDER_COLOR[1]}`,
  2: `${ELEVATION_BG[2]} border border-solid ${ELEVATION_BORDER_COLOR[2]} ${ELEVATION_SHADOW[2]}`,
  3: `${ELEVATION_BG[3]} border border-solid ${ELEVATION_BORDER_COLOR[3]} ${ELEVATION_SHADOW[3]}`,
  4: `${ELEVATION_BG[4]} border border-solid ${ELEVATION_BORDER_COLOR[4]} ${ELEVATION_SHADOW[4]}`,
};

export type SurfaceRadius = 'none' | 'chip' | 'md' | 'card' | 'panel' | 'pill';

// theme.css の既存 radius トークンへの単純な対応。
const RADIUS_CLASS: Record<SurfaceRadius, string> = {
  none: 'rounded-none',
  chip: 'rounded-chip',
  md: 'rounded-md',
  card: 'rounded-card',
  panel: 'rounded-panel',
  pill: 'rounded-pill',
};

// layout.tsx の Gap と同じ語彙・同じ刻み(none/xs/sm/md/lg/xl/2xl → p-0/1/2/3/4/6/8)。
// GAP_CLASS(gap-*)と刻みを揃えることで、Stack の gap と Surface の padding を並べて
// 使ったときに余白の見た目が一致する。
export type SurfacePadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// page.tsx の Footer 等、Surface を包めない(セマンティック要素側に padding を持たせたい)
// 箇所からも参照するので export する。
export const SURFACE_PADDING_CLASS: Record<SurfacePadding, string> = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
  xl: 'p-6',
  '2xl': 'p-8',
};

// interactive={true} のときだけ足すクラス。新 DS の hover は「ふわっと光る」グローではなく
// 面変化 + translateY(-2px) の控えめな持ち上げで表す(theme.css の --shadow-glow 廃止コメント
// 参照)。ホバーの持ち上げがあるぶん、transition も interactive のときだけ付ける
// (静止状態のカードにまで transition を持たせる理由が無いため)。
const INTERACTIVE_CLASS =
  'cursor-pointer transition-[transform,background,box-shadow] duration-(--dur-fast) hover:-translate-y-0.5 hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none';

export type SurfaceProps = {
  elevation?: Elevation;
  radius?: SurfaceRadius;
  padding?: SurfacePadding;
  interactive?: boolean;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className'>;

// Surface: 面の基底プリミティブ。Paper/Card/Panel はこれの elevation 固定(または既定値違い)
// ラッパーで、面のロジックは重複させずここへ委譲する。
export function Surface({
  elevation = 1,
  radius = 'card',
  padding = 'none',
  interactive = false,
  className = '',
  ...rest
}: SurfaceProps) {
  const interactiveClass = interactive ? ` ${INTERACTIVE_CLASS}` : '';
  return (
    <div
      className={`${ELEVATION_CLASS[elevation]} ${RADIUS_CLASS[radius]} ${SURFACE_PADDING_CLASS[padding]}${interactiveClass} ${className}`.trim()}
      {...rest}
    />
  );
}

export type PaperProps = Omit<SurfaceProps, 'elevation'>;

// Paper: elevation=1 固定の薄いラッパー。「境界のみの控えめな面」。
export function Paper(props: PaperProps) {
  return <Surface {...props} elevation={1} />;
}

export type CardProps = SurfaceProps;

// Card: elevation は既定2(受け付けは 1〜4)。padding/radius は Card らしい既定値に寄せる。
export function Card({ elevation = 2, padding = 'md', radius = 'card', ...rest }: CardProps) {
  return <Surface {...rest} elevation={elevation} padding={padding} radius={radius} />;
}

export type PanelProps = Omit<SurfaceProps, 'elevation'>;

// Panel: elevation=1 固定。「領域の枠」(サイドバー/セクション囲み)用に radius の既定だけ変える。
export function Panel({ radius = 'panel', ...rest }: PanelProps) {
  return <Surface {...rest} elevation={1} radius={radius} />;
}
