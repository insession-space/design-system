import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../client/src/lib/i18n';
// デザイントークンの単一ソース。読み込むと body に本アプリと同じ背景/フォント/リセットが効く。
import '../client/src/style.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  // 一部の共有コンポーネント(SideNav 等)は react-router と i18n に依存するため全 story を包む。
  decorators: [
    (Story) => (
      <MemoryRouter>
        <I18nProvider>
          <Story />
        </I18nProvider>
      </MemoryRouter>
    ),
  ],
};

export default preview;
