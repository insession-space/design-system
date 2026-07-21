import { BottomSheet, Button } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// モバイル向け Bottom Sheet(#284)。Modal と同じ backdrop + Esc/背景クリックで閉じるだが、
// 下からせり出す + ドラッグハンドルで高さを変えられる点が異なる。開いた直後は中途高さ(mid)、
// 上ドラッグでフルハイト(full)まで拡張、下ドラッグで一定以下まで縮めると close する。
const meta: Meta = {
  title: 'Components/BottomSheet',
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
        <h3 className="font-display text-lg font-bold text-text mb-3">参加者</h3>
        <p className="text-smd text-text-dim leading-normal">
          上部のハンドルをドラッグすると中途高さ⇄フルハイトを切り替えられる。下に大きくドラッグすると閉じる。
        </p>
      </BottomSheet>
    </>
  );
}

export const Toggle: Story = {
  render: () => (
    <Section
      title="開閉トグル"
      note="ボタンで open state をトグルする。閉じるたびに次回は中途高さ(mid)から始まる。"
    >
      <BottomSheetDemo />
    </Section>
  ),
};
