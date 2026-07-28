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
export default defineConfig({
  plugins: [
    tailwindcss(),
    storybookTest({ configDir: fileURLToPath(new URL('.storybook', import.meta.url)) }),
  ],
  resolve: {
    // stories は消費側と同じくパッケージ名で import する。dist ではなくソースへ向ける
    // （.storybook/main.ts の viteFinal と同じ対応。二重管理だが、vitest はそちらを通らない）。
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
    // preview.tsx の注釈を story に適用する。addon の自動適用はこの構成では動かない
    // （理由は .storybook/vitest.setup.ts の冒頭コメント）。
  },
});
