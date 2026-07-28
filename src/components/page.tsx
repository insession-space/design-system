import type { ComponentProps, ReactNode } from 'react';
import { type Align, type Gap, HStack, VStack } from './layout.tsx';
import {
  ELEVATION_BG,
  ELEVATION_BORDER_COLOR,
  SURFACE_PADDING_CLASS,
  type SurfacePadding,
} from './surface.tsx';

// 画面骨格プリミティブ(AppBar / Toolbar / PageHeader / PageLayout / Footer)。
// 新しい並び・面のロジックは持たず、layout.tsx(Stack 系)と surface.tsx(段のトークン)を
// 組み合わせて「画面でよく繰り返される骨格」を切り出したもの。
//
// AppBar / Footer はセマンティック要素(header / footer)自身に面を持たせる必要があり、かつ
// 境界は4辺ではなく1辺だけ(bar の下端 / footer の上端)に引くのが正しい見た目なので、
// Surface コンポーネントでは包めない。代わりに surface.tsx が段ごとに分けて export している
// ELEVATION_BG / ELEVATION_BORDER_COLOR / SURFACE_PADDING_CLASS を引いて、
// **段の定義は surface.tsx の1箇所に置いたまま辺だけ自分で選ぶ**形にしている。

export type AppBarProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  // 既定 true。スクロールしても画面上端に張り付く(sticky top-0)。
  // z 値は theme.css の --z-sticky(「スペースのトップバー(sticky)」用に既に用意されている値)を使う。
  sticky?: boolean;
  className?: string;
} & Omit<ComponentProps<'header'>, 'className'>;

// AppBar: 画面上端のバー。left/center/right の3スロットを HStack で並べ、center だけ
// flex-1 で伸ばす(左右は shrink-0 で潰れないようにする)。面は elevation=1(境界のみの段)の
// 背景と境界色を surface.tsx から引き、境界の辺だけ下端(border-b)に絞る。
// 高さは固定せず内側の padding(py-3)で決める。
export function AppBar({
  left,
  center,
  right,
  sticky = true,
  className = '',
  ...rest
}: AppBarProps) {
  const stickyClass = sticky ? 'sticky top-0 z-[var(--z-sticky)]' : '';
  return (
    <header
      className={`${stickyClass} ${ELEVATION_BG[1]} border-x-0 border-t-0 border-b border-solid ${ELEVATION_BORDER_COLOR[1]} ${className}`.trim()}
      {...rest}
    >
      <HStack align="center" gap="sm" className="px-4 py-3">
        <div className="shrink-0">{left}</div>
        <div className="min-w-0 flex-1">{center}</div>
        <div className="shrink-0">{right}</div>
      </HStack>
    </header>
  );
}

