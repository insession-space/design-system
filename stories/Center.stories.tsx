import { Center } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Center のカタログ。見た目のトークンは持たないため、境界がわかるよう
// 枠付きの Box を中央に置く。
const meta: Meta = {
  title: 'Layout/Center',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function Box({ children = '1' }: { children?: string }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-solid border-border bg-tint-8 text-smd font-semibold text-text">
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Section title="Center" note="子要素を縦横中央に置く。">
      <Center className="h-32 max-w-md rounded-md border border-dashed border-border-strong">
        <Box>center</Box>
      </Center>
    </Section>
  ),
};
