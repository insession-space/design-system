import { useRender } from '@base-ui/react/use-render';
import type * as React from 'react';
import { createContext, useContext } from 'react';
import Icon, { type IconName } from '../icons/icon.tsx';
import { linkClass } from './link.tsx';

// 画面左の縦ナビ（左レール）。#76。insession-app（web / help）と loophub-app が同型の左レールを
// それぞれ持っていたのを、アプリ非依存のプリミティブとしてここへ集約する。
//
// Base UI の思想に準拠した compound parts で作る:
//   - パーツを組み合わせる（SideNav.Root / .Brand / .Group / .Item）。items 配列 API にしない
//     ＝ ロゴ・バッジ・外部リンクといった個別事情が props 爆発にならない。
//   - `render` プロップで要素の実体を差し替える（Base UI の useRender。DS の `Link` は先行実装の
//     `asChild` を採るが、Base UI 委譲コンポーネント（Tabs 等）と揃えてここは `render` を正とする）。
//   - 状態は `data-*` として DOM に出す（data-active / data-secondary）。消費側が追加スタイルを
//     当てられる。見た目の分岐も動的クラス生成ではなく `data-active:` バリアントで書く（Tabs と同じ）。
//   - a11y は DS が持つ: Root は `<nav aria-label>`（ラベル必須）、active な Item に
//     `aria-current="page"`、装飾アイコンは `aria-hidden`。
//
// **どのルートが active かは DS が導出しない。** 呼び出し側が `active` を渡す（ルーターを DS に
// 持ち込まない）。react-router なら `<SideNav.Item render={<NavLink to="/" />} active={…} />`、
// ルーティングを持たない画面なら `href` / `onClick` をそのまま渡す。
//
// 使い方:
//   <SideNav.Root aria-label="メインナビゲーション">
//     <SideNav.Brand render={<NavLink to="/" />} aria-label="InSession"><Logo /></SideNav.Brand>
//     <SideNav.Group>
//       <SideNav.Item icon="home" active render={<NavLink to="/" />}>ホーム</SideNav.Item>
//     </SideNav.Group>
//     <SideNav.Group secondary>
//       <SideNav.Item href="https://…" external trailing={<Badge variant="new">NEW</Badge>}>
//         リリースノート
//       </SideNav.Item>
//     </SideNav.Group>
//   </SideNav.Root>

// 2 カラムの左レール: flat な surface-2 + 右ボーダー。影は持たない。
const ROOT =
  'flex w-[232px] flex-none flex-col gap-[22px] overflow-y-auto border-0 border-r border-solid border-border bg-surface-2 px-4 py-[22px]';
// 単独で 2 カラムを組む場合はレール自身が画面全高を持つ（fullHeight 既定 true）。PageLayout の
// sidebar スロットのように高さを親が決める場合は fullHeight={false} にする。h-dvh と h-full を
// className で混ぜると Tailwind の出力順次第で勝ち負けが決まるため、prop で排他にする。
const ROOT_HEIGHT = { true: 'h-dvh', false: 'h-full' } as const;

// ブランド枠は <a>。DS は preflight を配らないので、中にテキストを置くと UA 既定の下線が
// 出る。下線の打ち消しは Link に一元化する（linkClass。'wrapper' は色を持たない器）。
const BRAND = `flex items-center px-1.5 py-0.5 ${linkClass('wrapper')}`;

const GROUP = 'flex flex-col gap-2';
// 副次リンク群は最下部へ寄せ、区切り線を上に置く。
const GROUP_SECONDARY = `${GROUP} mt-auto border-0 border-t border-solid border-border pt-[18px]`;

// inactive=text-dim / hover=surface-hover / active=surface-3 面 + 細ボーダー + text。
// active は state から出る data-active で表現する（クラスの動的生成はしない）。
// `group` はアイコンが data-active を親から読むため（group-data-active:text-mint）。
// active:scale-100 / hover:shadow-none は、プリフライトを配らない DS で <button> に露出する
// 消費側の legacy な button:hover/:active（glow + scale）を打ち消すため（Tabs と同じ手当て）。
const ITEM =
  'group flex w-full cursor-pointer items-center gap-[11px] rounded-md border border-solid border-transparent bg-transparent px-[13px] py-[11px] text-left text-base no-underline shadow-none transition-[background-color,border-color,color] duration-(--dur-fast) hover:bg-surface-hover hover:text-text hover:shadow-none active:scale-100 data-active:border-border data-active:bg-surface-3 data-active:font-bold data-active:text-text';
// 主導線は text-dim、副次リンク（ガイド / ヘルプ / リリースノート等）は一段弱い text-faint。
// Group の secondary から Context 越しに継ぐので、Item 1つ1つに指定させない。
const ITEM_VARIANT = {
  primary: 'font-medium text-text-dim',
  secondary: 'font-medium text-text-faint',
} as const;

