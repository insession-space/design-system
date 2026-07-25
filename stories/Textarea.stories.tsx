import { Input, Textarea } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の複数行テキスト入力。Input と同じ見た目・同じ状態遷移の textarea 版。
const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const States: Story = {
  render: () => (
    <Section
      title="状態 (DS)"
      note="Input と同一。既定=border、フォーカスで info 枠 + リング、error=accent 枠 + メッセージ。"
    >
      <div className="flex max-w-80 flex-col gap-5">
        <Textarea
          label="Description"
          placeholder="このスペースについて書く"
          defaultValue={'金曜の夜に集まってデザインを進める部屋です。\n初見の人も歓迎。'}
        />
        <Textarea label="Focused" placeholder="クリックして focus 状態を確認" autoFocus />
        <Textarea label="Error" defaultValue="a" error="10文字以上で入力してください" />
      </div>
    </Section>
  ),
};

export const Rows: Story = {
  render: () => (
    <Section
      title="行数"
      note="rows で既定の高さを決める。既定は 4（HTML 既定の 2 行は狭いため）。"
    >
      <div className="flex max-w-80 flex-col gap-5">
        <Textarea label="rows=2" rows={2} placeholder="2 行" />
        <Textarea label="rows=4（既定）" placeholder="4 行" />
        <Textarea label="rows=8" rows={8} placeholder="8 行" />
      </div>
    </Section>
  ),
};

export const Resize: Story = {
  render: () => (
    <Section
      title="リサイズ"
      note="既定は縦のみ（vertical）。横に伸ばせると親のレイアウトが崩れるため。none で固定できる。"
    >
      <div className="flex max-w-80 flex-col gap-5">
        <Textarea label="vertical（既定）" placeholder="右下から縦に伸ばせる" />
        <Textarea label="none" resize="none" placeholder="リサイズ不可" />
      </div>
    </Section>
  ),
};

export const WithInput: Story = {
  render: () => (
    <Section
      title="Input と並べる"
      note="ラベル・field・状態色は Input と完全に同一。フォームで並べたときに揃うことが要件。"
    >
      <div className="flex max-w-80 flex-col gap-5">
        <Input label="Session name" placeholder="Friday design jam" />
        <Textarea label="Description" placeholder="このスペースについて書く" />
      </div>
    </Section>
  ),
};
