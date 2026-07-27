import type { ComponentProps, ReactNode } from 'react';
import { Card } from '../components/surface.tsx';

// メディア/ライブのカード(#94)。Card(surface.tsx)を器にカバー画像・バッジ列・タイトル/メタ/
// 参加者を束ねる複合コンポーネントなので src/ui-kit/ に置く。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// 持つのは「カバーをカード内側にインセットして置く枠 → 右上にバッジ列を絶対配置できる土台 →
// タイトル → メタ行 → フッター」という並び・余白・truncate の取り決めだけ。
//
// 逆に、次はいずれも呼び出し側の責務として意図的に持たない(feed-item.tsx / message-item.tsx と
// 同じ線引き):
//   - 「1 watching · playing · late night」のような**整形済み文字列の組み立て**。`meta` は
//     出来上がった文字列(または ReactNode)を受け取るだけで、件数の集計や i18n の文言解決は
//     一切しない。
//   - `kind: 'space-live' | 'video' | …` のような**プロダクト固有の union**。LIVE かどうか・
//     公開範囲がどうかは `overlay` スロットに Badge / CircleBadge を差してもらうことで表現し、
//     このコンポーネント自身は「右上に縦積みできる器」を提供するだけに留める。これにより
//     配信/動画/イベントなど種別が増えても DS 側は変わらない。
//   - 参加者データの取得・アバターの解決。`footer` に `<AvatarStack …/>` を差してもらう。
export type MediaCardProps = {
  // カバー画像のスロット。枠(16:9・角丸・overflow-hidden)はこちらが持つので、
  // 渡すのは中身(<img className="h-full w-full object-cover" …/> 等)だけでよい。
  cover?: ReactNode;
  // カバー右上に縦並びで置くバッジ列。器(縦積み・右上絶対配置)はこちらが持つので、
  // 渡すのは Badge / CircleBadge 等の中身だけでよい。
  overlay?: ReactNode;
  // 太字・大きめ・1行 truncate。
  title: ReactNode;
  // タイトル下のメタ行。グレー・1行 truncate。整形済みの文字列を受け取るだけ。
  meta?: ReactNode;
  // 最下部のスロット。`<AvatarStack …/>` を想定する。
  footer?: ReactNode;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className' | 'children' | 'title'>;

export function MediaCard({
  cover,
  overlay,
  title,
  meta,
  footer,
  className = '',
  ...rest
}: MediaCardProps) {
  return (
    <Card elevation={2} radius="card" padding="lg" className={className} {...rest}>
      {(cover || overlay) && (
        // 外枠は overlay の絶対配置の基準になるだけ。切り落とし(overflow-hidden)と角丸は
        // カバー自身の枠が持つので、ここで重ねて指定しない(重ねるとバッジが枠外へ
        // はみ出す演出を消費側が選べなくなる)。
        <div className="relative">
          {cover && (
            <div className="aspect-video w-full overflow-hidden rounded-md bg-surface-3">
              {cover}
            </div>
          )}
          {overlay && (
            <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">{overlay}</div>
          )}
        </div>
      )}
      {/* min-w-0 は不要(Card は flex コンテナではない)。truncate 自体は block 要素にも
          効くが、幅の基準を親(Card の padding 内側)に持たせるため w-full を明示する。 */}
      <div className="mt-3 w-full">
        <div className="truncate font-display text-md font-bold text-text">{title}</div>
        {meta && <div className="truncate font-body text-xs text-text-dim">{meta}</div>}
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </Card>
  );
}

// カバー右上のバッジ列に置く円形バッジ(公開範囲アイコン等)。Badge(badge.tsx)は横長のピル/
// 角丸矩形専用なので、正円が要る用途(アイコン単体を丸い地に載せる)はこちらを使う。
// 増やしすぎない方針のため、MediaCard 用の最小限の1つだけを切り出す。
export type CircleBadgeProps = {
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<'span'>, 'className' | 'children'>;

export function CircleBadge({ children, className = '', ...rest }: CircleBadgeProps) {
  return (
    <span
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-pill bg-surface-3 text-text-dim ${className}`.trim()}
      {...rest}
    >
      {children}
    </span>
  );
}
