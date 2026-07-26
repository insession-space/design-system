import { HStack, Stack, VStack } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Stack/VStack/HStack のカタログ。見た目のトークンは持たないため、
// 境界がわかるよう各サンプルに bg-tint-8 の枠付きボックスを添える。
const meta: Meta = {
  title: 'Layout/Stack',
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

export const StackDirection: Story = {
  render: () => (
    <Section title="Stack" note="direction で縦横を切替。既定は column。gap は DS の余白語彙。">
      <div className="flex flex-wrap items-start gap-8">
        <div>
          <p className="mb-2 text-2xs text-text-faint">direction=&quot;column&quot;(既定)</p>
          <Stack gap="md">
            <Box>1</Box>
            <Box>2</Box>
            <Box>3</Box>
          </Stack>
        </div>
        <div>
          <p className="mb-2 text-2xs text-text-faint">direction=&quot;row&quot;</p>
          <Stack direction="row" gap="md">
            <Box>1</Box>
            <Box>2</Box>
            <Box>3</Box>
          </Stack>
        </div>
      </div>
    </Section>
  ),
};

export const VHStackShortcuts: Story = {
  render: () => (
    <Section title="VStack / HStack" note="Stack の direction 固定ラッパー。">
      <div className="flex flex-wrap items-start gap-8">
        <div>
          <p className="mb-2 text-2xs text-text-faint">VStack</p>
          <VStack gap="sm" align="center">
            <Box>1</Box>
            <Box>2</Box>
          </VStack>
        </div>
        <div>
          <p className="mb-2 text-2xs text-text-faint">HStack</p>
          <HStack gap="sm" align="center">
            <Box>1</Box>
            <Box>2</Box>
          </HStack>
        </div>
      </div>
    </Section>
  ),
};

export const StackAlignJustify: Story = {
  render: () => (
    <Section title="align / justify" note='HStack で justify="between" + align="center" の例。'>
      <HStack
        justify="between"
        align="center"
        className="w-full max-w-md rounded-md border border-dashed border-border-strong p-3"
      >
        <Box>1</Box>
        <Box>2</Box>
        <Box>3</Box>
      </HStack>
    </Section>
  ),
};
