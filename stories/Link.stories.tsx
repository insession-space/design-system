import { Link } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// DS のテキストリンク（#633）。variant=inline/subtle/pill。下線は使わずボタンのラベルのように
// 色 + ウェイトで区別する。色は --color-link / --color-link-hover、focus は全リンク共通の
// グローバル :focus-visible（--color-focus-ring）。
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
      note="下線なし・ボタンテキスト調。inline=本文中 / subtle=弱い誘導(小サイズ) / pill=独立リンク(旧 .section-link・.list-back)。色+ウェイトで区別。"
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
        <Link
          variant="wrapper"
          href="#"
          className="flex max-w-85 items-center gap-3 rounded-card border border-solid border-border bg-surface p-4 shadow-soft"
        >
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold truncate">wrapper = カード全体がリンク</div>
            <div className="font-body text-xs text-text-faint">
              色/ウェイトを持たず下線だけ消す（中身のタイポは呼び出し側）
            </div>
          </div>
        </Link>
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
