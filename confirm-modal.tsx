import type { ReactNode } from 'react';
import Button, { type ButtonVariant } from './button.tsx';
import Modal from './modal.tsx';

// 確認ダイアログ（純粋 leaf UI）。Modal を土台に「見出し + 本文 + キャンセル/実行の2ボタン」を
// 標準化する。confirm-play / confirm-bulk-add 等の個別実装を将来この一本へ寄せられる API。
// 破壊的操作は confirmVariant='danger' で実行ボタンを危険色にする。i18n は持たない（文言は注入）。
export type ConfirmModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  // 実行ボタンの見た目。破壊的操作は 'danger'。既定 'primary'。
  confirmVariant?: ButtonVariant;
  // 実行処理中（ボタンをローディング表示にする）。
  loading?: boolean;
  ariaLabel?: string;
  // Modal 本体（.modal）に足す追加クラス（幅など）。
  className?: string;
};

export default function ConfirmModal({
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  loading = false,
  ariaLabel,
  className = '',
}: ConfirmModalProps) {
  return (
    <Modal onClose={onClose} ariaLabel={ariaLabel ?? title} className={className}>
      <h2>{title}</h2>
      <p className="break-words text-center text-base leading-[1.8] text-text-dim">{children}</p>
      <div className="mt-2 flex gap-2.5">
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} className="flex-1" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
