import { useRender } from '@base-ui/react/use-render';
import type * as React from 'react';
import { FOCUS_RING } from '../lib/class-presets.ts';
import { twMerge } from '../lib/tw-merge.ts';

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

// elevation に対して**直交する**2つの軸(#57)。段を増やすのではなく軸を分けるのは、
// elevation の意味(1〜4 = Paper / Card / Popover / Modal)を1つも動かさずに、消費側が
// className で1プロパティだけ上書きしていた2パターンを props で表現するため。
//
//   tone   — 面の「色」だけを切る。'tint' は地の色をわずかに持ち上げただけの面
//            (--color-tint-5)。境界と影は elevation のまま。ホームのマイスペースタイルが
//            `<Surface elevation={1} className="bg-tint-5">` と書いていたもの。
//   shadow — 影だけを落とす。'none' は「背景と境界は欲しいが浮かせたくない」面。
//            リストの中に並ぶ行(プレイリスト行 / 伝言ゲームの履歴行)が
//            `<Surface elevation={2} className="shadow-none">` と書いていたもの。
//
// どちらも**新しい影の実値やトークンを増やしていない**(tint-* は theme.css の既存トークン、
// shadow は既存の組から引くだけ)。
export type SurfaceTone = 'default' | 'tint';
export type SurfaceShadow = 'auto' | 'none';

const TONE_BG: Record<Exclude<SurfaceTone, 'default'>, string> = {
  tint: 'bg-tint-5',
};

// Surface 自身(4辺に境界を引く汎用の面)が使う合成形。上の3マップから組み立てるので、
// 段の定義を足す/変えるときに直すのは上の3つだけで済む。tone/shadow は組み立ての
// 途中で「背景」「影」だけを差し替える(境界は常に elevation が決める)。
function surfaceClass(elevation: Elevation, tone: SurfaceTone, shadow: SurfaceShadow): string {
  const bg = tone === 'default' ? ELEVATION_BG[elevation] : TONE_BG[tone];
  const borderColor = ELEVATION_BORDER_COLOR[elevation];
  const border = borderColor ? `border border-solid ${borderColor}` : '';
  const shadowClass = shadow === 'none' ? '' : ELEVATION_SHADOW[elevation];
  return twMerge(bg, border, shadowClass);
}

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
export type SurfacePadding = 'none' | 'xs' | 'xs.5' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// page.tsx の Footer 等、Surface を包めない(セマンティック要素側に padding を持たせたい)
// 箇所からも参照するので export する。
export const SURFACE_PADDING_CLASS: Record<SurfacePadding, string> = {
  none: 'p-0',
  xs: 'p-1',
  // `xs.5` = xs と sm の中間(6px)。layout.tsx の Gap と同じ理由で足した段(#57)。
  'xs.5': 'p-1.5',
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
const INTERACTIVE_CLASS = `cursor-pointer transition-[transform,background,box-shadow] motion-reduce:transition-none duration-(--dur-fast) hover:-translate-y-0.5 hover:bg-surface-hover ${FOCUS_RING}`;

// render で要素の実体を差し替えたときにだけ足す打ち消し(#56)。既定の <div> には当てない
// —— `m-0` / `text-left` は同じプロパティのユーティリティ(`mt-4` / `text-center`)と強さが
// 並ぶので、常時付けると消費側の className が勝てるかどうかが Tailwind の出力順に依存して
// しまう。render を渡したときだけに限れば「UA 既定を消す」という目的に対して過不足がない。
//
// 何を消しているか:
//   appearance-none — <button> の OS ボタン外観
//   m-0             — <button> / <fieldset> 等が持つ UA マージン
//   text-left       — <button> の text-align:center(面の中身は左揃えが正)
//   active:scale-100— 消費側(insession-app)の legacy CSS が `button:active` に持つ縮小。
//                     DS は preflight を配らないので、消費側の button 既定が露出する
//                     (side-nav.tsx の ITEM と同じ手当て)
// 面そのもの(背景 / 境界 / 影 / padding)は elevation 側のクラスが当てるので、消費側は
// `border-none bg-transparent p-0 shadow-none` を書かなくてよい。
const RENDER_RESET_CLASS = 'appearance-none m-0 text-left active:scale-100';

export type SurfaceProps = useRender.ComponentProps<'div'> & {
  elevation?: Elevation;
  radius?: SurfaceRadius;
  padding?: SurfacePadding;
  // 面の色だけを切る直交軸(#57)。既定は elevation が決める背景。
  tone?: SurfaceTone;
  // 影だけを落とす直交軸(#57)。既定は elevation が決める影。
  shadow?: SurfaceShadow;
  interactive?: boolean;
};

// Surface: 面の基底プリミティブ。Paper/Card/Panel はこれの elevation 固定(または既定値違い)
// ラッパーで、面のロジックは重複させずここへ委譲する。
//
// `render` は Base UI の useRender に委譲する(side-nav.tsx と同じ流儀)。クリックできるカードを
// 「リセットした <button> > Surface」の入れ子ではなく1要素で描くための口で、
// <button> の中に <div> を置く content model 違反も同時に解消する:
//   <Card render={<button type="button" />} onClick={…} interactive>…</Card>
//
// 戻り値の型を明示する理由は side-nav.tsx と同じ(useRender の返り値が null を含みうる型に
// 推論され、dist/index.d.ts に出てしまう)。
export function Surface({
  elevation = 1,
  radius = 'card',
  padding = 'none',
  tone = 'default',
  shadow = 'auto',
  interactive = false,
  className = '',
  render,
  ...rest
}: SurfaceProps): React.ReactElement {
  const interactiveClass = interactive ? ` ${INTERACTIVE_CLASS}` : '';
  const resetClass = render ? ` ${RENDER_RESET_CLASS}` : '';
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      className: twMerge(
        surfaceClass(elevation, tone, shadow),
        RADIUS_CLASS[radius],
        SURFACE_PADDING_CLASS[padding],
        interactiveClass,
        resetClass,
        className,
      ),
    },
  });
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
