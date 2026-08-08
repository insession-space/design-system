import { Fragment, type ReactNode } from 'react';
import type { AvatarStatus } from '../components/avatar.tsx';
import Link from '../components/link.tsx';
import { Menu, type MenuPositionerProps } from '../components/menu.tsx';
import Icon, { type IconName } from '../icons/icon.tsx';
import { FOCUS_RING, TRANSITION_COLORS } from '../lib/class-presets.ts';
import { twMerge } from '../lib/tw-merge.ts';
import UserLabel from './user-label.tsx';

// SideNav 最下部に常設するログインユーザーのエリア（#79）。行（アバター + 名前 + メール +
// 開閉アフォーダンス）と、押したときに開くアカウントメニューをセットで持つ。
//
// components/ の leaf プリミティブ（UserLabel は ui-kit、Menu は components）を束ねるので
// ui-kit/ に置く（components/ は ui-kit/ を参照しない、という依存の向きを守る）。公開窓口
// （src/index.ts）で `SideNav.Account` として SideNav の parts に合流させる。
//
// ── 何を DS が持ち、何を持たないか ─────────────────────────
// 持つ: 行の見た目（枠 + 面 + hover/focus）、アバター寸法と文字サイズの連動（UserLabel へ委譲）、
//       メニューの配置の既定値（上方向・トリガー幅に合わせる。side / align / sideOffset で
//       消費側が上書きできる）、キーボード操作（Base UI の Menu へ委譲）。
// 持たない: 項目の意味（プロフィール / 設定 / サインアウト）とラベル文言。全て props で注入する
//           （i18n・ルーター・認証に依存しない）。
//
// メニュー項目は items 配列で渡す。個別事情（区切り線・警告色・無効）は item のフラグで表す。
// これで足りない込み入ったメニュー（チェックボックス・サブメニュー・ラジオ）が要るときは、
// items を渡さずに行だけを描き、消費側が `Menu` を直接組む。

export type SideNavAccountItem = {
  // onSelect に渡る識別子。
  key: string;
  label: ReactNode;
  // 行頭のアイコン。装飾なので読み上げからは外れる（Menu.Item 側で aria-hidden）。
  icon?: IconName;
  // 破壊的な操作（サインアウト等）。警告色になる。
  danger?: boolean;
  disabled?: boolean;
  // この項目の直前に区切り線を引く。
  separatorBefore?: boolean;
  // 遷移先。指定すると項目が <a href> になる（#81）。操作（onSelect だけ）で済ませると
  // 中クリック / Cmd+クリックでの別タブ・リンクのコピーができず、読み上げも「リンク」に
  // ならないため、遷移する項目には必ず href を渡す。role="menuitem" は保たれる。
  // ⚠ ルーターには依存しない（素の <a>）。SPA 内リンクにしたい場合は items を使わず
  //   `Menu` を直接組み、Menu.Item の render に router の Link を渡す。
  href?: string;
  // 別タブで開く外部リンク。target/rel を付け、行末に open_in_new を出す
  // （SideNav.Item の external と同じ扱い）。href が無いときは無視される。
  external?: boolean;
};

export type SideNavAccountProps = {
  name: string;
  // 名前の下に出す補助テキスト（メールアドレス等）。
  subtitle?: ReactNode;
  src?: string | null;
  // オンライン状態のドット。Avatar へ透過する。
  status?: AvatarStatus;
  // アバターの色（画像が無いときの頭文字表示）。Avatar へ透過する。
  color?: string;
  bgColor?: string;
  // アカウントメニューの項目。省略すると行だけを描き、メニューを組まない。
  items?: SideNavAccountItem[];
  // 項目が選ばれたときに呼ぶ。href 付きの項目でも呼ばれる（遷移は <a> 自身が行うので、
  // ここは計測やメニューを閉じた後の後処理のためのフック）。
  onSelect?: (key: string) => void;
  // 行の大きさ（UserLabel へ透過）。既定 'sm'（アバター24px / 名前14px）は、レール既定幅
  // 232px で「アバター + 名前 + 開閉アイコン」が省略されずに収まる唯一の段。レールを広げて
  // いる消費側だけ 'md'（アバター40px / 名前16px）にする。
  size?: 'sm' | 'md';
  // メニューの出る向き。既定 'top'（レール最下部にあるので上方向へ開く）。レールの「横」へ
  // 出したい消費側は 'right' を渡す（同じレール内の他のポップオーバーと向きを揃える等）。
  side?: MenuPositionerProps['side'];
  // 出る向きに対する寄せ。既定 'start'。'top' のまま使うなら触る必要はない。
  align?: MenuPositionerProps['align'];
  // トリガー行とメニューの間隔。既定は Menu.Positioner の既定値。⚠ 行はレールの内側にあり
  // レールの右端とは padding のぶんズレるので、side='right' で出すときは既定だとパネルが
  // レールに被る。消費側がレールの padding を足した値を渡すこと。
  sideOffset?: MenuPositionerProps['sideOffset'];
  // メニューの読み上げラベル。items を渡すときは指定する。
  menuLabel?: string;
  // トリガー行の読み上げラベル。省略時は中身（名前 + subtitle）がそのまま読まれる。
  ariaLabel?: string;
  className?: string;
};

// 行はレール上の他の項目と違い「カード」として独立させる（面 + 枠）。押せることを示す
// cursor / hover / focus リングをここで持つ。active:scale-100 と hover:shadow-none は、
// preflight を配らない DS で <button> に露出する消費側の legacy な button:hover/:active を
// 打ち消すため（side-nav.tsx の ITEM と同じ手当て）。
// padding と gap は 232px のレール幅から逆算した値。ここを広げると size='sm' でも名前が
// 省略され始める（アバター24 + テキスト + 開閉アイコン16 が実測でぎりぎり収まる）。
const ROW =
  'flex w-full items-center gap-2.5 rounded-md border border-solid border-border bg-surface-3 px-2.5 py-2.5 text-left shadow-none';
