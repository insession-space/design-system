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

function TabsDemo({ withBadge = false }: { withBadge?: boolean }) {
  const [value, setValue] = useState('queue');
  return (
    <Tabs
      value={value}
      onChange={setValue}
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
    <Section title="タブ" note="アクティブ下にシアンの下線がスプリングで伸びる。">
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
