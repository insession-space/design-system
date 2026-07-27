import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import Chip from '../components/chip.tsx';
import IconButton from '../components/icon-button.tsx';
import { HStack, VStack } from '../components/layout.tsx';
import Icon, { type IconName } from '../icons/icon.tsx';
import { hasSlotContent } from './slot.ts';
import UserLabel from './user-label.tsx';

// 「誰かの投稿1件」を表す複合コンポーネント(#83)。UserLabel / Chip / IconButton を束ねるので
// src/ui-kit/ に置く。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// InSession の space 内チャット発言にも、loophub のスレッド投稿/コメントにも使える汎用部品と
// して作る。そのため props 名・型名は `chat*` のようなチャット固有の語彙を避け、
// 「投稿(message)」という中立的な語彙で統一する。
//
// 次はいずれも呼び出し側の責務として持たない:
//   - 時刻の整形・相対時刻("3分前" 等)。`timestamp` は整形済みの文字列を受け取るだけ。
//   - i18n・ルーター・認証。表示名の遷移/操作は UserLabel に委ね、authorHref/authorOnClick で
//     注入する。
//   - リアクションピッカー(絵文字選択 UI)そのもの。`add_reaction` のような action は
//     onClick を発火するだけで、ピッカーを開く/閉じるのは呼び出し側が持つ。
//   - 連続投稿のグルーピング・日付区切り・投稿リストのコンテナ(別 Issue の範囲)。
//
// ── 表示名は必ず UserLabel に委譲する ───────────────────
// 表示名の押せる/押せない分岐(href/onClick/disabled)は UserLabel の実装そのものに委ねる。
// avatarSrc を渡したときは UserLabel に src をそのまま渡してアバター付きレイアウトにし、
// 省略時は hideAvatar でコンパクト表示にする。
//
// ⚠ タイムスタンプは UserLabel の"外側"(兄弟要素)ではなく UserLabel の trailing に渡す
// (#97)。以前は外側の HStack align="baseline" で名前とタイムスタンプを並べていたが、
// UserLabel 自身の内側は HStack align="center" のフレックスで、その最初の要素はアバターの
// <div>(テキストを持たない)。フレックスの first baseline はこのアバター div から合成される
// ため、外側の align="baseline" は「名前のベースライン」ではなくアバターの下端を基準にして
// しまい、実測で時刻が名前より約5px 下にずれていた。trailing は名前と同じ flex 行の
// テキスト同士として描かれるため、アバターの有無や href/onClick による要素分岐に関係なく
// ベースラインが一致する(詳細は user-label.tsx のコメント参照)。
//
// ── アクション群はホバー/フォーカス時のみ見せる ───────────
// 既定で opacity-0 にして視覚的なノイズを減らすが、キーボード操作でも到達できないと
// 操作不能になるため group-focus-within:opacity-100 を必ず併記する(opacity は非表示でも
// tab 移動自体は止めない実装なので、これが無いとフォーカスは移るのに見えない状態が起きる)。
// レイアウトが飛ばないよう absolute にはせず、ヘッダー行の中に領域を確保したまま
// opacity だけを切り替える(表示/非表示で他要素の位置が動かない)。
// この opacity 制御は actions(IconButton 群)にだけ当て、actionsSlot には当てない
// (下記 actionsSlot の説明を参照)。
//
// ── actionsSlot: ヘッダー右に任意のノードを置ける口(#97) ────
// actions は `{icon,label,onClick}` の配列しか表現できず、Popover を伴うアクション
// (絵文字ピッカー等)を表現できない。消費側(insession-app)はこれを MessageItem の
// "兄弟"として行方向 flex の中に横並びで置かざるを得なかったが、アクション UI は非表示
// (opacity-0)でも in-flow のため常時レイアウト幅を占有し、本文の折り返し幅を奪っていた
// (実測で本文が約100px 分狭くなり早期折り返しが起きていた)。actionsSlot はヘッダー行の
// 中(actions と同じ領域、actions の後ろ)に任意のノードを描画できる差し込み口を用意し、
// 消費側が兄弟として置く必要をなくす。表示/非表示の制御(ホバー時のみ見せる、タッチ端末で
// data-actions-open を使う等)は消費側が独自に持っているため、DS 側の ACTIONS_VISIBILITY を
// 被せると衝突する。そのため actionsSlot には opacity 制御を当てず、shrink-0 のコンテナに
// 入れるだけにする。

