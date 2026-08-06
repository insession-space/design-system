import { Composer, EmojiSuggest, type SuggestRange } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';

// テキスト入力欄の中で `:smile` のように打つと絵文字の候補が出る補完(#190)。
// Slack / GitHub と同じ操作感で、確定すると**絵文字そのもの**が本文に入る
// （`:smile:` のようなショートコード文字列は残らない）。
//
// Mention と違い候補は DS が持つ — 絵文字はアプリのドメインに依存しないため、辞書と検索まで
// DS 側で完結させている。呼び出し側がやるのは「渡された範囲を置き換える」ことだけ。
const meta: Meta = {
  title: 'Overlays/EmojiSuggest',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// 呼び出し側が持つ置換ロジック。DS は range を渡すだけで value を書き換えない。
function replaceRange(text: string, range: SuggestRange, insert: string) {
  return `${text.slice(0, range.start)}${insert}${text.slice(range.end)}`;
}

function EmojiSuggestDemo({
  minQueryLength,
  maxItems,
  emptyLabel,
  placeholder = ':smile のように入力すると候補が出ます',
  initialText = '',
}: {
  minQueryLength?: number;
  maxItems?: number;
  emptyLabel?: string;
  placeholder?: string;
  initialText?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // 候補は textarea ではなく **Composer の器** に寄せる（textarea の下端は器の下端ではないので、
  // 下向きにフリップしたときアクション行に重なる）。
  const composerRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState(initialText);

  return (
    // 候補は入力欄の**上**に出る（チャット入力は画面下端にあるのが普通）。story では
    // 上に余白が無いと衝突回避で下へ回り込み、本来の見え方にならないので余白を作る。
    // 絵文字の候補は既定8件でパネルが max-h-80(320px)いっぱいまで伸びるため、Mention の
    // story(320px)と同じ余白では収まりきらず下へフリップした（実測）。
    //
    // ⚠ **ここは Tailwind ユーティリティで書けない。** stories/ は styles.src.css の @source に
    //   含まれていないので、DS 本体が使っていないクラス（pt-96 等）は CSS が生成されない。
    //   クラス名は DOM に出るのに computed paddingTop が 0px になる（実測で踏んだ）。
    //   story 専用の寸法は inline style で書くこと。
    <div className="flex flex-col gap-2" style={{ paddingTop: 420 }}>
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
      <EmojiSuggest
        inputRef={textareaRef}
        anchor={composerRef}
        ariaLabel="絵文字候補"
        minQueryLength={minQueryLength}
        maxItems={maxItems}
        emptyLabel={emptyLabel}
        onSelect={(emoji, range) => {
          setText((prev) => replaceRange(prev, range, emoji));
          textareaRef.current?.focus();
        }}
      />
      <p className="m-0 text-sm text-text-dim">
        送信内容: <span className="text-text">{text || '（空）'}</span>
      </p>
    </div>
  );
}

// `:` を打って2文字目から候補が出る既定の挙動。`:sm` `:fire` `:thin` などで試せる。
export const Default: Story = {
  render: () => <EmojiSuggestDemo />,
};

// 1文字目から出す。候補が多くなるぶん、目当てのものへ早く辿り着きたい用途向け。
export const MinQueryLengthOne: Story = {
  name: '1文字から候補を出す',
  render: () => <EmojiSuggestDemo minQueryLength={1} placeholder=":f のように1文字で出ます" />,
};

// 表示件数を絞る。狭い入力欄で候補がかぶるのを避けたいとき。
export const FewItems: Story = {
  name: '表示件数を絞る',
  render: () => <EmojiSuggestDemo maxItems={3} placeholder=":sm と入力すると3件まで出ます" />,
};

// 一致が無いときの文言。省略すると 0 件では何も出さずに閉じる（既定）。
export const EmptyLabel: Story = {
  name: '候補0件のときの文言',
  render: () => (
    <EmojiSuggestDemo
      emptyLabel="該当する絵文字がありません"
      placeholder=":zzzzz のように一致しない語を入れてみてください"
    />
  ),
};

// 既に本文があるところへ差し込むケース。トリガーは**行頭 or 空白の直後**でしか発火しないので、
// `http://` や `12:34` の `:` では候補が開かない。
export const InSentence: Story = {
  name: '文中に差し込む / 誤発火しない',
  render: () => (
    <EmojiSuggestDemo
      initialText="リリースしました https://example.com 15:30 から "
      placeholder=":par と続けて入力してみてください"
    />
  ),
};
