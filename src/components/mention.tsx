import type { ReactNode, RefObject } from 'react';
import Avatar from './avatar.tsx';
import { MENU_ROW_BASE } from './menu.tsx';
import type { PopoverPositionerProps } from './popover.tsx';
import Suggest, { type SuggestRange } from './suggest.tsx';

// テキスト入力欄の中で `@` を打つと候補を出すサジェスト(#177)。チャットのメンションが
// 想定用途だが、DS は**ドメインを知らない** — 「誰が候補か」「選ばれた結果どう保存するか」
// 「本文中でどう強調するか」は一切持たず、候補の**表示・キーボード操作・トリガー検出**だけを担う。
//
// ── 中身は Suggest に移した(#190) ────────────────────────
// トリガー検出・キャレット追従・キーボード操作・ARIA・Popover の組み方は `suggest.tsx` の
// 共通実装が持ち、ここは**候補1行の見た目**（アバター + 名前 + 副情報 + バッジ）と `@` 固有の
// 既定値だけを持つ。`:` の絵文字ショートコード補完(emoji-suggest.tsx)が同じ骨格を必要とした
// ため切り出したもので、**このコンポーネントの props も挙動も変えていない**。
// 実装上の落とし穴（native リスナを document のバブル段階に張る理由、mousedown を潰す理由、
// Popover.Portal が必須である理由など）は全て suggest.tsx のコメントに残してある。
//
// ⚠ **入力欄の value は消費側が所有する。** inputRef から value と selectionStart を **読むだけ**で
// 書き換えない。確定時は「どの範囲を置き換えるべきか」を onSelect(item, range) で渡し、実際の
// 置換は消費側が行う。理由は suggest.tsx 冒頭のコメント参照。
//
// 使い方:
//   const ref = useRef<HTMLTextAreaElement>(null);
//   const [query, setQuery] = useState<string | null>(null);
//   <Composer textareaRef={ref} value={text} onChange={setText} ... />
//   <Mention
//     inputRef={ref}
//     items={query === null ? [] : candidates.filter((c) => c.label.startsWith(query))}
//     onQueryChange={setQuery}
//     onSelect={(item, range) => setText(replaceRange(text, range, `@${item.label} `))}
//   />

// 認識するトリガー文字。日本語入力では全角 `＠` がそのまま残ることが多いので既定で両方見る。
export const MENTION_TRIGGERS = ['@', '＠'] as const;

export type MentionItem = {
  id: string;
  // 確定時に挿入される綴り（`@` の後ろに入る文字列）。表示にも使う。
  label: string;
  // 行の副情報（表示名・肩書きなど）。
  sublabel?: string;
  avatarUrl?: string | null;
  // Avatar の円の背景色（CSS 色）。省略時は Avatar 既定。
  avatarColor?: string;
  // 行末に出す種別表示（「AI」バッジ等）。DS は種別の概念を持たないので ReactNode で受ける。
  badge?: ReactNode;
  // ハイライトは通り、確定だけできない行。
  disabled?: boolean;
};

// input.value 上の置換対象範囲 [start, end)。start はトリガー文字自身の位置。
export type MentionRange = SuggestRange;

export type MentionProps = {
  // 監視対象の入力欄。value / selectionStart を読むだけで書き換えない。
  inputRef: RefObject<HTMLTextAreaElement | null> | RefObject<HTMLInputElement | null>;
  // 候補。消費側が query で絞った結果を渡す。
  items: MentionItem[];
  // 検出したメンション query の変化。null はメンション入力中でない状態。
  // ⚠ query が実際に変わったときだけ呼ぶ（毎イベントでは呼ばない）ので、
  //   これを setState に直結しても再レンダーのループにはならない。
  onQueryChange: (query: string | null) => void;
  // 候補の確定。range は input.value 上の置換対象（トリガー文字を含む）。
  onSelect: (item: MentionItem, range: MentionRange) => void;
  triggers?: readonly string[];
  // 候補0件のときに出す文言。省略すると 0 件では何も出さずに閉じる。
  emptyLabel?: string;
  ariaLabel?: string;
  // 候補パネルを寄せる基準要素。省略時は inputRef（入力欄そのもの）。
  // ⚠ 入力欄が Composer のように「textarea + 下段アクション行」の複合なら、**外側の器**を
  //   渡すこと。textarea を基準にすると、下向きにフリップしたときにパネルが下段の
  //   アクション行に重なる（textarea の下端 ≠ 入力欄の下端のため）。
  anchor?: PopoverPositionerProps['anchor'];
  // 候補パネルを出す向き。チャット入力は画面下端にあることが多いので既定は 'top'。
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  className?: string;
};

export default function Mention({
  inputRef,
  items,
  onQueryChange,
  onSelect,
  triggers = MENTION_TRIGGERS,
  emptyLabel,
  ariaLabel,
  anchor,
  side = 'top',
  align = 'start',
  className = '',
}: MentionProps) {
  return (
    <Suggest
      inputRef={inputRef}
      items={items}
      onQueryChange={onQueryChange}
      onSelect={onSelect}
      triggers={triggers}
      emptyLabel={emptyLabel}
      ariaLabel={ariaLabel}
      anchor={anchor}
      side={side}
      align={align}
      className={className}
      // 行の見た目は Menu の行と同一（新しい見た目を作らない）。
      rowClassName={MENU_ROW_BASE}
      renderItem={(item) => (
        <>
          {/* ⚠ ds を立てないと legacy 経路（素の img/span を返す後方互換パス）になり、
              円にも見た目にもならない（消費側の .avatar クラス前提のため）。
              avatar.tsx のコメント参照。 */}
          <Avatar
            ds
            name={item.label}
            src={item.avatarUrl ?? undefined}
            color={item.avatarColor}
            size={24}
          />
          <span className="min-w-0 flex-1 truncate">
            {item.label}
            {item.sublabel && <span className="ml-2 text-sm text-text-dim">{item.sublabel}</span>}
          </span>
          {item.badge && <span className="shrink-0">{item.badge}</span>}
        </>
      )}
    />
  );
}
