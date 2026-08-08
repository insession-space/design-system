import type { ReactNode, RefObject } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { twMerge } from '../lib/tw-merge.ts';
import { Popover, type PopoverPositionerProps } from './popover.tsx';

// テキスト入力欄の中でトリガー文字を打つと候補を出すサジェストの**共通実装**（#190）。
//
// ── なぜ切り出したのか ─────────────────────────────────
// もとは `mention.tsx`（#177）が `@` サジェストとして持っていた実装。`:` の絵文字ショートコード
// 補完（#190）が必要になったとき、**違うのは1行の見た目だけ**で、トリガー検出・キャレット
// 追従・キーボード操作・ARIA・Popover の組み方は完全に同一だった。ここには実測でしか辿り
// 着けない知見（下記の「native リスナ」「document のバブル段階」等）が詰まっていて、コピーすると
// 片方だけ直して片方が腐る。そこで**行の描画だけを `renderItem` に出した汎用部品**にして、
// Mention と EmojiSuggest の両方がこれを使う。
//
// ⚠ **入力欄の value は消費側が所有する。** このコンポーネントは inputRef から value と
// selectionStart を **読むだけ**で、書き換えない。確定時は「どの範囲を置き換えるべきか」を
// onSelect(item, range) で渡し、実際の置換は消費側が行う。こうしているのは、
//   (1) 入力欄が controlled(React state)である以上、DOM を直接書き換えると state と乖離する
//   (2) 置換後のテキスト整形（末尾に空白を足すか等）はアプリごとに違い、DS が決めると必ず
//       どこかで合わなくなる
// の2点による。

// トリガーから遡る最大文字数。長い1行の入力で毎キーストロークに全文走査させないための上限。
const MAX_QUERY_LENGTH = 64;

// input.value 上の置換対象範囲 [start, end)。start はトリガー文字自身の位置。
export type SuggestRange = { start: number; end: number };

// 候補行の最小要件。id は React の key と ARIA の id に使う。
export type SuggestItem = {
  id: string;
  // ハイライトは通り、確定だけできない行。
  disabled?: boolean;
};

export type SuggestProps<T extends SuggestItem> = {
  // 監視対象の入力欄。value / selectionStart を読むだけで書き換えない。
  inputRef: RefObject<HTMLTextAreaElement | null> | RefObject<HTMLInputElement | null>;
  // 候補。消費側が query で絞った結果を渡す。
  items: T[];
  // 検出した query の変化。null は入力中でない状態。
  // ⚠ query が実際に変わったときだけ呼ぶ（毎イベントでは呼ばない）ので、
  //   これを setState に直結しても再レンダーのループにはならない。
  onQueryChange: (query: string | null) => void;
  // 候補の確定。range は input.value 上の置換対象（トリガー文字を含む）。
  onSelect: (item: T, range: SuggestRange) => void;
  // 発火する文字。日本語入力では全角が残ることが多いので、呼び出し側で両方を渡す想定。
  triggers: readonly string[];
  // 1行の見た目。行の器（role="option" やハイライト）はこちらが持つので、**中身だけ**返す。
  renderItem: (item: T) => ReactNode;
  // 候補0件のときに出す文言。省略すると 0 件では何も出さずに閉じる。
  emptyLabel?: string;
  ariaLabel?: string;
  // 候補パネルを寄せる基準要素。省略時は inputRef（入力欄そのもの）。
  anchor?: PopoverPositionerProps['anchor'];
  // 候補パネルを出す向き。チャット入力は画面下端にあることが多いので既定は 'top'。
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  // 1行の追加クラス。ハイライト色などの共通部分はこの中で当てるので、呼び出し側は
  // 行の内側のレイアウトだけを renderItem で持てばよい。
  rowClassName?: string;
  className?: string;
};

// 空白判定。`\s` は改行も含む。
function isSpace(ch: string) {
  return /\s/.test(ch);
}

