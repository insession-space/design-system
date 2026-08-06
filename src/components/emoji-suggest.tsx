import type { RefObject } from 'react';
import { useMemo, useState } from 'react';
import { EMOJI_SHORTCODES } from './emoji-shortcodes.ts';
import { MENU_ROW_BASE } from './menu.tsx';
import type { PopoverPositionerProps } from './popover.tsx';
import Suggest, { type SuggestRange } from './suggest.tsx';

// テキスト入力欄の中で `:smile` のように打つと絵文字の候補を出す補完(#190)。Slack / GitHub と
// 同じ操作感。骨格（トリガー検出・キーボード操作・ARIA・Popover）は `suggest.tsx` の共通実装に
// 委ね、ここは**絵文字の検索**と**候補1行の見た目**だけを持つ。
//
// ── Mention と違い、候補は DS 側が持つ ─────────────────────
// Mention は「誰が候補か」がアプリのドメインなので候補を消費側から受け取るが、**絵文字は
// ドメインに依存しない**。辞書（emoji-shortcodes.ts, 自動生成）を DS が同梱して検索まで
// 完結させ、消費側は選ばれた絵文字を受け取るだけにする。消費側ごとに辞書と検索を再実装させる
// 意味が無いため。
//
// ⚠ **入力欄の value は消費側が所有する。** 確定時は「どの範囲を置き換えるべきか」を
// onSelect(emoji, range) で渡すだけで、DS は入力欄を書き換えない（理由は suggest.tsx 冒頭）。
// 挿入されるのは**絵文字そのもの**で、`:smile:` のようなショートコード文字列は本文に残らない。
//
// 使い方:
//   const ref = useRef<HTMLTextAreaElement>(null);
//   <Composer textareaRef={ref} value={text} onChange={setText} ... />
//   <EmojiSuggest
//     inputRef={ref}
//     onSelect={(emoji, range) => setText(text.slice(0, range.start) + emoji + text.slice(range.end))}
//   />

// 認識するトリガー文字。日本語入力では全角 `：` がそのまま残ることが多いので既定で両方見る
// （Mention が `@` と `＠` の両方を見るのと同じ理由）。
export const EMOJI_SUGGEST_TRIGGERS = [':', '：'] as const;

// `:` を打った瞬間に千件超が並ぶのは邪魔なだけなので、この文字数に達するまで候補を出さない。
const DEFAULT_MIN_QUERY_LENGTH = 2;

// 候補の表示件数。多すぎると目で追えず、少なすぎると目当てが出てこない。
const DEFAULT_MAX_ITEMS = 8;

export type EmojiSuggestItem = {
  // Suggest の要件。ショートコードは辞書内で一意なのでそのまま id にできる。
  id: string;
  // 絵文字そのもの（"🙂"）。確定時に本文へ入る。
  emoji: string;
  // `:` を除いたショートコード（"slightly_smiling_face"）。
  shortcode: string;
};

export type EmojiSuggestProps = {
  // 監視対象の入力欄。value / selectionStart を読むだけで書き換えない。
  inputRef: RefObject<HTMLTextAreaElement | null> | RefObject<HTMLInputElement | null>;
  // 候補の確定。range は input.value 上の置換対象（トリガーの `:` を含む）。
  onSelect: (emoji: string, range: SuggestRange) => void;
  triggers?: readonly string[];
  // 候補を出し始めるまでに必要な文字数（`:` の後ろ）。既定 2。
  minQueryLength?: number;
  // 候補の最大表示件数。既定 8。
  maxItems?: number;
  ariaLabel?: string;
  // 候補0件のときに出す文言。省略すると 0 件では何も出さずに閉じる。
  emptyLabel?: string;
  // 候補パネルを寄せる基準要素。省略時は inputRef（入力欄そのもの）。
  // ⚠ 入力欄が Composer のような複合なら**外側の器**を渡すこと（理由は mention.tsx と同じ）。
  anchor?: PopoverPositionerProps['anchor'];
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  className?: string;
};

