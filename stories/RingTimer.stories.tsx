import { RingTimer } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// 円形カウントダウンタイマー。時間計算はしない純粋表示部品(リレーゲーム等の残り時間表示 #974)。
// secondsLeft <= urgentThreshold で accent 色 + 脈動に切り替わる。
const meta: Meta<typeof RingTimer> = {
  title: 'Feedback/RingTimer',
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

// #166: バッジ等に埋め込む用途。中央の数字は物理的に読めないサイズなので出さず、
// リングだけを進捗インジケータとして使う(数字は呼び出し側がリングの外に置く)。
export const RingOnly: Story = {
  render: () => (
    <Section
      title="リングのみ (showValue={false})"
      note="中央の数字と caption を描かない。role=progressbar と aria-valuenow / aria-valuetext は維持されるので、支援技術には残り時間が伝わる。"
    >
      <div className="flex items-center gap-6">
        <RingTimer
          secondsLeft={45}
          totalSeconds={60}
          size={40}
          showValue={false}
          ariaLabel="残り時間"
        />
        <RingTimer
          secondsLeft={20}
          totalSeconds={60}
          size={40}
          showValue={false}
          ariaLabel="残り時間"
        />
        <RingTimer
          secondsLeft={5}
          totalSeconds={60}
          size={40}
          showValue={false}
          ariaLabel="残り時間"
        />
      </div>
    </Section>
  ),
};

// #166: バッジのアイコン位置に収める 16px 前後。既定の太さ比率(直径の14%)だと 2px まで
// 細るので thickness で明示的に太らせる。
export const BadgeSize: Story = {
  render: () => (
    <Section
      title="バッジサイズ (16px + thickness)"
      note="thickness(px)でリングの太さを固定する。指定しなければ従来どおり直径の14%。ringColor='currentColor' で親の文字色に追従させ、リングと数字の色を揃えている。"
    >
      <div className="flex items-center gap-6">
        <span className="inline-flex items-center gap-1 rounded-pill border border-border border-solid bg-surface-2 px-2 py-1 text-accent text-sm tabular-nums">
          <RingTimer
            secondsLeft={18 * 60}
            totalSeconds={25 * 60}
            size={16}
            thickness={3}
            showValue={false}
            ringColor="currentColor"
            ariaLabel="残り時間"
          />
          18:00
        </span>
        <span className="inline-flex items-center gap-1 rounded-pill border border-border border-solid bg-surface-2 px-2 py-1 text-sm text-warning tabular-nums">
          <RingTimer
            secondsLeft={42}
            totalSeconds={25 * 60}
            size={16}
            thickness={3}
            urgentThreshold={60}
            showValue={false}
            ringColor="currentColor"
            ariaLabel="残り時間"
          />
          0:42
        </span>
      </div>
    </Section>
  ),
};