// caret 直前から遡って「今まさに入力中のトリガー」を1つ見つける純粋関数。
// - 空白に当たったら打ち切り（トリガーの後ろに空白が入った時点で入力は終わり）
// - トリガーが有効なのは**行頭 or 空白の直後**だけ。`foo@example.com` の `@` では発火しない。
//   `:` ではこの制約がなお重要で、これが無いと `http://` や `12:34` で候補が開いてしまう。
export function findActiveTrigger(value: string, caret: number, triggers: readonly string[]) {
  const floor = Math.max(0, caret - MAX_QUERY_LENGTH - 1);
  for (let i = caret - 1; i >= floor; i--) {
    const ch = value[i];
    if (isSpace(ch)) return null;
    if (triggers.includes(ch)) {
      const before = i > 0 ? value[i - 1] : '';
      if (before !== '' && !isSpace(before)) return null;
      return { start: i, end: caret, query: value.slice(i + 1, caret) };
    }
  }
  return null;
}

// 有効な（確定できる）行のうち、from から delta 方向で最初に見つかるものの index。
// 端では反対側へ回り込む。全行 disabled なら from をそのまま返す。
function nextEnabledIndex<T extends SuggestItem>(items: T[], from: number, delta: number) {
  if (items.length === 0) return 0;
  for (let step = 1; step <= items.length; step++) {
    const i = (from + delta * step + items.length * (step + 1)) % items.length;
    if (!items[i]?.disabled) return i;
  }
  return from;
}

