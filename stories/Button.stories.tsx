import { Button } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS のボタン。variant(primary/ghost/danger) × size × loading/disabled。
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <Section
      title="バリアント"
      note="primary / ghost / danger。tinted surface + 細ボーダー、ホバーで控えめに発光。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">プライマリ</Button>
        <Button variant="ghost">ゴースト</Button>
        <Button variant="danger">削除する</Button>
      </div>
    </Section>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Section title="サイズ" note="sm / md(既定) / lg。">
      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </Section>
  ),
};

export const States: Story = {
  render: () => (
    <Section title="状態" note="loading(スピナー + 操作不可) / disabled。">
      <div className="flex flex-wrap items-center gap-4">
        <Button loading>読み込み中</Button>
        <Button variant="ghost" loading>
          読み込み中
        </Button>
        <Button disabled>無効</Button>
        <Button variant="danger" loading>
          削除中
        </Button>
      </div>
    </Section>
  ),
};
