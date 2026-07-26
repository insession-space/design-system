import { Avatar, AvatarStack, type AvatarStackPerson } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS の AvatarStack(+N overflow)。people を重ねて描画し、max を超えた分は +N の中立トークンで示す。
// presence 表示などの将来集約先(token/props ベース)。
const meta: Meta<typeof AvatarStack> = {
  title: 'Components/AvatarStack',
  component: AvatarStack,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof AvatarStack>;

const PEOPLE: AvatarStackPerson[] = [
  { name: 'Alice', color: 'hsl(180 65% 45%)' },
  { name: 'Bob', color: 'hsl(300 65% 45%)' },
  { name: 'Chris', color: 'hsl(90 65% 45%)' },
  { name: 'Dan', color: 'hsl(30 65% 45%)' },
  { name: 'Eve', color: 'hsl(220 65% 45%)' },
  { name: 'Frank', color: 'hsl(0 65% 45%)' },
  { name: 'Grace', color: 'hsl(260 65% 45%)' },
];

export const TwoPeople: Story = {
  render: () => (
    <Section title="2人" note="max(既定4)を超えないので +N は出ない。">
      <AvatarStack people={PEOPLE.slice(0, 2)} />
    </Section>
  ),
};

export const FivePeople: Story = {
  render: () => (
    <Section title="5人(既定 max=4)" note="4人まで表示し、超過分は +N の中立トークンで示す。">
      <AvatarStack people={PEOPLE.slice(0, 5)} />
    </Section>
  ),
};

export const OverMax: Story = {
  render: () => (
    <Section title="上限超過(7人・max=5指定)" note="max を明示指定した例。size も変えられる。">
      <AvatarStack people={PEOPLE} max={5} size={32} />
    </Section>
  ),
};

export const Status: Story = {
  render: () => (
    <Section
      title="status バリエーション(下位の Avatar)"
      note="AvatarStackPerson は status を持たないため、状態点は AvatarStack が内部で使う Avatar 単体の機能として示す(live=success / offline=text-dim)。"
    >
      <div className="flex items-center gap-4">
        <Avatar name="Alice" color="hsl(180 65% 45%)" status="live" ring />
        <Avatar name="Bob" color="hsl(300 65% 45%)" status="offline" ring />
      </div>
    </Section>
  ),
};

// 画像の読み込み失敗で fallback に切り替わることの回帰ネット（#33）。
// 移行前は src があれば無条件で <img> を描いていたため、URL が壊れていても
// 画像が割れたまま残り、頭文字の円に切り替わらなかった。
export const BrokenImage: Story = {
  render: () => (
    <Section
      title="画像の読み込み失敗"
      note="左は正しい data URI の画像、右は存在しない URL。右が頭文字の fallback 円に切り替われば正しい（Base UI の Avatar.Image / Fallback が読み込み状態を見て出し分ける）。"
    >
      <div className="flex items-center gap-4">
        <Avatar
          name="Ok"
          status="live"
          ring
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%2312d8c9'/%3E%3C/svg%3E"
        />
        <Avatar
          name="Broken"
          color="hsl(20 65% 45%)"
          status="offline"
          ring
          src="/__does-not-exist__.png"
        />
      </div>
    </Section>
  ),
};