const ITEM_TEXT = 'min-w-0 flex-1';
const ITEM_ICON = 'inline-flex shrink-0 group-data-active:text-mint';

const PRIMARY_ICON_SIZE = 19;
const EXTERNAL_ICON_SIZE = 15;

// Group が secondary かどうかを配下の Item へ伝える。Item ごとの指定を不要にする（Tabs の
// TabsVariantContext と同じ手法）。
const SecondaryContext = createContext(false);

export type SideNavRootProps = useRender.ComponentProps<'nav'> & {
  // ナビゲーションランドマークのラベル。同一画面に複数のナビがあるとき読み上げで区別できるよう必須。
  'aria-label': string;
  // レール自身が画面全高（h-dvh）を持つか。親が高さを決めるレイアウト（PageLayout の sidebar）では false。
  fullHeight?: boolean;
};

// 戻り値の型は明示する。useRender の返り値は `enabled` の推論次第で `null` を含みうる型になり、
// 型宣言（dist/index.d.ts）に `: null` と出てしまう（enabled を渡していないので実際は常に要素）。
function SideNavRoot({
  fullHeight = true,
  className = '',
  render,
  ...props
}: SideNavRootProps): React.ReactElement {
  return useRender({
    render,
    defaultTagName: 'nav',
    props: {
      ...props,
      className: `${ROOT} ${ROOT_HEIGHT[fullHeight ? 'true' : 'false']} ${className}`.trim(),
    },
  });
}

export type SideNavBrandProps = useRender.ComponentProps<'a'>;

// レール最上部のブランド枠。中身（ロゴ画像 / LogoMark など）は呼び出し側が入れる
// （DS はアプリのロゴアセットを持たない）。既定は <a>、react-router なら render で差し替える。
function SideNavBrand({ className = '', render, ...props }: SideNavBrandProps): React.ReactElement {
  return useRender({
    render,
    defaultTagName: 'a',
    props: { ...props, className: `${BRAND} ${className}`.trim() },
  });
}

export type SideNavGroupProps = useRender.ComponentProps<'div'> & {
  // 副次リンク群。最下部へ寄せ（mt-auto）、上に区切り線を引き、配下の Item を弱色にする。
  secondary?: boolean;
};

function SideNavGroup({
  secondary = false,
  className = '',
  render,
  ...props
}: SideNavGroupProps): React.ReactElement {
  const element = useRender({
    render,
    defaultTagName: 'div',
    state: { secondary },
    props: {
      ...props,
      className: `${secondary ? GROUP_SECONDARY : GROUP} ${className}`.trim(),
    },
  });
  return <SecondaryContext.Provider value={secondary}>{element}</SecondaryContext.Provider>;
}

export type SideNavItemState = {
  active: boolean;
  secondary: boolean;
};

export type SideNavItemProps = useRender.ComponentProps<'a', SideNavItemState> & {
  // 行頭のアイコン。装飾なので aria-hidden で読み上げから外す（ラベルは children）。
  icon?: IconName;
  // 現在地。DS は導出せず呼び出し側が渡す（ルーターに依存しない）。aria-current="page" と data-active が付く。
  active?: boolean;
  // ラベルの右に置く付随要素（NEW バッジ / 件数など）。外部リンクアイコンよりは左に並ぶ。
  trailing?: React.ReactNode;
  // 別タブで開く外部リンク。target/rel を付け、行末に open_in_new アイコンを出す。
  external?: boolean;
};

function SideNavItem({
  icon,
  active = false,
  trailing,
  external = false,
  className = '',
  children,
  render,
  ...props
}: SideNavItemProps): React.ReactElement {
  const secondary = useContext(SecondaryContext);
  // href があればリンク、無ければ操作（loophub のように onSelect でルートを切り替える使い方）。
  const isLink = props.href != null;
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return useRender<SideNavItemState, HTMLAnchorElement, undefined>({
    render,
    defaultTagName: isLink ? 'a' : 'button',
    state: { active, secondary },
    props: {
      ...(isLink ? {} : { type: 'button' }),
      ...externalProps,
      ...props,
      'aria-current': active ? 'page' : undefined,
      className: `${ITEM} ${ITEM_VARIANT[secondary ? 'secondary' : 'primary']} ${className}`.trim(),
      children: (
        <>
          {icon && (
            <span className={ITEM_ICON} aria-hidden="true">
              <Icon name={icon} size={PRIMARY_ICON_SIZE} />
            </span>
          )}
          <span className={ITEM_TEXT}>{children}</span>
          {trailing}
          {external && <Icon name="open_in_new" size={EXTERNAL_ICON_SIZE} />}
        </>
      ),
    },
  });
}

export const SideNav = {
  Root: SideNavRoot,
  Brand: SideNavBrand,
  Group: SideNavGroup,
  Item: SideNavItem,
};
