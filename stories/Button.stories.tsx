import { AppleIcon, Button } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS のボタン。variant(primary/accent/secondary/ghost/danger/join/apple) × size × loading/disabled。
const meta: Meta<typeof Button> = {
  title: 'Actions/Button',
  component: Button,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <Section
      title="バリアント (DS)"
      note="primary=中立塗り / accent=コーラル / secondary=2px アウトライン / ghost=テキスト(info) / danger / join=ライブ緑 pill+ドット / apple=Sign in with Apple の黒地。radius 10、join のみ pill。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">削除する</Button>
        <Button variant="join">Join session</Button>
        <Button variant="apple" icon={<AppleIcon />}>
          Apple でサインイン
        </Button>
      </div>
    </Section>
  ),
};

// #58 の回帰確認用。全 variant の枠を**目視で**確かめられるようにする。
// secondary は 2px の text 色アウトライン、danger は danger-border、それ以外は透明枠
// （border-2 ぶんの外形は全 variant で揃っている）。透明枠が「本当に透明か」「secondary の
// 枠が消えていないか」を見分けられるよう、市松模様の下地の上に並べる。
export const Borders: Story = {
  name: 'Borders (#58)',
  render: () => (
    <Section
      title="ボーダー（全 variant）"
      note="secondary は 2px アウトラインが必ず見えること（BASE の border-transparent に負けて消える不具合 #58 の回帰確認）。下地の市松模様で透明枠と塗りを見分けられる。"
    >
      <div
        className="flex flex-wrap items-center gap-4 rounded-card p-4"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, color-mix(in srgb, var(--color-text) 8%, transparent) 0 8px, transparent 8px 16px)',
        }}
      >
        <Button variant="primary">Primary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="live">Live</Button>
        <Button variant="join">Join</Button>
        <Button variant="apple" icon={<AppleIcon />}>
          Apple
        </Button>
        <Button variant="secondary" disabled>
          Secondary(無効)
        </Button>
      </div>
    </Section>
  ),
};

// #72。Apple HIG に従い黒地 / 白文字 / 白ロゴ。ライトテーマでも黒地のまま。
// hover は brightness ではなく面（--color-apple-hover）の変化で出す。
export const AppleSignIn: Story = {
  name: 'Sign in with Apple (#72)',
  render: () => (
    <Section
      title="Sign in with Apple"
      note="AppleIcon は currentColor に従うので、variant が決めた白文字にロゴも追従する。ライト/ダークどちらでも黒地を維持する。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="apple" icon={<AppleIcon />}>
          Apple でサインイン
        </Button>
        <Button variant="apple" icon={<AppleIcon />} size="sm">
          Sign in with Apple
        </Button>
        <Button variant="apple" icon={<AppleIcon />} disabled>
          無効
        </Button>
      </div>
    </Section>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Section title="サイズ" note="sm / md(既定) / lg。">
      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </Section>
  ),
};

export const States: Story = {
  render: () => (
    <Section title="状態" note="loading(スピナー + 操作不可) / disabled。">
      <div className="flex flex-wrap items-center gap-4">
        <Button loading>読み込み中</Button>
        <Button variant="ghost" loading>
          読み込み中
        </Button>
        <Button disabled>無効</Button>
        <Button variant="danger" loading>
          削除中
        </Button>
      </div>
    </Section>
  ),
};
