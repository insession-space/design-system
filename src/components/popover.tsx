import { Popover as BasePopover } from '@base-ui/react/popover';
import type * as React from 'react';
import { createContext, useContext } from 'react';
import { twMerge } from '../lib/tw-merge.ts';

// ポップオーバーの共通基盤。Base UI(floating-ui ベース)の Popover へ委譲する薄い compound
// ラッパー(#6)。以前はここで自前の PLACEMENT クラスマップ・portal 実測配置・useDismiss を
// 持っていたが、Base UI がフリップ/シフト・フォーカストラップ・Esc/外側クリック close を
// 一式で提供するため、DS 側は「見た目(パネルの面)」と「呼び出し側からよく使う微調整
// (closeOnEsc/closeOnOutside・mobileSheet)」だけを足す。i18n は持たない。
//
// 使い方(compound): <Popover.Root><Popover.Trigger/><Popover.Portal><Popover.Positioner
// side="bottom" align="start"><Popover.Popup>...</Popover.Popup></Popover.Positioner>
// </Popover.Portal></Popover.Root>
//
// ⚠ **Popover.Portal は省略できない**(必須)。以前ここには「Portal を挟まなければ従来の
// 『非 portal(トリガーの兄弟として絶対配置)』相当になる」と書いていたが**誤り**だった。
// Base UI の Popover.Positioner は usePopoverPortalContext() で Portal の存在を必須にしており、
// 無いと**レンダー中に throw する**(dev: `Base UI: <Popover.Portal> is missing.` /
// prod: minify されて `Base UI error #45`)。React のレンダー中の例外なのでツリーごと落ち、
// error boundary を挟んでいない画面では**全体が真っ白**になる。実際に消費側 2 箇所
// (insession-app のヘッダー通知ベル・admin のアカウントメニュー)がこの誤記を根拠に Portal を
// 省き、staging で画面真っ白を踏んだ(insession-app#1113)。Menu も同じ制約
// (Menu.Positioner → Menu.Portal 必須。prod は `Base UI error #32`)。

// パネル本体の見た目(面・境界・角丸・影・入場アニメ)。padding と最大高さスクロールは
// **ここに含めない** — 下記 POPOVER_POPUP_PADDING / POPOVER_POPUP_SCROLL として分離し、
// Popup の padding / scroll props(既定 true)で出す・出さないを選ばせる。
//
// ⚠ 2.0 では padding/scroll をこの定数に混ぜて「外したい呼び出し側は className で
// `p-0` / `max-h-none overflow-visible` を渡して打ち消す」契約にしていたが、**この打ち消しは
// 効かなかった(#21)**。クラス属性の並び順は CSS の勝敗に無関係で、同一プロパティの
// ユーティリティは**配布 CSS の出力順**で決まる。実測(insession-app の本番ビルド CSS /
// Tailwind 4.3.2): `.p-0` は idx 163644、`.p-3` は idx 163880 で後ろの `.p-3` が勝ち、
// `.overflow-y-auto`(154325) も `.overflow-visible`(154257) より後ろ。`.max-h-none` だけ
// たまたま後ろにあって効くという一貫性のない状態だった。
// → 「打ち消す」のをやめ、**そもそも出さない**(prop で分岐する)方式へ戻した。v1 が
// panelPadding / panelScroll という props を持っていたのは正しかった。
// className マージ規約(`${BASE} ${className}`.trim())は、`data-*` バリアントのように
// バリアント付きが base より後に出力されるケースでのみ上書きが成立する。素の同一
// プロパティ同士では成立しないので、className での打ち消しを前提にした設計をしない。
// ⚠ z-index はここに置かない(#14)。Base UI では **Popup は position:static** で、位置決めを
// しているのは親の Positioner。CSS 仕様上 position:static の要素に z-index は効かないため、
// ここに書いても完全に無効になる。#6 の移行時、旧実装ではパネル自身が absolute/fixed
// だったので効いていたという前提が崩れたのを見落としていた。実測(loophub-app / DS 2.0.0):
// Popup は pos=static z=35、Positioner は pos=absolute z=auto となり、DOM 上で前にある
// z-index:5 の要素にパネルが覆われた(elementFromPoint がその要素を返した)。
// → z-index は POPOVER_POSITIONER_BASE 側(Positioner = positioned な要素)に置く。
// Menu.Popup とも共有する(menu.tsx から import する)。
export const POPOVER_POPUP_BASE =
  'min-w-[220px] max-w-[calc(100vw-24px)] bg-surface border border-solid border-border-strong rounded-card shadow-popover animate-[card-in_var(--dur-base)_var(--ease-spring)_both]';

