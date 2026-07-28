import { Card } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Card のカタログ。elevation 既定2。padding 既定 md、radius 既定 card。
const meta: Meta = {
  title: 'Surfaces/Card',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Section title="Card" note="elevation 既定2。padding 既定 md、radius 既定 card。">
      <div className="flex flex-wrap gap-4">
        <Card className="max-w-xs">
          <p className="text-base text-text">既定(elevation=2)。</p>
        </Card>
        <Card elevation={4} className="max-w-xs">
          <p className="text-base text-text">elevation=4(Modal と同じ組)。</p>
        </Card>
      </div>
    </Section>
  ),
};