export default function Suggest<T extends SuggestItem>({
  inputRef,
  items,
  onQueryChange,
  onSelect,
  triggers,
  renderItem,
  emptyLabel,
  ariaLabel,
  anchor,
  side = 'top',
  align = 'start',
  rowClassName = '',
  className = '',
}: SuggestProps<T>) {
  const [query, setQuery] = useState<string | null>(null);
  // Escape で閉じた状態。query が変わるまで再オープンしない（閉じた直後に同じ候補が
  // 出続けると Escape が効かないように見えるため）。
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rangeRef = useRef<SuggestRange | null>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listboxId = useId();

  // 消費側が渡すコールバックは毎レンダー別関数になりうる。native リスナの張り直しを
  // 起こさないよう、最新の関数は ref 経由で読む。
  const onQueryChangeRef = useRef(onQueryChange);
  onQueryChangeRef.current = onQueryChange;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const hasEmptyLabel = emptyLabel !== undefined && emptyLabel !== '';
  const open = query !== null && !dismissed && (items.length > 0 || hasEmptyLabel);

  const close = useCallback(() => {
    rangeRef.current = null;
    setQuery((prev) => {
      if (prev !== null) onQueryChangeRef.current(null);
      return null;
    });
    setDismissed(false);
  }, []);

  // 入力欄の現在位置からトリガー入力中かを判定して state に反映する。
  const sync = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? el.value.length;
    const found = findActiveTrigger(el.value, caret, triggers);
    if (!found) {
      rangeRef.current = null;
      setQuery((prev) => {
        if (prev !== null) onQueryChangeRef.current(null);
        return null;
      });
      setDismissed(false);
      return;
    }
    rangeRef.current = { start: found.start, end: found.end };
    setQuery((prev) => {
      if (prev === found.query) return prev;
      onQueryChangeRef.current(found.query);
      // query が変われば Escape の抑止は解除する（別の入力を打ち始めたとみなす）。
      setDismissed(false);
      return found.query;
    });
    // triggers は呼び出し側の定数配列。配列リテラルを毎レンダー渡されても sync の同一性が
    // 崩れるだけで実害は無い（native リスナは handlerRef 経由なので張り直らない）。
  }, [inputRef, triggers]);

  const commit = useCallback(
    (item: T | undefined) => {
      const range = rangeRef.current;
      if (!item || item.disabled || !range) return;
      onSelectRef.current(item, range);
      close();
    },
    [close],
  );

  // ── native リスナ ────────────────────────────────────────────────
  // React の onKeyDown ではなく**要素自身に張った native リスナ(capture)**を使う。
  // 理由: 消費側は DS の Composer（composer.tsx）をそのまま使う想定で、Composer の
  // 「Enter で送信」は React の onKeyDown = ルートコンテナへ委譲されたハンドラで動く。
  // 要素に直接張った capture フェーズのリスナはそれより**先に**走るので、ここで
  // stopPropagation() すればルートまで伝播せず送信が発火しない。この仕組みに乗ることで
  // **Composer を一切変更せずに**候補選択と送信を共存させられる。
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      // IME 変換中の Enter は「変換の確定」であって候補の確定ではない。ここを奪うと
      // 日本語入力が成立しなくなるので、composing 中は一切手を出さない。
      const composing = e.isComposing;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => nextEnabledIndex(items, i, e.key === 'ArrowDown' ? 1 : -1));
        return;
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && !composing) {
        e.preventDefault();
        e.stopPropagation();
        commit(items[activeIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setDismissed(true);
      }
    },
    [open, items, activeIndex, commit],
  );

  const handleKeyDownRef = useRef(handleKeyDown);
  handleKeyDownRef.current = handleKeyDown;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return undefined;
    const onKeyDown = (e: KeyboardEvent) => handleKeyDownRef.current(e);
    // キー操作以外（クリックでのキャレット移動・IME 確定・入力）でも判定し直す。
    // selectionchange 相当を拾うため click / keyup / select も見る。
    //
    // ⚠ **判定用のリスナは入力欄ではなく document のバブル段階に張る。** 入力欄に直接張ると
    // React の delegated なハンドラ（React はルートコンテナにイベントを委譲する）より **先** に
    // 走ってしまい、そこで setState して再レンダーが挟まると、React が「controlled な入力欄の
    // DOM value を state の値へ戻す」処理を行い、直後に走る onChange が **巻き戻された古い値**
    // を読む。実測（Storybook + Playwright / この実装の初版）: `@` を1文字打つと候補は正しく
    // 開くのに textarea の value は空のままになり、その1文字が永久に失われた。
    // `queueMicrotask` で1拍遅らせるのも**不十分**だった — マイクロタスクチェックポイントは
    // リスナ **間** でも回るため、結局 React のルートリスナより先に走る。
    // document はルートコンテナの祖先なので、バブル段階なら必ず React の後に走る。
    const doc = el.ownerDocument;
    const onSync = (e: Event) => {
      if (e.target !== el) return;
      sync();
    };
    el.addEventListener('keydown', onKeyDown, true);
    doc.addEventListener('input', onSync);
    doc.addEventListener('keyup', onSync);
    doc.addEventListener('click', onSync);
    doc.addEventListener('select', onSync);
    doc.addEventListener('compositionend', onSync);
    return () => {
      el.removeEventListener('keydown', onKeyDown, true);
      doc.removeEventListener('input', onSync);
      doc.removeEventListener('keyup', onSync);
      doc.removeEventListener('click', onSync);
      doc.removeEventListener('select', onSync);
      doc.removeEventListener('compositionend', onSync);
    };
  }, [inputRef, sync]);

  // 候補の並びが変わったら先頭へ戻す（絞り込みが進んだのに前の位置が残ると、
  // 見えていない行が確定されてしまう）。
  const itemsKey = items.map((i) => i.id).join(' ');
  // biome-ignore lint/correctness/useExhaustiveDependencies: items 自体ではなく id の並び(itemsKey)が変わったときだけリセットする
  useEffect(() => {
    setActiveIndex(items.findIndex((i) => !i.disabled) === -1 ? 0 : nextEnabledIndex(items, -1, 1));
  }, [itemsKey]);

  // アクティブ行をスクロール範囲内に保つ。
  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  // 入力欄側の ARIA を DS から付ける（消費側に属性配線を強制しない）。閉じたら必ず外す。
  // ⚠ role は書き換えない。textarea を role="combobox" にすると入力欄そのものの
  // セマンティクスが変わり、閉じている間の読み上げまで変わってしまう。aria-activedescendant は
  // textarea/input でも許されているので、必要な分だけを開いている間だけ足す。
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return undefined;
    if (!open) {
      el.removeAttribute('aria-expanded');
      el.removeAttribute('aria-controls');
      el.removeAttribute('aria-activedescendant');
      el.removeAttribute('aria-autocomplete');
      return undefined;
    }
    el.setAttribute('aria-expanded', 'true');
    el.setAttribute('aria-controls', listboxId);
    el.setAttribute('aria-autocomplete', 'list');
    const activeId = items[activeIndex] ? `${listboxId}-${items[activeIndex].id}` : '';
    if (activeId) el.setAttribute('aria-activedescendant', activeId);
    else el.removeAttribute('aria-activedescendant');
    return () => {
      el.removeAttribute('aria-expanded');
      el.removeAttribute('aria-controls');
      el.removeAttribute('aria-activedescendant');
      el.removeAttribute('aria-autocomplete');
    };
  }, [inputRef, open, items, activeIndex, listboxId]);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        // 外側クリック等で閉じられたときも「Escape で閉じた」と同じ抑止をかける
        // （閉じた直後に sync が走って再オープンするのを防ぐ）。
        if (!next) setDismissed(true);
      }}
    >
      {/* ⚠ Popover.Portal は省略できない（無いとレンダー中に throw して画面が真っ白になる）。
          詳細は popover.tsx 冒頭のコメント参照。 */}
      <Popover.Portal>
        {/* anchor は入力欄そのもの。キャレット位置に厳密に合わせる方式（mirror div で
            文字位置を実測する）は採らない — textarea のスタイルを完全に複製する必要があり
            壊れやすいうえ、実際のチャット UI は入力欄の上端に固定で出す方が視線移動が少ない。 */}
        {/* ⚠ z-index は **inline style** で当てる。Positioner の className には
            POPOVER_POSITIONER_BASE の z-[var(--z-popover-portal)] が既に入っており、同一
            プロパティのユーティリティは className の並び順ではなく配布 CSS の出力順で勝敗が
            決まるため、クラスで上書きしても効かない(popover.tsx の #21 のコメント参照)。
            modal.tsx / bottom-sheet.tsx が同じ理由で inline style を使っている。
            ⚠ 変数名は `--z-mention` のまま据え置く。Mention 専用の名前に見えるが、既に消費側が
            この変数でサジェストの層を制御しているので、汎用化を理由に改名すると**消費側の
            指定が黙って効かなくなる**。サジェストは種類が違っても同じ層で構わない。 */}
        <Popover.Positioner
          anchor={anchor ?? inputRef}
          side={side}
          align={align}
          mobileSheet
          style={{ zIndex: 'var(--z-mention, 110)' }}
        >
          <Popover.Popup
            // 既定の p-3 は行の左右 padding と二重になるので出さず、行の外周だけ p-1 にする。
            padding={false}
            // ⚠ フォーカスを入力欄から動かさない。候補が出た瞬間に文字が打てなくなるのは
            //    このコンポーネントにとって致命的なので、開閉ともフォーカス移動を止める。
            initialFocus={false}
            finalFocus={false}
            role="listbox"
            id={listboxId}
            aria-label={ariaLabel}
            className={twMerge('flex flex-col gap-0.5 p-1', className)}
          >
            {items.length === 0 && hasEmptyLabel ? (
              <div role="presentation" className="px-[13px] py-[11px] text-base text-text-dim">
                {emptyLabel}
              </div>
            ) : (
              items.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <div
                    key={item.id}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    id={`${listboxId}-${item.id}`}
                    role="option"
                    aria-selected={active}
                    aria-disabled={item.disabled || undefined}
                    // ⚠ mousedown を潰さないと入力欄が blur してキャレット位置を失う
                    //   （＝置換対象の range が取れなくなる）。選択は click で行う。
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(item)}
                    // 背景色は排他的に出す（bg-transparent を base 側に混ぜると配布 CSS の
                    // 出力順でハイライトが打ち消される。menu.tsx の #17 のコメント参照）。
                    className={`${rowClassName} max-sm:min-h-11 ${
                      item.disabled
                        ? 'cursor-not-allowed bg-transparent text-text-dim opacity-(--disabled-opacity)'
                        : active
                          ? 'bg-surface-hover text-text'
                          : 'bg-transparent text-text'
                    }`}
                  >
                    {renderItem(item)}
                  </div>
                );
              })
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
