import type { ComponentProps } from 'react';

// レイアウトプリミティブ（Stack / Grid / Spacer / Divider / Center / Container。純粋 leaf UI）。
// アプリの画面組みで繰り返し書かれる flex/grid の定型を吸収する。見た目のトークンは持たず、
// 並び・余白・揃えだけを扱う（色/面/角丸は Surface 側の役割）。

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

// レスポンシブ props の共通形。base は無指定時の既定値、sm 以上は min-width のブレークポイントで
// 上書きする（Tailwind の既定スケール = sm:640px / md:768px / lg:1024px / xl:1280px に準拠）。
export type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };

export type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// ⚠ ここに書いたクラス名の文字列リテラルが、そのまま styles.src.css の @source 走査に
// 引っかかって配布 CSS へ出力される（README「pnpm check:styles が守っているもの」参照）。
// `` `${bp}:gap-${n}` `` のような動的合成は禁止（走査に引っかからずビルドは緑のまま CSS だけ
// 欠ける）。ブレークポイント × gap トークンの全組み合わせを静的リテラルとして書き切ることで
// 安全に可変にする。Stack と Grid の両方がこのマップを参照するためここで1つだけ定義し、
// 後続で Surface / Page 系プリミティブを足すときも import して使えるよう export する。
export const GAP_CLASS: Record<'base' | Breakpoint, Record<Gap, string>> = {
  base: {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
    '2xl': 'gap-8',
  },
  sm: {
    none: 'sm:gap-0',
    xs: 'sm:gap-1',
    sm: 'sm:gap-2',
    md: 'sm:gap-3',
    lg: 'sm:gap-4',
    xl: 'sm:gap-6',
    '2xl': 'sm:gap-8',
  },
  md: {
    none: 'md:gap-0',
    xs: 'md:gap-1',
    sm: 'md:gap-2',
    md: 'md:gap-3',
    lg: 'md:gap-4',
    xl: 'md:gap-6',
    '2xl': 'md:gap-8',
  },
  lg: {
    none: 'lg:gap-0',
    xs: 'lg:gap-1',
    sm: 'lg:gap-2',
    md: 'lg:gap-3',
    lg: 'lg:gap-4',
    xl: 'lg:gap-6',
    '2xl': 'lg:gap-8',
  },
  xl: {
    none: 'xl:gap-0',
    xs: 'xl:gap-1',
    sm: 'xl:gap-2',
    md: 'xl:gap-3',
    lg: 'xl:gap-4',
    xl: 'xl:gap-6',
    '2xl': 'xl:gap-8',
  },
};

export type Columns = 1 | 2 | 3 | 4 | 5 | 6;

// Grid の columns 版の直積マップ。理由は GAP_CLASS と同じ（動的クラス名合成の禁止）。
export const COLUMNS_CLASS: Record<'base' | Breakpoint, Record<Columns, string>> = {
  base: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  },
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
  },
};

// Responsive<K> を「base → sm → md → lg → xl」の順にクラス名へ展開する。単一値なら base だけを引く。
function resolveResponsive<K extends string | number>(
  value: Responsive<K>,
  classMap: Record<'base' | Breakpoint, Record<K, string>>,
): string {
  if (typeof value === 'object' && value !== null) {
    const tokens: string[] = [];
    if (value.base !== undefined) tokens.push(classMap.base[value.base]);
    if (value.sm !== undefined) tokens.push(classMap.sm[value.sm]);
    if (value.md !== undefined) tokens.push(classMap.md[value.md]);
    if (value.lg !== undefined) tokens.push(classMap.lg[value.lg]);
    if (value.xl !== undefined) tokens.push(classMap.xl[value.xl]);
    return tokens.join(' ');
  }
  return classMap.base[value as K];
}

export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// align/justify は Stack(flex) と Grid の両方から使うため共有する。単一値のみ許可
// （レスポンシブ対応が要るのは gap/columns だけという API 仕様のため）。
const ALIGN: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};
const JUSTIFY: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export type StackDirection = 'row' | 'column';

const DIRECTION: Record<StackDirection, string> = {
  row: 'flex-row',
  column: 'flex-col',
};

