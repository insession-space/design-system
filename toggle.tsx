// トグルスイッチ(既存トンマナの tinted surface + 細ボーダーに揃えた控えめなもの)。
// 以前 Space.jsx にあったローカル版と挙動・マークアップ(.toggle-switch / .toggle-knob)が
// 同一だったため、こちらに統合済み(SettingsModal ほかが共用)。
export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle-switch${checked ? ' on' : ''}`}
      onClick={onChange}
      disabled={disabled}
    >
      <span className="toggle-knob" aria-hidden="true" />
    </button>
  );
}
