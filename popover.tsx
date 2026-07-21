import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from 'react';
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
  // パネルの影ユーティリティ。既定は DS の popover 影（UserMenu/🧩 スイッチャーと同じ。#867）。
  panelShadow?: string;
  // 既定の内側 padding(p-3) を出すか。ヘッダー/リストが独自 padding を持つ通知センターのような
  // パネルは false にして呼び出し側で表現する（既定 true = 従来挙動）。
  panelPadding?: boolean;
  // 既定の最大高さ(max-h-80) + 内部スクロールを出すか。呼び出し側で独自の高さ/内部スクロール
  // (例: ヘッダー固定+リストだけスクロール)を組みたい場合は false にする（既定 true = 従来挙動）。
  panelScroll?: boolean;
  // max-sm でトリガー追従（placement アンカー）をやめ、position:fixed + 左右対称ガター(12px)で
  // ビューポートに固定するモバイルシート表示にする。上端はトリガー直下に合わせる。sm 以上は
  // 従来どおり placement 通りのトリガー追従。既定 false（他 consumer の従来挙動は不変）。
  mobileSheet?: boolean;
  closeOnEsc?: boolean;
  closeOnOutside?: boolean;
};

const PLACEMENT: Record<PopoverPlacement, string> = {
  'bottom-start': 'top-[calc(100%+8px)] left-0',
  'bottom-end': 'top-[calc(100%+8px)] right-0',
  'top-start': 'bottom-[calc(100%+8px)] left-0',
  'top-end': 'bottom-[calc(100%+8px)] right-0',
};

// パネル本体の見た目（面・境界・角丸・入場アニメ）。位置と影は呼び出し側の設定で足す。
// max-w は mobileSheet の左右ガター(12px×2=24px)と揃え、mobileSheet を使わない呼び出し側でも
// 極小幅のビューポートで横にはみ出さないようにする(#867)。
const PANEL_BASE =
  'z-(--z-dropdown) min-w-[220px] max-w-[calc(100vw-24px)] bg-surface border border-solid border-border-strong rounded-card animate-[card-in_var(--dur-base)_var(--ease-spring)_both]';

export default function Popover({
  open,
  onClose,
  trigger,
  children,
  placement = 'bottom-start',
  ariaLabel,
  role = 'menu',
  panelClassName = '',
  panelShadow = 'shadow-popover',
  panelPadding = true,
  panelScroll = true,
  mobileSheet = false,
  closeOnEsc = true,
  closeOnOutside = true,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, ref, onClose, { closeOnEsc, closeOnOutside });

  // モバイルシートは position:fixed なので上端をトリガー直下に固定するため実測する
  // （トップバー高さがページで異なり静的値を置けない）。max-sm 以外・非表示時は使わない。
  const [sheetTop, setSheetTop] = useState(0);
  useLayoutEffect(() => {
    if (!open || !mobileSheet) return undefined;
    const measure = () => {
      const el = ref.current;
      if (el) setSheetTop(el.getBoundingClientRect().bottom + 8);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, mobileSheet]);

  // 位置決め。通常は absolute でトリガー追従。mobileSheet は max-sm で fixed + 左右ガター、
  // sm 以上で placement 通りの absolute に戻す（sm: プレフィックスで上書き）。
  const smAnchor = PLACEMENT[placement]
    .split(' ')
    .map((c) => `sm:${c}`)
    .join(' ');
  const positioning = mobileSheet
    ? `fixed top-(--popover-sheet-top) left-3 right-3 w-auto sm:absolute sm:left-auto ${smAnchor}`
    : `absolute ${PLACEMENT[placement]}`;

  return (
    <div className="relative inline-flex" ref={ref}>
      {trigger}
      {open && (
        <div
          role={role}
          aria-label={ariaLabel}
          className={`${PANEL_BASE} ${panelScroll ? 'max-h-80 overflow-y-auto' : ''} ${panelPadding ? 'p-3' : ''} ${positioning} ${panelShadow} ${panelClassName}`.trim()}
          style={
            mobileSheet ? ({ '--popover-sheet-top': `${sheetTop}px` } as CSSProperties) : undefined
          }
        >
          {children}
        </div>
      )}
    </div>
  );
}
