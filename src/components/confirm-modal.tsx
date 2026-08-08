import { AlertDialog } from '@base-ui/react/alert-dialog';
import type { ReactNode } from 'react';
import Icon, { type IconName } from '../icons/icon.tsx';
import { twMerge } from '../lib/tw-merge.ts';
import Button, { type ButtonVariant } from './button.tsx';
import {
  MODAL_BACKDROP_CLASS,
  MODAL_LEGACY_POPUP_CLASS,
  MODAL_POSITIONER_CLASS,
  MODAL_Z_INDEX,
} from './modal.tsx';

// 確認ダイアログ（純粋 leaf UI）。Base UI の AlertDialog を土台に DS
// (claude design "INSESSION Design System" #663) の Confirm 体裁「tone のアイコン円 + 見出し + 本文 +
// キャンセル/実行の2ボタン」を標準化する。破壊的操作は confirmVariant='danger'（tone も自動で danger）
// で実行ボタン/アイコンを危険色にする。i18n は持たない（文言は注入）。
//
// Modal（Dialog）ではなく AlertDialog に載せ替える理由（#6）: 確認ダイアログは「ユーザーの応答なしに
// 誤って閉じられては困る」性質を持つ。旧実装は Modal に委譲していたため背景クリックで閉じてしまって
// いたが、これは確認ダイアログとしては望ましくない挙動だった。AlertDialog は outside press では
// 閉じない（Escape とボタン操作でのみ閉じる）ため、この載せ替えは見た目を変えずに挙動を是正する。
//
// ConfirmModal 自体は「タイトル + メッセージ + キャンセル/確認ボタン」の閉じた高レベル API のまま
// 維持する（compound に分解する価値が薄い定型ダイアログのため。内部実装だけを AlertDialog にする）。
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
    <AlertDialog.Root
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <AlertDialog.Portal>
        {/* legacy 経路と同じ .modal-backdrop（暗幕 + ブラー + fade-in）。modal.tsx と共有。 */}
        <AlertDialog.Backdrop className={MODAL_BACKDROP_CLASS} />
        {/* Dialog.Popup と同様、Backdrop/Popup が兄弟になるため中央寄せは Viewport が担う
            （modal.tsx の Popup 内部実装と同じ理由。中央寄せクラス・z-index も modal.tsx と共有）。 */}
        <AlertDialog.Viewport className={MODAL_POSITIONER_CLASS} style={{ zIndex: MODAL_Z_INDEX }}>
          <AlertDialog.Popup
            className={twMerge(MODAL_LEGACY_POPUP_CLASS, className)}
            aria-label={ariaLabel ?? title}
          >
            <span
              className={`mx-auto inline-flex h-[46px] w-[46px] items-center justify-center rounded-pill ${TONE_CIRCLE[resolvedTone]}`}
              aria-hidden="true"
            >
              <Icon name={icon} size={24} />
            </span>
            {/* AlertDialog.Title/.Description は既定で h2/p を描画するので、components.css の
                `.modal h2` 装飾がそのまま乗る（旧実装の生 h2/p と見た目は同一）。 */}
            <AlertDialog.Title>{title}</AlertDialog.Title>
            <AlertDialog.Description className="break-words text-center text-base text-text-dim">
              {children}
            </AlertDialog.Description>
            <div className="mt-2 flex gap-2.5">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={confirmVariant}
                className="flex-1"
                loading={loading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

// ── 旧 API → 新 API 対応表 ──────────────────────────────────
// ConfirmModal の props（title/children/confirmLabel/cancelLabel/onClose/onConfirm/confirmVariant/
// tone/icon/loading/ariaLabel/className）は変更なし。内部実装のみ Modal(Dialog) → AlertDialog
// に載せ替えた。挙動変化: 背景クリックでは閉じなくなった（AlertDialog は outside press で閉じない。
// 確認ダイアログとして意図した挙動。#6）。
