import { type RefObject, useEffect } from 'react';

type Ref = RefObject<HTMLElement | null>;

// 「外側クリック / Escape で閉じる」を一箇所にまとめた共通フック（純粋 leaf）。
// Popover / Menu / Dropdown 系の個別実装（space-topbar / notification-bell /
// message-action-bar 等）で毎回書かれていた mousedown + keydown の登録・解除を集約する。
// open が false の間はリスナーを張らない（無駄な購読を避ける）。
//
// ref は単一 or 配列を受け付ける。**createPortal で本体を document.body へ出す**ケース
// （message-action-bar / sticker-picker / chat-participants-bar）では、トリガーと
// ポップオーバー本体が DOM 上で親子でなくなるため、両方の ref を渡して「どちらにも
// 含まれないクリック」だけを外側と判定する（二重 ref containment）。ignore は
// 「この target のときは閉じない」を追加指定するための述語（例: 上に別モーダルが開いている間、
// .modal-backdrop クリックを無視する）。
//
// リスナーの張り先は「渡された ref の要素が属する document の window」から解決する
// （既定は各要素の ownerDocument.defaultView、要素が無ければグローバル window）。
// これにより、Document Picture-in-Picture のような別ドキュメントへ createPortal する
// 消費側（例: PiP 内の StickerPicker）でも、そのウィンドウ自身の mousedown/keydown を
// 正しく拾える（メインドキュメント側の消費側は ownerDocument が常に main document なので
// 挙動は従来と完全に同一）。
export function useDismiss(
  open: boolean,
  ref: Ref | Ref[],
  onDismiss: () => void,
  options: {
    closeOnEsc?: boolean;
    closeOnOutside?: boolean;
    ignore?: (target: Node) => boolean;
  } = {},
) {
  const { closeOnEsc = true, closeOnOutside = true, ignore } = options;
  useEffect(() => {
    if (!open) return undefined;
    const refs = Array.isArray(ref) ? ref : [ref];
    const win = refs.map((r) => r.current?.ownerDocument?.defaultView).find(Boolean) ?? window;
    const onDown = (e: MouseEvent) => {
      if (!closeOnOutside) return;
      const target = e.target as Node;
      if (ignore?.(target)) return;
      if (refs.some((r) => r.current?.contains(target))) return;
      onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') onDismiss();
    };
    win.addEventListener('mousedown', onDown);
    win.addEventListener('keydown', onKey);
    return () => {
      win.removeEventListener('mousedown', onDown);
      win.removeEventListener('keydown', onKey);
    };
  }, [open, ref, onDismiss, closeOnEsc, closeOnOutside, ignore]);
}
