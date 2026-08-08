import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import type * as React from 'react';
import type { ReactNode } from 'react';
import { DISABLED_STATE, FOCUS_RING, TRANSITION_COLORS } from '../lib/class-presets.ts';
import { twMerge } from '../lib/tw-merge.ts';

// DS のトグルグループ（純粋 leaf UI。#53）。ツールバーの「排他選択される道具ボタン」を組む。
// 振る舞いは Base UI の ToggleGroup / Toggle へ委譲し、DS 側は見た目だけを持つ（#22 の方針）。
//
// なぜ必要だったか: 消費側（insession-app）の whiteboard が `whiteboard-chip` /
// `whiteboard-chip-active`、伝言ゲームが `canvas-relay-draw-tool` /
// `canvas-relay-draw-tool-active` という **同じ構造の legacy CSS を2セット**持っていた。
// どちらも「押されている1つだけ accent、残りは中立」で、素の `<button>` に
// 三項演算で active クラスを足す形だった。
//
// Base UI へ委譲して得たもの: 矢印キーでのグループ内移動と1つだけ tab stop になる
// roving tabIndex、`toggleMultiple` による単一/複数選択の切り替え、`aria-pressed` の管理。
//
// ⚠ 状態別のクラスは `data-pressed:` バリアントではなく className の関数形
// （state => string）で **排他的に** 出す（#17 の教訓）。押下時と非押下時で
// background-color / color / border-color の3つが同時に入れ替わるため、
// 同一クラス属性に両方を並べると勝敗が配布 CSS の出力順で決まってしまう。
//
// ⚠ `disabled:` ではなく `data-disabled:` で書く（Base UI の Toggle は
// `nativeButton` 既定で `<button>` を描くので `:disabled` も効くが、
// group から降ってくる disabled は data 属性でしか出ないため統一する）。

export type ToggleGroupProps = Omit<
  React.ComponentProps<typeof BaseToggleGroup>,
  'className' | 'render'
> & {
  // グループ全体の用途を読み上げる（ツールバーなので視覚的な見出しは持たない）。
  ariaLabel?: string;
  className?: string;
};

export type ToolButtonProps = Omit<React.ComponentProps<typeof Toggle>, 'className' | 'render'> & {
  // 行頭のアイコン等。ラベルテキストを持たないアイコンのみのボタンでは label を必ず渡す。
  icon?: ReactNode;
  // アイコンのみのとき読み上げに使う（`aria-label`）。children があれば省略してよい。
  label?: string;
  className?: string;
};

const GROUP = 'inline-flex items-center gap-1';

// 40x40 のアイコンボタン。押下時は accent 塗り、非押下時は透明で hover のみ面が出る。
const TOOL = `inline-flex size-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-solid p-0 font-body text-sm ${TRANSITION_COLORS} ${FOCUS_RING} ${DISABLED_STATE}`;

export function ToggleGroup({ ariaLabel, className = '', ...rest }: ToggleGroupProps) {
  return <BaseToggleGroup aria-label={ariaLabel} className={twMerge(GROUP, className)} {...rest} />;
}

export function ToolButton({ icon, label, children, className = '', ...rest }: ToolButtonProps) {
  return (
    <Toggle
      aria-label={label}
      className={(state) =>
        twMerge(
          TOOL,
          state.pressed
            ? 'border-transparent bg-accent text-on-accent forced-colors:text-[color:Highlight]'
            : 'border-transparent bg-transparent text-text-dim hover:bg-surface-hover hover:text-text',
          children ? 'w-auto px-3' : '',
          className,
        )
      }
      {...rest}
    >
      {icon}
      {children}
    </Toggle>
  );
}
