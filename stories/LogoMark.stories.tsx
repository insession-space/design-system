import { LogoMark, type LogoMarkVariant } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// ロゴマーク(LOOPHUB ブランドの「リング+3ドット」マーク。loophub #724)。variant='row' は横並び
// マーク+ワードマーク、variant='cluster' は単体マーク(プロダクト切替チップ等の小さな箇所向け)。
const meta: Meta<typeof LogoMark> = {
  title: 'Components/LogoMark',
  component: LogoMark,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof LogoMark>;

const VARIANTS: LogoMarkVariant[] = ['row', 'cluster'];
const SIZES = [16, 20, 32, 48];

export const VariantsBySizes: Story = {
  render: () => (
    <Section
      title="全 variant × サイズ違い"
      note="row(既定)=マーク単体(ワードマークなし) / cluster=単体マーク。サイズ 16/20(既定)/32/48。"
    >
      <div className="flex flex-col gap-6">
        {VARIANTS.map((variant) => (
          <div key={variant} className="flex items-center gap-6">
            <span className="w-16 shrink-0 text-smd font-semibold text-text-dim">{variant}</span>
            {SIZES.map((size) => (
              <LogoMark key={size} variant={variant} size={size} />
            ))}
          </div>
        ))}
      </div>
    </Section>
  ),
};

export const WithWordmark: Story = {
  render: () => (
    <Section
      title="ワードマーク付き(showWordmark)"
      note="row variant で showWordmark=true にすると 'LOOPHUB' の文字(font-display)を並べる。wordmarkSize 省略時は size から比例算出。"
    >
      <div className="flex flex-col gap-4">
        <LogoMark size={20} showWordmark />
        <LogoMark size={32} showWordmark />
        <LogoMark size={20} showWordmark wordmarkSize={24} />
      </div>
    </Section>
  ),
};
