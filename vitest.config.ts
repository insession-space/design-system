import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// カタログの全 story を実ブラウザで描画し、axe を掛ける（`pnpm test:a11y`）。
//
// jsdom ではなく Playwright の Chromium を使うのは、色コントラスト（color-contrast）など
// 実際のレイアウト・計算済みスタイルが要る規則を jsdom が評価できないため。DS にとって
// コントラストは中核の関心事なので、ここを落とすと検査の意味が薄れる。
//
// story 側に手を入れずに全件へ axe が掛かるのは .storybook/preview.tsx の
// `a11y: { test: 'error' }` による。個別抑制はその story の parameters で行う。
//
// ⚠ storybookTest は **test.projects の中** で使うこと。ルート直下の test に browser 設定を
// 直接書くと、setupFiles がルート相対ではなく絶対パスの URL として配られ、全 story が
// "Failed to fetch dynamically imported module" で落ちる。
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          tailwindcss(),
          storybookTest({ configDir: fileURLToPath(new URL('.storybook', import.meta.url)) }),
        ],
        // 事前バンドルの対象に入れておかないと、最初の story が読み込んだ時点で
        // 「optimized dependencies changed. reloading」が起きてテストが落ちる。
        // 手元はキャッシュが温まると再現しなくなるが、CI は毎回キャッシュが空なので必ず踏む。
        optimizeDeps: { include: ['@storybook/addon-a11y/preview'] },
        resolve: {
          // stories は消費側と同じくパッケージ名で import する。dist は開発中に存在しない
          // ため自己参照をソースへ向ける（.storybook/main.ts の viteFinal と同じ対応。
          // vitest はそちらを通らないので、ここにも要る）。
          alias: {
            '@insession/design-system': fileURLToPath(new URL('src/index.ts', import.meta.url)),
          },
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          // preview.tsx の注釈（テーマ decorator・a11y: test:'error'）を story に適用する。
          // このファイルは configDir 直下に置き "setProjectAnnotations" を含む必要がある
          // — addon はその2条件で自前の setup ファイルの自動注入をやめる判定をする。
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
