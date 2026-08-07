import { Composer, EmojiPicker, Icon, IconButton, MessageItem } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Section } from './tokens';

// Popover で開く絵文字ピッカー(#190)。選ばれた絵文字が `onSelect` で返る。
// リアクションの追加にも、本文への絵文字挿入にも使える（DS はどちらの用途かを知らない）。
//
// 配色は `--epr-*` の CSS 変数経由で DS のトークンへ繋いであるので、ツールバーの
// ライト/ダーク切替にそのまま追従する。
const meta: Meta = {
  title: 'Overlays/EmojiPicker',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// 既定のトリガー（add_reaction アイコン）で開き、選んだ絵文字を並べていく。
export const Default: Story = {
  render: function Render() {
    const [picked, setPicked] = useState<string[]>([]);
    return (
      <div className="flex flex-col items-start gap-3">
        <EmojiPicker
          triggerLabel="絵文字を追加"
          searchPlaceholder="絵文字を検索"
          onSelect={(emoji) => setPicked((prev) => [...prev, emoji])}
        />
        <p className="m-0 text-sm text-text-dim">
          選んだ絵文字:{' '}
          <span className="text-h2 leading-none">{picked.join(' ') || '（まだありません）'}</span>
        </p>
      </div>
    );
  },
};

// トリガーの見た目は消費側が全て差し替えられる。DS の IconButton を使う例と、素のテキストを
// 使う例。**トリガーを IconButton に固定していない**のは、既存のアクション行に IconButton の
// 面や寸法を持ち込みたくない消費側があるため。
export const Triggers: Story = {
  name: 'トリガーを差し替える',
  render: function Render() {
    const [last, setLast] = useState('—');
    return (
      <div className="flex flex-col gap-6">
        <Section title="既定（add_reaction アイコン）">
          <EmojiPicker triggerLabel="絵文字を追加" onSelect={setLast} />
        </Section>
        <Section title="IconButton の見た目に寄せる">
          <EmojiPicker
            triggerLabel="絵文字を追加"
            triggerClassName="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-pill border-none bg-surface text-text hover:bg-surface-hover"
            onSelect={setLast}
          >
            <Icon name="add_reaction" size={18} />
          </EmojiPicker>
        </Section>
        <Section title="テキストのトリガー">
          <EmojiPicker
            triggerLabel="絵文字を追加"
            triggerClassName="cursor-pointer rounded-card border border-border border-solid bg-surface px-3 py-1.5 text-base text-text hover:bg-surface-hover"
            onSelect={setLast}
          >
            絵文字を選ぶ
          </EmojiPicker>
        </Section>
        <p className="m-0 text-sm text-text-dim">
          最後に選んだもの: <span className="text-h2 leading-none">{last}</span>
        </p>
      </div>
    );
  },
};

// メッセージへのリアクション追加。MessageItem の `actionsSlot`（ヘッダー右の差し込み口）に
// 置くのが想定どおりの使い方 — MessageItem 自身はピッカーを内蔵しない。
export const OnMessage: Story = {
  name: 'メッセージのリアクションに使う',
  render: function Render() {
    const [reactions, setReactions] = useState<Record<string, number>>({ '🎉': 2 });
    return (
      <MessageItem
        authorName="sae"
        timestamp="01:03"
        avatarSrc={null}
        actionsSlot={
          <EmojiPicker
            triggerLabel="リアクションを追加"
            searchPlaceholder="絵文字を検索"
            triggerClassName="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-pill border-none bg-transparent text-text-dim hover:bg-surface-hover hover:text-text"
            onSelect={(emoji) =>
              setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }))
            }
          >
            <Icon name="add_reaction" size={15} />
          </EmojiPicker>
        }
        reactions={Object.entries(reactions).map(([emoji, count]) => ({
          emoji,
          count,
          label: `${emoji} のリアクション`,
          reacted: true,
          onClick: () => setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 })),
        }))}
      >
        リリースしました。確認おねがいします。
      </MessageItem>
    );
  },
};