// 検索の一致度。小さいほど上位に出す。
const MATCH_PREFIX = 0;
const MATCH_SUBSTRING = 1;
const MATCH_KEYWORD = 2;

// query に対する一致度を返す。一致しなければ null。
// ⚠ query は「ユーザーが打っている途中の文字列」なので、`_` を打つ前でも引けるようにする
//   （`thinking` で `thinking_face` に前方一致させたい）。
function matchEmoji(shortcode: string, keywords: string, query: string): number | null {
  if (shortcode.startsWith(query)) return MATCH_PREFIX;
  if (shortcode.includes(query)) return MATCH_SUBSTRING;
  if (keywords.includes(query)) return MATCH_KEYWORD;
  return null;
}

// 辞書から query に合う絵文字を探す。純粋関数なので story / テストから直接呼べる。
export function searchEmojis(query: string, maxItems: number): EmojiSuggestItem[] {
  // 空白を含む query はショートコードになり得ない（`: ` の後ろは普通の文章）。
  const needle = query.toLowerCase();
  if (!needle || /\s/.test(needle)) return [];

  const hits: { entry: (typeof EMOJI_SHORTCODES)[number]; score: number }[] = [];
  for (const entry of EMOJI_SHORTCODES) {
    const score = matchEmoji(entry[1], entry[2], needle);
    if (score !== null) hits.push({ entry, score });
  }

  // 一致度 → ショートコードの短さ（＝より的確） → 辞書順、の優先で並べる。
  hits.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    if (a.entry[1].length !== b.entry[1].length) return a.entry[1].length - b.entry[1].length;
    return a.entry[1].localeCompare(b.entry[1]);
  });

  return hits.slice(0, maxItems).map(({ entry }) => ({
    id: entry[1],
    emoji: entry[0],
    shortcode: entry[1],
  }));
}

export default function EmojiSuggest({
  inputRef,
  onSelect,
  triggers = EMOJI_SUGGEST_TRIGGERS,
  minQueryLength = DEFAULT_MIN_QUERY_LENGTH,
  maxItems = DEFAULT_MAX_ITEMS,
  ariaLabel,
  emptyLabel,
  anchor,
  side = 'top',
  align = 'start',
  className = '',
}: EmojiSuggestProps) {
  // Suggest は「候補は呼び出し側が持つ」設計なので、query を受けて自分で検索し items を作る。
  // Mention では消費側が担っていた部分を、絵文字ではこのコンポーネントが引き受ける。
  const [query, setQuery] = useState<string | null>(null);

  const items = useMemo(() => {
    if (query === null || query.length < minQueryLength) return [];
    return searchEmojis(query, maxItems);
  }, [query, minQueryLength, maxItems]);

  return (
    <Suggest
      inputRef={inputRef}
      items={items}
      onQueryChange={setQuery}
      onSelect={(item, range) => onSelect(item.emoji, range)}
      triggers={triggers}
      // 候補を出す文字数に達していない間は「見つかりません」も出さない（`:` を打った直後に
      // 空のパネルが点滅するのを避ける）。
      emptyLabel={query !== null && query.length >= minQueryLength ? emptyLabel : undefined}
      ariaLabel={ariaLabel}
      anchor={anchor}
      side={side}
      align={align}
      className={className}
      // 行の見た目は Menu の行と同一（新しい見た目を作らない）。
      rowClassName={MENU_ROW_BASE}
      renderItem={(item) => (
        <>
          {/* 絵文字は本文の文字より一段大きく出す。Mention が同じ位置に置く Avatar(24px)と
              釣り合う 22px = text-h2 を使う（DS に text-h3 は無い）。font-weight は絵文字には
              効かないので、見出し用トークンを流用しても副作用は無い。
              行の高さは MENU_ROW_BASE が決めるので、leading-none で行送りが増えるのを止める。 */}
          <span aria-hidden className="text-h2 leading-none">
            {item.emoji}
          </span>
          <span className="min-w-0 flex-1 truncate">:{item.shortcode}:</span>
        </>
      )}
    />
  );
}
