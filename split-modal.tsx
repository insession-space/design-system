import { type ReactNode, useEffect, useState } from 'react';
import BottomSheet from './bottom-sheet.tsx';
import Icon, { type IconName } from './icons/icon.tsx';
import Modal from './modal.tsx';

// 設定系モーダルの2ペイン外殻（純粋 leaf UI）。左にセクションナビ、右にそのセクションの中身。
// スペース設定(space-core)とアカウント設定(account)が同じ nav 構造を各々でベタ書きしていたのを
// ここに集約する（#842）。i18n はこのパッケージに持たないため、ラベルは全て props で注入する。
//
// 見た目は DS（INSESSION Design System）の components/panels/SplitModal に準拠する（#835）。
// 左レールは DS の surface-2（repo では bg-elevated）の面 + 右境界線で、右ペイン（surface）とは
// 面の段差で分かれる。アクティブ行は surface-3 + border + 本文色で、accent はアイコンにだけ乗せる
// （行全体を accent で塗らない＝「控えめ・洗練」の方針）。
//
// 広い画面: レール(既定214px) + コンテンツ の横並び。
// 狭い画面: 横に並べると両方使えない幅になるため、レイアウトごと差し替えて
//   「セクション一覧 → タップで詳細（戻る導線つき）」のドリルダウンにする。
//   ネイティブの設定アプリと同じ体験で、セクションが何個あっても破綻しない。

