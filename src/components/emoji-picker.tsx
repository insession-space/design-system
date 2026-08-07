import ReactEmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import Icon from '../icons/icon.tsx';
import { Popover, type PopoverPortalProps, type PopoverPositionerProps } from './popover.tsx';

// 絵文字ピッカー(#190)。Popover で開き、選ばれた絵文字を `onSelect` で返す。リアクションの
// 追加にも、本文への絵文字挿入にも使える（DS はどちらの用途かを知らない）。
//
// ── なぜ DS が持つのか ─────────────────────────────────
// もとは消費側(insession-app の packages/space-core/message-action-bar.tsx)が
// `emoji-picker-react` を直接 import し、DS の Popover と自前で組み合わせていた。カテゴリナビの
// 表示不具合を潰す CSS も消費側に溜まっていた(#309)。同じ部品をリアクション用と本文挿入用で
// 2回組むことになるので、DS 側に1つ持つ。
//
// ⚠ `src/ui-kit/message-item.tsx` は「リアクションピッカーそのものは持たない(呼び出し側の
// 責務)」と書いているが、それは **MessageItem がピッカーを内蔵しない** という意味で、今も
// 変えていない。EmojiPicker は MessageItem とは独立したプリミティブで、両者を結び付けるのは
// 引き続き消費側（MessageItem の actionsSlot に置く等）。
//
// ── 見た目は CSS 変数で DS のトークンへ寄せる ─────────────────
// `emoji-picker-react` は `--epr-*` の CSS 変数で配色を外から差せる。これを DS のトークンに
// 繋ぐことで、ライト/ダークの切替にも消費側のトークン上書きにも自動で追従する。
// **クラス名で上書きしない**のが重要 — DS は「クラス文字列だけが全消費側に届く」配達経路で、
// 部品 CSS(components.css)は一部の消費側にしか届かない。inline の CSS 変数なら経路に依存しない。
//
// ⚠ ただしカテゴリナビの非表示だけは CSS 変数で表現できないため、Tailwind の任意セレクタで
// 当てる（下記 HIDE_CATEGORY_NAV）。これは**ユーティリティなのでクラス文字列として dist に
// 出る**ので、どちらの配達方式の消費側にも届く。
//
// ⚠ **このコメントに実際のクラス文字列を書かないこと。** Tailwind はコメントも区別なく走査
// するので、書くとそのクラスの CSS まで配布物に生成される（important 無しの古い記法を
// 説明として残していたら、使っていないルールが dist に混ざった）。

// カテゴリナビ(絵文字グリッド上部のカテゴリアイコン列)は、幅・transform:scale・emojiStyle・
// devicePixelRatio のどの組み合わせでも隣接カテゴリのアイコンが欠ける描画不具合があり、消費側は
// 丸ごと非表示にして運用していた(#309)。DS 側の既定として取り込む。検索があるので実用上困らない。
//
// ⚠ **末尾の `!`(important)は必須。外すと効かない。** 配布 CSS のユーティリティは
// `@layer utilities` の中にある一方、`emoji-picker-react` は flairup で **`<head>` へ動的に
// CSS を注入する = レイヤーに属さない(unlayered)**。CSS のカスケードではレイヤー内の宣言は
// **詳細度に関係なく** unlayered の宣言に負けるため、`.epr-category-nav{display:flex}` に
// 勝てない(important 無しで実測したところナビが出たままだった)。important なら勝つ。
// Tailwind v4 の important は**末尾** `!`（`hidden!`）。
const HIDE_CATEGORY_NAV = '[&_.epr-category-nav]:hidden!';

// Popup の既定 padding は Picker 自身が内側に余白を持つぶん二重になるので出さない。
// overflow-hidden は Popup の角丸から Picker の四角い面がはみ出さないようにするため。
const PICKER_POPUP_CLASS = 'overflow-hidden';

// `--epr-*` を DS トークンへ繋ぐ。背景と枠は Popover.Popup 側が既に持っているので透明にして、
// ピッカーが二重の面を作らないようにする。
const PICKER_THEME_VARS = {
  '--epr-bg-color': 'transparent',
  '--epr-picker-border-color': 'transparent',
  '--epr-text-color': 'var(--color-text)',
  '--epr-hover-bg-color': 'var(--color-surface-hover)',
  '--epr-focus-bg-color': 'var(--color-surface-hover)',
  '--epr-highlight-color': 'var(--color-accent)',
  '--epr-search-input-bg-color': 'var(--color-surface)',
  '--epr-search-input-bg-color-active': 'var(--color-surface)',
  '--epr-search-input-text-color': 'var(--color-text)',
  '--epr-search-input-placeholder-color': 'var(--color-text-faint)',
  '--epr-search-border-color': 'var(--color-border)',
  '--epr-category-label-bg-color': 'var(--color-bg-elevated)',
  '--epr-category-label-text-color': 'var(--color-text-dim)',
  '--epr-emoji-variation-picker-bg-color': 'var(--color-surface)',
  '--epr-horizontal-padding': '8px',
} as CSSProperties;

