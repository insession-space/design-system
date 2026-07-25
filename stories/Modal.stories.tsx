import { Button, Modal } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 汎用モーダルの外殻。2つの体裁を持つ(#663): title/footer を渡さない既定(legacy .modal 経路)と、
// title/footer を渡す DS 構造(border-bottom の見出し行 + body + surface-2 の footer 行)。
const meta: Meta = {
  title: 'Components/Modal',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function DefaultDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>モーダルを開く</Button>
      {open && (
        <Modal onClose={() => setOpen(false)} closeLabel="閉じる" ariaLabel="スペースを作成">
          <h2>スペースを作成</h2>
          <input type="text" placeholder="スペース名" />
          <button type="submit">作成する</button>
        </Modal>
      )}
    </>
  );
}

function DsDemo({ width }: { width?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>DS モーダルを開く</Button>
      {open && (
        <Modal
          onClose={() => setOpen(false)}
          closeLabel="閉じる"
          ariaLabel="通知設定"
          title="通知設定"
          width={width}
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                保存
              </Button>
            </>
          }
        >
          <p className="m-0 text-smd leading-normal text-text-dim">
            title / footer を渡すと DS 構造(border-bottom の見出し行 + body + surface-2 の footer
            行)で描画される。
          </p>
        </Modal>
      )}
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Section
      title="既定(legacy 経路)"
      note="title/footer を渡さないと legacy の .modal / .modal-close をそのまま使う従来経路。"
    >
      <DefaultDemo />
    </Section>
  ),
};

export const DsStructure: Story = {
  render: () => (
    <Section
      title="DS 構造(title / footer)"
      note="title と footer を渡すと claude design 準拠の見出し行 + body + footer 行になる。"
    >
      <DsDemo />
    </Section>
  ),
};

export const CustomWidth: Story = {
  render: () => (
    <Section
      title="幅の指定"
      note="width prop で基底幅(既定 min(420px, 92vw))を上書きできる。設定モーダル等の広いモーダルで使う値の例。"
    >
      <DsDemo width="min(760px, 94vw)" />
    </Section>
  ),
};
