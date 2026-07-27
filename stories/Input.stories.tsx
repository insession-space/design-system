import { Input } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS のテキスト入力。ラベル(mono caps) + default / focus(info リング) / error(accent) 状態。
const meta: Meta<typeof Input> = {
  title: 'Inputs/Input',
  component: Input,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const States: Story = {
  render: () => (
    <Section
      title="状態 (DS)"
      note="ラベルは mono 大文字。既定=border、フォーカスで info 枠 + リング、error=accent 枠 + メッセージ。"
    >
      <div className="flex max-w-80 flex-col gap-5">
        <Input
          label="Session name"
          placeholder="Friday design jam"
          defaultValue="Friday design jam"
        />
        <Input label="Focused" placeholder="クリックして focus 状態を確認" autoFocus />
        <Input label="Error" defaultValue="taken-name" error="この名前は使われています" />
      </div>
    </Section>
  ),
};