// 入力欄への絵文字挿入。Composer の `actions`（送信ボタンの左）に置く。
// 挿入位置はキャレット。value は呼び出し側が所有する。
export const InComposer: Story = {
  name: '入力欄に絵文字を挿し込む',
  render: function Render() {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [text, setText] = useState('');

    function insert(emoji: string) {
      const el = textareaRef.current;
      // キャレット位置が取れないとき（focus 前など）は末尾へ足す。
      const caret = el?.selectionStart ?? text.length;
      setText((prev) => `${prev.slice(0, caret)}${emoji}${prev.slice(caret)}`);
      el?.focus();
    }

    return (
      <div className="flex flex-col gap-2">
        <Composer
          textareaRef={textareaRef}
          value={text}
          onChange={setText}
          onSubmit={() => setText('')}
          placeholder="メッセージを入力"
          sendLabel="送信"
          actions={
            <EmojiPicker
              triggerLabel="絵文字を挿入"
              searchPlaceholder="絵文字を検索"
              side="top"
              align="start"
              triggerClassName="inline-flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-pill border-none bg-transparent text-text-dim hover:bg-surface-hover hover:text-text"
              onSelect={insert}
            >
              <Icon name="add_reaction" size={18} />
            </EmojiPicker>
          }
        />
        <p className="m-0 text-sm text-text-dim">
          入力内容: <span className="text-text">{text || '（空）'}</span>
        </p>
      </div>
    );
  },
};

// 検索欄を出さない・寸法を変える。狭い場所へ収めたいとき用。
export const Compact: Story = {
  name: '検索なし / 小さめ',
  render: function Render() {
    const [last, setLast] = useState('—');
    return (
      <div className="flex flex-col items-start gap-3">
        <EmojiPicker
          triggerLabel="絵文字を追加"
          searchDisabled
          height={280}
          width={260}
          onSelect={setLast}
        />
        <p className="m-0 text-sm text-text-dim">
          最後に選んだもの: <span className="text-h2 leading-none">{last}</span>
        </p>
      </div>
    );
  },
};

// 縮小表示。`scale` は**基準倍率**で、画面幅が足りなければ内部でこれより小さくなる
// （`minScale` が下げ止まり）。ブラウザ幅を狭めると 0.6 まで縮んでいくのが確認できる。
export const Scaled: Story = {
  name: '縮小して表示する',
  render: function Render() {
    const [last, setLast] = useState('—');
    return (
      <div className="flex flex-col gap-6">
        <Section title="等倍（既定）">
          <EmojiPicker triggerLabel="絵文字を追加" onSelect={setLast} />
        </Section>
        {/* ⚠ width は既定（320）のまま変えない。emoji-picker-react の列レイアウトは width の値に
            よっては端数が出て、絵文字リストに数 px の横スクロールが生まれる（実測: 320 なら 0、
            340 だと 5px はみ出して右端が切れる）。ここで見せたいのは縮小であって width ではない。 */}
        <Section title="scale=0.75（実寸 240）">
          <EmojiPicker triggerLabel="絵文字を追加" scale={0.75} onSelect={setLast} />
        </Section>
        <Section title="scale=0.6（下げ止まりと同じ倍率）">
          <EmojiPicker triggerLabel="絵文字を追加" scale={0.6} onSelect={setLast} />
        </Section>
        <p className="m-0 text-sm text-text-dim">
          最後に選んだもの: <span className="text-h2 leading-none">{last}</span>
        </p>
      </div>
    );
  },
};

// 肌の色の選択は**既定で出さない**（DS の面の上で単色のまま浮くため）。
// 出し分けが要る場合だけ明示的に有効化する。
export const SkinTones: Story = {
  name: '肌の色の選択を出す',
  render: function Render() {
    const [last, setLast] = useState('—');
    return (
      <div className="flex flex-col items-start gap-3">
        <EmojiPicker triggerLabel="絵文字を追加" skinTonesDisabled={false} onSelect={setLast} />
        <p className="m-0 text-sm text-text-dim">
          最後に選んだもの: <span className="text-h2 leading-none">{last}</span>
        </p>
      </div>
    );
  },
};

// 開閉を消費側が持つ（controlled）。外部のボタンからも開ける。
export const Controlled: Story = {
  name: '開閉を外から制御する',
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState('—');
    return (
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <EmojiPicker
            triggerLabel="絵文字を追加"
            open={open}
            onOpenChange={setOpen}
            onSelect={setLast}
          />
          <IconButton
            icon="settings"
            label={open ? 'ピッカーを閉じる' : 'ピッカーを開く'}
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>
        <p className="m-0 text-sm text-text-dim">
          状態: <span className="text-text">{open ? '開いている' : '閉じている'}</span> / 最後に
          選んだもの: <span className="text-h2 leading-none">{last}</span>
        </p>
      </div>
    );
  },
};
