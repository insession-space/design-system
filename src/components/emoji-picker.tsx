import ReactEmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
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

// 縮小しているときだけ Popup の幅制約を外す。
// ⚠ DS の Popup は最小幅と最大幅を持つ。縮小時は「scale 後の実寸」を style.width で与えるので、
//   最大幅のほうが先に効いてしまい、overflow-hidden と相まって**ピッカーの右端が切れる**
//   （消費側 insession-app が同じ現象を踏んで同じ打ち消しを入れていた）。
// ⚠ 打ち消しには Tailwind v4 の**末尾 `!`** が要る。DS の指定と同じ utilities レイヤーに載るため、
//   勝敗は class 属性の並び順ではなく配布 CSS の出力順で決まり、important 無しでは勝てない。
const UNCLAMP_POPUP_WIDTH = 'min-w-0! max-w-none!';

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
  // 開いたときに検索欄へフォーカスするか。既定 false。
  // ⚠ true にするとモバイルで開いた瞬間にソフトキーボードが立ち上がり、肝心の絵文字グリッドが
  //   隠れる。「まず一覧を見たい」のが普通なので既定は false（消費側の実運用に合わせた）。
  autoFocusSearch?: boolean;
  // 肌の色の選択を出さない。**既定 true**。
  // ⚠ 既定で消しているのは、肌色選択ボタンだけ `--epr-*` のテーマ変数の対象外で、DS の面の上で
  //   単色のまま浮いて見えるため（消費側が実運用で無効化していた判断をそのまま採る）。
  //   肌色の出し分けが要る消費側は明示的に false を渡すこと。
  skinTonesDisabled?: boolean;
  // ピッカーの寸法。既定は emoji-picker-react の標準値に近い実用サイズ。
  // ⚠ `width` は **論理幅**（scale をかける前）。実際に画面が占める幅は width × 実効 scale。
  // ⚠ `height` は画面高さに収まるよう内部でクランプされる（下記 useFittedScale 参照）。
  // ⚠ **width は既定(320)から動かさないほうがよい。** emoji-picker-react の絵文字グリッドは
  //   列幅の整数倍 + 内側 padding で組まれており、値によっては端数が出て**横スクロールが生まれ、
  //   右端の列が切れる**（実測: 320 は はみ出し 0px、340 は 5px はみ出す）。ライブラリ内部の
  //   都合なので DS からは吸収できない。変えるなら実機で右端が切れないことを確認すること。
  height?: number;
  width?: number;
  // 基準倍率。既定 1（等倍）。画面幅が足りなければ内部でこれより小さく縮む。
  // ⚠ 常に画面へ収める方が正しい振る舞いなので、自動縮小は prop で切れない。等倍で溢れるより
  //   縮んで全部見えるほうが良い、という判断（消費側 insession-app #294 の実績）。
  scale?: number;
  // 自動縮小の下げ止まり。既定 0.6。これ以上小さいと絵文字が判別できなくなる。
  minScale?: number;
  // ライト/ダークの明示指定。省略時は `<html data-theme>` から自動で判定する。
  theme?: 'light' | 'dark';
  className?: string;
};

