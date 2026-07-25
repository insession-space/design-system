import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { useId, useState } from 'react';

// DS の複数行テキスト入力（純粋 leaf UI）。Input と同じ見た目・同じ状態遷移を持つ textarea 版。
//
// ── なぜ必要か ────────────────────────────────────────
// DS は Input（1行）と Composer（チャット送信欄。送信ボタンと添付を内包する専用部品）は持って
// いたが、**汎用の複数行入力が無かった**。そのため消費側は raw な `<textarea>` を置き、見た目は
// アプリ側のグローバル CSS（`textarea { … }`）で与えるしかなかった。これは
//   - プロダクトごとに見た目がずれる
//   - アプリ側に「DS が持つべきスタイル」が残り続ける
// という状態で、insession-app にも 4 箇所の raw な textarea が残っていた。ここを埋める。
//
// ── Input との関係 ──────────────────────────────────
// ラベル(mono caps) / field(surface-2 + 1.5px border + radius md) / 状態の優先度
// (error > focused > default) と色は **Input と完全に同一**にしてある。並べて置いたときに
// 揃うのが要件なので、値を変えるときは両方まとめて変えること。
//
// textarea 固有の差分は3点だけ:
//   1. field を `items-center` ではなく `items-stretch` にする（複数行なので中央寄せは不要）
//   2. 既定の行数を rows で受ける（HTML 既定の 2 行は狭いので 4 を既定にする）
//   3. リサイズ方向を resize prop で選べる（既定は縦のみ。横に伸びるとレイアウトが崩れるため）
export type TextareaProps = {
  label?: ReactNode;
  // エラーメッセージ。指定すると error 状態（accent 枠 + 下にメッセージ）になる。
  error?: ReactNode;
  // リサイズの許可方向。既定 'vertical'（横に伸ばせると親のレイアウトが崩れるため）。
  resize?: 'vertical' | 'none';
  className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

const LABEL = 'font-mono text-xs font-semibold tracking-widest uppercase transition-colors';
// field(ラッパー)。Input と同一。複数行なので items-stretch にする点だけ異なる。
const FIELD =
  'flex items-stretch w-full bg-surface-2 border-[1.5px] border-solid rounded-md px-3.5 py-3 transition-[border-color,box-shadow] duration-(--dur-fast)';
const CONTROL =
  'flex-1 min-w-0 border-none outline-none bg-transparent text-md text-text placeholder:text-text-faint';
const RESIZE: Record<NonNullable<TextareaProps['resize']>, string> = {
  vertical: 'resize-y',
  none: 'resize-none',
};

export default function Textarea({
  label,
  error,
  id,
  rows = 4,
  resize = 'vertical',
  onFocus,
  onBlur,
  className = '',
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const invalid = error != null && error !== false;
  const [focused, setFocused] = useState(false);
  // 状態の優先度: error > focused > default。Input と揃える。
  const labelColor = invalid ? 'text-accent' : focused ? 'text-info' : 'text-text-dim';
  const fieldState = invalid
    ? 'border-accent'
    : focused
      ? 'border-info shadow-focus'
      : 'border-border';
  return (
    <div className={`flex flex-col gap-[7px] ${className}`.trim()}>
      {label != null && (
        <label htmlFor={textareaId} className={`${LABEL} ${labelColor}`}>
          {label}
        </label>
      )}
      <div className={`${FIELD} ${fieldState}`}>
        <textarea
          id={textareaId}
          rows={rows}
          aria-invalid={invalid || undefined}
          className={`${CONTROL} ${RESIZE[resize]}`}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </div>
      {invalid && <span className="text-xs text-accent">{error}</span>}
    </div>
  );
}
