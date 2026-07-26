import { Surface } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// elevation(0〜4)のトークンカタログ。トークンの話なので Colors/Typography/Tokens と同じ
// Foundations に属する(単なるコンポーネントの見た目確認ではなく「背景 + 境界 + 影」という
// 1軸のトークン対応そのものを見せる)。各段の実値は README.md の elevation 対応表 /
// src/components/surface.tsx の ELEVATION_BG・ELEVATION_BORDER_COLOR・ELEVATION_SHADOW と一致させる。
const meta: Meta = {
  title: 'Foundations/Elevation',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const ELEVATION_TOKENS: Record<number, { bg: string; border: string; shadow: string }> = {
  0: { bg: 'なし', border: 'なし', shadow: 'なし' },
  1: { bg: 'bg-bg-elevated', border: 'border-border', shadow: 'なし' },
  2: { bg: 'bg-surface', border: 'border-border', shadow: 'shadow-elevation-2' },
  3: { bg: 'bg-surface', border: 'border-border-strong', shadow: 'shadow-elevation-3' },
  4: { bg: 'bg-surface', border: 'border-border', shadow: 'shadow-elevation-4' },
};

export const ElevationScale: Story = {
  render: () => (
    <Section
      title="Elevation"
      note="0〜4段。既存の Card(2) / Popover・Menu(3) / Modal(4) と同じ組を使う。BottomSheet は画面下端から出るため上向きの専用影を持ち、このスケール外(意図的)。"
    >
      <div className="flex flex-wrap items-start gap-6">
        {([0, 1, 2, 3, 4] as const).map((elevation) => {
          const tokens = ELEVATION_TOKENS[elevation];
          return (
            <div key={elevation} className="flex flex-col items-center gap-2">
              <Surface
                elevation={elevation}
                padding="md"
                className="flex h-20 w-28 items-center justify-center"
              >
                <span className="text-smd font-semibold text-text">elevation {elevation}</span>
              </Surface>
              <div className="flex flex-col items-center gap-0.5 text-2xs text-text-dim">
                <span>背景: {tokens.bg}</span>
                <span>境界: {tokens.border}</span>
                <span>影: {tokens.shadow}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  ),
};
