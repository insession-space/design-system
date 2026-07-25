import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
// デザイントークンの単一ソース（theme.css）+ カタログ表示用の最小 body 規則。
import './preview.css';
import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';

// 旧モノレポでは MemoryRouter と I18nProvider の decorator で全 story を包んでいた。
// これは insession アプリ固有の共有コンポーネント（SideNav 等）が react-router / i18n に
// 依存していたためで、このパッケージのプリミティブはどちらにも依存しない（純粋 leaf）。
// 単独リポジトリ化に伴い decorator は不要になったため削除した。
const preview: Preview = {
  // ツールバーのテーマ切替。theme.css のライトオーバーレイは `<html data-theme="light">`
  // でのみ効くので、消費側と同じやり方（html の属性を書き換える）で再現する。
  // これが無いとライト値を目視検証できない。
  globalTypes: {
    theme: {
      description: 'ライト/ダークの切替（html の data-theme を書き換える）',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark（既定）' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'dark' },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? 'dark';
      useEffect(() => {
        // ダークは属性なしでも成立するが、消費側（insession-app / loophub）は明示的に
        // data-theme を書くのでそれに合わせる。
        document.documentElement.dataset.theme = theme;
      }, [theme]);
      return <Story />;
    },
  ],
  parameters: {
    layout: 'padded',
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
};

export default preview;
