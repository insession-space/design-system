import { Checkbox, Radio, Toggle } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// DS の選択コントロール。Checkbox(22x22 / radius6 / fill+check) と Radio(円 / 2px枠 / accent ドット)
// と Toggle(track 46x26 / knob 20x20)。いずれも振る舞いは Base UI 委譲(#22)。
const meta: Meta = {
  title: 'Inputs/Controls',
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
          <Checkbox checked={a} onCheckedChange={setA} label="Watch Party を有効化" />
          <Checkbox checked={b} onCheckedChange={setB} label="通知を受け取る" />
          <Checkbox checked disabled label="disabled (checked)" />
          <Checkbox checked={false} disabled label="disabled (unchecked)" />
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
      <Section
        title="Radio (DS)"
        note="円 / 2px 枠。選択で枠=text 色 + 中央に accent ドット。3.0 で Radio.Group + Radio.Item の compound になり、矢印キーでグループ内を移動できる（tab stop は選択中の1つだけ）。"
      >
        <Radio.Group name="visibility" value={val} onValueChange={setVal} aria-label="公開範囲">
          {opts.map((o) => (
            <Radio.Item key={o.key} value={o.key} label={o.label} />
          ))}
          <Radio.Item value="disabled" disabled label="disabled" />
        </Radio.Group>
      </Section>
    );
  },
};

// Toggle は移行前まで story を持っておらず、見た目の回帰を検出できなかった（#22 で追加）。
// track 46x26 の pill / on=success・off=border-strong / knob 20x20 の白丸 / off=left3・on=left23。
export const Switches: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    const [off, setOff] = useState(false);
    return (
      <Section
        title="Toggle (DS)"
        note="track 46x26 の pill。on=success(green) / off=border-strong。knob 20x20 の白丸が left3 ↔ left23 を移動する。3.0 で振る舞いを Base UI の Switch へ委譲したが、props（checked / onChange / label / disabled）は移行前と同じ。"
      >
        <div className="flex items-center gap-5">
          <Toggle checked={on} onChange={() => setOn((v) => !v)} label="通知" />
          <Toggle checked={off} onChange={() => setOff((v) => !v)} label="自動再生" />
          <Toggle checked disabled label="disabled (on)" />
          <Toggle checked={false} disabled label="disabled (off)" />
        </div>
      </Section>
    );
  },
};

// Radio.Group ごと disabled にしたときの回帰ネット（#22 のレビュー指摘）。
// 各 Item は自分の disabled prop を受け取らないので、行（円 + ラベル）が無効表示に
// なるかどうかは has-[[data-disabled]] が効いているかで決まる。
export const RadioGroupDisabled: Story = {
  render: () => (
    <Section
      title="Radio.Group disabled"
      note="グループ全体を disabled にすると、円だけでなくラベルを含む行全体が薄く・not-allowed になる。Item 側に disabled を渡していない点が要点（親から降ってくる経路）。"
    >
      <Radio.Group defaultValue="a" disabled aria-label="無効なグループ">
        <Radio.Item value="a" label="選択中（グループごと無効）" />
        <Radio.Item value="b" label="未選択（グループごと無効）" />
      </Radio.Group>
    </Section>
  ),
};

// uncontrolled（defaultChecked / defaultValue）の回帰ネット（#22 のレビュー指摘）。
// Toggle が checked にデフォルト値を持つと Switch.Root が常に controlled になり、
// defaultChecked が無視されて常に OFF になる。
export const Uncontrolled: Story = {
  render: () => (
    <Section
      title="uncontrolled"
      note="checked / value を渡さず defaultChecked / defaultValue だけで初期状態を決めるパターン。Toggle は初期 ON、Checkbox は初期チェック済み、Radio は 2 番目が選択済みで表示される。"
    >
      <div className="flex flex-col gap-4">
        <Toggle defaultChecked label="初期 ON" />
        <Checkbox defaultChecked label="初期チェック済み" />
        <Radio.Group defaultValue="b" aria-label="初期選択">
          <Radio.Item value="a" label="A" />
          <Radio.Item value="b" label="B（初期選択）" />
        </Radio.Group>
      </div>
    </Section>
  ),
};
