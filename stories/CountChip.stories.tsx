import { CountChip } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の CountChip。件数を出す小さな pill。タブや Bottom Nav のアイコンへ重ねて使う。
// 状態・意味のラベルは Badge、タップできる要素は Chip。
const meta: Meta<typeof CountChip> = {
  title: 'Data Display/CountChip',
  component: CountChip,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof CountChip>;

export const Default: Story = {
  render: () => (
    <Section
      title="件数 (DS)"
      note="min-width 20px で1桁でも潰れない。⚠ 中身が数値のときだけ使う（文字列の状態ラベルは Badge / Lozenge / StatusBadge の担当）。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <CountChip>3</CountChip>
        <CountChip>12</CountChip>
        <CountChip>99+</CountChip>
      </div>
    </Section>
  ),
};

export const Tones: Story = {
  render: () => (
    <Section
      title="トーン"
      note="既定は success。#962 以前は緑に固定されており、未読を danger、下書きを neutral で出すといった出し分けができなかった。語彙は Status / Lozenge と共通。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <CountChip tone="success">3</CountChip>
        <CountChip tone="warning">3</CountChip>
        <CountChip tone="danger">3</CountChip>
        <CountChip tone="info">3</CountChip>
        <CountChip tone="neutral">3</CountChip>
      </div>
    </Section>
  ),
};

export const Animated: Story = {
  render: () => (
    <Section
      title="出現アニメ"
      note="animated で pop-in（spring イージング）。タブの件数が 0 → 1 になるときなど、増えたことを気づかせたい場所で使う。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <CountChip animated>7</CountChip>
      </div>
    </Section>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <Section
      title="アイコンへ重ねる"
      note="className で位置調整を注入する（絶対配置はコンポーネント側に持たせていない）。"
    >
      <span className="relative inline-flex">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-chip bg-surface-3 text-text-dim">
          <span className="text-lg">♪</span>
        </span>
        <CountChip className="absolute -top-1 -right-1">5</CountChip>
      </span>
    </Section>
  ),
};
