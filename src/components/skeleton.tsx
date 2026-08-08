// 読み込み中のプレースホルダ(純粋 leaf UI。#87)。取得に時間がかかるリスト系コンテンツ
// (投稿一覧等)で、実データが揃うまでの「これから出る形」を見せ、レイアウトシフトを防ぐ。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// このファイルが持つのは「面(矩形/円)」と「テキスト複数行」という汎用の形だけ。
// 個別部品(MessageItem 等)のレイアウト骨格は持たない — それは各部品ごとの
// `*Skeleton`(例: src/ui-kit/message-item-skeleton.tsx)が、この Skeleton を組んで作る。
//
// ── shimmer ──────────────────────────────────────────
// 面の上を淡いハイライトが左 → 右へ流れる表現。`@keyframes skeleton-shimmer` は
// src/styles/components.css の `@keyframes` 節に定義してある(このリポジトリでは
// Tailwind の arbitrary animation ユーティリティは名前を参照するだけで @keyframes 本体を
// 生成しないため、ここが定義の単一ソース)。ハイライト自体も生の色値は書かず、
// 背景 surface-2 の上に半透明の text-dim トークンを重ねる `background-image` の
// グラデーションで表現する(色そのものはトークン由来)。
//
// `prefers-reduced-motion: reduce` のときは components.css 側でこの animation を
// 止め、静止した面(surface-2 のベタ塗り)にする。**この抑制は DS の配布 CSS に含まれる**ので
// 消費側アプリの style.css には依存しない(グラデーションごと消す必要があり、クラス文字列の
// 抑制ユーティリティだけでは表現できないため、ここだけ components.css 側で行っている。
// ⚠ insession-app の lp / help は components.css を読まないので、あちらは自分の legacy CSS の
// グローバル規則が担保する)。
//
// ── アクセシビリティ ─────────────────────────────────
// 装飾要素なので常に `aria-hidden="true"`。「読み込み中」であることの読み上げ
// (aria-busy / role="status" のライブリージョン等)は呼び出し側の責務とし、この
// コンポーネントは持たない(スコープ外。Issue #87)。
import { twMerge } from '../lib/tw-merge.ts';

export type SkeletonShape = 'rect' | 'circle';

export type SkeletonProps = {
  // 矩形の幅。数値(px)または CSS の長さ文字列('100%' 等)。circle のときは無視する。
  width?: number | string;
  // 矩形の高さ。数値(px)または CSS の長さ文字列。circle のときは無視する。
  height?: number | string;
  // true で円にする(アバターのプレースホルダ用)。
  circle?: boolean;
  // circle のときの直径(px)。既定 24(UserLabel の size="sm" の avatar と同じ)。
  size?: number;
  className?: string;
};

// px 数値はそのまま Tailwind に乗らない可変値なので style で当てる(width/height の
// 動的合成は @source 走査に引っかからないため、クラス名ではなく style を使う)。
function toLength(value: number | string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

// 面 + shimmer の共通クラス。角丸だけ形状ごとに変える。
const SURFACE_SHIMMER = 'skeleton-shimmer bg-surface-2';

export default function Skeleton({
  width,
  height,
  circle = false,
  size = 24,
  className = '',
}: SkeletonProps) {
  if (circle) {
    return (
      <span
        aria-hidden="true"
        className={twMerge('inline-block shrink-0 rounded-pill', SURFACE_SHIMMER, className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={twMerge('inline-block shrink-0 rounded-md', SURFACE_SHIMMER, className)}
      style={{ width: toLength(width, '100%'), height: toLength(height, '1em') }}
    />
  );
}

export type SkeletonTextProps = {
  // 積む行数。既定 1。
  lines?: number;
  // 各行の文字サイズ/行間を決めるクラス(font-size と line-height の組)。既定は本文で最も
  // 使われる text-small(MessageItem の本文と同じ)。行の高さはこの値を直接指定せず、
  // このクラスが生む「strut」(空でも行に確保される最小の高さ。CSS の line-height の仕組み)
  // に委ねる — そうすることでトークンが変わっても実物の行の高さに自動で追従する
  // (固定 px を書くとトークン変更時にズレる)。
  textClassName?: string;
  className?: string;
};

// 最終行だけ短くする比率。実際の文章の最終行が行末で止まる見え方に寄せる。
const LAST_LINE_WIDTH = '65%';

Skeleton.Text = function SkeletonText({
  lines = 1,
  textClassName = 'font-body text-small',
  className = '',
}: SkeletonTextProps) {
  return (
    <span aria-hidden="true" className={twMerge('flex flex-col', className)}>
      {Array.from({ length: lines }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 行はプレースホルダで内容を持たないため index で十分
        <span key={index} className={textClassName}>
          {/* バーの高さは行の高さより明確に小さくする(0.7em)。行の実際の高さは外側の
              span が持つ text-* クラスの strut が決めるので、バー自体の高さは見た目の
              太さでしかない。 */}
          <Skeleton
            height="0.7em"
            width={index === lines - 1 && lines > 1 ? LAST_LINE_WIDTH : '100%'}
          />
        </span>
      ))}
    </span>
  );
};
