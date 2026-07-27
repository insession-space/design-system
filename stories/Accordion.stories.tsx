import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarStack,
  Badge,
  Button,
  Chip,
  CountChip,
} from '@insession/design-system';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { Section } from './tokens';

// 折りたたみリスト。一覧の各行を要約1行に圧縮し、開いた1件だけが中身を出す（同時に開けるのは1件）。
// 完全な制御コンポーネントなので、カタログ側で value/onChange を持つ薄いラッパーを噛ませる。
const meta: Meta<typeof Accordion> = {
  title: 'Navigation/Accordion',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

// ストーリーはどれも「開いている1件」を state で持つだけ。DS 側は state を持たない。
function Demo({ children, initial = null }: { children: ReactNode; initial?: string | null }) {
  const [open, setOpen] = useState<string | null>(initial);
  return (
    <Accordion value={open} onChange={setOpen}>
      {children}
    </Accordion>
  );
}

const BODY =
  '今日の作業配信、21時からやります。もくもく会みたいな雰囲気でやるので、途中参加・途中退出どちらも歓迎です。';

export const Default: Story = {
  render: () => (
    <Section
      title="既定"
      note="閉じているときは要約1行に圧縮される。別の行を開くと前の行は閉じる（単一開閉）。"
    >
      <Demo>
        <AccordionItem
          itemId="a"
          title="今夜の作業配信について"
          summary={BODY}
          meta={<span>返信 4 件 · 更新 1日前</span>}
        >
          <p className="m-0 font-body text-sm text-text-dim">
            開いたときだけ出る中身。返信リストや入力欄など、重いものはここに置く。
          </p>
        </AccordionItem>
        <AccordionItem
          itemId="b"
          title="ポモドーロの長さを 30 分にしませんか"
          summary="25分だと乗ってきたところで切れてしまうので、30分 + 休憩7分くらいが合っている気がします。"
          meta={<span>返信 12 件 · 更新 3時間前</span>}
        >
          <p className="m-0 font-body text-sm text-text-dim">2件目の中身。</p>
        </AccordionItem>
        <AccordionItem
          itemId="c"
          title="Watch Party の同期がたまにズレる"
          summary="回線が細いときに 2〜3 秒ずれることがあります。再現手順を書きました。"
          meta={<span>返信 2 件 · 更新 5日前</span>}
        >
          <p className="m-0 font-body text-sm text-text-dim">3件目の中身。</p>
        </AccordionItem>
      </Demo>
    </Section>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <Section
      title="Avatar / メタ行つき"
      note="leading に Avatar、meta に AvatarStack や件数を差す。DS はスロットの器だけを持つ。"
    >
      <Demo initial="a">
        <AccordionItem
          itemId="a"
          leading={<Avatar name="Miko" size={40} color="var(--color-mint)" ring />}
          title={
            <>
              <span>Miko</span>
              <span className="font-normal text-text-faint">· 1日前</span>
              <Badge variant="new">NEW</Badge>
            </>
          }
          summary={BODY}
          meta={
            <>
              <AvatarStack
                people={[{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }, { name: 'E' }]}
                max={4}
                size={22}
              />
              <span>💬 4</span>
              <span>👍 ❤️ 🔥 20</span>
            </>
          }
        >
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-wrap gap-1.5">
              <Chip selected>👍 12</Chip>
              <Chip>❤️ 6</Chip>
              <Chip>🔥 2</Chip>
            </div>
            <Button variant="ghost" size="sm">
              もっと見る（残り 2件）
            </Button>
          </div>
        </AccordionItem>
        <AccordionItem
          itemId="b"
          leading={<Avatar name="Ren" size={40} color="var(--color-violet)" ring />}
          title={
            <>
              <span>Ren</span>
              <span className="font-normal text-text-faint">· 3時間前</span>
              <CountChip>12</CountChip>
            </>
          }
          summary="25分だと乗ってきたところで切れてしまうので、30分 + 休憩7分くらいが合っている気がします。"
          meta={<span>更新 3時間前</span>}
        >
          <p className="m-0 font-body text-sm text-text-dim">2件目の中身。</p>
        </AccordionItem>
      </Demo>
    </Section>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Section
      title="disabled"
      note="開けず、↑ ↓ / Home / End でのフォーカス移動でもスキップされる（button の disabled）。"
    >
      <Demo>
        <AccordionItem itemId="a" title="開ける行" summary="通常どおり開閉できる。">
          <p className="m-0 font-body text-sm text-text-dim">中身。</p>
        </AccordionItem>
        <AccordionItem
          itemId="b"
          disabled
          title="開けない行（disabled）"
          summary="アーカイブ済み・権限が無い、といった理由で開かせたくない行。"
        >
          <p className="m-0 font-body text-sm text-text-dim">この中身には到達できない。</p>
        </AccordionItem>
        <AccordionItem
          itemId="c"
          title="開ける行"
          summary="↓ を押すと b を飛ばして a ↔ c を往復する。"
        >
          <p className="m-0 font-body text-sm text-text-dim">中身。</p>
        </AccordionItem>
      </Demo>
    </Section>
  ),
};

const LONG = `長文の本文。閉じているときは summaryLines 行でクランプされ、開くと全文に戻る。${'この文はクランプの検証のために繰り返している。'.repeat(
  8,
)}`;

export const LongContent: Story = {
  render: () => (
    <Section
      title="長文 / summaryLines"
      note="既定は 2 行クランプ。summaryLines で行数を変えられる。開くとクランプが外れて全文になる。"
    >
      <Demo>
        <AccordionItem itemId="a" title="既定（2行クランプ）" summary={LONG}>
          <p className="m-0 font-body text-sm text-text-dim">中身。</p>
        </AccordionItem>
        <AccordionItem itemId="b" summaryLines={1} title="summaryLines=1" summary={LONG}>
          <p className="m-0 font-body text-sm text-text-dim">中身。</p>
        </AccordionItem>
        <AccordionItem itemId="c" summaryLines={4} title="summaryLines=4" summary={LONG}>
          <p className="m-0 font-body text-sm text-text-dim">中身。</p>
        </AccordionItem>
      </Demo>
    </Section>
  ),
};
