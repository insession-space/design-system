import { Card, Panel, Paper, Surface } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// 面プリミティブ(Surface/Paper/Card/Panel)のカタログ。elevation は「背景 + 境界 + 影」の
// 1軸で表現されるため、ライト/ダーク両テーマで段差が見えることを確認できる並びにする
// (Storybook のテーマトグルで切り替えて確認する)。
const meta: Meta = {
  title: 'Components/Surface',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const ElevationScale: Story = {
  render: () => (
    <Section
      title="Elevation"
      note="0〜4段。既存の Card(2) / Popover・Menu(3) / Modal(4) と同じ組を使う。"
    >
      <div className="flex flex-wrap items-start gap-6">
        {([0, 1, 2, 3, 4] as const).map((elevation) => (
          <div key={elevation} className="flex flex-col items-center gap-2">
            <Surface
              elevation={elevation}
              padding="md"
              className="flex h-20 w-28 items-center justify-center"
            >
              <span className="text-smd font-semibold text-text">elevation {elevation}</span>
            </Surface>
            <code className="text-2xs text-text-faint">{elevation}</code>
          </div>
        ))}
      </div>
    </Section>
  ),
};

export const PaperDemo: Story = {
  render: () => (
    <Section title="Paper" note="elevation=1 固定。境界のみの控えめな面。">
      <Paper padding="md" className="max-w-md">
        <p className="text-smd text-text">境界だけで面を表現する(影なし)。</p>
      </Paper>
    </Section>
  ),
};

export const CardDemo: Story = {
  render: () => (
    <Section title="Card" note="elevation 既定2。padding 既定 md、radius 既定 card。">
      <div className="flex flex-wrap gap-4">
        <Card className="max-w-xs">
          <p className="text-smd text-text">既定(elevation=2)。</p>
        </Card>
        <Card elevation={4} className="max-w-xs">
          <p className="text-smd text-text">elevation=4(Modal と同じ組)。</p>
        </Card>
      </div>
    </Section>
  ),
};

export const PanelDemo: Story = {
  render: () => (
    <Section
      title="Panel"
      note="elevation=1 固定、radius 既定 panel。サイドバー/セクション囲み用。"
    >
      <Panel padding="lg" className="max-w-md">
        <p className="text-smd text-text">領域の枠として使う面。</p>
      </Panel>
    </Section>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Section
      title="interactive"
      note="hover で -translate-y-0.5 + bg-surface-hover の控えめな持ち上げ。フォーカスリングは focus-visible:shadow-focus。"
    >
      <Card interactive tabIndex={0} className="max-w-xs">
        <p className="text-smd text-text">ホバー/フォーカスしてみる。</p>
      </Card>
    </Section>
  ),
};
