import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentProps } from 'react';

// 汎用モーダルの外殻（純粋 leaf UI）。Base UI の Dialog に委譲し、focus trap・scroll lock・
// 閉じた後のフォーカス復帰を自前実装せずに獲得する（#6）。backdrop クリック判定・Esc リスナー・
// ownerDocument 解決はすべて Base UI 側に任せるため、このファイルはクラス名を当てる薄いラッパのみ。
//
// compound namespace として named export する（旧 API の単一コンポーネントは残さない。major リリース）:
//   Modal.Root / Trigger / Portal / Backdrop / Popup / Title / Description / Close / Body / Footer
//
// 2つの体裁を持つ（#663。旧 modal.tsx の title/footer 有無による出し分けを引き継ぐ）:
//  - legacy（既定 variant='legacy'）: components.css の .modal / .modal-backdrop / .modal-close を
//    そのまま使う従来経路（中央寄せ h2 / submit ボタン装飾に依存する多数の消費側をそのまま動かす）。
//  - ds（variant='ds'）: claude design "INSESSION Design System" の Modal に準拠し、トークンの
//    ユーティリティで title 行 / body(pad18) / footer 行（border-top + surface-2）を組む。
//
// variant はどう表現するか: Popup に `variant` prop を持たせる案と、Title/Body/Footer を使ったかで
// 自動判定する案を検討したが、後者は「Title を差し込むと見た目が切り替わる」という暗黙の分岐になり、
// かつ close ボタンをタイトル行と同じ行に収めるには Title 自体に close を子として抱かせる必要があり
// （aria-labelledby が close の aria-label まで拾ってしまい dialog の accessible name が汚れる）
// 都合が悪い。variant を明示 prop にして Popup と Close の見た目だけを切り替え、タイトル行の
// レイアウト（border-bottom + flex justify-between）は消費側が Modal.Title と Modal.Close を並べる
// 素の div で組む（旧 modal.tsx のクラス文字列をそのまま流用）方式にした。
export type ModalVariant = 'legacy' | 'ds';

// ---- Root ----
// Base UI の modal（既定 true）で focus trap + scroll lock を獲得する。closeOnEsc は Base UI に
// 直接対応する prop が無いため、onOpenChange の reason==='escape-key' を検知して cancel() する形で
// 表現する（Root.ChangeEventDetails.cancel が「Base UI にこのイベントを処理させない」ためのAPI）。
export type ModalRootProps = ComponentProps<typeof BaseDialog.Root> & {
  // Esc キーで閉じるか。既定 true（旧 API の closeOnEsc を維持）。
  closeOnEsc?: boolean;
};

function Root({ closeOnEsc = true, onOpenChange, ...props }: ModalRootProps) {
  return (
    <BaseDialog.Root
      {...props}
      onOpenChange={(open, eventDetails) => {
        if (!closeOnEsc && eventDetails.reason === 'escape-key') {
          eventDetails.cancel();
          return;
        }
        onOpenChange?.(open, eventDetails);
      }}
    />
  );
}

// ---- Trigger ----
// DS が足すものが無いので Base UI のパートをそのまま再 export する。
const Trigger = BaseDialog.Trigger;
export type ModalTriggerProps = ComponentProps<typeof BaseDialog.Trigger>;

// ---- Portal ----
// container を渡せば別ドキュメント（Document Picture-in-Picture 等）へ描画できる。旧実装は
// backdropRef.ownerDocument から自動解決していたが、Base UI の Portal は既定で document.body に
// 出す薄いラッパのため自動検出はしない。PiP 等で別ドキュメントに出したい消費側は
// `<Modal.Portal container={pipDocument.body}>` のように明示する必要がある（#6 で自動化は落とした。
// 呼び出し側の変更が必要な点は報告に明記する）。
const Portal = BaseDialog.Portal;
export type ModalPortalProps = ComponentProps<typeof BaseDialog.Portal>;

// ---- Backdrop ----
// legacy/ds 共通で .modal-backdrop（暗幕 + ブラー + fade-in）を使う（旧実装も両体裁で共通だった）。
export type ModalBackdropProps = ComponentProps<typeof BaseDialog.Backdrop>;

function Backdrop({ className = '', ...props }: ModalBackdropProps) {
  return <BaseDialog.Backdrop className={`modal-backdrop ${className}`.trim()} {...props} />;
}

// legacy 経路の本体クラス。components.css の .modal（幅 min(400px,92vw)・padding・card-in 等）。
const LEGACY_POPUP_CLASS = 'modal';
// DS 構造の本体クラス。旧 modal.tsx の DS ブランチのクラス文字列をそのまま流用。
const DS_POPUP_CLASS =
  'relative flex w-full flex-col overflow-hidden rounded-card border border-solid border-border bg-surface shadow-overlay animate-[card-in_0.4s_var(--ease-spring)_both] motion-reduce:animate-none';
// Popup を中央寄せする位置決めコンテナ。旧実装は .modal-backdrop 自身が
// display:flex;align-items:center;justify-content:center;padding:20px で Popup(子要素) を中央に
// 置いていたが、Base UI では Backdrop と Popup が兄弟になるため、その役目は Dialog.Viewport が担う
// （anatomy 上の正しい置き場所）。Viewport は compound の公開パートには含めない
// （オーケストレーター指定の公開 API 一覧に無いため）が、Popup の内部実装として使い、旧来の
// 中央寄せ + 20px の余白を再現する。z-index は .modal-backdrop と同じ --z-modal を明示しないと、
// Backdrop 側の明示 z-index が勝って Popup が背面に回ってしまう点に注意。
const POSITIONER_CLASS = 'fixed inset-0 flex items-center justify-center p-5';

