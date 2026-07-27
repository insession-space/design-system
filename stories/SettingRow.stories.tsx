import {
  Button,
  Divider,
  Icon,
  Paper,
  SegmentedControl,
  SettingRow,
  Toggle,
} from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 設定行(#73)。「ラベル(+説明)」の左側と「Toggle / SegmentedControl / Button / 値」の右側。
// 既定は非対話(<div>)で、href / onClick を渡したときだけ左側が <a> / <button> になる。
// trailing は常に対話要素の**外**に置かれるので、行を対話的にしても入れ子にならない。
const meta: Meta<typeof SettingRow> = {
  title: 'Data Display/SettingRow',
  component: SettingRow,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SettingRow>;

// 設定モーダルの実際の形(insession-app のアカウント設定)に寄せた例。
function SettingsPanel() {
  const [sound, setSound] = useState(true);
  const [pip, setPip] = useState(false);
  const [notify, setNotify] = useState(true);
  const [theme, setTheme] = useState('dark');

  return (
    <Paper className="max-w-[560px] px-4 py-2">
      <SettingRow
        label="効果音"
        description="チャットの受信やリアクションで音を鳴らす"
        trailing={
          <Toggle
            checked={sound}
            onChange={() => setSound((v) => !v)}
            label="効果音"
            data-testid="toggle-sound"
          />
        }
      />
      <Divider />
      <SettingRow
        label="自動 PiP"
        description="タブを離れたときにピクチャーインピクチャーへ切り替える"
        trailing={<Toggle checked={pip} onChange={() => setPip((v) => !v)} label="自動 PiP" />}
      />
      <Divider />
      <SettingRow
        label="通知"
        description="スペースに接続中、タブが背面にあるときだけ OS 通知を出す。長い説明文でも折り返して全文が読める(descriptionLines 既定 'none')。"
        trailing={<Toggle checked={notify} onChange={() => setNotify((v) => !v)} label="通知" />}
      />
      <Divider />
      <SettingRow
        label="テーマ"
        description="ライト / ダークの切り替え"
        trailing={
          <SegmentedControl
            value={theme}
            onValueChange={(v) => setTheme(v as string)}
            ariaLabel="テーマ"
            items={[
              { value: 'dark', label: 'ダーク' },
              { value: 'light', label: 'ライト' },
            ]}
          />
        }
      />
      <Divider />
      <SettingRow
        label="ブロック中のユーザー"
        description="3 人"
        trailing={<Button variant="ghost">管理</Button>}
      />
    </Paper>
  );
}

export const NonInteractiveWithTrailingControls: Story = {
  render: () => (
    <Section
      title="非対話の行 + 末尾のコントロール(主用途)"
      note="行そのものは <div> なので、末尾の Toggle / SegmentedControl / Button がそのまま押せる(<button> の中に <button> が入らない)。旧 ListRow が <button> 固定で扱えなかった形。"
    >
      <SettingsPanel />
    </Section>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Section
      title="対話的な行(href / onClick)"
      note="href → <a> / onClick → <button>。対話部分は左側(アイコン + ラベル + 説明 + chevron)だけで、trailing はその外に残る。disabled は hover の面を出さない。"
    >
      <Paper className="max-w-[560px] px-4 py-2">
        <SettingRow
          icon={<Icon name="settings" size={18} />}
          label="プラグイン"
          description="Watch Party / Pomodoro / Tetris"
          chevron
          onClick={() => {}}
        />
        <Divider />
        <SettingRow
          label="ヘルプ"
          description="使い方ガイドを開く"
          href="https://help.insession.space"
          target="_blank"
          rel="noreferrer"
          chevron
        />
        <Divider />
        <SettingRow
          label="連携済みアカウント"
          description="押せる行 + 末尾の値。値はリンクの外にあるので選択・コピーできる"
          href="#linked"
          trailing={<span className="text-sm text-text-dim">YouTube</span>}
          chevron
        />
        <Divider />
        <SettingRow label="無効な行" description="disabled" onClick={() => {}} chevron disabled />
      </Paper>
    </Section>
  ),
};

export const DescriptionLines: Story = {
  render: () => (
    <Section
      title="説明文の行数(descriptionLines)"
      note="'none'(既定)=折り返して全文 / 1 = 1行で省略(旧 ListRow の見た目) / 2・3 = その行数でクランプ。"
    >
      <Paper className="max-w-[420px] px-4 py-2">
        {(['none', 1, 2, 3] as const).map((lines) => (
          <SettingRow
            key={String(lines)}
            label={`descriptionLines={${typeof lines === 'string' ? `'${lines}'` : lines}}`}
            description="スペースに接続中でも、タブが非可視あるいは非フォーカスのときにだけ OS 通知を出す。前面にあるときはアプリ内で見えるので通知しない。"
            descriptionLines={lines}
          />
        ))}
      </Paper>
    </Section>
  ),
};

export const Danger: Story = {
  render: () => (
    <Section title="破壊的操作(danger)" note="ラベルを危険色にする。退会・削除などに使う。">
      <Paper className="max-w-[560px] px-4 py-2">
        <SettingRow
          label="退会する"
          description="アカウントとすべてのデータが削除される"
          danger
          trailing={<Button variant="danger">退会</Button>}
        />
      </Paper>
    </Section>
  ),
};
