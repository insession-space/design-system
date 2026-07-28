import { AppBar, Button, Toolbar } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// AppBar のカタログ。left/center/right の3スロット。center だけが伸びる。
const meta: Meta = {
  title: 'Page/AppBar',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Section title="AppBar" note="left/center/right の3スロット。center だけが伸びる。">
      <AppBar
        left={<span className="text-base font-semibold text-text">InSession</span>}
        center={<Toolbar align="center">{/* 検索欄などを想定 */}</Toolbar>}
        right={<Button size="sm">ログイン</Button>}
        sticky={false}
      />
    </Section>
  ),
};
