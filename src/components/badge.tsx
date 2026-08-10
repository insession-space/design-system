import type { ReactNode } from 'react';
import Icon, { type IconName } from '../icons/icon.tsx';
import { twMerge } from '../lib/tw-merge.ts';
import type { SemanticTone } from '../tone.ts';

// Badge（非対話の status/meta ラベル。純粋 leaf UI）。claude design "INSESSION Design System" 準拠（#463 / #663）。
// タップできる要素は Chip、継続的な状態の点+枠は StatusBadge、mono-caps の状態タグは Lozenge、
// 数値は CountChip を使う（役割分離。使い分けの判断表は stories/Overview.mdx）。
// tone の語彙は #962 で 3 部品そろえたので、乗り換えても書き換えは要らない（Badge の accent /
// pro だけがこの部品固有）。
// TONES: success(green) / warning(amber) / accent(coral) / info(blue) /
//   neutral(text-dim + surface-3) / pro(on-fill + fill)。colored tone は pill、neutral/pro は radius-sm の角丸矩形。
// mono / 11px / 600。props: tone / dot(6px 色点) / icon(13) / shape('pill'|'rounded' で上書き)。
// 後方互換: 旧 `variant`('new'|'live') を temporarily 受ける（'new'=success tone の uppercase 小バッジ、
//   'live'=success tone + dot）。パルス点や絶対配置は space-card 側の演出へ切り離した（legacy .live-badge 廃止）。
//
// ⚠ **Badge には赤(danger)が無い。** 他の状態ラベルと違い、この部品の否定的な強調はブランドの
// コーラル(accent)で表す — DS 仕様がそう定めている。真の赤が要る状態表現には StatusBadge か
// Lozenge の danger を使うこと。
//
// ⚠ **tone 名は #962 で正名へ移した。** 旧名 live / warn / danger は別名として受け続ける
// （描画は 1px も変わらない）。移行した理由は 2 つ:
//   1. **同じ色に 2 つの名前があった。** 緑が Badge では live、Status / Lozenge では success、
//      琥珀が warn と warning に割れていて、部品を乗り換えるたびに書き換えが要った。
//      正名は DS 共通の SemanticTone(src/tone.ts)に合わせてある。
//   2. **`danger` という名前が赤を出さなかった。** 実際に描画されるのはコーラルで、同じ
//      `tone="danger"` でも StatusBadge は赤を出す。**同名で別色**は呼び出し側から予測できない。
//      色の方は DS 仕様なので動かさず、名前を実態に合わせて `accent` にした。
// ⚠ 旧名は**新しいコードで使わないこと**。将来のメジャーで落とす。
export type BadgeTone = 'success' | 'warning' | 'accent' | 'info' | 'neutral' | 'pro';

// 旧 tone 名（#962 以前）。正名へ読み替えられるだけで、描画は正名と完全に同じ。
export type BadgeToneLegacy = 'live' | 'warn' | 'danger';

const TONE_ALIAS: Record<BadgeToneLegacy, BadgeTone> = {
  live: 'success',
  warn: 'warning',
  // ⚠ accent へ写す。赤(danger)ではない — 上のコメント参照。
  danger: 'accent',
};

// 旧名なら正名へ、正名ならそのまま返す。
function resolveTone(tone: BadgeTone | BadgeToneLegacy): BadgeTone {
  return (TONE_ALIAS as Record<string, BadgeTone | undefined>)[tone] ?? (tone as BadgeTone);
}

// 件数チップ（旧 .count-chip / .tab-badge）。tab 側は出現アニメを持つので animated で切替。
// ⚠ **中身が数値のときだけ使う。** 参照デザインシステム（Atlassian の Badge、Primer の
// CounterLabel）と同じ役割で、文字列の状態ラベルは Badge / Lozenge / StatusBadge の担当。
const COUNT_TONE: Record<SemanticTone, string> = {
  success: 'bg-success-surface-strong text-success',
  warning: 'bg-warning-surface-strong text-warning',
  danger: 'bg-danger-surface-strong text-danger',
  info: 'bg-info-surface-strong text-info',
  neutral: 'bg-surface-3 text-text-dim',
};

