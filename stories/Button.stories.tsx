import { Button } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS のボタン。variant(primary/accent/secondary/ghost/danger/join) × size × loading/disabled。
const meta: Meta<typeof Button> = {
  title: 'Actions/Button',
  component: Button,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <Section
      title="バリアント (DS)"
      note="primary=中立塗り / accent=コーラル / secondary=2px アウトライン / ghost=テキスト(info) / danger / join=ライブ緑 pill+ドット。radius 10、join のみ pill。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">削除する</Button>
        <Button variant="join">Join session</Button>
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
