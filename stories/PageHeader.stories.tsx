import { Button, PageHeader } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// PageHeader のカタログ。title は必須。description/actions は任意。
const meta: Meta = {
  title: 'Page/PageHeader',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
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
