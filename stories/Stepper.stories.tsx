import { Stepper } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { Section } from './tokens';

// DS の Stepper。− / 値 / ＋ の数値増減。振る舞いは Base UI の NumberField へ委譲していて、
// 矢印キー(↑↓)・PageUp/Down・値の直接入力・min/max での端 disabled・clamp が入っている。
const meta: Meta<typeof Stepper> = {
  title: 'Inputs/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Stepper>;

type DemoProps = { initial?: number } & Partial<
  Omit<ComponentProps<typeof Stepper>, 'value' | 'onChange'>
>;

function Demo({ initial = 10, ...rest }: DemoProps) {
  const [value, setValue] = useState(initial);
  return (
    <Stepper
      value={value}
      min={1}
      max={50}
      step={1}
      decLabel="-1"
      incLabel="+1"
      valueLabel="件数"
      onChange={setValue}
      {...rest}
    />
  );
}

export const Default: Story = {
  render: () => (
    <Section
      title="既定 (DS)"
      note="min/max/step を注入し、clamp と端の disabled は Base UI が持つ。値の欄はフォーカスして直接入力できる。"
    >
      <div className="flex items-center gap-2">
        <Demo />
        <span className="text-base text-text-dim">件</span>
      </div>
    </Section>
  ),
};

export const Bounds: Story = {
  render: () => (
    <Section
      title="端に到達した状態"
      note="min / max に達した側のボタンが自動で無効になる（呼び出し側で disabled を組む必要は無い）。"
    >
      <div className="flex flex-col gap-3">
        <Demo initial={1} />
        <Demo initial={50} />
      </div>
    </Section>
  ),
};

export const Step: Story = {
  render: () => (
    <Section title="刻み幅" note="step で増減量を変える。aria-label も合わせて注入する。">
      <Demo initial={30} min={0} max={120} step={5} decLabel="-5" incLabel="+5" valueLabel="分" />
    </Section>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Section title="無効" note="全体を無効化する（実行中は編集不可、など）。">
      <Demo disabled />
    </Section>
  ),
};
