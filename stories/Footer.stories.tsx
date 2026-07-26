import { Footer } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// Footer のカタログ。画面下端の領域。境界は上端(border-t)だけ。padding は
// SurfacePadding(layout.tsx の Gap と同じ語彙)で刻む。単体 story が無く
// PageLayoutDemo の中でしか使われていなかったので、padding の違いが分かる例を追加する。
const meta: Meta = {
  title: 'Page/Footer',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Section title="Footer" note="境界は上端(border-t)だけ。padding で内側の余白を切替。">
      <div className="flex max-w-md flex-col gap-4">
        <Footer padding="sm">
          <p className="text-2xs text-text-faint">padding=&quot;sm&quot;</p>
        </Footer>
        <Footer padding="md">
          <p className="text-2xs text-text-faint">padding=&quot;md&quot;(既定)</p>
        </Footer>
        <Footer padding="lg">
          <p className="text-2xs text-text-faint">padding=&quot;lg&quot;</p>
        </Footer>
      </div>
    </Section>
  ),
};
