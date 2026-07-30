import { Button, EmptyState } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の EmptyState。セクション単位の空状態を「アイコン + タイトル + ヒント + CTA」で伝える。
// 一行で足りる文脈（キュー/履歴タブ・検索候補ドロップダウン）は EmptyNote を使う。
const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Variants: Story = {
  render: () => (
    <Section
      title="構成要素 (DS)"
      note="icon + title は必須。hint と action は文脈に応じて足す。次の行動が1つに決まるセクションだけ action を出す。"
    >
      <div className="flex flex-col gap-3 max-w-md">
        <EmptyState icon="group" title="まだ誰もフォローしていません" />
        <EmptyState
          icon="group"
          title="まだ誰もフォローしていません"
          hint="友だちをフォローすると、その人のスペースがここに並びます。"
        />
        <EmptyState
          icon="group"
          title="まだ誰もフォローしていません"
          hint="友だちをフォローすると、その人のスペースがここに並びます。"
          action={
            <Button variant="primary" size="sm" pill>
              友だちを探す
            </Button>
          }
        />
      </div>
    </Section>
  ),
};

export const InSection: Story = {
  render: () => (
    <Section
      title="セクションの中に置く"
      note="破線ボーダー + 半透明の面なので、周囲のカード（実線ボーダー）と区別がつく。"
    >
      <div className="max-w-md rounded-card border border-solid border-border bg-surface-2 p-3.5">
        <div className="mb-2.5 text-sm font-bold text-text">アクティブなスペース</div>
        <EmptyState
          icon="graphic_eq"
          title="いま動いているスペースはありません"
          hint="誰かがスペースを始めると、ここにリアルタイムで並びます。"
        />
      </div>
    </Section>
  ),
};
