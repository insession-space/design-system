import { Progress } from '@base-ui/react/progress';
import type { CSSProperties } from 'react';

// 円形カウントダウンタイマー(純粋 leaf UI)。時間計算はしない — 呼び出し側が
// secondsLeft/totalSeconds を毎フレーム渡すだけの純粋表示部品(リレーゲーム等の残り時間表示 #974)。
// conic-gradient + mask でリングを描き(mask の #000 はアルファ用のクリップ指定でありトークン違反ではない)、
// 中央に残り秒数 + caption(i18n は持たないため注入)を重ねる。urgent(secondsLeft <= urgentThreshold)
// では accent 色へ切り替え、ゆっくり脈動させる。脈動の keyframes は insession-app の apps/web/src/style.css に定義
// (このパッケージ自体は keyframes を持たない既存流儀。badge.tsx の pop-in / modal.tsx の card-in と同じ)。
// prefers-reduced-motion は同ファイル末尾のグローバルルールで自動的に止まる(spinner.tsx と同じ扱い)。
export type RingTimerProps = {
  secondsLeft: number;
  totalSeconds: number;
  // 直径(px)。既定 118。
  size?: number;
  // secondsLeft がこれ以下で urgent 表示(accent 色 + 脈動)に切り替える。既定 10。
  urgentThreshold?: number;
  // 数字の下に出す小さい説明文言(i18n は持たないため注入。例「のこり秒」)。
  caption?: string;
  className?: string;
};

export default function RingTimer({
  secondsLeft,
  totalSeconds,
  size = 118,
  urgentThreshold = 10,
  caption,
  className = '',
}: RingTimerProps) {
  const urgent = secondsLeft <= urgentThreshold;
  const pct = totalSeconds > 0 ? Math.min(100, Math.max(0, (secondsLeft / totalSeconds) * 100)) : 0;
  const ringColor = urgent ? 'var(--color-accent)' : 'var(--color-mint)';
  const maskStyle: CSSProperties = {
    background: `conic-gradient(${ringColor} ${pct}%, var(--color-border) 0)`,
    WebkitMask: 'radial-gradient(closest-side, transparent 72%, #000 73%)',
    mask: 'radial-gradient(closest-side, transparent 72%, #000 73%)',
  };

  const wrapperClass = [
    'relative inline-flex shrink-0 items-center justify-center rounded-pill',
    urgent ? 'animate-[ring-timer-urgent-pulse_1s_ease-in-out_infinite]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Progress.Root をラッパーに使う（#33）。描画は従来どおり conic-gradient + mask で、
  // Base UI からは **a11y だけ** を受け取る（role="progressbar" と aria-valuenow/min/max）。
  // 移行前はただの <div> で、支援技術には「残り時間が進行している」ことが一切伝わらなかった。
  // Track / Indicator パートは使わない（リングの描画を Base UI の DOM に載せ替えると
  // conic-gradient の構造が変わってしまうため）。
  // value は「残り秒」。カウントダウンなので値は減っていくが、aria-valuetext を添えて
  // 「何の値なのか」を明示する（caption があればそれを使う）。
  return (
    <Progress.Root
      value={Math.max(0, Math.round(secondsLeft))}
      min={0}
      max={Math.max(0, Math.round(totalSeconds))}
      aria-valuetext={
        caption
          ? `${Math.max(0, Math.round(secondsLeft))} ${caption}`
          : `残り ${Math.max(0, Math.round(secondsLeft))} 秒`
      }
      className={wrapperClass}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-pill" style={maskStyle} aria-hidden="true" />
      <div className="relative flex flex-col items-center justify-center">
        <span
          className={`font-bold leading-none tabular-nums ${urgent ? 'text-accent' : 'text-text'}`}
          style={{ fontSize: Math.round(size * 0.28) }}
        >
          {Math.max(0, Math.round(secondsLeft))}
        </span>
        {caption && <span className="mt-1 text-xs text-text-dim">{caption}</span>}
      </div>
    </Progress.Root>
  );
}
