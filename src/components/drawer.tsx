import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';
import { twMerge } from '../lib/tw-merge.ts';

// 画面端からスライドインする Drawer(サイドシート。純粋 leaf UI。#155)。
// 振る舞いは Base UI の Dialog へ委譲する(Modal / BottomSheet と同じ土台)。DS 側は見た目と、
// 呼び出し側の契約(open/onClose/side/width/ariaLabel/closeOnEsc)だけを持つ。
//
// ── なぜ新設したか ─────────────────────────────────
// 既存プリミティブでは「左端から板が滑り出てくる」表現が作れない:
//   Modal       … 中央に出るダイアログ
//   BottomSheet … **下から**出るシート(snap point 付き)
//   Popover     … アンカー基準の小さな浮遊面
// 消費側で毎回組むと表現がブレるので、DS 側のプリミティブとして持つ。
//
// ── API の流儀 ───────────────────────────────────
// Modal は compound(Root/Portal/Backdrop/Popup/...)、BottomSheet は単一コンポーネント + props。
// Drawer は **BottomSheet の流儀に合わせた**。理由: どちらも「画面端から出る面に、消費側が
// 中身を丸ごと差し込む」だけの部品で、Modal のようにタイトル行/本文/フッターという内部構造を
// 持たない。パートを公開しても消費側が組む余地が無く、Portal/Backdrop/Viewport の
// 積み方を毎回書かせるコストだけが残る。
//
// ── なぜ Base UI の Drawer ではなく Dialog を使うのか ────
// Base UI には Drawer(swipeDirection / snapPoints 付き)もあり、BottomSheet はそちらを使って
// いる。こちらが Dialog なのは、**スワイプで閉じるジェスチャーを今回のスコープに入れていない**
// ため。Drawer を使うと位置は CSS 変数(--drawer-swipe-movement-x 等)経由で消費側が transform に
// 反映する責務を負うが、スワイプが無いならその複雑さは対価に見合わない。ジェスチャーが要る
// ようになったら Base UI Drawer へ載せ替える(props の契約は変えずに済む想定)。
//
// ── ⚠ スタイルは必ずユーティリティで書く ───────────────
// components.css には**置かない**。insession-app は DS の styles.css を読み込まず、
// `@source` で dist を走査して Tailwind にクラスを生成させる方式なので、
// components.css に書いた定義はあの消費側に**一切届かない**(クラス名は DOM に出るのに CSS が
// 無い、という静かな欠落になる)。Modal の legacy 経路が .modal を使えているのは、消費側が
// 自分の legacy CSS で同名クラスを定義しているからで、新設の Drawer にはその受け皿が無い。

export type DrawerSide = 'left' | 'right';

// 暗幕。兄弟である BottomSheet の .bottom-sheet-backdrop と同じスクリム(背景色 55% + 軽いブラー)
// にする。Modal の .modal-backdrop は生の #000 を 32% 混ぜているが、こちらは新設で追随義務が
// 無いのでトークン(--color-bg)由来に揃える(生 hex を書かない方針)。
// ⚠ 閉じ側(data-ending-style)を必ず定義する。Base UI は「入場アニメーションがある要素は退場も
// 待つ」ため、starting だけ書くと閉じた要素が data-ending-style を付けたまま DOM に残り続ける
// (toast.tsx で実測した罠と同じ)。
const BACKDROP =
  'fixed inset-0 z-(--z-modal) bg-[color-mix(in_srgb,var(--color-bg)_55%,transparent)] backdrop-blur-[2px] ' +
  'transition-opacity duration-(--dur-base) ' +
  'data-starting-style:opacity-0 data-ending-style:opacity-0 ' +
  'motion-reduce:transition-none';

// Popup を左右いずれかの端へ寄せる位置決めコンテナ。Base UI では Backdrop と Popup が
// **兄弟**になるため、寄せる役目は Viewport が担う(modal.tsx が中央寄せを Viewport で
// 再現しているのと同じ構造)。z-index を明示しないと Backdrop 側の --z-modal が勝って
// Popup が背面に回る。
const VIEWPORT_BASE = 'fixed inset-0 flex';
const VIEWPORT_SIDE: Record<DrawerSide, string> = {
  left: 'justify-start',
  right: 'justify-end',
};

