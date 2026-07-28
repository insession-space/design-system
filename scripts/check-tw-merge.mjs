#!/usr/bin/env node
/* DS 専用 tailwind-merge インスタンス（src/lib/tw-merge.ts）の分類と、Button の出力を検査する（#137）。
 *
 * ── 何を防ぐための検査か ───────────────────────────────
 * tailwind-merge は既定テーマ（素の Tailwind）のスケールしか知らない。DS のカスタムトークン名が
 * どのグループへ落ちるかは **設定次第で静かに変わる**:
 *
 *   - `text-body` を font-size として教えないと、`text-*` の catch-all で **color に誤分類**され、
 *     `text-accent` と同じグループになって片方が消える。
 *   - `rounded-pill` を radius として教えないと **未知のクラス**として素通しされ、
 *     `rounded-md` と排他にならない（#517 の radius 契約が壊れる）。
 *
 * どちらも型検査もビルドも lint も緑のまま通り、気づくのは消費側で見た目が崩れたときになる。
 * しかも「たぶんこう分類されるはず」という推測が当たっているかは、実際に twMerge を呼ぶ以外に
 * 確かめる手段が無い。だから決定論的なチャネル（CI）で実測する。
 *
 * ── 検査すること ──────────────────────────────────
 *   1. theme.css のトークンと tw-merge.ts の theme 拡張がズレていないか
 *      （トークンを足したのに tw-merge へ足し忘れる、が起きうる）。
 *   2. グループ分類の実測: font-size と color が別グループか、DS 固有名が正しい側に落ちるか。
 *   3. Button の実出力: 消費側の className が `!` なしで勝つか / 既存の見た目が変わっていないか。
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { twMerge } from '../src/lib/tw-merge.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const log = [];

function expect(label, actual, expected) {
  const ok = actual === expected;
  log.push(`${ok ? '  ok' : '  NG'}  ${label}\n        → ${actual}`);
  if (!ok) errors.push(`${label}\n  期待: ${expected}\n  実際: ${actual}`);
}

/* ---- 1. theme.css のトークンと tw-merge.ts の拡張がズレていないか ---- */

