import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';

// DS のラジオ（純粋 leaf UI）。claude design "INSESSION Design System" の Controls 仕様に準拠（#463）。
// 22x22 の円 / 2px 枠。選択時は枠を text 色にし、中央に 10px の accent ドットを出す。
// ネイティブ input を視覚的に隠し（a11y/フォーカス維持）、隣の span を状態で描画する。
export type RadioProps = {
  checked: boolean;
  label?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'>;

export default function Radio({ checked, label, id, className = '', ...rest }: RadioProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={`inline-flex cursor-pointer select-none items-center gap-3 ${className}`.trim()}
    >
      <input id={inputId} type="radio" checked={checked} className="peer sr-only" {...rest} />
      <span
        className={`grid h-[22px] w-[22px] place-items-center rounded-pill border-2 border-solid transition-colors peer-focus-visible:shadow-focus ${
          checked ? 'border-text' : 'border-border-strong'
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-pill bg-accent transition-transform duration-(--dur-fast) ${
            checked ? 'scale-100' : 'scale-0'
          }`}
        />
      </span>
      {label != null && <span className="text-md text-text">{label}</span>}
    </label>
  );
}