// 押せるときだけ足す（表示専用の行に cursor / hover を出すと押せると誤解させる。
// user-label.tsx の INTERACTIVE と同じ考え方）。
const ROW_INTERACTIVE = `cursor-pointer ${TRANSITION_COLORS} hover:bg-surface-hover hover:shadow-none active:scale-100 ${FOCUS_RING}`;

const AFFORDANCE = 'shrink-0 text-text-faint';
const AFFORDANCE_ICON_SIZE = 16;
const MENU_ICON_SIZE = 18;
const EXTERNAL_ICON_SIZE = 15;

// 別タブで開くリンクに付ける属性。rel を落とすと開いた先から window.opener 経由で元タブを
// 触れてしまうので、target と必ず対で付ける。
function linkProps(item: SideNavAccountItem) {
  return item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

// レール最下部にあるので既定では上方向へ開く（下に開くと画面外に出る）。そのとき幅は
// トリガー行に合わせて揃える（Base UI の Positioner が --anchor-width を出す）。
// ⚠ 縦方向（top / bottom）に開くときだけの見た目調整。レールの横（left / right）へ出す
//   ときに適用すると、メニュー幅がレール幅に固定されて不自然に細くなる。
const POSITIONER_WIDTH = 'min-w-[var(--anchor-width)]';
const SEPARATOR = 'mx-1 my-1 h-px bg-border';

// 縦方向に開くか（= トリガー幅に合わせるか）。side 未指定の既定 'top' も縦方向。
function isVertical(side: MenuPositionerProps['side']) {
  return side === 'top' || side === 'bottom';
}

function AccountRowContent({
  name,
  subtitle,
  src,
  status,
  color,
  bgColor,
  size,
  // 開閉アフォーダンスは押せる行にだけ出す。表示専用の行に出すと「開きそうなのに開かない」
  // 見た目になる。
  interactive,
}: Pick<
  SideNavAccountProps,
  'name' | 'subtitle' | 'src' | 'status' | 'color' | 'bgColor' | 'size'
> & { interactive: boolean }) {
  return (
    <>
      {/* UserLabel は href / onClick を渡さなければ <div> を返すので、トリガーの <button> の
          中に入れてもボタンの入れ子にならない。アバター寸法と文字サイズの連動もここで得る。 */}
      <UserLabel
        name={name}
        subtitle={subtitle}
        src={src}
        status={status}
        color={color}
        bgColor={bgColor}
        size={size}
        className="min-w-0 flex-1"
      />
      {interactive && (
        <span className={AFFORDANCE} aria-hidden="true">
          <Icon name="unfold_more" size={AFFORDANCE_ICON_SIZE} />
        </span>
      )}
    </>
  );
}

export default function SideNavAccount({
  name,
  subtitle,
  src,
  status,
  color,
  bgColor,
  items,
  onSelect,
  size = 'sm',
  side = 'top',
  align = 'start',
  sideOffset,
  menuLabel,
  ariaLabel,
  className = '',
}: SideNavAccountProps): ReactNode {
  const interactive = items != null && items.length > 0;
  const rowClassName = twMerge(ROW, ROW_INTERACTIVE, className);
  const content = (
    <AccountRowContent
      name={name}
      subtitle={subtitle}
      src={src}
      status={status}
      color={color}
      bgColor={bgColor}
      size={size}
      interactive={interactive}
    />
  );

  // items が無ければ「表示だけ」の行。押せないので <div> で描き、hover / cursor も出さない。
  if (!interactive) {
    return (
      <div className={twMerge(ROW, className)} aria-label={ariaLabel}>
        {content}
      </div>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        render={<button type="button" className={rowClassName} aria-label={ariaLabel} />}
      >
        {content}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={isVertical(side) ? POSITIONER_WIDTH : undefined}
        >
          <Menu.Popup aria-label={menuLabel}>
            {items.map((item) => (
              <Fragment key={item.key}>
                {item.separatorBefore && <Menu.Separator className={SEPARATOR} />}
                <Menu.Item
                  disabled={item.disabled}
                  danger={item.danger}
                  icon={item.icon && <Icon name={item.icon} size={MENU_ICON_SIZE} />}
                  trailing={
                    item.href != null &&
                    item.external && <Icon name="open_in_new" size={EXTERNAL_ICON_SIZE} />
                  }
                  // href があれば DS の Link として描く（Base UI の render）。中クリック /
                  // Cmd+クリックでの別タブ・リンクのコピー・「リンク」としての読み上げが効く。
                  // variant='bare' は下線を消すだけの器。行のタイポ・色は Menu.Item の tone
                  // クラスが持つ（DS は preflight を配らないので素の <a> だと下線が残る）。
                  // wrapper ではなく bare を使うのは、wrapper の text-inherit が同じ要素の
                  // tone クラスと特異度が同じで、出力順しだいで danger の警告色を潰すため。
                  // ⚠ disabled のときは <a> にしない。HTML の <a> に disabled は無く、
                  //   data-disabled が付いても遷移自体は止まらないため（user-label.tsx が
                  //   href={disabled ? undefined : href} で塞いでいるのと同じ理由）。
                  render={
                    item.href != null && !item.disabled ? (
                      <Link variant="bare" href={item.href} {...linkProps(item)} />
                    ) : undefined
                  }
                  onClick={() => onSelect?.(item.key)}
                >
                  {item.label}
                </Menu.Item>
              </Fragment>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
