import { Button, SplitModal, type SplitModalItem } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 設定系モーダルの2ペイン外殻(#842)。左レール(ナビ) + 右ペイン(選択中セクションの中身)。
// #860 で設定モーダルがこれに準拠した現役プリミティブなので、実際の使われ方に近いデモにする
// (項目を選ぶと右ペインの内容が切り替わる実動デモ)。
const meta: Meta = {
  title: 'Components/SplitModal',
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
            <span className="text-smd font-semibold text-text">有効にする</span>
            <span className="rounded-pill bg-tint-8 border border-solid border-border px-3 py-1 text-sm text-mint-soft">
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