export type ModalPopupProps = ComponentProps<typeof BaseDialog.Popup> & {
  // 体裁の切り替え。既定 'legacy'。
  variant?: ModalVariant;
};

function Popup({ variant = 'legacy', className = '', style, ...props }: ModalPopupProps) {
  const popupClassName = variant === 'ds' ? DS_POPUP_CLASS : LEGACY_POPUP_CLASS;
  const popupStyle = variant === 'ds' ? { width: 'min(420px, 92vw)', ...style } : style;
  return (
    <BaseDialog.Viewport className={POSITIONER_CLASS} style={{ zIndex: 'var(--z-modal)' }}>
      <BaseDialog.Popup
        className={`${popupClassName} ${className}`.trim()}
        style={popupStyle}
        {...props}
      />
    </BaseDialog.Viewport>
  );
}

// ---- Title ----
// legacy 経路は消費側が素の <h2> を書く運用のまま（components.css の `.modal h2` 装飾に依存する
// 既存消費側を壊さないため。ConfirmModal もこの流儀）。Modal.Title は主に ds 構造で使う想定なので、
// 既定クラスは ds 側の見出し文字装飾のみ持たせる。
export type ModalTitleProps = ComponentProps<typeof BaseDialog.Title>;

function Title({ className = '', ...props }: ModalTitleProps) {
  return (
    <BaseDialog.Title
      className={`text-lg font-extrabold text-text ${className}`.trim()}
      {...props}
    />
  );
}

// ---- Description ----
// DS が足すものが無いので Base UI のパートをそのまま再 export する。
const Description = BaseDialog.Description;
export type ModalDescriptionProps = ComponentProps<typeof BaseDialog.Description>;

// ---- Close ----
// legacy/ds でクラス・既定の子要素（× 記号 or Icon）が異なるため Popup と同じく variant で切り替える。
// Base UI の Close は押下で自動的にダイアログを閉じる（onClick で onClose を呼ぶ配線は不要になった）。
export type ModalCloseProps = ComponentProps<typeof BaseDialog.Close> & {
  variant?: ModalVariant;
};

function Close({ variant = 'legacy', className = '', children, ...props }: ModalCloseProps) {
  if (variant === 'ds') {
    return (
      <BaseDialog.Close
        className={`inline-flex h-[30px] w-[30px] items-center justify-center rounded-chip border-none bg-transparent text-text-dim cursor-pointer enabled:hover:bg-surface-hover enabled:hover:text-text ${className}`.trim()}
        {...props}
      >
        {children}
      </BaseDialog.Close>
    );
  }
  return (
    <BaseDialog.Close className={`modal-close ${className}`.trim()} {...props}>
      {children ?? '×'}
    </BaseDialog.Close>
  );
}

// ---- Body ----
// Base UI に対応パートが無い DS 独自パート。旧 DS 構造の「pad18 の本文領域」を表現する。
export type ModalBodyProps = ComponentProps<'div'>;

function Body({ className = '', ...props }: ModalBodyProps) {
  return <div className={`p-[18px] ${className}`.trim()} {...props} />;
}

// ---- Footer ----
// Base UI に対応パートが無い DS 独自パート。旧 DS 構造の「border-top + surface-2 のフッター行」。
export type ModalFooterProps = ComponentProps<'div'>;

function Footer({ className = '', ...props }: ModalFooterProps) {
  return (
    <div
      className={`flex justify-end gap-2.5 border-t border-solid border-border bg-surface-2 px-[18px] py-3.5 ${className}`.trim()}
      {...props}
    />
  );
}

export const Modal = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Popup,
  Title,
  Description,
  Close,
  Body,
  Footer,
};

// ── 旧 API → 新 API 対応表 ──────────────────────────────────
// <Modal onClose={fn} children>                          → <Modal.Root open onOpenChange={(o) => !o && fn()}>
//                                                            <Modal.Portal><Modal.Backdrop />
//                                                            <Modal.Popup>{children}</Modal.Popup>
//                                                            </Modal.Portal></Modal.Root>
// width（CSS 長さ）                                        → Modal.Popup の style={{ width }}（専用 prop 廃止）
// className（本体に足す追加クラス）                          → Modal.Popup の className（後置マージは維持）
// ariaLabel                                                → Modal.Popup の aria-label（Base UI 透過。専用 prop 廃止）
// closeLabel + × ボタン                                     → <Modal.Close aria-label={closeLabel} title={closeLabel}>
//                                                            （legacy: 既定で×表示。ds: children に <Icon name="close"/>）
// as='div' | 'form' + onSubmit                             → Modal.Popup の render={<form onSubmit={...} />}
//                                                            （as prop は廃止。render に一本化）
// closeOnEsc                                                → Modal.Root の closeOnEsc（内部で Base UI の
//                                                            escape-key イベントを cancel() して表現）
// title（DS 構造の見出し）                                   → variant='ds' の Modal.Popup 内で
//                                                            見出し行の div（flex / gap-3 / border-b /
//                                                            px-[18px] py-4 を呼び出し側で組む）に
//                                                            <Modal.Title>...</Modal.Title>
//                                                            <Modal.Close variant="ds" .../></div>
// footer（DS 構造のアクション行）                             → variant='ds' の Modal.Popup 内で <Modal.Footer>
// title/footer 省略時の legacy 経路                          → variant='legacy'（既定）の Modal.Popup
// PiP（別ドキュメントへの描画。ownerDocument 自動解決）        → Modal.Portal の container prop で明示指定が必要
//                                                            （自動検出は廃止。落とした要件。報告参照）
