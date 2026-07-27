import { NumberField } from '@base-ui/react/number-field';

// 数値増減ステッパー（純粋 leaf UI）。− / 値 / ＋ の3要素。
// 振る舞いを Base UI の NumberField へ委譲する（#33）。DS 側は見た目だけを持つ。
// 旧 .stepper / .stepper-btn / .stepper-value を @theme トークン経由のユーティリティへ移行済み。
// タッチ端末での当たり判定拡大（旧 pointer:coarse の 40px）は pointer-coarse: で表現する。
//
// ── 移行で得たもの ────────────────────────────────
// 移行前は「− と ＋ のボタンだけ」で、値は表示専用の <span> だった。委譲によって:
//   - **矢印キー（↑↓）での増減**。PageUp / PageDown は largeStep、Shift 併用は smallStep
//   - **値を直接入力できる**（<span> → NumberField.Input）。ロケールに沿った数値パースも入る
//   - **min / max による端の disabled 判定**が自動になった（移行前は
//     `disabled={disabled || value <= min}` を手書きしていた）
//   - clamp も Base UI 側で行う（移行前は onChange 側で Math.min / Math.max していた）
// ScrubArea（値の上をドラッグして増減）は**採用しない**。現行の見た目にその領域が無く、
// カーソル形状が変わってしまうため。必要になったら別途。
//
// ⚠ disabled / hover は `disabled:` / `enabled:` ではなく `data-disabled:` /
// `not-data-disabled:` で書く。Base UI の Increment / Decrement は
// focusableWhenDisabled を扱うため、端に到達したときに `disabled` 属性ではなく
// `aria-disabled` になる経路があり、`:disabled` / `:enabled` 疑似クラスがマッチしない
// （button.tsx と同じ理由）。値は移行前から変えていない。
export type StepperProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  // 全体を無効化する（例: 実行中は編集不可）。個別の端到達 disabled は Base UI が自動で行う。
  disabled?: boolean;
  // 各ボタンの aria-label（i18n を持たないため注入。例 '-1' / '+5'）。
  decLabel?: string;
  incLabel?: string;
  // 入力欄の aria-label（i18n を持たないため注入）。値を直接編集できるようになったので、
  // 何の数値なのかを支援技術へ伝えるために渡すことを推奨する。
  valueLabel?: string;
  className?: string;
};

// ⚠ `cursor-pointer` は必須（#71）。DS の他のボタン系（Button / IconButton / ListRow /
// ToolButton）はいずれも持っているのに Stepper だけ抜けていて、ホバーしてもポインタが矢印のまま
// ＝「押せることが分からない」状態だった。消費側 insession-app の素の `button { cursor: pointer }`
// が暗黙に埋めていたため長く露見しなかった（その基底を撤去した時点で露出した）。
// data-disabled 側の cursor-not-allowed は `&[data-disabled]` で詳細度が一段高く、常に勝つ。
const BTN =
  'w-[30px] h-[30px] pointer-coarse:w-10 pointer-coarse:h-10 p-0 inline-flex items-center justify-center text-lg leading-none rounded-full bg-tint-7 border border-solid border-border text-text-dim cursor-pointer transition-[background,box-shadow] hover:not-data-disabled:bg-tint-13 hover:not-data-disabled:shadow-glow data-disabled:opacity-(--disabled-opacity) data-disabled:cursor-not-allowed';

// 値の表示。移行前は span に min-w-[34px] / text-center / text-lg / font-bold / tabular-nums を
// 当てていた。<input> になったが、枠・背景・アウトラインを消して同じ見た目に保つ。
// （※ コメント中にクラス属性の例を書かないこと。check-styles.mjs はソースを正規表現で
//   走査するため、コメント内の記述も実際のクラス名として拾い、存在しないクラスで検査が落ちる）
const VALUE =
  'text-center text-lg font-bold tabular-nums text-text bg-transparent border-none outline-none p-0 focus-visible:shadow-focus rounded-sm';

export default function Stepper({
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  decLabel = '-',
  incLabel = '+',
  valueLabel,
  className = '',
}: StepperProps) {
  return (
    <NumberField.Root
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      // 入力欄を空にすると null が来る。移行前の onChange は number しか受け取らないので、
      // その場合は通知しない（値は Base UI 側が保持し、blur で最後の有効値に戻る）。
      onValueChange={(next) => {
        if (next != null) onChange(next);
      }}
      className={className}
    >
      <NumberField.Group className="inline-flex items-center gap-1.5">
        <NumberField.Decrement className={BTN} aria-label={decLabel}>
          −
        </NumberField.Decrement>
        {/* 幅は表示中の値の桁数から算出する（tabular-nums なので 1ch = 数字1文字ぶん）。
            <input> は既定幅が広いので指定が要るが、固定値にすると桁数が増えたときに切れる
            （4ch 固定にしていたら 10000 や -123 で欠けると指摘を受けた）。移行前の span は
            min-w-[34px] + 内容ぶん伸びる挙動だったので、それを再現する。
            +1ch はキャレットぶんの余裕。 */}
        <NumberField.Input
          className={VALUE}
          aria-label={valueLabel}
          style={{ width: `max(34px, ${String(value).length + 1}ch)` }}
        />
        <NumberField.Increment className={BTN} aria-label={incLabel}>
          ＋
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}
