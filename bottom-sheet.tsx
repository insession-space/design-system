import { type ReactNode, useEffect, useRef, useState } from 'react';

// 汎用Bottom Sheet(純粋 leaf UI。#284)。モバイルのChat/Participants導線のために新設。
// Modal(modal.tsx)と同じ「backdrop + 本体 + Esc/背景クリックで閉じる」の方針を
// 踏襲しつつ、下からせり出す・ドラッグで高さを変えられる点が異なるため別コンポーネントにする。
// 開いた直後は中途高さ(MID_RATIO)、上ドラッグでフルハイト(FULL_RATIO)まで拡張できる。
// 下ドラッグで一定以下まで縮めると close する。i18n はこのパッケージに持たないため、
// 閉じるラベル等は props で注入する(Modal と同じ方針)。
const MID_RATIO = 0.68;
const FULL_RATIO = 0.94;
const CLOSE_RATIO = 0.32;

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  // ダイアログの aria-label。
  ariaLabel?: string;
  // × 閉じるボタンの aria ラベル(i18n は props 注入)。渡したときだけ×を表示する。
  closeLabel?: string;
  // Esc キーで閉じる。既定 true。
  closeOnEsc?: boolean;
};

export default function BottomSheet({
  open,
  onClose,
  children,
  ariaLabel,
  closeLabel,
  closeOnEsc = true,
}: BottomSheetProps) {
  const [mode, setMode] = useState<'mid' | 'full'>('mid');
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // 開くたびに中途高さから始める(前回フルハイトのまま閉じても次回はリセットする)
  useEffect(() => {
    if (open) setMode('mid');
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, closeOnEsc]);

  // ドラッグハンドルのPointer Events実装(use-queue-dnd.tsと同じ方針: 可変データはdragRefに
  // 集約し、要素へ直接setPointerCaptureしてリスナーもその要素に張る)。ドラッグ中はCSS
  // transitionを切ってinline heightで直接追従させ、離した時だけ2つの高さのどちらか(または
  // close)にスナップする。
  function onHandlePointerDown(e: any) {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const startHeight = sheet.getBoundingClientRect().height;
    const vh = window.innerHeight;
    const drag = { pointerId: e.pointerId, startY: e.clientY, startHeight, vh };
    sheet.style.transition = 'none';

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId) return;
      const delta = drag.startY - ev.clientY;
      const next = Math.min(
        drag.vh * FULL_RATIO,
        Math.max(drag.vh * 0.18, drag.startHeight + delta),
      );
      sheet.style.height = `${next}px`;
    };
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId) return;
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      sheet.style.transition = '';
      const finalHeight = sheet.getBoundingClientRect().height;
      sheet.style.height = '';
      if (finalHeight < drag.vh * CLOSE_RATIO) {
        onClose();
        return;
      }
      const midPx = drag.vh * MID_RATIO;
      const fullPx = drag.vh * FULL_RATIO;
      setMode(Math.abs(finalHeight - fullPx) < Math.abs(finalHeight - midPx) ? 'full' : 'mid');
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }

  if (!open) return null;

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        ref={sheetRef}
        className={`bottom-sheet bottom-sheet--${mode}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bottom-sheet-handle-area"
          onPointerDown={onHandlePointerDown}
          aria-hidden="true"
        >
          <span className="bottom-sheet-handle" />
        </div>
        {closeLabel && (
          <button
            type="button"
            className="bottom-sheet-close"
            aria-label={closeLabel}
            title={closeLabel}
            onClick={onClose}
          >
            ×
          </button>
        )}
        <div className="bottom-sheet-body">{children}</div>
      </div>
    </div>
  );
}
