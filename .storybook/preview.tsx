import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
// デザイントークンの単一ソース（theme.css）+ カタログ表示用の最小 body 規則。
import './preview.css';
import type { Preview } from '@storybook/react-vite';

// 旧モノレポでは MemoryRouter と I18nProvider の decorator で全 story を包んでいた。
// これは insession アプリ固有の共有コンポーネント（SideNav 等）が react-router / i18n に
// 依存していたためで、このパッケージのプリミティブはどちらにも依存しない（純粋 leaf）。
// 単独リポジトリ化に伴い decorator は不要になったため削除した。
const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
};

export default preview;
