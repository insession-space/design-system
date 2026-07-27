import { MessageItem } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// MessageItem のカタログ。「誰かの投稿1件」を表す複合コンポーネント。InSession の space 内
// チャット発言にも、loophub のスレッド投稿/コメントにも使える汎用部品であることを示すため、
// チャット用途とスレッド投稿用途の両方のストーリーを置く。
const meta: Meta = {
  title: 'Patterns/MessageItem',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// 外部に依存しない data URI の画像(UserLabel ストーリーの AVATAR_SRC と同じ手段)。
const AVATAR_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%2312d8c9'/%3E%3C/svg%3E";

const ACTIONS = [
  { icon: 'push_pin' as const, label: 'ピン留め', onClick: () => {} },
  { icon: 'reply' as const, label: '返信', onClick: () => {} },
  { icon: 'add_reaction' as const, label: 'リアクション', onClick: () => {} },
];

export const Basic: Story = {
  render: () => (
    <Section title="基本" note="avatarSrc を省略するとアバター無しのコンパクト表示になる。">
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03">
          こんにちは
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithReactions: Story = {
  render: () => (
    <Section
      title="リアクション複数(reacted の有無が混在)"
      note="reacted: true のピルは枠線と背景で強調される。Chip の selected を showCheck={false} で使っているので、行頭に check は付かない(絵文字と並ぶと何に対する肯定か読めなくなるため)。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          reactions={[
            { emoji: '🙂', count: 1, reacted: true, label: 'にっこり', onClick: () => {} },
            { emoji: '🎉', count: 3, reacted: false, label: 'お祝い', onClick: () => {} },
            { emoji: '👍', count: 2, reacted: false, label: 'いいね', onClick: () => {} },
          ]}
        >
          リリースできました
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Section
      title="アクション群のホバー表示"
      note="既定は opacity-0 で隠れており、ホバーまたはキーボードフォーカス(group-focus-within)で表示される。実際に触って確認する。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" actions={ACTIONS}>
          ホバーすると右上にアクションが出る
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <Section title="アバター有り" note="avatarSrc を渡すとアバター付きレイアウトになる。">
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
          アバター付きの投稿
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithoutAvatar: Story = {
  render: () => (
    <Section
      title="アバター無し"
      note="avatarSrc を省略すると UserLabel の hideAvatar が効き、コンパクト表示になる。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03">
          アバター無しの投稿
        </MessageItem>
      </div>
    </Section>
  ),
};

export const LongTextWithLineBreaks: Story = {
  render: () => (
    <Section title="長文・改行" note="改行を保持しつつ、コンテナ幅で折り返す。">
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
          {
            'これはとても長い投稿本文の確認用テキストです。折り返しと改行の両方が意図どおりに表示されるかを確認します。\n2行目です。\n3行目もあります。'
          }
        </MessageItem>
      </div>
    </Section>
  ),
};

export const ChatUsage: Story = {
  render: () => (
    <Section
      title="チャット用途"
      note="space 内チャットのような、連投が多く短い発言の並び。アバター無しのコンパクト表示 + タイムスタンプ + リアクション + ホバーアクションを組み合わせる。"
    >
      <div className="flex max-w-xl flex-col gap-3 rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:02"
          actions={ACTIONS}
          reactions={[
            { emoji: '🙂', count: 1, reacted: true, label: 'にっこり', onClick: () => {} },
          ]}
        >
          もうすぐ配信始めます
        </MessageItem>
        <MessageItem authorName="川村静哉" timestamp="01:03" actions={ACTIONS}>
          お待たせしました、始めます!
        </MessageItem>
      </div>
    </Section>
  ),
};

export const LongJapaneseTextWrapping: Story = {
  render: () => (
    <Section
      title="長文日本語の折り返し(#97)"
      note="本文が親幅いっぱいまで使って折り返すことを確認する。アバターあり/なしの両方。"
    >
      <div className="flex max-w-xl flex-col gap-3 rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
          今日のミーティングでは新しいデザインシステムのコンポーネント設計について話し合いました。特にメッセージ一覧のレイアウトが早く折り返してしまう問題があり、原因はヘッダー行のベースラインのずれとアクションバーの領域確保にあることがわかりました。
        </MessageItem>
        <MessageItem authorName="川村静哉" timestamp="01:03">
          今日のミーティングでは新しいデザインシステムのコンポーネント設計について話し合いました。特にメッセージ一覧のレイアウトが早く折り返してしまう問題があり、原因はヘッダー行のベースラインのずれとアクションバーの領域確保にあることがわかりました。
        </MessageItem>
      </div>
    </Section>
  ),
};

export const HeaderBaselineAlignment: Story = {
  render: () => (
    <Section
      title="名前と時刻のベースライン(#97)"
      note="アバターあり/なし × 名前が押せない/authorOnClick で押せる、の組み合わせ。いずれも名前と時刻のベースラインが揃うこと。"
    >
      <div className="flex max-w-xl flex-col gap-3 rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
          アバターあり・押せない名前
        </MessageItem>
        <MessageItem authorName="川村静哉" timestamp="01:03">
          アバターなし・押せない名前
        </MessageItem>
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          avatarSrc={AVATAR_SRC}
          authorOnClick={() => {}}
        >
          アバターあり・押せる名前(authorOnClick)
        </MessageItem>
        <MessageItem authorName="川村静哉" timestamp="01:03" authorOnClick={() => {}}>
          アバターなし・押せる名前(authorOnClick)
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithActionsSlot: Story = {
  render: () => (
    <Section
      title="actionsSlot(#97)"
      note="actions では表現できない Popover を伴うアクション(絵文字ピッカー等)向けの差し込み口。ヘッダー右側に actions の後ろに並ぶ。opacity 制御は当てないため常に表示される — 表示/非表示は消費側が持つ想定(実際の消費側では絵文字ピッカーの Popover トリガーをここに置く)。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          actions={ACTIONS}
          actionsSlot={
            <button
              type="button"
              className="rounded-md border border-solid border-border bg-transparent px-2 py-1 font-body text-text text-xs"
              onClick={() => {}}
            >
              😀 Popover
            </button>
          }
        >
          actions の後ろに任意のノード(ここでは Popover トリガーを模したボタン)を置ける
        </MessageItem>
      </div>
    </Section>
  ),
};

export const InRowFlexParent: Story = {
  render: () => (
    <Section
      title="行方向 flex の親に置いたとき(#97)"
      note="消費側(insession-app)が MessageActionBar 等を兄弟として横に置く構成を再現。隣に shrink-0 の要素があっても MessageItem が残りの幅を取り切り、本文が広く使われること。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <div className="flex items-start gap-2">
          <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
            隣に固定幅の兄弟要素があっても、本文はコンテナの残り幅いっぱいまで使って折り返す。ここが以前は狭くなって早く折り返していた。
          </MessageItem>
          <div className="shrink-0 rounded-md border border-dashed border-border-strong px-3 py-2 font-body text-text-dim text-xs">
            兄弟要素
            <br />
            (shrink-0)
          </div>
        </div>
      </div>
    </Section>
  ),
};

export const ThreadPostUsage: Story = {
  render: () => (
    <Section
      title="スレッド投稿用途"
      note="loophub のようなコミュニティのスレッド投稿/コメント。アバター付き + authorHref で投稿者プロフィールへ遷移できる。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-4">
        <MessageItem
          authorName="川村静哉"
          authorHref="/u/kawamura"
          timestamp="2日前"
          avatarSrc={AVATAR_SRC}
          actions={[
            { icon: 'reply', label: '返信', onClick: () => {} },
            { icon: 'add_reaction', label: 'リアクション', onClick: () => {} },
          ]}
          reactions={[
            { emoji: '👍', count: 4, reacted: false, label: 'いいね', onClick: () => {} },
          ]}
        >
          この機能、待ってました！次のリリースが楽しみです。
        </MessageItem>
      </div>
    </Section>
  ),
};