export type EmojiPickerProps = {
  // 絵文字が選ばれたときに呼ぶ。渡るのは絵文字そのもの("🙂")。
  onSelect: (emoji: string) => void;
  // トリガーの読み上げラベル(aria-label)。絵文字アイコンだけでは用途が伝わらないため必須。
  triggerLabel: string;
  // トリガーの中身。省略時は add_reaction アイコン。
  // ⚠ トリガーは **DS の IconButton ではなく素の Popover.Trigger** として描く。消費側には
  //   IconButton の面や寸法を持ち込みたくない既存のアクション行があり(insession-app #1146)、
  //   固定すると移植できなくなるため。見た目は triggerClassName で全て差し替えられる。
  children?: ReactNode;
  triggerClassName?: string;
  // 開閉を消費側が持ちたい場合(controlled)。省略時は内部で持つ。
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // ポータル先のコンテナ。Picture-in-Picture のように**別ドキュメントへ描画する**ケースで必要。
  // ⚠ `emoji-picker-react` はスタイルを JS から注入する(flairup)ため、別ドキュメントへ出すと
  //   配色が当たらないことがある。その場合は消費側でそのドキュメントへスタイルを複製すること。
  container?: PopoverPortalProps['container'];
  side?: PopoverPositionerProps['side'];
  align?: PopoverPositionerProps['align'];
  sideOffset?: PopoverPositionerProps['sideOffset'];
  collisionPadding?: PopoverPositionerProps['collisionPadding'];
  // 検索欄のプレースホルダ。DS は i18n を持たないので消費側が文字列を渡す。
  searchPlaceholder?: string;
  // 検索欄を出さない。
  searchDisabled?: boolean;
  // 肌の色の選択を出さない。
  skinTonesDisabled?: boolean;
  // ピッカーの寸法。既定は emoji-picker-react の標準値に近い実用サイズ。
  height?: number;
  width?: number;
  // ライト/ダークの明示指定。省略時は `<html data-theme>` から自動で判定する。
  theme?: 'light' | 'dark';
  className?: string;
};

// DS のテーマは `<html data-theme="light">` のときだけライトで、`dark` と**属性なし**は
// どちらもダーク(theme.css 冒頭のコメント参照)。`prefers-color-scheme` は見ていないので、
// emoji-picker-react の Theme.AUTO は使えない — data-theme を直接読んで追従させる。
function useDsTheme(anchorRef: React.RefObject<HTMLElement | null>, override?: 'light' | 'dark') {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (override) return undefined;
    // PiP 等で別ドキュメントに描かれている可能性があるので、トリガー自身の document を見る。
    const doc = anchorRef.current?.ownerDocument ?? document;
    const root = doc.documentElement;
    const read = () => setDark(root.dataset.theme !== 'light');
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [anchorRef, override]);

  if (override) return override === 'dark';
  return dark;
}

export default function EmojiPicker({
  onSelect,
  triggerLabel,
  children,
  triggerClassName = '',
  open,
  onOpenChange,
  container,
  side = 'bottom',
  align = 'end',
  sideOffset = 6,
  collisionPadding = 8,
  searchPlaceholder,
  searchDisabled = false,
  skinTonesDisabled = false,
  height = 380,
  width = 320,
  theme,
  className = '',
}: EmojiPickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const dark = useDsTheme(triggerRef, theme);

  function handleOpenChange(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger ref={triggerRef} className={triggerClassName} aria-label={triggerLabel}>
        {children ?? <Icon name="add_reaction" size={18} />}
      </Popover.Trigger>
      {/* ⚠ Popover.Portal は省略できない（無いとレンダー中に throw する）。popover.tsx 参照。 */}
      <Popover.Portal container={container}>
        <Popover.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
        >
          <Popover.Popup
            padding={false}
            // ⚠ scroll={false} は必須。既定の POPOVER_POPUP_SCROLL(`max-h-80 overflow-y-auto`)が
            //   付いたままだと、**Picker の height 指定が 320px で切られたうえ Popup 側にも
            //   スクロールバーが出て二重になる**（実測: height=380 を渡しても Popup の実高が
            //   320px、スクロールバーが2本）。スクロールは Picker が内部で持っている。
            scroll={false}
            aria-label={triggerLabel}
            className={`${PICKER_POPUP_CLASS} ${HIDE_CATEGORY_NAV} ${className}`.trim()}
          >
            <ReactEmojiPicker
              onEmojiClick={(data) => {
                onSelect(data.emoji);
                handleOpenChange(false);
              }}
              // OS 内蔵の絵文字で描く。画像版(APPLE/GOOGLE 等)は CDN から画像を取りに行くため、
              // network を持たない DS の方針に反する。
              emojiStyle={EmojiStyle.NATIVE}
              theme={dark ? Theme.DARK : Theme.LIGHT}
              searchPlaceHolder={searchPlaceholder}
              searchDisabled={searchDisabled}
              skinTonesDisabled={skinTonesDisabled}
              // 下部のプレビュー行は場所を取るわりに情報が薄いので出さない。
              previewConfig={{ showPreview: false }}
              height={height}
              width={width}
              style={PICKER_THEME_VARS}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
