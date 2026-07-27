import { Skeleton } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Skeleton のカタログ。読み込み中のプレースホルダで、Spinner と同じ「読み込み状態」の仲間として
// Feedback カテゴリに置く。矩形 / 円 / テキスト複数行の3形を並べる。
const meta: Meta = {
  title: 'Feedback/Skeleton',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Rect: Story = {
  render: () => (
    <Section title="矩形" note="width / height は数値(px)・文字列('100%' 等)のどちらも受ける。">
      <div className="flex flex-col gap-3">
        <Skeleton width={240} height={16} />
        <Skeleton width={160} height={16} />
        <Skeleton width="100%" height={40} />
      </div>
    </Section>
  ),
};

export const Circle: Story = {
  render: () => (
    <Section title="円" note="circle + size でアバターのプレースホルダになる。">
      <div className="flex items-center gap-3">
        <Skeleton circle size={16} />
        <Skeleton circle size={24} />
        <Skeleton circle size={40} />
        <Skeleton circle size={56} />
      </div>
    </Section>
  ),
};

export const Text: Story = {
  render: () => (
    <Section
      title="テキスト複数行"
      note="Skeleton.Text の lines で行数を指定する。最終行だけ短くして、実際の文章の見え方に寄せる。"
    >
      <div className="flex max-w-md flex-col gap-6">
        <Skeleton.Text lines={1} />
        <Skeleton.Text lines={2} />
        <Skeleton.Text lines={4} />
      </div>
    </Section>
  ),
};

export const Shimmer: Story = {
  render: () => (
    <Section
      title="shimmer"
      note="面の上を淡いハイライトが左から右へ流れる。OS の「視差効果を減らす」設定(prefers-reduced-motion: reduce)が有効な環境では静止した面になる。"
    >
      <div className="flex max-w-sm flex-col gap-3 rounded-card border border-solid border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <Skeleton circle size={40} />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton width={120} height={14} />
            <Skeleton width={80} height={12} />
          </div>
        </div>
        <Skeleton.Text lines={3} />
      </div>
    </Section>
  ),
};
