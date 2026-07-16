import type { Meta, StoryObj } from '@storybook/react-vite';
import { BoxSwatch, Section, TokenTable } from './tokens';

// 半径 / グロー / z-index / モーションのトークンカタログ。
const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Radius: Story = {
  render: () => (
    <Section title="半径" note="chip(8) / card(14) / panel(20) / pill(999)。">
      <div className="flex flex-wrap gap-8">
        <BoxSwatch label="chip" varName="--radius-chip" boxClassName="rounded-chip" />
        <BoxSwatch label="card" varName="--radius-card" boxClassName="rounded-card" />
        <BoxSwatch label="panel" varName="--radius-panel" boxClassName="rounded-panel" />
        <BoxSwatch label="pill" varName="--radius-pill" boxClassName="rounded-pill" />
      </div>
    </Section>
  ),
};

export const Elevation: Story = {
  render: () => (
    <Section
      title="グロー(発光)"
      note="ホバー/アクティブの一過性に使う。派手なグローは常用しない。"
    >
      <div className="flex flex-wrap gap-12 p-6">
        <BoxSwatch label="glow" varName="--shadow-glow" boxClassName="rounded-card shadow-glow" />
        <BoxSwatch
          label="glow-strong"
          varName="--shadow-glow-strong"
          boxClassName="rounded-card shadow-glow-strong"
        />
      </div>
    </Section>
  ),
};

export const Shadows: Story = {
  render: () => (
    <Section
      title="エレベーション(ドロップシャドウ)"
      note="グローとは別系統の中立的な影(#445)。soft=小要素、overlay=スナックバー、popover=ポップオーバー/メニュー。"
    >
      <div className="flex flex-wrap gap-12 p-6">
        <BoxSwatch label="soft" varName="--shadow-soft" boxClassName="rounded-card shadow-soft" />
        <BoxSwatch
          label="overlay"
          varName="--shadow-overlay"
          boxClassName="rounded-card shadow-overlay"
        />
        <BoxSwatch
          label="popover"
          varName="--shadow-popover"
          boxClassName="rounded-card shadow-popover"
        />
        <BoxSwatch
          label="focus"
          varName="--shadow-focus"
          boxClassName="rounded-card shadow-focus"
        />
      </div>
    </Section>
  ),
};

export const FocusAndDisabled: Story = {
  render: () => (
    <>
      <Section
        title="フォーカスリング"
        note="キーボードフォーカスの表現(#445)。アウトライン(色/幅/offset) + 発光(shadow-focus)。下の入力を Tab でフォーカスすると確認できる。"
      >
        <div className="flex flex-wrap items-center gap-6">
          <input type="text" placeholder="Tab でフォーカス" />
          <button type="button" className="focus-visible:shadow-focus">
            フォーカスで発光
          </button>
        </div>
        <div className="mt-4">
          <TokenTable
            rows={[
              { varName: '--color-focus-ring', label: 'focus-ring 色' },
              { varName: '--focus-ring-width', label: 'focus-ring 幅' },
              { varName: '--focus-ring-offset', label: 'focus-ring offset' },
            ]}
          />
        </div>
      </Section>
      <Section
        title="無効状態(disabled)"
        note="DS 標準の一組: opacity-(--disabled-opacity) + cursor-not-allowed。"
      >
        <div className="flex flex-wrap items-center gap-6">
          <button type="button">通常</button>
          <button type="button" disabled>
            無効
          </button>
        </div>
        <div className="mt-4">
          <TokenTable rows={[{ varName: '--disabled-opacity', label: 'disabled 不透明度' }]} />
        </div>
      </Section>
    </>
  ),
};

export const ZIndex: Story = {
  render: () => (
    <Section title="z-index" note="重なり順の単一ソース。生の z-index を新規に書かない。">
      <TokenTable
        rows={[
          { varName: '--z-behind', label: 'behind' },
          { varName: '--z-base', label: 'base' },
          { varName: '--z-elevated', label: 'elevated' },
          { varName: '--z-sticky', label: 'sticky' },
          { varName: '--z-nav', label: 'nav' },
          { varName: '--z-dropdown', label: 'dropdown' },
          { varName: '--z-snackbar', label: 'snackbar' },
          { varName: '--z-modal', label: 'modal' },
        ]}
      />
    </Section>
  ),
};

export const Motion: Story = {
  render: () => (
    <>
      <Section
        title="イージング / duration"
        note="ease-spring + --dur-* を基本に。下のカードにホバーすると transition が確認できる。"
      >
        <div className="flex flex-wrap gap-6">
          {[
            { label: 'fast (.18s)', varName: '--dur-fast', dur: 'var(--dur-fast)' },
            { label: 'base (.25s)', varName: '--dur-base', dur: 'var(--dur-base)' },
            { label: 'slow (.35s)', varName: '--dur-slow', dur: 'var(--dur-slow)' },
            { label: 'slower (.5s)', varName: '--dur-slower', dur: 'var(--dur-slower)' },
          ].map((d) => (
            <div key={d.varName} className="flex flex-col items-center gap-2">
              <button
                type="button"
                className="hover:-translate-y-1 hover:shadow-glow ease-spring"
                style={{ transitionDuration: d.dur, transitionProperty: 'transform, box-shadow' }}
              >
                hover me
              </button>
              <code className="text-2xs text-text-faint">{d.varName}</code>
              <span className="text-2xs text-text-dim">{d.label}</span>
            </div>
          ))}
        </div>
      </Section>
      <TokenTable rows={[{ varName: '--ease-spring', label: 'ease-spring' }]} />
    </>
  ),
};
