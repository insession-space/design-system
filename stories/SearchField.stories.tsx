import { SearchField } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 検索入力(claude design "INSESSION Design System" 準拠。loophub #682)。surface-2 面 + 1.5px
// border + focus-within リング。左に search アイコンを固定表示する。
const meta: Meta<typeof SearchField> = {
  title: 'Components/SearchField',
  component: SearchField,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SearchField>;

function ControlledDemo({ placeholder, initial = '' }: { placeholder: string; initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <SearchField
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="max-w-sm"
    />
  );
}

export const Empty: Story = {
  render: () => (
    <Section title="空(placeholder のみ)" note="value/onChange は useState で制御する。">
      <ControlledDemo placeholder="動画を検索" />
    </Section>
  ),
};

export const WithValue: Story = {
  render: () => (
    <Section title="入力済み">
      <ControlledDemo placeholder="動画を検索" initial="ローファイ 作業用" />
    </Section>
  ),
};

export const CustomPlaceholder: Story = {
  render: () => (
    <Section title="placeholder 違い" note="消費側の文脈に応じて placeholder を差し替える例。">
      <div className="flex flex-col gap-3">
        <ControlledDemo placeholder="メンバーを検索" />
        <ControlledDemo placeholder="スタンプを検索" />
      </div>
    </Section>
  ),
};

// label を渡したときの回帰ネット（#33）。Field.Label が control に自動で紐付く
// （label をクリックすると入力欄にフォーカスが移る）。
// label が無いときは Field.Root を挟まず移行前と同じ DOM を返す契約なので、
// className の載る要素が label の有無で変わる点もここで確認できる。
export const WithLabel: Story = {
  render: () => (
    <Section
      title="label つき"
      note="label をクリックすると入力欄にフォーカスが移る（Field.Label が control の id を自動解決する）。label が無い場合は Field.Root を挟まないので、className は検索ボックス本体に載る。"
    >
      <SearchField label="スペースを検索" placeholder="名前で検索" className="max-w-sm" />
    </Section>
  ),
};
