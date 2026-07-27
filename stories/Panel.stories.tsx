import { Panel } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Panel のカタログ。elevation=1 固定、radius 既定 panel。サイドバー/セクション囲み用。
const meta: Meta = {
  title: 'Surfaces/Panel',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Section
      title="Panel"
      note="elevation=1 固定、radius 既定 panel。サイドバー/セクション囲み用。"
    >
      <Panel padding="lg" className="max-w-md">
        <p className="text-smd text-text">領域の枠として使う面。</p>
      </Panel>
    </Section>
  ),
};
