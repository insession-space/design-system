import { Paper } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Paper のカタログ。elevation=1 固定(境界のみ、影なし)の控えめな面。
const meta: Meta = {
  title: 'Surface/Paper',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Section title="Paper" note="elevation=1 固定。境界のみの控えめな面。">
      <Paper padding="md" className="max-w-md">
        <p className="text-smd text-text">境界だけで面を表現する(影なし)。</p>
      </Paper>
    </Section>
  ),
};
