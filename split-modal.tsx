import { type ReactNode, useEffect, useState } from 'react';
import BottomSheet from './bottom-sheet.tsx';
import Icon, { type IconName } from './icons/icon.tsx';
import Modal from './modal.tsx';

// 設定系モーダルの2ペイン外殻（純粋 leaf UI）。左にセクションナビ、右にそのセクションの中身。
// スペース設定(space-core)とアカウント設定(account)が同じ nav 構造を各々でベタ書きしていたのを
// ここに集約する。i18n はこのパッケージに持たないため、ラベルは全て props で注入する。
//
// 広い画面: nav(固定幅) + コンテンツ の横並び。従来の見た目と同じ。
// 狭い画面: 横に並べると両方使えない幅になるため、レイアウトごと差し替えて
//   「セクション一覧 → タップで詳細（戻る導線つき）」のドリルダウンにする。
//   ネイティブの設定アプリと同じ体験で、セクションが何個あっても破綻しない。
//
// ナビ行は .settings-nav-item を使う。状態(hover/active)を内包する共有プリミティブは
// クラスのまま再利用する方針（STYLE_GUIDE / #59 の移行パターン）に従う。

export type SplitModalItem = {
  id: string;
  label: string;
  // ドリルダウン一覧の行頭に出すアイコン（広い画面のナビでは使わない）。
  icon?: IconName;
};

export type SplitModalProps = {
  items: SplitModalItem[];
  // 選択中のセクション id。
  value: string;
  onSelect: (id: string) => void;
  // 右ペイン（選択中セクションの中身）。
  children: ReactNode;
  onClose: () => void;
  // nav の aria-label。
  navLabel: string;
  // ダイアログの aria-label。
  ariaLabel?: string;
  // × 閉じるボタンの aria ラベル。
  closeLabel?: string;
  // ドリルダウン詳細の「戻る」の aria ラベル。
  backLabel?: string;
  // 外殻を BottomSheet にする（モバイルのスペース固有機能。#581 6b）。既定は中央 Modal。
  asSheet?: boolean;
  // Modal 外殻の幅。
  width?: string;
  // 外殻に足す追加クラス。
  className?: string;
  // ドリルダウンに切り替える判定の上書き。省略時はビューポート幅で自動判定する。
  narrow?: boolean;
};

// ビューポートが狭いか。既存の設定モーダルが使っていた 560px を境界に合わせる。
//
// matchMedia の change だけに頼らないのは、iframe を属性でリサイズすると matches は変わるのに
// change イベントが発火しないため（プレビュー/埋め込み環境で切り替わらなくなる）。
// resize と ResizeObserver を併せて張る。
function useNarrowViewport(maxWidth: number) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const sync = () => setNarrow(window.innerWidth <= maxWidth);
    sync();
    const mq = window.matchMedia?.(`(max-width: ${maxWidth}px)`);
    mq?.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    ro?.observe(document.documentElement);
    return () => {
      mq?.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
      ro?.disconnect();
    };
  }, [maxWidth]);
  return narrow;
}

export default function SplitModal({
  items,
  value,
  onSelect,
  children,
  onClose,
  navLabel,
  ariaLabel,
  closeLabel,
  backLabel,
  asSheet = false,
  width = 'min(760px, 94vw)',
  className = '',
  narrow,
}: SplitModalProps) {
  const autoNarrow = useNarrowViewport(560);
  const isNarrow = narrow ?? autoNarrow;
  // ドリルダウンで詳細を開いているか。広い画面へ戻ったら一覧状態に畳んでおく
  // （次に狭くなったときに一覧から始まる）。
  const [drilled, setDrilled] = useState(false);
  useEffect(() => {
    if (!isNarrow) setDrilled(false);
  }, [isNarrow]);

  const current = items.find((it) => it.id === value);

  // 狭い画面: セクション一覧（詳細は開いていない）
  const list = (
    <nav className="flex flex-col flex-1 min-h-0 overflow-y-auto" aria-label={navLabel}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className="flex items-center gap-3 w-full text-left px-4 py-3.5 bg-transparent border-none border-b border-solid border-border text-base font-semibold text-text cursor-pointer"
          onClick={() => {
            onSelect(it.id);
            setDrilled(true);
          }}
        >
          {it.icon && (
            <span className="shrink-0 text-mint-soft" aria-hidden="true">
              <Icon name={it.icon} size={20} />
            </span>
          )}
          <span className="flex-1 min-w-0">{it.label}</span>
          <span className="shrink-0 text-lg text-text-faint" aria-hidden="true">
            ›
          </span>
        </button>
      ))}
    </nav>
  );

  // 狭い画面: 選択したセクションの詳細（上部に戻る導線）
  const detail = (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 shrink-0 pb-3 border-b border-solid border-border">
        <button
          type="button"
          aria-label={backLabel}
          title={backLabel}
          onClick={() => setDrilled(false)}
          className="inline-flex items-center justify-center h-8 w-8 -ml-1.5 rounded-chip border-none bg-transparent text-text-dim cursor-pointer enabled:hover:bg-surface-hover enabled:hover:text-text"
        >
          <Icon name="chevron_left" size={20} />
        </button>
        <span className="flex-1 min-w-0 text-base font-bold text-text">{current?.label}</span>
      </div>
      <div className="flex flex-col gap-[18px] flex-1 min-w-0 min-h-0 overflow-y-auto mx-[-6px] px-1.5 pt-3.5 pb-0.5">
        {children}
      </div>
    </div>
  );

  // 広い画面: 従来どおり nav(148px) + コンテンツの横並び
  const wide = (
    <>
      <nav className="flex flex-col gap-1 flex-[0_0_148px]" aria-label={navLabel}>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`settings-nav-item${it.id === value ? ' active' : ''}`}
            onClick={() => onSelect(it.id)}
          >
            {it.label}
          </button>
        ))}
      </nav>
      <div className="flex flex-col gap-[18px] flex-[1_1_auto] min-w-0 min-h-0 overflow-y-auto mx-[-6px] px-1.5 py-0.5">
        {children}
      </div>
    </>
  );

  // asSheet はシート側でスクロールさせるので固定高を持たせない。
  const innerClass = isNarrow
    ? 'flex flex-col flex-1 min-h-0'
    : asSheet
      ? 'flex gap-5 flex-1 min-h-0'
      : 'flex gap-5 flex-[1_1_auto] min-h-0 max-h-[min(520px,72dvh)] h-[min(520px,72dvh)]';

  const inner = <div className={innerClass}>{isNarrow ? (drilled ? detail : list) : wide}</div>;

  if (asSheet) {
    return (
      <BottomSheet open onClose={onClose} ariaLabel={ariaLabel} closeLabel={closeLabel}>
        <div className="bottom-sheet-settings">{inner}</div>
      </BottomSheet>
    );
  }

  return (
    <Modal
      onClose={onClose}
      width={width}
      className={`text-left max-h-[calc(100dvh-40px)] ${className}`.trim()}
      ariaLabel={ariaLabel}
      closeLabel={closeLabel}
    >
      {inner}
    </Modal>
  );
}
