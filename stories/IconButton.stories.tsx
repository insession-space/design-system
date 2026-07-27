import { Icon, IconButton, type IconButtonVariant } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// アイコンのみの正方形ボタン(claude design "INSESSION Design System" 準拠。loophub #682)。
// variant: surface(既定。surface-2 面+border) / accent(coral 塗り) / ghost(透明地・hover のみ面)。
const meta: Meta<typeof IconButton> = {
  title: 'Actions/IconButton',
  component: IconButton,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

const VARIANTS: IconButtonVariant[] = ['surface', 'accent', 'ghost'];
const SIZES = [28, 36, 44];

export const VariantsBySizes: Story = {
  render: () => (
    <Section
      title="全 variant × 全 size"
      note="surface / accent / ghost の3 variant を、28 / 36(既定) / 44 の3サイズで網羅する。"
    >
      <div className="flex flex-col gap-6">
        {VARIANTS.map((variant) => (
          <div key={variant} className="flex items-center gap-4">
            <span className="w-20 shrink-0 text-smd font-semibold text-text-dim">{variant}</span>
            {SIZES.map((size) => (
              <IconButton
                key={size}
                label={`${variant} ${size}px`}
                icon={<Icon name="settings" size={Math.round(size * 0.5)} />}
                variant={variant}
                size={size}
              />
            ))}
          </div>
        ))}
      </div>
    </Section>
  ),
};

export const TouchTarget: Story = {
  render: () => (
    <Section
      title="タッチ端末のタップ領域(touchSize)"
      note="touchSize は @media (pointer: coarse) のときだけ効く最小の一辺(#60)。指で押す操作系は Apple HIG のタップターゲット下限 44 を渡す。省略時はタッチでも size のまま(既存の見た目を変えない)。寸法はインライン style ではなくユーティリティ + CSS 変数で当てているので、className のバリアント付きユーティリティでも広げられる。マウスのブラウザでは差が出ないので、DevTools のデバイスエミュレーション(またはタッチ端末)で確認する。"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="w-56 shrink-0 text-smd font-semibold text-text-dim">
            size=30（touchSize 無し）
          </span>
          <IconButton
            label="リアクション(既定)"
            icon={<Icon name="settings" size={16} />}
            size={30}
            data-testid="ib-plain"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="w-56 shrink-0 text-smd font-semibold text-text-dim">
            size=30 / touchSize=44
          </span>
          <IconButton
            label="リアクション(タッチ44px)"
            icon={<Icon name="settings" size={16} />}
            size={30}
            touchSize={44}
            data-testid="ib-touch"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="w-56 shrink-0 text-smd font-semibold text-text-dim">
            className の上書き(max-md:size-11)
          </span>
          <IconButton
            label="狭幅で44px"
            icon={<Icon name="settings" size={16} />}
            size={30}
            className="max-md:size-11"
            data-testid="ib-class"
          />
        </div>
      </div>
    </Section>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Section
      title="無効状態"
      note="disabled は全 variant 共通で disabled:opacity-(--disabled-opacity)。"
    >
      <div className="flex items-center gap-4">
        {VARIANTS.map((variant) => (
          <IconButton
            key={variant}
            label={`${variant} 無効`}
            icon={<Icon name="settings" size={18} />}
            variant={variant}
            disabled
          />
        ))}
      </div>
    </Section>
  ),
};
