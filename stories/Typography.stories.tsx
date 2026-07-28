import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// タイポグラフィのカタログ。#117 でスケールをセマンティック1本に統一した。
// 既定は「セマンティック階層」で、補助スケールは weight を自分で決めたい UI 細部だけに使う。
const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// 正のスケール。size に加えて weight / line-height / letter-spacing を焼き込んであるので、
// これを当てるだけで役割どおりの見た目になり、font-bold 等の併記が要らない。
const ROLES = [
  { cls: 'text-display', label: 'Display · 44 / 1.0 / 800', sample: 'InSession' },
  { cls: 'text-h1', label: 'Heading 1 · 32 / 1.05 / 800', sample: 'Tune in. Catch the vibe.' },
  { cls: 'text-h2', label: 'Heading 2 · 22 / 1.15 / 700', sample: 'アクティブなスペース' },
  { cls: 'text-body', label: 'Body · 16 / 1.5 / 500', sample: '友達と同期して YouTube を観る。' },
  {
    cls: 'text-small',
    label: 'Small · 14 / 1.45 / 500',
    sample: '誰かの再生・一時停止が全員に届く。',
  },
];

export const Roles: Story = {
  render: () => (
    <Section
      title="セマンティック階層 — これが既定"
      note="size に加え weight / line-height / letter-spacing を役割ごとに内包する。文章はすべてこちらを使う。"
    >
      <div className="flex flex-col gap-4">
        {ROLES.map((r) => (
          <div key={r.cls} className="flex items-baseline gap-4">
            <code className="text-xs text-text-faint w-52 shrink-0">{r.label}</code>
            <span className={`${r.cls} text-text`}>{r.sample}</span>
          </div>
        ))}
        <div className="flex items-baseline gap-4">
          <code className="text-xs text-text-faint w-52 shrink-0">
            Label · 11 / 1.0 / 600 / 0.14em
          </code>
          <span className="text-label uppercase text-text-dim">Watch Party</span>
        </div>
      </div>
    </Section>
  ),
};

// 補助スケール。サイズだけを与える下位ユーティリティで、weight は利用側が決める。
const SIZES = [
  { cls: 'text-lg', label: 'lg · 16 / 1.4', use: 'モーダルのタイトル' },
  { cls: 'text-base', label: 'base · 14 / 1.45', use: 'ボタン・入力・設定行のラベル' },
  { cls: 'text-sm', label: 'sm · 12 / 1.4', use: '補助テキスト・ヘルプ・カウンタ' },
  { cls: 'text-xs', label: 'xs · 11 / 1.35', use: 'バッジ・タイムスタンプ・最小のメタ情報' },
];

export const Scale: Story = {
  render: () => (
    <Section
      title="補助スケール — サイズのみ"
      note="weight を自分で決めたい UI 細部で使う。段は 4 つだけ。中間の値が欲しくなったら、セマンティック階層で表現すべき役割が隠れているサイン。"
    >
      <div className="flex flex-col gap-3">
        {SIZES.map((s) => (
          <div key={s.cls} className="flex items-baseline gap-4">
            <code className="text-xs text-text-faint w-36 shrink-0">{s.label}</code>
            <span className={`${s.cls} text-text font-body`}>{s.use}</span>
          </div>
        ))}
      </div>
    </Section>
  ),
};

// text-base(14) と text-small(14)、text-lg(16) と text-body(16) はサイズが同値。
// 違いは weight / line-height を持つかどうかで、その使い分けを実物で見せる。
export const SemanticVsScale: Story = {
  name: '使い分け（同じサイズの2つ）',
  render: () => (
    <Section
      title="同じサイズでも役割が違う"
      note="サイズが重なる段があるのは意図的。文章はセマンティック、weight を自分で決めたい UI 細部は補助スケール。"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <code className="text-xs text-text-faint">14px — text-small（weight 500 を内包）</code>
          <span className="text-small text-text">
            接続が不安定なときは自動で追従を止めて、復帰時に位置を合わせ直す。
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <code className="text-xs text-text-faint">
            14px — text-base（weight は利用側が決める）
          </code>
          <span className="text-base font-bold text-text">スペースを作成</span>
        </div>
        <div className="flex flex-col gap-1">
          <code className="text-xs text-text-faint">16px — text-body（weight 500 / 行間 1.5）</code>
          <span className="text-body text-text">
            同じ動画を、同じタイミングで。再生も一時停止もシークも全員に伝わる。
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <code className="text-xs text-text-faint">16px — text-lg（行間 1.4 のみ）</code>
          <span className="text-lg font-bold text-text">通知の設定</span>
        </div>
      </div>
    </Section>
  ),
};

export const Fonts: Story = {
  render: () => (
    <Section
      title="フォント"
      note="JetBrains Mono を製品フォントとして UI・見出し・本文・ラベル・数値すべてに使う。コンポーネントは font-body だけを使い、font-display / font-mono は同値の別名として残している（#117）。"
    >
      <div className="flex flex-col gap-6">
        <div>
          <code className="text-xs text-text-faint">font-body — 見出しから本文まで</code>
          <p className="font-body text-h2 text-text mt-1">InSession Watch Party</p>
          <p className="font-body text-body text-text mt-1">
            友達と同期して YouTube を観る。誰かの再生・一時停止・シークが全員に届く。
          </p>
        </div>
        <div>
          <code className="text-xs text-text-faint">
            数値・メタ情報も同じフォント（tabular-nums で桁を揃える）
          </code>
          <p className="font-body text-base text-text-dim tabular-nums mt-1">
            12:34 · 8 online · REC
          </p>
        </div>
        <div>
          <code className="text-xs text-text-faint">
            例外: ワードマークだけは font-display を使う（将来 Archivo に差し替える足場）
          </code>
        </div>
      </div>
    </Section>
  ),
};

export const Weights: Story = {
  render: () => (
    <Section
      title="ウェイト"
      note="セマンティック階層は weight を内包するので併記しない。補助スケールと併用するときだけ使う。"
    >
      <div className="flex flex-col gap-2">
        <p className="text-h2 font-semibold text-text">semibold — 600</p>
        <p className="text-h2 font-bold text-text">bold — 700</p>
        <p className="text-h2 font-extrabold text-text">extrabold — 800</p>
      </div>
    </Section>
  ),
};
