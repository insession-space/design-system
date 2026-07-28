import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

// manager(外枠)用のフォント。preview 側は preview.tsx の @fontsource import で解決するが、
// manager は別ドキュメントなので @font-face を自分で宣言する必要がある。
//
// data URI で埋め込むのは配布量のため: staticDirs で @fontsource のディレクトリを配ると
// 全サブセット・全ウェイト(192ファイル/2.0MB)がコピーされるのに、実際に要るのは
// latin の 400/700 の woff2(計 48KB)だけだった。ここで必要な2つだけを埋め込む。
const fontFace = (weight: 400 | 700) => {
  const file = new URL(
    `../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff2`,
    import.meta.url,
  );
  const base64 = readFileSync(file).toString('base64');
  return `@font-face{font-family:"JetBrains Mono";font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${base64}) format("woff2")}`;
};

// デザインシステムのコンポーネントカタログ(Issue #69 由来)。
// 旧モノレポでは apps/web/src/style.css をトークン源にしていたが、単独リポジトリ化に伴い
// このパッケージ自身の theme.css を単一ソースにした(.storybook/preview.css を参照)。
const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)', '../stories/**/*.mdx'],
  // addon-a11y は「パネルで目視する」だけでなく、addon-vitest 経由で全 story に axe を
  // 走らせる CI 検査の実体でもある（vitest.config.ts / preview.tsx の a11y.test を参照）。
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  // public/ を成果物へそのままコピーする。ここに置いた CNAME が
  // storybook-static/CNAME として出て、GitHub Pages のカスタムドメイン
  // (design-system.insession.space) を宣言する（README「カタログの公開」参照）。
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Storybook 自身のリリース告知トーストはカタログの内容と無関係なので出さない。
  core: { disableWhatsNewNotifications: true },
  // 外枠の書体を DS(--font-body)に合わせるため、manager のドキュメントへ @font-face を注入する。
  managerHead: (head) => `${head}<style>${fontFace(400)}${fontFace(700)}</style>`,
  viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      // stories は消費側と同じ書き方（パッケージ名 import）を保つ。dist は開発中に存在しない
      // ため、自己参照をソースの index.ts へ向ける（tsconfig.json の paths と対応）。
      resolve: {
        alias: {
          '@insession/design-system': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
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
