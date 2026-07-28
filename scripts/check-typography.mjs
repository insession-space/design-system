#!/usr/bin/env node
/* タイポグラフィがスケールから逸脱していないかを機械的に検査する（#117）。
 *
 * ── 何を防ぐための検査か ───────────────────────────────
 * DS は長らくサイズスケールを2系統（生スケール text-2xs〜6xl と、セマンティック
 * text-display/h1/h2/body/small/label）持ったまま統合されておらず、値まで衝突していた
 * （text-base=text-small=14px / text-lg=text-body=16px）。段が 10〜56px を 13 段、ほぼ 1px
 * 刻みで並んでいたため「13px と 14px のどちらを使うべきか」を誰も決められず、決められない
 * まま `text-[12.5px]` `text-[13.5px]` のような任意値が積み上がった。結果として、
 * **画面や機能ごとに文字サイズが少しずつ違う**状態になっていた。
 *
 * この種の逸脱は型検査もビルドも lint も緑のまま通る。人間のレビューでも「13px と 14px の
 * どちらが正か」を毎回思い出せないと止められない。だから決定論的なチャネル（CI）で塞ぐ。
 *
 * ── 検査すること ──────────────────────────────────
 *   1. 廃止したユーティリティ（text-2xs / smd / md / xl / 2xl / 3xl / 4xl / 5xl / 6xl）を使っていないか。
 *   2. font-size の任意値（text-[13px] 等）を使っていないか。スケールに乗らない値そのものが問題。
 *   3. トークンで表現できる leading-[…] / tracking-[…] の任意値を使っていないか。
 *   4. コンポーネントが font-display / font-mono を使っていないか（font-body に一本化。例外は下記）。
 *   5. src/styles/*.css に font-size の直書きが無いか（var(--text-*) 経由になっているか）。
 *   6. theme.css 側の不変条件: 廃止トークンの定義が残っていないか、全サイズトークンが
 *      line-height を実数で持っているか（normal は環境依存で行送りがブレるので禁止）。
 *
 * ── 検査しないこと（意図的な限界）────────────────────────
 * 非 ASCII（日本語）を含む文字列リテラルは走査しない。Storybook の note や説明文は
 * 「font-display / font-mono は別名として残している」のようにクラス名を**文章として**含むため、
 * 素朴に走査すると誤検出する。className に日本語が入ることは実質無いので、この線引きで足りる。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ---- 契約 ---- */

// #117 で廃止した段。置換先を添えて、検出時にそのまま直せるようにする。
const REMOVED = new Map([
  ['text-2xs', 'text-xs (11px)'],
  ['text-smd', 'text-base (14px)'],
  ['text-md', 'text-base (14px)'],
  ['text-xl', 'text-lg (16px)'],
  ['text-2xl', 'text-lg (16px)'],
  ['text-3xl', 'text-h2 (22px)'],
  ['text-4xl', 'text-h2 (22px)'],
  ['text-5xl', 'text-h1 (32px)'],
  ['text-6xl', 'text-display (44px)'],
]);

// 補助スケール（サイズのみ）。ここに無い段は作らない。
const SCALE = ['text-xs', 'text-sm', 'text-base', 'text-lg'];
// セマンティック階層（size + weight + line-height + letter-spacing）。既定はこちら。
const ROLES = ['text-display', 'text-h1', 'text-h2', 'text-body', 'text-small', 'text-label'];

// ワードマークだけは font-display を使う。DS のフォントは現状すべて JetBrains Mono に
// 揃っているが、Archivo をロゴ/ワードマーク専用に差し替える余地を残すための足場なので、
// ここを font-body に潰すと再導入の起点が消える。
const FONT_ALIAS_ALLOWED = new Set(['src/components/logo-mark.tsx']);

// 標準ユーティリティで書ける値。任意値で書かれていたらトークンへ寄せる。
const LEADING_TOKENS = new Map([
  ['1', 'leading-none'],
  ['1.25', 'leading-tight'],
  ['1.375', 'leading-snug'],
  ['1.5', 'leading-normal'],
  ['1.625', 'leading-relaxed'],
  ['2', 'leading-loose'],
]);
const TRACKING_TOKENS = new Map([
  ['-0.05em', 'tracking-tighter'],
  ['-0.025em', 'tracking-tight'],
  ['0.025em', 'tracking-wide'],
  ['0.05em', 'tracking-wider'],
  ['0.1em', 'tracking-widest'],
  ['0.06em', 'tracking-tag'],
  ['0.08em', 'tracking-pill'],
]);

