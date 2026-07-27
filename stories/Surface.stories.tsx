import { Card, Surface } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Surface 自体(4辺に境界を引く汎用の面)のカタログ。elevation の段そのものの
// 対応表は Foundations/Elevation にあるので、ここでは Surface の使い方
// (padding/radius/elevation の指定と interactive 挙動)にフォーカスする。
const meta: Meta = {
  title: 'Surfaces/Surface',
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

export const Clickable: Story = {
  render: () => (
    <Section
      title="render (クリックできるカード)"
      note="render={<button type='button' />} で面そのものを <button> として描く(#56)。「リセットした <button> > Surface」の入れ子が要らなくなり、<button> の中に <div> を置く content model 違反も消える。UA 既定のボタン外観(OS の面/枠/中央揃え/マージン)は DS 側で打ち消す。"
    >
      <div className="flex flex-wrap items-start gap-4" data-testid="clickable-cards">
        <Card
          render={<button type="button" />}
          interactive
          data-testid="card-button"
          onClick={() => {}}
          className="w-56"
        >
          <p className="text-smd font-semibold text-text">クリックできるカード</p>
          <p className="text-2xs text-text-dim">1要素(button)で面ごと描かれる。</p>
        </Card>
        <Surface
          render={<a href="#clickable" />}
          elevation={2}
          padding="md"
          interactive
          data-testid="card-link"
          className="w-56 no-underline"
        >
          <p className="text-smd font-semibold text-text">リンクのカード</p>
          <p className="text-2xs text-text-dim">render は button 以外にも使える。</p>
        </Surface>
      </div>
    </Section>
  ),
};

export const ToneAndShadow: Story = {
  render: () => (
    <Section
      title="tone / shadow (elevation に直交する軸)"
      note="elevation の段は動かさず、面の色だけ(tone)・影だけ(shadow)を切る軸(#57)。className で bg-tint-5 / shadow-none を1プロパティだけ上書きしていたパターンを props で表現する。"
    >
      <div className="flex flex-wrap items-start gap-4">
        <Surface elevation={2} padding="md" data-testid="surface-default" className="w-44">
          <p className="text-smd text-text">既定</p>
          <p className="text-2xs text-text-dim">elevation=2</p>
        </Surface>
        <Surface
          elevation={2}
          shadow="none"
          padding="md"
          data-testid="surface-shadow-none"
          className="w-44"
        >
          <p className="text-smd text-text">面あり・影なし</p>
          <p className="text-2xs text-text-dim">elevation=2 shadow=&quot;none&quot;</p>
        </Surface>
        <Surface elevation={1} tone="tint" padding="md" data-testid="surface-tint" className="w-44">
          <p className="text-smd text-text">tint 面</p>
          <p className="text-2xs text-text-dim">elevation=1 tone=&quot;tint&quot;</p>
        </Surface>
      </div>
    </Section>
  ),
};
