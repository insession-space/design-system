import type { ReactNode } from 'react';
import Icon, { type IconName } from '../icons/icon.tsx';
import { twMerge } from '../lib/tw-merge.ts';

// Callout（純粋 leaf UI）。dismissible なインラインの告知バー。特定 UI（プレーヤー等）の
// 直上に置く用途（issue #211）。画面隅に浮く Toast/Snackbar とは別物 — こちらは常にレイアウト
// 内にインラインで場所を占める。表示/非表示の状態管理・出現/退場アニメーションは持たない
// （消費側の責務。onDismiss は「閉じるボタンを押した」を通知するだけで、DOM から消す判断は
// 呼び出し側が行う）。
//
// tone は DS 共通の SemanticTone 相当（accent は持たない。告知バーに強調色は不要なため）。
// 色は theme.css の tone 系トークンを使う。⚠ CSS 変数側は warning 表記（warn ではない）。
export type CalloutTone = 'info' | 'warning' | 'danger' | 'success';

// tone ごとの (面 / 枠 / アイコン地色)。danger だけ -surface-strong が無いため、
// 4 tone とも -surface（非 strong）に揃えている。
const TONE: Record<CalloutTone, { surface: string; border: string; icon: string }> = {
  info: { surface: 'bg-info-surface', border: 'border-info-border', icon: 'text-info' },
  warning: {
    surface: 'bg-warning-surface',
    border: 'border-warning-border',
    icon: 'text-warning',
  },
  danger: { surface: 'bg-danger-surface', border: 'border-danger-border', icon: 'text-danger' },
  success: {
    surface: 'bg-success-surface',
    border: 'border-success-border',
    icon: 'text-success',
  },
};

// tone ごとの既定アイコン。icon={null} で非表示、icon 省略時はこれを使う。
const DEFAULT_ICON: Record<CalloutTone, IconName> = {
  info: 'info',
  warning: 'warning',
  danger: 'error',
  success: 'check_circle',
};

export type CalloutProps = {
  children: ReactNode;
  // 既定 'info'。
  tone?: CalloutTone;
  // 先頭アイコン。省略時は tone ごとの既定アイコン。null で領域ごと非表示（空の隙間を残さない）。
  icon?: IconName | null;
  // 本文の後ろに並べる導線（リンク/ボタン等）。本文と同じ行内フローで折り返す。
  action?: ReactNode;
  // 渡したときだけ × ボタンを描画する。表示状態そのものは消費側が持つ。
  onDismiss?: () => void;
  // × の aria-label。i18n は props 注入（DS は純粋 leaf）。
  dismissLabel?: string;
  className?: string;
};

export default function Callout({
  children,
  tone = 'info',
  icon,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  className = '',
}: CalloutProps) {
  const t = TONE[tone];
  const resolvedIcon = icon === null ? null : (icon ?? DEFAULT_ICON[tone]);
  return (
    <div
      role="status"
      className={twMerge(
        'flex items-start gap-3 rounded-md border border-solid px-4 py-3 font-body text-sm text-text',
        t.surface,
        t.border,
        className,
      )}
    >
      {resolvedIcon != null && (
        <span className={twMerge('mt-px shrink-0', t.icon)} aria-hidden="true">
          <Icon name={resolvedIcon} size={18} />
        </span>
      )}
      {/* 本文 + action は同じ行内フローに置き、通常のテキスト折り返しに任せる。flex にすると
          本文（ブロック）が全幅を取って action が常に改行されてしまうため、あえて素の
          inline 要素として並べる。action 自体も折り返し可能にする（レビュー指摘: nowrap だと
          狭いコンテナで長い action ラベルが横スクロールを起こす）。 */}
      <div className="min-w-0 flex-1">
        <span>{children}</span>
        {action != null && <span className="ml-2 align-middle">{action}</span>}
      </div>
      {onDismiss != null && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="mt-px inline-flex shrink-0 cursor-pointer border-none bg-transparent p-0 text-text-dim"
        >
          <Icon name="close" size={17} />
        </button>
      )}
    </div>
  );
}
