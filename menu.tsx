import type { ReactNode } from 'react';

// ポップオーバーの上に載せるメニュー（純粋 leaf UI）。space-topbar のステージ切替 /
// notification-item / user-menu 等で重複していたメニュー行を DS に集約する。
// Popover（面・外側クリック・Esc）と組み合わせて使う想定。i18n は持たない。

export type MenuProps = {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
};

// 行のコンテナ。ul をリセットして縦積みにする。
export function Menu({ children, ariaLabel, className = '' }: MenuProps) {
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

export type MenuItemProps = {
  onSelect: () => void;
  children: ReactNode;
  // 行頭のアイコン等。
  icon?: ReactNode;
  // 行末の付随要素（チェック・実行中ドット等）。
  trailing?: ReactNode;
  // 選択中（アクセント色 + aria-checked）。radio/checkbox 的なメニューで使う。
  active?: boolean;
  // 破壊的操作（ログアウト・削除等）。危険色で表示する。
  danger?: boolean;
  disabled?: boolean;
  // 既定 'menuitem'。選択状態を持つなら 'menuitemradio' / 'menuitemcheckbox'。
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
};

// 新 DS(#463) Menu 行: radius-md / gap 13 / padding 11x13 / font 15。hover は surface-hover、
// 選択中は live(green) の tint 面 + green テキスト。
const ROW =
  'flex w-full items-center gap-[13px] rounded-md border-none bg-transparent px-[13px] py-[11px] text-left text-[15px] shadow-none transition-colors duration-(--dur-fast) cursor-pointer disabled:opacity-(--disabled-opacity) disabled:cursor-not-allowed';

export function MenuItem({
  onSelect,
  children,
  icon,
  trailing,
  active = false,
  danger = false,
  disabled = false,
  role = 'menuitem',
}: MenuItemProps) {
  const tone = danger
    ? 'text-danger enabled:hover:bg-danger-surface'
    : active
      ? 'text-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]'
      : 'text-text enabled:hover:bg-surface-hover';
  return (
    <li>
      <button
        type="button"
        role={role}
        aria-checked={role === 'menuitem' ? undefined : active}
        disabled={disabled}
        className={`${ROW} ${tone}`}
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
