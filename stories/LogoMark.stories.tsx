import { BrandImage, LogoMark, type LogoMarkVariant } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// ロゴマーク(LOOPHUB ブランドの「リング+3ドット」マーク。loophub #724)。variant='row' は横並び
// マーク+ワードマーク、variant='cluster' は単体マーク(プロダクト切替チップ等の小さな箇所向け)。
const meta: Meta<typeof LogoMark> = {
  title: 'Data Display/LogoMark',
  component: LogoMark,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof LogoMark>;

const VARIANTS: LogoMarkVariant[] = ['row', 'cluster'];
const SIZES = [16, 20, 32, 48];

export const VariantsBySizes: Story = {
  render: () => (
    <Section
      title="全 variant × サイズ違い"
      note="row(既定)=マーク単体(ワードマークなし) / cluster=単体マーク。サイズ 16/20(既定)/32/48。"
    >
      <div className="flex flex-col gap-6">
        {VARIANTS.map((variant) => (
          <div key={variant} className="flex items-center gap-6">
            <span className="w-16 shrink-0 text-base font-semibold text-text-dim">{variant}</span>
            {SIZES.map((size) => (
              <LogoMark key={size} variant={variant} size={size} />
            ))}
          </div>
        ))}
      </div>
    </Section>
  ),
};

export const WithWordmark: Story = {
  render: () => (
    <Section
      title="ワードマーク付き(showWordmark)"
      note="row variant で showWordmark=true にするとワードマーク(font-display)を並べる。wordmarkSize 省略時は size から比例算出。"
    >
      <div className="flex flex-col gap-4">
        <LogoMark size={20} showWordmark />
        <LogoMark size={32} showWordmark />
        <LogoMark size={20} showWordmark wordmarkSize={24} />
      </div>
    </Section>
  ),
};

export const CustomWordmarkAndMark: Story = {
  render: () => (
    <Section
      title="ブランドの差し替え(wordmark / mark)"
      note="wordmark は既定 'LOOPHUB' だが props で差し替えられる(#74)。DS は2プロダクト(InSession / loophub)で共有するので、新しい呼び出しは必ず wordmark を明示する。mark を渡せばマーク自体(SVG / 画像)も差し替えられ、間隔と揃えだけを再利用できる。"
    >
      <div className="flex flex-col gap-4">
        <LogoMark size={24} showWordmark wordmark="INSESSION" />
        <LogoMark
          size={24}
          showWordmark
          wordmark={<span className="text-accent">INSESSION</span>}
        />
        <LogoMark
          size={24}
          showWordmark
          wordmark="INSESSION"
          mark={
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-accent text-sm font-bold text-on-accent">
              iS
            </span>
          }
        />
      </div>
    </Section>
  ),
};

// data: URI の SVG。ストーリー用の作り物で、ライト/ダークで別画像が出ることだけを示す。
const DARK_LOGO =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="28"><rect width="120" height="28" rx="6" fill="%233bf7a4"/><text x="60" y="19" font-family="sans-serif" font-size="13" font-weight="700" text-anchor="middle" fill="%23081014">DARK LOGO</text></svg>';
const LIGHT_LOGO =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="28"><rect width="120" height="28" rx="6" fill="%237b2ff7"/><text x="60" y="19" font-family="sans-serif" font-size="13" font-weight="700" text-anchor="middle" fill="%23ffffff">LIGHT LOGO</text></svg>';

export const BrandImageThemeSwitch: StoryObj = {
  render: () => (
    <Section
      title="BrandImage(ライト/ダークで画像を出し分ける)"
      note="出し分けの条件(html の data-theme)は DS のテーマ機構そのものなので、消費側が任意バリアント文字列を複製せずに済むよう DS へ引き取った(#74)。ツールバーの Theme を切り替えると画像が入れ替わる。lightSrc 省略時は src を両テーマで使う。"
    >
      <div className="flex flex-col items-start gap-4">
        <BrandImage src={DARK_LOGO} lightSrc={LIGHT_LOGO} alt="サンプルロゴ" height={28} />
        <LogoMark
          size={24}
          showWordmark
          wordmark="INSESSION"
          mark={<BrandImage src={DARK_LOGO} lightSrc={LIGHT_LOGO} alt="" height={24} />}
        />
      </div>
    </Section>
  ),
};
