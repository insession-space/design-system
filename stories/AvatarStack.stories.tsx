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
