import { type RefObject, useEffect } from 'react';

// 「外側クリック / Escape で閉じる」を一箇所にまとめた共通フック（純粋 leaf）。
// Popover / Menu / Dropdown 系の個別実装（space-topbar / notification-bell /
// message-action-bar 等）で毎回書かれていた mousedown + keydown の登録・解除を集約する。
// open が false の間はリスナーを張らない（無駄な購読を避ける）。
export function useDismiss(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  options: { closeOnEsc?: boolean; closeOnOutside?: boolean } = {},
) {
  const { closeOnEsc = true, closeOnOutside = true } = options;
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (closeOnOutside && ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') onDismiss();
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, ref, onDismiss, closeOnEsc, closeOnOutside]);
}
