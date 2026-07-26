import { Icon, Menu, Popover } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// Popover(Base UI 委譲。#6) + その上に載る Menu(独立して開閉できる)。
const meta: Meta = {
  title: 'Components/Popover',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// 「Popover の中に Menu を置く」旧来の組み合わせ方の再現。Base UI の Menu パート(Item/
// RadioItem/RadioGroup/Separator 等)はいずれも Menu.Root の context を要求するため
// Popover.Popup の中では使えない(Menu.Root の外に置くとクラッシュする)。ここでは
// 振る舞いを持たない Menu.PlainList / Menu.PlainItem を使い、選択状態は旧実装と同じく
// 呼び出し側が active + role="menuitemradio" を渡す形で表現する。
function MenuPopoverDemo() {
  const [selected, setSelected] = useState('queue');
  return (
    <Popover.Root>
      <Popover.Trigger className="rounded-md border border-solid border-border-strong bg-surface px-3 py-2 text-text">
        メニューを開く
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start">
          <Popover.Popup aria-label="ステージ切替" className="min-w-50">
            <Menu.PlainList>
              <Menu.PlainItem
                role="menuitemradio"
                onSelect={() => setSelected('queue')}
                icon={<Icon name="movie" size={18} />}
                trailing={selected === 'queue' ? <Icon name="check" size={16} /> : undefined}
                active={selected === 'queue'}
              >
                Watch Party
              </Menu.PlainItem>
              <Menu.PlainItem
                role="menuitemradio"
                onSelect={() => setSelected('pomodoro')}
                icon={<Icon name="timer" size={18} />}
                trailing={selected === 'pomodoro' ? <Icon name="check" size={16} /> : undefined}
                active={selected === 'pomodoro'}
              >
                Pomodoro
              </Menu.PlainItem>
              <li className="mx-1 my-1 h-px bg-border" />
              <Menu.PlainItem danger onSelect={() => {}} icon={<Icon name="logout" size={18} />}>
                ログアウト
              </Menu.PlainItem>
            </Menu.PlainList>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const WithMenu: Story = {
  render: () => (
    <Section
      title="Popover + Menu"
      note="トリガーをクリックで開閉。外側クリック / Esc で閉じる(Base UI 標準)。行はアイコン/選択中/危険色に対応。"
    >
      <MenuPopoverDemo />
    </Section>
  ),
};

// ビューポート端に寄せたトリガー: Base UI の Positioner は既定でフリップ/シフトが効くため、
// パネルが画面外へはみ出さずに反転・ずらしされることを目で確認できる。
function EdgeFlipDemo() {
  return (
    <div className="flex justify-end pr-2">
      <Popover.Root>
        <Popover.Trigger className="rounded-md border border-solid border-border-strong bg-surface px-3 py-2 text-text">
          右端のトリガー
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="end">
            <Popover.Popup aria-label="端寄せ確認" className="w-70">
              <p className="text-smd text-text-dim">
                画面右端に寄せたトリガーから開く。ビューポート外へはみ出しそうな場合は Base UI
                がフリップ/シフトして見切れを避ける。
              </p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export const EdgeFlip: Story = {
  render: () => (
    <Section
      title="ビューポート端でのフリップ/シフト"
      note="ウィンドウ幅を狭めてトリガーを画面端に近づけると、パネルが見切れないよう反転/ずれることを確認できる。"
    >
      <EdgeFlipDemo />
    </Section>
  ),
};

// Menu 単体(Popover に依存しない)。5項目以上 + サブメニューで矢印キーナビ / typeahead を
// 試せるようにする(項目名の頭文字を続けて叩くと typeahead でジャンプする)。
function MenuOnlyDemo() {
  return (
    <Menu.Root>
      <Menu.Trigger className="rounded-md border border-solid border-border-strong bg-surface px-3 py-2 text-text">
        Menu を開く
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start">
          <Menu.Popup aria-label="ファイル操作" className="min-w-50">
            <Menu.Item icon={<Icon name="edit" size={18} />}>Rename</Menu.Item>
            <Menu.Item icon={<Icon name="link" size={18} />}>Copy link</Menu.Item>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner side="right" align="start">
                  <Menu.Popup aria-label="Share" className="min-w-50">
                    <Menu.Item>Copy link</Menu.Item>
                    <Menu.Item>Invite people</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
            <Menu.Separator className="mx-1 my-1 h-px bg-border" />
            <Menu.Item icon={<Icon name="history" size={18} />}>Version history</Menu.Item>
            <Menu.Item icon={<Icon name="settings" size={18} />}>Settings</Menu.Item>
            <Menu.Item danger icon={<Icon name="logout" size={18} />}>
              Delete
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export const MenuKeyboardNav: Story = {
  render: () => (
    <Section
      title="Menu の矢印キーナビ / typeahead"
      note="開いた状態で ↑/↓ キーでハイライトが移動し、文字キーを続けて叩くと一致する項目へ typeahead でジャンプする(Base UI 標準)。Share はサブメニュー。"
    >
      <MenuOnlyDemo />
    </Section>
  ),
};

// Base UI 版 Menu(Item/RadioItem/CheckboxItem/Separator/Group/GroupLabel/SubmenuTrigger)の
// 状態一覧。toneClassName の active(green tint 10%→20%)/danger(danger-surface)/既定
// (surface-hover)のハイライトと、disabled 行が面色を出さないことを1つのメニューの中で
// 確認できるようにする(#6 のハイライト対応の受け入れ確認用)。
function MenuStatesDemo() {
  const [radioValue, setRadioValue] = useState('date');
  const [minimapChecked, setMinimapChecked] = useState(true);
  return (
    <Menu.Root>
      <Menu.Trigger className="rounded-md border border-solid border-border-strong bg-surface px-3 py-2 text-text">
        状態一覧を開く
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start">
          <Menu.Popup aria-label="状態一覧" className="min-w-56">
            <Menu.Group>
              <Menu.GroupLabel className="px-[13px] py-1 text-xs text-text-dim">
                既定 tone
              </Menu.GroupLabel>
              <Menu.Item icon={<Icon name="edit" size={18} />}>アイコンあり</Menu.Item>
              <Menu.Item trailing={<Icon name="check" size={16} />}>trailing あり</Menu.Item>
              <Menu.Item>アイコン/trailing なし</Menu.Item>
              <Menu.Item disabled icon={<Icon name="settings" size={18} />}>
                disabled
              </Menu.Item>
            </Menu.Group>
            <Menu.Separator className="mx-1 my-1 h-px bg-border" />
            <Menu.Item danger icon={<Icon name="logout" size={18} />}>
              danger
            </Menu.Item>
            <Menu.Item active icon={<Icon name="check" size={18} />}>
              active(単体 Item)
            </Menu.Item>
            <Menu.Separator className="mx-1 my-1 h-px bg-border" />
            <Menu.RadioGroup value={radioValue} onValueChange={(value) => setRadioValue(value)}>
              <Menu.RadioItem value="date" active={radioValue === 'date'}>
                Sort by date
              </Menu.RadioItem>
              <Menu.RadioItem value="name" active={radioValue === 'name'}>
                Sort by name(active でない行)
              </Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.Separator className="mx-1 my-1 h-px bg-border" />
            <Menu.CheckboxItem
              checked={minimapChecked}
              onCheckedChange={setMinimapChecked}
              active={minimapChecked}
              trailing={minimapChecked ? <Icon name="check" size={16} /> : undefined}
            >
              Minimap(チェック済み/未チェックを切り替え)
            </Menu.CheckboxItem>
            <Menu.Separator className="mx-1 my-1 h-px bg-border" />
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>Share(既定 chevron trailing)</Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner side="right" align="start">
                  <Menu.Popup aria-label="Share" className="min-w-50">
                    <Menu.Item>Copy link</Menu.Item>
                    <Menu.Item>Invite people</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export const MenuStates: Story = {
  render: () => (
    <Section
      title="Menu の状態一覧(Base UI 版)"
      note="↑/↓ キーで移動すると各 tone のハイライトが確認できる(既定=surface-hover / danger=danger-surface / active=success 20% tint)。disabled 行はハイライトも hover も面色が出ない。Sort by date/name は RadioGroup、Minimap はチェックの切り替えができる。"
    >
      <MenuStatesDemo />
    </Section>
  ),
};

// mobileSheet: max-sm でトリガー追従をやめ、position:fixed + 左右対称ガターでビューポートに
// 固定表示する(旧実装のモバイルシート挙動を Positioner の mobileSheet prop で再現)。
function MobileSheetDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger className="rounded-md border border-solid border-border-strong bg-surface px-3 py-2 text-text">
        モバイルシートを開く
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" mobileSheet>
          <Popover.Popup aria-label="モバイルシート確認">
            <p className="text-smd text-text-dim">
              画面幅が sm(640px)未満だと左右対称 12px ガターの固定シート表示になる。sm 以上は
              通常のトリガー追従に戻る。
            </p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const MobileSheet: Story = {
  render: () => (
    <Section
      title="mobileSheet"
      note="ビューポート幅を 640px 未満にすると、トリガー追従をやめて左右対称ガターの固定シート表示になることを確認できる。"
    >
      <MobileSheetDemo />
    </Section>
  ),
};

// 行ラベルは配列で持つ(key に配列 index を使わない)。
const DEFAULT_ROWS = Array.from({ length: 12 }, (_, i) => `行 ${i + 1}`);
const SCROLL_ROWS = Array.from({ length: 20 }, (_, i) => `項目 ${i + 1}`);

// padding / scroll props(#21)。v1 の panelPadding / panelScroll と同じ既定(どちらも true)で、
// false にすると「打ち消す」のではなく **そもそもクラスを出さない**。ヘッダー固定 + リストだけ
// スクロールのように独自の高さ/スクロール領域を組むパネルはこれを切る。
function PanelOptionsDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <Popover.Root>
        <Popover.Trigger className="rounded-md border border-solid border-border-strong bg-surface px-3 py-2 text-text">
          既定（padding + scroll）
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start">
            <Popover.Popup aria-label="既定" className="w-64">
              <p className="text-smd text-text-dim">
                p-3 の内側 padding と max-h-80 + 内部スクロールが付く。下に長い中身を置くと
                パネル自身がスクロールする。
              </p>
              {DEFAULT_ROWS.map((row) => (
                <p key={row} className="text-smd text-text-faint">
                  {row}
                </p>
              ))}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      <Popover.Root>
        <Popover.Trigger className="rounded-md border border-solid border-border-strong bg-surface px-3 py-2 text-text">
          padding=false
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start">
            <Popover.Popup aria-label="padding なし" padding={false} className="w-64">
              <div className="border-b border-solid border-border px-4 py-3 font-bold text-text">
                固定ヘッダー
              </div>
              <p className="px-4 py-3 text-smd text-text-dim">
                パネル自身の padding が無いので、ヘッダーの下線を端まで引ける。
              </p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      <Popover.Root>
        <Popover.Trigger className="rounded-md border border-solid border-border-strong bg-surface px-3 py-2 text-text">
          padding=false scroll=false
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start">
            <Popover.Popup
              aria-label="独自スクロール"
              padding={false}
              scroll={false}
              className="flex w-64 max-h-[220px] flex-col overflow-hidden"
            >
              <div className="shrink-0 border-b border-solid border-border px-4 py-3 font-bold text-text">
                固定ヘッダー
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                {SCROLL_ROWS.map((row) => (
                  <p key={row} className="text-smd text-text-faint">
                    {row}
                  </p>
                ))}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export const PanelOptions: Story = {
  render: () => (
    <Section
      title="padding / scroll"
      note="どちらも既定 true（v1 の panelPadding / panelScroll と同じ）。false にするとクラスを出さないので、className での打ち消しに頼らずヘッダー固定＋リストだけスクロールのパネルが組める。"
    >
      <PanelOptionsDemo />
    </Section>
  ),
};
