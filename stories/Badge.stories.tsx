import { Badge } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の Badge。非対話の status/meta ラベル。
// タップできる要素は Chip、継続的な状態の点+枠は StatusBadge、mono-caps の状態タグは Lozenge。
const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Tones: Story = {
  render: () => (
    <Section
      title="トーン (DS)"
      note="live(green) / warn(amber) / danger(coral) / info(blue) / neutral / pro。colored tone は pill、neutral・pro は角丸矩形。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Badge tone="live">配信中</Badge>
        <Badge tone="warn">注意</Badge>
        <Badge tone="danger">エラー</Badge>
        <Badge tone="info">情報</Badge>
        <Badge tone="neutral">下書き</Badge>
        <Badge tone="pro">PRO</Badge>
      </div>
    </Section>
  ),
};

export const WithDotAndIcon: Story = {
  render: () => (
    <Section
      title="ドット / アイコン"
      note="dot で先頭に同色の 6px 点。icon は IconName か ReactNode（IconName なら size13 で描く）。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Badge tone="live" dot>
          LIVE
        </Badge>
        <Badge tone="warn" icon="warning">
          容量が少ない
        </Badge>
        <Badge tone="info" icon="check_circle">
          同期済み
        </Badge>
      </div>
    </Section>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Section
      title="形状の上書き"
      note="既定は tone から導出。shape で pill / rounded を明示できる。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Badge tone="neutral" shape="pill">
          neutral を pill に
        </Badge>
        <Badge tone="info" shape="rounded">
          info を rounded に
        </Badge>
      </div>
    </Section>
  ),
};
