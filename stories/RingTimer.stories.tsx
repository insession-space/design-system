import { RingTimer } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// 円形カウントダウンタイマー。時間計算はしない純粋表示部品(リレーゲーム等の残り時間表示 #974)。
// secondsLeft <= urgentThreshold で accent 色 + 脈動に切り替わる。
const meta: Meta<typeof RingTimer> = {
  title: 'Components/RingTimer',
  component: RingTimer,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof RingTimer>;

export const Normal: Story = {
  render: () => (
    <Section title="通常" note="secondsLeft が urgentThreshold より大きい間はミント色。">
      <RingTimer secondsLeft={42} totalSeconds={60} caption="のこり秒" />
    </Section>
  ),
};

export const Urgent: Story = {
  render: () => (
    <Section
      title="urgent"
      note="secondsLeft <= urgentThreshold(既定10)で accent 色 + ゆっくり脈動。"
    >
      <RingTimer secondsLeft={7} totalSeconds={60} caption="のこり秒" />
    </Section>
  ),
};

export const Compact: Story = {
  render: () => (
    <Section title="小型 (size=66)" note="size で直径(px)を指定。文字サイズも追従する。">
      <div className="flex items-center gap-6">
        <RingTimer secondsLeft={30} totalSeconds={60} size={66} caption="のこり秒" />
        <RingTimer secondsLeft={5} totalSeconds={60} size={66} caption="のこり秒" />
      </div>
    </Section>
  ),
};
