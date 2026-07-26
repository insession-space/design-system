// カタログの「外枠」テーマ（サイドバー / ツールバー / Docs ページの地）を DS のトーンで作る。
//
// なぜ独立したファイルなのか: この 1 つのテーマを **manager と preview の両方** が使う。
//   - manager.ts   … addons.setConfig({ theme }) でサイドバー / ツールバーを塗る
//   - preview.tsx  … parameters.docs.theme で Docs ページの地を塗る
// 両者は別バンドルなので、ここを共有しないと値が二重管理になる。
//
// ⚠ docs.theme を渡さないと Docs コンテナはライト既定のままで、白い面にクリーム色の文字が
//   載って読めなくなる（.sbdocs-wrapper の背景が #fff、文字色だけ暗テーマ由来になる）。
//   autodocs を有効にしている以上、ここは必須。
//
// ⚠ manager / docs コンテナの色は JS から emotion に流し込まれるため、静的なテーマを 1 つ
//   指定すると Storybook 既定の「OS のライト/ダーク追従」は止まり、常にこのダークトーンになる。
//   ストーリーの描画領域のライト/ダークはツールバーの Theme トグルで引き続き切り替わる。
//
// ⚠ 値は theme.css のダーク値を手で写している（manager は CSS 変数を読めない）。
//   theme.css を変えたらこのファイルも合わせる。写しはここ 1 箇所に閉じ込めてある。
import { create } from 'storybook/theming/create';

// theme.css の :root（ダーク）より。
const bg = '#121211'; // --color-bg（アプリの地）
const elevated = '#1a1a18'; // --color-bg-elevated
const surface = '#201f1d'; // --color-surface
const border = '#332f25'; // --color-border
const text = '#f3f0e7'; // --color-text
const textDim = '#a7a395'; // --color-text-dim
const coral = '#ff6a47'; // --color-mint（コーラル / 主アクセント）
const coralSoft = '#ffb199'; // --color-mint-soft
const blue = '#5b8bf0'; // --color-cyan（ブルー / 副アクセント）
const inkOnAccent = '#17160f'; // アクセント面に載せる文字色（ライトの --color-text）

// theme.css の --font-body と同じスタック。manager 用の woff2 は main.ts の staticDirs が
// /fonts へ配り、manager-head.html が @font-face で読む。
const fontStack = '"JetBrains Mono", "Hiragino Sans", "Noto Sans JP", monospace';

// ロゴは logo-mark.tsx の「リング + 3 ドット」に合わせる。brandTitle は HTML 文字列として
// 解釈されるため React ではなく生 SVG を書く。ドットの配色はブランド固定色（logo-mark.tsx と同値）。
const brandTitle = `
<span style="display:inline-flex;align-items:center;gap:.5rem">
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="13" stroke="${text}" stroke-width="4" fill="none" />
    <circle cx="24" cy="11" r="6.5" fill="#FF5A36" />
    <circle cx="35.3" cy="30.5" r="6.5" fill="#F5A524" />
    <circle cx="12.7" cy="30.5" r="6.5" fill="#3B6FE0" />
  </svg>
  <span style="font-weight:700;letter-spacing:-.03em;font-size:.82rem;white-space:nowrap">@insession/design-system</span>
</span>`;

// Docs ページ（外枠）の地に載せる要素が使う色。
//
// ⚠ Introduction のような MDX ページでこれを使い、`var(--color-*)` を使わないこと。
//   トークンはツールバーの Theme トグル（story の decorator が html の data-theme を書き換える）に
//   追従するのに、Docs の地は上のテーマで固定ダークなので、ライトに切り替えた状態で MDX を開くと
//   「ライトのトークン × 暗い地」で文字が沈む。ここは地と同じトーンに固定する。
export const chrome = {
  surface,
  border,
  borderStrong: '#403a2d', // --color-border-strong
  text,
  textDim,
  radiusMd: '10px', // --radius-md
} as const;

export const dsTheme = create({
  base: 'dark',

  brandTitle,
  brandUrl: 'https://design-system.insession.space/',
  brandTarget: '_self',

  // 主アクセントはコーラル。選択状態（サイドバーの現在行）もここに揃える。
  colorPrimary: coral,
  colorSecondary: coral,

  // 面は「サイドバー(elevated) < キャンバス(bg) < バー(surface)」の 3 層。
  // キャンバスを --color-bg にすることで、消費側アプリと同じ地の上に部品が載る。
  appBg: elevated,
  appContentBg: bg,
  appPreviewBg: bg,
  appBorderColor: border,
  appBorderRadius: 6, // --radius-chip

  fontBase: fontStack,
  fontCode: fontStack,

  textColor: text,
  textInverseColor: inkOnAccent,
  textMutedColor: textDim,

  // ツールバー / アドオンパネルのタブ。
  barTextColor: textDim,
  barHoverColor: coralSoft,
  barSelectedColor: coral,
  barBg: surface,

  // 検索欄 / Controls の入力。
  inputBg: surface,
  inputBorder: border,
  inputTextColor: text,
  inputBorderRadius: 6,

  // Docs の boolean コントロール等で使われる副アクセント。
  booleanBg: surface,
  booleanSelectedBg: blue,
});
