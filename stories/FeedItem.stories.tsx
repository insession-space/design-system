import {
  Avatar,
  Button,
  FeedItem,
  FeedItemAttachment,
  Icon,
  Lozenge,
} from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Section } from './tokens';

// FeedItem のカタログ。フィード(アクティビティ)の1件分を組み立てる複合コンポーネント。
// 見た目だけを持ち、文言の解決・データ更新・遷移は呼び出し側が担う — カタログ側でも
// 「2日前」のような**整形済みの文字列**を直に渡している。
const meta: Meta = {
  title: 'UI Kit/FeedItem',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// カードは幅いっぱいに広がるので、カタログ側で現実的な横幅に収める。
function Feed({ children }: { children: ReactNode }) {
  return <div className="flex max-w-xl flex-col gap-3">{children}</div>;
}

const actor = <Avatar name="Hiroki Saito" fallback="u_hiroki" size={40} ring />;

// サムネイルの枠(44×64・角丸・切り落とし)は FeedItemAttachment が持つので、
// 渡すのは中身だけ。枠いっぱいに敷きたいので h-full w-full を付ける。
const spaceThumb = (
  <div className="h-full w-full bg-gradient-to-br from-accent via-info to-success" />
);

// LIVE ピルは枠(position: relative)を基準に絶対配置する。
const liveThumb = (
  <>
    {spaceThumb}
    <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded-pill bg-bg/60 px-1.5 py-0.5 font-body text-2xs font-bold uppercase tracking-wider text-on-accent">
      <span className="h-1 w-1 rounded-pill bg-on-accent" />
      live
    </span>
  </>
);

export const Default: Story = {
  render: () => (
    <Section
      title="FeedItem"
      note="アバター + 種別アイコン付きヘッダ行 + 本文 + 添付スロット。timeLabel / message は整形済みの文字列を受け取る。"
    >
      <Feed>
        <FeedItem
          avatar={actor}
          kindIcon="login"
          name="Hiroki Saito"
          timeLabel="2日前"
          message="スペースに参加しました"
          attachment={
            <FeedItemAttachment
              thumbnail={spaceThumb}
              title="HipHopヘッズ"
              subtitle="0人が参加中"
              action={
                <Button type="button" variant="accent" size="xs">
                  参加
                </Button>
              }
            />
          }
        />
      </Feed>
    </Section>
  ),
};

export const WithoutAttachment: Story = {
  render: () => (
    <Section title="添付なし" note="attachment を省略すると本文までで終わる。">
      <Feed>
        <FeedItem
          avatar={actor}
          kindIcon="person_add"
          name="Hiroki Saito"
          timeLabel="5分前"
          message="あなたをフォローしました"
        />
      </Feed>
    </Section>
  ),
};

export const AttachmentWithoutAction: Story = {
  render: () => (
    <Section title="添付あり・アクションなし" note="action を省略すると右端のボタンが消える。">
      <Feed>
        <FeedItem
          avatar={actor}
          kindIcon="graphic_eq"
          name="Hiroki Saito"
          timeLabel="たった今"
          message="スペースを開始しました"
          attachment={
            <FeedItemAttachment
              thumbnail={liveThumb}
              title="深夜の作業通話"
              subtitle="3人が視聴中"
            />
          }
        />
      </Feed>
    </Section>
  ),
};

export const WithoutKindIcon: Story = {
  render: () => (
    <Section title="種別アイコンなし" note="kindIcon を省略するとヘッダ行が名前から始まる。">
      <Feed>
        <FeedItem
          avatar={actor}
          name="Hiroki Saito"
          timeLabel="1時間前"
          message="スペースに参加しました"
        />
      </Feed>
    </Section>
  ),
};

export const PillAttachment: Story = {
  render: () => (
    <Section
      title="ピル形の添付"
      note="attachment はスロットなので、ストリップ以外(Lozenge 等のピル)も差せる。"
    >
      <Feed>
        <FeedItem
          avatar={actor}
          kindIcon="star"
          name="Hiroki Saito"
          timeLabel="3日前"
          message="バッジを獲得しました"
          attachment={
            <Lozenge tone="warning">
              <Icon name="star" size={14} />
              はじめての配信
            </Lozenge>
          }
        />
      </Feed>
    </Section>
  ),
};

export const LongText: Story = {
  render: () => (
    <Section
      title="長いテキスト"
      note="名前は折り返す(誰の出来事かを省略しないため)。添付のタイトル / サブタイトルは1行で省略記号に切る。"
    >
      <Feed>
        <FeedItem
          avatar={<Avatar name="とてもながいなまえのユーザー" fallback="u_long" size={40} ring />}
          kindIcon="login"
          name="とてもながいなまえのユーザーさんがここにいます"
          timeLabel="2日前"
          message="スペースに参加しました"
          attachment={
            <FeedItemAttachment
              thumbnail={spaceThumb}
              title="とてもとても長いスペース名がここに入るときの折り返しと省略の確認用"
              subtitle="とてもとても長いサブテキストがここに入るときの折り返しと省略の確認用"
              action={
                <Button type="button" variant="accent" size="xs">
                  参加
                </Button>
              }
            />
          }
        />
      </Feed>
    </Section>
  ),
};
