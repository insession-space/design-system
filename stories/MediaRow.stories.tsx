import { Icon, IconButton, MediaRow, MediaThumbnail } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Section } from './tokens';

// MediaRow のカタログ(#94)。キュー/プレイリストの1行を組み立てる複合コンポーネント。
// dragHandle / thumbnail / actions はすべてスロットなので、ここでも「再生 / お気に入り / 削除」
// のような意味づけは呼び出し側(このカタログ)が組み立てる — DS 自身は onPlay 等を持たない。
// ライト/ダークの確認は Storybook ツールバーの Theme 切替で行う(トークンのみで組んでいるため
// テーマ分岐はコンポーネント側に無い)。
const meta: Meta<typeof MediaRow> = {
  title: 'Patterns/MediaRow',
  component: MediaRow,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof MediaRow>;

function Queue({ children }: { children: ReactNode }) {
  return <div className="flex max-w-xl flex-col gap-2">{children}</div>;
}

// 実画像を使わず、既存の FeedItem カタログと同じ手法(グラデーションのプレースホルダ div)で
// サムネイルの中身を表現する。
const coverPlaceholder = (
  <div className="h-full w-full bg-gradient-to-br from-accent via-info to-success" />
);

function rowActions() {
  return (
    <>
      <IconButton
        label="再生"
        icon={<Icon name="play_arrow" size={18} />}
        variant="ghost"
        touchSize={44}
      />
      <IconButton
        label="お気に入りに追加"
        icon={<Icon name="star_outline" size={18} />}
        variant="ghost"
        touchSize={44}
      />
      <IconButton
        label="キューから削除"
        icon={<Icon name="close" size={18} />}
        variant="ghost"
        touchSize={44}
      />
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Section
      title="MediaRow"
      note="ドラッグハンドル(装飾。aria-hidden) + MediaThumbnail(4K・3:32のオーバーレイ) + タイトル/サブテキスト + アクション3つ。"
    >
      <Queue>
        <MediaRow
          dragHandle
          thumbnail={
            <MediaThumbnail quality="4K" duration="3:32">
              {coverPlaceholder}
            </MediaThumbnail>
          }
          title="深夜のプレイリスト特集"
          subtitle="1番目 · Seiya が追加"
          actions={rowActions()}
        />
        <MediaRow
          dragHandle
          thumbnail={
            <MediaThumbnail quality="HD" duration="12:07">
              <div className="h-full w-full bg-gradient-to-br from-warning via-accent to-danger" />
            </MediaThumbnail>
          }
          title="作業用BGMメドレー"
          subtitle="2番目 · Hiroki が追加"
          actions={rowActions()}
        />
      </Queue>
    </Section>
  ),
};

export const WithoutDragHandle: Story = {
  render: () => (
    <Section
      title="dragHandle なし"
      note="dragHandle を省略すると並び替え不可の行として先頭の余白が詰まる。"
    >
      <Queue>
        <MediaRow
          thumbnail={
            <MediaThumbnail quality="4K" duration="3:32">
              {coverPlaceholder}
            </MediaThumbnail>
          }
          title="深夜のプレイリスト特集"
          subtitle="1番目 · Seiya が追加"
          actions={rowActions()}
        />
      </Queue>
    </Section>
  ),
};

export const WithoutThumbnail: Story = {
  render: () => (
    <Section title="thumbnail なし" note="音声のみのキュー等、サムネイルが無い行にも対応する。">
      <Queue>
        <MediaRow
          dragHandle
          title="ポッドキャスト: デザインの現場"
          subtitle="3番目 · Seiya が追加"
          actions={rowActions()}
        />
      </Queue>
    </Section>
  ),
};

export const LongTitleAndSubtitle: Story = {
  render: () => (
    <Section
      title="長いタイトル/サブテキスト"
      note="min-w-0 + truncate により、中央列だけが縮んでサムネイル/アクションの幅を奪わない。"
    >
      <Queue>
        <MediaRow
          dragHandle
          thumbnail={
            <MediaThumbnail quality="4K" duration="58:12">
              {coverPlaceholder}
            </MediaThumbnail>
          }
          title="とてもとても長いタイトルがここに入るときの折り返しと省略の確認用プレイリスト特集回"
          subtitle="とてもとても長いサブテキストがここに入るときの折り返しと省略の確認用の追加者表記"
          actions={rowActions()}
        />
      </Queue>
    </Section>
  ),
};
