import { Button, Icon, Modal } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 汎用モーダルの外殻。Base UI Dialog に委譲した compound API(#6)。2つの体裁を持つ:
// title/footer 相当のパートを使わない既定(legacy .modal 経路)と、Modal.Title/Body/Footer を
// 並べる DS 構造(variant='ds'。border-bottom の見出し行 + body + surface-2 の footer 行)。
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
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup aria-label="スペースを作成">
            <Modal.Close aria-label="閉じる" title="閉じる" />
            <h2>スペースを作成</h2>
            <input type="text" placeholder="スペース名" />
            <button type="submit">作成する</button>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>
    </>
  );
}

function DsDemo({ width }: { width?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>DS モーダルを開く</Button>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup variant="ds" aria-label="通知設定" style={width ? { width } : undefined}>
            <div className="flex items-center justify-between gap-3 border-b border-solid border-border px-[18px] py-4">
              <Modal.Title>通知設定</Modal.Title>
              <Modal.Close variant="ds" aria-label="閉じる" title="閉じる">
                <Icon name="close" size={19} />
              </Modal.Close>
            </div>
            <Modal.Body>
              <p className="m-0 text-smd leading-normal text-text-dim">
                Modal.Title / Modal.Body / Modal.Footer を並べると DS 構造(border-bottom の見出し行
                + body + surface-2 の footer 行)で描画される。
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                保存
              </Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>
    </>
  );
}

// フォーム型モーダル。Modal.Popup の render prop で <form> として描画し、送信を検知する(#6)。
function FormDemo() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState('');
  return (
    <>
      <Button onClick={() => setOpen(true)}>フォームモーダルを開く</Button>
      {submitted && <p className="mt-2 text-smd text-text-dim">送信内容: {submitted}</p>}
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup
            variant="ds"
            aria-label="スペースを作成"
            render={
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = new FormData(e.currentTarget).get('space-name');
                  setSubmitted(String(name ?? ''));
                  setOpen(false);
                }}
              />
            }
          >
            <div className="flex items-center justify-between gap-3 border-b border-solid border-border px-[18px] py-4">
              <Modal.Title>スペースを作成</Modal.Title>
              <Modal.Close variant="ds" aria-label="閉じる" title="閉じる">
                <Icon name="close" size={19} />
              </Modal.Close>
            </div>
            <Modal.Body>
              <input
                name="space-name"
                type="text"
                placeholder="スペース名"
                className="w-full rounded-md border border-solid border-border bg-surface px-3 py-2 text-text"
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button variant="primary" type="submit">
                作成する
              </Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>
    </>
  );
}

// フォーカストラップ / スクロールロックの確認用。モーダル外に focusable なボタンを置き、モーダル内は
// Tab で循環すること(トラップ)・背後のページが長いスクロールコンテンツを持つがモーダル表示中は
// スクロールできないこと(ロック)を目視できるようにする(#6)。
function FocusTrapDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>フォーカストラップを確認</Button>
      <button type="button" className="ml-2 underline">
        モーダル外の focusable な要素
      </button>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Popup variant="ds" aria-label="フォーカストラップ確認">
            <div className="flex items-center justify-between gap-3 border-b border-solid border-border px-[18px] py-4">
              <Modal.Title>フォーカストラップ確認</Modal.Title>
              <Modal.Close variant="ds" aria-label="閉じる" title="閉じる">
                <Icon name="close" size={19} />
              </Modal.Close>
            </div>
            <Modal.Body>
              <p className="m-0 mb-3 text-smd leading-normal text-text-dim">
                Tab キーでフォーカスがモーダル内を循環すること(外の「モーダル外の focusable
                な要素」に 抜けないこと)を確認する。
              </p>
              <input
                type="text"
                placeholder="1つ目のフィールド"
                className="mb-2 w-full rounded-md border border-solid border-border bg-surface px-3 py-2 text-text"
              />
              <input
                type="text"
                placeholder="2つ目のフィールド"
                className="w-full rounded-md border border-solid border-border bg-surface px-3 py-2 text-text"
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={() => setOpen(false)}>
                閉じる
              </Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Portal>
      </Modal.Root>
      {/* 背後の長いスクロールコンテンツ。モーダル表示中はページ側がスクロールロックされることを確認する。 */}
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 40 }, (_, i) => `dummy-row-${i + 1}`).map((rowKey, i) => (
          <p key={rowKey} className="m-0 text-smd text-text-dim">
            背景のスクロール確認用ダミー行 {i + 1}
          </p>
        ))}
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Section
      title="既定(legacy 経路)"
      note="Modal.Title/Body/Footer を使わないと legacy の .modal / .modal-close をそのまま使う従来経路。"
    >
      <DefaultDemo />
    </Section>
  ),
};

export const DsStructure: Story = {
  render: () => (
    <Section
      title="DS 構造(variant='ds')"
      note="Modal.Popup に variant='ds' を渡し、Modal.Title / Modal.Body / Modal.Footer を並べると claude design 準拠の見出し行 + body + footer 行になる。"
    >
      <DsDemo />
    </Section>
  ),
};

export const CustomWidth: Story = {
  render: () => (
    <Section
      title="幅の指定"
      note="Modal.Popup の style={{ width }} で基底幅(既定 min(420px, 92vw))を上書きできる。設定モーダル等の広いモーダルで使う値の例。"
    >
      <DsDemo width="min(760px, 94vw)" />
    </Section>
  ),
};

export const FormModal: Story = {
  render: () => (
    <Section
      title="フォーム型モーダル"
      note="Modal.Popup の render={<form onSubmit={...} />} でフォームとして描画できる。"
    >
      <FormDemo />
    </Section>
  ),
};

export const FocusTrapAndScrollLock: Story = {
  render: () => (
    <Section
      title="フォーカストラップ / スクロールロック"
      note="Base UI Dialog への委譲で獲得した挙動。開いている間は Tab がモーダル内で循環し、背景はスクロールしない。"
    >
      <FocusTrapDemo />
    </Section>
  ),
};
