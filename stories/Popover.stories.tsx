import { Icon, Menu, MenuItem, Popover } from '@in-session/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// ポップオーバー基盤(外側クリック / Esc close 内包) + その上に載る Menu / MenuItem。
const meta: Meta = {
  title: 'Components/Popover',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function MenuPopoverDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('queue');
  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      ariaLabel="ステージ切替"
      panelClassName="min-w-[200px]"
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          メニューを開く
        </button>
      }
    >
      <Menu ariaLabel="ステージ">
        <MenuItem
          role="menuitemradio"
          active={selected === 'queue'}
          icon={<Icon name="movie" size={18} />}
          trailing={selected === 'queue' ? <Icon name="check" size={16} /> : undefined}
          onSelect={() => {
            setSelected('queue');
            setOpen(false);
          }}
        >
          Watch Party
        </MenuItem>
        <MenuItem
          role="menuitemradio"
          active={selected === 'pomodoro'}
          icon={<Icon name="timer" size={18} />}
          trailing={selected === 'pomodoro' ? <Icon name="check" size={16} /> : undefined}
          onSelect={() => {
            setSelected('pomodoro');
            setOpen(false);
          }}
        >
          Pomodoro
        </MenuItem>
        <MenuItem danger icon={<Icon name="logout" size={18} />} onSelect={() => setOpen(false)}>
          ログアウト
        </MenuItem>
      </Menu>
    </Popover>
  );
}

export const WithMenu: Story = {
  render: () => (
    <Section
      title="Popover + Menu"
      note="トリガーをクリックで開閉。外側クリック / Esc で閉じる(内包)。行はアイコン/選択中/危険色に対応。"
    >
      <MenuPopoverDemo />
    </Section>
  ),
};
