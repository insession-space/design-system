import type { ComponentProps, ReactNode } from 'react';
import { Badge } from '../components/badge.tsx';
import { twMerge } from '../lib/tw-merge.ts';

// メディア(動画/音声)のサムネイル枠(16:9・角丸・はみ出しの切り落とし)。MediaRow の
// サムネイル列に差すためのものだが、枠自体は単体でも成立するので独立コンポーネントとして
// export する(feed-item.tsx の FeedItemAttachment が「枠は自分が持つ・中身は呼び出し側」に
// したのと同じ理由。毎回 16:9 + 角丸 + オーバーレイの位置決めを書かせるのは冗長)。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// 持つのは「枠(aspect-video + 角丸 + overflow-hidden)」と「左下 = 画質 / 右下 = 尺という
// オーバーレイの置き場所」だけ。画質・尺は**整形済みの文字列**(または ReactNode)を受け取るだけで、
// "4K" や "3:32" のような表記ルールの決定・秒数からの整形はここでは行わない(呼び出し側の責務)。
// 画質バッジは既存の Badge をそのまま流用する(専用の見た目を新設しない)。
export type MediaThumbnailProps = {
  // 画像 URL。指定時は <img> を敷く。無ければ children を枠いっぱいに敷く
  // (色付きプレースホルダ等、呼び出し側が任意の中身を差せる)。
  src?: string;
  // 装飾目的(色見本のプレースホルダ等)なら空文字を渡す。
  alt?: string;
  children?: ReactNode;
  // 右下の尺バッジ(例 "3:32")。整形済みの文字列を受け取るだけ。
  duration?: ReactNode;
  // 左下の画質バッジ(例 "4K")。Badge(tone="neutral")で描画する。
  quality?: ReactNode;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className' | 'children'>;

// Badge の既定(px-2.5 py-1 / 11px)は本文中のラベル向けの寸法で、96px 幅のサムネイルに重ねると
// 面積を食いすぎて絵が見えなくなる。オーバーレイのときだけ最小段(--text-xs = 10px)まで詰める。
// ⚠ クラス名は静的な文字列として持つ(動的合成は Tailwind の @source 走査に載らず配布 CSS が
// 欠ける。scripts/check-styles.mjs が検査している層)。
const OVERLAY_BADGE = 'absolute bottom-1 left-1 px-1.5 py-0.5 text-xs';

export function MediaThumbnail({
  src,
  alt = '',
  children,
  duration,
  quality,
  className = '',
  ...rest
}: MediaThumbnailProps) {
  return (
    <div
      className={twMerge(
        'relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-surface-3',
        className,
      )}
      {...rest}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : children}
      {quality != null && (
        <Badge tone="neutral" className={OVERLAY_BADGE}>
          {quality}
        </Badge>
      )}
      {duration != null && (
        <Badge tone="neutral" className={`${OVERLAY_BADGE} left-auto right-1`}>
          {duration}
        </Badge>
      )}
    </div>
  );
}
