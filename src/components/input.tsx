import { Field } from '@base-ui/react/field';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';

// DS のテキスト入力（純粋 leaf UI）。claude design "INSESSION Design System" の Inputs 仕様に準拠（#463 / #663）。
// label と control の紐付け・error メッセージの aria 連携を Base UI の Field へ委譲する（#22）。
// DS 側はトークンベースの見た目だけを持つ。
//
// **props シグネチャは移行前から変えていない**（label / error / prefix + input の属性）。
// 変わったのは内部だけ:
//   - useId + htmlFor の手組み → Field.Label / Field.Control が自動で紐付ける
//   - aria-invalid の手当て → Field.Root の invalid から出る。error は Field.Error として
//     描画され aria-describedby が張られる（移行前は素の <span> で、支援技術から
//     エラーが入力欄に紐付いていなかった）
//
// focus の追跡だけは自前の useState を維持している。ラッパーの <div>（prefix を横に
// 並べるための箱）は Base UI のパートではないため Field の state を直接受け取れず、
// group-has-[…] のバリアントで代替すると error / focused / default が同じプロパティを
// 奪い合ってしまうため（#17 の衝突と同じ構図）。優先度を JS 側で解決して1つだけ出す。
//
// ラベルは mono・大文字（Label caps）。状態で label/border/ring を切替える:
//   error → accent（枠 + ラベル + 下メッセージ）、focused → info（枠 + ラベル + リング）、
//   default → text-dim / border。
// field は surface-2 / border 1px / radius md(10) / pad 12/14 / font 15。prefix は field 内・input 左に
// mono の接頭辞（例 insession.app/r/）を text-dim で置く。i18n は持たない（label / error は文字列を受け取る）。
export type InputProps = {
  label?: ReactNode;
  // エラーメッセージ。指定すると error 状態（accent 枠 + 下にメッセージ）になる。
  error?: ReactNode;
  // field 内・input の左に置く mono の接頭辞（任意）。例: 'insession.app/r/'。
  prefix?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

// Input / Textarea で共有する見た目。並べて置いたときに揃うのが要件なので、
// 値を変えるときは必ず両方に効くこの定数を変えること。
export const FIELD_LABEL =
  'font-body text-xs font-semibold tracking-widest uppercase transition-colors motion-reduce:transition-none';
// ⚠ **縦 padding はここに含めない。** Input / Textarea は py-3 だが SearchField は py-2.5 と
// 一段浅く、共通側に py-3 を持たせると呼び出し側の py-2.5 では打ち消せない（同一プロパティの
// ユーティリティは配布 CSS の出力順で勝敗が決まる。#21 と同じ構図で、実測でも py-3 が勝った）。
// 「打ち消す」のをやめ、**縦 padding は各コンポーネントが必ず自分で指定する**契約にする。
// ⚠ **枠幅は 1px。1.5px に戻さないこと（#35）。**
// 元の仕様は 1.5px だったが、3エンジン × DPR で実測したところ **効くブラウザと効かない
// ブラウザがある値**だと分かった（左右合計を getBoundingClientRect で測定）:
//
//            DPR1    DPR2      DPR3
//   Chromium 1px     1px       1px
//   Firefox  1px     1px       1px
//   WebKit   1px     1.5px     1.333px
//
// つまり 1.5px が実際に描かれるのは **WebKit の DPR≥2 だけ**。据え置くと
// 「iOS Safari では枠が太く Android Chrome では細い」「同じ Retina Mac でも Safari と
// Chrome で違う」という**意図しないプラットフォーム差が仕様として固定される**。
// Capacitor で iOS / Android の両方に出しているので実ユーザーに見える差になる。
//
// 1px に寄せた理由（2px ではなく）:
//   - 1px は **現状の大多数の見え方**（Chromium / Firefox / Android は既に 1px で描画）。変更が最小
//   - 2px にすると全プラットフォームで太くなるうえ、「Inputs は控えめ / コントロール
//     （Button・Checkbox・Radio）は border-2」という**意図的な強弱の区別が消える**
//   - 1px なら設計意図（fields はコントロールより細い）を保ったまま、
//     **宣言値と実描画が全エンジンで一致**する
//
// ⚠ もし将来また任意値の枠幅を使うなら、**型（`length:`）を明示して書く**こと。
// 裸の任意値（`border-[1.5px]`）は Tailwind v4 が border-color 側と解釈しうる曖昧な
// 書き方で、実際に「配布 CSS にセレクタが0件＝ DOM にクラスは出るのに枠が描かれない」
// 欠損が起きていた。欠損自体は scripts/check-styles.mjs の任意値クラス検査が回帰ネット。
export const FIELD_BOX_BASE =
  'flex w-full bg-surface-2 border border-solid rounded-md px-3.5 transition-[border-color,box-shadow] motion-reduce:transition-none duration-(--dur-fast)';
export const FIELD_CONTROL =
  'flex-1 min-w-0 border-none outline-none bg-transparent text-base text-text placeholder:text-text-faint';

// 状態の優先度: error > focused > default。
export function fieldLabelColor(invalid: boolean, focused: boolean) {
  if (invalid) return 'text-accent';
  return focused ? 'text-info' : 'text-text-dim';
}
export function fieldBoxState(invalid: boolean, focused: boolean) {
  if (invalid) return 'border-accent';
  return focused ? 'border-info shadow-focus' : 'border-border';
}

export default function Input({
  label,
  error,
  prefix,
  onFocus,
  onBlur,
  className = '',
  disabled,
  ...rest
}: InputProps) {
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
      <div className={`${FIELD_BOX_BASE} items-center py-3 ${fieldBoxState(invalid, focused)}`}>
        {prefix != null && (
          <span className="mr-0.5 shrink-0 font-body text-base text-text-dim">{prefix}</span>
        )}
        <Field.Control
          className={FIELD_CONTROL}
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
      {/* match を明示するのが要点。既定（match 未指定）の Field.Error は **ネイティブの
          ValidityState** を見て出し分ける仕様で、DS のように「アプリ側が判定した error を
          props で受け取る」使い方では rendered=false のままになり、control に
          aria-describedby が張られない（表示はされるのに支援技術からエラーが入力欄に
          紐付かない）。invalid のときだけこの要素を描画しているので match={true} でよい。 */}
      {invalid && (
        <Field.Error match className="text-xs text-accent">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}