export type SplitModalItem = {
  id: string;
  label: string;
  // 行頭に出すアイコン。DS ではレール・ドリルダウン一覧の両方で使う。
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
  // レール上部の見出し（例「設定」）。省略すると見出し行を出さない。
  navTitle?: string;
  // レール下部に固定される補足文。
  navFooter?: ReactNode;
  // 右ペインの見出し。省略すると見出し行を出さない（children が自前で持つ場合）。
  title?: string;
  // 右ペイン見出しの下の説明文。
  description?: string;
  // 右ペイン下部のアクション行。省略時は行ごと出ない（設定は即時反映のため通常は省略する）。
  footer?: ReactNode;
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
  // 左レールの幅（border-box）。
  navWidth?: number;
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
  navTitle,
  navFooter,
  title,
  description,
  footer,
  ariaLabel,
  closeLabel,
  backLabel,
  asSheet = false,
  width = 'min(760px, 94vw)',
  navWidth = 214,
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

  const closeButton = closeLabel ? (
    <button
      type="button"
      aria-label={closeLabel}
      title={closeLabel}
      onClick={onClose}
      // legacy の button ベーススタイルが左右 padding を持つため p-0 で潰す。潰さないと
      // ボタンが横に広がったうえ、フレックス収縮でアイコンの svg が幅0になり見えなくなる。
      className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-chip border-none bg-transparent p-0 text-text-dim cursor-pointer [&>svg]:shrink-0 enabled:hover:bg-surface-hover enabled:hover:text-text"
    >
      <Icon name="close" size={19} />
    </button>
  ) : null;

  // 右ペインの見出し行（DS の sm-head）。title を渡さない消費側でも × は要るので、
  // その場合は×だけの右寄せ行として描画する。
  const paneHead =
    title || closeButton ? (
      <div className="flex shrink-0 items-start justify-between gap-3">
        {title ? (
          <div className="min-w-0">
            <h4 className="m-0 text-lg font-extrabold text-text">{title}</h4>
            {description && (
              <p className="mt-1.5 mb-0 max-w-[52ch] text-[13px] leading-relaxed text-text-dim">
                {description}
              </p>
            )}
          </div>
        ) : (
          <span />
        )}
        {closeButton}
      </div>
    ) : null;

  // 狭い画面: セクション一覧（詳細は開いていない）
  const list = (
    <div className="flex flex-1 min-h-0 flex-col">
      {(navTitle || closeButton) && (
        <div className="flex shrink-0 items-center gap-2.5 border-b border-solid border-border bg-bg-elevated px-3.5 py-3">
          <span className="min-w-0 flex-1 text-sm font-extrabold text-text">{navTitle}</span>
          {closeButton}
        </div>
      )}
      <nav className="flex flex-1 min-h-0 flex-col overflow-y-auto" aria-label={navLabel}>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 border-none border-b border-solid border-border bg-transparent px-4 py-3.5 text-left text-base font-semibold text-text"
            onClick={() => {
              onSelect(it.id);
              setDrilled(true);
            }}
          >
            {it.icon && (
              <span className="shrink-0 text-accent" aria-hidden="true">
                <Icon name={it.icon} size={20} />
              </span>
            )}
            <span className="min-w-0 flex-1">{it.label}</span>
            <span className="shrink-0 text-lg text-text-faint" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </nav>
    </div>
  );

  // 狭い画面: 選択したセクションの詳細（上部に戻る導線）
  const detail = (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-solid border-border bg-bg-elevated px-3.5 py-3">
        <button
          type="button"
          aria-label={backLabel}
          title={backLabel}
          onClick={() => setDrilled(false)}
          className="-ml-1.5 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-chip border-none bg-transparent p-0 text-text-dim [&>svg]:shrink-0 enabled:hover:bg-surface-hover enabled:hover:text-text"
        >
          <Icon name="chevron_left" size={20} />
        </button>
        <span className="min-w-0 flex-1 text-sm font-extrabold text-text">{current?.label}</span>
        {closeButton}
      </div>
      <div className="flex flex-1 min-w-0 min-h-0 flex-col gap-[18px] overflow-y-auto px-4 pt-4 pb-1">
        {description && (
          <p className="m-0 text-[13px] leading-relaxed text-text-dim">{description}</p>
        )}
        {children}
      </div>
      {footer && (
        <div className="flex shrink-0 justify-end gap-2.5 border-t border-solid border-border bg-bg-elevated px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );

  // 広い画面: レール + コンテンツの横並び（DS 準拠）
  const wide = (
    <>
      <aside
        className="flex shrink-0 flex-col gap-5 self-stretch border-r border-solid border-border bg-bg-elevated px-4 py-[22px]"
        style={{ width: navWidth }}
      >
        {navTitle && <h3 className="m-0 px-1 text-[15px] font-extrabold text-text">{navTitle}</h3>}
        <nav className="flex flex-col gap-1" aria-label={navLabel}>
          {items.map((it) => {
            const active = it.id === value;
            return (
              <button
                key={it.id}
                type="button"
                aria-selected={active}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md border border-solid px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                  active
                    ? 'border-border bg-surface-3 font-bold text-text'
                    : 'border-transparent bg-transparent font-semibold text-text-dim hover:bg-surface-hover hover:text-text'
                }`}
                onClick={() => onSelect(it.id)}
              >
                {it.icon && (
                  <span
                    className={`shrink-0 ${active ? 'text-accent' : 'text-text-faint'}`}
                    aria-hidden="true"
                  >
                    <Icon name={it.icon} size={17} />
                  </span>
                )}
                <span className="min-w-0 flex-1">{it.label}</span>
              </button>
            );
          })}
        </nav>
        {navFooter && (
          <div className="mt-auto px-1 text-xs leading-relaxed text-text-faint">{navFooter}</div>
        )}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-1 min-w-0 min-h-0 flex-col gap-[18px] overflow-y-auto px-[26px] py-6">
          {paneHead}
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2.5 border-t border-solid border-border bg-bg-elevated px-[26px] py-3.5">
            {footer}
          </div>
        )}
      </div>
    </>
  );

  // asSheet はシート側でスクロールさせるので固定高を持たせない。
  const innerClass = isNarrow
    ? 'flex flex-col flex-1 min-h-0'
    : asSheet
      ? 'flex flex-1 min-h-0'
      : 'flex flex-[1_1_auto] min-h-0 max-h-[min(520px,72dvh)] h-[min(520px,72dvh)]';

  const inner = <div className={innerClass}>{isNarrow ? (drilled ? detail : list) : wide}</div>;

  if (asSheet) {
    // シートは自前の×とスクロール領域を持つので、closeLabel はシート側へ渡す。
    return (
      <BottomSheet open onClose={onClose} ariaLabel={ariaLabel} closeLabel={closeLabel}>
        <div className="flex flex-1 min-h-0 flex-col">{inner}</div>
      </BottomSheet>
    );
  }

  // レールの面を外殻の角丸まで届かせるため、legacy .modal の padding/gap を潰して
  // overflow-hidden を掛ける（utilities レイヤーは legacy より後なので上書きできる）。
  // × は Modal の絶対配置ではなく右ペイン内（DS の位置）に置くので closeLabel は渡さない。
  return (
    <Modal
      onClose={onClose}
      width={width}
      className={`gap-0 overflow-hidden p-0 text-left max-h-[calc(100dvh-40px)] ${className}`.trim()}
      ariaLabel={ariaLabel}
    >
      {inner}
    </Modal>
  );
}
