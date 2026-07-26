import { Button as BaseButton } from '@base-ui/react/button';
import type * as React from 'react';
import type { ReactNode } from 'react';

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
  className?: string;
} & Omit<React.ComponentProps<typeof BaseButton>, 'className' | 'render'>;

const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-md cursor-pointer transition-colors duration-(--dur-fast) data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled-opacity) focus-visible:shadow-focus focus-visible:outline-none';

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
  type = 'button',
  className = '',
  disabled,
  ...rest
}: IconButtonProps) {
  return (
    <BaseButton
      type={type}
      aria-label={label}
      disabled={disabled}
      style={{ width: size, height: size }}
      className={`${BASE} ${VARIANT[variant]} ${className}`.trim()}
      {...rest}
    >
      {icon}
    </BaseButton>
  );
}
