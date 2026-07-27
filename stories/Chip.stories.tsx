import { Chip, Icon } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// DS の Chip。タップできる要素(クイック返信/フィルター/タグ)。default / selected(accent) / icon 付き。
const meta: Meta<typeof Chip> = {
  title: 'Data Display/Chip',
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

export const WithoutCheck: Story = {
  render: () => (
    <Section
      title="showCheck={false}"
      note="selected の色(accent tint + 枠)だけを使い、行頭の check を出さない。リアクションピル(MessageItem)のように、行頭に絵文字が来てチェックと並ぶと意味が読めなくなる用途で使う。既定は true。"
    >
      <div className="flex flex-wrap items-center gap-2.25">
        <Chip selected>既定(check あり)</Chip>
        <Chip selected showCheck={false}>
          🙂 1
        </Chip>
        <Chip showCheck={false}>🎉 3</Chip>
      </div>
    </Section>
  ),
};
