import { StepFlow } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// ステップ進行表示。done / current / todo の3状態ピル列(リレーゲームのフェーズ表示等 #974)。
const meta: Meta<typeof StepFlow> = {
  title: 'Components/StepFlow',
  component: StepFlow,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof StepFlow>;

const STEPS = [
  { key: 'ready', label: '準備' },
  { key: 'draw', label: 'お題' },
  { key: 'relay', label: 'リレー' },
  { key: 'result', label: '結果' },
];

export const RowStart: Story = {
  render: () => (
    <Section title="row: 開始直後 (currentIndex=0)" note="▸ セパレータで区切る横並び。">
      <StepFlow steps={STEPS} currentIndex={0} />
    </Section>
  ),
};

export const RowMiddle: Story = {
  render: () => (
    <Section title="row: 進行中 (currentIndex=2)" note="左が done、右が todo。">
      <StepFlow steps={STEPS} currentIndex={2} />
    </Section>
  ),
};

export const RowDone: Story = {
  render: () => (
    <Section title="row: 完了 (currentIndex=steps.length)" note="全ステップが done。">
      <StepFlow steps={STEPS} currentIndex={STEPS.length} />
    </Section>
  ),
};

export const Column: Story = {
  render: () => (
    <Section title="column" note="縦積み・角丸は rounded-md・セパレータなし。">
      <div className="max-w-[180px]">
        <StepFlow steps={STEPS} currentIndex={1} direction="column" />
      </div>
    </Section>
  ),
};
