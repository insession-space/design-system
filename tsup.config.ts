import { defineConfig } from 'tsup';

// 配布物のビルド。旧モノレポでは .ts ソースをそのまま Vite に解決させていたが、
// 外部 npm パッケージになったため js + d.ts を生成して配る（#repo-split）。
export default defineConfig({
  entry: ['index.ts'],
  // 消費側は全て Vite（insession web/admin/lp/help, loophub web/lp）なので ESM のみ。
  // Node から require される予定が無いため CJS は出さない。
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // ⚠ minify は無効のままにする。消費側の Tailwind が dist を @source で走査して
  // ユーティリティを生成するため、クラス名の文字列リテラルが壊れてはいけない
  // （壊れるとビルドは通るのにスタイルだけが静かに消える）。
  minify: false,
  // ホストと同一 React インスタンスを使う（peerDependency）。
  external: ['react', 'react-dom', 'react/jsx-runtime'],
});
