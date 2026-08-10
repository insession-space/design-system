import { Lozenge } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の Lozenge。状態/メタの mono 大文字ラベル(LIVE / PENDING / REC / BETA)。塗り控えめ・非操作。
const meta: Meta<typeof Lozenge> = {
  title: 'Data Display/Lozenge',
  component: Lozenge,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Lozenge>;

export const Tones: Story = {
  render: () => (
    <Section
      title="トーン (DS)"
      note="mono 大文字 + セマンティック tint。dot で先頭に同色ドット。実時間で変わり続ける状態は StatusBadge を使う（こちらはオブジェクトの工程・区分）。トーンは DS 共通の語彙 + ブランド強調の accent。danger は #962 で追加した。"
    >
      <div className="flex flex-wrap items-center gap-2.25">
        <Lozenge tone="success" dot>
          LIVE
        </Lozenge>
        <Lozenge tone="warning">PENDING</Lozenge>
        <Lozenge tone="danger">FAILED</Lozenge>
        <Lozenge tone="accent">REC</Lozenge>
        <Lozenge tone="info">BETA</Lozenge>
        <Lozenge tone="neutral">DRAFT</Lozenge>
      </div>
    </Section>
  ),
};
