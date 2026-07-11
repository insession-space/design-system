import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// タイポグラフィのカタログ。サイズスケール(px 実測由来)・フォント・ウェイトを一覧する。
const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const SIZES = [
  { cls: 'text-2xs', label: '2xs (10)' },
  { cls: 'text-xs', label: 'xs (11)' },
  { cls: 'text-sm', label: 'sm (12)' },
  { cls: 'text-smd', label: 'smd (13)' },
  { cls: 'text-base', label: 'base (14)' },
  { cls: 'text-md', label: 'md (15)' },
  { cls: 'text-lg', label: 'lg (16)' },
  { cls: 'text-xl', label: 'xl (17)' },
  { cls: 'text-2xl', label: '2xl (18)' },
  { cls: 'text-3xl', label: '3xl (21)' },
  { cls: 'text-4xl', label: '4xl (24)' },
  { cls: 'text-5xl', label: '5xl (30)' },
  { cls: 'text-6xl', label: '6xl (56)' },
];

export const Scale: Story = {
  render: () => (
    <Section
      title="サイズスケール"
      note="px 実測から。行間は normal 固定、必要時 leading-* で上書き。"
    >
      <div className="flex flex-col gap-3">
        {SIZES.map((s) => (
          <div key={s.cls} className="flex items-baseline gap-4">
            <code className="text-2xs text-text-faint w-24 shrink-0">{s.label}</code>
            <span className={`${s.cls} text-text font-body`}>Session — 友達と同期して観る</span>
          </div>
        ))}
      </div>
    </Section>
  ),
};

export const Fonts: Story = {
  render: () => (
    <Section title="フォント" note="見出し/ボタン=font-display、本文=font-body(既定)。">
      <div className="flex flex-col gap-6">
        <div>
          <code className="text-2xs text-text-faint">font-display</code>
          <p className="font-display text-4xl font-extrabold text-text leading-normal">
            Session Watch Party
          </p>
        </div>
        <div>
          <code className="text-2xs text-text-faint">font-body</code>
          <p className="font-body text-lg text-text leading-normal">
            友達と同期して YouTube を観る。誰かの再生・一時停止・シークが全員に届く。
          </p>
        </div>
      </div>
    </Section>
  ),
};

export const Weights: Story = {
  render: () => (
    <Section title="ウェイト" note="font-semibold(600) / font-bold(700) / font-extrabold(800)。">
      <div className="flex flex-col gap-2">
        <p className="text-3xl font-semibold text-text leading-normal">semibold — 600</p>
        <p className="text-3xl font-bold text-text leading-normal">bold — 700</p>
        <p className="text-3xl font-extrabold text-text leading-normal">extrabold — 800</p>
      </div>
    </Section>
  ),
};
