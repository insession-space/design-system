import { Chip, Icon } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// DS の Chip。タップできる要素(クイック返信/フィルター/タグ)。default / selected(accent) / icon 付き。
const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Chip>;

function ChipRow() {
  const [sel, setSel] = useState('all');
  const items = [
    { key: 'all', label: 'すべて' },
    { key: 'active', label: 'アクティブ' },
    { key: 'recent', label: '最近' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2.25">
      {items.map((it) => (
        <Chip key={it.key} selected={sel === it.key} onClick={() => setSel(it.key)}>
          {it.label}
        </Chip>
      ))}
    </div>
  );
}

export const Variants: Story = {
  render: () => (
    <Section
      title="バリアント (DS)"
      note="既定=surface-2 + border。selected=accent tint + accent 枠 + チェック。icon 付きも可。"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.25">
          <Chip>デフォルト</Chip>
          <Chip icon={<Icon name="settings" size={16} />}>アイコン付き</Chip>
          <Chip selected>選択中</Chip>
        </div>
        <ChipRow />
      </div>
    </Section>
  ),
};