// 本体。高さいっぱいの板で、中身のスクロールは消費側に任せる(overflow-y-auto をここで持つと、
// 中に固定ヘッダーを置きたい消費側が困る)。
// 影は寄せた辺と反対側へ落とす必要があるので side ごとに分ける。
const POPUP_BASE =
  'relative flex h-full min-h-0 flex-col bg-surface-2 shadow-overlay ' +
  'transition-transform duration-(--dur-base) ease-spring ' +
  'motion-reduce:transition-none';
// 開閉のスライド。data-starting-style(入場前) と data-ending-style(退場後) の両方で画面外へ
// 逃がす。Tailwind の translate ユーティリティは同じ custom property を書くので、variant 側
// (utilities レイヤーで後に出力される)が基底の translate-x-0 に勝つ。
//
// ⚠ **検証スクリプトで「スライドが終わったか」を transform で判定しないこと。**
// Tailwind v4 の translate-x-* は `transform` ではなく **独立した `translate` プロパティ**を
// 書く。そのため getComputedStyle(el).transform は開閉中もずっと 'none' のままで、
// 「transform が identity になるまで待つ」条件は**即座に成立して動作の途中を測る**
// (実測: rectX が -320 の時点で待機が抜けた)。見るべきは `translate`(-100% → 0px)。
// なお transition-transform ユーティリティ自体は v4 では transform/translate/scale/rotate を
// まとめて対象にするので、アニメーション自体はこの指定で正しく走る。
const POPUP_SIDE: Record<DrawerSide, string> = {
  left: 'translate-x-0 border-0 border-r border-solid border-border data-starting-style:-translate-x-full data-ending-style:-translate-x-full',
  right:
    'translate-x-0 border-0 border-l border-solid border-border data-starting-style:translate-x-full data-ending-style:translate-x-full',
};

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  // どの辺から出すか。既定 'left'。
  // 上下は扱わない — 下からは BottomSheet が担うので重複させない。
  side?: DrawerSide;
  // 板の幅。CSS の length ならなんでも渡せる。既定は min(320px, 86vw)。
  // ⚠ 中身が自分で幅を持つ場合(DS の SideNav は w-[232px] 固定)は 'auto' を渡すこと。
  // 既定のままだと中身より板が広く、右側に空いた面が残る。
  // ⚠ この値は inline style として当たるので、className に w-* ユーティリティを足しても
  // **勝てない**。幅を変えたいときは className ではなくこの prop を使うこと。
  width?: string;
  // ダイアログの aria-label。中身に見出しが無い場合はこれが accessible name になる。
  ariaLabel?: string;
  // Esc キーで閉じる。既定 true。
  closeOnEsc?: boolean;
  // 本体へ追加するクラス。@layer components より強い側から当たるので上書きに使える。
  className?: string;
};

export default function Drawer({
  open,
  onClose,
  children,
  side = 'left',
  width = 'min(320px, 86vw)',
  ariaLabel,
  closeOnEsc = true,
  className = '',
}: DrawerProps) {
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        // closeOnEsc=false のときだけ Esc による close を打ち消す(Modal.Root と同じ方針)。
        if (!nextOpen && !closeOnEsc && eventDetails.reason === 'escape-key') {
          eventDetails.cancel();
          return;
        }
        if (!nextOpen) onClose();
      }}
    >
      <BaseDialog.Portal>
        {/* `data-drawer-*` は見た目ではなく DOM の hook(検証スクリプトのセレクタ)。
            backdrop も popup も汎用ユーティリティだけで組んでいるので、クラス名で掴ませると
            スタイル調整のたびにスクリプトが壊れる。 */}
        <BaseDialog.Backdrop data-drawer-backdrop="" className={BACKDROP} />
        <BaseDialog.Viewport
          data-drawer-viewport=""
          className={`${VIEWPORT_BASE} ${VIEWPORT_SIDE[side]}`}
          style={{ zIndex: 'var(--z-modal)' }}
        >
          <BaseDialog.Popup
            data-drawer-popup=""
            data-drawer-side={side}
            className={twMerge(POPUP_BASE, POPUP_SIDE[side], className)}
            style={{ width }}
            aria-label={ariaLabel}
          >
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
