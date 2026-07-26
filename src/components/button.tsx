import { Button as BaseButton } from '@base-ui/react/button';
import type { ReactNode } from 'react';
import Icon, { type IconName } from '../icons/icon.tsx';
import Spinner from './spinner.tsx';

// DS のボタン（純粋 leaf UI）。claude design "INSESSION Design System" のボタン仕様に準拠（#463 / #663）。
// variant: primary=中立塗り(fill) / accent=コーラル / secondary=2px アウトライン / ghost=テキスト(info) /
//   live=ライブ緑の pill + 先頭ドット(Join session。DS の正名) / danger=危険(アプリ固有・DS外だが必要)。
// `join` は歴史的別名として live にマップする（後方互換。消費側は当面そのまま動く）。
// radius は既定 DS の md(10px)。pill prop で rounded-pill、live/join は常に pill。font 15px、
// weight は primary/accent/secondary/danger/live=700・ghost=600。disabled は DS の沈んだ面(surface-3 + text-dim)。
// hover は DS へ準拠: soft(secondary/ghost)=surface-hover の面変化 / filled(primary/accent/live/danger)=brightness(.93)。
// press=scale(.97)。フォーカスは shadow-focus。i18n は持たない（ラベルは children）。
// icon / iconRight は名前(IconName)なら fontSize+2 の Icon を、ReactNode ならそのまま先頭/末尾に置く。
export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'live'
  | 'join';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // 読み込み中。スピナーを表示し操作不可にする（disabled と同様に押せない）。
  loading?: boolean;
  // pill 形状(rounded-pill)にする。既定は DS の md(rounded-md)。ポップオーバー内の
  // コンパクトなアップロード導線など丸い体裁が欲しい箇所で使う(#517)。live/join は歴史的に常に pill。
  pill?: boolean;
  // 先頭に白い小ドットを出す(DS の dot)。live/join では既定で出る。
  dot?: boolean;
  // 先頭/末尾のアイコン。IconName(文字列)なら Icon をサイズ自動で描画、ReactNode ならそのまま。
  icon?: IconName | ReactNode;
  iconRight?: IconName | ReactNode;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof BaseButton>, 'className' | 'render'> & {
    className?: string;
  };

// border-2 を基底に置き、secondary(2px 枠)と他(透明枠)で外形を揃える(box-border)。
// 角丸(rounded-md / rounded-pill)は同一ユーティリティの競合を避けるため BASE に含めず
// radius として一方だけを組み立てて付与する(#517)。
// ⚠ disabled 系は `disabled:` / `enabled:` ではなく **`data-disabled:` / `not-data-disabled:`**
// で書く（#33）。Base UI の Button に `focusableWhenDisabled` を渡すと、`disabled` 属性を出さず
// **`aria-disabled` に切り替わる**（disabled なボタンがキーボードナビから消える問題への対処。
// utils/useFocusableWhenDisabled.js 参照）。そのとき CSS の `:disabled` / `:enabled` 疑似クラスは
// マッチしなくなるため、`disabled:` のままだと **disabled が視覚的に無効化されず、しかも
// hover が効いてしまう**。Base UI Button は state の disabled を常に `data-disabled` として
// 出すので、そちらを見れば両方の経路（disabled 属性 / aria-disabled）を1つの書き方で拾える。
// 値は移行前から変えていない。
const BASE =
  'inline-flex items-center justify-center gap-2 border-2 border-solid border-transparent box-border font-display cursor-pointer select-none transition-[transform,filter,background,color,box-shadow] duration-(--dur-fast) ease-spring not-data-disabled:active:scale-[0.97] data-disabled:bg-surface-3 data-disabled:text-text-dim data-disabled:border-transparent data-disabled:cursor-not-allowed data-disabled:shadow-none focus-visible:shadow-focus focus-visible:outline-none';

// hover も `enabled:hover:` ではなく `hover:not-data-disabled:` で書く（理由は BASE のコメント）。
const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-fill text-on-fill font-bold hover:not-data-disabled:brightness-[.93]',
  accent: 'bg-accent text-on-accent font-bold hover:not-data-disabled:brightness-[.93]',
  secondary:
    'bg-transparent border-text text-text font-bold hover:not-data-disabled:bg-surface-hover',
  ghost: 'bg-transparent text-info font-semibold hover:not-data-disabled:bg-surface-hover',
  danger:
    'bg-danger-surface border-danger-border text-danger font-bold hover:not-data-disabled:brightness-[.93]',
  live: 'bg-success text-white font-bold hover:not-data-disabled:brightness-[.93]',
  // 後方互換: join は live と同一。
  join: 'bg-success text-white font-bold hover:not-data-disabled:brightness-[.93]',
};

// DS の padding。primary/accent/danger/live は 12/22。ghost は横を詰める(テキストボタン)。
// xs はポップオーバー/モバイル向けのコンパクト(#517)。DS の xs 仕様(px-3/py-1.5, text-xs)に準拠(#854)。
const SIZE: Record<ButtonSize, string> = {
  xs: 'text-xs px-3 py-1.5',
  sm: 'text-sm px-4 py-2',
  md: 'text-md px-[22px] py-3',
  lg: 'text-md px-7 py-3.5',
};
const GHOST_PAD = 'px-3.5';

const SPINNER_SIZE: Record<ButtonSize, number> = { xs: 12, sm: 13, md: 15, lg: 16 };
// DS: Icon は fontSize+2。size ごとの実 px(11/12/15/16 → +2)。
const ICON_SIZE: Record<ButtonSize, number> = { xs: 13, sm: 14, md: 17, lg: 18 };

function renderIcon(icon: IconName | ReactNode, px: number): ReactNode {
  if (icon == null) return null;
  if (typeof icon === 'string') return <Icon name={icon as IconName} size={px} />;
  return icon;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  pill = false,
  dot = false,
  icon,
  iconRight,
  type = 'button',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const pad = variant === 'ghost' ? `${SIZE[size]} ${GHOST_PAD}` : SIZE[size];
  const isLive = variant === 'live' || variant === 'join';
  // live/join は歴史的に常に pill 形状。それ以外は pill prop に従う。
  const radius = pill || isLive ? 'rounded-pill' : 'rounded-md';
  const showDot = (dot || isLive) && !loading;
  const iconPx = ICON_SIZE[size];
  return (
    <BaseButton
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${BASE} ${radius} ${VARIANT[variant]} ${pad} ${className}`.trim()}
      {...rest}
    >
      {showDot && <span className="h-2 w-2 rounded-pill bg-white" aria-hidden="true" />}
      {loading && <Spinner size={SPINNER_SIZE[size]} />}
      {!loading && renderIcon(icon, iconPx)}
      {children}
      {!loading && renderIcon(iconRight, iconPx)}
    </BaseButton>
  );
}
