import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
// デザイントークンの単一ソース（theme.css）+ カタログ表示用の最小 body 規則。
import './preview.css';
import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
// 外枠と同じテーマ。Docs ページの地に使う（manager.ts と共有）。
import { dsTheme } from './ds-theme';
// Storybook 内部の衝突（Issue #19）への回避策。理由と外す条件はファイル冒頭に書いてある。
import { guardFocusAccessor } from './patch-focus-accessor';

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
  // Storybook の csf addon が focus をアクセサへ差し替えるのは story の描画時なので、
  // その後に走る loader でガードを掛ける（プロジェクトの loader はアドオンの loader より
  // 後に走る）。掛かっていれば何もしない冪等な処理。詳細は patch-focus-accessor.ts。
  loaders: [
    () => {
      guardFocusAccessor();
    },
  ],
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
    options: {
      // 既定はアルファベット順で、Foundations が Overlays 等の後ろに埋もれてしまう。
      // Issue #68 でサイドバーを「役割ベース」のカテゴリツリーに再編したため、
      // その役割の並び（入口 → 土台 → 骨格 → 操作・入力 → 表示・通知 → 構造 → 複合）で
      // 明示的に固定する。既定のアルファベット順に戻すと、例えば Inputs が Foundations より
      // 前に来るなど、読む順序と無関係な並びに戻ってしまうため必須。
      // 各カテゴリ配下は個別に並びを固定せず、カテゴリ内はアルファベット順に任せる
      // （部品数が増えても手を入れずに済む）。
      // 先頭2つは Docs ページ（story を持たない入口）。'Introduction' がカタログの表紙、
      // 'Overview' が Overview.mdx（カテゴリの分け方）で、どちらも部品カテゴリより前に置く。
      // ここに列挙しないと '*' の位置＝末尾へ流れて入口が最後に来てしまう。
      storySort: {
        order: [
          'Introduction',
          'Overview',
          'Foundations',
          'Layout',
          'Surfaces',
          'Actions',
          'Inputs',
          'Data Display',
          'Feedback',
          'Overlays',
          'Navigation',
          'Page',
          'Patterns',
          '*',
        ],
      },
    },
    docs: {
      // Docs コンテナの地。これを渡さないとライト既定のままで、白い面に暗テーマ由来の
      // クリーム色の文字が載って読めなくなる（.sbdocs-wrapper の背景が #fff になる）。
      // manager と同じテーマを共有して二重管理を避ける。
      theme: dsTheme,
      // props テーブルが長い部品（Button / Modal 等）で目次を出す。
      // headingSelector を明示しないと h3 しか拾わず、h2 の節が目次に出ない。
      toc: { headingSelector: 'h2, h3' },
    },
  },
  // 全 story に autodocs を付ける（= 部品ごとに Docs ページが生える）。
  // 個別の meta に tags を書かなくて済むよう、ここで一括で有効にする。
  // Controls パネルに出ている props テーブルが Docs ページ側にも並ぶので、
  // 「その部品の全バリアント + props」を1ページで読めるようになる。
  tags: ['autodocs'],
};

export default preview;
