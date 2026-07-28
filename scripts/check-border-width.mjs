#!/usr/bin/env node
// 単辺だけの border-* に border-solid を併記したまま、他3辺の幅を 0 にしていない箇所を検出する。
//
// なぜ要るか: `border-b border-solid` と書くと border-style は**4辺すべて**に付く。
// Tailwind のプリフライトを読み込む環境では border-width の既定が 0 に落ちているので
// 下辺だけの線になるが、**プリフライトを使わない消費側では border-width の既定 medium(3px)
// が残り3辺に出て、要素が枠で囲まれて見える**。
//
// 厄介なのは、このバグが DS 自身の Storybook では見えないこと（Storybook はプリフライトを
// 読み込むため）。実際 insession-app 側で AppBar / Modal のフッター / SplitModal のナビ列に
// 3px の枠が出ており、消費側で computed border が [3px 1px 3px 3px] になっていた。
// 目視では捕まえられないので、ここで機械的に止める。
//
// 対処は「他3辺を 0 にする指定を必ず添える」こと:
//   border-b → border-x-0 border-t-0 border-b
//   border-t → border-x-0 border-b-0 border-t
//   border-r → border-y-0 border-l-0 border-r
//   border-l → border-y-0 border-r-0 border-l
//
// ⚠ `border-0` は shorthand なので、単辺指定との勝敗が生成 CSS の出力順で決まる。使わない。

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
const SIDES = { b: ['x-0', 't-0'], t: ['x-0', 'b-0'], r: ['y-0', 'l-0'], l: ['y-0', 'r-0'] };

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(ROOT)) {
  const source = readFileSync(file, 'utf8');
  source.split('\n').forEach((line, index) => {
    if (!line.includes('border-solid')) return;
    // 4辺すべてに幅がある書き方（`border` / `border-2` など）は漏れないので対象外。
    // ⚠ 直前がハイフンのものを除外しないと、色指定の `border-border` の後半が `border` に
    //   マッチして行ごとスキップされる（この取りこぼしを実際に踏んだ）。
    if (/(?<![-\w])border(-\d+)?(?![-\w])/.test(line)) return;
    for (const [side, zeros] of Object.entries(SIDES)) {
      if (!new RegExp(`\\bborder-${side}\\b(?![-\\w])`).test(line)) continue;
      const missing = zeros.filter((zero) => !line.includes(`border-${zero}`));
      if (!missing.length) continue;
      violations.push(
        `${file}:${index + 1} — border-${side} に ${missing.map((m) => `border-${m}`).join(' / ')} が無い\n    ${line.trim().slice(0, 120)}`,
      );
    }
  });
}

if (violations.length) {
  console.error('単辺 border-* の幅漏れ（プリフライト無しの消費側で 3px の枠になる）:\n');
  for (const violation of violations) console.error(`  - ${violation}`);
  console.error('\n他3辺を 0 にする指定を添えてください（border-0 は使わない）。');
  process.exit(1);
}

console.log('check:border-width — 単辺 border-* の幅漏れなし');
