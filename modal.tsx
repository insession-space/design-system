import { type ReactNode, useEffect } from 'react';

// 汎用モーダルの外殻（純粋 leaf UI）。backdrop・本体・×閉じボタン・Esc・背景クリックで閉じる、を
// 一箇所にまとめる。見た目クラス（.modal-backdrop / .modal / .modal-close）はグローバル CSS 側の
// 共有プリミティブを使う（Toggle 等と同じ方針）。i18n はこのパッケージに持たないため、
// 閉じるラベルは props で注入する。
//
// 幅は `width`（CSS 長さ）を inline style で当てて基底 `.modal`（width:min(400px,92vw)）を確実に
// 上書きする。ユーティリティ幅がレガシー層に負けて効かない問題を避け、任意幅のモーダルを作れる。
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
}: ModalProps) {
  useEffect(() => {
    if (!closeOnEsc) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, closeOnEsc]);

  const Box: any = as;
  return (
    <div className="modal-backdrop" onClick={onClose}>
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
    </div>
  );
}
