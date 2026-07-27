import type { ComponentProps, ReactNode } from 'react';
import Icon from '../icons/icon.tsx';

// キュー/プレイリストの1行(#94)。MediaThumbnail / IconButton 等の複数プリミティブを束ねる
// 横1行のレイアウトなので、src/components/ ではなく src/ui-kit/ に置く。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// 持つのは「ドラッグハンドル(装飾) → サムネイル → 可変幅のタイトル/サブテキスト →
// 右端のアクション群」という並び・余白・truncate の取り決めだけ。
//
// 逆に、次はいずれも呼び出し側の責務として意図的に持たない(feed-item.tsx と同じ線引き):
//   - 実際の並び替え(DnD)ロジック。`dragHandle` は見た目(掴み手のアイコン)を出すだけで、
//     ドラッグ操作そのもの(pointer イベント・並び替え計算)は消費側のライブラリ
//     (dnd-kit 等)が持つ。だからこそここでは `aria-hidden` にして操作を無効化した見た目に
//     徹する(下のコメント参照)。
//   - `onPlay` / `isStarred` のような**用途を固定した意味づけ props**。右端のアクションは
//     すべて `actions` スロットに完成した IconButton 群を差してもらう。再生/お気に入り/削除の
//     どれを出すか・アイコンをどうするかは呼び出し側が決める。
//   - 画質/尺の表記ルール。サムネイルのオーバーレイは MediaThumbnail に委ねる。
export type MediaRowProps = {
  // ドラッグハンドルの表示。true = 既定の drag_indicator アイコン、ReactNode = 差し替え、
  // 省略/false = 出さない(並び替え不可のリスト等)。
  dragHandle?: boolean | ReactNode;
  // サムネイルのスロット。`<MediaThumbnail …/>` を想定する。
  thumbnail?: ReactNode;
  // 1行目。太字・1行 truncate。
  title: ReactNode;
  // 2行目。グレー・小さめ・1行 truncate。
  subtitle?: ReactNode;
  // 右端のアクションスロット。`<IconButton variant="ghost" …/>` を並べる想定。
  actions?: ReactNode;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className' | 'children' | 'title'>;

export function MediaRow({
  dragHandle,
  thumbnail,
  title,
  subtitle,
  actions,
  className = '',
  ...rest
}: MediaRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-card bg-surface p-2 ${className}`.trim()}
      {...rest}
    >
      {dragHandle && (
        // ドラッグハンドルは装飾(掴めそうに見えるアイコン)のみで、実際の DnD 操作(ポインタの
        // 追跡・並び替え確定)は消費側が持つ。スクリーンリーダーに読ませても操作できないものを
        // 読み上げるだけなので aria-hidden="true" にする。
        <span aria-hidden="true" className="shrink-0 text-text-faint">
          {dragHandle === true ? <Icon name="drag_indicator" size={20} /> : dragHandle}
        </span>
      )}
      {thumbnail && <div className="shrink-0">{thumbnail}</div>}
      {/* min-w-0 が無いと、flex の既定(min-width: auto)により子の truncate が効かない
          (feed-item.tsx の FeedItemAttachment と同じ理由)。タイトルが長くても隣の
          サムネイル/アクション列の幅を奪わないよう、この列だけが縮む。 */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-sm font-bold text-text">{title}</div>
        {subtitle && <div className="truncate font-body text-xs text-text-dim">{subtitle}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}
