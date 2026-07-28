import { BottomSheet, Button, Input } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// モバイル向け Bottom Sheet(#284)。Modal と同じ backdrop + Esc/背景クリックで閉じるだが、
// 下からせり出す + ドラッグハンドルで高さを変えられる点が異なる。開いた直後は中途高さ(mid)、
// 上ドラッグでフルハイト(full)まで拡張、下ドラッグで一定以下まで縮めると close する。
const meta: Meta = {
  title: 'Overlays/BottomSheet',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function BottomSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>シートを開く</Button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        closeLabel="閉じる"
        ariaLabel="参加者"
      >
        <h3 className="font-body text-lg font-bold text-text mb-3">参加者</h3>
        <p className="text-base text-text-dim leading-normal">
          上部のハンドルをドラッグすると中途高さ⇄フルハイトを切り替えられる。下に大きくドラッグすると閉じる。
        </p>
      </BottomSheet>
    </>
  );
}

// 下端固定の入力欄を持つシート。defaultSnapPoint='full' を渡さないと、mid では Popup の
// 下端 26dvh 分がビューポート外に落ちて入力欄に触れない(props のコメント参照)。
function BottomSheetComposerDemo({ defaultSnapPoint }: { defaultSnapPoint?: 'mid' | 'full' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {defaultSnapPoint === 'full' ? 'full で開く' : 'mid(既定) で開く'}
      </Button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        closeLabel="閉じる"
        ariaLabel="チャット"
        defaultSnapPoint={defaultSnapPoint}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
          <p className="text-base text-text-dim leading-normal">
            上から順に読む中身。ここは mid でも見えている。
          </p>
        </div>
        <div className="shrink-0 border-0 border-t border-solid border-border p-4">
          <Input label="メッセージ" placeholder="下端に固定された入力欄" />
        </div>
      </BottomSheet>
    </>
  );
}

export const Toggle: Story = {
  render: () => (
    <Section
      title="開閉トグル"
      note="ボタンで open state をトグルする。閉じるたびに次回は既定の高さ(mid)から始まる。"
    >
      <BottomSheetDemo />
    </Section>
  ),
};

export const DefaultSnapPoint: Story = {
  render: () => (
    <Section
      title="開いた直後の高さ (defaultSnapPoint)"
      note="下端に固定された操作要素があるシートは 'full' で開く。'mid' だと Popup の下端 26dvh がビューポート外に落ちて、一度上へスワイプするまで入力欄に触れない。"
    >
      <div className="flex flex-wrap gap-2">
        <BottomSheetComposerDemo />
        <BottomSheetComposerDemo defaultSnapPoint="full" />
      </div>
    </Section>
  ),
};
