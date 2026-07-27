import { Button, Icon, Input, Modal } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 汎用モーダルの外殻。Base UI Dialog に委譲した compound API(#6)。
// Modal.Popup に variant='ds' を渡し、Modal.Title / Modal.Body / Modal.Footer を並べる DS 構造で
// 使う(border-bottom の見出し行 + body + surface-2 の footer 行)。
//
// ⚠ variant を渡さない既定は legacy の .modal / .modal-close をそのまま使う後方互換の経路で、
// 中身に raw な <button> / <input> を置くことを前提にしている（塗りはホストアプリの
// グローバル `button {}` 頼み。components.css の .modal button[type="submit"] の注記を参照）。
// 新規の実装では使わないため、カタログにも載せない。
const meta: Meta = {
  title: 'Overlays/Modal',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

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
              <Input name="space-name" type="text" placeholder="スペース名" />
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
      <Button variant="ghost" className="ml-2">
        モーダル外の focusable な要素
      </Button>
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
              <div className="flex flex-col gap-2">
                <Input type="text" placeholder="1つ目のフィールド" />
                <Input type="text" placeholder="2つ目のフィールド" />
              </div>
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
