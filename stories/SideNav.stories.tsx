import { Badge, LogoMark, SideNav } from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Section } from './tokens';

// 画面左の縦ナビ（左レール）。compound API（SideNav.Root / .Brand / .Group / .Item）。
// active は DS が導出せず呼び出し側が渡す。要素の実体は `render` で差し替える（react-router の
// NavLink など）。ここでは story 内で持てないため素の <a> / <button> のまま見せる。
const meta: Meta<typeof SideNav.Root> = {
  title: 'Navigation/SideNav',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof SideNav.Root>;

// レールは全高（h-dvh）が既定。story 内では高さのある枠に収めて見せる。
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[520px] overflow-hidden rounded-card border border-border">
      {children}
    </div>
  );
}

// insession-app（web）の左レール: ロゴ + 主導線（アイコン付き）+ 最下部の副次リンク群
// （外部リンク・NEW バッジ）。
export const Default: Story = {
  render: () => (
    <Section
      title="アプリの左レール"
      note="ロゴ + 主導線 + 最下部の副次リンク群。active は呼び出し側が渡す（aria-current='page' と data-active が付く）。"
    >
      <Frame>
        <SideNav.Root aria-label="メインナビゲーション" fullHeight={false}>
          <SideNav.Brand href="#" aria-label="InSession">
            <LogoMark size={34} />
          </SideNav.Brand>
          <SideNav.Group>
            <SideNav.Item href="#" icon="home" active>
              ホーム
            </SideNav.Item>
            <SideNav.Item href="#" icon="search">
              探索
            </SideNav.Item>
            <SideNav.Item href="#" icon="diversity_3">
              コミュニティ
            </SideNav.Item>
          </SideNav.Group>
          <SideNav.Group secondary>
            <SideNav.Item href="#" external>
              使い方ガイド
            </SideNav.Item>
            <SideNav.Item href="#" external>
              ヘルプ
            </SideNav.Item>
            <SideNav.Item href="#" external trailing={<Badge variant="new">NEW</Badge>}>
              リリースノート
            </SideNav.Item>
          </SideNav.Group>
        </SideNav.Root>
        <div className="flex-1 p-6 text-text-dim">コンテンツ列</div>
      </Frame>
    </Section>
  ),
};

// loophub-app の使い方: ルーティングを持ち込まず、選択キーと onSelect で切り替える。
// href を渡さない Item は <button type="button"> として描画される。
export const ButtonItems: Story = {
  render: () => {
    const [value, setValue] = useState('dashboard');
    const items = [
      { key: 'dashboard', icon: 'home', label: 'ダッシュボード' },
      { key: 'requests', icon: 'history', label: 'リクエスト' },
      { key: 'settings', icon: 'settings', label: '設定' },
    ] as const;

    return (
      <Section
        title="ボタンとして使う"
        note="href を渡さない Item は <button type='button'>。選択状態は value 比較で呼び出し側が決める。"
      >
        <Frame>
          <SideNav.Root aria-label="ナビゲーション" fullHeight={false}>
            <SideNav.Group>
              {items.map((it) => (
                <SideNav.Item
                  key={it.key}
                  icon={it.icon}
                  active={it.key === value}
                  onClick={() => setValue(it.key)}
                >
                  {it.label}
                </SideNav.Item>
              ))}
            </SideNav.Group>
          </SideNav.Root>
          <div className="flex-1 p-6 text-text-dim">選択中: {value}</div>
        </Frame>
      </Section>
    );
  },
};

// `render` で要素の実体を差し替える（react-router の NavLink 等）。ここでは差し替えが効くことを
// 示すため、data-testid 付きの独自要素へ差し替える。
export const CustomElement: Story = {
  render: () => (
    <Section
      title="render で要素を差し替える"
      note="Base UI の useRender。<SideNav.Item render={<NavLink to='/' />} /> のようにルーターの Link へ差し替えられる。"
    >
      <Frame>
        <SideNav.Root aria-label="差し替えの例" fullHeight={false}>
          <SideNav.Group>
            <SideNav.Item icon="home" active render={<a href="#" data-example="router-link" />}>
              独自要素へ差し替え
            </SideNav.Item>
            <SideNav.Item icon="search" render={<a href="#" data-example="router-link" />}>
              もう1つ
            </SideNav.Item>
          </SideNav.Group>
        </SideNav.Root>
        <div className="flex-1 p-6 text-text-dim">コンテンツ列</div>
      </Frame>
    </Section>
  ),
};
