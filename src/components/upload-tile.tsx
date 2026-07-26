import { type DragEvent, type ReactNode, useId, useRef, useState } from 'react';

// DS のアップロードタイル（#53）。「破線ボーダーのタイル + 隠しファイル入力」の複合部品。
//
// なぜ必要だったか: 消費側（insession-app）がこの構造を **8箇所で手組み**していた
// （コミュニティのスタンプ追加 ×2 / カバー画像 / スタンプピッカー ×2 / 個人設定 ×3）。
// どれも「`<button>` に破線ボーダーのユーティリティを並べ、隣に
// `<input type="file" className="hidden">` を置き、button の onClick で input.click() を呼ぶ」
// という同じ形で、`min-h-35` と `min-h-[172px]` のように**寸法だけが揺れていた**。
//
// ⚠ `<button>` の中に `<input>` を入れない。インタラクティブ要素の入れ子は HTML 仕様違反で、
// クリックが二重発火したり input のクリックが button に吸われたりする。ここでは
// `<label>` を面にして input を子に持つ形にしている（label のクリックが input に転送される
// ので JS の `input.click()` すら不要になる）。
//
// Base UI に載せていない: 相当するパートが無い（ファイル入力はネイティブの `<input type="file">`
// が持つ機能で足りる）。DS が足すのは見た目とドラッグ&ドロップの状態管理だけ。

export type UploadTileProps = {
  // 主ラベル（「スタンプを追加」など）。
  label: ReactNode;
  // 補足（対応形式・上限サイズなど）。i18n は持たないので整形済みの文字列を渡す。
  hint?: ReactNode;
  // 中央に出すアイコン。
  icon?: ReactNode;
  // `<input type="file">` の accept。
  accept?: string;
  // 複数選択を許可する。
  multiple?: boolean;
  // ファイルが選ばれたとき（クリック選択・ドロップの両方）。
  // **常に配列**で渡す（`multiple` でなくても要素1つの配列）。呼び出し側の分岐を減らすため。
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  // タイルの最小高さ。既定 140px。消費側で `min-h-35` / `min-h-[172px]` と揺れていたので
  // プロパティとして明示的に受ける。
  minHeight?: number;
  className?: string;
};

const TILE =
  'relative flex w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-card border-[1.5px] border-dashed p-4 text-center transition-colors duration-(--dur-fast) focus-within:shadow-focus';

export default function UploadTile({
  label,
  hint,
  icon,
  accept,
  multiple = false,
  onFiles,
  disabled = false,
  minHeight = 140,
  className = '',
}: UploadTileProps) {
  const inputId = useId();
  // ドラッグ中の視覚フィードバック。dragenter/dragleave は子要素を跨ぐたびに発火するので
  // 深さを数える（数えないと子の上を通過した瞬間に枠がちらつく）。
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const emit = (files: FileList | null) => {
    if (disabled || !files || files.length === 0) return;
    onFiles(Array.from(files));
  };

  const onDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    if (disabled) return;
    e.preventDefault();
    depth.current += 1;
    setDragging(true);
  };
  const onDragLeave = () => {
    depth.current -= 1;
    if (depth.current <= 0) {
      depth.current = 0;
      setDragging(false);
    }
  };
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    if (disabled) return;
    // preventDefault が無いとブラウザがファイルを開いてページを離脱する。
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    emit(e.dataTransfer?.files ?? null);
  };

  return (
    <label
      htmlFor={inputId}
      style={{ minHeight }}
      // ⚠ 状態別のクラスは排他で出す（#17 の教訓）。border-color / background が
      // dragging / disabled / 既定で入れ替わるため、同一クラス属性に並べると
      // 勝敗が配布 CSS の出力順で決まってしまう。
      className={`${TILE} ${
        disabled
          ? 'cursor-not-allowed border-border bg-transparent opacity-50'
          : dragging
            ? 'border-accent bg-tint-5'
            : 'border-border bg-transparent hover:border-border-strong hover:bg-tint-3'
      } ${className}`.trim()}
      onDragEnter={onDragEnter}
      onDragOver={(e) => {
        if (!disabled) e.preventDefault();
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {icon ? <span className="flex items-center text-text-dim">{icon}</span> : null}
      <span className="font-body text-md font-semibold text-text">{label}</span>
      {hint ? <span className="font-body text-sm text-text-dim">{hint}</span> : null}
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          emit(e.currentTarget.files);
          // 同じファイルを続けて選び直せるように値をクリアする
          // （クリアしないと2回目の選択で change が発火しない）。
          e.currentTarget.value = '';
        }}
      />
    </label>
  );
}
