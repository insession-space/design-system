import { type ReactNode, useEffect, useRef } from 'react';
import Icon from './icons/icon.tsx';

// 汎用モーダルの外殻（純粋 leaf UI）。backdrop・本体・×閉じボタン・Esc・背景クリックで閉じる、を
// 一箇所にまとめる。i18n はこのパッケージに持たないため、閉じるラベルは props で注入する。
//
// 2つの体裁を持つ（#663）:
//  - 既定（children のみ）: legacy .modal / .modal-backdrop / .modal-close の共有プリミティブを使う
//    従来経路（中央寄せ h2 / submit ボタン装飾に依存する多数の消費側をそのまま動かす）。
//  - DS 構造（title / footer を渡したとき）: claude design "INSESSION Design System" の Modal に準拠し、
//    トークンのユーティリティで title 行（border-bottom + × アイコン）/ body(pad18) / footer 行
//    （border-top + surface-2）を組む。既存 API（children + width + closeLabel + as/onSubmit + closeOnEsc）は維持。
//
// 幅は `width`（CSS 長さ）を inline style で当てる。
export type ModalProps = {
  onClose: () => void;
  children: ReactNode;
  // 基底 .modal の幅を上書きする CSS 長さ（例 'min(760px, 94vw)'）。省略時は基底幅。
  width?: string;
  // 本体（.modal）に足す追加クラス。
  className?: string;
  // ダイアログの aria-label。
  ariaLabel?: string;
  // × 閉じるボタンの aria ラベル（i18n は props 注入）。渡したときだけ×を表示する。
  closeLabel?: string;
  // 本体要素。フォーム型モーダルは 'form'。既定 'div'。
  as?: 'div' | 'form';
  // as='form' のときの submit ハンドラ。
  onSubmit?: (e: any) => void;
  // Esc キーで閉じる。既定 true。
  closeOnEsc?: boolean;
  // DS 構造のタイトル行（指定すると DS 構造で描画する）。
  title?: ReactNode;
  // DS 構造のフッター行（アクション群。指定すると DS 構造で描画する）。
  footer?: ReactNode;
};

export default function Modal({
  onClose,
  children,
  width,
  className = '',
  ariaLabel,
  closeLabel,
  as = 'div',
  onSubmit,
  closeOnEsc = true,
  title,
  footer,
}: ModalProps) {
  // PiP(Document Picture-in-Picture)等、別ドキュメントへ createPortal されるケースに対応するため、
  // Esc リスナーは自身の描画先(backdropRef の ownerDocument)の window から張る(メインドキュメントの
  // 消費側は ownerDocument が常に main document なので挙動は従来と完全に同一)。
  const backdropRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!closeOnEsc) return undefined;
    const win = backdropRef.current?.ownerDocument?.defaultView ?? window;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    win.addEventListener('keydown', onKey);
    return () => win.removeEventListener('keydown', onKey);
  }, [onClose, closeOnEsc]);

  const Box: any = as;
  const ds = title != null || footer != null;

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={onClose}>
      {ds ? (
        // DS 構造（トークンのユーティリティ）。
        <Box
          className={`relative flex w-full flex-col overflow-hidden rounded-card border border-solid border-border bg-surface shadow-overlay animate-[card-in_0.4s_var(--ease-spring)_both] ${className}`.trim()}
          style={width ? { width } : { width: 'min(420px, 92vw)' }}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          onClick={(e: any) => e.stopPropagation()}
          onSubmit={onSubmit}
        >
          {title != null && (
            <div className="flex items-center justify-between gap-3 border-b border-solid border-border px-[18px] py-4">
              <span className="text-lg font-extrabold text-text">{title}</span>
              {closeLabel && (
                <button
                  type="button"
                  aria-label={closeLabel}
                  title={closeLabel}
                  onClick={onClose}
                  className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-chip border-none bg-transparent text-text-dim cursor-pointer enabled:hover:bg-surface-hover enabled:hover:text-text"
                >
                  <Icon name="close" size={19} />
                </button>
              )}
            </div>
          )}
          <div className="p-[18px]">{children}</div>
          {footer != null && (
            <div className="flex justify-end gap-2.5 border-t border-solid border-border bg-surface-2 px-[18px] py-3.5">
              {footer}
            </div>
          )}
        </Box>
      ) : (
        // 既定（legacy 共有プリミティブ）。従来経路と完全同一。
        <Box
          className={`modal ${className}`.trim()}
          style={width ? { width } : undefined}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          onClick={(e: any) => e.stopPropagation()}
          onSubmit={onSubmit}
        >
          {closeLabel && (
            <button
              type="button"
              className="modal-close"
              aria-label={closeLabel}
              title={closeLabel}
              onClick={onClose}
            >
              ×
            </button>
          )}
          {children}
        </Box>
      )}
    </div>
  );
}
