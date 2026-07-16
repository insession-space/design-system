import { Checkbox, Radio } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// DS の選択コントロール。Checkbox(22x22 / radius6 / fill+check) と Radio(円 / 2px枠 / accent ドット)。
const meta: Meta = {
  title: 'Components/Controls',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Checkboxes: Story = {
  render: () => {
    const [a, setA] = useState(true);
    const [b, setB] = useState(false);
    return (
      <Section title="Checkbox (DS)" note="22x22 / radius 6。off=2px 枠、on=fill 塗り + チェック。">
        <div className="flex flex-col gap-3">
          <Checkbox
            checked={a}
            onChange={(e) => setA(e.target.checked)}
            label="Watch Party を有効化"
          />
          <Checkbox checked={b} onChange={(e) => setB(e.target.checked)} label="通知を受け取る" />
        </div>
      </Section>
    );
  },
};

export const Radios: Story = {
  render: () => {
    const [val, setVal] = useState('all');
    const opts = [
      { key: 'all', label: '全員に公開' },
      { key: 'friends', label: 'フレンドのみ' },
      { key: 'private', label: '非公開' },
    ];
    return (
      <Section title="Radio (DS)" note="円 / 2px 枠。選択で枠=text 色 + 中央に accent ドット。">
        <div className="flex flex-col gap-3">
          {opts.map((o) => (
            <Radio
              key={o.key}
              name="visibility"
              checked={val === o.key}
              onChange={() => setVal(o.key)}
              label={o.label}
            />
          ))}
        </div>
      </Section>
    );
  },
};
