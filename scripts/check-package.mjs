#!/usr/bin/env node
/* publish される tarball の中身が意図どおりかを機械的に検査する。
 *
 * ── 何を防ぐための検査か ───────────────────────────────
 * `files` / `exports` / ビルド出力先のどれかがズレると、「publish は成功したのに消費側で
 * 解決できない」が起きる。型検査もビルドも lint も緑のまま通り、気づくのは publish 後に
 * 消費側が `Cannot find module '@insession/design-system/theme.css'` で落ちたときになる。
 *
 * かつてこの検査は ci.yml にインラインの node -e として埋まっていた。CI でしか実行できない
 * ため手元で再現できず、`pnpm verify` の一部にもできなかったので、スクリプトへ切り出した。
 *
 * ── 検査すること ──────────────────────────────────
 *   1. 配布に必須のファイルが tarball に入っていること。
 *   2. package.json の `exports` が指すファイルが実際に tarball に入っていること
 *      （exports にエントリを足して files に足し忘れる、が起きうる）。
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// 消費側が必ず解決しにくる入口。ここが欠けると publish 後に初めて壊れる。
const REQUIRED = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/styles.css',
  'src/styles/theme.css',
  'src/styles/base.css',
  'src/styles/components.css',
  'package.json',
  // 公開パッケージなのでライセンス本文の同梱は必須。
  'LICENSE',
];

let packed;
try {
  const raw = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: ROOT,
    encoding: 'utf8',
    // npm は進捗を stderr に出す。JSON は stdout だけを見る。
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  packed = JSON.parse(raw);
} catch (err) {
  fail([`npm pack --dry-run に失敗した: ${err.message}`, '先に `pnpm build` を実行すること。']);
}

const files = packed[0].files.map((f) => f.path);
const fileSet = new Set(files);

const problems = [];

const missing = REQUIRED.filter((f) => !fileSet.has(f));
if (missing.length) {
  problems.push('同梱されていない必須ファイル:');
  for (const f of missing) problems.push(`  ${f}`);
}

/* ---- exports が指す先が実在するか ---- */
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
for (const [key, value] of Object.entries(pkg.exports ?? {})) {
  // 文字列 or 条件付き（{ types, import }）の両方を平らにする。
  const targets = typeof value === 'string' ? [value] : Object.values(value);
  for (const target of targets) {
    if (typeof target !== 'string') continue;
    const rel = target.replace(/^\.\//, '');
    if (!fileSet.has(rel)) problems.push(`exports["${key}"] が指す ${rel} が tarball に無い`);
  }
}

if (problems.length) {
  problems.push('', `実際の中身(${files.length} 件):`, ...files.map((f) => `  ${f}`));
  fail(problems);
}

console.log(`パッケージの中身 OK (${files.length} ファイル)`);

function fail(lines) {
  console.error('\nパッケージ内容の検査に失敗しました。\n');
  for (const l of lines) console.error(l);
  console.error('');
  process.exit(1);
}