export type CountChipProps = {
  children: ReactNode;
  // 色。既定は success（緑）で、#962 以前の固定色と同じ。
  // ⚠ トーンを足したのは、未読を danger、下書きを neutral で出すといった出し分けが
  // まったくできなかったため。既定を変えていないので既存の呼び出しは 1px も動かない。
  tone?: SemanticTone;
  animated?: boolean;
  // 配置場所ごとの位置調整(例: Bottom Navアイコンへの絶対配置重ね)用の追加クラス。
  className?: string;
};

export function CountChip({
  children,
  tone = 'success',
  animated = false,
  className = '',
}: CountChipProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-pill text-xs font-extrabold tracking-normal',
        COUNT_TONE[tone],
        animated ? ' animate-[pop-in_0.3s_var(--ease-spring)] motion-reduce:animate-none' : '',
        className,
      )}
    >
      {children}
    </span>
  );
}

const TONE: Record<BadgeTone, string> = {
  success: 'text-success bg-success-surface',
  warning: 'text-warning bg-warning-surface',
  accent: 'text-accent-soft bg-tint-12',
  info: 'text-info bg-info-surface',
  neutral: 'text-text-dim bg-surface-3',
  pro: 'text-on-fill bg-fill',
};
const DOT: Record<BadgeTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  accent: 'bg-accent',
  info: 'bg-info',
  neutral: 'bg-text-faint',
  pro: 'bg-on-fill',
};
// colored tone は pill、neutral/pro は角丸矩形（DS）。
const PILL_TONES: BadgeTone[] = ['success', 'warning', 'accent', 'info'];

export type BadgeProps = {
  children: ReactNode;
  // 正名（success / warning / accent / info / neutral / pro）。旧名 live / warn / danger も
  // 受けるが新しいコードでは使わないこと（#962。上のコメント参照）。
  tone?: BadgeTone | BadgeToneLegacy;
  // 先頭に同色のドットを出す（LIVE 等の含意）。
  dot?: boolean;
  // 先頭のアイコン（IconName なら size13、ReactNode はそのまま）。
  icon?: IconName | ReactNode;
  // 形状の上書き（既定は tone から導出）。
  shape?: 'pill' | 'rounded';
  className?: string;
  // 後方互換: 旧 API（'new'=新着 / 'live'=配信中）。tone 指定があればそちらを優先。
  variant?: 'new' | 'live';
};

export function Badge({
  children,
  tone,
  dot = false,
  icon,
  shape,
  className = '',
  variant,
}: BadgeProps) {
  // 旧 variant → tone/装飾の導出。'new' と 'live' はどちらも success(green) tone。
  // tone は旧名で渡されうるので resolveTone を通してから使う（#962）。
  const resolvedTone: BadgeTone = tone != null ? resolveTone(tone) : 'neutral';
  const legacyTone: BadgeTone = variant ? 'success' : resolvedTone;
  const showDot = dot || variant === 'live';
  const legacyNew = variant === 'new';
  const isPill = shape ? shape === 'pill' : PILL_TONES.includes(legacyTone);
  const shapeClass = isPill ? 'rounded-pill' : 'rounded-chip';
  return (
    <span
      className={twMerge(
        'inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 font-body text-xs font-semibold',
        TONE[legacyTone],
        shapeClass,
        legacyNew ? ' uppercase tracking-tag' : '',
        className,
      )}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-pill ${DOT[legacyTone]}`} aria-hidden="true" />
      )}
      {icon != null &&
        (typeof icon === 'string' ? <Icon name={icon as IconName} size={13} /> : icon)}
      {children}
    </span>
  );
}
