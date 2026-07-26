import { Menu as BaseMenu } from '@base-ui/react/menu';
import type * as React from 'react';
import type { ReactNode } from 'react';
import Icon from './icons/icon.tsx';
import { mergePopupClassName, POPOVER_POSITIONER_BASE, popupBase } from './popover.tsx';

// ポップオーバーの上に載せるメニュー。Base UI(floating-ui ベース)の Menu へ委譲する薄い
// compound ラッパー(#6)。旧実装は role="menu" の <ul> + <button role="menuitem"> の行だけで、
// 矢印キーナビも typeahead も自前で持っていなかった。Base UI に委譲することでこれらを獲得し、
// かつ Popover に依存せず単独で開閉できるようになる(旧実装は Popover の中に置く前提だった)。
// 見た目(行のクラス)は旧 ROW 定数から一切変えていない。i18n は持たない。
//
// 使い方(compound): <Menu.Root><Menu.Trigger/><Menu.Portal><Menu.Positioner
// side="bottom" align="start"><Menu.Popup><Menu.Item onClick={...}>...</Menu.Item>
// </Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>

const DEFAULT_SIDE_OFFSET = 8;

const Root = BaseMenu.Root;
const Trigger = BaseMenu.Trigger;
const Portal = BaseMenu.Portal;
const RadioGroup = BaseMenu.RadioGroup;
const Separator = BaseMenu.Separator;
const Group = BaseMenu.Group;
const GroupLabel = BaseMenu.GroupLabel;
const SubmenuRoot = BaseMenu.SubmenuRoot;
export type MenuRootProps = React.ComponentProps<typeof BaseMenu.Root>;
export type MenuTriggerProps = React.ComponentProps<typeof BaseMenu.Trigger>;
export type MenuPortalProps = React.ComponentProps<typeof BaseMenu.Portal>;
export type MenuRadioGroupProps = React.ComponentProps<typeof BaseMenu.RadioGroup>;
export type MenuSeparatorProps = React.ComponentProps<typeof BaseMenu.Separator>;
export type MenuGroupProps = React.ComponentProps<typeof BaseMenu.Group>;
export type MenuGroupLabelProps = React.ComponentProps<typeof BaseMenu.GroupLabel>;
export type MenuSubmenuRootProps = React.ComponentProps<typeof BaseMenu.SubmenuRoot>;

export type MenuPositionerProps = React.ComponentProps<typeof BaseMenu.Positioner>;

// z-index は Popover と同じく **Positioner 側**に置く(#14)。Base UI では Popup が
// position:static なので、Popup に z-index を書いても効かない。詳細は popover.tsx の
// POPOVER_POSITIONER_BASE のコメント参照。
function MenuPositioner({
  sideOffset = DEFAULT_SIDE_OFFSET,
  className = '',
  ...props
}: MenuPositionerProps) {
  return (
    <BaseMenu.Positioner
      sideOffset={sideOffset}
      className={`${POPOVER_POSITIONER_BASE} ${className}`.trim()}
      {...props}
    />
  );
}

// Popover.Popup と同じ面(surface/border/radius/shadow + 既定の p-3 / max-h-80+scroll)を
// 共有する(popover.tsx から export されたヘルパーを流用。#6 で Menu を Popover に依存せず
// 単独開閉可能にしたため、Popover の中に無い Menu 単体でも同じ「浮く面」の見た目を出す
// 必要がある)。padding / scroll の契約も Popover.Popup と揃える(#21)。
export type MenuPopupProps = React.ComponentProps<typeof BaseMenu.Popup> & {
  // 既定の内側 padding(p-3)を出すか。既定 true。
  padding?: boolean;
  // 既定の最大高さ + 内部スクロール(max-h-80 overflow-y-auto)を出すか。既定 true。
  scroll?: boolean;
};

