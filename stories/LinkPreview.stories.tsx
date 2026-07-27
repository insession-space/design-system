import { LinkPreview } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// LinkPreview のカタログ。メタデータを props で受け取るだけの純粋 presentational
// コンポーネントであることを示すため、fetch は一切行わず固定のモックデータだけを渡す。
const meta: Meta = {
  title: 'Data Display/LinkPreview',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// 外部ネットワークに依存しない data URI の OG 画像(MessageItem.stories.tsx の AVATAR_SRC と
// 同じ手段)。1.91:1 に近い横長のダミー画像。
const OG_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='382' height='200'%3E%3Crect width='382' height='200' fill='%2312d8c9'/%3E%3C/svg%3E";

export const WithImage: Story = {
  render: () => (
    <Section title="画像あり" note="OG 画像・サイト名・タイトル・説明文がすべて揃うケース。">
      <div className="max-w-md">
        <LinkPreview
          meta={{
            url: 'https://insession.space/blog/release-notes',
            title: 'InSession リリースノート',
            description: '最新のアップデート内容をまとめて紹介します。',
            siteName: 'InSession Blog',
            imageUrl: OG_IMAGE_SRC,
          }}
        />
      </div>
    </Section>
  ),
};

export const WithoutImage: Story = {
  render: () => (
    <Section
      title="画像なし"
      note="imageUrl が無いメタデータでは画像領域自体を出さない(汎用プレースホルダは残さない)。"
    >
      <div className="max-w-md">
        <LinkPreview
          meta={{
            url: 'https://insession.space/help',
            title: 'ヘルプセンター',
            description: 'よくある質問と使い方ガイド。',
            siteName: 'InSession Help',
          }}
        />
      </div>
    </Section>
  ),
};

export const NoSiteName: Story = {
  render: () => (
    <Section
      title="siteName 省略"
      note="siteName が無い OGP はよくあるため、その場合は url のホスト名を表示に使う。"
    >
      <div className="max-w-md">
        <LinkPreview
          meta={{
            url: 'https://example.com/articles/12345',
            title: 'siteName を持たないページの例',
          }}
        />
      </div>
    </Section>
  ),
};

export const LongTitleAndDescription: Story = {
  render: () => (
    <Section
      title="長いタイトル・説明(クランプ確認)"
      note="タイトル・説明文とも line-clamp-2 で2行にクランプされ、それ以上は省略される。"
    >
      <div className="max-w-md">
        <LinkPreview
          meta={{
            url: 'https://insession.space/blog/how-we-built-watch-party-sync-engine-part-2',
            title:
              '同期エンジンをどう作ったか(後編): Watch Party の再生位置合わせと遅延補正、そして今後の課題について詳しく解説する長いタイトル',
            description:
              'InSession の Watch Party 機能を支える同期エンジンについて、設計判断とトレードオフを詳しく解説します。前編では基本的なアーキテクチャを紹介しましたが、今回は実際の遅延補正アルゴリズムや、複数クライアント間でのドリフト検出の仕組みについて掘り下げていきます。',
            siteName: 'InSession Blog',
            imageUrl: OG_IMAGE_SRC,
          }}
        />
      </div>
    </Section>
  ),
};

export const Loading: Story = {
  render: () => (
    <Section
      title="loading"
      note="meta が未解決の間の表示。Skeleton で画像領域とテキスト2〜3行分のプレースホルダを出す。"
    >
      <div className="max-w-md">
        <LinkPreview loading />
      </div>
    </Section>
  ),
};
