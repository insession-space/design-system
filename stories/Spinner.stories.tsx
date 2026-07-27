import { Spinner } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// サイズ可変のローディングインジケータ。薄いミントのリング + ミントの先頭。
const meta: Meta<typeof Spinner> = {
  title: 'Feedback/Spinner',
  component: Spinner,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Sizes: Story = {
  render: () => (
    <Section title="サイズ" note="size(px)可変。太さは size に追従(thickness で上書き可)。">
      <div className="flex flex-wrap items-center gap-6">
        <Spinner size={14} />
        <Spinner size={20} />
        <Spinner size={32} />
        <Spinner size={48} />
      </div>
    </Section>
  ),
};

export const Inline: Story = {
  render: () => (
    <Section title="インライン" note="テキストやボタンの中に添える。">
      <div className="flex items-center gap-2 text-base text-text-dim">
        <Spinner size={16} label="読み込み中" />
        読み込み中…
      </div>
    </Section>
  ),
};
