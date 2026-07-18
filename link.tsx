import {
  type AnchorHTMLAttributes,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

// DS のテキストリンク（純粋 leaf UI）。#633。下線は全 variant で使わず、ボタンのラベルのように
// 「色 + フォントウェイト（+ hover の色/面変化）」で区別する。用途で3種に整理する:
//   inline  = 本文中リンク。静止=link 色 + semibold、hover で link-hover 色。
//   subtle  = リスト脇の弱い誘導（旧 `text-accent text-sm` の置換先）。inline の小サイズ版。
//   pill    = セクション見出し脇や「戻る」導線などの独立リンク（旧 `.section-link` / `.list-back` を統合）。
//
// 色は必ずセマンティックトークン（--color-link / --color-link-hover。生 hex を書かない）。
// focus リングはアプリ横断のグローバル `:focus-visible`（--color-focus-ring / --focus-ring-*）に
// 一任する = 全リンクで共通。ここでは outline を上書きしない。
//
// react-router の `Link` / `NavLink` と 生 `<a>` の両方を吸収するため:
//   - 生 `<a>` なら `<Link variant="inline" href="…">` をそのまま使う。
//   - react-router 等の別コンポーネントには `asChild` で子要素へクラスだけを注入する
//     （`<Link asChild variant="pill"><RouterLink to="/">…</RouterLink></Link>`）。
//   - className だけ欲しい場合は `linkClass(variant)` を直接 className に渡す
//     （react-router `Link` の className に載せる用途で最も手軽）。
export type LinkVariant = 'inline' | 'subtle' | 'pill';

// 下線は使わない（ボタンテキスト調）。色・ウェイトはトークン経由。arbitrary は 4/8px リズムに
// 載らない値のみ（py-[7px] 等）。
const VARIANT: Record<LinkVariant, string> = {
  inline:
    'text-link font-semibold no-underline cursor-pointer transition-colors duration-(--dur-fast) hover:text-link-hover',
  subtle:
    'text-link text-sm font-semibold no-underline cursor-pointer transition-colors duration-(--dur-fast) hover:text-link-hover',
  pill: 'inline-flex items-center gap-1.5 self-start px-3 py-[7px] rounded-pill border border-solid border-border bg-surface text-text-dim text-sm font-bold tracking-[0.08em] uppercase no-underline cursor-pointer transition-[background,color,transform] duration-(--dur-base) ease-spring hover:bg-surface-hover hover:text-text hover:-translate-y-px',
};

// variant のクラス文字列。react-router `Link`/`NavLink` の className にそのまま渡せる。
export function linkClass(variant: LinkVariant = 'inline', className = ''): string {
  return `${VARIANT[variant]} ${className}`.trim();
}

export type LinkProps = {
  variant?: LinkVariant;
  // 子要素（react-router の Link/NavLink 等）へクラスだけを注入して DS 化する。
  asChild?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>;

export default function Link({
  variant = 'inline',
  asChild = false,
  className = '',
  children,
  ...rest
}: LinkProps) {
  const cls = linkClass(variant, className);
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      ...rest,
      className: `${cls} ${child.props.className ?? ''}`.trim(),
    });
  }
  return (
    <a className={cls} {...rest}>
      {children}
    </a>
  );
}
