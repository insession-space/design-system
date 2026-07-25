import { Avatar, Badge, CountChip, EmptyNote, Icon, Stepper } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 共通プリミティブのカタログ。style.css(legacy)にある状態・ホバー・フォーカス内包の
// クラスをそのまま見せる。アプリはこれらを再利用し、レイアウト/余白だけユーティリティで書く。
const meta: Meta = {
  title: 'Components/Primitives',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const Buttons: Story = {
  render: () => (
    <Section title="ボタン" note="base button(プライマリ相当)/ button.ghost / モーダル送信ボタン。">
      <div className="flex flex-wrap items-center gap-4">
        <button type="button">プライマリ</button>
        <button type="button" className="ghost">
          ゴースト
        </button>
        <button type="button" disabled>
          無効
        </button>
      </div>
    </Section>
  ),
};

export const Input: Story = {
  render: () => (
    <Section title="入力" note='base input[type="text"]。ホバー/フォーカスで発光する。'>
      <div className="flex flex-col gap-3 max-w-sm">
        <input type="text" placeholder="YouTube URL または動画ID" />
        <input type="text" defaultValue="https://youtu.be/dQw4w9WgXcQ" />
      </div>
    </Section>
  ),
};

export const Card: Story = {
  render: () => (
    <Section
      title="カード(tinted surface)"
      note="基本形: bg-tint-5 border border-solid border-border rounded-card。控えめ・洗練。"
    >
      <div className="bg-tint-5 border border-solid border-border rounded-card p-5 max-w-sm">
        <h4 className="font-display text-lg font-bold text-text mb-1">スペース名</h4>
        <p className="text-smd text-text-dim leading-normal">
          tinted surface + 細ボーダーが面の基本形。派手なグラデ/グローは使わない。
        </p>
      </div>
    </Section>
  ),
};

export const Pills: Story = {
  render: () => (
    <Section
      title="ピル / チップ"
      note="rounded-pill の小要素。件数は @insession/design-system の CountChip（animated でタブ用の出現アニメ）。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <CountChip>3</CountChip>
        <CountChip>12</CountChip>
        <CountChip animated>7</CountChip>
        <span className="rounded-pill bg-tint-8 border border-solid border-border text-mint-soft text-sm font-semibold px-3 py-1">
          同期中
        </span>
        <span className="rounded-pill bg-tint-8 border border-solid border-border text-text-dim text-sm px-3 py-1">
          #スペースID
        </span>
      </div>
    </Section>
  ),
};

export const Badges: Story = {
  render: () => (
    <Section
      title="バッジ"
      note="小さな一過性の強調に使う。@insession/design-system の Badge（live / new）。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Badge variant="live">LIVE</Badge>
        <Badge variant="new">新着</Badge>
      </div>
    </Section>
  ),
};

export const Avatars: Story = {
  render: () => (
    <Section
      title="アバター"
      note="@insession/design-system の Avatar。画像 or 名前先頭1文字の fallback 円。size / bgColor / className を注入。"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name="Alice" bgColor="hsl(180 65% 45%)" size={42} className="auth-avatar text-xl" />
        <Avatar name="Bob" bgColor="hsl(300 65% 45%)" size={28} className="auth-avatar text-sm" />
        <Avatar name="Chris" bgColor="hsl(90 65% 45%)" className="avatar" />
        <Avatar
          name="Dan"
          src="https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
          size={42}
          className="auth-avatar"
        />
      </div>
    </Section>
  ),
};

export const EmptyNotes: Story = {
  render: () => (
    <Section
      title="空メッセージ"
      note="@insession/design-system の EmptyNote。variant で余白/揃えを切替（default / compact / dropdown）。"
    >
      <div className="flex flex-col gap-3 max-w-md">
        <EmptyNote>まだ何もありません</EmptyNote>
        <EmptyNote variant="compact">キューは空です</EmptyNote>
        <EmptyNote variant="dropdown">検索結果がありません</EmptyNote>
      </div>
    </Section>
  ),
};

function StepperDemo() {
  const [value, setValue] = useState(10);
  return (
    <div className="flex items-center gap-2">
      <Stepper
        value={value}
        min={1}
        max={50}
        step={1}
        decLabel="-1"
        incLabel="+1"
        onChange={setValue}
      />
      <span className="stepper-unit">件</span>
    </div>
  );
}

export const Steppers: Story = {
  render: () => (
    <Section
      title="ステッパー"
      note="@insession/design-system の Stepper。− / 値 / ＋ の数値増減。min/max/step を注入し clamp は内包。"
    >
      <StepperDemo />
    </Section>
  ),
};

export const Modal: Story = {
  render: () => (
    <Section title="モーダル" note=".modal(面 + クローズ + 見出し + 送信ボタン)。">
      <div className="modal">
        <button type="button" className="modal-close" aria-label="閉じる">
          ×
        </button>
        <h2>スペースを作成</h2>
        <input type="text" placeholder="スペース名" />
        <button type="submit">作成する</button>
      </div>
    </Section>
  ),
};

export const Snackbar: Story = {
  render: () => (
    <Section
      title="スナックバー"
      note="通常は画面下部に fixed 表示。カタログでは位置を固定解除して並べる。"
    >
      <div className="flex flex-col gap-4">
        {/* .snackbar は本来 position:fixed。カタログ表示のため位置指定だけ無効化する。 */}
        <div className="snackbar" style={{ position: 'static', transform: 'none' }}>
          <span className="snackbar-icon">
            <Icon name="check_circle" size={16} />
          </span>
          招待リンクをコピーしました
        </div>
        <div className="snackbar error" style={{ position: 'static', transform: 'none' }}>
          <span className="snackbar-icon">
            <Icon name="warning" size={16} />
          </span>
          追加できませんでした
        </div>
      </div>
    </Section>
  ),
};