// Tailwind の既定テーマが持つサイズ段。DS が上書きを削っただけだと既定値が表に出てきて、
// 廃止したはずのユーティリティが「別のサイズで」生き続ける。theme.css で initial にして潰す。
const TAILWIND_DEFAULT_STEPS = new Map([
  ['xl', '20px'],
  ['2xl', '24px'],
  ['3xl', '30px'],
  ['4xl', '36px'],
  ['5xl', '48px'],
  ['6xl', '60px'],
  ['7xl', '72px'],
  ['8xl', '96px'],
  ['9xl', '128px'],
]);

// 「×」グリフの寸法など、テキスト階層ではない font-size を CSS 側で許すための印。
const CSS_EXEMPT = 'typography-scale-exempt';

/* ---- 走査対象 ---- */

function sourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...sourceFiles(p));
    else if (/\.tsx$/.test(entry)) out.push(p);
  }
  return out;
}

const TSX_FILES = [...sourceFiles(join(ROOT, 'src')), ...sourceFiles(join(ROOT, 'stories'))];

// 日本語などの非 ASCII を含むか。含む文字列リテラルは文章とみなして走査から外す。
function hasNonAscii(text) {
  for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) > 126) return true;
  return false;
}

// `${…}` を除いた静的トークンだけを取る（check-styles.mjs と同じ考え方）。
function staticTokens(raw) {
  return raw
    .replace(/\$\{[^}]*\}/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

// 変種プレフィックス（hover: / data-active: / sm: …）を落として素の名前にする。
function bare(token) {
  const i = token.lastIndexOf(':');
  return i === -1 ? token : token.slice(i + 1);
}

// font-size の任意値かどうか。text-[…] は色にも使える（text-[#fff] / text-[var(--color-x)]）ので、
// 中身が長さのときだけ font-size とみなす。
function arbitraryFontSize(value) {
  return /^(?:length:)?-?[\d.]+(?:px|rem|em|pt|ch|%)$/.test(value.trim());
}

const problems = [];
const push = (line) => problems.push(line);

/* ---- 1〜4) tsx の走査 ---- */
for (const file of TSX_FILES) {
  const rel = file.slice(ROOT.length + 1);
  const src = readFileSync(file, 'utf8');
  const fontAliasAllowed = FONT_ALIAS_ALLOWED.has(rel);

  for (const m of src.matchAll(/'([^'\n]*)'|`([^`]*)`|"([^"\n]*)"/g)) {
    const raw = m[1] ?? m[2] ?? m[3];
    // 日本語を含むリテラルは文章とみなして走査しない（上記「検査しないこと」）。
    if (hasNonAscii(raw)) continue;

    for (const token of staticTokens(raw)) {
      const name = bare(token);

      // 1) 廃止した段
      if (REMOVED.has(name)) {
        push(`  ${rel}: ${name} は廃止。${REMOVED.get(name)} に置き換えること。`);
        continue;
      }

      // 2) font-size の任意値
      const size = name.match(/^text-\[(.+)\]$/);
      if (size && arbitraryFontSize(size[1])) {
        push(
          `  ${rel}: ${name} はスケール外。補助スケール(${SCALE.join(' / ')}) か セマンティック階層(${ROLES.join(' / ')}) を使うこと。`,
        );
        continue;
      }

      // 3) トークンで書ける leading / tracking の任意値
      const leading = name.match(/^leading-\[(.+)\]$/);
      if (leading && LEADING_TOKENS.has(leading[1]))
        push(`  ${rel}: ${name} は ${LEADING_TOKENS.get(leading[1])} と同値。トークンで書くこと。`);
      const tracking = name.match(/^tracking-\[(.+)\]$/);
      if (tracking && TRACKING_TOKENS.has(tracking[1]))
        push(
          `  ${rel}: ${name} は ${TRACKING_TOKENS.get(tracking[1])} と同値。トークンで書くこと。`,
        );

      // 4) font-family の使い分け
      if ((name === 'font-display' || name === 'font-mono') && !fontAliasAllowed)
        push(
          `  ${rel}: ${name} は使わない。3 つの font トークンは同値なので font-body に一本化している。`,
        );
    }
  }
}

