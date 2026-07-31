import {
  Composer,
  Lozenge,
  Mention,
  type MentionItem,
  type MentionRange,
} from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Section } from './tokens';

// テキスト入力欄の中で `@` を打つと候補が出るサジェスト(#177)。
// DS が持つのは「候補の表示・キーボード操作・トリガー検出」だけで、入力欄の value は
// 呼び出し側が所有する（確定時は置換すべき範囲が onSelect で渡ってくる）。
const meta: Meta = {
  title: 'Overlays/Mention',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const PEOPLE: MentionItem[] = [
  { id: 'sae', label: 'sae', sublabel: 'さえ', avatarColor: 'var(--color-info)' },
  { id: 'tomo', label: 'tomo', sublabel: 'とも', avatarColor: 'var(--color-success)' },
  { id: 'yuki', label: 'yuki', sublabel: 'ゆき', avatarColor: 'var(--color-accent)' },
  { id: 'ren', label: 'ren', sublabel: 'れん', avatarColor: 'var(--color-warning)' },
];

const AGENT_BADGE = <Lozenge tone="info">AI</Lozenge>;

// 呼び出し側が持つ置換ロジック。DS は range を渡すだけで value を書き換えない。
function replaceRange(text: string, range: MentionRange, insert: string) {
  return `${text.slice(0, range.start)}${insert}${text.slice(range.end)}`;
}

// story 共通のデモ。candidates を差し替えるだけで各ケースを作る。
function MentionDemo({
  candidates,
  emptyLabel,
  placeholder = '@ を入力すると候補が出ます',
}: {
  candidates: MentionItem[];
  emptyLabel?: string;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // 候補は textarea ではなく **Composer の器** に寄せる（textarea の下端は器の下端ではないので、
  // 下向きにフリップしたときアクション行に重なる）。
  const composerRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState('');
  const [query, setQuery] = useState<string | null>(null);

  const items =
    query === null
      ? []
      : candidates.filter((c) => c.label.toLowerCase().startsWith(query.toLowerCase()));

  return (
    // 候補は入力欄の**上**に出る（チャット入力は画面下端にあるのが普通）。story では
    // 上に余白が無いと衝突回避で下へ回り込み、本来の見え方にならないので余白を作る。
    <div className="flex flex-col gap-2 pt-80">
      <div ref={composerRef}>
        <Composer
          textareaRef={textareaRef}
          value={text}
          onChange={setText}
          onSubmit={() => setText('')}
          placeholder={placeholder}
          sendLabel="送信"
        />
      </div>
      <Mention
        inputRef={textareaRef}
        anchor={composerRef}
        items={items}
        emptyLabel={emptyLabel}
        ariaLabel="メンション候補"
        onQueryChange={setQuery}
        onSelect={(item, range) => {
          setText((prev) => replaceRange(prev, range, `@${item.label} `));
          textareaRef.current?.focus();
        }}
      />
      <p className="m-0 text-sm text-text-dim">
        送信内容: <span className="text-text">{text || '（空）'}</span>
      </p>
    </div>
  );
}

// 候補あり（人間のみ）。↑↓ で移動・Enter / Tab で確定・Esc で閉じる。
export const Default: Story = {
  render: () => (
    <Section title="候補あり">
      <MentionDemo candidates={PEOPLE} />
    </Section>
  ),
};

// 候補0件。emptyLabel を渡したときだけパネルが残る（渡さなければ黙って閉じる）。
export const Empty: Story = {
  render: () => (
    <Section title="候補0件（emptyLabel）">
      <MentionDemo candidates={[]} emptyLabel="該当する相手がいません" />
    </Section>
  ),
};

// 長い名前は truncate される（パネル幅が名前に引きずられない）。
export const LongLabels: Story = {
  render: () => (
    <Section title="長い名前">
      <MentionDemo
        candidates={[
          {
            id: 'long1',
            label: 'very-long-display-name-that-should-be-truncated',
            sublabel: 'とても長い表示名のユーザー',
          },
          { id: 'long2', label: 'longer-name-still-going-on-and-on', sublabel: '副情報も長い場合' },
          ...PEOPLE,
        ]}
      />
    </Section>
  ),
};

// 人間と AI Agent の混在。種別の区別は badge（DS はドメインを知らないので呼び出し側が渡す）。
export const WithAgents: Story = {
  render: () => (
    <Section title="Agent 混在">
      <MentionDemo
        candidates={[
          { id: 'dj', label: 'dj', sublabel: 'DJ', badge: AGENT_BADGE },
          ...PEOPLE,
          { id: 'offline', label: 'offline-user', sublabel: '退室中', disabled: true },
        ]}
      />
    </Section>
  ),
};

// モバイル幅（375px）。候補パネルが枠外へはみ出さず、行のタップターゲットが 44px 相当になる。
export const Mobile: Story = {
  render: () => (
    <Section title="モバイル幅（375px）">
      <div className="w-[375px] max-w-full rounded-card border border-solid border-border p-3">
        <MentionDemo
          candidates={[{ id: 'dj', label: 'dj', sublabel: 'DJ', badge: AGENT_BADGE }, ...PEOPLE]}
        />
      </div>
    </Section>
  ),
};
