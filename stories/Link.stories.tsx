import { Link } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS のテキストリンク（#633）。variant=inline/subtle/pill。色は --color-link / --color-link-hover、
// focus は全リンク共通のグローバル :focus-visible（--color-focus-ring）。
const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Link>;

export const Variants: Story = {
  render: () => (
    <Section
      title="バリアント (DS)"
      note="inline=本文中(下線あり・offset 2px) / subtle=弱い誘導(色のみ、hover で下線) / pill=独立リンク(旧 .section-link・.list-back)。"
    >
      <div className="flex flex-col gap-5">
        <p className="text-base text-text-dim">
          利用にあたっては{' '}
          <Link variant="inline" href="#">
            利用規約
          </Link>{' '}
          に同意したものとみなされます。
        </p>
        <div>
          <Link variant="subtle" href="#">
            ← コミュニティ一覧へ戻る
          </Link>
        </div>
        <div>
          <Link variant="pill" href="#">
            すべて見る
          </Link>
        </div>
      </div>
    </Section>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Section
      title="asChild（別コンポーネント吸収）"
      note="react-router の Link/NavLink 等へクラスだけ注入する。ここでは <button> をリンク外観にする例。"
    >
      <Link asChild variant="subtle">
        <button type="button">クリックできる要素</button>
      </Link>
    </Section>
  ),
};
