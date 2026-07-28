import { Grid } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Grid のカタログ。見た目のトークンは持たないため、境界がわかるよう
// 各サンプルに bg-tint-8 の枠付きボックスを添える。
const meta: Meta = {
  title: 'Layout/Grid',
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

export const GridBasic: Story = {
  render: () => (
    <Section title="Grid" note="columns / gap の固定値指定。">
      <Grid columns={3} gap="md" className="max-w-md">
        <Box>1</Box>
        <Box>2</Box>
        <Box>3</Box>
        <Box>4</Box>
        <Box>5</Box>
        <Box>6</Box>
      </Grid>
    </Section>
  ),
};

export const GridResponsive: Story = {
  render: () => (
    <Section
      title="Grid (responsive)"
      note="columns={{ base: 1, md: 2, lg: 3 }}。ビューポート幅を変えて列数の変化を確認する。"
    >
      <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 'sm', md: 'md', lg: 'lg' }}>
        {['1', '2', '3', '4', '5', '6'].map((label) => (
          <Box key={label}>{label}</Box>
        ))}
      </Grid>
    </Section>
  ),
};
