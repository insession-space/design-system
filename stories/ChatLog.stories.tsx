import { LogActionButton } from '@in-session/space-core';
import { Icon } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './tokens';

// チャットのシステムイベント/操作ログ = DS EventBubble カード(#463)。
// 左寄せの中立 surface カードに「アイコン + 太字の主体名 + 本文」を並べ、
// 切替アクションはカード内の左寄せ行(info=blue のゴーストピル)に置く。
// 実体は style.css の .chat-line.log / .chat-line-log-actions と chat-panel.tsx のボタン。
const meta: Meta = {
  title: 'Components/ChatLog (EventBubble)',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const noop = () => {};

export const AppJoin: Story = {
  render: () => (
    <Section
      title="アプリ参加 + 切替アクション"
      note="誰かがアプリ(テトリス等)に参加したログ。カード内にそのアプリへ切り替えるアクションを置く。"
    >
      <div className="chat-log flex flex-col gap-3 max-w-sm">
        <div className="chat-line log">
          <em>
            <span className="log-icon">
              <Icon name="sports_esports" size={15} />
            </span>
            <strong className="log-name">gump2</strong> がテトリスに参加しました
          </em>
          <div className="chat-line-log-actions">
            <LogActionButton icon="sports_esports" onClick={noop}>
              テトリスへ切り替える
            </LogActionButton>
          </div>
        </div>
      </div>
    </Section>
  ),
};

export const ScreenShare: Story = {
  render: () => (
    <Section title="画面共有" note="画面共有の開始ログ + 閲覧アクション。">
      <div className="chat-log flex flex-col gap-3 max-w-sm">
        <div className="chat-line log">
          <em>
            <span className="log-icon">
              <Icon name="screen_share" size={15} />
            </span>
            <strong className="log-name">Seiya</strong> が画面共有を開始しました
          </em>
          <div className="chat-line-log-actions">
            <LogActionButton icon="screen_share" onClick={noop}>
              画面共有を見る
            </LogActionButton>
          </div>
        </div>
      </div>
    </Section>
  ),
};

export const Greeting: Story = {
  render: () => (
    <Section title="入室 + Wave 挨拶" note="入室ログ + Wave で挨拶を返すアクション。">
      <div className="chat-log flex flex-col gap-3 max-w-sm">
        <div className="chat-line log">
          <em>
            <span className="log-icon">
              <Icon name="person_add" size={15} />
            </span>
            <strong className="log-name">外道</strong> が入室しました
          </em>
          <div className="chat-line-log-actions">
            <LogActionButton icon="auto_awesome" onClick={noop}>
              Wave で挨拶
            </LogActionButton>
          </div>
        </div>
      </div>
    </Section>
  ),
};

export const Plain: Story = {
  render: () => (
    <Section
      title="アクション無しのログ"
      note="再生/停止/シーク等、切替アクションを持たない操作ログ。"
    >
      <div className="chat-log flex flex-col gap-3 max-w-sm">
        <div className="chat-line log">
          <em>
            <span className="log-icon">
              <Icon name="play_arrow" size={15} />
            </span>
            <strong className="log-name">gump2</strong> が再生しました
          </em>
        </div>
        <div className="chat-line log">
          <em>
            <span className="log-icon">
              <Icon name="pause" size={15} />
            </span>
            <strong className="log-name">Seiya</strong> が一時停止しました
          </em>
        </div>
      </div>
    </Section>
  ),
};

export const InChatFlow: Story = {
  render: () => (
    <Section title="チャットの流れの中" note="通常メッセージに挟まれたときの見え方。">
      <div className="chat-log flex flex-col gap-3 max-w-sm">
        <div className="chat-message-row">
          <div className="chat-message-header">
            <span className="text-accent font-bold">Seiya</span>
          </div>
          <div className="chat-line">流れるスタンプのサイズ小さいな</div>
        </div>
        <div className="chat-line log">
          <em>
            <span className="log-icon">
              <Icon name="sports_esports" size={15} />
            </span>
            <strong className="log-name">gump2</strong> がテトリスに参加しました
          </em>
          <div className="chat-line-log-actions">
            <LogActionButton icon="sports_esports" onClick={noop}>
              テトリスへ切り替える
            </LogActionButton>
          </div>
        </div>
        <div className="chat-message-row">
          <div className="chat-message-header">
            <span className="text-accent font-bold">Seiya</span>
          </div>
          <div className="chat-line">てか、弾幕自体が小さい？</div>
        </div>
      </div>
    </Section>
  ),
};
