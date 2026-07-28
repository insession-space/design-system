import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorSwatch, Grid, LineSwatch, Section } from './tokens';

// カラートークンのカタログ。パレット/背景面/境界/テキスト/ティント面を一覧する。
// 実物と同じ style.css の @theme を読み込むため、色は本アプリと完全に一致する。
const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Palette: Story = {
  render: () => (
    <Section
      title="パレット"
      note="トークン名は色名ではなく役割で付ける(#109)。文字色は text-accent-soft を基本にする。"
    >
      <Grid>
        <ColorSwatch varName="--color-accent" label="accent" />
        <ColorSwatch varName="--color-accent-fill" label="accent-fill" />
        <ColorSwatch varName="--color-accent-soft" label="accent-soft" />
        <ColorSwatch varName="--color-accent-2" label="accent-2" />
        <ColorSwatch varName="--color-decor-1" label="decor-1" />
      </Grid>
    </Section>
  ),
};

export const Surfaces: Story = {
  render: () => (
    <Section title="背景面" note="奥(bg)→手前(surface)。カード/行は tinted surface を基本にする。">
      <Grid>
        <ColorSwatch varName="--color-bg" label="bg" />
        <ColorSwatch varName="--color-bg-elevated" label="bg-elevated" />
        <ColorSwatch varName="--color-surface" label="surface" />
      </Grid>
    </Section>
  ),
};

export const Tints: Story = {
  render: () => (
    <Section
      title="ティント面"
      note="アクセントを地の背景へ合成した面。数値=不透明度×100。bg-tint-* で使う。"
    >
      <Grid>
        <ColorSwatch varName="--color-tint-3" label="tint-3" />
        <ColorSwatch varName="--color-tint-5" label="tint-5" />
        <ColorSwatch varName="--color-tint-7" label="tint-7" />
        <ColorSwatch varName="--color-tint-8" label="tint-8" />
        <ColorSwatch varName="--color-tint-10" label="tint-10" />
        <ColorSwatch varName="--color-tint-13" label="tint-13" />
        <ColorSwatch varName="--color-tint-16" label="tint-16" />
        <ColorSwatch varName="--color-tint-22" label="tint-22" />
      </Grid>
    </Section>
  ),
};

export const Semantic: Story = {
  render: () => (
    <>
      <Section
        title="セマンティック(状態色)"
        note="success/warning/danger/info。ブランドと調和するトーン(#445)。地(text/icon)・面(surface)・枠(border)の3点セット。StatusBadge / Button danger / Toast 等で使う。"
      >
        <Grid>
          <ColorSwatch varName="--color-success" label="success" />
          <ColorSwatch varName="--color-warning" label="warning" />
          <ColorSwatch varName="--color-danger" label="danger" />
          <ColorSwatch varName="--color-info" label="info" />
        </Grid>
      </Section>
      <Section
        title="セマンティック: 面 / 枠"
        note="tinted surface + 細ボーダーの基本形に載せる淡い面と枠。"
      >
        <Grid>
          <ColorSwatch varName="--color-success-surface" label="success-surface" />
          <ColorSwatch varName="--color-warning-surface" label="warning-surface" />
          <ColorSwatch varName="--color-danger-surface" label="danger-surface" />
          <ColorSwatch varName="--color-info-surface" label="info-surface" />
          <LineSwatch varName="--color-success-border" label="success-border" />
          <LineSwatch varName="--color-warning-border" label="warning-border" />
          <LineSwatch varName="--color-danger-border" label="danger-border" />
          <LineSwatch varName="--color-info-border" label="info-border" />
        </Grid>
      </Section>
      <Section
        title="オーバーレイ面"
        note="ポップオーバー/スナックバー等、前面に浮く面(surface-2)。"
      >
        <Grid>
          <ColorSwatch varName="--color-surface-2" label="surface-2" />
        </Grid>
      </Section>
    </>
  ),
};

export const BordersAndText: Story = {
  render: () => (
    <>
      <Section title="境界" note="ミントを薄く重ねた線。border-border / -strong。">
        <Grid>
          <LineSwatch varName="--color-border" label="border" />
          <LineSwatch varName="--color-border-strong" label="border-strong" />
        </Grid>
      </Section>
      <Section title="テキスト" note="階層。本文=text、補足=text-dim、さらに薄い=text-faint。">
        <Grid>
          <LineSwatch varName="--color-text" label="text" />
          <LineSwatch varName="--color-text-dim" label="text-dim" />
          <LineSwatch varName="--color-text-faint" label="text-faint" />
        </Grid>
      </Section>
    </>
  ),
};