/* ---- 5) src/styles/*.css の font-size 直書き ---- */
const STYLE_DIR = join(ROOT, 'src', 'styles');
for (const entry of readdirSync(STYLE_DIR)) {
  if (!entry.endsWith('.css')) continue;
  const rel = join('src/styles', entry);
  const lines = readFileSync(join(STYLE_DIR, entry), 'utf8').split('\n');
  lines.forEach((line, i) => {
    const m = line.match(/^\s*font-size:\s*([^;]+);/);
    if (!m) return;
    const value = m[1].trim();
    if (value.startsWith('var(--text-')) return;
    // 直前数行に免除の印があれば許す（アイコングリフの寸法など）。
    const context = lines.slice(Math.max(0, i - 4), i).join('\n');
    if (context.includes(CSS_EXEMPT)) return;
    push(
      `  ${rel}:${i + 1}: font-size: ${value} の直書き。var(--text-*) を使うこと（テキストでないなら直前に ${CSS_EXEMPT} の注記を置く）。`,
    );
  });
}

/* ---- 6) theme.css の不変条件 ---- */
const theme = readFileSync(join(STYLE_DIR, 'theme.css'), 'utf8');

// `--text-x: initial;` は「Tailwind 既定の段を消す」宣言なので、値を持つ定義とは別に扱う。
const declarations = [...theme.matchAll(/^\s*--text-([a-z0-9]+):\s*([^;]+);/gm)].map((m) => ({
  name: m[1],
  value: m[2].trim(),
}));
const unset = new Set(declarations.filter((d) => d.value === 'initial').map((d) => d.name));
const declared = declarations.filter((d) => d.value !== 'initial').map((d) => d.name);

for (const removed of REMOVED.keys()) {
  const name = removed.slice('text-'.length);
  if (declared.includes(name))
    push(`  src/styles/theme.css: 廃止したはずの --${removed} に値が定義されている。`);
  // Tailwind 既定テーマが持つ段は、消すだけでは既定値が表に出てくる。initial で明示的に潰す。
  if (TAILWIND_DEFAULT_STEPS.has(name) && !unset.has(name))
    push(
      `  src/styles/theme.css: --${removed} を initial で消していない。上書きを削るだけだと Tailwind 既定(${TAILWIND_DEFAULT_STEPS.get(name)})が表に出て、廃止したはずの段が別サイズで生き続ける。`,
    );
}
for (const [name, size] of TAILWIND_DEFAULT_STEPS) {
  // 廃止した段は上のループが理由込みで報告済みなので、二重に出さない。
  if (REMOVED.has(`text-${name}`)) continue;
  if (!unset.has(name) && !declared.includes(name))
    push(
      `  src/styles/theme.css: --text-${name} を initial で消していない。Tailwind 既定(${size})のまま使えてしまう。`,
    );
}

for (const name of declared) {
  const lh = theme.match(new RegExp(`^\\s*--text-${name}--line-height:\\s*([^;]+);`, 'm'));
  if (!lh) {
    push(
      `  src/styles/theme.css: --text-${name} に --line-height が無い。行送りが環境依存になる。`,
    );
  } else if (lh[1].trim() === 'normal') {
    push(
      `  src/styles/theme.css: --text-${name}--line-height が normal。実行環境のフォントで行高がブレるので実数を指定すること。`,
    );
  }
}

const expected = [...SCALE, ...ROLES].map((c) => c.slice('text-'.length)).sort();
const actual = [...declared].sort();
if (expected.join(',') !== actual.join(','))
  push(
    `  src/styles/theme.css: サイズトークンの集合が契約と違う。\n     期待: ${expected.join(', ')}\n     実際: ${actual.join(', ')}`,
  );

/* ---- 結果 ---- */
if (problems.length) {
  console.error('\nタイポグラフィの検査に失敗しました。\n');
  // 同じ指摘が複数回出ても読みにくいだけなので畳む。
  for (const line of [...new Set(problems)]) console.error(line);
  console.error(
    '\n  スケールの契約は src/styles/theme.css と README のタイポグラフィ節を参照（#117）。\n',
  );
  process.exit(1);
}

console.log(
  `タイポグラフィ OK  (セマンティック ${ROLES.length} 段 / 補助 ${SCALE.length} 段 / tsx ${TSX_FILES.length} ファイル)`,
);
