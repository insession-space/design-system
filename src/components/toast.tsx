// ⚠ `useToastManager` は `@base-ui/react/toast` のトップレベルからは **型としてしか**
// export されていない（index.d.ts が `export type * from "./useToastManager.js"`）。
// 値として使うには名前空間経由（BaseToast.useToastManager）で参照する。

import type { ToastObject } from '@base-ui/react/toast';
import { Toast as BaseToast } from '@base-ui/react/toast';
import type * as React from 'react';
import type { ReactNode } from 'react';
import Icon from '../icons/icon.tsx';

const useToastManager = BaseToast.useToastManager;

// トースト / スナックバー。振る舞い（キュー・自動 dismiss・スワイプで閉じる・重ね表示・
// aria-live リージョン）を Base UI の Toast へ委譲する（#23）。DS 側は見た目だけを持つ。
//
// ── 移行に伴う破壊的変更（2.x → 3.0）─────────────────────
// **`<Toast title=… />` を自分で置く使い方は廃止した。** Base UI の Toast は
// 「Provider が持つキューに add して、Viewport が描画する」命令的 API で、
// ToastRoot は `toast` オブジェクトと ToastProviderContext を要求する（見た目部品として
// 単体で置くことはできない）。
//
//   // 2.x — 表示制御は消費側が useState で持っていた
//   {show && <Toast tone="success" title="保存しました" onClose={() => setShow(false)} />}
//
//   // 3.0 — アプリのルートに Provider + Viewport を1度だけ置く
//   <Toast.Provider>
//     <App />
//     <Toast.Viewport />
//   </Toast.Provider>
//
//   // 呼び出し側
//   const toast = Toast.useToast();
//   toast.add({ title: '保存しました', data: { tone: 'success' } });
//
// これで移行前は無かった **キュー管理・timeout による自動 dismiss・スワイプで閉じる・
// 複数トーストの重ね表示・aria-live リージョンへの通知** が付いた。移行前は role="status"
// を要素に直接置いていただけで、後から出たトーストが読み上げられる保証が無かった。
//
// ⚠ DS は本来「アプリ依存を持たない純粋 leaf UI」の方針だが、Toast だけは Provider を
// 持つ（＝消費側のアプリ構造に踏み込む）。キュー管理を伴う通知はアプリ全体で1つの
// 出口を共有する必要があり、部品単体では成立しないため。方針からの意図的な逸脱。

export type ToastTone = 'success' | 'error' | 'info' | 'warn' | 'danger';
export type ToastVariant = 'default' | 'snackbar';

// add({ data }) に載せる DS 固有の表示情報。Base UI 側の型引数として使う。
export type ToastData = {
  tone?: ToastTone;
  // 見た目のバリアント。既定 'default'（DS トースト）。'snackbar' は legacy .snackbar 互換パレット。
  variant?: ToastVariant;
  // 行頭アイコン（省略可）。色は tone に追従する。
  icon?: ReactNode;
};

// snackbar variant の tone→(border 色 / icon 色) マップ。
const SNACKBAR_TONE: Record<ToastTone, { border: string; icon: string }> = {
  success: { border: 'border-border-strong', icon: 'text-success' },
  error: { border: 'border-snackbar-danger-border', icon: 'text-snackbar-danger' },
  info: { border: 'border-border-strong', icon: 'text-success' },
  warn: { border: 'border-border-strong', icon: 'text-warning' },
  danger: { border: 'border-snackbar-danger-border', icon: 'text-snackbar-danger' },
};

// DS(default) variant の tone→(左ボーダー色 / 前景色)。error は danger の別名。
const DS_TONE: Record<ToastTone, { border: string; text: string }> = {
  info: { border: 'border-l-info', text: 'text-info' },
  success: { border: 'border-l-success', text: 'text-success' },
  warn: { border: 'border-l-warning', text: 'text-warning' },
  danger: { border: 'border-l-danger', text: 'text-danger' },
  error: { border: 'border-l-danger', text: 'text-danger' },
};

