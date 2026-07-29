import { Button, Drawer } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 画面端からスライドインする Drawer(#155)。Modal と同じ backdrop + Esc/背景クリックで閉じるだが、
// 中央ではなく左右いずれかの端に高さいっぱいの板として出る。下から出したいときは BottomSheet。
const meta: Meta = {
  title: 'Overlays/Drawer',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function DrawerDemo({
  side,
  width,
  children,
  label,
}: {
  side?: 'left' | 'right';
  width?: string;
  children: React.ReactNode;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        width={width}
        ariaLabel={label}
      >
        {children}
      </Drawer>
    </>
  );
}

function NavBody() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="font-body text-lg font-bold text-text">ナビゲーション</h3>
      <p className="text-base text-text-dim leading-normal">
        中身は消費側が丸ごと差し込む。Drawer 自身は面・影・スライドと、backdrop / Esc /
        フォーカストラップ / スクロールロックだけを持つ。
      </p>
    </div>
  );
}

export const Sides: Story = {
  render: () => (
    <Section
      title="出る辺 (side)"
      note="既定は 'left'。背景クリックか Esc で閉じる。上下は扱わない — 下から出すのは BottomSheet の役目。"
    >
      <div className="flex flex-wrap gap-2">
        <DrawerDemo label="左から開く（既定）">
          <NavBody />
        </DrawerDemo>
        <DrawerDemo side="right" label="右から開く">
          <NavBody />
        </DrawerDemo>
      </div>
    </Section>
  ),
};

export const Width: Story = {
  render: () => (
    <Section
      title="幅 (width)"
      note="既定は min(320px, 86vw)。中身が自分で幅を持つ場合（DS の SideNav は 232px 固定）は 'auto' を渡す — 既定のままだと中身より板が広く、余った面が残る。"
    >
      <div className="flex flex-wrap gap-2">
        <DrawerDemo label="既定幅">
          <NavBody />
        </DrawerDemo>
        <DrawerDemo width="auto" label="width='auto'（中身に合わせる）">
          <div className="flex w-[232px] flex-col gap-2 p-4">
            <h3 className="font-body text-lg font-bold text-text">232px の中身</h3>
            <p className="text-base text-text-dim leading-normal">板が中身の幅に張り付く。</p>
          </div>
        </DrawerDemo>
      </div>
    </Section>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Section
      title="長いコンテンツ"
      note="Drawer 自身は overflow を持たない（中に固定ヘッダーを置きたい消費側が困るため）。スクロールは中身側で overflow-y-auto を張る。"
    >
      <DrawerDemo label="長い中身で開く">
        <div className="shrink-0 border-0 border-b border-solid border-border p-4">
          <h3 className="font-body text-lg font-bold text-text">固定ヘッダー</h3>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {Array.from({ length: 40 }, (_, i) => (
            <p key={`row-${i + 1}`} className="text-base text-text-dim leading-normal">
              行 {i + 1}
            </p>
          ))}
        </div>
      </DrawerDemo>
    </Section>
  ),
};
