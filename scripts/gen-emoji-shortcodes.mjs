#!/usr/bin/env node
/* `:` ショートコード補完用の絵文字辞書を生成する（#190）。
 *
 * ── なぜ生成物をコミットするのか ─────────────────────────
 * 辞書の素は `emoji-picker-react` が同梱する `dist/data/emojis-en.json` だが、これは
 * **公開 API ではない内部パス**（package.json の exports には出ていない）。実行時にここへ
 * import すると、依存のマイナー更新でファイル配置が変わっただけで壊れる。しかも
 * `dist/dataUtils/*.js` は既に実体が無くなっており（esm バンドルへ畳まれている）、内部構造が
 * 実際に動くことは確認済み。
 *
 * そこで **実行時ではなく「生成時」に一度だけ内部パスを読み、結果を通常の .ts としてコミット
 * する**。実行時の内部依存は消え、依存を上げたときはこのスクリプトを再実行して差分をレビュー
 * すればよい（壊れるなら生成の時点で気づける）。
 *
 * 使い方: node scripts/gen-emoji-shortcodes.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'node_modules', 'emoji-picker-react', 'dist', 'data', 'emojis-en.json');
const OUT = join(ROOT, 'src', 'components', 'emoji-shortcodes.ts');

const data = JSON.parse(readFileSync(SRC, 'utf8'));

// unified("1f1e6-1f1e8" 等)を実際の絵文字文字列へ。`-` 区切りは合成絵文字。
function toEmoji(unified) {
  return String.fromCodePoint(...unified.split('-').map((p) => Number.parseInt(p, 16)));
}

// 正式名 → ショートコード。英数字以外は `_` に畳み、連続と前後を落とす。
function toShortcode(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// `n` から「代表名」を選ぶ。
//
// ⚠ `n` は **順不同のキーワード集合**で、正式名がどこに入るかは保証されない。実データ:
//     1f600 😀 ["face","grin","grinning face"]              → 最後が正式名
//     1f525 🔥 ["fire","tool","flame"]                       → 最初が正式名
//     1f9fd 🧽 ["sponge","porous","cleaning","absorbing"]    → 最初が正式名
//     1f9cf 🧏 ["ear","deaf","hear","deaf person","accessibility"] → 中ほどが正式名
// 「最後を採る」と 🔥 が `flame`、🧽 が `absorbing`、🧏 が `accessibility` になる（実際に一度
// そうなった）。「最初を採る」と 😀 が `face` になり、多数の絵文字が同じ名前へ潰れる。
//
// 正式名は具体的なぶん **複数語になりやすく**、単なるキーワードは1語であることが多い。そこで
// まず「語数が最多のもの」を代表名にする（😀 の "grinning face" / 🧏 の "deaf person"）。
//
// ⚠ 語数だけでは決まらない — 候補が全て1語の絵文字が多くある。そこを「先頭」で決めると
// 🤖 が `face`、🚀 が `space`、🤝 が `hand` になった（実測）。先頭が代表とは限らないうえ、
// `face` のような汎用語を1つの絵文字が握ると、他の絵文字がその名前を永久に取れなくなる
// （実際に 🙏 ✨ ⭐ が名前を奪われて辞書から丸ごと消えた）。
// そこで**同語数なら「その語を候補に持つ絵文字が少ない = 固有な語」を優先**する。
// `face` は数百の絵文字が持つので負け、`robot` は 🤖 しか持たないので勝つ。
function makePickCanonical(nameFrequency) {
  return function pickCanonical(names) {
    let best = names[0];
    let bestWords = best.trim().split(/\s+/).length;
    let bestFreq = nameFrequency.get(best.toLowerCase()) ?? 1;
    for (const name of names.slice(1)) {
      const words = name.trim().split(/\s+/).length;
      const freq = nameFrequency.get(name.toLowerCase()) ?? 1;
      // 語数が多い方が強い。同数なら、より固有（出現数が少ない）な方が強い。
      // どちらも同じなら更新しない = 先頭に近い方が残る。
      if (words > bestWords || (words === bestWords && freq < bestFreq)) {
        best = name;
        bestWords = words;
        bestFreq = freq;
      }
    }
    return best;
  };
}

// ── 名前の取り合いは「単純な絵文字」に勝たせる ────────────────────
// ショートコードは一意にする（同じ `:fire:` が2つあっても選べない）ので、衝突したら先に来た方が
// 勝つ。ところがデータの並びはカテゴリ順なので、people カテゴリの 🧑‍🚒（`n` の先頭が "fire"）が
// 🔥 より先に現れて `fire` を奪う — 実際にそうなった。
// 単一コードポイントの絵文字ほど基本的で、短い名前にふさわしい。ZWJ で人物や職業を合成した
// 絵文字（🧑‍🚒 = 1f9d1 200d 1f692）は後回しにする。
const candidates = [];
for (const [category, list] of Object.entries(data.emojis)) {
  if (category === 'custom' || !Array.isArray(list)) continue;
  for (const e of list) {
    if (!Array.isArray(e.n) || e.n.length === 0 || typeof e.u !== 'string') continue;
    candidates.push(e);
  }
}
// 安定ソート（Array#sort は ES2019 以降 stable）なので、同じ複雑さのものは元の並び順を保つ。
candidates.sort((a, b) => a.u.split('-').length - b.u.split('-').length);

// 「その語を候補に持つ絵文字が何件あるか」。代表名の固有性判定に使う（pickCanonical 参照）。
const nameFrequency = new Map();
for (const e of candidates) {
  for (const name of new Set(e.n.map((n) => n.toLowerCase()))) {
    nameFrequency.set(name, (nameFrequency.get(name) ?? 0) + 1);
  }
}
const pickCanonical = makePickCanonical(nameFrequency);

// ── 自動導出では決まらない少数の代表名 ─────────────────────────
// 上の2段（語数 → 固有性）で大半は正しくなるが、「共有されている語のほうが基本名」という逆の
// ケースだけは原理的に解けない。🔥 の "fire" は消防士系の絵文字も持つので固有性で負け、
// 🔥 に固有の "flame" が選ばれてしまう（🚀 の "rocket" が宇宙飛行士系に負けるのも同じ形）。
//
// ⚠ **これは網羅リストではない。** 不自然な名前に気づいたらここへ足す、という運用のもの。
// 検索そのものは keywords 側で拾えている（🚀 は代表名が `space` でも `:rocket` でヒットした）
// ので、ここで直しているのは**表示される名前の自然さ**だけ。
const CANONICAL_OVERRIDES = new Map([
  ['🚀', 'rocket'], // 自動では "space"（"rocket" は宇宙飛行士系と共有していて負ける）
  ['🔥', 'fire'], // 自動では "flame"（"fire" は消防士系と共有していて負ける）
  ['🧑‍🚒', 'firefighter'], // 自動では "firetruck"（人物なのに消防車の名前になる。消防車は 🚒 = fire_engine）
  ['🤝', 'handshake'], // 自動では "meeting"
  ['📣', 'megaphone'], // 自動では "cheering"
  ['☀️', 'sun'], // 自動では "rays"
  ['💤', 'zzz'], // 自動では "good_night"
  ['💻', 'laptop'], // 自動では "pc"
]);

const seen = new Set();
const rows = [];

{
  // 上書きは無条件に勝たせたいので、通常の走査より先に確定させる（後勝ちだと、同じ名前を
  // 別の絵文字が先に取ってしまい上書きが黙って無視される）。
  const overrideTargets = new Map();
  for (const e of candidates) {
    const emoji = toEmoji(e.u);
    if (CANONICAL_OVERRIDES.has(emoji)) overrideTargets.set(emoji, e);
  }
  const unmatched = [...CANONICAL_OVERRIDES.keys()].filter((k) => !overrideTargets.has(k));
  if (unmatched.length > 0) {
    // 依存を上げてデータが変わり、上書き対象の絵文字が消えた/表記が変わった場合。黙って
    // 無視すると「上書きしたつもりで効いていない」状態になるので落とす。
    console.error(`上書き対象の絵文字がデータに見つかりません: ${unmatched.join(' ')}`);
    process.exit(1);
  }

  for (const [emoji, e] of overrideTargets) {
    const shortcode = toShortcode(CANONICAL_OVERRIDES.get(emoji));
    seen.add(shortcode);
    const keywords = e.n
      .map((k) => k.toLowerCase())
      .filter((k) => k && !shortcode.includes(k.replace(/[^a-z0-9]+/g, '_')));
    rows.push([emoji, shortcode, [...new Set(keywords)].join(' ')]);
  }

  for (const e of candidates) {
    const names = e.n;
    if (CANONICAL_OVERRIDES.has(toEmoji(e.u))) continue; // 上で確定済み
    const canonical = pickCanonical(names);
    const shortcode = toShortcode(canonical);
    if (!shortcode || seen.has(shortcode)) continue;
    seen.add(shortcode);
    // 検索キーは代表名以外のキーワード。ショートコードに既に含まれる語は落とす（同じ語を
    // 2箇所に持たない ＝ 辞書のサイズを無駄に増やさない）。
    const keywords = names
      .filter((k) => k !== canonical)
      .map((k) => k.toLowerCase())
      .filter((k) => k && !shortcode.includes(k.replace(/[^a-z0-9]+/g, '_')));
    rows.push([toEmoji(e.u), shortcode, [...new Set(keywords)].join(' ')]);
  }
}

rows.sort((a, b) => a[1].localeCompare(b[1]));

const body = rows.map(([emoji, code, kw]) => `  ['${emoji}', '${code}', '${kw}'],`).join('\n');

const out = `// ⚠ このファイルは自動生成物。手で編集しない。
// 生成: node scripts/gen-emoji-shortcodes.mjs
// 素: emoji-picker-react の dist/data/emojis-en.json（内部パス。理由は生成スクリプトのコメント参照）
//
// \`:\` ショートコード補完（#190）の辞書。1件 = [絵文字, ショートコード, 検索用キーワード]。
// ショートコードは Unicode の正式名を snake_case にしたもので、**Slack / GitHub の綴りとは
// 一致しないものがある**。ただし確定時に本文へ入るのは絵文字そのもの（ショートコード文字列は
// 残らない）ため、綴りの違いが送信結果に出ることはない — ここはあくまで検索キー。

export type EmojiShortcodeEntry = readonly [emoji: string, shortcode: string, keywords: string];

export const EMOJI_SHORTCODES: readonly EmojiShortcodeEntry[] = [
${body}
];
`;

writeFileSync(OUT, out);

// ⚠ 生成物もコミットする以上 Biome の整形対象に入る。ここで整形しておかないと、キーワードが
// 長い行（1行の上限を超えるもの）が `pnpm check` で落ちる — 生成のたびに手で整形するのは
// 必ず忘れるので、生成の一部として実行する。
execFileSync('pnpm', ['exec', 'biome', 'format', '--write', OUT], {
  cwd: ROOT,
  stdio: ['ignore', 'ignore', 'inherit'],
});

console.log(`生成しました: ${rows.length} 件 → ${OUT}`);
