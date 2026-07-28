import type { MouseEvent, ReactNode } from 'react';

// 設定行（純粋 leaf UI。#73）。
// 「アイコン + ラベル（+ 説明）」の左側と、「Toggle / SegmentedControl / Button / 値」の
// 右側からなる**設定モーダルの1行**。
//
// ── 旧 ListRow との違い（なぜ別部品か）─────────────────────────
// 旧 `ListRow` は要素そのものが `<button>` 固定で、末尾に対話要素を置くと
// **`<button>` の中に `<button>` / `<input>` が入る不正な DOM** になり、外側の button が
// クリックを奪って末尾のコントロールが操作できなくなっていた。実際 insession-app #1172 の
// アカウント設定 14 行（言語 / テーマ / 効果音 / 通知 …）は**1行も載せられず**、`Paper` +
// ユーティリティで手組みに戻っている。
//
// そこで `SettingRow` は次の2点を構造で保証する:
//
// 1. **既定は非対話**。`<div>` として描き、cursor / hover の面 / focus リングを持たない
// 2. **`onClick` / `href` を渡して対話的にしても、`trailing` は対話要素の外（兄弟）に置く**。
//    ネストが起きえないので「行を押す」と「末尾のコントロールを押す」が両立する
//
// `interactive` のような真偽値 prop を足さず `href` / `onClick` の有無から導出するのは、
// 同じ「行」である `UserLabel` の流儀に揃えるため（href → `<a>` / onClick → `<button>` /
// どちらも無ければ `<div>`）。
//
// ── description の折り返し ───────────────────────────────
// 旧 ListRow は label / description とも `truncate` 固定だったが、設定の説明文は2行に
// 折り返したいことの方が多い。`descriptionLines` で 1 行省略 / 2〜3 行クランプ / 折り返し
// （既定）を選べるようにした。
//
// Base UI に載せていない: 行そのものは開閉も選択状態もキーボードナビゲーションも持たない
// （`Badge` / `Chip` / `UserLabel` と同じ判断）。振る舞いは末尾に載る `Toggle` /
// `SegmentedControl` / `Button` の側が Base UI 経由で既に持っている。

// 説明文の行数制御。1 = 1行で省略（旧 ListRow の見た目）/ 2・3 = その行数でクランプ /
// 'none' = 折り返して全文を出す（既定）。
export type SettingRowDescriptionLines = 1 | 2 | 3 | 'none';

export type SettingRowProps = {
  // 行頭の要素（`Icon` / 絵文字など）。
  icon?: ReactNode;
  // 主ラベル。1行に収め、溢れたら省略する。
  label: ReactNode;
  // ラベルの下に出す補足。
  description?: ReactNode;
  // 説明文の行数制御。既定は 'none'（折り返す）。
  descriptionLines?: SettingRowDescriptionLines;
  // 右端の要素（`Toggle` / `SegmentedControl` / `Button` / 値テキストなど）。
  // **対話要素を置いてよい**（行を対話的にしても入れ子にならない構造にしてある）。
  trailing?: ReactNode;
  // 行を押したときに `>` を出す（ドリルダウンする行であることを示す）。既定 false。
  chevron?: boolean;
  // 破壊的操作（削除・退会等）。ラベルを危険色にする。
  danger?: boolean;
  // 遷移先。指定すると行の左側が `<a>` になる。
  href?: string;
  target?: string;
  rel?: string;
  // 押したときの動作。href が無く onClick があると行の左側が `<button>` になる。
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  // 対話的なとき（href / onClick）のみ意味を持つ。押せない見た目にして操作を止める。
  disabled?: boolean;
  // 対話的なときの読み上げラベル。省略時は中身（ラベル + 説明）がそのまま読まれる。
  ariaLabel?: string;
  className?: string;
};

// 行の器。padding と左右の並びだけを持ち、面（背景・境界）は持たない
// （設定行は `Paper` / `Card` の中に並べるか、`Divider` で区切って使う）。
const ROW = 'flex w-full items-center gap-3 py-2 font-body';

// 対話的にしたときだけ左側へ当てる打ち消し + 状態表現。素の `<button>` / `<a>` の既定
// （塗り・padding・下線・中央揃え）を消し、面はホバーでだけ出す。
const INTERACTIVE =
  'min-w-0 flex-1 rounded-md border-none bg-transparent p-0 text-left no-underline transition-colors motion-reduce:transition-none duration-(--dur-fast) focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring';
// ⚠ hover の面は disabled のときに出さない。薄いのに反応する見た目は押せると誤解させる。
const INTERACTIVE_ENABLED = 'cursor-pointer hover:bg-surface-hover';
const INTERACTIVE_DISABLED = 'cursor-not-allowed opacity-(--disabled-opacity)';

// ⚠ クラス名は静的リテラルで持つ（動的合成は @source 走査に引っかからず配布 CSS だけが
// 静かに欠ける。layout.tsx の GAP_CLASS と同じ理由）。
const DESCRIPTION_LINES_CLASS: Record<SettingRowDescriptionLines, string> = {
  1: 'truncate',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  none: '',
};

// ドリルダウンを示す `>`。この行部品専用の装飾なので、名前付きアイコンを増やさず閉じる
// （旧 list-row.tsx から引き継いだ判断）。
function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      aria-hidden="true"
      className="shrink-0 text-text-faint"
    >
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SettingRow({
  icon,
  label,
  description,
  descriptionLines = 'none',
  trailing,
  chevron = false,
  danger = false,
  href,
  target,
  rel,
  onClick,
  disabled = false,
  ariaLabel,
  className = '',
}: SettingRowProps) {
  // 行の「左側」＝アイコン + ラベル + 説明（+ chevron）。対話的なときはこの塊だけが
  // <a> / <button> になる。trailing はこの外に出るので入れ子にならない。
  const main = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {icon ? <span className="flex shrink-0 items-center text-text-dim">{icon}</span> : null}
      {/* min-w-0 が要点。これが無いと長いラベルが flex の縮小を拒否して行から溢れる。 */}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`truncate text-base ${danger ? 'text-danger' : 'text-text'}`}>
          {label}
        </span>
        {description ? (
          <span
            className={`text-sm text-text-dim ${DESCRIPTION_LINES_CLASS[descriptionLines]}`.trim()}
          >
            {description}
          </span>
        ) : null}
      </span>
      {chevron ? <Chevron /> : null}
    </div>
  );

  const interactiveClass =
    `${INTERACTIVE} ${disabled ? INTERACTIVE_DISABLED : INTERACTIVE_ENABLED}`.trim();

  let mainNode = main;
  if (href != null) {
    mainNode = (
      // disabled なリンクは HTML に無いので、遷移を止めつつ支援技術にも無効だと伝える。
      <a
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={interactiveClass}
      >
        {main}
      </a>
    );
  } else if (onClick != null) {
    mainNode = (
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
        className={interactiveClass}
      >
        {main}
      </button>
    );
  }

  return (
    <div className={`${ROW} ${className}`.trim()}>
      {mainNode}
      {/* trailing は常に対話要素の**外**。ここが `<button>` の中に入らないことが
          この部品の存在理由なので、mainNode の内側へ移さないこと。 */}
      {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
    </div>
  );
}