// ⚠ コメントを先に落とす。theme.css は「かつて --tracking-label: 0.14em だった」のような
// **トークン宣言の形をした説明文**をコメント中に持つので、素朴に走査すると存在しない段を検出する。
const themeCss = readFileSync(join(ROOT, 'src', 'styles', 'theme.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);
const twMergeSrc = readFileSync(join(ROOT, 'src', 'lib', 'tw-merge.ts'), 'utf8');

// theme.css の @theme ブロックから `--<ns>-<name>:` を拾う。`--text-base--line-height` のような
// 修飾子付きは段そのものではないので除く。値が `initial`（= 既定段の削除）のものも段ではない。
function tokensOf(ns) {
  const out = new Set();
  for (const m of themeCss.matchAll(new RegExp(`^\\s*--${ns}-([a-z0-9-]+):\\s*([^;]+);`, 'gm'))) {
    const [, name, value] = m;
    if (name.includes('--')) continue;
    if (value.trim() === 'initial') continue;
    out.add(name);
  }
  return out;
}

// tailwind-merge の既定テーマが既に知っている段。ここに乗る名前は拡張不要。
const TSHIRT = new Set([
  '3xs',
  '2xs',
  'xs',
  'sm',
  'base',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  'none',
  'full',
]);

// tw-merge.ts の extend.theme.<ns> に書いた名前を読む（実体は同ファイルの1箇所だけなので素朴でよい）。
function extendedOf(ns) {
  const m = twMergeSrc.match(new RegExp(`\\n\\s+${ns}: \\[([^\\]]*)\\]`, 's'));
  if (!m) return new Set();
  return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
}

// theme.css 側にあって tailwind-merge が知らない段は、必ず tw-merge.ts が拾っていること。
for (const ns of ['text', 'radius', 'shadow', 'ease', 'tracking']) {
  const declared = extendedOf(ns);
  const missing = [...tokensOf(ns)].filter((t) => !TSHIRT.has(t) && !declared.has(t));
  // ease は既定の in / out / in-out、tracking は tighter…widest も既定にある。
  const defaults = {
    ease: ['in', 'out', 'in-out', 'linear', 'initial'],
    tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'],
    shadow: [],
    radius: [],
    text: [],
  };
  const rest = missing.filter((t) => !defaults[ns].includes(t));
  if (rest.length > 0) {
    errors.push(
      `theme.css の --${ns}-* に tw-merge.ts が知らない段がある: ${rest.join(', ')}\n` +
        `  src/lib/tw-merge.ts の extend.theme.${ns} へ足すこと（足さないと衝突解決の対象から外れる）。`,
    );
  }
}

/* ---- 2. グループ分類の実測 ---- */

log.push('[分類] text-* が font-size と color の2グループに分かれているか');
// 色は色同士だけで畳む。font-size と混ざらない。
expect('text-info → text-accent（色は後勝ち）', twMerge('text-info', 'text-accent'), 'text-accent');
expect(
  'text-base + text-accent（別グループ。両方残る）',
  twMerge('text-base', 'text-accent'),
  'text-base text-accent',
);
expect(
  'text-accent + text-base（順序を変えても両方残る）',
  twMerge('text-accent', 'text-base'),
  'text-accent text-base',
);
expect('text-base → text-sm（font-size は後勝ち）', twMerge('text-base', 'text-sm'), 'text-sm');
// DS のセマンティック段。教えていないと color 側へ落ち、text-accent を消してしまう。
expect(
  'text-body + text-accent（セマンティック段も font-size）',
  twMerge('text-body', 'text-accent'),
  'text-body text-accent',
);
expect('text-body → text-small', twMerge('text-body', 'text-small'), 'text-small');
expect('text-label → text-h2', twMerge('text-label', 'text-h2'), 'text-h2');
expect('text-text-dim → text-accent', twMerge('text-text-dim', 'text-accent'), 'text-accent');

log.push('[分類] radius / shadow / border / bg / font');
expect(
  'rounded-md → rounded-pill（排他 #517）',
  twMerge('rounded-md', 'rounded-pill'),
  'rounded-pill',
);
expect(
  'rounded-pill → rounded-md（排他 #517）',
  twMerge('rounded-pill', 'rounded-md'),
  'rounded-md',
);
expect('rounded-card → rounded-chip', twMerge('rounded-card', 'rounded-chip'), 'rounded-chip');
expect(
  'shadow-soft → shadow-focus（box-shadow 同士）',
  twMerge('shadow-soft', 'shadow-focus'),
  'shadow-focus',
);
expect(
  'shadow-focus + rounded-pill（別プロパティ）',
  twMerge('shadow-focus', 'rounded-pill'),
  'shadow-focus rounded-pill',
);
expect(
  'border-transparent → border-text（border-color は後勝ち #58）',
  twMerge('border-transparent', 'border-text'),
  'border-text',
);
expect(
  'border-2 + border-text（幅と色は別グループ）',
  twMerge('border-2', 'border-text'),
  'border-2 border-text',
);
expect('bg-fill → bg-accent', twMerge('bg-fill', 'bg-accent'), 'bg-accent');
expect(
  'font-body + font-bold（family と weight は別グループ）',
  twMerge('font-body', 'font-bold'),
  'font-body font-bold',
);
expect('font-semibold → font-bold', twMerge('font-semibold', 'font-bold'), 'font-bold');
expect('ease-spring → ease-linear', twMerge('ease-spring', 'ease-linear'), 'ease-linear');
expect('px-[22px] → px-3（消費側の値が勝つ）', twMerge('px-[22px]', 'px-3'), 'px-3');
expect('py-3 → py-1.5', twMerge('py-3', 'py-1.5'), 'py-1.5');
// modifier が違えば別物として両方残る（BASE の data-disabled:* が variant を消さない）。
expect(
  'data-disabled:bg-surface-3 + bg-accent（modifier 違いは別グループ）',
  twMerge('data-disabled:bg-surface-3', 'bg-accent'),
  'data-disabled:bg-surface-3 bg-accent',
);

log.push('[分類] important 接尾辞（消費側に既にある `!` が壊れないか）');
// ⚠ **実測の結論: tailwind-merge は `!` 付きと素のクラスを畳まない。**
// 衝突キーが `{importantModifier}{variantModifiers}{classGroupId}` で組まれており、
// important の有無まで含めて別グループとして扱われる（意図的な設計。`!px-3` と `px-3` は
// 「強制したい値」と「既定値」として共存しうるため）。
// したがって `text-accent!` を渡すと variant 側の `text-info` は **class 属性に残る**。
// それでも描画は正しい — important は同じ utilities レイヤーで常に最強なので、
// 並び順に関係なく `text-accent!` が勝つ。つまり **消費側の既存の `!` は壊れないし、
// 効きすぎもしない**（#137 の受け入れ条件4）。
// そして `!` を外せば同じグループへ落ちて DS 側が畳まれる = 消費側は `!` を掃除できる。
expect(
  'text-info + text-accent!（`!` は別グループ。両方残るが important が勝つ）',
  twMerge('text-info', 'text-accent!'),
  'text-info text-accent!',
);
expect(
  'text-accent! + text-accent（`!` の有無で別グループ）',
  twMerge('text-accent!', 'text-accent'),
  'text-accent! text-accent',
);
expect('text-base + text-base!', twMerge('text-base', 'text-base!'), 'text-base text-base!');
expect('px-[22px] + px-3!', twMerge('px-[22px]', 'px-3!'), 'px-[22px] px-3!');
// `!` 同士なら畳まれる。
expect('px-[22px]! → px-3!（`!` 同士は後勝ち）', twMerge('px-[22px]!', 'px-3!'), 'px-3!');

/* ---- 3. Button の実出力 ---- */

// button.tsx と同じ組み立てを再現する（本体を import すると React / JSX の解決が要るため、
// 定数だけをソースから読み取って突き合わせる。定数が変わればここも自然に追随する）。
const buttonSrc = readFileSync(join(ROOT, 'src', 'components', 'button.tsx'), 'utf8');
function constOf(name) {
  const m = buttonSrc.match(new RegExp(`const ${name} =\\s*\\n?\\s*'([^']*)'`));
  if (!m) throw new Error(`button.tsx から ${name} を読めなかった`);
  return m[1];
}
function recordOf(name) {
  const m = buttonSrc.match(new RegExp(`const ${name}: Record<[^>]+> = \\{([\\s\\S]*?)\\n\\};`));
  if (!m) throw new Error(`button.tsx から ${name} を読めなかった`);
  const out = {};
  for (const e of m[1].matchAll(/(\w+):\s*\n?\s*'([^']*)'/g)) out[e[1]] = e[2];
  return out;
}
const BASE = constOf('BASE');
const VARIANT = recordOf('VARIANT');
const SIZE = recordOf('SIZE');
const GHOST_PAD = recordOf('GHOST_PAD');

function button(variant, size, className = '', { pill = false } = {}) {
  const pad = variant === 'ghost' ? `${SIZE[size]} ${GHOST_PAD[size]}` : SIZE[size];
  const isLive = variant === 'live' || variant === 'join';
  const radius = pill || isLive ? 'rounded-pill' : 'rounded-md';
  return twMerge(BASE, radius, VARIANT[variant], pad, className);
}
const classesOf = (s) => new Set(s.split(' ').filter(Boolean));
function has(label, cls, ...want) {
  const set = classesOf(cls);
  const missing = want.filter((w) => !set.has(w));
  log.push(`${missing.length === 0 ? '  ok' : '  NG'}  ${label}`);
  if (missing.length > 0)
    errors.push(`${label}\n  出力に無い: ${missing.join(', ')}\n  実際: ${cls}`);
}
function lacks(label, cls, ...unwanted) {
  const set = classesOf(cls);
  const found = unwanted.filter((w) => set.has(w));
  log.push(`${found.length === 0 ? '  ok' : '  NG'}  ${label}`);
  if (found.length > 0)
    errors.push(`${label}\n  残ってはいけない: ${found.join(', ')}\n  実際: ${cls}`);
}

log.push('[Button] 受け入れ条件（#137）');
const ghostAccent = button('ghost', 'md', 'text-accent');
has('ghost + text-accent → text-accent が残る', ghostAccent, 'text-accent');
lacks('ghost + text-accent → text-info が消える', ghostAccent, 'text-info');

const mdPad = button('primary', 'md', 'px-3 py-1.5 text-base');
has('md + px-3 py-1.5 → 消費側が勝つ', mdPad, 'px-3', 'py-1.5');
lacks('md + px-3 py-1.5 → DS 側の padding が消える', mdPad, 'px-[22px]', 'py-3');
// 消費側に既にある `!`（insession-app の media-tabs / playlist-panel / player-card）。
// `!` は別グループなので DS 側のクラスは class 属性に残るが、important が常に勝つため
// 描画は従来どおり = **今回の変更で壊れも効きすぎもしない**（#137 の受け入れ条件4）。
const mdBang = button('primary', 'md', 'px-3! py-1.5! text-base!');
has(
  'md + px-3! py-1.5! text-base! → important 付きがそのまま残る',
  mdBang,
  'px-3!',
  'py-1.5!',
  'text-base!',
);
has('md + `!` 付き → DS 側も残る（important が勝つので描画は不変）', mdBang, 'px-[22px]', 'py-3');

const ghostBang = button('ghost', 'md', 'text-accent!');
has('ghost + text-accent! → text-accent! が残る', ghostBang, 'text-accent!');
has(
  'ghost + text-accent! → text-info も残る（important が勝つので描画は不変）',
  ghostBang,
  'text-info',
);

const secondary = button('secondary', 'md');
has('secondary の 2px アウトライン（#58）', secondary, 'border-2', 'border-text', 'text-text');
lacks('secondary に border-transparent が混ざらない（#58）', secondary, 'border-transparent');

const live = button('live', 'md');
has('live は常に pill（#517）', live, 'rounded-pill');
lacks('live に rounded-md が混ざらない（#517）', live, 'rounded-md');
has(
  'pill prop で pill になる（#517）',
  button('primary', 'md', '', { pill: true }),
  'rounded-pill',
);
lacks(
  'pill prop で rounded-md が消える（#517）',
  button('primary', 'md', '', { pill: true }),
  'rounded-md',
);
// disabled の面は modifier 付きなので variant に潰されない。
has(
  'data-disabled の沈んだ面が残る',
  button('primary', 'md'),
  'data-disabled:bg-surface-3',
  'data-disabled:text-text-dim',
  'data-disabled:border-transparent',
);

log.push('[Button] 既存の見た目が変わらないこと（全 variant × 全 size）');
// 従来（単純連結 + 配布 CSS の出力順で後勝ち）と同じ描画になるかを、
// 「同一プロパティのユーティリティがちょうど1つだけ出ているか」で確かめる。
const PROP_RE = [
  ['padding-x', /^px-/],
  ['padding-y', /^py-/],
  ['font-size', /^text-(xs|sm|base|lg|display|h1|h2|body|small|label)$/],
  ['border-radius', /^rounded-/],
  ['font-weight', /^font-(thin|light|normal|medium|semibold|bold|extrabold|black)$/],
];
for (const variant of Object.keys(VARIANT)) {
  for (const size of Object.keys(SIZE)) {
    const cls = [...classesOf(button(variant, size))].filter((c) => !c.includes(':'));
    for (const [prop, re] of PROP_RE) {
      const hits = cls.filter((c) => re.test(c));
      if (hits.length !== 1) {
        errors.push(
          `${variant}/${size}: ${prop} が ${hits.length} 個（${hits.join(', ') || 'なし'}）`,
        );
      }
    }
  }
}
// 出荷済みの実値。従来の配布 CSS で実際に勝っていた組み合わせ（ghost の横詰めは xs のみ実効）。
const EXPECTED_PAD = {
  xs: ['px-3', 'py-1.5', 'text-xs'],
  sm: ['px-4', 'py-2', 'text-sm'],
  md: ['px-[22px]', 'py-3', 'text-base'],
  lg: ['px-7', 'py-3.5', 'text-base'],
};
for (const size of Object.keys(SIZE)) {
  has(`primary/${size} の padding が従来どおり`, button('primary', size), ...EXPECTED_PAD[size]);
  const ghostExpected = size === 'xs' ? ['px-3.5', 'py-1.5', 'text-xs'] : EXPECTED_PAD[size];
  has(`ghost/${size} の padding が従来どおり`, button('ghost', size), ...ghostExpected);
}

/* ---- 結果 ---- */

console.log(log.join('\n'));
if (errors.length > 0) {
  console.error(`\n❌ tailwind-merge の検査に失敗した（${errors.length} 件）\n`);
  for (const e of errors) console.error(`- ${e}\n`);
  process.exit(1);
}
console.log('\n✅ tailwind-merge: 分類と Button の出力は契約どおり');
