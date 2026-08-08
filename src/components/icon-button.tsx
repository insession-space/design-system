import { Button as BaseButton } from '@base-ui/react/button';
import type * as React from 'react';
import type { ReactNode } from 'react';
import { twMerge } from '../lib/tw-merge.ts';

// アイコンのみの正方形ボタン（純粋 leaf UI）。claude design "INSESSION Design System" 準拠（loophub #682）。
// 振る舞いは Base UI の Button へ委譲する（#33）。DS 側は見た目だけを持つ。
// variant: surface(既定。surface-2 面 + border + hover surface-hover) / accent(coral 塗り) /
// ghost(透明地・hover のみ面が付く)。icon は呼び出し側が `.mi` span か Icon(icons/icon.tsx) を渡す
// (Material Symbols の ligature 名を使う箇所があるため、Button と違い IconName 限定にしない)。
// aria-label は必須(label prop)。i18n は持たない。
//
// ⚠ disabled / hover は `disabled:` / `enabled:` ではなく `data-disabled:` /
// `not-data-disabled:` で書く。理由は button.tsx の BASE のコメント参照
// （focusableWhenDisabled を渡すと disabled 属性が aria-disabled に置き換わり、
// :disabled / :enabled 疑似クラスがマッチしなくなるため）。値は移行前から変えていない。
export type IconButtonVariant = 'surface' | 'accent' | 'ghost';

export type IconButtonProps = {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  // 一辺の長さ(px)。既定 36。
  size?: number;
  // タッチ端末(`@media (pointer: coarse)`)のときに保証する最小の一辺(px)。省略時は size と同じ
  // ＝タッチでも寸法は変わらない(既存呼び出しの見た目を変えないための既定)。指を使う操作系
  // (リアクション送信・再生操作など)は Apple HIG のタップターゲット下限に合わせて 44 を渡す。
  touchSize?: number;
  className?: string;
} & Omit<React.ComponentProps<typeof BaseButton>, 'className' | 'render'>;

// ⚠ 寸法はインライン style ではなくユーティリティクラス + CSS 変数で当てる(#60)。
// インライン style の width/height はあらゆるセレクタより強く、消費側が
// `@media (pointer: coarse)` やバリアント付きユーティリティで**上書きできない**ため。
// 実害として insession-app のリアクション送信ボタンが legacy CSS の 44px から 30px へ
// 縮んだ(タップターゲット下限割れ)。
//
// - `size-(--icon-button-size)` … 既定の寸法。値は style の CSS 変数で渡す
//   (寸法は任意の数値なので `size-9` のような静的クラスへは落とせない。動的なクラス名合成は
//    @source 走査に引っかからず配布 CSS が欠けるので禁止 — layout.tsx の GAP_CLASS 参照)
// - `pointer-coarse:min-w-/min-h-(--icon-button-touch-size)` … タッチ端末での下限。
//   min-* は width/height より常に強く、かつバリアント付きは base より後に出力されるので、
//   クラスの並び順に依存せず決定論的に効く(README「レイヤーと上書き」の注意点を回避する)
//
// これにより消費側は (a) `touchSize={44}` を渡す (b) `className="max-md:size-11"` のような
// バリアント付きユーティリティを足す、のどちらでも「通常 30px / タッチ 44px」を表現できる。
const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-md cursor-pointer transition-colors motion-reduce:transition-none duration-(--dur-fast) size-(--icon-button-size) pointer-coarse:min-w-(--icon-button-touch-size) pointer-coarse:min-h-(--icon-button-touch-size) data-disabled:cursor-not-allowed data-disabled:forced-colors:text-[color:GrayText] data-disabled:opacity-(--disabled-opacity) focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring';

const VARIANT: Record<IconButtonVariant, string> = {
  surface:
    'bg-surface-2 border border-solid border-border text-text-dim hover:not-data-disabled:bg-surface-hover hover:not-data-disabled:text-text',
  accent:
    'bg-accent border border-solid border-transparent text-on-accent hover:not-data-disabled:brightness-[.93]',
  ghost:
    'bg-transparent border border-solid border-transparent text-text-dim hover:not-data-disabled:bg-surface-hover',
};

export default function IconButton({
  label,
  icon,
  variant = 'surface',
  size = 36,
  touchSize,
  type = 'button',
  className = '',
  disabled,
  style,
  ...rest
}: IconButtonProps) {
  return (
    <BaseButton
      type={type}
      aria-label={label}
      disabled={disabled}
      style={{
        ...({
          '--icon-button-size': `${size}px`,
          '--icon-button-touch-size': `${touchSize ?? size}px`,
        } as React.CSSProperties),
        ...style,
      }}
      className={twMerge(BASE, VARIANT[variant], className)}
      {...rest}
    >
      {icon}
    </BaseButton>
  );
}
