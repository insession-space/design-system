import { Field } from '@base-ui/react/field';
import type { FC, ReactElement, ReactNode, TextareaHTMLAttributes } from 'react';
import { useState } from 'react';
import {
  FIELD_BOX_BASE,
  FIELD_CONTROL,
  FIELD_LABEL,
  fieldBoxState,
  fieldLabelColor,
} from './input.tsx';

// DS の複数行テキスト入力（純粋 leaf UI）。Input と同じ見た目・同じ状態遷移を持つ textarea 版。
// label と control の紐付け・error の aria 連携は Base UI の Field へ委譲する（#22。Input と同じ）。
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
// ラベル(mono caps) / field(surface-2 + 1px border + radius md) / 状態の優先度
// (error > focused > default) と色は **Input と完全に同一**。定数と状態関数を input.tsx から
// import して共有しているので、値を変えれば両方に効く（移行前は同じ文字列を二重に持っていた）。
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

const RESIZE: Record<NonNullable<TextareaProps['resize']>, string> = {
  vertical: 'resize-y',
  none: 'resize-none',
};

// Base UI の Field.Control は型が `<input>` 固定で、`render` で `<textarea>` に差し替えても
// props の型は追随しない（onFocus 等が HTMLInputElement のままになる）。Field との紐付け
// （id の解決・aria-describedby・touched/dirty の追跡）は render 先の要素に正しく適用される
// ので、ここでは型だけを textarea に合わせる。実体は Field.Control のまま。
const TextareaControl = Field.Control as unknown as FC<
  TextareaHTMLAttributes<HTMLTextAreaElement> & { render?: ReactElement; className?: string }
>;

export default function Textarea({
  label,
  error,
  rows = 4,
  resize = 'vertical',
  onFocus,
  onBlur,
  className = '',
  disabled,
  ...rest
}: TextareaProps) {
  const invalid = error != null && error !== false;
  const [focused, setFocused] = useState(false);
  return (
    <Field.Root
      disabled={disabled}
      invalid={invalid}
      className={`flex flex-col gap-[7px] ${className}`.trim()}
    >
      {label != null && (
        <Field.Label className={`${FIELD_LABEL} ${fieldLabelColor(invalid, focused)}`}>
          {label}
        </Field.Label>
      )}
      <div className={`${FIELD_BOX_BASE} items-stretch py-3 ${fieldBoxState(invalid, focused)}`}>
        <TextareaControl
          render={<textarea />}
          rows={rows}
          className={`${FIELD_CONTROL} ${RESIZE[resize]}`}
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
      {/* match の明示が要る理由は input.tsx のコメント参照（既定はネイティブの
          ValidityState を見るため、props 由来の error では aria-describedby が張られない）。 */}
      {invalid && (
        <Field.Error match className="text-xs text-accent-soft">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}