export type MessageItemReaction = {
  // 絵文字そのもの("🙂" 等)。
  emoji: ReactNode;
  // 押した人数。
  count: number;
  // 自分がこのリアクションを押しているか。true で視覚的に強調する。
  reacted?: boolean;
  // 絵文字の意味を伝える読み上げ用ラベル("にっこり" 等)。絵文字だけでは読み上げられない/
  // 意味が伝わらないため必須にする。
  label: string;
  onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
};

export type MessageItemAction = {
  // src/icons/icon.tsx のアイコン名("push_pin" / "reply" / "add_reaction" 等)。
  icon: IconName;
  // 読み上げ用ラベル。IconButton の aria-label になる。
  label: string;
  onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
};

export type MessageItemProps = {
  // 投稿者の表示名。UserLabel へそのまま渡す。
  authorName: string;
  // 投稿者名を押せるリンクにする。UserLabel の href と同じ挙動(中クリックで別タブ等)。
  authorHref?: string;
  // 投稿者名を押せるボタンにする。href と併用時は href が優先され、これはそのハンドラになる。
  authorOnClick?: (e: ReactMouseEvent<HTMLElement>) => void;
  // 整形済みの時刻文字列("01:03" 等)。DS は時刻整形ロジックを持たないためそのまま表示する。
  timestamp?: ReactNode;
  // アバター画像 URL。省略時はアバター無しのコンパクト表示になる。
  avatarSrc?: string | null;
  // 投稿本文。テキストに限らずリンク・添付なども差し込める。
  children?: ReactNode;
  // リアクションピルの並び。省略/空配列ならリアクション行を出さない。
  reactions?: MessageItemReaction[];
  // ホバー/フォーカス時に出るアクションアイコン群。省略/空配列なら領域自体を出さない。
  actions?: MessageItemAction[];
  // ヘッダー右側(actions の後ろ)に置く任意のノード。Popover を伴うアクション
  // (絵文字ピッカー等)のように actions では表現できない UI 向け。actions と併存できる。
  // opacity による表示/非表示の制御は当てない(表示/非表示は消費側の責務。上記コメント参照)。
  actionsSlot?: ReactNode;
  className?: string;
};

// アクション群は既定で隠し、ホバー/フォーカス時だけ見せる。group-focus-within を必ず
// 併記することで、キーボードで tab 移動してきたときも見える(#83 受け入れ条件)。
const ACTIONS_VISIBILITY =
  'opacity-0 transition-opacity duration-(--dur-fast) group-hover:opacity-100 group-focus-within:opacity-100';

// 投稿者名を押せるようにしている(href / onClick)ときだけ、その内側に載る時刻を「押せない飾り」に
// 落とすためのハンドラ。preventDefault が <a href> の遷移を、stopPropagation が <button> の
// onClick への伝播を止める。
// ⚠ 残る経路: <a href> を右クリックしてコンテキストメニューから「新しいタブで開く」を選ぶ操作は
// DOM イベントでは止められない。<a> の中に入れた子要素である以上これは避けられないので、時刻を
// 完全に不活性にしたい消費側は authorHref ではなく authorOnClick(=<button>。中クリック/
// コンテキストメニューで遷移しない)を使う。
function swallowActivation(e: ReactMouseEvent<HTMLElement>) {
  e.preventDefault();
  e.stopPropagation();
}

// 中クリックは mousedown の時点で「新しいタブで開く」の対象が決まるブラウザがあるため、
// 中ボタン(button === 1)のときだけ mousedown も止める。左クリックは止めない — 止めると
// 投稿者名側のフォーカス移動やテキスト選択まで壊れるため。
function swallowMiddleMouseDown(e: ReactMouseEvent<HTMLElement>) {
  if (e.button === 1) {
    e.preventDefault();
    e.stopPropagation();
  }
}