// Popup の既定の内側 padding。`padding={false}` で出さない(v1 の panelPadding={false} 相当)。
export const POPOVER_POPUP_PADDING = 'p-3';

// Popup の既定の最大高さ + 内部スクロール。`scroll={false}` で出さない
// (v1 の panelScroll={false} 相当)。ヘッダー固定 + リストだけスクロールのように、
// 呼び出し側が独自の高さ/スクロール領域を組むパネルはこれを切る。
export const POPOVER_POPUP_SCROLL = 'max-h-80 overflow-y-auto';

// Positioner(position:absolute | fixed が当たる要素)に置く z-index。ここが実際に効く層。
// 旧実装は portal 有無で z-(--z-dropdown) / z-[var(--z-popover-portal,35)] を使い分けていたが、
// Base UI では Portal を呼び出し側が Positioner の外側に組むため Positioner 自身は portal
// されたかを知らない。参加者一覧のような高い z-index の親に食い込まれる事故を避けるため、
// 常に高い方の値へ統一する。theme.css を import しない consumer(products/insession/apps/help
// 等)で --z-popover-portal が未定義でもフォールバック 35 で z-index:auto に落ちないよう、
// フォールバック付きの任意値記法にしてある(#885 由来)。
// 呼び出し側が Positioner の className で上書きできるよう、マージでは前に置く。
// Menu.Positioner とも共有する(menu.tsx から import する)。
export const POPOVER_POSITIONER_BASE = 'z-[var(--z-popover-portal,35)]';

// 旧 PLACEMENT/PORTAL_OFFSET_PX(8px)と同じ間隔を Base UI の sideOffset で再現する既定値。
const DEFAULT_SIDE_OFFSET = 8;

// mobileSheet: max-sm でトリガー追従(side/align アンカリング)をやめ、position:fixed +
// 左右対称 12px ガターでビューポートに固定するモバイルシート表示にする(旧実装の挙動を維持)。
// 上端は Base UI の side="bottom" アンカリングがそのままトリガー直下に置いてくれるため、
// top 自体は上書きしない。
//
// 過去に試して破棄した実装(!important で left/right/width を上書きする方式)がなぜ
// ダメだったかを記録しておく: Base UI の Positioner(Popover.Viewport を使わない今の構成)
// は位置を inline style の transform: translate(x, y) で当てており、left/top 自体は 0
// のまま(@base-ui/react/utils/useAnchorPositioning.js の adaptiveOrigin が undefined の
// 場合の floating-ui 既定 transform:true 経路)。そのため !important で left:12px を
// 上書きしても translate の上に加算されるだけで、実測(ビューポート幅396px)では
// Positioner の computed left=12px/right=12px/width=372px にも関わらず
// transform: matrix(1,0,0,1,16,193) が乗り、実 rect は x=28(12+16)/right=400 となって
// 右へ4pxはみ出し、左右非対称(左28px/右-4px)になっていた。
//
// 採用した方式: !important で transform と戦うのをやめ、floating-ui 本来の衝突回避
// (shift middleware)にビューポート端からの余白を確保させる。Positioner に
// collisionPadding(mobileSheet 時は 12px)を渡し、Popup の幅を max-sm で
// Base UI が Positioner に注入する CSS 変数 `--available-width` に固定する
// (PopoverPopup 側、MobileSheetContext 経由。下記参照)。この変数は「スクロールバーを
// 除いた可視域から collisionPadding を両側分引いた値」を Base UI 自身が計算済みで
// 持っているため、DS 側で 100vw や calc から再計算する必要が無い。
//
// 最初は `w-[calc(100vw-24px)]` にしていたが、CSS 仕様上 100vw はスクロールバー幅を
// 差し引かない値で、floating-ui の衝突境界(可視域基準)とズレる。実測(幅400px・
// クラシックスクロールバー16px・縦スクロールあり): documentElement.clientWidth(可視域)
// = 384px に対し、100vw 基準の計算だと Popup width=376px(400−24)になってしまい、
// Positioner の実 rect は x=12/right=388 で、可視域384基準の右ガターは -4px(右へ4px
// スクロールバーの下に潜る)。一方 `--available-width` は同じ条件で 360px
// (= clientWidth 384 − collisionPadding 12×2)であり、これをそのまま使えば
// (calc で 24px を再度引くと二重控除になり逆にガターが24pxへ広がってしまうので注意)、
// 可視域基準でも常に左右対称12pxガターになる。スクロールバーが無い環境(オーバーレイ
// スクロールバーの macOS 等、幅396px)では clientWidth=innerWidth=396px なので
// `--available-width`=372px となり、旧 calc 方式と同じ結果(x=12/right=384)になる。
// 垂直位置は Base UI のアンカー追従がそのまま効くので「上端はトリガー直下」も自動で
// 満たされる(sideOffset 既定8pxのまま)。
//
// positionMethod を "fixed" にしているのは、CSS の position だけを important で fixed に
// 差し替えると、Base UI 側は "absolute" 前提で(オフセット親基準の)座標を計算したままになり、
// ページがスクロールしている状態では viewport 基準の fixed 座標とズレるため。positionMethod
// 自体を "fixed" にして Base UI 自身に viewport 基準で計算させることで、スクロール位置に
// 関わらず正しい位置になる(モバイルの note: アドレスバー折りたたみ等でまさに起きるスクロール)。
// この結果 sm 以上でも positionMethod は "fixed" のままになる(旧実装は sm 以上で通常の
// トリガー追従の absolute だった)。見た目・追従動作は同一(portal 済みの浮遊要素において
// absolute と fixed は、祖先に overflow クリッパーが無い限り視覚的に区別できない)ため許容した。
const MOBILE_SHEET_COLLISION_PADDING = 12;

