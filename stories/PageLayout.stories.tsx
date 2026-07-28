import {
  AppBar,
  Button,
  Card,
  Footer,
  HStack,
  PageHeader,
  PageLayout,
} from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';

// PageLayout のカタログ。layout.tsx/surface.tsx の組み合わせでできているため単体では
// 見た目が地味になりがちなので、「1画面まるごと」を組んで、ライト/ダーク両テーマで
// 崩れないかを確認できるようにする。
const meta: Meta = {
  title: 'Page/PageLayout',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

// scroll="body"(アプリシェル型)の骨格。外枠が h-dvh で画面高さに固定され、AppBar / Footer は
// 動かず本文だけがスクロールする。既定の scroll="page" はページ全体が伸びてブラウザがスクロールする
// (LP / ドキュメント型)ので、AppBar を画面に残したい場合は AppBar 側の sticky が担う。
export const Default: Story = {
  render: () => (
    <PageLayout
      scroll="body"
      appBar={
        <AppBar
          left={<span className="text-base font-semibold text-text">InSession</span>}
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
            <span key={label} className="rounded-md px-3 py-2 text-base text-text-dim">
              {label}
            </span>
          ))}
        </nav>
      }
      footer={
        <Footer padding="md">
          <p className="text-xs text-text-faint">© InSession Space</p>
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
            <p className="text-base text-text">
              scroll="body" では外枠が h-dvh、本文が min-h-0 + overflow-y-auto になる。
            </p>
          </Card>
          <Card padding="lg">
            <p className="text-base text-text">
              AppBar/Footer は画面に固定されたまま本文だけがスクロールする。
            </p>
          </Card>
        </div>
      </div>
    </PageLayout>
  ),
};
