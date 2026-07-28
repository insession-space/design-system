import type { MouseEvent, ReactNode } from 'react';
import Avatar, { type AvatarStatus } from '../components/avatar.tsx';
import { type Gap, HStack, VStack } from '../components/layout.tsx';
import { hasSlotContent } from './slot.ts';

// アバター + ユーザー名の複合コンポーネント(#62)。src/components/ のプリミティブ(Avatar /
// HStack / VStack)を束ねるので src/ui-kit/ に置く。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// 持つのは「アバター寸法とテキストサイズを連動させる」という取り決めだけ。呼び出し側が
// Avatar とテキストを別々に組み合わせると size 指定を揃え忘れてタイポが崩れる(アバターだけ
// 大きい/文字だけ大きい)問題が起きるため、3段階の size を1つの Record にまとめてここで固定する。
//
// アバターは隣に同じ名前が出るぶん装飾でしかないので aria-hidden で支援技術から隠す
// (隠さないと Avatar の alt と fallback の頭文字で名前が二重に読まれる)。
//
// ── 操作可能な「人の行」も担う ───────────────────────────
// href を渡せば <a>、onClick を渡せば <button>、どちらも無ければ既定の <div> を描く。
// 人を表す行は「表示だけ」「プロフィールへ遷移」「モーダルを開く」の3通りがあり、消費側が
// 外側を素の <button>/<a> で包むと打ち消しユーティリティの列(bg-transparent / border-none /
// p-0 / text-left …)を毎回書くことになる。それを DS 側へ引き取る。
//
// 旧 ListRow を廃止してここへ集約した。ListRow は icon/label/description を別々に受ける形で、
// 人の行に使うと「アバター寸法と文字サイズを連動させる」という UserLabel の保証が効かず、
// label を <span> で包む実装のため UserLabel を入れると不正なネストになっていた。
//
// ── trailing: 名前と同じベースラインに置く小さな要素(#97) ─────
// 名前の右に、名前と同じベースラインで置きたい要素(時刻・バッジ等)向けの差し込み口。
// 名前の"下"に置く subtitle と対になる(subtitle = 縦、trailing = 横)。
// 名前のテキスト列(名前の <span> を含む行)の中に、名前と trailing を
// `HStack align="baseline"` で並べて描く。これにより名前と trailing は同じ flex 行の
// テキスト同士になり、ベースラインが機械的に一致する。
// ⚠ 消費側が MessageItem のヘッダーでやっていたように「UserLabel の外側(兄弟)」に時刻を
// 置くと、外側の align="baseline" は UserLabel の HStack の first baseline(= アバター div。
// テキストを持たないため下端が基準になる)を拾ってしまい、名前のベースラインとは揃わない
// (アバターの有無や href/onClick による要素分岐(<div>/<a>/<button>)に関係なくズレる)。
// trailing はこの問題を UserLabel の内側で解消する。旧コメントにあった「subtitle は名前の
// "下"にしか出せないため、名前の"横"に置く用途には使えない」という制約はこの trailing で
// 解消された。
// ⚠ href/onClick を渡して行全体が <a>/<button> になっているときは、trailing もその操作領域の
// 内側に入る。時刻のように押させたくないものを置く場合は消費側が考慮すること
// (例: pointer-events を切る、あるいは時刻を押しても問題ない設計にする)。
//
// ⚠ Avatar は status / ring を指定しないと legacy 経路(素の img/span。見た目を消費側 CSS に
// 依存)を返す(avatar.tsx 参照)。UserLabel は status 指定の有無で見た目・fallback 挙動が
// ぶれると困るため、常に Avatar へ `ds` を渡して DS 経路(Base UI の Avatar.Root/Image/
// Fallback)で描画させる(#62 で avatar.tsx に追加した内部フラグ)。

export type UserLabelSize = 'sm' | 'md' | 'lg';

type SizeSpec = {
  // Avatar の寸法(px)。
  avatar: number;
  // 名前行の文字サイズクラス。
  name: string;
  // subtitle 行の文字サイズクラス。
  subtitle: string;
  // アバターとテキスト列の間の gap(HStack)。
  gap: Gap;
  // 名前と subtitle の間の gap(VStack)。
  stackGap: Gap;
};

// サイズごとの寸法・文字サイズはここに1つだけ定義する(呼び出し側でのタイポずれを防ぐのが
// 本コンポーネントの主目的)。text-* はいずれも src/styles/theme.css の --text-* トークンから
// 生成される既存クラス(text-body / text-small 等)で、色値と同様に生の px を書かない。
// 名前は DS のセマンティック階層(text-small / text-body / text-h2)を1段ずつ上げ、subtitle は
// 常にその1段下を当てる。3段とも実寸が変わる(14/16/22px)ようにしてあるので、size を上げると
// アバターと文字が揃って大きくなる。
const SIZE: Record<UserLabelSize, SizeSpec> = {
  sm: { avatar: 24, name: 'text-small', subtitle: 'text-xs', gap: 'sm', stackGap: 'none' },
  md: { avatar: 40, name: 'text-body', subtitle: 'text-small', gap: 'md', stackGap: 'xs' },
  lg: { avatar: 56, name: 'text-h2', subtitle: 'text-body', gap: 'md', stackGap: 'xs' },
};

