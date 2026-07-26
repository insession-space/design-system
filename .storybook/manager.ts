// カタログの外枠（サイドバー / ツールバー / 検索）を DS のトーンで塗る。
//
// なぜ必要か: Storybook の manager UI は既定テーマのままだと、中身（DS のプリミティブ）と
// 外枠の配色・書体がまったく無関係になる。カタログは DS のショーケースなので、外枠も
// theme.css のトークンで組む。
//
// テーマ本体と注意書き（OS のライト/ダーク追従が止まる件・値の写しの管理）は
// ds-theme.ts に置いてある。Docs ページの地も同じテーマを preview.tsx から使う。
import { addons } from 'storybook/manager-api';
import { dsTheme } from './ds-theme';

addons.setConfig({
  theme: dsTheme,
  // Components / Foundations の root を畳めるようにする（既定でも true だが、
  // storySort で順序を固定した意図が読めるよう明示しておく）。
  sidebar: { showRoots: true },
});
