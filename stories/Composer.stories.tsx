import { Composer, Icon, IconButton } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// メッセージ入力フォーム(#1027)。space のチャット入力とコミュニティの投稿入力の共通化に使う
// leaf UI。controlled(value/onChange)なので、各 story は state を持つ Demo コンポーネントで包んで
// 実際に入力・送信できる形で見せる(送信ボタンの disabled 判定・自動伸長など、controlled で無いと
// 確認できない挙動があるため)。
const meta: Meta<typeof Composer> = {
  title: 'Inputs/Composer',
  component: Composer,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Composer>;

// 基本形。空文字のときは送信ボタンが disabled(text-text-dim)になり、入力すると
// 有効(text-mint-soft)に変わる。size='compact' は狭い行内(コミュニティの返信欄等)向け。
function BasicComposerDemo({ size }: { size: 'default' | 'compact' }) {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className="flex max-w-md flex-col gap-2">
      <Composer
        value={value}
        onChange={setValue}
        onSubmit={(text) => {
          setSent((prev) => [...prev, text]);
          setValue('');
        }}
        placeholder="メッセージを入力"
        sendLabel="送信"
        size={size}
      />
      {sent.length > 0 && (
        <ul className="flex flex-col gap-1 text-base text-text-dim">
          {sent.map((text, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 送信順に積むだけの表示専用リスト
            <li key={i}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const Basic: Story = {
  render: () => (
    <Section
      title="基本 (size)"
      note="既定(default)とコンパクト(compact)の比較。空文字では送信ボタンが disabled になり、1文字以上入力すると有効になる。Enter で送信できる。"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold text-text-dim">default</span>
          <BasicComposerDemo size="default" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold text-text-dim">compact</span>
          <BasicComposerDemo size="compact" />
        </div>
      </div>
    </Section>
  ),
};

// actions に IconButton を並べたチャット入力の実際の見た目。ghost variant + 小サイズ(28px)で
// 送信アイコンより控えめに見せる(space/コミュニティの実装に倣う)。
function ActionsComposerDemo() {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className="flex max-w-md flex-col gap-2">
      <Composer
        value={value}
        onChange={setValue}
        onSubmit={(text) => {
          setSent((prev) => [...prev, text]);
          setValue('');
        }}
        placeholder="メッセージを入力"
        sendLabel="送信"
        actions={
          <>
            <IconButton
              label="画像を添付"
              icon={<Icon name="image" size={16} />}
              variant="ghost"
              size={28}
            />
            <IconButton
              label="リアクションを追加"
              icon={<Icon name="add_reaction" size={16} />}
              variant="ghost"
              size={28}
            />
          </>
        }
      />
      {sent.length > 0 && (
        <ul className="flex flex-col gap-1 text-base text-text-dim">
          {sent.map((text, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 送信順に積むだけの表示専用リスト
            <li key={i}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const WithActions: Story = {
  render: () => (
    <Section
      title="actions あり"
      note="送信ボタンの左に置くアクション領域(スタンプピッカー・定型文ボタン等)。ここでは画像添付・リアクション追加の IconButton(ghost, 28px)を並べた、実際のチャット入力と同じ構成。"
    >
      <ActionsComposerDemo />
    </Section>
  ),
};

// 送信直後の一瞬の強調。呼び出し側が onSubmit で flash=true にし、setTimeout で false へ戻す想定
// (props のコメント参照)。ここでは 500ms 後に戻す。
function FlashComposerDemo() {
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState(false);
  return (
    <Composer
      value={value}
      onChange={setValue}
      onSubmit={() => {
        setValue('');
        setFlash(true);
        window.setTimeout(() => setFlash(false), 500);
      }}
      placeholder="送信すると枠が一瞬光る"
      sendLabel="送信"
      flash={flash}
    />
  );
}

// maxLength に到達すると、それ以上入力できなくなる(ネイティブ textarea の maxLength 属性による)。
// 初期値をちょうど上限文字数にして、到達済みの状態から確認できるようにする。
const MAX_LENGTH_SEED = 'これは上限に到達した状態を確認するためのテキストです。';
const MAX_LENGTH = MAX_LENGTH_SEED.length;

function MaxLengthComposerDemo() {
  const [value, setValue] = useState(MAX_LENGTH_SEED);
  return (
    <div className="flex flex-col gap-1">
      <Composer
        value={value}
        onChange={setValue}
        onSubmit={() => setValue('')}
        placeholder={`${MAX_LENGTH}文字まで`}
        sendLabel="送信"
        maxLength={MAX_LENGTH}
      />
      <span className="text-xs text-text-faint tabular-nums">
        {value.length} / {MAX_LENGTH}
      </span>
    </div>
  );
}

// 複数行入力で textarea が自動で伸びる。max-height(120px)に達するとスクロールへ切り替わる
// (composer.tsx の autoGrow 参照)。あらかじめ8行分の初期値を入れて到達済みの状態を見せる。
const AUTO_GROW_SEED = Array.from({ length: 8 }, (_, i) => `${i + 1}行目のテキスト`).join('\n');

function AutoGrowComposerDemo() {
  const [value, setValue] = useState(AUTO_GROW_SEED);
  return (
    <Composer
      value={value}
      onChange={setValue}
      onSubmit={() => setValue('')}
      placeholder="複数行入力すると自動で伸びる"
      sendLabel="送信"
    />
  );
}

export const States: Story = {
  render: () => (
    <Section
      title="状態系"
      note="disabled / flash(送信直後の強調) / maxLength 到達 / 複数行での自動伸長(max-height 120px でスクロール切替)。"
    >
      <div className="flex max-w-md flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold text-text-dim">disabled</span>
          <Composer
            value=""
            onChange={() => {}}
            onSubmit={() => {}}
            placeholder="無効化中は入力・送信できない"
            sendLabel="送信"
            disabled
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold text-text-dim">flash(送信直後)</span>
          <FlashComposerDemo />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold text-text-dim">maxLength 到達</span>
          <MaxLengthComposerDemo />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold text-text-dim">複数行の自動伸長</span>
          <AutoGrowComposerDemo />
        </div>
      </div>
    </Section>
  ),
};

// チャットパネル風のレイアウト(メッセージリスト + 下端固定の入力欄)に置いた実利用文脈。
// 送信するとメッセージリストへ即座に積まれるところまで動く。
function ChatPanelDemo() {
  const [messages, setMessages] = useState<string[]>(['こんにちは', 'よろしくお願いします']);
  const [value, setValue] = useState('');
  return (
    <div className="flex h-96 max-w-md flex-col overflow-hidden rounded-card border border-solid border-border bg-surface-2">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((text, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: 送信順に積むだけの表示専用リスト
            key={i}
            className="max-w-[80%] self-start rounded-card bg-surface px-3 py-2 text-base text-text"
          >
            {text}
          </div>
        ))}
      </div>
      <div className="shrink-0 border-0 border-t border-solid border-border p-3">
        <Composer
          value={value}
          onChange={setValue}
          onSubmit={(text) => {
            setMessages((prev) => [...prev, text]);
            setValue('');
          }}
          placeholder="メッセージを入力"
          sendLabel="送信"
          size="compact"
        />
      </div>
    </div>
  );
}

export const ChatPanel: Story = {
  render: () => (
    <Section
      title="実利用文脈 (チャットパネル)"
      note="メッセージリストの下に入力欄を固定したチャットパネル風のレイアウト。送信するとリストへ即座にメッセージが増える。"
    >
      <ChatPanelDemo />
    </Section>
  ),
};
