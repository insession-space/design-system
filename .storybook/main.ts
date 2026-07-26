import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

// デザインシステムのコンポーネントカタログ(Issue #69 由来)。
// 旧モノレポでは apps/web/src/style.css をトークン源にしていたが、単独リポジトリ化に伴い
// このパッケージ自身の theme.css を単一ソースにした(.storybook/preview.css を参照)。
const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)', '../stories/**/*.mdx'],
  addons: ['@storybook/addon-docs'],
  // public/ を成果物へそのままコピーする。ここに置いた CNAME が
  // storybook-static/CNAME として出て、GitHub Pages のカスタムドメイン
  // (design-system.insession.space) を宣言する（README「カタログの公開」参照）。
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      // stories は消費側と同じ書き方（パッケージ名 import）を保つ。dist は開発中に存在しない
      // ため、自己参照をソースの index.ts へ向ける（tsconfig.json の paths と対応）。
      resolve: {
        alias: {
          '@insession/design-system': fileURLToPath(new URL('../index.ts', import.meta.url)),
        },
      },
      // デザイントークン(theme.css の @theme)を Storybook でも生成するため
      // @tailwindcss/vite プラグインを足す。プリフライトは意図的に未使用。
      plugins: [tailwindcss()],
      // Storybook 自身のベンダーバンドル(iframe/blocks)は大きく、chunk サイズ警告は
      // 我々のカタログ側で対処できない一般的 advisory。閾値を上げて出力をクリーンに保つ。
      build: { chunkSizeWarningLimit: 2000 },
    });
  },
};

export default config;
