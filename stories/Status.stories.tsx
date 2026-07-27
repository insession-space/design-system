import { StatusBadge, StatusDot } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// ステータス表現。StatusDot(点) / StatusBadge(点 + ラベルのピル)。
// Badge(new/live の一過性強調)とは用途が別で、継続的な状態を表す。
const meta: Meta = {
  title: 'Data Display/Status',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Dots: Story = {
  render: () => (
    <Section title="StatusDot" note="tone: success/warning/danger/info/neutral。pulse で明滅。">
      <div className="flex flex-wrap items-center gap-6">
        <StatusDot tone="success" label="オンライン" />
        <StatusDot tone="success" pulse label="実行中" />
        <StatusDot tone="warning" />
        <StatusDot tone="danger" />
        <StatusDot tone="info" />
        <StatusDot tone="neutral" />
        <StatusDot tone="success" size={12} />
      </div>
    </Section>
  ),
};

export const Badges: Story = {
  render: () => (
    <Section title="StatusBadge" note="点 + ラベル。状態を継続的に示すピル。">
      <div className="flex flex-wrap items-center gap-4">
        <StatusBadge tone="success" dot pulse>
          オンライン
        </StatusBadge>
        <StatusBadge tone="info" dot>
          実行中
        </StatusBadge>
        <StatusBadge tone="warning" dot>
          待機
        </StatusBadge>
        <StatusBadge tone="danger" dot>
          エラー
        </StatusBadge>
        <StatusBadge tone="neutral">オフライン</StatusBadge>
      </div>
    </Section>
  ),
};
