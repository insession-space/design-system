#!/usr/bin/env node
/* twMerge 展開（#137 の全プリミティブ化）の回帰ネット。
 *
 * ── 何を守るか ─────────────────────────────────────
 * これまで各コンポーネントは `${BASE} ${VARIANT} ${className}`.trim() の**単純連結**で class を
 * 組んでいた。連結は並びを変えるだけで、同一プロパティのユーティリティが2つ出ても「配布 CSS の
 * 出力順」で一方が効くだけ（両方 class 属性に残る）。これを twMerge へ置き換えると、同一プロパティの
 * 重複は**後勝ちで1つに畳まれる**。畳まれた結果が「従来の配布 CSS で効いていた側」と食い違うと、
 * 型検査もビルドも緑のまま**見た目だけが静かに変わる**（button.tsx の ghost 横詰めがまさにこれで、
 * あちらは実測値を固定して回避している）。
 *
 * ── 検査方法 ───────────────────────────────────────
 * 各コンポーネントの class 文字列リテラル（BASE 定数・VARIANT/SIZE などの Record 値・JSX 内の
 * 素の literal）を1つずつ twMerge に通し、**入力と出力でクラス集合が変わらない**ことを確かめる。
 * 変わる＝そのリテラル**単体の中に**同一プロパティの重複があり、twMerge が畳んでいる、という意味。
 * その場合はレビューが要る（意図した重複＝二度書きのミスか、順序依存のどちらか）。
 *
 * ⚠ これはリテラル**単体**の検査。複数の定数を跨いだ重複（BASE の px-2 と SIZE の px-4 が
 * 別リテラルに分かれている等）はここでは捕まらない — その手の合成は各コンポーネントの
 * 組み立てロジックを読んで担保する（button.tsx の EXPECTED_PAD 方式）。ここが緑でも
 * 「1リテラル内に自己矛盾は無い」ことしか言えない点に注意。 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { twMerge } from '../src/lib/tw-merge.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['src/components', 'src/ui-kit', 'src/icons'];

// クラス列に見える文字列だけを対象にする。Tailwind ユーティリティは英小文字・数字・`-` に
// `:` `/` `[` `]` `(` `)` `.` `!` `#` `,` 程度で構成される。日本語コメントや任意テキストを弾く。
const CLASSLIST_RE = /^[a-z0-9][a-z0-9:/[\]().!#,_-]*(?:\s+[a-z0-9][a-z0-9:/[\]().!#,_-]*)*$/;
// 少なくとも2トークンあり、かつ Tailwind っぽい接頭辞を含むものだけ（誤検出を減らす）。
const LOOKS_TW =
  /(?:^|\s)(?:flex|grid|inline|bg-|text-|border|rounded|px-|py-|p-|m-|gap-|font-|shadow|ring|outline|hover:|focus|data-|size-|h-|w-|min-|max-|absolute|relative|fixed|items-|justify-|transition|duration|ease-|opacity|cursor|select-|leading-|tracking-)/;

function extractLiterals(src) {
  const out = [];
  // 単一引用符・バッククォート（テンプレートは ${...} を含むものを除く＝静的リテラルのみ）の文字列。
  for (const m of src.matchAll(/'([^'\\]*)'/g)) out.push(m[1]);
  for (const m of src.matchAll(/`([^`$\\]*)`/g)) out.push(m[1]);
  return out;
}

const findings = [];
let scanned = 0;

for (const dir of DIRS) {
  for (const file of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.tsx'))) {
    const rel = join(dir, file);
    const src = readFileSync(join(ROOT, rel), 'utf8');
    for (const lit of extractLiterals(src)) {
      const s = lit.trim();
      if (!s || !s.includes(' ')) continue;
      if (!CLASSLIST_RE.test(s)) continue;
      if (!LOOKS_TW.test(s)) continue;
      scanned++;
      const merged = twMerge(s);
      const before = s.split(/\s+/).filter(Boolean);
      const after = merged.split(/\s+/).filter(Boolean);
      if (after.length !== before.length) {
        const dropped = before.filter((c) => !after.includes(c));
        findings.push({ rel, dropped, lit: s });
      }
    }
  }
}

console.log(`class リテラルを ${scanned} 本走査`);
if (findings.length > 0) {
  console.error(
    `\n❌ twMerge が畳むリテラルがある（${findings.length} 件）— 同一プロパティの重複を確認せよ\n`,
  );
  for (const f of findings) {
    console.error(`- ${f.rel}\n    畳まれる: ${f.dropped.join(', ')}\n    リテラル: ${f.lit}\n`);
  }
  process.exit(1);
}
console.log('✅ どの class リテラルにも1リテラル内の同一プロパティ重複は無い');
