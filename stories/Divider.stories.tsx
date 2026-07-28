import { Divider, HStack, VStack } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Divider のカタログ。見た目のトークンは持たないため、境界がわかるよう
// 枠付きの Box を挟んで水平/垂直の両方を確認できるようにする。
const meta: Meta = {
  title: 'Layout/Divider',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function Box({ children = '1' }: { children?: string }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-solid border-border bg-tint-8 text-base font-semibold text-text">
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Section title="Divider" note="orientation で水平/垂直を切替。">
      <div className="flex max-w-md flex-col gap-4">
        <VStack gap="sm">
          <Box>上</Box>
          <Divider />
          <Box>下</Box>
        </VStack>
        <HStack gap="sm" align="stretch" className="h-12">
          <Box>左</Box>
          <Divider orientation="vertical" />
          <Box>右</Box>
        </HStack>
      </div>
    </Section>
  ),
};