// Popover.Popup と同じ組み立てを共有する(#21。className での打ち消しは効かないので
// prop で出す・出さないを選ぶ。理由は popover.tsx の POPOVER_POPUP_BASE のコメント参照)。
// mobileSheet は Menu には無い概念なので常に false。
function MenuPopup({ padding = true, scroll = true, className, ...props }: MenuPopupProps) {
  return (
    <BaseMenu.Popup
      className={mergePopupClassName(popupBase({ padding, scroll, mobileSheet: false }), className)}
      {...props}
    />
  );
}

// 新 DS(#463) Menu 行: radius-md / gap 13 / padding 11x13 / font 15。hover は surface-hover、
// 選択中は live(green) の tint 面 + green テキスト。旧 menu.tsx の ROW 定数から一切変えていない。
// disabled/hover の表現だけ描画要素によって異なるため、共通部分(MENU_ROW_BASE)を1つ持ち、
// disabled 系のセレクタだけ描画先の要素に合わせて出し分ける(二重管理を避ける)。
//
// ⚠ bg-transparent はここに置かない(#17)。行の背景色は toneClassName /
// plainToneClassName 側が **排他的に** 出す(active なら tint、それ以外なら bg-transparent)。
// base に bg-transparent を置くと、active の green tint と同じクラス属性に両方が並び、
// 配布 CSS の出力順(.bg-transparent idx=22906 > tint の color-mix ルール idx=20987)で
// bg-transparent が後勝ちして tint が消える。どちらもクラス1つで特異度が同じなので、
// 並び順ではなく出力順で決まる。この不具合は 1.x から続いており(#9 の移行時に実測で
// 気づいたが「見た目は変えない」方針だったため changeset に記録だけ残していた)、
// 「静止時は tint なし・hover / キーボードハイライト時だけ tint が出る」という中途半端な
// 状態になっていた(data-highlighted: / hover: のバリアント付きルールは出力順が後で勝つため)。
// bg-transparent を単に落とすだけにしないのは、DS が preflight を配っていないため
// PlainItem(<button>)に UA 既定の buttonface 背景が残るから。排他で出せば両方満たせる。
const MENU_ROW_BASE =
  'flex w-full items-center gap-[13px] rounded-md border-none px-[13px] py-[11px] text-left text-[15px] shadow-none transition-colors duration-(--dur-fast) cursor-pointer';

// Base UI の Item/RadioItem/CheckboxItem は <div> を描画するため、disabled は data-disabled
// 属性で表現される(:disabled は button 等のフォーム要素にしか適用されないため効かない)。
//
// フォーカスリング: Base UI の Item は roving tabIndex で実際に DOM フォーカスを受けるため、
// ブラウザ既定のアウトラインが data-highlighted の背景ハイライトに重なって出てしまう。
// button.tsx / icon-button.tsx / toggle.tsx と同じ DS 共通パターン(focus-visible:shadow-focus
// focus-visible:outline-none)に揃え、既定のアウトラインを消して背景色のハイライトだけで現在
// 位置を示す(二重表現を避ける)。
//
// disabled(data-disabled)行の扱いには注意が必要。「Base UI は disabled 項目を矢印キーナビの
// 対象から除外するのでフォーカスもハイライトも来ない」という当初の想定は誤りで、実機検証の
// 結果 disabled 行にも data-highlighted は普通に乗ることを確認した(Base UI は disabled 項目も
// ハイライト対象に含め、操作だけを disabled にする)。toneClassName 側の面色は
// not-data-disabled: ガードで意図的に出さない(背景が付くと「押せる」と誤読されるため)ので、
// このままだと disabled 行に来た瞬間に現在位置を示すものが何も無くなり、キーボード操作者が
// 迷子になる。そのため data-highlighted かつ data-disabled のときだけ、面色を付けずに
// shadow-focus(既存のフォーカス表現トークン)で「ここにカーソルはあるが操作はできない」を
// 示す。有効な行(data-disabled でない行)は現状どおり面色のみ・アウトラインなしを維持する
// (二重表現にしない判断は変えない)。PlainItem(<button>、移行前と同じ見た目を保つ対象)側には
// ハイライト概念自体が無いためこの追加はしない。
const ROW = `${MENU_ROW_BASE} data-disabled:opacity-(--disabled-opacity) data-disabled:cursor-not-allowed focus-visible:shadow-focus focus-visible:outline-none data-highlighted:data-disabled:shadow-focus`;

