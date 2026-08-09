import { Button, SearchField, SplitModal, type SplitModalItem } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 設定系モーダルの2ペイン外殻(#842)。左レール(ナビ) + 右ペイン(選択中セクションの中身)。
// #860 で設定モーダルがこれに準拠した現役プリミティブなので、実際の使われ方に近いデモにする
// (項目を選ぶと右ペインの内容が切り替わる実動デモ)。
const meta: Meta = {
  title: 'Overlays/SplitModal',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const ITEMS: SplitModalItem[] = [
  { id: 'watch-party', label: 'Watch Party', icon: 'movie' },
  { id: 'pomodoro', label: 'Pomodoro', icon: 'timer' },
  { id: 'tetris', label: 'Tetris', icon: 'sports_esports' },
];

const PANE_CONTENT: Record<string, { title: string; description: string }> = {
  'watch-party': {
    title: 'Watch Party',
    description: 'YouTube 動画をスペース全員で同期視聴する。',
  },
  pomodoro: { title: 'Pomodoro', description: 'ポモドーロタイマーをスペースで共有する。' },
  tetris: { title: 'Tetris', description: '並走プレイ + スペース内ランキング。' },
};

function SplitModalDemo({ openLabel, asSheet }: { openLabel: string; asSheet?: boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('watch-party');
  const current = PANE_CONTENT[value];
  return (
    <>
      <Button onClick={() => setOpen(true)}>{openLabel}</Button>
      {open && (
        <SplitModal
          items={ITEMS}
          value={value}
          onSelect={setValue}
          onClose={() => setOpen(false)}
          navLabel="プラグイン設定ナビ"
          navTitle="プラグイン"
          closeLabel="閉じる"
          backLabel="戻る"
          ariaLabel="プラグイン設定"
          title={current.title}
          description={current.description}
          asSheet={asSheet}
        >
          <div className="flex items-center justify-between rounded-card border border-solid border-border bg-tint-5 px-4 py-3">
            <span className="text-base font-semibold text-text">有効にする</span>
            <span className="rounded-pill bg-tint-8 border border-solid border-border px-3 py-1 text-sm text-accent-soft">
              ON
            </span>
          </div>
        </SplitModal>
      )}
    </>
  );
}

export const Interactive: Story = {
  render: () => (
    <Section
      title="実動デモ"
      note="左レールの項目クリックで右ペインが切り替わる。広い画面はレール+コンテンツの横並び、狭い画面はドリルダウン(一覧→タップで詳細)に自動で切り替わる。"
    >
      <SplitModalDemo openLabel="設定を開く" />
    </Section>
  ),
};

// #1870: 設定項目が増えたアプリ向けに、ナビをグループ見出しで束ね、上部に絞り込みの
// スロット(navHeader)を置けるようにした。group を渡さない上の Interactive story が
// 従来どおりフラットに描かれることと見比べるためのデモ。
const GROUPED_ITEMS: SplitModalItem[] = [
  { id: 'profile', label: 'プロフィール', icon: 'account_circle', group: 'あなた' },
  { id: 'account', label: 'アカウント', icon: 'lock', group: 'あなた' },
  { id: 'display', label: '表示', icon: 'tune', group: 'アプリ' },
  { id: 'sound', label: 'サウンド', icon: 'volume_up', group: 'アプリ' },
  { id: 'notifications', label: '通知', icon: 'notifications', group: 'アプリ' },
  { id: 'stickers', label: 'スタンプ', icon: 'sticker', group: 'コンテンツ' },
  { id: 'integrations', label: '連携', icon: 'extension', group: 'コンテンツ' },
];

function GroupedNavDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('display');
  const [query, setQuery] = useState('');
  // 絞り込みはグループ構造を保ったまま項目だけ落とす（group はそのまま残るので、
  // 残った項目の見出しだけが出る）。
  const filtered = query ? GROUPED_ITEMS.filter((it) => it.label.includes(query)) : GROUPED_ITEMS;
  const current = GROUPED_ITEMS.find((it) => it.id === value);
  return (
    <>
      <Button onClick={() => setOpen(true)}>グループ付きで開く</Button>
      {open && (
        <SplitModal
          items={filtered}
          value={value}
          onSelect={setValue}
          onClose={() => setOpen(false)}
          navLabel="設定ナビ"
          navTitle="ユーザー設定"
          navHeader={
            <SearchField
              placeholder="設定を検索"
              aria-label="設定を検索"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
          }
          closeLabel="閉じる"
          backLabel="戻る"
          ariaLabel="ユーザー設定"
          title={current?.label}
          description="グループ見出しで束ねたナビと、上部の絞り込みスロット。"
        >
          <div className="flex items-center justify-between rounded-card border border-solid border-border bg-tint-5 px-4 py-3">
            <span className="text-base font-semibold text-text">この設定を有効にする</span>
            <span className="rounded-pill bg-tint-8 border border-solid border-border px-3 py-1 text-sm text-accent-soft">
              ON
            </span>
          </div>
        </SplitModal>
      )}
    </>
  );
}

export const GroupedNav: Story = {
  render: () => (
    <Section
      title="グループ見出し + 絞り込みスロット(#1870)"
      note="items に group を渡すと、連続する同じ group が1つの束になり先頭に見出しが出る(role=group で見出しと結び付く)。navHeader は navTitle の下・項目一覧の上に固定されるので、一覧をスクロールしても検索欄は残る。group を渡さない呼び出しは従来どおりフラットな一列のまま。"
    >
      <GroupedNavDemo />
    </Section>
  ),
};

export const AsBottomSheet: Story = {
  render: () => (
    <Section
      title="BottomSheet 外殻(asSheet)"
      note="asSheet を渡すとモバイルのスペース固有機能向けに外殻を BottomSheet にできる(#581 6b)。"
    >
      <SplitModalDemo openLabel="シート形式で開く" asSheet />
    </Section>
  ),
};
