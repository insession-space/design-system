// DS の Switch（トグル。純粋 leaf UI）。claude design "INSESSION Design System" の Switch 仕様に準拠（#463 / #663）。
// legacy の .toggle-switch / .toggle-knob 依存をやめ、トークンベースのユーティリティで実装する。
// track 46x26 の pill、on=success(green) / off=border-strong、knob 20x20 の白丸 + 微ドロップシャドウ、
// off=left3 / on=left23 を transition。disabled は opacity 0.5 + not-allowed。
// signature は既存維持（checked / onChange / label / disabled）。onChange は「引数なしトグル」で、
// onClick から onChange() を呼ぶ現行仕様を壊さない。prefers-reduced-motion は style.css 末尾の legacy 規則で尊重。
export type ToggleProps = {
  checked?: boolean;
  onChange?: () => void;
  label?: string;
  disabled?: boolean;
};

export default function Toggle({ checked = false, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-pill border border-solid border-transparent p-0 transition-colors duration-(--dur-fast) cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:shadow-focus focus-visible:outline-none ${
        checked ? 'bg-success' : 'bg-border-strong'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-[3px] h-5 w-5 rounded-pill bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-[left] duration-(--dur-fast) ${
          checked ? 'left-[23px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
}