// PlainItem は移行前と同じ <button> を描画するため、disabled/hover はネイティブ疑似クラス
// (disabled:/enabled:)で表現できる。移行前の ROW と完全に同じ文字列になる。
const PLAIN_ROW = `${MENU_ROW_BASE} disabled:opacity-(--disabled-opacity) disabled:cursor-not-allowed`;

// active/danger の tint 表現。プレーンな Item でも RadioItem/CheckboxItem と同じ見た目が
// 出せるよう、Base UI 自身の checked 状態(data-checked)には寄せず、旧実装と同じく呼び出し側が
// 渡す active プロップで判定する(呼び出し側は active={selected === value} のように既存の
// 呼び出しパターンをそのまま使える)。
//
// data-highlighted(矢印キー/typeahead でハイライトされた行に Base UI が立てる属性。
// node_modules/@base-ui/react/menu/item/MenuItemDataAttributes.d.ts 参照)には、マウス hover
// と同じ面色を当てる。キーボード操作者が現在位置を見失わないための最優先事項なので、
// hover のセレクタと必ず対にして追加する。
//
// active(green tint)行: 非ハイライト時の見た目(10% tint)は移行前から一切変えていない。
// ただし「選択中の行にちょうどカーソルが来た」場合に何も変化しないと、space-topbar の
// ステージ切替 / user-menu の menuitemradio のような「選択中の項目を操作する」実際の使い方で
// 現在位置を見失う実害があるため、hover/highlight 時だけ tint を 10% → 20% に濃くして区別する
// (テキスト色 green は維持したまま、選択中である情報を失わない)。ハイライト状態自体は
// 移行前に存在しなかった概念なので、この追加は「見た目を変えない」制約に抵触しない。
//
// 静止時の背景は各分岐が排他的に出す(#17)。active だけ tint、それ以外は bg-transparent。
// MENU_ROW_BASE 側に bg-transparent を持たせると出力順で tint が打ち消されるため
// (詳細は MENU_ROW_BASE のコメント)、ここで出し分ける。
function toneClassName(active: boolean, danger: boolean) {
  if (danger) {
    return 'text-danger bg-transparent hover:not-data-disabled:bg-danger-surface data-highlighted:not-data-disabled:bg-danger-surface';
  }
  if (active) {
    return 'text-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] hover:not-data-disabled:bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] data-highlighted:not-data-disabled:bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)]';
  }
  return 'text-text bg-transparent hover:not-data-disabled:bg-surface-hover data-highlighted:not-data-disabled:bg-surface-hover';
}

// PlainItem(<button>)用の tone 表現。移行前と同じく enabled:hover:(ネイティブ疑似クラス)で
// hover を表現する。toneClassName([[<div>用]])とロジックは同じだが、セレクタが異なるため
// 関数を分けている(<button> と <div> の打ち消しクラスを一つの文字列に混ぜないため)。
// toneClassName と同じく静止時の背景を排他的に出す(#17)。<button> は preflight を
// 配っていない環境では UA 既定の背景を持つため、非 active 分岐の bg-transparent は必須。
function plainToneClassName(active: boolean, danger: boolean) {
  if (danger) return 'text-danger bg-transparent enabled:hover:bg-danger-surface';
  if (active) return 'text-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]';
  return 'text-text bg-transparent enabled:hover:bg-surface-hover';
}

type ItemContentProps = {
  icon?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
};

