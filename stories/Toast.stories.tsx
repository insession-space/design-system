import { Icon, Toast } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// トースト / スナックバー。既存 snackbar の見た目を踏襲。tone でアクセント色を切替。
// カタログでは fixed を無効化して並べる(実運用は画面下部中央に固定表示)。
const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Tones: Story = {
  render: () => (
    <Section
      title="トーン"
      note="success / info / error。アイコンは props 注入(このパッケージの Icon)。"
    >
      <div className="flex flex-col items-start gap-4">
        <Toast fixed={false} tone="success" icon={<Icon name="check_circle" size={16} />}>
          招待リンクをコピーしました
        </Toast>
        <Toast fixed={false} tone="info" icon={<Icon name="link" size={16} />}>
          同期しました
        </Toast>
        <Toast fixed={false} tone="error" role="alert" icon={<Icon name="warning" size={16} />}>
          追加できませんでした
        </Toast>
      </div>
    </Section>
  ),
};

export const Snackbar: Story = {
  render: () => (
    <Section
      title="snackbar バリアント"
      note="feature の操作フィードバック(旧 .snackbar)互換パレット。success=border-strong+mint、error=soft pink。"
    >
      <div className="flex flex-col items-start gap-4">
        <Toast
          fixed={false}
          variant="snackbar"
          tone="success"
          icon={<Icon name="check_circle" size={16} />}
        >
          キューに追加しました
        </Toast>
        <Toast
          fixed={false}
          variant="snackbar"
          tone="error"
          role="alert"
          icon={<Icon name="warning" size={16} />}
        >
          追加できませんでした
        </Toast>
      </div>
    </Section>
  ),
};
