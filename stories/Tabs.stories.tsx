import { CountChip, Tabs } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// タブ / セグメンテッドコントロール。下線式(media-tabs 相当)。badge / trailing を持てる。
const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

function TabsDemo({
  withBadge = false,
  variant = 'default',
}: {
  withBadge?: boolean;
  variant?: 'default' | 'fill';
}) {
  const [value, setValue] = useState('queue');
  return (
    <Tabs
      value={value}
      onChange={setValue}
      variant={variant}
      ariaLabel="サンプルタブ"
      tabs={[
        {
          key: 'queue',
          label: 'キュー',
          badge: withBadge ? <CountChip animated>3</CountChip> : undefined,
        },
        { key: 'history', label: '履歴' },
        { key: 'playlist', label: 'プレイリスト' },
      ]}
    />
  );
}

export const Default: Story = {
  render: () => (
    <Section title="タブ" note="アクティブ下にコーラル(accent)の下線がスプリングで伸びる。">
      <TabsDemo />
    </Section>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Section title="件数バッジ付き" note="badge に CountChip を載せる(media-tabs のキュー件数)。">
      <TabsDemo withBadge />
    </Section>
  ),
};

export const Fill: Story = {
  render: () => (
    <Section
      title="fill バリアント"
      note="各タブが flex:1 で均等に行幅いっぱいを占める(legacy 基底 .tab-btn 相当。playlist サブタブ / sticker タブ)。"
    >
      <TabsDemo variant="fill" />
    </Section>
  ),
};