// 画面下部中央の固定表示。移行前は個々の Toast が自分で fixed していたが、Base UI では
// Viewport が1つだけ固定され、その中にトーストが積まれる。位置（bottom 26px / 中央）と
// z-index は移行前の FIXED 定数と同じ値を使う。
const VIEWPORT =
  'fixed bottom-[26px] left-1/2 -translate-x-1/2 z-(--z-snackbar) flex flex-col items-center gap-2';

// 入場アニメーションは移行前と同じ snackbar-in。Base UI は開閉の状態を
// data-starting-style / data-ending-style で出す。
//
// ⚠ **閉じ側（data-ending-style）のスタイルを必ず定義すること。** Base UI は
// 「入場アニメーションがある要素は退場も待つ」判断をするため、starting だけ定義して
// ending を書かないと、閉じたトーストが `data-ending-style` を付けたまま **DOM から
// 消えずに残り続ける**（実測でこれを踏んだ。close ボタンは効いているのに画面から
// 消えないので、キューが詰まったように見える）。ここでは opacity のトランジションを
// 当てて、transitionend で unmount まで到達させている。
const ROOT_MOTION =
  'transition-opacity duration-(--dur-fast) data-starting-style:animate-[snackbar-in_var(--dur-slow)_var(--ease-spring)_both] data-ending-style:opacity-0';

const SNACKBAR_ROOT =
  'inline-flex items-center gap-[9px] rounded-pill border border-solid bg-snackbar-surface px-5 py-[11px] text-[14px] text-text shadow-overlay';
const DS_ROOT =
  'inline-flex min-w-[280px] max-w-[420px] items-start gap-3 rounded-md border border-solid border-border border-l-[3px] bg-surface px-[15px] py-[13px] text-text shadow-popover';

// アプリのルートに1度だけ置く。キューの実体はここが持つ。
const Provider = BaseToast.Provider;
export type ToastProviderProps = React.ComponentProps<typeof BaseToast.Provider>;

export type ToastViewportProps = {
  className?: string;
};

// トーストが積まれる場所。Provider の中に1つ置く。
function Viewport({ className = '' }: ToastViewportProps) {
  const { toasts } = useToastManager<ToastData>();
  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className={`${VIEWPORT} ${className}`.trim()}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

function ToastItem({ toast }: { toast: ToastObject<ToastData> }) {
  const { tone = 'success', variant = 'default', icon } = toast.data ?? {};

  // snackbar は legacy .snackbar を1pxも変えずに再現する（pill / description ベース）。
  if (variant === 'snackbar') {
    const t = SNACKBAR_TONE[tone];
    return (
      <BaseToast.Root toast={toast} className={`${SNACKBAR_ROOT} ${t.border} ${ROOT_MOTION}`}>
        {icon && (
          <span className={`${t.icon} text-[13px] font-extrabold`} aria-hidden="true">
            {icon}
          </span>
        )}
        <BaseToast.Description />
      </BaseToast.Root>
    );
  }

  // DS default: surface + 左3px tone ボーダー + radius-md + shadow-popover。
  const t = DS_TONE[tone];
  return (
    <BaseToast.Root toast={toast} className={`${DS_ROOT} ${t.border} ${ROOT_MOTION}`}>
      {icon && (
        <span className={`mt-px shrink-0 ${t.text}`} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <BaseToast.Title className="text-[13.5px] font-bold text-text" />
        <BaseToast.Description className="text-[12.5px] leading-[1.5] text-text-dim" />
      </div>
      {toast.actionProps && (
        <BaseToast.Action
          className={`shrink-0 whitespace-nowrap border-none bg-transparent text-[12.5px] font-bold ${t.text} cursor-pointer`}
        />
      )}
      <BaseToast.Close
        aria-label="close"
        className="shrink-0 inline-flex border-none bg-transparent p-0 text-text-dim cursor-pointer"
      >
        <Icon name="close" size={17} />
      </BaseToast.Close>
    </BaseToast.Root>
  );
}

export const Toast = {
  Provider,
  Viewport,
  // 呼び出し側はこれで add / close / update / promise を使う。
  // Base UI の useToastManager をそのまま出す（DS の ToastData で型付けした版）。
  useToast: () => useToastManager<ToastData>(),
};
