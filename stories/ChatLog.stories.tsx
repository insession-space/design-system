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

// chat-panel.tsx のログアクションボタンと同一クラス。
const ACTION_BTN =
  'inline-flex items-center gap-1.5 rounded-md border border-solid border-border bg-surface px-2.5 py-1 text-xs font-semibold text-cyan transition-colors duration-(--dur-fast) hover:bg-surface-hover';

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
            <button type="button" className={ACTION_BTN}>
              <Icon name="sports_esports" size={14} />
              テトリスへ切り替える
            </button>
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
            <button type="button" className={ACTION_BTN}>
              <Icon name="screen_share" size={14} />
              画面共有を見る
            </button>
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
            <button type="button" className={ACTION_BTN}>
              <Icon name="auto_awesome" size={14} />
              Wave で挨拶
            </button>
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
            <button type="button" className={ACTION_BTN}>
              <Icon name="sports_esports" size={14} />
              テトリスへ切り替える
            </button>
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
