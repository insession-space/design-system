import { Button, ConfirmModal } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// Modal を土台にした確認ダイアログ。confirmVariant で実行ボタンを primary/danger に。
const meta: Meta = {
  title: 'Overlays/ConfirmModal',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function ConfirmDemo({ variant }: { variant: 'primary' | 'danger' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {variant === 'danger' ? '削除する' : '割り込み再生'}
      </Button>
      {open && (
        <ConfirmModal
          title={variant === 'danger' ? '削除しますか？' : '割り込み再生しますか？'}
          confirmLabel={variant === 'danger' ? '削除' : '再生'}
          cancelLabel="キャンセル"
          confirmVariant={variant}
          loading={loading}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setOpen(false);
            }, 1200);
          }}
        >
          この操作は取り消せません。
          <br />
          本当に実行してよろしいですか？
        </ConfirmModal>
      )}
    </>
  );
}

export const Primary: Story = {
  render: () => (
    <Section title="確認(primary)" note="Modal + Button 土台。ボタンをクリックで開く。">
      <ConfirmDemo variant="primary" />
    </Section>
  ),
};

export const Danger: Story = {
  render: () => (
    <Section
      title="確認(danger)"
      note="破壊的操作。実行ボタンを危険色に。実行中はローディング表示。"
    >
      <ConfirmDemo variant="danger" />
    </Section>
  ),
};