// ── 画面に収まる倍率と高さを決める ────────────────────────────
// 絵文字ピッカーは論理幅が固定（既定 320px）なので、狭い画面ではそのままだと画面外へはみ出す。
// 幅が足りないぶんだけ縮小して、常に全体が見える状態にする。
//
// ⚠ **`zoom` ではなく `transform: scale()` を使う。** `zoom` は要素自身のレイアウトを再計算する
// ため、内部の絵文字グリッドやカテゴリアイコンの位置がずれる（消費側 insession-app #294 で
// 実際に踏んで transform へ移した経緯がある）。
//
// ⚠ **測るのは開いたときの1回だけでよい。** 依存するのはビューポート寸法だけで、開いている
// 最中にリサイズされるケースまで追従する必要は薄い（Popover 側が位置は追従させる）。
// `useEffect` で測ると等倍で1フレーム描いてから縮むのが見えるので、レンダー中に同期で決める。
function useFittedScale({
  anchorRef,
  open,
  width,
  height,
  scale,
  minScale,
  collisionPadding,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  width: number;
  height: number;
  scale: number;
  minScale: number;
  collisionPadding: number;
}) {
  return useMemo(() => {
    // 閉じているときは測らない（描画もされない）。SSR でも window を触らずに済む。
    if (!open || typeof window === 'undefined') return { scale, height };
    // PiP 等で別ドキュメントに描かれている可能性があるので、トリガー自身の window を見る。
    const win = anchorRef.current?.ownerDocument?.defaultView ?? window;
    const availableWidth = win.innerWidth - collisionPadding * 2;
    const fitted = Math.max(minScale, Math.min(scale, availableWidth / width));
    // 高さは**縮小後**の画面に対して測る。scale で割るのは、ここで渡す height が
    // Picker の論理高さ（scale 前）だから。
    const availableHeight = (win.innerHeight - collisionPadding * 2) / fitted;
    return { scale: fitted, height: Math.min(height, availableHeight) };
  }, [anchorRef, open, width, height, scale, minScale, collisionPadding]);
}

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

// 縮小しているときだけ transform をかける器を挟む。
// ⚠ 等倍のときは **DOM を1つも増やさない**。無条件に <div> を挟むと Popup の直下構造が変わり、
//   縮小を使わない呼び出し側の描画にまで差分が出る。
//
// ⚠ **器は2枚要る。** `transform: scale()` は見た目だけを変え、**レイアウト上の寸法は論理値の
// ままになる**。1枚だけ（内側に transform）にすると、親から見た高さが縮小前のままなので
// Popup が中身より高くなり、下に大きな余白が出る（実測: scale 0.6 で popup=204x382 なのに
// 中身は 204x228 しか描かれず、154px の余白）。
// そこで **外側に「縮小後の寸法」を持つ器**を置いてレイアウトを確定させ、**内側は論理寸法 +
// transform** にする。はみ出しは外側の overflow:hidden がクリップする。
function PickerFrame({
  width,
  height,
  scale,
  shrunk,
  children,
}: {
  width: number;
  height: number;
  scale: number;
  shrunk: boolean;
  children: ReactNode;
}) {
  if (!shrunk) return <>{children}</>;
  return (
    <div style={{ width: width * scale, height: height * scale, overflow: 'hidden' }}>
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
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
  autoFocusSearch = false,
  skinTonesDisabled = true,
  height = 380,
  width = 320,
  scale = 1,
  minScale = 0.6,
  theme,
  className = '',
}: EmojiPickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const dark = useDsTheme(triggerRef, theme);
  const fitted = useFittedScale({
    anchorRef: triggerRef,
    open: isOpen,
    width,
    height,
    scale,
    minScale,
    collisionPadding: typeof collisionPadding === 'number' ? collisionPadding : 8,
  });
  // 等倍のときは余計な要素もクラスも足さない（既存の描画と完全に同じにする）。
  const shrunk = fitted.scale !== 1;

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
            className={`${PICKER_POPUP_CLASS} ${HIDE_CATEGORY_NAV} ${
              shrunk ? UNCLAMP_POPUP_WIDTH : ''
            } ${className}`
              .replace(/\s+/g, ' ')
              .trim()}
          >
            <PickerFrame width={width} height={fitted.height} scale={fitted.scale} shrunk={shrunk}>
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
                autoFocusSearch={autoFocusSearch}
                skinTonesDisabled={skinTonesDisabled}
                // 下部のプレビュー行は場所を取るわりに情報が薄いので出さない。
                previewConfig={{ showPreview: false }}
                // ⚠ どちらも**論理値**（scale 前）を渡す。実際の見た目の寸法は
                //   PickerFrame の transform が決める。
                height={fitted.height}
                width={width}
                style={PICKER_THEME_VARS}
              />
            </PickerFrame>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