export default function MessageItem({
  authorName,
  authorHref,
  authorOnClick,
  timestamp,
  avatarSrc,
  children,
  reactions,
  actions,
  actionsSlot,
  className = '',
}: MessageItemProps) {
  const hasHeaderTrailing = (actions != null && actions.length > 0) || hasSlotContent(actionsSlot);
  // 投稿者名を押せるようにしているか(href / onClick)。UserLabel は操作可能なとき行全体を
  // <a>/<button> にするので、trailing に載せた時刻もその操作領域の"内側"に入る。時刻は
  // 押しても何も起きない飾りなので、操作可能なときだけ次の2点で無害化する(#97):
  //   - ポインタ: 時刻のクリックを preventDefault + stopPropagation で止める(押しても
  //     プロフィールへ遷移しない)。
  //   - 読み上げ: 時刻を aria-hidden にし、代わりに UserLabel へ ariaLabel(表示名のみ)を
  //     渡してリンク名が「表示名 + 時刻」に汚れないようにする。そのままだと時刻が支援技術から
  //     消えてしまうので、操作領域の"外側"に sr-only の時刻を1つ置いて読み上げを維持する。
  // 押せないとき(既定)は素の <div> なのでこの手当ては不要 — DOM を増やさない。
  const authorInteractive = authorHref != null || authorOnClick != null;
  const hasInertTimestamp = authorInteractive && timestamp != null;
  return (
    // group はアクション群のホバー/フォーカス表示の起点になる。w-full は min-w-0 が
    // 「縮むことを許可」するだけで幅を取り切る指定ではないための併記(#97)。行方向 flex
    // の子として置かれたとき(消費側が MessageActionBar 等と横並びにする場合)、与えられた
    // 幅を使い切って本文の折り返し幅を最大化する。
    <VStack gap="xs" className={`group w-full min-w-0 ${className}`.trim()}>
      <HStack gap="sm" align="center" justify="between">
        <UserLabel
          name={authorName}
          href={authorHref}
          onClick={authorOnClick}
          src={avatarSrc}
          hideAvatar={avatarSrc == null}
          size="sm"
          ariaLabel={hasInertTimestamp ? authorName : undefined}
          trailing={
            timestamp != null ? (
              <span
                className="font-body text-xs text-text-dim"
                aria-hidden={hasInertTimestamp || undefined}
                onClick={hasInertTimestamp ? swallowActivation : undefined}
                // 中クリック(新しいタブで開く)は click ではなく auxclick / mousedown の経路を
                // 通るので、onClick だけでは <a> の既定動作を止められない。両方を塞ぐ。
                onAuxClick={hasInertTimestamp ? swallowActivation : undefined}
                onMouseDown={hasInertTimestamp ? swallowMiddleMouseDown : undefined}
              >
                {timestamp}
              </span>
            ) : undefined
          }
        />
        {hasInertTimestamp && <span className="sr-only">{timestamp}</span>}
        {hasHeaderTrailing && (
          <HStack gap="xs" className="shrink-0">
            {actions != null && actions.length > 0 && (
              <HStack gap="xs" className={ACTIONS_VISIBILITY}>
                {actions.map((action) => (
                  <IconButton
                    key={action.label}
                    label={action.label}
                    icon={<Icon name={action.icon} size={16} />}
                    variant="ghost"
                    size={28}
                    onClick={action.onClick}
                  />
                ))}
              </HStack>
            )}
            {actionsSlot}
          </HStack>
        )}
      </HStack>
      {children != null && (
        <div className="min-w-0 whitespace-pre-wrap break-words font-body text-small text-text">
          {children}
        </div>
      )}
      {reactions != null && reactions.length > 0 && (
        <HStack gap="xs" wrap className="mt-0.5">
          {reactions.map((reaction, index) => (
            <Chip
              // biome-ignore lint/suspicious/noArrayIndexKey: 絵文字は重複しうるため index を使う
              key={index}
              selected={reaction.reacted}
              // 押しているかは面と枠(accent tint + accent 枠)で示す。check は出さない —
              // 絵文字の隣にチェックが並ぶと、何に対する肯定なのかが読めなくなるため。
              showCheck={false}
              aria-label={`${reaction.label} ${reaction.count}`}
              onClick={reaction.onClick}
            >
              <span aria-hidden="true">{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </Chip>
          ))}
        </HStack>
      )}
    </VStack>
  );
}
