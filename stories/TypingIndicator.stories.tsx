import { Composer, TypingIndicator } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// DS の TypingIndicator。チャットで「相手が入力中」であることを示すドット3つ + 短い文言。
// 文言は i18n を持たない DS の規約どおり props 注入（人数の出し分けは呼び出し側で組み立てる）。
const meta: Meta<typeof TypingIndicator> = {
  title: 'Data Display/TypingIndicator',
  component: TypingIndicator,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof TypingIndicator>;

export const Variants: Story = {
  render: () => (
    <Section
      title="バリアント (DS)"
      note="label に組み立て済みの文字列を渡す。空 / 未指定なら非表示（既定では行の高さだけ残る）。"
    >
      <div className="flex flex-col gap-4">
        <TypingIndicator label="たなかさんが入力中" />
        <TypingIndicator label="たなかさんとさとうさんが入力中" />
        <TypingIndicator label="3人が入力中" />
      </div>
    </Section>
  ),
};

function ReserveSpaceDemo() {
  const [typing, setTyping] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="self-start rounded-pill border border-solid border-border bg-surface-2 px-3 py-1.5 text-sm text-text"
        onClick={() => setTyping((v) => !v)}
      >
        {typing ? '入力中を消す' : '入力中を出す'}
      </button>
      <div className="flex flex-col gap-4">
        <div className="rounded-card border border-solid border-border bg-surface p-3">
          <div className="text-sm text-text-dim">reserveSpace（既定 true）: 下の枠が動かない</div>
          <TypingIndicator label={typing ? 'たなかさんが入力中' : undefined} />
          <div className="rounded-md bg-surface-2 p-2 text-sm text-text">
            この面は上下に動かない
          </div>
        </div>
        <div className="rounded-card border border-solid border-border bg-surface p-3">
          <div className="text-sm text-text-dim">reserveSpace=false: 出入りで高さが変わる</div>
          <TypingIndicator label={typing ? 'たなかさんが入力中' : undefined} reserveSpace={false} />
          <div className="rounded-md bg-surface-2 p-2 text-sm text-text">この面は上下に動く</div>
        </div>
      </div>
    </div>
  );
}

export const ReserveSpace: Story = {
  render: () => (
    <Section
      title="行の高さの確保"
      note="入力欄の下など他の要素と隣接する位置に置くときは既定（true）のままにする。会話ログの末尾に流すなど、高さが変わって構わない場所では false。"
    >
      <ReserveSpaceDemo />
    </Section>
  ),
};

function ComposerFooterDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="flex max-w-[420px] flex-col gap-2">
      <Composer
        value={value}
        onChange={setValue}
        onSubmit={() => setValue('')}
        placeholder="メッセージを入力"
        sendLabel="送信"
      />
      <TypingIndicator label="たなかさんが入力中" />
    </div>
  );
}

export const WithComposer: Story = {
  render: () => (
    <Section
      title="Composer と組み合わせる"
      note="どこに置くかは消費側の判断。入力欄の下に置くとメッセージ一覧に一切干渉しない（Slack と同じ配置）。"
    >
      <ComposerFooterDemo />
    </Section>
  ),
};
