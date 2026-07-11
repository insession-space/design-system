import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

// デザインガイド/コンポーネントカタログ(Issue #69)。
// 既存の Vite + Tailwind v4 + apps/web/src/style.css のトークンをそのまま読み込み、
// 実物と同じ見た目でトークン/コンポーネントを一覧する living catalog。
const config: StorybookConfig = {
  stories: ['../apps/web/src/**/*.stories.@(ts|tsx)', '../apps/web/src/**/*.mdx'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // 本アプリのデザイントークンの単一ソース(style.css の @theme)を Storybook でも生成するため、
  // @tailwindcss/vite プラグインを Storybook の Vite 設定にも足す(本体 vite.config.ts と同じ)。
  // プリフライトは意図的に未使用(style.css が独自リセットを持つため)= 本体と同条件。
  viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      // Storybook 自身のベンダーバンドル(iframe/blocks)は大きく、chunk サイズ警告は
      // 我々のカタログ側で対処できない一般的 advisory。閾値を上げて出力をクリーンに保つ。
      build: { chunkSizeWarningLimit: 2000 },
    });
  },
};

export default config;
