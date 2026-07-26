import { Container } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Container のカタログ。見た目のトークンは持たないため、境界がわかるよう
// 枠付きの Box を中に置く。
const meta: Meta = {
  title: 'Layout/Container',
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
    <Section title="Container" note="size で最大幅を切替 + 中央寄せ + 左右パディング。">
      <div className="flex flex-col gap-3">
        <Container size="sm" className="rounded-md border border-dashed border-border-strong">
          <Box>sm (640px)</Box>
        </Container>
        <Container size="md" className="rounded-md border border-dashed border-border-strong">
          <Box>md (768px)</Box>
        </Container>
      </div>
    </Section>
  ),
};
