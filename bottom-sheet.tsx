import { Drawer } from '@base-ui/react/drawer';
import type { ReactNode } from 'react';

// 汎用Bottom Sheet(純粋 leaf UI。#284)。モバイルのChat/Participants導線のために新設。
// 振る舞いは Base UI の Drawer へ委譲する(#23)。DS 側は見た目(components.css の
// .bottom-sheet* )と、呼び出し側の契約(open/onClose/ariaLabel/closeLabel/closeOnEsc)だけを持つ。
//
// ── 移行で捨てたもの ──────────────────────────────────
// 自前で持っていた次を全部 Base UI に任せた。**props は移行前から変えていない**。
//   - Pointer Events でのドラッグ実装(setPointerCapture / pointermove / スナップ計算。約60行)
//     → Drawer の snapPoints。MID_RATIO 0.68 / FULL_RATIO 0.94 をそのまま渡す
//   - window への keydown リスナーによる Esc close → Drawer 標準(closeOnEsc=false のときだけ
//     eventDetails.cancel() で打ち消す。Popover/Modal と同じ書き方)
//   - backdrop クリックで閉じる + 中身側での stopPropagation → Drawer.Backdrop 標準
//   - `if (!open) return null` の手動アンマウント → Drawer.Portal
// 併せて、移行前は無かった **フォーカストラップ・スクロールロック・閉じた後のフォーカス復帰**
// が付いた(Modal を Base UI Dialog に載せたとき #6 と同じ効果)。
//
// ── 高さの扱い ────────────────────────────────────────
// 移行前は mode('mid'|'full') を state で持ち、.bottom-sheet--mid / --full の height(68dvh /
// 94dvh)を CSS で当てていた。Drawer は snapPoint を自分で管理して inline の transform で
// 表現するため、**高さは常にフル(94dvh)にしておき、どこまでせり出すかを snapPoints に任せる**。
// これで「開いた直後は中途、上に引くとフルハイト、下に引き切ると閉じる」という移行前の体験を
// 維持したまま、スナップ計算を自前で持たずに済む。
// CLOSE_RATIO(0.32) 相当の「一定以下まで縮めたら閉じる」は Drawer の dismiss 判定が担う
// (Base UI は速度も見るので、ゆっくり下げたときの閾値は移行前と厳密には一致しない)。
const MID_SNAP = 0.68;
const FULL_SNAP = 0.94;

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
  return (
    <Drawer.Root
      open={open}
      swipeDirection="down"
      // 開くたびに中途高さから始める(前回フルハイトのまま閉じても次回はリセットする)のは
      // defaultSnapPoint が担う。Drawer は閉じるときに snapPoint を初期値へ戻す。
      defaultSnapPoint={MID_SNAP}
      snapPoints={[MID_SNAP, FULL_SNAP]}
      onOpenChange={(nextOpen, eventDetails) => {
        // closeOnEsc=false のときだけ Esc による close を打ち消す(Popover.Root と同じ方針)。
        if (!nextOpen && !closeOnEsc && eventDetails.reason === 'escape-key') {
          eventDetails.cancel();
          return;
        }
        if (!nextOpen) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="bottom-sheet-backdrop" />
        {/* Popup を下端に寄せる位置決めコンテナ。移行前は .bottom-sheet-backdrop 自身が
            display:flex; align-items:flex-end でシート(子要素)を下端に置いていたが、Base UI
            では Backdrop と Popup が **兄弟** になるためその役目は Drawer.Viewport が担う
            （modal.tsx が Dialog.Viewport で中央寄せを再現しているのと同じ構造）。
            z-index を明示しないと Backdrop 側の --z-modal が勝って Popup が背面に回る。 */}
        <Drawer.Viewport
          className="fixed inset-0 flex items-end"
          style={{ zIndex: 'var(--z-modal)' }}
        >
          <Drawer.Popup
            className="bottom-sheet bottom-sheet--full"
            aria-label={ariaLabel}
            aria-modal="true"
          >
            {/* ハンドル。移行前は自前の onPointerDown でドラッグを実装していたが、
                Drawer.SwipeArea に置き換えた(スワイプの検出とスナップは Base UI 側)。 */}
            <Drawer.SwipeArea className="bottom-sheet-handle-area">
              <span className="bottom-sheet-handle" />
            </Drawer.SwipeArea>
            {closeLabel && (
              <Drawer.Close
                className="bottom-sheet-close"
                aria-label={closeLabel}
                title={closeLabel}
              >
                ×
              </Drawer.Close>
            )}
            <div className="bottom-sheet-body">{children}</div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
