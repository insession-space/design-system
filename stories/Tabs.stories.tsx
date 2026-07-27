import { CountChip, Tabs } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// タブ / セグメンテッドコントロール。下線式(media-tabs 相当)。compound API(Tabs.Root/List/Tab/Panel)。
// badge(CountChip)は Tab の children に直接置く。trailing は List の children の後ろに置く。
const meta: Meta<typeof Tabs.Root> = {
  title: 'Navigation/Tabs',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Tabs.Root>;

export const Default: Story = {
  render: () => (
    <Section title="タブ" note="アクティブ下にコーラル(accent)の下線がスプリングで伸びる。">
      <Tabs.Root defaultValue="queue">
        <Tabs.List ariaLabel="サンプルタブ">
          <Tabs.Tab value="queue">キュー</Tabs.Tab>
          <Tabs.Tab value="history">履歴</Tabs.Tab>
          <Tabs.Tab value="playlist">プレイリスト</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </Section>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Section
      title="件数バッジ付き"
      note="Tab の children に CountChip を直接置く(media-tabs のキュー件数)。"
    >
      <Tabs.Root defaultValue="queue">
        <Tabs.List ariaLabel="サンプルタブ">
          <Tabs.Tab value="queue">
            キュー
            <CountChip animated>3</CountChip>
          </Tabs.Tab>
          <Tabs.Tab value="history">履歴</Tabs.Tab>
          <Tabs.Tab value="playlist">プレイリスト</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </Section>
  ),
};

export const Fill: Story = {
  render: () => (
    <Section
      title="fill バリアント"
      note="List に variant='fill' を渡すと各タブが flex:1 で均等に行幅いっぱいを占める(legacy 基底 .tab-btn 相当。playlist サブタブ / sticker タブ)。"
    >
      <Tabs.Root defaultValue="queue">
        <Tabs.List ariaLabel="サンプルタブ" variant="fill">
          <Tabs.Tab value="queue">キュー</Tabs.Tab>
          <Tabs.Tab value="history">履歴</Tabs.Tab>
          <Tabs.Tab value="playlist">プレイリスト</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </Section>
  ),
};

export const WithTrailing: Story = {
  render: () => (
    <Section
      title="trailing 付き"
      note="List の children の後ろに置くとタブとは別扱いで行末に並ぶ(ミニアクション等)。"
    >
      <Tabs.Root defaultValue="queue">
        <Tabs.List
          ariaLabel="サンプルタブ"
          trailing={
            <button
              type="button"
              className="ml-auto self-center pr-2 text-smd text-text-faint hover:text-text-dim"
            >
              クリア
            </button>
          }
        >
          <Tabs.Tab value="queue">キュー</Tabs.Tab>
          <Tabs.Tab value="history">履歴</Tabs.Tab>
          <Tabs.Tab value="playlist">プレイリスト</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </Section>
  ),
};

export const ArrowKeyNavigation: Story = {
  render: () => (
    <Section
      title="矢印キー移動"
      note="いずれかのタブにフォーカスして ←/→(Home/End も)でタブ間を移動できる(Base UI 化で獲得したキーボード操作)。"
    >
      <Tabs.Root defaultValue="tab-1">
        <Tabs.List ariaLabel="矢印キー移動のサンプル">
          <Tabs.Tab value="tab-1">タブ1</Tabs.Tab>
          <Tabs.Tab value="tab-2">タブ2</Tabs.Tab>
          <Tabs.Tab value="tab-3">タブ3</Tabs.Tab>
          <Tabs.Tab value="tab-4">タブ4</Tabs.Tab>
          <Tabs.Tab value="tab-5">タブ5</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </Section>
  ),
};

export const WithPanel: Story = {
  render: () => (
    <Section title="Panel 付き" note="Tabs.Panel でタブ切り替えに応じて中身を切り替える。">
      <Tabs.Root defaultValue="queue">
        <Tabs.List ariaLabel="サンプルタブ">
          <Tabs.Tab value="queue">キュー</Tabs.Tab>
          <Tabs.Tab value="history">履歴</Tabs.Tab>
          <Tabs.Tab value="playlist">プレイリスト</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="queue" className="py-3 text-smd text-text-dim">
          キューの中身。
        </Tabs.Panel>
        <Tabs.Panel value="history" className="py-3 text-smd text-text-dim">
          履歴の中身。
        </Tabs.Panel>
        <Tabs.Panel value="playlist" className="py-3 text-smd text-text-dim">
          プレイリストの中身。
        </Tabs.Panel>
      </Tabs.Root>
    </Section>
  ),
};
