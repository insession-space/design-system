import { Progress } from '@base-ui/react/progress';
import type { CSSProperties } from 'react';

// 円形カウントダウンタイマー(純粋 leaf UI)。時間計算はしない — 呼び出し側が
// secondsLeft/totalSeconds を毎フレーム渡すだけの純粋表示部品(リレーゲーム等の残り時間表示 #974)。
// conic-gradient + mask でリングを描き(mask の #000 はアルファ用のクリップ指定でありトークン違反ではない)、
// 中央に残り秒数 + caption(i18n は持たないため注入)を重ねる(showValue={false} でリングだけにもできる。
// バッジ等の小さい寸法向け #166)。urgent(secondsLeft <= urgentThreshold)
// では accent 色へ切り替え、ゆっくり脈動させる。脈動の keyframes は components.css が持つ
// (badge.tsx の pop-in / modal.tsx の card-in と同じ。かつては insession-app 側にしか定義が無く
// パッケージ単体で完成しなかったが、移植済み)。
//
// ⚠ prefers-reduced-motion の抑制はクラス文字列に併記する(#121)。以前ここには「消費側 style.css
// 末尾のグローバルルールで自動的に止まる」と書かれていたが、その規則は DS の配布 CSS に無く、
// **無限に脈動し続ける**状態が loophub と DS 単体で残っていた。しかも urgent は残り時間が
// 少ないときの表示なので、止まらないことの影響が大きい。
export type RingTimerProps = {
  secondsLeft: number;
  totalSeconds: number;
  // 直径(px)。既定 118。
  size?: number;
  // secondsLeft がこれ以下で urgent 表示(accent 色 + 脈動)に切り替える。既定 10。
  urgentThreshold?: number;
  // 数字の下に出す小さい説明文言(i18n は持たないため注入。例「のこり秒」)。
  caption?: string;
  // 中央に残り秒数(と caption)を描くか。既定 true。
  // false にするとリングだけになる — バッジ等の小さい寸法(16px 前後)では中央の数字が
  // 物理的に読めずノイズにしかならないため(#166)。数字を消しても role="progressbar" と
  // aria-valuenow / aria-valuetext / アクセシブルな名前は維持するので、支援技術には
  // 従来どおり残り時間が伝わる。
  showValue?: boolean;
  // リングの太さ(px)。既定は直径の 14%(従来の固定マスクと同値)。
  // 小さい size ではこの比率だと 2px 程度まで細って視認しづらくなるので、
  // 呼び出し側が明示的に太らせられるようにしてある(#166)。
  thickness?: number;
  // 残り部分のリング色。既定 `var(--color-accent)`(従来と同じ)。
  // `currentColor` を渡すと親のテキスト色に追従するので、文字色で状態(フェーズ・警告)を
  // 出し分けている呼び出し側でリングと文字の色を一致させられる(#166)。
  // ⚠ 生の hex ではなくトークン(`var(--color-*)`)か `currentColor` を渡すこと。
  ringColor?: string;
  // progressbar のアクセシブルな名前。role="progressbar" は名前が無いと
  // 「何の進捗なのか」が支援技術に伝わらない(axe: aria-progressbar-name)。
  // 省略時は caption を名前として使い、caption も無ければ既定の日本語を当てる
  // — aria-valuetext が既に同じ理由で日本語を持っているので、それに揃える。
  ariaLabel?: string;
  className?: string;
};

export default function RingTimer({
  secondsLeft,
  totalSeconds,
  size = 118,
  urgentThreshold = 10,
  caption,
  showValue = true,
  thickness,
  ringColor = 'var(--color-accent)',
  ariaLabel,
  className = '',
}: RingTimerProps) {
  const urgent = secondsLeft <= urgentThreshold;
  const pct = totalSeconds > 0 ? Math.min(100, Math.max(0, (secondsLeft / totalSeconds) * 100)) : 0;
  // ⚠ リングの色は urgent でも変わらない。#109 以前は旧トークン名で
  // `urgent ? 'var(--color-accent)' : 'var(--color-mint)'` と書かれていたが、当時の
  // --color-accent は --color-mint の別名だったので**両者は同じ色**で、この分岐は一度も
  // 効いていなかった。トークンを役割名へ寄せた時点で同語反復が露呈したため三項を畳んだ
  // (見た目は従来と同一)。urgent を色でも示したいなら、どの色にするかはデザイン判断が要る
  // ので別途決めること。現状 urgent は脈動アニメーションと数字の色(下の urgent 分岐)で表現している。
  // #166: 既定は従来どおり accent 固定だが、呼び出し側が ringColor で差し替えられるようにした
  // (バッジのようにフェーズ色・警告色を文字で出している側とリング色を揃えるため)。
  // マスクの内径(%)。既定の 72% は「太さ = 直径の 14%」と同義なので、thickness(px) 指定時は
  // そこから逆算する。外側は +1% だけ遅らせて塗り始める(従来の 72%/73%)— この 1% が
  // アンチエイリアス用の縁になっており、詰めると小さい寸法でリングがジャギる。
  const innerPct =
    thickness != null && size > 0
      ? Math.min(95, Math.max(0, 100 - (thickness / (size / 2)) * 100))
      : 72;
  const maskStyle: CSSProperties = {
    background: `conic-gradient(${ringColor} ${pct}%, var(--color-border) 0)`,
    WebkitMask: `radial-gradient(closest-side, transparent ${innerPct}%, #000 ${innerPct + 1}%)`,
    mask: `radial-gradient(closest-side, transparent ${innerPct}%, #000 ${innerPct + 1}%)`,
  };

  const wrapperClass = [
    'relative inline-flex shrink-0 items-center justify-center rounded-pill',
    urgent
      ? 'animate-[ring-timer-urgent-pulse_1s_ease-in-out_infinite] motion-reduce:animate-none'
      : '',
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
      aria-label={ariaLabel ?? caption ?? '残り時間'}
      aria-valuetext={
        caption
          ? `${Math.max(0, Math.round(secondsLeft))} ${caption}`
          : `残り ${Math.max(0, Math.round(secondsLeft))} 秒`
      }
      className={wrapperClass}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-pill" style={maskStyle} aria-hidden="true" />
      {showValue && (
        <div className="relative flex flex-col items-center justify-center">
          <span
            className={`font-bold leading-none tabular-nums ${urgent ? 'text-accent-soft' : 'text-text'}`}
            style={{ fontSize: Math.round(size * 0.28) }}
          >
            {Math.max(0, Math.round(secondsLeft))}
          </span>
          {caption && <span className="mt-1 text-xs text-text-dim">{caption}</span>}
        </div>
      )}
    </Progress.Root>
  );
}