// アイコン(行頭) / ラベル(truncate) / trailing(行末) のレイアウトを Item / RadioItem /
// CheckboxItem で共有する(旧実装の <button> 内マークアップと同一)。
function ItemContent({ icon, trailing, children }: ItemContentProps) {
  return (
    <>
      {icon && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </>
  );
}

export type MenuItemProps = React.ComponentProps<typeof BaseMenu.Item> & {
  icon?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  danger?: boolean;
};

function MenuItem({
  icon,
  trailing,
  active = false,
  danger = false,
  className = '',
  children,
  ...props
}: MenuItemProps) {
  return (
    <BaseMenu.Item
      className={`${ROW} ${toneClassName(active, danger)} ${className}`.trim()}
      {...props}
    >
      <ItemContent icon={icon} trailing={trailing}>
        {children}
      </ItemContent>
    </BaseMenu.Item>
  );
}

export type MenuRadioItemProps = React.ComponentProps<typeof BaseMenu.RadioItem> & {
  icon?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  danger?: boolean;
};

function MenuRadioItem({
  icon,
  trailing,
  active = false,
  danger = false,
  className = '',
  children,
  ...props
}: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem
      className={`${ROW} ${toneClassName(active, danger)} ${className}`.trim()}
      {...props}
    >
      <ItemContent icon={icon} trailing={trailing}>
        {children}
      </ItemContent>
    </BaseMenu.RadioItem>
  );
}

export type MenuCheckboxItemProps = React.ComponentProps<typeof BaseMenu.CheckboxItem> & {
  icon?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  danger?: boolean;
};

function MenuCheckboxItem({
  icon,
  trailing,
  active = false,
  danger = false,
  className = '',
  children,
  ...props
}: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      className={`${ROW} ${toneClassName(active, danger)} ${className}`.trim()}
      {...props}
    >
      <ItemContent icon={icon} trailing={trailing}>
        {children}
      </ItemContent>
    </BaseMenu.CheckboxItem>
  );
}

// サブメニューを開く行。見た目は他の Item と揃える(MENU_ROW_BASE/ROW/toneClassName を
// 共有し、将来 ROW を変えたときの追随漏れを防ぐ)。既定 tone(danger/active は無い、常時
// 通常行)。trailing 省略時はサブメニューであることを示す chevron_right を既定で出す
// (呼び出し側が明示的に trailing を渡した場合はそちらを優先する)。
export type MenuSubmenuTriggerProps = React.ComponentProps<typeof BaseMenu.SubmenuTrigger> & {
  icon?: ReactNode;
  trailing?: ReactNode;
};

function MenuSubmenuTrigger({
  icon,
  trailing,
  className = '',
  children,
  ...props
}: MenuSubmenuTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger
      className={`${ROW} ${toneClassName(false, false)} ${className}`.trim()}
      {...props}
    >
      <ItemContent icon={icon} trailing={trailing ?? <Icon name="chevron_right" size={18} />}>
        {children}
      </ItemContent>
    </BaseMenu.SubmenuTrigger>
  );
}

// ここから下は「見た目だけの行プリミティブ」(振る舞いを持たない)。Menu.Root 配下では
// 上の Base UI パート(Item/RadioItem/CheckboxItem)を使うと矢印キーナビ/typeahead が効くが、
// Base UI の Menu パートはいずれも Menu.Root の React context を要求するため、Popover.Popup
// の中など Menu.Root の外に単独で置くと落ちる。移行前の Menu/MenuItem(role="menu" の <ul> +
// role="menuitem" の <button> だけで、キーボードナビ等の振る舞いは持たなかった)を PlainList/
// PlainItem としてそのまま残し、Popover の中に「行だけ」載せたい既存の使い方(space-topbar の
// ステージ切替 / notification-item / user-menu / notification-center 等)を引き続き支える。

export type MenuPlainListProps = {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
};

// 行のコンテナ。ul をリセットして縦積みにする(移行前の Menu と同一 DOM/クラス)。
function MenuPlainList({ children, ariaLabel, className = '' }: MenuPlainListProps) {
  return (
    <ul
      role="menu"
      aria-label={ariaLabel}
      className={`m-0 flex list-none flex-col gap-0.5 p-0 ${className}`.trim()}
    >
      {children}
    </ul>
  );
}

