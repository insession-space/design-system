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
// text-sm 等)は font-size と line-height が生む「strut」で行の高さが決まっており、バーの
// 決め打ち px はそれと一致しない(実測で1件あたり 23px のズレが出た)。そのため、この実装は
// MessageItem / UserLabel / Chip が実際に使っている
// テキストクラス(font-body text-small / font-body text-xs / text-sm など)をそのまま
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

// message-item.tsx の左カラムのアバター寸法(36px)に合わせる(#180)。ここだけ古い 24px
// (UserLabel size="sm" が内包していた寸法)に残すと、実データに差し替わった瞬間に左カラムの
// 幅が 24px → 36px に広がって本文の左端が横滑りする。
const AVATAR_SIZE = 36;
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
  // message-item.tsx と同じく、アバターの有無で分岐するのは"外枠"だけにして中身は一度だけ
  // 組む(#180)。
  const stack = (
    <>
      {/* ヘッダー行。message-item.tsx と同じく HStack(align="center" justify="between")。
          actions は出さないため子が1つしか無いが、justify="between" 自体は message-item.tsx と
          揃えておく(actions が現れても崩れない)。#180 でアバターが左カラムへ出たので、
          ここは UserLabel 相当の「名前 + 時刻」だけを持つ。 */}
      <HStack gap="sm" align="center" justify="between">
        {/* UserLabel の名前の行(trailing 有りのときの HStack align="baseline")と同じ
            入れ物・テキストクラス。名前 span(font-body font-bold text-small)+
            trailing(message-item.tsx のタイムスタンプ span と同じ font-body text-xs)を
            同じ行に並べる。strut が UserLabel の実際の行の高さを再現する。 */}
        <div className="min-w-0 flex-1">
          <HStack gap="xs" align="baseline" className="min-w-0">
            <span className="font-body font-bold text-small">
              <Skeleton width={NAME_WIDTH} height="0.7em" />
            </span>
            <span className="shrink-0 font-body text-xs">
              <Skeleton width={TIMESTAMP_WIDTH} height="0.7em" />
            </span>
          </HStack>
        </div>
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
    </>
  );

  // ルートの w-full min-w-0 は message-item.tsx と同じ理由(#97)。行方向 flex の子として
  // 置かれても与えられた幅を使い切る。
  const rootClass = `w-full min-w-0 ${className}`.trim();

  if (!avatar) {
    return (
      <VStack gap="xs" className={rootClass}>
        {stack}
      </VStack>
    );
  }

  return (
    // message-item.tsx の2カラム(#180)と同じ外枠。gap / align を揃えないと実データに
    // 差し替わったときに本文の左端が横滑りする。
    <HStack gap="sm" align="start" className={rootClass}>
      <div aria-hidden="true" className="shrink-0">
        <Skeleton circle size={AVATAR_SIZE} />
      </div>
      <VStack gap="xs" className="min-w-0 flex-1">
        {stack}
      </VStack>
    </HStack>
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
// 中の2つの span は Chip の絵文字 span(aria-hidden)/ 件数 span に対応する場所。1つ目のバーは
// 絵文字の見かけの縁(16×17px)に合わせた明示サイズにしている。2つ目(件数)は通常の数字と同じ
// 挙動なので、他の場所と同じ 0.7em の相対指定で strut に委ねている。
//
// ⚠ この 16×17px は「line-height: normal のとき、絵文字グリフのフォールバックフォントの
// 行間メトリクスがテキスト用フォントより大きくなる」ことへの対処として実測した値だった。
// #117 で全サイズトークンに実数の line-height を焼き込んだため、行の高さはフォントの
// メトリクスではなく指定した line-height が決めるようになっており、この前提はもう成り立たない。
// 高さを触るときは実測し直すこと。
function ReactionPillSkeleton() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-solid border-border-strong px-3.5 py-[7px] text-sm">
      <span>
        <Skeleton width={16} height={17} />
      </span>
      <span>
        <Skeleton width={14} height="0.7em" />
      </span>
    </span>
  );
}