// max-sm で Positioner の可視域ぴったり(左右12pxガター)に固定する Popup 側の幅指定。
// `--available-width` は Positioner 要素に注入される CSS 変数で、Popup はその子として
// 継承で読む(値が無い場合は width 宣言自体が無効になるだけなので min-w-0 と合わせて
// 破綻しない)。min-w-[220px](POPOVER_POPUP_BASE)が勝ってガターを潰さないよう
// min-w-0 で打ち消す。max-w-[calc(100vw-24px)](POPOVER_POPUP_BASE)は sm 以上向けの
// 保険的な上限であり、max-sm では width 指定が優先されるため実質競合しない。
const MOBILE_SHEET_POPUP_CLASSNAME = 'max-sm:w-[var(--available-width)] max-sm:min-w-0';

// Positioner の mobileSheet と Popup の幅指定を紐付けるための内部 context。
// Popup 単体では自分が mobileSheet な Positioner の子かどうかを知りようが無いため、
// Positioner 側で Provider を張り、Popup 側で参照する(公開 API には出さない実装詳細)。
const MobileSheetContext = createContext(false);

const Root = BasePopover.Root;
export type PopoverRootProps = React.ComponentProps<typeof BasePopover.Root> & {
  // 既定 true(旧実装と同じ)。false で Escape / 外側クリックによる close を無効化する。
  closeOnEsc?: boolean;
  closeOnOutside?: boolean;
};

// Base UI の Root は「閉じる直前」に onOpenChange(open=false, eventDetails) を呼ぶ。
// closeOnEsc/closeOnOutside は Base UI に直接対応する boolean prop が無いため、
// eventDetails.reason を見て該当する理由なら eventDetails.cancel() で close を打ち消す
// (Base UI 公式ドキュメントの ChangeEventDetails.cancel() を使う想定の設計)。
function PopoverRoot({
  closeOnEsc = true,
  closeOnOutside = true,
  onOpenChange,
  ...props
}: PopoverRootProps) {
  return (
    <Root
      onOpenChange={(open, eventDetails) => {
        if (!open) {
          if (eventDetails.reason === 'escape-key' && !closeOnEsc) {
            eventDetails.cancel();
            return;
          }
          if (eventDetails.reason === 'outside-press' && !closeOnOutside) {
            eventDetails.cancel();
            return;
          }
        }
        onOpenChange?.(open, eventDetails);
      }}
      {...props}
    />
  );
}

// Trigger/Portal/Title/Description/Close/Arrow は DS が足すものが無いのでそのまま re-export する。
const Trigger = BasePopover.Trigger;
const Portal = BasePopover.Portal;
const Title = BasePopover.Title;
const Description = BasePopover.Description;
const Close = BasePopover.Close;
const Arrow = BasePopover.Arrow;
export type PopoverTriggerProps = React.ComponentProps<typeof BasePopover.Trigger>;
export type PopoverPortalProps = React.ComponentProps<typeof BasePopover.Portal>;
export type PopoverTitleProps = React.ComponentProps<typeof BasePopover.Title>;
export type PopoverDescriptionProps = React.ComponentProps<typeof BasePopover.Description>;
export type PopoverCloseProps = React.ComponentProps<typeof BasePopover.Close>;
export type PopoverArrowProps = React.ComponentProps<typeof BasePopover.Arrow>;

export type PopoverPositionerProps = Omit<
  React.ComponentProps<typeof BasePopover.Positioner>,
  'className'
> & {
  mobileSheet?: boolean;
  className?: string;
};

