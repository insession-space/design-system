import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Icon from '../icons/icon.tsx';
import { twMerge } from '../lib/tw-merge.ts';

// DS の Chip（純粋 leaf UI）。claude design "INSESSION Design System" の Chip 仕様に準拠（#463 / #663）。
// タップできる要素（クイック返信・フィルター・タグ・入力トークン）。非対話の status ラベルは Badge を使う。
// 既定=surface-2 + border-strong、selected=accent tint(12%) + accent 枠(55%) + accent 文字 + check。
// ⚠ selected の check は showCheck={false} で落とせる。「絵文字 + 数字」のように、行頭に check が
// 並ぶと何に対する肯定なのか読めなくなる中身のときに、色だけ使って check を出さないための逃げ道。
// 既定は true なのでフィルター/選択トークンとしての従来の見た目は変わらない。
// (MessageItem のリアクションピルは以前ここを使っていたが、Chip の pad/文字サイズが絵文字主役の
//  ピルには過大で、selected の tint 面に数字が溶けるため、MessageItem 側の専用 button に移した(#103)。)
// pill、12.5px、weight は selected?700:600。pad は DS の3系統（removable / avatar / 既定）。
// avatar は 22x22 の円（label + color。既定は success green）。removable は末尾に close(text-dim)。
// i18n は持たない（ラベルは children）。
export type ChipAvatar = {
  // 円内の1〜2文字。
  label: ReactNode;
  // 円の背景色（CSS 色。省略時は success green）。
  color?: string;
};

export type ChipProps = {
  // 選択状態。true で accent tint + 枠 + チェックになる。
  selected?: boolean;
  // selected のときに行頭の check を出すか。既定 true。false にすると色だけが変わる。
  showCheck?: boolean;
  // 行頭アイコン（任意。selected かつ showCheck のときは check が優先されるため出さない）。
  icon?: ReactNode;
  // 行頭のアバター円（任意）。
  avatar?: ChipAvatar;
  // 末尾に × を出し、クリックで onRemove を呼ぶ（入力トークン用）。
  removable?: boolean;
  onRemove?: () => void;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { className?: string };

const BASE =
  'inline-flex items-center gap-1.5 min-h-(--control-hit-size) min-w-(--control-hit-size) pointer-coarse:min-h-(--control-touch-size) pointer-coarse:min-w-(--control-touch-size) rounded-pill border border-solid text-sm cursor-pointer select-none transition-colors motion-reduce:transition-none duration-(--dur-fast)';
// DS の3系統の pad。removable=6/10/6/14、avatar=5/13/5/5、既定=7/14。
const PAD_DEFAULT = 'px-3.5 py-[7px]';
const PAD_REMOVABLE = 'pl-[14px] pr-2.5 py-1.5';
const PAD_AVATAR = 'pl-[5px] pr-[13px] py-[5px]';
// 既定の面は surface-2 を維持する。surface-3 はライトで #ebe7dc とページ背景(#e9e9e6)にほぼ
// 埋もれるため、濃くするつもりで下げると逆にコントラストが落ちる(#765)。
const DEFAULT =
  'bg-surface-2 border-border-strong text-text font-semibold enabled:hover:bg-surface-hover';
// selected 枠は DS の accent 55%。tint は視認性確保のため bg-tint-22 に強化(#765)。
const SELECTED =
  'bg-tint-22 border-[color-mix(in_srgb,var(--color-accent)_55%,transparent)] text-accent-soft font-bold';

export default function Chip({
  selected = false,
  showCheck = true,
  icon,
  avatar,
  removable = false,
  onRemove,
  children,
  type = 'button',
  className = '',
  ...rest
}: ChipProps) {
  const pad = removable ? PAD_REMOVABLE : avatar ? PAD_AVATAR : PAD_DEFAULT;
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={twMerge(BASE, pad, selected ? SELECTED : DEFAULT, className)}
      {...rest}
    >
      {avatar && (
        <span
          className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-pill bg-success text-xs font-bold text-white"
          style={avatar.color ? { background: avatar.color } : undefined}
          aria-hidden="true"
        >
          {avatar.label}
        </span>
      )}
      {selected && showCheck ? <Icon name="check" size={16} /> : icon}
      {children}
      {removable && (
        <span
          role="button"
          tabIndex={-1}
          aria-label="remove"
          className="inline-flex text-text-dim"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          <Icon name="close" size={15} />
        </span>
      )}
    </button>
  );
}
