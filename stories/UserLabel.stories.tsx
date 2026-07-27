import { UserLabel } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// UserLabel のカタログ。アバター + ユーザー名(+ subtitle)を横並びで出す複合コンポーネント。
// アバター寸法と文字サイズを size 1つで連動させるのが主目的(呼び出し側でのタイポずれ防止)。
const meta: Meta<typeof UserLabel> = {
  title: 'Data Display/UserLabel',
  component: UserLabel,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof UserLabel>;

// 外部に依存しない data URI の画像(#33 の BrokenImage ストーリーと同じ手段)。
const AVATAR_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%2312d8c9'/%3E%3C/svg%3E";

export const Sizes: Story = {
  render: () => (
    <Section title="サイズ(sm/md/lg)" note="アバター寸法と文字サイズが size で連動する。">
      <div className="flex flex-col items-start gap-4">
        <UserLabel size="sm" name="Seiya" src={AVATAR_SRC} />
        <UserLabel size="md" name="Seiya" src={AVATAR_SRC} />
        <UserLabel size="lg" name="Seiya" src={AVATAR_SRC} />
      </div>
    </Section>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Section title="画像あり" note="src が有効なら画像を表示する。">
      <UserLabel name="Seiya" src={AVATAR_SRC} />
    </Section>
  ),
};

export const WithoutImage: Story = {
  render: () => (
    <Section
      title="画像なし(fallback)"
      note="src が無い/読み込みに失敗すると Avatar の fallback(名前の頭文字)が出る。"
    >
      <div className="flex flex-col items-start gap-4">
        <UserLabel name="Seiya" subtitle="src なし" />
        {/* 壊れた URL でも画像が割れたまま残らず fallback 円へ切り替わること(UserLabel は
            常に DS 経路で描くので Base UI が読み込み失敗を検知できる)を見るケース。 */}
        <UserLabel
          name="Seiya"
          src="https://example.invalid/broken.png"
          subtitle="src が壊れている"
        />
      </div>
    </Section>
  ),
};

export const WithSubtitle: Story = {
  render: () => (
    <Section title="subtitle あり" note="名前の下に補助テキスト(役割など)を出す。">
      <UserLabel name="Seiya" src={AVATAR_SRC} subtitle="Host" />
    </Section>
  ),
};

export const WithoutSubtitle: Story = {
  render: () => (
    <Section title="subtitle なし" note="subtitle を省略すると1行表示になる。">
      <UserLabel name="Seiya" src={AVATAR_SRC} />
    </Section>
  ),
};

export const StatusAndRing: Story = {
  render: () => (
    <Section
      title="status / ring"
      note="Avatar へそのまま透過する。status/ring 未指定でも常に DS 経路で描画されるため見た目はぶれない。"
    >
      <div className="flex flex-col items-start gap-4">
        <UserLabel name="Seiya" src={AVATAR_SRC} subtitle="Host" status="live" ring />
        <UserLabel name="Alice" color="hsl(300 65% 45%)" subtitle="Guest" status="offline" ring />
      </div>
    </Section>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Section
      title="操作可能な行(href / onClick)"
      note="href なら <a>、onClick なら <button>、どちらも無ければ <div>。旧 ListRow を廃止してここへ集約したので、消費側は打ち消しユーティリティ(bg-transparent / border-none / p-0 …)を書かなくてよい。"
    >
      <div className="flex max-w-120 flex-col rounded-card border border-solid border-border bg-surface p-2">
        <UserLabel
          name="リンクの行(a)"
          src={AVATAR_SRC}
          subtitle="href を渡すと中クリックで別タブに開ける"
          href="#userlabel-link-demo"
        />
        <UserLabel
          name="ボタンの行(button)"
          src={AVATAR_SRC}
          subtitle="onClick を渡すとモーダルを開く等の操作にできる"
          onClick={() => {}}
        />
        <UserLabel
          name="押せない行(disabled)"
          src={AVATAR_SRC}
          subtitle="hover の面を出さず、押せると誤解させない"
          onClick={() => {}}
          disabled
        />
        <UserLabel
          name="表示だけの行(div)"
          src={AVATAR_SRC}
          subtitle="href も onClick も無ければ従来どおり非操作"
        />
      </div>
    </Section>
  ),
};

export const HideAvatar: Story = {
  render: () => (
    <Section
      title="hideAvatar"
      note="true でアバターの div ごと描画しない(コンパクト表示。#83 の MessageItem で使う想定)。省略時の既定は false(常時アバター表示)で既存呼び出し側の見た目は変わらない。"
    >
      <div className="flex flex-col items-start gap-4">
        <UserLabel name="Seiya" subtitle="hideAvatar なし(既定)" src={AVATAR_SRC} />
        <UserLabel name="Seiya" subtitle="hideAvatar" src={AVATAR_SRC} hideAvatar />
      </div>
    </Section>
  ),
};

export const WithTrailing: Story = {
  render: () => (
    <Section
      title="trailing(#97)"
      note="名前の右に、名前と同じベースラインで小さな要素(時刻など)を置く差し込み口。subtitle(名前の下)と対になる。MessageItem はこれを使って時刻のベースラインを名前に揃えている。"
    >
      <div className="flex flex-col items-start gap-4">
        <UserLabel
          name="Seiya"
          src={AVATAR_SRC}
          trailing={<span className="font-body text-text-dim text-xs">01:03</span>}
        />
        <UserLabel
          name="subtitle と併用"
          src={AVATAR_SRC}
          subtitle="Host"
          trailing={<span className="font-body text-text-dim text-xs">01:03</span>}
        />
      </div>
    </Section>
  ),
};

export const LongName: Story = {
  render: () => (
    <Section title="長い名前の truncate" note="コンテナ幅を超える名前/subtitle は1行で省略する。">
      <div className="max-w-[220px]">
        <UserLabel
          name="とてもとても長いユーザー名がここに入るときの省略の確認用"
          src={AVATAR_SRC}
          subtitle="とてもとても長いサブテキストがここに入るときの省略の確認用"
        />
      </div>
    </Section>
  ),
};
