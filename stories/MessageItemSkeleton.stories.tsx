import { MessageItem, MessageItemSkeleton } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// MessageItemSkeleton のカタログ。`MessageItem`(#83)の読み込み中プレースホルダ。
// 骨格が一致していることを目で確認できるよう、実際の MessageItem と並べるストーリーを必ず置く。
const meta: Meta = {
  title: 'Patterns/MessageItemSkeleton',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const AVATAR_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%2312d8c9'/%3E%3C/svg%3E";

export const Default: Story = {
  render: () => (
    <Section
      title="既定"
      note="アバター無し・本文1行・リアクション無し(MessageItem の最小構成に対応する)。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItemSkeleton />
      </div>
    </Section>
  ),
};

export const WithAvatarAndReactions: Story = {
  render: () => (
    <Section
      title="アバター有り・複数行・リアクション"
      note="avatar / lines / reactions で MessageItem の各バリエーションに対応する形を出せる。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItemSkeleton avatar lines={3} reactions={2} />
      </div>
    </Section>
  ),
};

export const ListLoading: Story = {
  render: () => (
    <Section title="一覧の読み込み中" note="複数並べたときのレイアウトシフト対策としての見え方。">
      <div className="flex max-w-xl flex-col gap-4 rounded-card border border-solid border-border bg-surface p-3">
        <MessageItemSkeleton avatar lines={2} reactions={1} />
        <MessageItemSkeleton avatar lines={1} />
        <MessageItemSkeleton avatar lines={2} />
      </div>
    </Section>
  ),
};

export const SideBySideWithRealMessageItem: Story = {
  render: () => (
    <Section
      title="実物との比較(骨格の一致)"
      note="同じ props 相当の MessageItemSkeleton と MessageItem を並べる。ヘッダー行・本文・リアクション行の位置と高さが揃っていることを確認する。"
    >
      <div className="grid max-w-3xl grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-text-faint">読み込み中(MessageItemSkeleton)</p>
          <div className="rounded-card border border-solid border-border bg-surface p-3">
            <MessageItemSkeleton avatar lines={2} reactions={2} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-text-faint">実データ(MessageItem)</p>
          <div className="rounded-card border border-solid border-border bg-surface p-3">
            <MessageItem
              authorName="川村静哉"
              timestamp="01:03"
              avatarSrc={AVATAR_SRC}
              reactions={[
                { emoji: '🙂', count: 1, reacted: true, label: 'にっこり', onClick: () => {} },
                { emoji: '🎉', count: 3, reacted: false, label: 'お祝い', onClick: () => {} },
              ]}
            >
              {'リリースできました\nお疲れさまでした'}
            </MessageItem>
          </div>
        </div>
      </div>
    </Section>
  ),
};
