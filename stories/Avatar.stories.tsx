import { Avatar } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の Avatar。画像 or ラベル(既定は名前の先頭1文字)の円。size / color / status / ring を注入。
// 複数人を重ねて出すなら AvatarStack を使う。
const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Variants: Story = {
  render: () => (
    <Section
      title="バリアント (DS)"
      note="画像があれば画像、無ければ label(既定は name の先頭1文字)の円。color 省略時は info(blue)。壊れた URL は fallback 円へ落ちる。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name="Alice" ring />
        <Avatar name="Bob" color="hsl(300 65% 45%)" ring />
        <Avatar label="AB" color="hsl(90 65% 45%)" ring />
        <Avatar name="Dan" src="https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg" ring />
        <Avatar name="Err" src="https://example.invalid/broken.png" ring />
      </div>
    </Section>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Section
      title="サイズ"
      note="size(px)で寸法を指定する。文字サイズと状態点は size から導出される。"
    >
      <div className="flex flex-wrap items-end gap-4">
        <Avatar name="Small" size={24} ring />
        <Avatar name="Medium" size={40} ring />
        <Avatar name="Large" size={64} ring />
      </div>
    </Section>
  ),
};

export const Status: Story = {
  render: () => (
    <Section
      title="状態点"
      note="status で右下に点を出す。live=success / offline=text-dim。surface 色の 2px 枠が付く。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name="Live" status="live" />
        <Avatar name="Offline" status="offline" />
        <Avatar name="Ring" ring />
      </div>
    </Section>
  ),
};
