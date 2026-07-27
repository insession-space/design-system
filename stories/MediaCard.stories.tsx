import { AvatarStack, Badge, CircleBadge, Icon, MediaCard } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// MediaCard のカタログ(#94)。メディア/ライブのカードを組み立てる複合コンポーネント。
// cover / overlay / footer はすべてスロットで、LIVE かどうか・公開範囲・参加者の解決は
// 呼び出し側(このカタログ)が担う — DS 自身は `kind` のようなプロダクト固有の union を持たない。
// ライト/ダークの確認は Storybook ツールバーの Theme 切替で行う。
const meta: Meta<typeof MediaCard> = {
  title: 'Patterns/MediaCard',
  component: MediaCard,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof MediaCard>;

// 実画像を使わず、FeedItem カタログと同じ手法(グラデーションのプレースホルダ div)でカバーを
// 表現する。
const cover = <div className="h-full w-full bg-gradient-to-br from-accent via-info to-success" />;

const people = [
  { name: 'Hiroki Saito', fallback: 'u_hiroki' },
  { name: 'Seiya Kawamura', fallback: 'u_seiya' },
  { name: 'とても長い名前のユーザー', fallback: 'u_long' },
];

export const Default: Story = {
  render: () => (
    <Section
      title="MediaCard"
      note="cover(16:9インセット) + overlay(LIVEピル + 公開範囲の円形バッジ) + title + meta + footer(AvatarStack)。"
    >
      <div className="max-w-sm">
        <MediaCard
          cover={cover}
          overlay={
            <>
              <Badge tone="live" dot>
                LIVE
              </Badge>
              <CircleBadge>
                <Icon name="public" size={14} />
              </CircleBadge>
            </>
          }
          title="Working hard"
          meta="1 watching · playing · late night"
          footer={<AvatarStack people={people} size={28} />}
        />
      </div>
    </Section>
  ),
};

export const WithoutOverlay: Story = {
  render: () => (
    <Section title="overlay なし" note="配信中でない通常のメディアカード。バッジ列を省略できる。">
      <div className="max-w-sm">
        <MediaCard
          cover={cover}
          title="週末のセッション録画"
          meta="42 views · 1:12:04"
          footer={<AvatarStack people={people.slice(0, 2)} size={28} />}
        />
      </div>
    </Section>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Section title="footer なし" note="参加者が居ない/意味が無い文脈では footer を省略できる。">
      <div className="max-w-sm">
        <MediaCard
          cover={cover}
          overlay={
            <Badge tone="live" dot>
              LIVE
            </Badge>
          }
          title="ソロ配信"
          meta="12 watching"
        />
      </div>
    </Section>
  ),
};

export const LongTitleAndMeta: Story = {
  render: () => (
    <Section
      title="長いタイトル/メタ行"
      note="truncate によりタイトル・メタ行それぞれが1行で省略記号に切れる。"
    >
      <div className="max-w-sm">
        <MediaCard
          cover={cover}
          overlay={
            <Badge tone="live" dot>
              LIVE
            </Badge>
          }
          title="とてもとても長いタイトルがここに入るときの折り返しと省略の確認用配信タイトル"
          meta="とてもとても長いメタ行がここに入るときの折り返しと省略の確認用の視聴者数と状態の表記"
          footer={<AvatarStack people={people} size={28} />}
        />
      </div>
    </Section>
  ),
};