function PopoverPositioner({
  mobileSheet = false,
  sideOffset = DEFAULT_SIDE_OFFSET,
  positionMethod,
  collisionPadding,
  className = '',
  ...props
}: PopoverPositionerProps) {
  return (
    <MobileSheetContext.Provider value={mobileSheet}>
      <BasePopover.Positioner
        sideOffset={sideOffset}
        positionMethod={mobileSheet ? 'fixed' : positionMethod}
        collisionPadding={mobileSheet ? MOBILE_SHEET_COLLISION_PADDING : collisionPadding}
        className={twMerge(POPOVER_POSITIONER_BASE, className)}
        {...props}
      />
    </MobileSheetContext.Provider>
  );
}

export type PopoverPopupProps = React.ComponentProps<typeof BasePopover.Popup> & {
  // 既定の内側 padding(p-3)を出すか。既定 true(v1 の panelPadding と同じ既定)。
  padding?: boolean;
  // 既定の最大高さ + 内部スクロール(max-h-80 overflow-y-auto)を出すか。既定 true
  // (v1 の panelScroll と同じ既定)。
  scroll?: boolean;
};

// padding / scroll は className で打ち消すのではなく **出す・出さないを prop で選ぶ**(#21)。
// 理由は POPOVER_POPUP_BASE のコメント参照(同一プロパティのユーティリティは配布 CSS の
// 出力順で決まるため、className を後ろに置いても打ち消せない)。
function PopoverPopup({ padding = true, scroll = true, className, ...props }: PopoverPopupProps) {
  const mobileSheet = useContext(MobileSheetContext);
  return (
    <BasePopover.Popup
      className={mergePopupClassName(popupBase({ padding, scroll, mobileSheet }), className)}
      {...props}
    />
  );
}

// Popover.Popup と Menu.Popup で同じ組み立てを共有する(menu.tsx から import する)。
export function popupBase({
  padding,
  scroll,
  mobileSheet,
}: {
  padding: boolean;
  scroll: boolean;
  mobileSheet: boolean;
}) {
  return twMerge(
    POPOVER_POPUP_BASE,
    padding ? POPOVER_POPUP_PADDING : '',
    scroll ? POPOVER_POPUP_SCROLL : '',
    mobileSheet ? MOBILE_SHEET_POPUP_CLASSNAME : '',
  );
}

// Base UI の className は `string | ((state) => string | undefined)` の union を受ける
// (状態に応じてクラスを変えられる)。関数形をそのまま文字列連結すると関数の実装が
// クラス名として埋め込まれてしまうので、形ごとに分けて合成する。
// 呼び出し側の className は必ず後ろに置く(className マージ規約)。
export function mergePopupClassName<S>(
  base: string,
  className: string | ((state: S) => string | undefined) | undefined,
): string | ((state: S) => string) {
  if (typeof className === 'function') {
    return (state: S) => twMerge(base, className(state) ?? '');
  }
  return twMerge(base, className ?? '');
}

export const Popover = {
  Root: PopoverRoot,
  Trigger,
  Portal,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Title,
  Description,
  Close,
  Arrow,
};

// 旧 API → 新 API 対応表(オーケストレーターが README/changeset へ転記する想定)
//
// <Popover open onClose trigger={<button/>} placement="bottom-start" ariaLabel role
//   panelClassName panelShadow panelPadding panelScroll mobileSheet portal closeOnEsc
//   closeOnOutside>{children}</Popover>
// ↓
// <Popover.Root open={open} onOpenChange={(o) => !o && onClose()} closeOnEsc={...}
//   closeOnOutside={...}>
//   <Popover.Trigger>...</Popover.Trigger>
//   {/* portal={true} 相当: Popover.Portal を挟む。portal={false} 相当: 挟まない */}
//   <Popover.Portal>
//     <Popover.Positioner side="bottom" align="start" mobileSheet={mobileSheet}>
//       <Popover.Popup aria-label={ariaLabel} className={panelClassName}>
//         {children}
//       </Popover.Popup>
//     </Popover.Positioner>
//   </Popover.Portal>
// </Popover.Root>
//
// placement のマッピング:
//   'bottom-start' → side="bottom" align="start"(既定)
//   'bottom-end'   → side="bottom" align="end"
//   'top-start'    → side="top"    align="start"
//   'top-end'      → side="top"    align="end"
//
// role="menu" 前提だった箇所は Popover.Popup に role を明示するか、Menu(menu.tsx)の
// Menu.Popup をそのまま使う形にする(role は Base UI Menu 側が自動で付与する)。
// panelPadding=false / panelScroll=false 相当は Popup の className で
// `p-0`（padding 打ち消し）/ `max-h-none overflow-visible`（スクロール打ち消し）を渡す。
