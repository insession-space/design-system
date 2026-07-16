// 数値増減ステッパー（純粋 leaf UI）。− / 値 / ＋ の3要素。clamp は当部品に閉じる。
// 旧 .stepper / .stepper-btn / .stepper-value を @theme トークン経由のユーティリティへ移行。
// タッチ端末での当たり判定拡大（旧 pointer:coarse の 40px）は pointer-coarse: で表現する。
export type StepperProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  // 全体を無効化する（例: 実行中は編集不可）。個別の端到達 disabled とは別。
  disabled?: boolean;
  // 各ボタンの aria-label（i18n を持たないため注入。例 '-1' / '+5'）。
  decLabel?: string;
  incLabel?: string;
};

const BTN =
  'w-[30px] h-[30px] pointer-coarse:w-10 pointer-coarse:h-10 p-0 inline-flex items-center justify-center text-lg leading-none rounded-full bg-tint-7 border border-solid border-border text-text-dim transition-[background,box-shadow] enabled:hover:bg-tint-13 enabled:hover:shadow-glow disabled:opacity-(--disabled-opacity) disabled:cursor-not-allowed';

export default function Stepper({
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  decLabel = '-',
  incLabel = '+',
}: StepperProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        className={BTN}
        aria-label={decLabel}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
      >
        −
      </button>
      <span className="min-w-[34px] text-center text-lg font-bold tabular-nums text-text">
        {value}
      </span>
      <button
        type="button"
        className={BTN}
        aria-label={incLabel}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
      >
        ＋
      </button>
    </div>
  );
}