export type UserLabelProps = {
  // 表示するユーザー名。
  name: string;
  // アバター画像 URL。無し/読み込み失敗時は Avatar の fallback(名前の頭文字)に切り替わる。
  src?: string | null;
  // 名前の下に出す補助テキスト(役割・肩書きなど)。省略時は1行表示になる。
  subtitle?: ReactNode;
  // 名前の右に、名前と同じベースラインで置く小さな要素(時刻・バッジ等)。subtitle(名前の
  // "下")と対になる差し込み口。省略時は DOM も見た目も従来と完全に一致する。
  trailing?: ReactNode;
  size?: UserLabelSize;
  // true でアバターを描画しない(コンパクト表示)。既定 false(常時表示)は変えない —
  // 既存呼び出し側の見た目を変えないための後方互換の既定値。
  hideAvatar?: boolean;
  // 以下は Avatar へそのまま透過する。
  status?: AvatarStatus;
  ring?: boolean;
  color?: string;
  bgColor?: string;
  // 遷移先。指定すると行全体が <a> になる(中クリックで別タブ・リンクのコピーができる)。
  href?: string;
  // href と併用するリンク属性。href が無いときは無視される。
  target?: string;
  rel?: string;
  // 押したときの動作。href が無く onClick があると行全体が <button> になる。
  // href と onClick を両方渡した場合は <a> が優先され、onClick はそのリンクのハンドラになる。
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  // 操作可能なとき(href / onClick)のみ意味を持つ。押せない見た目にして操作を止める。
  disabled?: boolean;
  // 操作可能なときの読み上げラベル。省略時は中身(名前 + subtitle)がそのまま読まれる。
  ariaLabel?: string;
  className?: string;
};

// 操作可能にしたときだけ当てる打ち消し + 状態表現。素の <button> / <a> が持つ既定
// (塗り・padding・下線・色)を消し、面はホバーでだけ出す。行そのものが押せることを
// 示すため cursor と focus リングをここで持つ(消費側で毎回書かせない)。
const INTERACTIVE =
  'w-full rounded-md border-none bg-transparent p-0 text-left no-underline transition-colors motion-reduce:transition-none duration-(--dur-fast) focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring';
const INTERACTIVE_ENABLED = 'cursor-pointer hover:bg-surface-hover';
// ⚠ hover の面は disabled のときに出さない。薄いのに反応する見た目は押せると誤解させる
// (list-row.tsx が持っていた注意点をここへ引き継ぐ)。
const INTERACTIVE_DISABLED = 'cursor-not-allowed opacity-50';

export default function UserLabel({
  name,
  src,
  subtitle,
  trailing,
  size = 'md',
  hideAvatar = false,
  status,
  ring,
  color,
  bgColor,
  href,
  target,
  rel,
  onClick,
  disabled = false,
  ariaLabel,
  className = '',
}: UserLabelProps) {
  const spec = SIZE[size];
  // href → <a> / onClick → <button> / どちらも無ければ既定の <div>(HStack のまま)。
  // 「押せるのに div」を避けるため、操作を受け取るときだけ要素を差し替える。
  const interactive = href != null || onClick != null;
  const interactiveClass = interactive
    ? ` ${INTERACTIVE} ${disabled ? INTERACTIVE_DISABLED : INTERACTIVE_ENABLED}`
    : '';
  const rootClass = `min-w-0${interactiveClass} ${className}`.trim();

  const body = (
    <HStack gap={spec.gap} align="center" className={interactive ? 'min-w-0' : rootClass}>
      {/* アバターは隣の名前と同じ情報しか持たない装飾なので支援技術から隠す。隠さないと
          Avatar の alt(= name)と fallback の頭文字が読み上げられ、名前が二重に読まれる。
          hideAvatar=true のときはこの div 自体を描画しない(コンパクト表示。#83)。 */}
      {!hideAvatar && (
        <div aria-hidden="true" className="shrink-0">
          <Avatar
            ds
            name={name}
            src={src}
            size={spec.avatar}
            status={status}
            ring={ring}
            color={color}
            bgColor={bgColor}
          />
        </div>
      )}
      {/* min-w-0 が無いと flex の既定(min-width: auto)により子の truncate が効かない
          (feed-item.tsx の FeedItemAttachment と同じ理由)。 */}
      <div className="min-w-0 flex-1">
        {(() => {
          // 名前の行。trailing が無いときは従来どおり単独の <span> のまま描く(DOM を
          // 増やさない)。trailing があるときだけ HStack align="baseline" で名前と
          // trailing を並べ、同じ行のテキスト同士としてベースラインを揃える。
          const nameRow = hasSlotContent(trailing) ? (
            <HStack gap="xs" align="baseline" className="min-w-0">
              <span className={`min-w-0 truncate font-body font-bold text-text ${spec.name}`}>
                {name}
              </span>
              <span className="shrink-0">{trailing}</span>
            </HStack>
          ) : (
            <span className={`block truncate font-body font-bold text-text ${spec.name}`}>
              {name}
            </span>
          );

          return subtitle != null ? (
            <VStack gap={spec.stackGap} className="min-w-0">
              {nameRow}
              <span className={`block truncate font-body text-text-dim ${spec.subtitle}`}>
                {subtitle}
              </span>
            </VStack>
          ) : (
            nameRow
          );
        })()}
      </div>
    </HStack>
  );

  if (href != null) {
    return (
      // disabled なリンクは HTML に無いので、遷移を止めつつ支援技術にも無効だと伝える。
      <a
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={rootClass}
      >
        {body}
      </a>
    );
  }

  if (onClick != null) {
    return (
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
        className={rootClass}
      >
        {body}
      </button>
    );
  }

  return body;
}
