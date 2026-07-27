import { type LinkPreviewMeta, MessageItem } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// MessageItem のカタログ。「誰かの投稿1件」を表す複合コンポーネント。InSession の space 内
// チャット発言にも、loophub のスレッド投稿/コメントにも使える汎用部品であることを示すため、
// チャット用途とスレッド投稿用途の両方のストーリーを置く。
const meta: Meta = {
  title: 'Patterns/MessageItem',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// 外部に依存しない data URI の画像(UserLabel ストーリーの AVATAR_SRC と同じ手段)。
const AVATAR_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%2312d8c9'/%3E%3C/svg%3E";

const ACTIONS = [
  { icon: 'push_pin' as const, label: 'ピン留め', onClick: () => {} },
  { icon: 'reply' as const, label: '返信', onClick: () => {} },
  { icon: 'add_reaction' as const, label: 'リアクション', onClick: () => {} },
];

export const Basic: Story = {
  render: () => (
    <Section title="基本" note="avatarSrc を省略するとアバター無しのコンパクト表示になる。">
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03">
          こんにちは
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithReactions: Story = {
  render: () => (
    <Section
      title="リアクション複数(reacted の有無が混在)"
      note="reacted: true のピルは枠線と背景で強調される。Chip の selected を showCheck={false} で使っているので、行頭に check は付かない(絵文字と並ぶと何に対する肯定か読めなくなるため)。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          reactions={[
            { emoji: '🙂', count: 1, reacted: true, label: 'にっこり', onClick: () => {} },
            { emoji: '🎉', count: 3, reacted: false, label: 'お祝い', onClick: () => {} },
            { emoji: '👍', count: 2, reacted: false, label: 'いいね', onClick: () => {} },
          ]}
        >
          リリースできました
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Section
      title="アクション群のホバー表示"
      note="既定は opacity-0 で隠れており、ホバーまたはキーボードフォーカス(group-focus-within)で表示される。実際に触って確認する。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" actions={ACTIONS}>
          ホバーすると右上にアクションが出る
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <Section title="アバター有り" note="avatarSrc を渡すとアバター付きレイアウトになる。">
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
          アバター付きの投稿
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithoutAvatar: Story = {
  render: () => (
    <Section
      title="アバター無し"
      note="avatarSrc を省略すると UserLabel の hideAvatar が効き、コンパクト表示になる。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03">
          アバター無しの投稿
        </MessageItem>
      </div>
    </Section>
  ),
};

export const LongTextWithLineBreaks: Story = {
  render: () => (
    <Section title="長文・改行" note="改行を保持しつつ、コンテナ幅で折り返す。">
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
          {
            'これはとても長い投稿本文の確認用テキストです。折り返しと改行の両方が意図どおりに表示されるかを確認します。\n2行目です。\n3行目もあります。'
          }
        </MessageItem>
      </div>
    </Section>
  ),
};

export const ChatUsage: Story = {
  render: () => (
    <Section
      title="チャット用途"
      note="space 内チャットのような、連投が多く短い発言の並び。アバター無しのコンパクト表示 + タイムスタンプ + リアクション + ホバーアクションを組み合わせる。"
    >
      <div className="flex max-w-xl flex-col gap-3 rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:02"
          actions={ACTIONS}
          reactions={[
            { emoji: '🙂', count: 1, reacted: true, label: 'にっこり', onClick: () => {} },
          ]}
        >
          もうすぐ配信始めます
        </MessageItem>
        <MessageItem authorName="川村静哉" timestamp="01:03" actions={ACTIONS}>
          お待たせしました、始めます!
        </MessageItem>
      </div>
    </Section>
  ),
};

export const LongJapaneseTextWrapping: Story = {
  render: () => (
    <Section
      title="長文日本語の折り返し(#97)"
      note="本文が親幅いっぱいまで使って折り返すことを確認する。アバターあり/なしの両方。"
    >
      <div className="flex max-w-xl flex-col gap-3 rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
          今日のミーティングでは新しいデザインシステムのコンポーネント設計について話し合いました。特にメッセージ一覧のレイアウトが早く折り返してしまう問題があり、原因はヘッダー行のベースラインのずれとアクションバーの領域確保にあることがわかりました。
        </MessageItem>
        <MessageItem authorName="川村静哉" timestamp="01:03">
          今日のミーティングでは新しいデザインシステムのコンポーネント設計について話し合いました。特にメッセージ一覧のレイアウトが早く折り返してしまう問題があり、原因はヘッダー行のベースラインのずれとアクションバーの領域確保にあることがわかりました。
        </MessageItem>
      </div>
    </Section>
  ),
};

export const HeaderBaselineAlignment: Story = {
  render: () => (
    <Section
      title="名前と時刻のベースライン(#97)"
      note="アバターあり/なし × 名前が押せない/authorOnClick で押せる、の組み合わせ。いずれも名前と時刻のベースラインが揃うこと。"
    >
      <div className="flex max-w-xl flex-col gap-3 rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
          アバターあり・押せない名前
        </MessageItem>
        <MessageItem authorName="川村静哉" timestamp="01:03">
          アバターなし・押せない名前
        </MessageItem>
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          avatarSrc={AVATAR_SRC}
          authorOnClick={() => {}}
        >
          アバターあり・押せる名前(authorOnClick)
        </MessageItem>
        <MessageItem authorName="川村静哉" timestamp="01:03" authorOnClick={() => {}}>
          アバターなし・押せる名前(authorOnClick)
        </MessageItem>
      </div>
    </Section>
  ),
};

export const WithActionsSlot: Story = {
  render: () => (
    <Section
      title="actionsSlot(#97)"
      note="actions では表現できない Popover を伴うアクション(絵文字ピッカー等)向けの差し込み口。ヘッダー右側に actions の後ろに並ぶ。opacity 制御は当てないため常に表示される — 表示/非表示は消費側が持つ想定(実際の消費側では絵文字ピッカーの Popover トリガーをここに置く)。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          actions={ACTIONS}
          actionsSlot={
            <button
              type="button"
              className="rounded-md border border-solid border-border bg-transparent px-2 py-1 font-body text-text text-xs"
              onClick={() => {}}
            >
              😀 Popover
            </button>
          }
        >
          actions の後ろに任意のノード(ここでは Popover トリガーを模したボタン)を置ける
        </MessageItem>
      </div>
    </Section>
  ),
};

export const InRowFlexParent: Story = {
  render: () => (
    <Section
      title="行方向 flex の親に置いたとき(#97)"
      note="消費側(insession-app)が MessageActionBar 等を兄弟として横に置く構成を再現。隣に shrink-0 の要素があっても MessageItem が残りの幅を取り切り、本文が広く使われること。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <div className="flex items-start gap-2">
          <MessageItem authorName="川村静哉" timestamp="01:03" avatarSrc={AVATAR_SRC}>
            隣に固定幅の兄弟要素があっても、本文はコンテナの残り幅いっぱいまで使って折り返す。ここが以前は狭くなって早く折り返していた。
          </MessageItem>
          <div className="shrink-0 rounded-md border border-dashed border-border-strong px-3 py-2 font-body text-text-dim text-xs">
            兄弟要素
            <br />
            (shrink-0)
          </div>
        </div>
      </div>
    </Section>
  ),
};

export const ThreadPostUsage: Story = {
  render: () => (
    <Section
      title="スレッド投稿用途"
      note="loophub のようなコミュニティのスレッド投稿/コメント。アバター付き + authorHref で投稿者プロフィールへ遷移できる。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-4">
        <MessageItem
          authorName="川村静哉"
          authorHref="/u/kawamura"
          timestamp="2日前"
          avatarSrc={AVATAR_SRC}
          actions={[
            { icon: 'reply', label: '返信', onClick: () => {} },
            { icon: 'add_reaction', label: 'リアクション', onClick: () => {} },
          ]}
          reactions={[
            { emoji: '👍', count: 4, reacted: false, label: 'いいね', onClick: () => {} },
          ]}
        >
          この機能、待ってました！次のリリースが楽しみです。
        </MessageItem>
      </div>
    </Section>
  ),
};

// ── OGP リンクプレビュー(#93) ─────────────────────────────
// fetchLinkPreview は消費側(insession-app / loophub-app)が実装する差し込み口なので、
// Storybook 上ではモック fetcher を渡して「即解決 / 遅延して解決 / 失敗」の3パターンを
// 確認できるようにする。実際の HTTP 取得は行わない(DS は network を持たない)。
const OG_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='382' height='200'%3E%3Crect width='382' height='200' fill='%2312d8c9'/%3E%3C/svg%3E";

const MOCK_META: LinkPreviewMeta = {
  url: 'https://insession.space/blog/release-notes',
  title: 'InSession リリースノート',
  description: '最新のアップデート内容をまとめて紹介します。',
  siteName: 'InSession Blog',
  imageUrl: OG_IMAGE_SRC,
};

// 即座に解決する fetcher。
async function fetchLinkPreviewResolved(): Promise<LinkPreviewMeta | null> {
  return MOCK_META;
}

// 1.5秒後に解決する fetcher。abort されたら reject して in-flight を確実に止める
// (signal を無視すると unmount 後の setState 警告や不要な再取得につながる)。
function fetchLinkPreviewDelayed(
  _url: string,
  signal: AbortSignal,
): Promise<LinkPreviewMeta | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(MOCK_META), 1500);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}

// null を返す(取得はできたがメタデータが無い)失敗パターン。
async function fetchLinkPreviewNull(): Promise<LinkPreviewMeta | null> {
  return null;
}

// reject する(取得自体が失敗する)失敗パターン。
async function fetchLinkPreviewRejected(): Promise<LinkPreviewMeta | null> {
  throw new Error('failed to fetch OGP metadata');
}

export const LinkPreviewResolved: Story = {
  render: () => (
    <Section
      title="OGP プレビュー: 即解決"
      note="fetchLinkPreview がすぐにメタデータを返すケース。本文の下・リアクション行の上にカードが並ぶ。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          fetchLinkPreview={fetchLinkPreviewResolved}
          reactions={[{ emoji: '👍', count: 2, label: 'いいね', onClick: () => {} }]}
        >
          この記事オススメです https://insession.space/blog/release-notes 見てみて
        </MessageItem>
      </div>
    </Section>
  ),
};

export const LinkPreviewDelayed: Story = {
  render: () => (
    <Section
      title="OGP プレビュー: 遅延解決"
      note="取得に1.5秒かかるケース。その間 LinkPreview は loading(Skeleton)を表示する。Storybook を素早く切り替えても unmount 後の setState 警告が出ないことを確認する(abort されるため)。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          fetchLinkPreview={fetchLinkPreviewDelayed}
        >
          読み込み中の見た目を確認 https://insession.space/blog/release-notes
        </MessageItem>
      </div>
    </Section>
  ),
};

export const LinkPreviewFailedNull: Story = {
  render: () => (
    <Section
      title="OGP プレビュー: 失敗(null)"
      note="fetchLinkPreview が null を返すケース。カードもエラー UI も出ず、本文だけが残る。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          fetchLinkPreview={fetchLinkPreviewNull}
        >
          メタデータが無いリンク https://example.com/no-metadata
        </MessageItem>
      </div>
    </Section>
  ),
};

export const LinkPreviewFailedReject: Story = {
  render: () => (
    <Section
      title="OGP プレビュー: 失敗(reject)"
      note="fetchLinkPreview が reject するケース。こちらもカード・エラー UI とも出さず、黙って本文だけが残る。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          fetchLinkPreview={fetchLinkPreviewRejected}
        >
          取得に失敗するリンク https://example.com/will-fail
        </MessageItem>
      </div>
    </Section>
  ),
};

// URL ごとに別のメタデータを返す fetcher。previewUrls / maxLinkPreviews の確認用。
const MOCK_META_BY_URL: Record<string, LinkPreviewMeta> = {
  'https://insession.space/blog/release-notes': MOCK_META,
  'https://insession.space/help': {
    url: 'https://insession.space/help',
    title: 'ヘルプセンター',
    description: 'よくある質問と使い方ガイド。',
    siteName: 'InSession Help',
  },
};

async function fetchLinkPreviewByUrl(url: string): Promise<LinkPreviewMeta | null> {
  return MOCK_META_BY_URL[url] ?? null;
}

export const LinkPreviewFromPreviewUrls: Story = {
  render: () => (
    <Section
      title="OGP プレビュー: previewUrls で明示 + maxLinkPreviews=2"
      note="children が JSX(文字列でない ReactNode)のケース。DS は本文から URL を機械的に検出できないため、呼び出し側が previewUrls で対象 URL を明示する。maxLinkPreviews を 2 にすると2件並ぶ(既定は 1 件)。"
    >
      <div className="max-w-xl rounded-card border border-solid border-border bg-surface p-3">
        <MessageItem
          authorName="川村静哉"
          timestamp="01:03"
          fetchLinkPreview={fetchLinkPreviewByUrl}
          previewUrls={[
            'https://insession.space/blog/release-notes',
            'https://insession.space/help',
          ]}
          maxLinkPreviews={2}
        >
          <span>
            本文は JSX なので自動検出できない。
            <strong>previewUrls</strong> で渡した2件が並ぶ。
          </span>
        </MessageItem>
      </div>
    </Section>
  ),
};