export type ToolbarProps = {
  gap?: Gap;
  align?: Align;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className' | 'role'>;

// Toolbar: バー内(または単体)で使う水平ツール列。HStack に role="toolbar" を足すだけの
// 薄いラッパー(VStack/HStack と同じ「委譲するだけ」の作り)。AppBar の外でも独立して使える。
export function Toolbar({ gap = 'sm', align, className = '', ...rest }: ToolbarProps) {
  return <HStack role="toolbar" gap={gap} align={align} className={className} {...rest} />;
}

// ⚠ `title` を Omit しないと、HTML の title 属性(string)と交差して `ReactNode & string` に
// 潰れ、**文字列以外を渡せなくなる**(型エラーになる)。見出しにアイコンやブランドドットを
// 混ぜた ReactNode を渡す使い方が塞がれるので、同名の HTML 属性は必ず Omit する。
// 他のプリミティブの props(gap / align / padding / elevation / size / wrap …)は div の
// HTMLAttributes に同名が無いため衝突しない。
export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className' | 'title'>;

// PageHeader: 画面見出しブロック。title/description は theme.css のセマンティック
// タイポグラフィトークン(text-h1 = 見出し階層のうち画面タイトル相当、text-text-dim = 補足文の
// 色)を当てるだけで DS の見た目になる。actions がある場合だけ右側に確保する
// (無ければ HStack の justify="between" が効かず title 側が幅いっぱいを使う)。
export function PageHeader({
  title,
  description,
  actions,
  className = '',
  ...rest
}: PageHeaderProps) {
  return (
    <HStack
      justify="between"
      align="start"
      gap="md"
      className={`flex-wrap ${className}`.trim()}
      {...rest}
    >
      <VStack gap="xs" className="min-w-0">
        <h1 className="text-h1 text-text">{title}</h1>
        {description && <p className="text-body text-text-dim">{description}</p>}
      </VStack>
      {actions && <div className="shrink-0">{actions}</div>}
    </HStack>
  );
}

export type PageScroll = 'page' | 'body';

export type PageLayoutProps = {
  appBar?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  // どこがスクロールするか。既定は 'page'。
  scroll?: PageScroll;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className' | 'children'>;

// スクロールの主体をどちらにするかで骨格の高さ制約が変わる。両方とも実際に需要があるので
// prop で選ばせる(片方に決め打つと、もう一方は className で打ち消す必要が出てしまう)。
//
//   'page' — ページ全体が内容ぶん伸び、ブラウザ側がスクロールする(LP / ドキュメント型)。
//     外枠は min-h-dvh で「最低でも画面いっぱい」を保証するだけに留め、main に高さ制約や
//     overflow を付けない。AppBar を画面に残したいときは AppBar 側の sticky が担う。
//   'body' — 外枠を h-dvh で画面高さに固定し、本文だけがスクロールする(アプリシェル型)。
//     AppBar / Footer は画面に固定されたまま動かない。
//
// ⚠ 'body' では main / 本文行に min-h-0 が必須。これが無いと flex item は子の内容ぶん伸びて
// 外枠の h-dvh を突き破り、overflow-y-auto に有効な高さ制約が生まれない(= スクロールしない)。
// 逆に 'page' で overflow-y-auto を付けると、高さが確定していないため何も起きないどころか
// position:sticky の追従先が main になってしまい AppBar の sticky が効かなくなる。
const PAGE_SCROLL_ROOT: Record<PageScroll, string> = {
  page: 'min-h-dvh',
  body: 'h-dvh',
};
const PAGE_SCROLL_MAIN: Record<PageScroll, string> = {
  page: 'flex-1',
  body: 'min-h-0 flex-1 overflow-y-auto',
};
const PAGE_SCROLL_ROW: Record<PageScroll, string> = {
  page: 'flex-1 items-stretch',
  body: 'min-h-0 flex-1 items-stretch',
};
const PAGE_SCROLL_ASIDE: Record<PageScroll, string> = {
  page: 'shrink-0',
  body: 'shrink-0 overflow-y-auto',
};

// PageLayout: 画面骨格。sidebar があるときだけ本文行を横並び(aside + main)にし、
// 無いときは main だけの縦一列にする(sidebar 用の HStack を無条件に挟むと、
// 不要な flex コンテナが1段増えるため分岐する)。
export function PageLayout({
  appBar,
  sidebar,
  footer,
  scroll = 'page',
  children,
  className = '',
  ...rest
}: PageLayoutProps) {
  const body = sidebar ? (
    <HStack className={PAGE_SCROLL_ROW[scroll]}>
      <aside className={PAGE_SCROLL_ASIDE[scroll]}>{sidebar}</aside>
      <main className={`min-w-0 ${PAGE_SCROLL_MAIN[scroll]}`}>{children}</main>
    </HStack>
  ) : (
    <main className={PAGE_SCROLL_MAIN[scroll]}>{children}</main>
  );
  return (
    <VStack className={`${PAGE_SCROLL_ROOT[scroll]} ${className}`.trim()} {...rest}>
      {appBar}
      {body}
      {footer}
    </VStack>
  );
}

export type FooterProps = {
  padding?: SurfacePadding;
  className?: string;
} & Omit<ComponentProps<'footer'>, 'className'>;

// Footer: 画面下端の領域。境界は上端(border-t)だけに引き、境界色と padding は surface.tsx の
// マップから引く(SurfacePadding は layout.tsx の Gap と同じ語彙・同じ刻みなので、他プリミティブの
// 余白と揃う)。padding のためだけに内側へ Surface を挟むと DOM が1段深くなるだけなので、
// footer 要素自身にクラスを当てる。
export function Footer({ padding = 'md', className = '', ...rest }: FooterProps) {
  return (
    <footer
      className={`border-x-0 border-b-0 border-t border-solid ${ELEVATION_BORDER_COLOR[1]} ${SURFACE_PADDING_CLASS[padding]} ${className}`.trim()}
      {...rest}
    />
  );
}
