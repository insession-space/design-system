import { HStack, VStack } from '../components/layout.tsx';
import Skeleton from '../components/skeleton.tsx';

// `MessageItem`(src/ui-kit/message-item.tsx)の読み込み中プレースホルダ(#87)。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// `MessageItem` と同じレイアウト骨格(ヘッダー行 / 本文 / リアクション行)を、同じ
// VStack/HStack の gap で組む。実データに差し替わったときのレイアウトシフトを最小にするのが
// 唯一の目的なので、MessageItem 側のレイアウトを変えたときはこちらも追随させること。
//
// 次はいずれも持たない:
//   - ホバーアクション(actions)のプレースホルダ。読み込み中は操作できないため出す意味が無い。
//   - 「読み込み中」の読み上げ(aria-busy / live region)。呼び出し側の責務(Skeleton 参照)。
//
// ── 各行の高さは px の決め打ちにしない ───────────────────
// 最初の実装は各バーの height を px で固定していたが、実物(UserLabel の text-small / Chip の
// text-[12.5px] 等)は font-size と line-height(またはブラウザ既定の "normal")が生む
// 「strut」で行の高さが決まっており、バーの決め打ち px はそれと一致しない(実測で1件あたり
// 23px のズレが出た)。そのため、この実装は MessageItem / UserLabel / Chip が実際に使っている
// テキストクラス(font-body text-small / font-body text-xs / text-[12.5px] など)をそのまま
// バーの外側の span に当て、バー自体は `<span>` の中の装飾(高さ 0.7em 程度)として置くだけに
// する。span はこれらの HStack の子であるため flex アイテムとして自動的に block 化され、
// テキストが無くても strut ぶんの高さを確保する(CSS の仕様上、フォントサイズ/行間を持つ
// block 要素は、中に何かインライン要素が1つでもあれば、その内容の高さに関わらず
// 最低でも1行分の高さを確保する)。トークン(--text-small 等)が変われば実物とスケルトンが
// 揃って追従する。
export type MessageItemSkeletonProps = {
  // アバター円のプレースホルダを出すか。MessageItem の avatarSrc 有り時の見た目に合わせる。既定 false。
  avatar?: boolean;
  // 本文のプレースホルダ行数。既定 1。
  lines?: number;
  // リアクションピルのプレースホルダ数。0/省略ならリアクション行自体を出さない。
  reactions?: number;
  className?: string;
};

// UserLabel(size="sm")の avatar 寸法(24px)に合わせる。
const AVATAR_SIZE = 24;
// 表示名プレースホルダのおおよその幅(px)。実際の名前の長さは様々なので固定の目安幅にする
// (高さには影響しない — 高さは外側の span の text-small strut が決める)。
const NAME_WIDTH = 88;
const TIMESTAMP_WIDTH = 32;

export default function MessageItemSkeleton({
  avatar = false,
  lines = 1,
  reactions = 0,
  className = '',
}: MessageItemSkeletonProps) {
  return (
    <VStack gap="xs" className={`min-w-0 ${className}`.trim()}>
      {/* ヘッダー行。message-item.tsx と同じ二重の HStack(外側 justify="between" / 内側
          align="baseline")+ UserLabel 相当の内側 HStack(align="center")構造にする。
          actions は出さないため外側 HStack には子が1つしか無いが、justify="between" 自体は
          message-item.tsx と揃えておく(actions が現れても崩れない)。 */}
      <HStack gap="sm" align="center" justify="between">
        <HStack gap="sm" align="baseline" className="min-w-0">
          <HStack gap="sm" align="center" className="min-w-0">
            {/* UserLabel のアバター div(aria-hidden shrink-0。文字サイズクラスを持たない)と
                同じ入れ物にする。この div はテキストクラスを持たないぶん基準フォント
                (ページ既定サイズ)の strut を生み、実物のヘッダー行の高さはアバター24pxでは
                なくこの strut(UserLabel 側の実測どおり)で決まっている。同じ入れ物構造に
                しないとここだけ 24px 側に寄ってズレる。 */}
            {avatar && (
              <div aria-hidden="true" className="shrink-0">
                <Skeleton circle size={AVATAR_SIZE} />
              </div>
            )}
            {/* UserLabel の名前 div(min-w-0 flex-1)+ span(font-body font-bold text-small)と
                同じ入れ物・テキストクラス。strut が UserLabel の実際の行の高さを再現する。 */}
            <div className="min-w-0 flex-1">
              <span className="font-body font-bold text-small">
                <Skeleton width={NAME_WIDTH} height="0.7em" />
              </span>
            </div>
          </HStack>
          {/* message-item.tsx のタイムスタンプ span(font-body text-xs text-text-dim)と
              同じテキストクラス。 */}
          <span className="shrink-0 font-body text-xs">
            <Skeleton width={TIMESTAMP_WIDTH} height="0.7em" />
          </span>
        </HStack>
      </HStack>
      {/* 本文。message-item.tsx の本文 div(font-body text-small)と同じテキストクラスを
          Skeleton.Text の既定(textClassName)に委ねる。 */}
      <Skeleton.Text lines={lines} />
      {reactions > 0 && (
        <HStack gap="xs" wrap className="mt-0.5">
          {Array.from({ length: reactions }, (_, index) => (
            <ReactionPillSkeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: プレースホルダで内容を持たないため index で十分
              key={index}
            />
          ))}
        </HStack>
      )}
    </VStack>
  );
}

// Chip(src/components/chip.tsx)と同じ外形クラス(pad/border/文字サイズ)を持つプレースホルダ。
// Chip は操作可能な <button> だが、ここでは静的な <span> に持ち替え、cursor/hover/transition
// 等の対話用クラスは落とす(外形=pad・border・文字サイズだけ揃えれば高さは一致する)。
//
// ⚠ 外枠には Chip の bg-surface-2 を**当てない**(枠線だけの中空にする)。中のバーも面は
// surface-2 なので、外枠まで同じ面で塗るとバーが背景に溶けて中身が見えなくなる。動いている
// 間は shimmer のハイライトで辛うじて区別が付くが、prefers-reduced-motion: reduce では
// そのハイライトごと消えるため、ベタ塗りのピルが1つ残るだけになってしまう。
//
// 中の2つの span は Chip の絵文字 span(aria-hidden)/ 件数 span に対応する場所。⚠ 実測すると
// 絵文字を実際に置いた行の高さ(21px)は、同じ text-[12.5px] の「テキストが無いときの
// strut」だけでは再現できない(絵文字グリフを描く際にフォールバックの絵文字フォントが
// 使われ、そのフォントの行間メトリクスがテキスト用フォントより大きいため)。したがって
// 1つ目のバーだけ絵文字の見かけの縁(実測 16×17px)に合わせた明示サイズにしている
// (Chip 側の絵文字サイズが変わったときはここも実測して合わせ直すこと)。2つ目(件数)は
// 通常の数字と同じ挙動なので、他の場所と同じ 0.7em の相対指定で strut に委ねている。
function ReactionPillSkeleton() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-solid border-border-strong px-3.5 py-[7px] text-[12.5px]">
      <span>
        <Skeleton width={16} height={17} />
      </span>
      <span>
        <Skeleton width={14} height="0.7em" />
      </span>
    </span>
  );
}
