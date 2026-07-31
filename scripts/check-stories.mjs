#!/usr/bin/env node
/* public export しているコンポーネントが Storybook のカタログに載っているかを機械的に検査する。
 *
 * ── 何を防ぐための検査か ───────────────────────────────
 * このパッケージにとってカタログ（Storybook）は付属物ではなく成果物そのもので、消費側が
 * 「何が使えるのか / どう見えるのか」を知る唯一の場所になっている。ところが新しい
 * プリミティブを src/index.ts から export しても、story を書き忘れたことは型検査でも
 * ビルドでも lint でも検出されない。**カタログに載っていないコンポーネントは、存在しないのと
 * ほぼ同じ**なのに、緑のまま出荷できてしまう。
 *
 * 実際 Issue #120 の時点で Radio と Menu が export だけされてカタログに無い状態だった。
 * 人のレビューで毎回気づける類ではないので、決定論的なチャネル（CI）で塞ぐ。
 *
 * ── 検査すること ──────────────────────────────────
 * src/index.ts が値として export する識別子のうち「コンポーネント」に該当するものが、
 * stories/ のどこかで JSX として描画されていること（`<Name …>` / `<Name.Sub …>`）。
 * 単に import されているだけ・型注釈に出るだけでは通さない — 描画されていなければ
 * カタログには何も映らないため。
 *
 * ── 検査しないこと（意図的な限界）────────────────────────
 * 「どれだけ網羅的な story か」は測らない（状態を尽くしているかは人のレビューの仕事）。
 * ここは 0 か 1 か、つまり「カタログに一度も出てこない export がある」だけを止める。
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = join(ROOT, 'src', 'index.ts');
const STORIES_DIR = join(ROOT, 'stories');

/* ---- 検査の対象外 ----
 * 大文字始まりでも「描画されるコンポーネント」ではないもの。なし崩しに増えると検査が
 * 意味を失うので、1件ずつ理由を書く。ここに足す前に「本当に story を書けないのか」を疑うこと。 */
const EXEMPT = new Map([
  // メディアクエリ文字列。消費側が自前のレイアウト分岐に使う定数で、描画物ではない。
  ['MOBILE_LAYOUT_MQ', 'メディアクエリ文字列の定数'],
  // フォーム部品の共有クラス名。消費側が DS と同じ見た目の入力欄を自作するための材料で、
  // それ自体は DOM を持たない（見た目は Input / Textarea の story が代表して示す）。
  ['FIELD_BOX_BASE', 'クラス名文字列の定数（見た目は Input の story が示す）'],
  ['FIELD_CONTROL', 'クラス名文字列の定数（見た目は Input の story が示す）'],
  ['FIELD_LABEL', 'クラス名文字列の定数（見た目は Input の story が示す）'],
  // レイアウトの内部マッピング。Grid / Stack の props から引かれるテーブルで、描画物ではない。
  ['COLUMNS_CLASS', 'Grid の内部クラスマップ（見た目は Grid の story が示す）'],
  ['GAP_CLASS', 'Stack/Grid の内部クラスマップ（見た目は Stack の story が示す）'],
  // Popover の見た目を消費側が自前のポップアップに移植するためのクラス名断片。
  ['POPOVER_POPUP_BASE', 'クラス名文字列の定数（見た目は Popover の story が示す）'],
  ['POPOVER_POPUP_PADDING', 'クラス名文字列の定数（見た目は Popover の story が示す）'],
  ['POPOVER_POPUP_SCROLL', 'クラス名文字列の定数（見た目は Popover の story が示す）'],
  ['POPOVER_POSITIONER_BASE', 'クラス名文字列の定数（見た目は Popover の story が示す）'],
  // プロフィールモーダルを開く手段をアプリ側から注入するための Context。DS 側に描画物は無い
  // （モーダルの中身はアプリが持つ）。
  ['ProfileModalContext', 'DI 用の React Context（DS 側に描画物を持たない）'],
  // Mention が既定で認識するトリガー文字の配列。消費側が「どの文字で発火するか」を自前の
  // パーサ（本文中のメンション抽出）と揃えるために読む定数で、描画物ではない。
  ['MENTION_TRIGGERS', 'トリガー文字の配列定数（見た目は Mention の story が示す）'],
]);

/* ---- src/index.ts が値として export する識別子を集める ---- */
const index = readFileSync(INDEX, 'utf8').replace(/\/\/[^\n]*/g, '');
const exported = new Set();
for (const m of index.matchAll(/export\s*\{([^}]*)\}/g)) {
  for (const raw of m[1].split(',')) {
    const part = raw.trim();
    if (!part) continue;
    if (part.startsWith('type ')) continue; // 型は描画されない
    // `default as Button` / `Button` / `Button as Btn` のいずれからも公開名を取る。
    const name = part.match(/([A-Za-z0-9_]+)\s*$/)?.[1];
    if (!name) continue;
    if (!/^[A-Z]/.test(name)) continue; // フック・小文字ユーティリティは対象外
    exported.add(name);
  }
}

/* ---- stories/ で JSX として描画されている識別子を集める ---- */
function storyFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...storyFiles(join(dir, entry.name)));
    else if (/\.(tsx|mdx)$/.test(entry.name)) out.push(join(dir, entry.name));
  }
  return out;
}

const rendered = new Set();
for (const file of storyFiles(STORIES_DIR)) {
  const src = readFileSync(file, 'utf8');
  // `<Button ` `<Button>` `<Button/>` と、名前空間コンポーネントの `<Menu.Root>` `<SideNav.Item>`。
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9_]*)[\s/>.]/g)) rendered.add(m[1]);
}

/* ---- 突き合わせ ---- */
const missing = [...exported].filter((n) => !rendered.has(n) && !EXEMPT.has(n));
// 対象外リストが実態から離れていないかも見る（story が書かれたのに免除が残っていると、
// 次に同名の欠落が起きても検出できない）。
const staleExempt = [...EXEMPT.keys()].filter((n) => rendered.has(n) || !exported.has(n));

const problems = [];
if (missing.length) {
  problems.push('public export しているのに story で一度も描画されていないコンポーネント:');
  for (const n of missing) problems.push(`  ${n}`);
  problems.push(
    '  → stories/ に story を足すこと。描画物でないなら scripts/check-stories.mjs の',
    '    EXEMPT に「理由付きで」登録すること。',
  );
}
if (staleExempt.length) {
  problems.push('EXEMPT が実態と合っていない（story が書かれた / export が消えた）:');
  for (const n of staleExempt) problems.push(`  ${n}  — ${EXEMPT.get(n)}`);
  problems.push('  → EXEMPT から外すこと。放置すると同名の欠落を検出できなくなる。');
}

if (problems.length) {
  console.error('\nカタログ網羅の検査に失敗しました。\n');
  for (const l of problems) console.error(l);
  console.error('');
  process.exit(1);
}

console.log(
  `カタログ網羅 OK  (public コンポーネント ${exported.size - EXEMPT.size} 種すべてに story あり / 対象外 ${EXEMPT.size} 種)`,
);
