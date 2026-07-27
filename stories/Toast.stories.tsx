import { Button, Icon, Toast } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// トースト / スナックバー。3.0 で Base UI の Toast へ移行し、**キューに add して Viewport が
// 描画する**命令的 API になった（#23）。見た目部品として単体で置くことはできないので、
// カタログでも Provider + Viewport を張ってボタンから add する形で見せる。
const meta: Meta = {
  title: 'Feedback/Toast',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// 追加ボタン。useToast は Provider の中でしか呼べないので子コンポーネントに切り出す。
function AddButton({
  label,
  title,
  description,
  tone,
  variant,
  icon,
}: {
  label: string;
  title?: string;
  description: string;
  tone: 'success' | 'info' | 'error' | 'warn' | 'danger';
  variant?: 'default' | 'snackbar';
  icon: React.ReactNode;
}) {
  const toast = Toast.useToast();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast.add({
          title,
          description,
          // タイムアウトを長めにして、カタログで見た目を確認しやすくする。
          timeout: 8000,
          data: { tone, variant, icon },
        })
      }
    >
      {label}
    </Button>
  );
}

export const Tones: Story = {
  render: () => (
    <Toast.Provider>
      <Section
        title="トーン"
        note="success / info / error。ボタンを押すとキューに add され、画面下部中央の Viewport に積まれる。アイコンは data.icon で注入する（このパッケージの Icon）。"
      >
        <div className="flex flex-wrap gap-3">
          <AddButton
            label="success を出す"
            title="コピーしました"
            description="招待リンクをコピーしました"
            tone="success"
            icon={<Icon name="check_circle" size={16} />}
          />
          <AddButton
            label="info を出す"
            title="同期しました"
            description="最新の状態に更新されています"
            tone="info"
            icon={<Icon name="link" size={16} />}
          />
          <AddButton
            label="error を出す"
            title="追加できませんでした"
            description="時間をおいてもう一度お試しください"
            tone="error"
            icon={<Icon name="warning" size={16} />}
          />
        </div>
      </Section>
      <Toast.Viewport />
    </Toast.Provider>
  ),
};

export const Snackbar: Story = {
  render: () => (
    <Toast.Provider>
      <Section
        title="snackbar バリアント"
        note="feature の操作フィードバック(旧 .snackbar)互換パレット。success=border-strong+mint、error=soft pink。pill 形状で description だけを出す（title は使わない）。"
      >
        <div className="flex flex-wrap gap-3">
          <AddButton
            label="snackbar success"
            description="キューに追加しました"
            tone="success"
            variant="snackbar"
            icon={<Icon name="check_circle" size={16} />}
          />
          <AddButton
            label="snackbar error"
            description="追加できませんでした"
            tone="error"
            variant="snackbar"
            icon={<Icon name="warning" size={16} />}
          />
        </div>
      </Section>
      <Toast.Viewport />
    </Toast.Provider>
  ),
};

// 複数を重ねて出せることの回帰ネット（移行前は消費側が1つずつ state で持つしかなかった）。
export const Stacked: Story = {
  render: () => (
    <Toast.Provider>
      <Section
        title="重ね表示"
        note="キューが複数のトーストを保持し、Viewport に積まれる。移行前は自前の state で1つずつ出すしかなかった。"
      >
        <div className="flex flex-wrap gap-3">
          <AddButton
            label="続けて押すと積まれる"
            title="通知"
            description="キューに積まれます"
            tone="success"
            icon={<Icon name="check_circle" size={16} />}
          />
        </div>
      </Section>
      <Toast.Viewport />
    </Toast.Provider>
  ),
};
