import type { MouseEvent, ReactNode } from 'react';
import Chip from '../components/chip.tsx';
import IconButton from '../components/icon-button.tsx';
import { HStack, VStack } from '../components/layout.tsx';
import Icon, { type IconName } from '../icons/icon.tsx';
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
// UserLabel は自身の HStack の中にアバター(hideAvatar で出し分け)+ 名前を持つので、
// ヘッダー行では UserLabel をそのまま置き、その"外側"(兄弟要素)にタイムスタンプを置く
// (UserLabel の subtitle は名前の"下"にしか出せないため、名前の"横"に置く用途には使えない)。
// avatarSrc を渡したときは UserLabel に src をそのまま渡してアバター付きレイアウトにし、
// 省略時は hideAvatar でコンパクト表示にする。
//
// ── アクション群はホバー/フォーカス時のみ見せる ───────────
// 既定で opacity-0 にして視覚的なノイズを減らすが、キーボード操作でも到達できないと
// 操作不能になるため group-focus-within:opacity-100 を必ず併記する(opacity は非表示でも
// tab 移動自体は止めない実装なので、これが無いとフォーカスは移るのに見えない状態が起きる)。
// レイアウトが飛ばないよう absolute にはせず、ヘッダー行の中に領域を確保したまま
// opacity だけを切り替える(表示/非表示で他要素の位置が動かない)。

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
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export type MessageItemAction = {
  // src/icons/icon.tsx のアイコン名("push_pin" / "reply" / "add_reaction" 等)。
  icon: IconName;
  // 読み上げ用ラベル。IconButton の aria-label になる。
  label: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export type MessageItemProps = {
  // 投稿者の表示名。UserLabel へそのまま渡す。
  authorName: string;
  // 投稿者名を押せるリンクにする。UserLabel の href と同じ挙動(中クリックで別タブ等)。
  authorHref?: string;
  // 投稿者名を押せるボタンにする。href と併用時は href が優先され、これはそのハンドラになる。
  authorOnClick?: (e: MouseEvent<HTMLElement>) => void;
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
  className?: string;
};

// アクション群は既定で隠し、ホバー/フォーカス時だけ見せる。group-focus-within を必ず
// 併記することで、キーボードで tab 移動してきたときも見える(#83 受け入れ条件)。
const ACTIONS_VISIBILITY =
  'opacity-0 transition-opacity duration-(--dur-fast) group-hover:opacity-100 group-focus-within:opacity-100';

export default function MessageItem({
  authorName,
  authorHref,
  authorOnClick,
  timestamp,
  avatarSrc,
  children,
  reactions,
  actions,
  className = '',
}: MessageItemProps) {
  return (
    // group はアクション群のホバー/フォーカス表示の起点になる。
    <VStack gap="xs" className={`group min-w-0 ${className}`.trim()}>
      <HStack gap="sm" align="center" justify="between">
        <HStack gap="sm" align="baseline" className="min-w-0">
          <UserLabel
            name={authorName}
            href={authorHref}
            onClick={authorOnClick}
            src={avatarSrc}
            hideAvatar={avatarSrc == null}
            size="sm"
          />
          {timestamp != null && (
            <span className="shrink-0 font-body text-xs text-text-dim">{timestamp}</span>
          )}
        </HStack>
        {actions != null && actions.length > 0 && (
          <HStack gap="xs" className={`shrink-0 ${ACTIONS_VISIBILITY}`}>
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
