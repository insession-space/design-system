import { HStack, Spacer } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Spacer のカタログ。見た目のトークンは持たないため、境界がわかるよう
// 枠付きの HStack の中に置く。
const meta: Meta = {
  title: 'Layout/Spacer',
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
    <Section title="Spacer" note="flex 中で余白を食う(flex-1)。ツールバーの左右分離などに使う。">
      <HStack
        align="center"
        className="w-full max-w-md rounded-md border border-dashed border-border-strong p-3"
      >
        <Box>左</Box>
        <Spacer />
        <Box>右</Box>
      </HStack>
    </Section>
  ),
};
