import type { ReactNode } from 'react';
import Button, { type ButtonVariant } from './button.tsx';
import Icon, { type IconName } from './icons/icon.tsx';
import Modal from './modal.tsx';

// 確認ダイアログ（純粋 leaf UI）。Modal を土台に DS(claude design "INSESSION Design System" #663)の
// Confirm 体裁「tone のアイコン円 + 見出し + 本文 + キャンセル/実行の2ボタン」を標準化する。
// 破壊的操作は confirmVariant='danger'（tone も自動で danger）で実行ボタン/アイコンを危険色にする。
// i18n は持たない（文言は注入）。
export type ConfirmTone = 'danger' | 'warn' | 'info';

export type ConfirmModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  // 実行ボタンの見た目。破壊的操作は 'danger'。既定 'primary'。
  confirmVariant?: ButtonVariant;
  // アイコン円の tone。省略時は confirmVariant==='danger' なら danger、他は info。
  tone?: ConfirmTone;
  // アイコン円のアイコン。既定 'warning'。
  icon?: IconName;
  // 実行処理中（ボタンをローディング表示にする）。
  loading?: boolean;
  ariaLabel?: string;
  // Modal 本体（.modal）に足す追加クラス（幅など）。
  className?: string;
};

const TONE_CIRCLE: Record<ConfirmTone, string> = {
  danger: 'text-danger bg-danger-surface',
  warn: 'text-warning bg-warning-surface',
  info: 'text-info bg-info-surface',
};

export default function ConfirmModal({
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  tone,
  icon = 'warning',
  loading = false,
  ariaLabel,
  className = '',
}: ConfirmModalProps) {
  const resolvedTone: ConfirmTone = tone ?? (confirmVariant === 'danger' ? 'danger' : 'info');
  return (
    <Modal onClose={onClose} ariaLabel={ariaLabel ?? title} className={className}>
      <span
        className={`mx-auto inline-flex h-[46px] w-[46px] items-center justify-center rounded-pill ${TONE_CIRCLE[resolvedTone]}`}
        aria-hidden="true"
      >
        <Icon name={icon} size={24} />
      </span>
      <h2>{title}</h2>
      <p className="break-words text-center text-base leading-[1.55] text-text-dim">{children}</p>
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
