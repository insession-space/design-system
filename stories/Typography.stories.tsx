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
            <span className={`${s.cls} text-text font-body`}>InSession — 友達と同期して観る</span>
          </div>
        ))}
      </div>
    </Section>
  ),
};

// DS のセマンティックタイポ階層(#463)。サイズ+weight+tracking+line-height を焼き込んだ
// text-display / text-h1 / text-h2 / text-body / text-small / text-label を当てるだけで
// 役割どおりの見た目になる。label は uppercase + font-mono を併用する。
const ROLES = [
  { cls: 'text-display', label: 'Display 44 / 800', sample: 'InSession' },
  { cls: 'text-h1', label: 'Heading 1 · 32 / 800', sample: 'Tune in. Catch the vibe.' },
  { cls: 'text-h2', label: 'Heading 2 · 22 / 700', sample: 'アクティブなスペース' },
  { cls: 'text-body', label: 'Body · 16 / 500', sample: '友達と同期して YouTube を観る。' },
  { cls: 'text-small', label: 'Small · 14 / 500', sample: '誰かの再生・一時停止が全員に届く。' },
];

export const Roles: Story = {
  render: () => (
    <Section
      title="セマンティック階層 (DS)"
      note="claude design 準拠(#463)。size に加え weight/tracking/line-height を役割ごとに内包。label は uppercase + font-mono。"
    >
      <div className="flex flex-col gap-4">
        {ROLES.map((r) => (
          <div key={r.cls} className="flex items-baseline gap-4">
            <code className="text-2xs text-text-faint w-40 shrink-0">{r.label}</code>
            <span className={`${r.cls} text-text`}>{r.sample}</span>
          </div>
        ))}
        <div className="flex items-baseline gap-4">
          <code className="text-2xs text-text-faint w-40 shrink-0">Label · 11 / 600 · mono</code>
          <span className="text-label font-mono uppercase text-text-dim">Watch Party</span>
        </div>
      </div>
    </Section>
  ),
};

export const Fonts: Story = {
  render: () => (
    <Section
      title="フォント"
      note="DS 役割: Archivo=見出し/UI/本文(font-display / font-body)、JetBrains Mono=code/meta/Label caps(font-mono)。"
    >
      <div className="flex flex-col gap-6">
        <div>
          <code className="text-2xs text-text-faint">font-display / font-body (Archivo)</code>
          <p className="font-display text-4xl font-extrabold text-text leading-normal">
            InSession Watch Party
          </p>
          <p className="font-body text-lg text-text leading-normal mt-1">
            友達と同期して YouTube を観る。誰かの再生・一時停止・シークが全員に届く。
          </p>
        </div>
        <div>
          <code className="text-2xs text-text-faint">
            font-mono (JetBrains Mono) — meta / 数値 / label
          </code>
          <p className="font-mono text-md text-text-dim leading-normal tabular-nums">
            12:34 · 8 online · REC
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
