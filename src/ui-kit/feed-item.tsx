import type { ComponentProps, ReactNode } from 'react';
import Icon, { type IconName } from '../icons/icon.tsx';

// フィード(アクティビティ/タイムライン)の1件分。src/components/ のプリミティブと違い、
// これは複数のプリミティブを束ねた**複合**コンポーネントなので src/ui-kit/ に置く。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// ここが持つのは**見た目だけ**。カードの器・アバター列とのグリッド・種別アイコン付きの
// ヘッダ行・添付ストリップ、という並びと余白の取り決めがこのファイルの責務である。
//
// 逆に、次はいずれも**呼び出し側の責務**として意図的に持たない:
//   - 文言の解決(i18n)。`message` / `timeLabel` は**整形済みの文字列**を受け取る。
//     「2日前」のような相対時刻をここで計算しない(ロケールも時計もアプリのもの)。
//   - データ取得・更新(フォロー実行など)と画面遷移。`action` スロットに完成した
//     Button を差してもらう。
//   - `kind: 'space-live' | 'badge' | …` のような**プロダクト固有の union**。これを DS が
//     持つと、アプリの API 契約が変わるたびに DS が動く。受けるのは `kindIcon` という
//     見た目の指定だけで、kind → アイコンの対応表はアプリ側に残す。
//
// この線引きにより、フィードの中身(スペース参加/バッジ獲得/フォロー…)が増えても DS は
// 変わらず、アプリはスロットに差すものを足すだけで済む。

export type FeedItemProps = {
  // アバターのスロット。`<Avatar …/>` を想定するが、器のサイズは呼び出し側が決める。
  avatar?: ReactNode;
  // ヘッダ行の先頭に出す種別アイコン。省略すると名前から始まる。
  kindIcon?: IconName;
  // 行為者の表示名。空文字を渡さないよう、フォールバック(「ゲスト」等)は呼び出し側で解決する。
  name: ReactNode;
  // 「2日前」のような**整形済み**の時刻ラベル。中黒はこちらで付ける。
  timeLabel?: ReactNode;
  // 「スペースに参加しました」のような**整形済み**の本文。
  message?: ReactNode;
  // 添付スロット。`FeedItemAttachment` のストリップのほか、`Lozenge` 等のピルも入る。
  attachment?: ReactNode;
  className?: string;
} & Omit<ComponentProps<'article'>, 'className' | 'children' | 'title'>;

export function FeedItem({
  avatar,
  kindIcon,
  name,
  timeLabel,
  message,
  attachment,
  className = '',
  ...rest
}: FeedItemProps) {
  return (
    <article
      className={`flex gap-3 rounded-card border border-solid border-border bg-surface p-3.5 ${className}`.trim()}
      {...rest}
    >
      {/* アバターは本文が長くても縮まないよう固定幅の列にする。self-start により、
          カードが縦に伸びてもアバター自身は上端に留まる。 */}
      {avatar && <div className="shrink-0 self-start">{avatar}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* 名前が長いときは折り返す(truncate しない)。誰の出来事かは省略されるべきでないため。 */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {kindIcon && <Icon name={kindIcon} size={15} className="shrink-0 text-text-dim" />}
          <span className="font-body text-sm font-bold text-text">{name}</span>
          {timeLabel && <span className="font-body text-xs text-text-faint">· {timeLabel}</span>}
        </div>
        {message && <p className="font-body text-sm text-text-dim">{message}</p>}
        {attachment && <div className="mt-1">{attachment}</div>}
      </div>
    </article>
  );
}

export type FeedItemAttachmentProps = {
  // サムネイルのスロット。**枠(44×64・角丸・はみ出しの切り落とし・position: relative)は
  // こちらが持つ**ので、渡すのは中身だけでよい。枠いっぱいに敷きたい要素には
  // `h-full w-full` を、LIVE ピルのように隅へ置きたい要素には `absolute` を付ける
  // (基準はこの枠になる)。
  thumbnail?: ReactNode;
  // 1行目。1行に収まらなければ省略記号で切る。
  title: ReactNode;
  // 2行目(「0人が参加中」等)。同じく1行で切る。
  subtitle?: ReactNode;
  // 右端のアクションスロット。`<Button size="xs" …/>` を想定する。
  action?: ReactNode;
  className?: string;
} & Omit<ComponentProps<'div'>, 'className' | 'children' | 'title'>;

// FeedItem の `attachment` に差す横長ストリップ。カード本体より1段沈んだ面
// (bg-bg-elevated + border)にすることで、カードの中の「引用された対象」に見せる。
// 単体でも使えるよう別途 export する。
export function FeedItemAttachment({
  thumbnail,
  title,
  subtitle,
  action,
  className = '',
  ...rest
}: FeedItemAttachmentProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md border border-solid border-border bg-bg-elevated p-2.5 ${className}`.trim()}
      {...rest}
    >
      {thumbnail && (
        <div className="relative flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md text-on-accent">
          {thumbnail}
        </div>
      )}
      {/* min-w-0 が無いと、flex の既定(min-width: auto)により子の truncate が効かない。 */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-smd font-bold text-text">{title}</div>
        {subtitle && <div className="truncate font-body text-xs text-text-dim">{subtitle}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
