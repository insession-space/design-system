import { Callout, Link } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// Callout（インラインの告知バー）。特定 UI（プレーヤー等）の直上に置く用途で、画面隅に浮く
// Toast/Snackbar とは別物。表示/非表示の状態管理・出現/退場アニメーションは持たない
// （消費側の責務。ここでは onDismiss の動作を見せるためだけに useState を使っている）。
const meta: Meta<typeof Callout> = {
  title: 'Feedback/Callout',
  component: Callout,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Callout>;

export const Tones: Story = {
  render: () => (
    <Section
      title="トーン"
      note="4 tone（info / warning / danger / success）。アイコンは tone ごとの既定を使う。"
    >
      <div className="flex flex-col gap-3">
        <Callout tone="info">同期中です。数秒お待ちください。</Callout>
        <Callout tone="warning">この操作は元に戻せません。</Callout>
        <Callout tone="danger">接続が切断されました。再接続を試みています。</Callout>
        <Callout tone="success">設定を保存しました。</Callout>
      </div>
    </Section>
  ),
};

export const WithDismiss: Story = {
  render: function Render() {
    const [visible, setVisible] = useState(true);
    return (
      <Section
        title="onDismiss の有無"
        note="onDismiss を渡したときだけ × ボタンが DOM に出る。表示/非表示の判断は消費側が持つ（この story は useState で見せているだけ）。"
      >
        <div className="flex flex-col gap-3">
          {visible ? (
            <Callout tone="info" onDismiss={() => setVisible(false)}>
              このバーは閉じられます。
            </Callout>
          ) : (
            <Callout
              tone="info"
              action={<Link onClick={() => setVisible(true)}>もう一度表示</Link>}
            >
              閉じました。
            </Callout>
          )}
          <Callout tone="warning">onDismiss を渡していないので × は出ません。</Callout>
        </div>
      </Section>
    );
  },
};

export const IconVariants: Story = {
  render: () => (
    <Section
      title="icon"
      note="省略時は tone の既定アイコン。null で領域ごと非表示（空の隙間を残さない）。"
    >
      <div className="flex flex-col gap-3">
        <Callout tone="success">既定のアイコン（check_circle）が付く。</Callout>
        <Callout tone="success" icon={null}>
          icon=null。アイコン領域ごと詰まる。
        </Callout>
      </div>
    </Section>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Section
      title="action"
      note="本文の後ろにリンク/ボタン等の導線を並べる。本文と同じ行内フローで折り返す。"
    >
      <Callout
        tone="info"
        action={
          <Link href="#" onClick={(e) => e.preventDefault()}>
            詳細を見る
          </Link>
        }
      >
        新しいバージョンが利用可能です。
      </Callout>
    </Section>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Section
      title="長文 + 長い action"
      note="横スクロールが発生せず、× ボタンが潰れないことを確認する（潰れ検証用）。狭いコンテナに置いている。"
    >
      <div className="max-w-[360px]">
        <Callout
          tone="warning"
          action={
            <Link href="#" onClick={(e) => e.preventDefault()}>
              サポートページで詳しい手順を確認する
            </Link>
          }
          onDismiss={() => {}}
        >
          この操作には長い説明文が付くことがあります。ネットワーク環境によっては同期に時間がかかる場合があり、その間は他の操作を控えることを推奨します。折り返しても横スクロールは発生しません。
        </Callout>
      </div>
      {/* レビュー指摘: action 自体が長いラベルだと nowrap のせいで横スクロールしていた
          （#211 のフォロー修正）。action 単体でも折り返せることを、より狭いコンテナで確認する。 */}
      <div className="mt-3 max-w-[220px]">
        <Callout
          tone="info"
          action={
            <Link href="#" onClick={(e) => e.preventDefault()}>
              このセッションの詳しい統計情報をダッシュボードで確認する
            </Link>
          }
        >
          短い本文。
        </Callout>
      </div>
    </Section>
  ),
};
