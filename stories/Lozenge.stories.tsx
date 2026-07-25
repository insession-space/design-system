import { Lozenge } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の Lozenge。状態/メタの mono 大文字ラベル(LIVE / PENDING / REC / BETA)。塗り控えめ・非操作。
const meta: Meta<typeof Lozenge> = {
  title: 'Components/Lozenge',
  component: Lozenge,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Lozenge>;

export const Tones: Story = {
  render: () => (
    <Section
      title="トーン (DS)"
      note="mono 大文字 + セマンティック tint。dot で先頭に同色ドット。継続状態は StatusBadge を使う。"
    >
      <div className="flex flex-wrap items-center gap-2.25">
        <Lozenge tone="success" dot>
          LIVE
        </Lozenge>
        <Lozenge tone="warning">PENDING</Lozenge>
        <Lozenge tone="accent">REC</Lozenge>
        <Lozenge tone="info">BETA</Lozenge>
        <Lozenge tone="neutral">DRAFT</Lozenge>
      </div>
    </Section>
  ),
};
