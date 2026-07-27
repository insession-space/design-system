import { Icon, SegmentedControl, Slider, ToggleGroup, ToolButton } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// #53 で追加した3プリミティブ。いずれも消費側(insession-app)が legacy CSS や
// `<input type="range">` で手組みしていたものを DS に上げたもの。
// 振る舞いは Base UI 委譲(Slider / RadioGroup / ToggleGroup)。
const meta: Meta = {
  title: 'Inputs/Segmented & Slider',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Sliders: Story = {
  render: () => {
    const [volume, setVolume] = useState(70);
    const [width, setWidth] = useState(4);
    return (
      <Section
        title="Slider"
        note="track 6px / thumb 16px。min から現在値までを accent で塗る。valueLabel は整形済み文字列を受ける(単位付けは消費側の責務)。"
      >
        <div className="flex max-w-100 flex-col gap-6">
          <Slider
            label="音量"
            valueLabel={`${volume}%`}
            value={volume}
            onValueChange={(v) => setVolume(v as number)}
          />
          <Slider
            label="ペンの太さ"
            valueLabel={`${width}px`}
            min={1}
            max={24}
            step={1}
            value={width}
            onValueChange={(v) => setWidth(v as number)}
          />
          <Slider label="値表示なし" defaultValue={40} />
          <Slider label="disabled" valueLabel="30%" defaultValue={30} disabled />
        </div>
      </Section>
    );
  },
};

export const Segmented: Story = {
  render: () => {
    const [lang, setLang] = useState('ja');
    const [theme, setTheme] = useState('dark');
    const [kind, setKind] = useState('bug');
    return (
      <Section
        title="SegmentedControl"
        note="常に1つが選択される切り替え。RadioGroup に載せているので矢印キー移動と『n個中n番目』の読み上げが付く。"
      >
        <div className="flex flex-col items-start gap-6">
          <SegmentedControl
            ariaLabel="言語"
            value={lang}
            onValueChange={(v) => setLang(v as string)}
            items={[
              { value: 'ja', label: '日本語' },
              { value: 'en', label: 'English' },
            ]}
          />
          <SegmentedControl
            ariaLabel="テーマ"
            value={theme}
            onValueChange={(v) => setTheme(v as string)}
            items={[
              { value: 'system', label: 'システム' },
              { value: 'light', label: 'ライト' },
              { value: 'dark', label: 'ダーク' },
            ]}
          />
          <div className="w-full max-w-100">
            <SegmentedControl
              fill
              ariaLabel="フィードバックの種類"
              value={kind}
              onValueChange={(v) => setKind(v as string)}
              items={[
                { value: 'bug', label: '不具合' },
                { value: 'feature', label: '要望' },
                { value: 'other', label: 'その他', disabled: true },
              ]}
            />
          </div>
        </div>
      </Section>
    );
  },
};

export const Tools: Story = {
  render: () => {
    const [tool, setTool] = useState<string[]>(['pen']);
    const [marks, setMarks] = useState<string[]>(['bold']);
    return (
      <Section
        title="ToggleGroup / ToolButton"
        note="ツールバーの排他選択。40x40。押下=accent 塗り、非押下=透明 + hover で面。multiple で複数選択にもできる。"
      >
        <div className="flex flex-col gap-6">
          <ToggleGroup ariaLabel="描画ツール" value={tool} onValueChange={setTool}>
            <ToolButton value="pen" label="ペン" icon={<Icon name="edit" />} />
            <ToolButton value="eraser" label="消しゴム" icon={<Icon name="delete" />} />
            <ToolButton value="text" label="テキスト" icon={<Icon name="chat" />} />
          </ToggleGroup>
          <ToggleGroup ariaLabel="装飾" multiple value={marks} onValueChange={setMarks}>
            <ToolButton value="bold">太字</ToolButton>
            <ToolButton value="italic">斜体</ToolButton>
            <ToolButton value="strike" disabled>
              打ち消し
            </ToolButton>
          </ToggleGroup>
        </div>
      </Section>
    );
  },
};
