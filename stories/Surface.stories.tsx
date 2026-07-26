import { Surface } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Surface 自体(4辺に境界を引く汎用の面)のカタログ。elevation の段そのものの
// 対応表は Foundations/Elevation にあるので、ここでは Surface の使い方
// (padding/radius/elevation の指定と interactive 挙動)にフォーカスする。
const meta: Meta = {
  title: 'Surface/Surface',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Section
      title="Surface"
      note="elevation(0〜4) + padding + radius を指定する面の基底。段の対応は Foundations/Elevation 参照。"
    >
      <div className="flex flex-wrap items-start gap-4">
        <Surface elevation={1} padding="md" radius="card" className="w-40">
          <p className="text-smd text-text">elevation=1, radius=card</p>
        </Surface>
        <Surface elevation={2} padding="lg" radius="panel" className="w-40">
          <p className="text-smd text-text">elevation=2, radius=panel</p>
        </Surface>
      </div>
    </Section>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Section
      title="interactive"
      note="hover で -translate-y-0.5 + bg-surface-hover の控えめな持ち上げ。フォーカスリングは focus-visible:shadow-focus。"
    >
      <Surface interactive tabIndex={0} elevation={2} padding="md" className="max-w-xs">
        <p className="text-smd text-text">ホバー/フォーカスしてみる。</p>
      </Surface>
    </Section>
  ),
};
