import { EmptyNote } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の EmptyNote。空リスト/検索0件の一行メッセージ。文言は t() 済みを children で渡す。
const meta: Meta<typeof EmptyNote> = {
  title: 'Feedback/EmptyNote',
  component: EmptyNote,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof EmptyNote>;

export const Variants: Story = {
  render: () => (
    <Section
      title="バリアント (DS)"
      note="default=広め / compact=キュー・履歴タブ / dropdown=検索候補の中。いずれも水平・垂直とも中央。余白と最小高だけが違う。"
    >
      <div className="flex flex-col gap-3 max-w-md">
        <EmptyNote>まだ何もありません</EmptyNote>
        <EmptyNote variant="compact">キューは空です</EmptyNote>
        <EmptyNote variant="dropdown">検索結果がありません</EmptyNote>
      </div>
    </Section>
  ),
};

export const InContainer: Story = {
  render: () => (
    <Section
      title="面の中に置く"
      note="compact / dropdown は最小高を持つので、リストの高さが潰れない。"
    >
      <div className="max-w-md rounded-card border border-solid border-border bg-surface-2">
        <EmptyNote variant="compact">キューは空です</EmptyNote>
      </div>
    </Section>
  ),
};
