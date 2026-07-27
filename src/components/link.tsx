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
//   wrapper = カード等のブロック全体をリンクにする器（#795）。中身のタイポは呼び出し側が持つので
//             色・ウェイト・サイズを一切持たず（`text-inherit`）、UA 既定の下線だけを確実に消す。
//             面/境界/角丸/影などのカード表現は呼び出し側の className で足す。
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
//   bare    = 既に自前の色を持つ行/セルへ「下線を消す」だけを足す器（#82 フォローアップ）。
//             wrapper との違いは `text-inherit` を出さないこと。色を持つ要素（Menu.Item の
//             tone クラス等）と同じ要素に wrapper を重ねると、どちらも単一クラス（特異度が
//             同じ）なので配布 CSS の**出力順**で勝敗が決まり、text-inherit が tone の色を
//             静かに潰す（menu.tsx の bg-transparent と同じ失敗モード。実測で danger の
//             警告色が消えることを確認した）。色を出さない bare なら衝突自体が起きない。
//             ⚠ 色を持たない素の <a> に使うと UA 既定のリンク色が出る。必ず色を持つ要素に。
export type LinkVariant = 'inline' | 'subtle' | 'pill' | 'wrapper' | 'bare';

// 下線は使わない（ボタンテキスト調）。色・ウェイトはトークン経由。arbitrary は 4/8px リズムに
// 載らない値のみ（py-[7px] 等）。
const VARIANT: Record<LinkVariant, string> = {
  inline:
    'text-link font-semibold no-underline cursor-pointer transition-colors duration-(--dur-fast) hover:text-link-hover',
  subtle:
    'text-link text-sm font-semibold no-underline cursor-pointer transition-colors duration-(--dur-fast) hover:text-link-hover',
  pill: 'inline-flex items-center gap-1.5 self-start px-4 py-2.5 rounded-pill border border-solid border-border bg-surface text-text text-sm font-bold tracking-pill uppercase no-underline cursor-pointer transition-[background,color,transform] duration-(--dur-base) ease-spring hover:bg-surface-hover hover:text-accent hover:-translate-y-px',
  wrapper: 'text-inherit no-underline cursor-pointer',
  bare: 'no-underline cursor-pointer',
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
  // 中身は任意。Base UI の `render` に渡す器として使う場合（<Menu.Item render={<Link
  // variant="wrapper" href="…" />}> など）、children は Base UI 側が注入するのでここでは
  // 渡さない。それ以外の通常利用では必ず中身を書く。
  children?: ReactNode;
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