export type MenuPlainItemProps = {
  onSelect: () => void;
  children: ReactNode;
  // 行頭のアイコン等。
  icon?: ReactNode;
  // 行末の付随要素(チェック・実行中ドット等)。
  trailing?: ReactNode;
  // 選択中(アクセント色 + aria-checked)。radio/checkbox 的なメニューで使う。
  active?: boolean;
  // 破壊的操作(ログアウト・削除等)。危険色で表示する。
  danger?: boolean;
  disabled?: boolean;
  // 既定 'menuitem'。選択状態を持つなら 'menuitemradio' / 'menuitemcheckbox'。
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
};

// 行(<button>)。移行前の MenuItem と同一 DOM/クラス。onSelect で呼び出す(Base UI 側の
// Item/RadioItem/CheckboxItem と違い onClick ではない。移行前の API をそのまま踏襲するため)。
function MenuPlainItem({
  onSelect,
  children,
  icon,
  trailing,
  active = false,
  danger = false,
  disabled = false,
  role = 'menuitem',
}: MenuPlainItemProps) {
  return (
    <li>
      <button
        type="button"
        role={role}
        aria-checked={role === 'menuitem' ? undefined : active}
        disabled={disabled}
        className={`${PLAIN_ROW} ${plainToneClassName(active, danger)}`}
        onClick={onSelect}
      >
        {icon && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {trailing && <span className="shrink-0">{trailing}</span>}
      </button>
    </li>
  );
}

export const Menu = {
  Root,
  Trigger,
  Portal,
  Positioner: MenuPositioner,
  Popup: MenuPopup,
  Item: MenuItem,
  RadioGroup,
  RadioItem: MenuRadioItem,
  CheckboxItem: MenuCheckboxItem,
  Separator,
  Group,
  GroupLabel,
  SubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
  PlainList: MenuPlainList,
  PlainItem: MenuPlainItem,
};

// 旧 API → 新 API 対応表(オーケストレーターが README/changeset へ転記する想定)
//
// <Menu ariaLabel>
//   <MenuItem onSelect icon trailing active danger disabled role='menuitem'>...</MenuItem>
//   <MenuItem role='menuitemradio' active .../>
//   <MenuItem role='menuitemcheckbox' active .../>
// </Menu>
// ↓
// <Menu.Root>
//   <Menu.Trigger>...</Menu.Trigger>
//   <Menu.Portal>
//     <Menu.Positioner side="bottom" align="start">
//       <Menu.Popup aria-label={ariaLabel}>
//         <Menu.Item icon trailing active danger disabled onClick={...}>...</Menu.Item>
//         <Menu.RadioGroup value={selected} onValueChange={setSelected}>
//           <Menu.RadioItem value="queue" icon trailing active={...}>...</Menu.RadioItem>
//         </Menu.RadioGroup>
//         <Menu.CheckboxItem checked={...} onCheckedChange={...} active={...}>...</Menu.CheckboxItem>
//       </Menu.Popup>
//     </Menu.Positioner>
//   </Menu.Portal>
// </Menu.Root>
//
// role='menuitem' | 'menuitemradio' | 'menuitemcheckbox' という単一コンポーネントの role
// 切り替えは廃止し、Menu.Item / Menu.RadioItem / Menu.CheckboxItem という別パートに写した。
// onSelect → onClick(Base UI の Item/RadioItem/CheckboxItem は onClick を受け取る)。
// Menu(コンテナ)自体は独立して開閉できるようになったため、Popover と組み合わせず単体でも使える。
//
// ただし Popover.Popup の中に「行だけ」載せたい(Menu.Root を使わない)既存の使い方は上の
// 移行では表現できない(Base UI の Menu パートはいずれも Menu.Root の context を要求し、その
// 外に置くとクラッシュする)。この使い方は旧 Menu/MenuItem をそのまま Menu.PlainList /
// Menu.PlainItem として残すことで維持する(API・DOM・クラスとも旧 Menu/MenuItem と同一)。
//
// <Menu ariaLabel>...</Menu>            → <Menu.PlainList ariaLabel>...</Menu.PlainList>
// <MenuItem onSelect .../>              → <Menu.PlainItem onSelect .../>(props はそのまま)
