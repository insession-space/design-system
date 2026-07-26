import {
  AppBar,
  Button,
  Card,
  Footer,
  HStack,
  PageHeader,
  PageLayout,
  Toolbar,
} from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// 画面骨格プリミティブ(AppBar/Toolbar/PageHeader/PageLayout/Footer)のカタログ。
// layout.tsx/surface.tsx の組み合わせでできているため単体では見た目が地味になりがちなので、
// PageLayoutDemo で「1画面まるごと」を組んで、ライト/ダーク両テーマで崩れないかを確認できるようにする。
const meta: Meta = {
  title: 'Components/Page',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const AppBarDemo: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Section title="AppBar" note="left/center/right の3スロット。center だけが伸びる。">
      <AppBar
        left={<span className="text-md font-semibold text-text">InSession</span>}
        center={<Toolbar align="center">{/* 検索欄などを想定 */}</Toolbar>}
        right={<Button size="sm">ログイン</Button>}
        sticky={false}
      />
    </Section>
  ),
};

export const ToolbarDemo: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Section
      title="Toolbar"
      note="AppBar の外でも使える独立部品。role=&quot;toolbar&quot; を持つ。"
    >
      <Toolbar align="center" className="rounded-md border border-dashed border-border-strong p-3">
        <Button size="sm" variant="ghost">
          太字
        </Button>
        <Button size="sm" variant="ghost">
          斜体
        </Button>
        <Button size="sm" variant="ghost">
          下線
        </Button>
      </Toolbar>
    </Section>
  ),
};

export const PageHeaderDemo: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Section title="PageHeader" note="title は必須。description/actions は任意。">
      <PageHeader
        title="ワークスペース設定"
        description="メンバー・権限・請求情報をここから管理します。"
        actions={<Button size="sm">新規メンバーを招待</Button>}
      />
    </Section>
  ),
};

export const PageLayoutDemo: Story = {
  render: () => (
    <PageLayout
      appBar={
        <AppBar
          left={<span className="text-md font-semibold text-text">InSession</span>}
          right={
            <HStack gap="sm" align="center">
              <Button size="sm" variant="ghost">
                ヘルプ
              </Button>
              <Button size="sm">ログイン</Button>
            </HStack>
          }
        />
      }
      sidebar={
        <nav className="flex h-full w-56 flex-col gap-1 border-r border-solid border-border bg-bg-elevated p-3">
          {['ホーム', 'スペース', '通知', '設定'].map((label) => (
            <span key={label} className="rounded-md px-3 py-2 text-smd text-text-dim">
              {label}
            </span>
          ))}
        </nav>
      }
      footer={
        <Footer padding="md">
          <p className="text-2xs text-text-faint">© InSession Space</p>
        </Footer>
      }
    >
      <div className="p-6">
        <PageHeader
          title="ワークスペース設定"
          description="メンバー・権限・請求情報をここから管理します。"
          actions={<Button size="sm">新規メンバーを招待</Button>}
        />
        <div className="mt-6 flex flex-col gap-4">
          <Card padding="lg">
            <p className="text-smd text-text">本文領域は min-h-0 + overflow-y-auto。</p>
          </Card>
          <Card padding="lg">
            <p className="text-smd text-text">
              AppBar/Footer は画面に固定されたまま本文だけがスクロールする。
            </p>
          </Card>
        </div>
      </div>
    </PageLayout>
  ),
};