export type StackProps = {
  direction?: StackDirection;
  gap?: Responsive<Gap>;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className'>;

// Stack: flex コンテナの基底プリミティブ。VStack/HStack はこれの direction 固定ラッパーで、
// ロジックは持たず Stack へ委譲するだけにする（重複を避けるため）。
export function Stack({
  direction = 'column',
  gap = 'none',
  align,
  justify,
  wrap = false,
  className = '',
  ...rest
}: StackProps) {
  const gapClass = resolveResponsive(gap, GAP_CLASS);
  const alignClass = align ? ` ${ALIGN[align]}` : '';
  const justifyClass = justify ? ` ${JUSTIFY[justify]}` : '';
  const wrapClass = wrap ? ' flex-wrap' : '';
  return (
    <div
      className={`flex ${DIRECTION[direction]} ${gapClass}${alignClass}${justifyClass}${wrapClass} ${className}`.trim()}
      {...rest}
    />
  );
}

export type VStackProps = Omit<StackProps, 'direction'>;

// VStack = Stack(direction="column") の薄いラッパー。direction を受け付けない型にすることで
// 呼び出し側の意図（縦積み固定）を型で保証する。
export function VStack(props: VStackProps) {
  return <Stack {...props} direction="column" />;
}

export type HStackProps = Omit<StackProps, 'direction'>;

// HStack = Stack(direction="row") の薄いラッパー。
export function HStack(props: HStackProps) {
  return <Stack {...props} direction="row" />;
}

export type GridProps = {
  columns?: Responsive<Columns>;
  gap?: Responsive<Gap>;
  align?: Align;
  justify?: Justify;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className'>;

export function Grid({
  columns = 1,
  gap = 'none',
  align,
  justify,
  className = '',
  ...rest
}: GridProps) {
  const columnsClass = resolveResponsive(columns, COLUMNS_CLASS);
  const gapClass = resolveResponsive(gap, GAP_CLASS);
  const alignClass = align ? ` ${ALIGN[align]}` : '';
  const justifyClass = justify ? ` ${JUSTIFY[justify]}` : '';
  return (
    <div
      className={`grid ${columnsClass} ${gapClass}${alignClass}${justifyClass} ${className}`.trim()}
      {...rest}
    />
  );
}

export type SpacerProps = {
  className?: string;
} & Omit<ComponentProps<'div'>, 'className'>;

// Spacer: flex 中で余白を食う不可視の伸縮要素。装飾のみなので aria-hidden にする。
export function Spacer({ className = '', ...rest }: SpacerProps) {
  return <div aria-hidden="true" className={`flex-1 ${className}`.trim()} {...rest} />;
}

export type DividerOrientation = 'horizontal' | 'vertical';

// 区切り線は「枠線」ではなく極細の塗り矩形として表現する（h-px/w-px + bg-border）。
// border ユーティリティにすると 1px 未満の丸め誤差でブラウザごとに太さがぶれることがあるため、
// 幅そのものを固定した塗りにして DS 全体で見え方を揃える。色は border-border と同じトークンを
// 背景色として使う。
const DIVIDER_ORIENTATION: Record<DividerOrientation, string> = {
  horizontal: 'h-px w-full',
  vertical: 'w-px self-stretch',
};

export type DividerProps = {
  orientation?: DividerOrientation;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className'>;

export function Divider({ orientation = 'horizontal', className = '', ...rest }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`shrink-0 bg-border ${DIVIDER_ORIENTATION[orientation]} ${className}`.trim()}
      {...rest}
    />
  );
}

export type CenterProps = {
  // true で inline-grid にする（インライン文脈に埋め込みたいとき）。既定は grid（ブロック）。
  inline?: boolean;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className'>;

// Center: 子要素を縦横中央に置くだけの器。grid + place-items-center は子の幅/高さを問わず
// 1要素・複数要素のどちらでも中央寄せできる（flex + items/justify-center だと複数子で
// 意図しない横並びになるため grid を選ぶ）。
export function Center({ inline = false, className = '', ...rest }: CenterProps) {
  const display = inline ? 'inline-grid' : 'grid';
  return <div className={`${display} place-items-center ${className}`.trim()} {...rest} />;
}

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// DS として妥当な固定 px を採用（Tailwind 既定の max-w-screen-* は画面幅そのままで
// コンテナ用途には広すぎるため使わない）。full は制約なし（幅いっぱい）。
const CONTAINER_SIZE: Record<ContainerSize, string> = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  full: 'max-w-full',
};

export type ContainerProps = {
  size?: ContainerSize;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className'>;

// Container: 最大幅 + 中央寄せ + 左右パディング。w-full を付けないと親の幅次第で
// max-width が効かない（要素が縮んだままになる）ことがあるため明示する。
export function Container({ size = 'lg', className = '', ...rest }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-4 ${CONTAINER_SIZE[size]} ${className}`.trim()} {...rest} />
  );
}
