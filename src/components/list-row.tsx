import type { ButtonHTMLAttributes, ReactNode } from 'react';

// DS のリスト行（純粋 leaf UI。#53）。
// 「アイコン + ラベル（+ 説明 / 右端の付随要素 / chevron）」からなる**クリックできる行**。
//
// なぜ `MenuPlainItem` と別部品なのか: `MenuPlainItem` は `MenuPlainList`（`role="menu"`）の
// 中の `role="menuitem"` として振る舞う前提の部品で、**ポップオーバー/メニューの外では
// セマンティクスが嘘になる**（メニューでないものを menu として読み上げてしまう）。
// 画面内に置く設定行・プロフィール行はただの `<button>` が正しい。
//
// 消費側（insession-app）は同じ形を `flex items-center gap-3 min-w-0 flex-1 text-left
// bg-transparent border-none shadow-none p-0` のような**打ち消しユーティリティの列**で
// 毎回手組みしていた（`settings-modal` / `user-profile` / 伝言ゲームの履歴行など5箇所）。
// 打ち消しが必要なのは legacy の素の `button {}` が塗りと padding を与えているからで、
// DS 側で完結した行部品を持てば消費側は打ち消しを書かなくて済む。
//
// Base UI に載せていない: 振る舞いは素の `<button onClick>` で足りる（開閉も選択状態も
// キーボードナビゲーションも持たない）。載せても得るものが無い（`Badge` / `Chip` と同じ判断）。

export type ListRowProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  // 行頭の要素（`Icon` / `Avatar` / 絵文字など）。
  icon?: ReactNode;
  // 主ラベル。1行に収め、溢れたら省略する。
  label: ReactNode;
  // ラベルの下に出す補足。省略時は1行の行になる。
  description?: ReactNode;
  // 右端の付随要素（値・`Badge`・`Toggle` など）。
  trailing?: ReactNode;
  // 右端に `>` を出す（ドリルダウンする行であることを示す）。既定 false。
  chevron?: boolean;
  // 破壊的操作（削除・ログアウト等）。ラベルとアイコンを危険色にする。
  danger?: boolean;
  className?: string;
};

const ROW =
  'flex w-full items-center gap-3 rounded-md border-none bg-transparent px-2 py-2 text-left font-body shadow-none transition-colors duration-(--dur-fast) focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

// ドリルダウンを示す `>`。`Icon` の ALL_PATHS に chevron が無いためここで持つ
// （汎用アイコンとして足すなら icon.tsx 側の仕事だが、この行部品専用の装飾なので
// 名前付きアイコンを増やさずローカルに閉じる）。
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

export default function ListRow({
  icon,
  label,
  description,
  trailing,
  chevron = false,
  danger = false,
  disabled,
  type = 'button',
  className = '',
  ...rest
}: ListRowProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${ROW} ${
        // ⚠ hover の面は disabled のときに出さない。`disabled:` の opacity だけだと
        // 「薄いのに反応する」見た目になり、押せると誤解させる。
        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-surface-hover'
      } ${danger ? 'text-danger' : 'text-text'} ${className}`.trim()}
      {...rest}
    >
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      {/* min-w-0 が要点。これが無いと長いラベルが flex の縮小を拒否して行から溢れる。 */}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-md">{label}</span>
        {description ? <span className="truncate text-sm text-text-dim">{description}</span> : null}
      </span>
      {trailing ? <span className="flex shrink-0 items-center gap-1.5">{trailing}</span> : null}
      {chevron ? <Chevron /> : null}
    </button>
  );
}
