import { Button, Toolbar } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Toolbar のカタログ。AppBar の外でも使える独立部品。role="toolbar" を持つ。
const meta: Meta = {
  title: 'Page/Toolbar',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Section
      title="Toolbar"
      note="AppBar の外でも使える独立部品。role=&quot;toolbar&quot; を持つ。"
    >
      <Toolbar align="center" className="rounded-md border border-dashed border-border-strong p-3">
        <Button size="sm" variant="ghost">
          太字
        </Button>
        <Button size="sm" variant="ghost">
          斜体
        </Button>
        <Button size="sm" variant="ghost">
          下線
        </Button>
      </Toolbar>
    </Section>
  ),
};
