import type { ReactNode } from 'react';
import Avatar, { type AvatarStatus } from '../components/avatar.tsx';
import { type Gap, HStack, VStack } from '../components/layout.tsx';

// アバター + ユーザー名の複合コンポーネント(#62)。src/components/ のプリミティブ(Avatar /
// HStack / VStack)を束ねるので src/ui-kit/ に置く。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// 持つのは「アバター寸法とテキストサイズを連動させる」という取り決めだけ。呼び出し側が
// Avatar とテキストを別々に組み合わせると size 指定を揃え忘れてタイポが崩れる(アバターだけ
// 大きい/文字だけ大きい)問題が起きるため、3段階の size を1つの Record にまとめてここで固定する。
//
// アバターは隣に同じ名前が出るぶん装飾でしかないので aria-hidden で支援技術から隠す
// (隠さないと Avatar の alt と fallback の頭文字で名前が二重に読まれる)。
//
// ⚠ Avatar は status / ring を指定しないと legacy 経路(素の img/span。見た目を消費側 CSS に
// 依存)を返す(avatar.tsx 参照)。UserLabel は status 指定の有無で見た目・fallback 挙動が
// ぶれると困るため、常に Avatar へ `ds` を渡して DS 経路(Base UI の Avatar.Root/Image/
// Fallback)で描画させる(#62 で avatar.tsx に追加した内部フラグ)。

export type UserLabelSize = 'sm' | 'md' | 'lg';

type SizeSpec = {
  // Avatar の寸法(px)。
  avatar: number;
  // 名前行の文字サイズクラス。
  name: string;
  // subtitle 行の文字サイズクラス。
  subtitle: string;
  // アバターとテキスト列の間の gap(HStack)。
  gap: Gap;
  // 名前と subtitle の間の gap(VStack)。
  stackGap: Gap;
};

// サイズごとの寸法・文字サイズはここに1つだけ定義する(呼び出し側でのタイポずれを防ぐのが
// 本コンポーネントの主目的)。text-* はいずれも src/styles/theme.css の --text-* トークンから
// 生成される既存クラス(text-body / text-small 等)で、色値と同様に生の px を書かない。
// 名前は DS のセマンティック階層(text-small / text-body / text-h2)を1段ずつ上げ、subtitle は
// 常にその1段下を当てる。3段とも実寸が変わる(14/16/22px)ようにしてあるので、size を上げると
// アバターと文字が揃って大きくなる。
const SIZE: Record<UserLabelSize, SizeSpec> = {
  sm: { avatar: 24, name: 'text-small', subtitle: 'text-xs', gap: 'sm', stackGap: 'none' },
  md: { avatar: 40, name: 'text-body', subtitle: 'text-small', gap: 'md', stackGap: 'xs' },
  lg: { avatar: 56, name: 'text-h2', subtitle: 'text-body', gap: 'md', stackGap: 'xs' },
};

export type UserLabelProps = {
  // 表示するユーザー名。
  name: string;
  // アバター画像 URL。無し/読み込み失敗時は Avatar の fallback(名前の頭文字)に切り替わる。
  src?: string | null;
  // 名前の下に出す補助テキスト(役割・肩書きなど)。省略時は1行表示になる。
  subtitle?: ReactNode;
  size?: UserLabelSize;
  // 以下は Avatar へそのまま透過する。
  status?: AvatarStatus;
  ring?: boolean;
  color?: string;
  bgColor?: string;
  className?: string;
};

export default function UserLabel({
  name,
  src,
  subtitle,
  size = 'md',
  status,
  ring,
  color,
  bgColor,
  className = '',
}: UserLabelProps) {
  const spec = SIZE[size];
  return (
    <HStack gap={spec.gap} align="center" className={`min-w-0 ${className}`.trim()}>
      {/* アバターは隣の名前と同じ情報しか持たない装飾なので支援技術から隠す。隠さないと
          Avatar の alt(= name)と fallback の頭文字が読み上げられ、名前が二重に読まれる。 */}
      <div aria-hidden="true" className="shrink-0">
        <Avatar
          ds
          name={name}
          src={src}
          size={spec.avatar}
          status={status}
          ring={ring}
          color={color}
          bgColor={bgColor}
        />
      </div>
      {/* min-w-0 が無いと flex の既定(min-width: auto)により子の truncate が効かない
          (feed-item.tsx の FeedItemAttachment と同じ理由)。 */}
      <div className="min-w-0 flex-1">
        {subtitle != null ? (
          <VStack gap={spec.stackGap} className="min-w-0">
            <span className={`block truncate font-body font-bold text-text ${spec.name}`}>
              {name}
            </span>
            <span className={`block truncate font-body text-text-dim ${spec.subtitle}`}>
              {subtitle}
            </span>
          </VStack>
        ) : (
          <span className={`block truncate font-body font-bold text-text ${spec.name}`}>
            {name}
          </span>
        )}
      </div>
    </HStack>
  );
}
