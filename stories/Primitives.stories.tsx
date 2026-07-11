import type { Meta, StoryObj } from '@storybook/react-vite';
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
        <h4 className="font-display text-lg font-bold text-text mb-1">ルーム名</h4>
        <p className="text-smd text-text-dim leading-normal">
          tinted surface + 細ボーダーが面の基本形。派手なグラデ/グローは使わない。
        </p>
      </div>
    </Section>
  ),
};

export const Pills: Story = {
  render: () => (
    <Section title="ピル / チップ" note="rounded-pill の小要素。カウント表示や短いタグに使う。">
      <div className="flex flex-wrap items-center gap-4">
        <span className="count-chip">3</span>
        <span className="count-chip">12</span>
        <span className="rounded-pill bg-tint-8 border border-solid border-border text-mint-soft text-sm font-semibold px-3 py-1">
          同期中
        </span>
        <span className="rounded-pill bg-tint-8 border border-solid border-border text-text-dim text-sm px-3 py-1">
          #ルームID
        </span>
      </div>
    </Section>
  ),
};

export const Badges: Story = {
  render: () => (
    <Section title="バッジ" note="小さな一過性の強調に使う。live-badge / nav-new-badge。">
      <div className="flex flex-wrap items-center gap-4">
        <span className="live-badge">LIVE</span>
        <span className="nav-new-badge">新着</span>
      </div>
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
        <h2>ルームを作成</h2>
        <input type="text" placeholder="ルーム名" />
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
          <span className="snackbar-icon">✓</span>
          招待リンクをコピーしました
        </div>
        <div className="snackbar error" style={{ position: 'static', transform: 'none' }}>
          <span className="snackbar-icon">!</span>
          追加できませんでした
        </div>
      </div>
    </Section>
  ),
};
