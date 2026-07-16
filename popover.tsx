import { type ReactNode, useRef } from 'react';
import { useDismiss } from './use-dismiss.ts';

// ポップオーバーの共通基盤（純粋 leaf UI）。トリガーとフローティングパネルを相対配置でまとめ、
// 外側クリック / Escape での close を内包する（useDismiss）。個別に mousedown+keydown を張って
// いた space-topbar / notification-bell / message-action-bar / sticker-picker / video-search-box を
// 将来この一本へ寄せられる API にする。open 制御は呼び出し側（controlled）。i18n は持たない。
export type PopoverPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export type PopoverProps = {
  open: boolean;
  onClose: () => void;
  // 開閉トリガー（呼び出し側が open をトグルするボタン等）。相対配置の基準にもなる。
  trigger: ReactNode;
  children: ReactNode;
  placement?: PopoverPlacement;
  ariaLabel?: string;
  // role。メニューを載せるときは 'menu'（既定）、それ以外の内容は 'dialog' 等に。
  role?: string;
  // パネル（浮く面）に足す追加クラス（幅・最大高さ等の文脈調整用）。
  panelClassName?: string;
  closeOnEsc?: boolean;
  closeOnOutside?: boolean;
};

const PLACEMENT: Record<PopoverPlacement, string> = {
  'bottom-start': 'top-[calc(100%+8px)] left-0',
  'bottom-end': 'top-[calc(100%+8px)] right-0',
  'top-start': 'bottom-[calc(100%+8px)] left-0',
  'top-end': 'bottom-[calc(100%+8px)] right-0',
};

const PANEL =
  'absolute z-(--z-dropdown) min-w-[220px] max-h-80 overflow-y-auto p-3 bg-surface border border-solid border-border-strong rounded-card shadow-popover animate-[card-in_var(--dur-base)_var(--ease-spring)_both]';

export default function Popover({
  open,
  onClose,
  trigger,
  children,
  placement = 'bottom-start',
  ariaLabel,
  role = 'menu',
  panelClassName = '',
  closeOnEsc = true,
  closeOnOutside = true,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, ref, onClose, { closeOnEsc, closeOnOutside });

  return (
    <div className="relative inline-flex" ref={ref}>
      {trigger}
      {open && (
        <div
          role={role}
          aria-label={ariaLabel}
          className={`${PANEL} ${PLACEMENT[placement]} ${panelClassName}`.trim()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
