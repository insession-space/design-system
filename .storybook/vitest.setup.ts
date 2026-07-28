// vitest（browser mode）から story を動かすとき、preview.tsx の設定（テーマ decorator・
// a11y: test:'error'・loaders）を story に適用する。
//
// Storybook 10.3 以降 addon-vitest はこれを自動でやると案内してくるが、**この構成では
// 自動側が動かない**。addon が注入する setup ファイルは node_modules/.pnpm 配下の絶対パスで
// 参照され、Vite がそれを root 相対の URL として配ってしまい 全 story が
// "Failed to fetch dynamically imported module" で落ちる。自前の setup ファイルがあると
// addon は自動注入をスキップするので、これがそのまま回避策になっている。
// （addon 側で解決されたら、このファイルごと削除して自動適用に戻してよい）
// ⚠ addon-a11y の annotations を **必ず** 混ぜること。preview.tsx の
// `a11y: { test: 'error' }` はこれが読み込まれて初めて axe を起動する。抜けていても
// テストは 全 story 緑で通ってしまい、「検査しているつもりで何も検査していない」状態に
// なる（実際に一度そうなった。故意に violation を含む story を書いても通った）。
import * as a11yAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as previewAnnotations from './preview';

setProjectAnnotations([a11yAnnotations, previewAnnotations]);
