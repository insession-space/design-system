import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import type * as React from 'react';
import type { InputHTMLAttributes } from 'react';

// DS の色選択（#53）。パレットから選ぶ `ColorSwatchGroup` と、任意色を選ぶ `ColorInput`。
//
// なぜ必要だったか: 消費側（insession-app）の whiteboard が `whiteboard-color-input`、
// 伝言ゲームが `canvas-relay-draw-swatch` という**同じ構造の legacy CSS を2セット**持ち、
// さらに素の `<input type="color">` をそのまま置いている箇所もあった
// （ブラウザ既定の枠と余白が出るので見た目が DS から浮いていた）。
//
// ⚠ 色そのものはトークンではなく**呼び出し側が渡す値**として扱う。ペンの色は
// 「ユーザーが選んだ任意の色」でデザイントークンではないため、`style` で直接当てる。
// これは STYLE_GUIDE の「生値を JSX に直書きしない」の例外ではなく、
// **そもそもトークン化の対象外のデータ**（アバター色や画像の平均色と同じ扱い）。
// トークンで表せる色（accent 等）を渡したい場合は呼び出し側が `var(--color-accent)` を渡す。

export type ColorSwatch = {
  // `#3bf7a4` や `var(--color-accent)` など、CSS の色として有効な文字列。
  value: string;
  // 読み上げ用の名前（「ミント」など）。色の見た目だけでは区別できないため必須。
  label: string;
  disabled?: boolean;
};

export type ColorSwatchGroupProps = Omit<
  React.ComponentProps<typeof RadioGroup>,
  'className' | 'render' | 'children'
> & {
  swatches: ColorSwatch[];
  // グループ全体の用途を読み上げる。
  ariaLabel?: string;
  // 1辺のサイズ（px）。既定 28。
  size?: number;
  className?: string;
};

// 選択中は「外側にリング、内側に地の色の隙間」で示す。塗り自体は色データなので変えられない
// （チェックマークを重ねる案は淡い色の上で見えなくなるため採らなかった）。
const SWATCH =
  'relative shrink-0 cursor-pointer rounded-pill border-none p-0 transition-[box-shadow,transform] motion-reduce:transition-none duration-(--dur-fast) focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring data-disabled:cursor-not-allowed data-disabled:forced-colors:text-[color:GrayText] data-disabled:opacity-50';

export function ColorSwatchGroup({
  swatches,
  ariaLabel,
  size = 28,
  className = '',
  ...rest
}: ColorSwatchGroupProps) {
  return (
    <RadioGroup
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-2 ${className}`.trim()}
      {...rest}
    >
      {swatches.map((s) => (
        <Radio.Root
          key={s.value}
          value={s.value}
          disabled={s.disabled}
          aria-label={s.label}
          title={s.label}
          style={{ width: size, height: size, background: s.value }}
          className={(state) =>
            // ⚠ 状態別クラスは排他で出す（#17）。box-shadow / scale が入れ替わるため。
            `${SWATCH} ${
              state.checked
                ? 'scale-110 shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-text)]'
                : 'scale-100 shadow-[inset_0_0_0_1px_var(--color-border)]'
            }`
          }
        />
      ))}
    </RadioGroup>
  );
}

export type ColorInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'size'
> & {
  // 読み上げ用のラベル（可視ラベルは持たない。ツールバーに置く部品なので）。
  label: string;
  // 1辺のサイズ（px）。既定 28。`ColorSwatchGroup` と並べるので既定を揃えている。
  size?: number;
  className?: string;
};

export function ColorInput({ label, size = 28, className = '', ...rest }: ColorInputProps) {
  // ⚠ `<input type="color">` はブラウザ既定の枠・内側余白・角丸を持ち、しかも
  // ベンダー別の疑似要素（`::-webkit-color-swatch-wrapper` / `::-webkit-color-swatch` /
  // `::-moz-color-swatch`）でしか消せない。Tailwind のユーティリティでは疑似要素に触れず、
  // かといって配布 CSS にベンダー疑似要素のルールを足すのも避けたい。
  // → **input を親より一段大きく広げ、親の `overflow-hidden` で既定の枠を切り落とす**。
  // 見えている面はネイティブの swatch そのものなので、value の反映も自動で追従する。
  return (
    <span
      style={{ width: size, height: size }}
      className={`relative inline-flex shrink-0 overflow-hidden rounded-pill shadow-[inset_0_0_0_1px_var(--color-border)] focus-within:shadow-focus ${className}`.trim()}
    >
      {/* 現在値の面はネイティブの swatch がそのまま描く（`value` を JS で読んで親に
          background を当て直す必要はない）。input を親より 1.5 倍に広げて負の inset で
          中央に置き、親の `overflow-hidden` でブラウザ既定の枠と余白を**視界の外へ追い出す**。
          こうすると疑似要素向けの CSS を配布物に足さずに済む。 */}
      <input
        type="color"
        aria-label={label}
        className="absolute inset-[-25%] h-[150%] w-[150%] cursor-pointer appearance-none border-none bg-transparent p-0"
        {...rest}
      />
    </span>
  );
}
