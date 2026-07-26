import {
  Center,
  Container,
  Divider,
  Grid,
  HStack,
  Spacer,
  Stack,
  VStack,
} from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// レイアウトプリミティブ(Stack/VStack/HStack/Grid/Spacer/Divider/Center/Container)のカタログ。
// 見た目のトークンは持たないため、境界がわかるよう各サンプルに bg-tint-5 の枠付きボックスを添える。
const meta: Meta = {
  title: 'Components/Layout',
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

export const SpacerDemo: Story = {
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

export const DividerDemo: Story = {
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

export const CenterDemo: Story = {
  render: () => (
    <Section title="Center" note="子要素を縦横中央に置く。">
      <Center className="h-32 max-w-md rounded-md border border-dashed border-border-strong">
        <Box>center</Box>
      </Center>
    </Section>
  ),
};

export const ContainerDemo: Story = {
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
