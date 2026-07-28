// 「入力中(is typing)」インジケーター(純粋 leaf UI)。ドット3つ + 斜体の短い文言を1行で出す。
//
// なぜ DS に置くか(#138): DS はチャット面のプリミティブ(Composer / MessageItem / UserLabel /
// Chip)を一通り持っているのに、入力中インジケーターだけが消費側(insession-app の space-core)に
// 残っていた。しかもドットの @keyframes はアプリ側の CSS にしか無く、DS の外で使うと**エラーも
// ワーニングも無くアニメーションだけが静かに死ぬ**状態だった。ここへ移して @keyframes も
// components.css(DS の単一ソース)に置き、パッケージ単体で完成させる。
//
// 責務の線引き:
// - このコンポーネントが持つのは「見た目の原子」だけ。**どこに置くか**(入力欄の下 / ログの末尾)は
//   レイアウトの判断なので消費側が決める。
// - 文言は i18n を持たない DS の規約どおり props 注入。人数に応じた出し分け(「〇〇さんが入力中」/
//   「〇〇さん他2人が入力中」)は呼び出し側で組み立て済みの文字列にして渡す。
export type TypingIndicatorProps = {
  // 表示する文言(組み立て済みの文字列)。空 / 未指定なら非表示になる。
  label?: string;
  // 非表示のときも行の高さを確保するか。既定 true。
  // 入力欄の下など**他の要素と隣接する位置**に置くと、出入りのたびに高さが変わって周りが
  // 上下に飛ぶ。既定で確保しておくことでその揺れを防ぐ。会話ログの末尾に流す使い方など、
  // 高さが変わって構わない場所では false にする。
  reserveSpace?: boolean;
  className?: string;
};

const DOT = 'h-1 w-1 rounded-pill bg-text-dim [animation:typing-dot_1.2s_ease-in-out_infinite]';

export default function TypingIndicator({
  label,
  reserveSpace = true,
  className = '',
}: TypingIndicatorProps) {
  const visible = Boolean(label?.trim());
  // ⚠ 非表示でも要素自体は DOM に残す。aria-live は**変化の前からその領域が存在している**
  // ことが前提で、要素ごと出し入れすると読み上げが発火しないことがあるため。
  // ⚠ 高さは1つのクラスだけが当たるようにする(`h-4` と `h-0` を同時に並べない)。同じ
  //   utilities レイヤーに乗る同士では JSX 上の並び順ではなく配布 CSS の出力順で勝敗が決まる。
  const state = visible
    ? 'h-4 [animation:typing-in_0.25s_var(--ease-spring)_both]'
    : reserveSpace
      ? 'h-4 invisible'
      : 'h-0 invisible';
  return (
    <div
      aria-live="polite"
      className={`flex items-center gap-1.5 overflow-hidden text-sm italic leading-none text-text-dim ${state} ${className}`.trim()}
    >
      {visible && (
        <>
          <span aria-hidden="true" className="inline-flex items-center gap-[3px]">
            <span className={DOT} />
            <span className={`${DOT} [animation-delay:0.15s]`} />
            <span className={`${DOT} [animation-delay:0.3s]`} />
          </span>
          {label}
        </>
      )}
    </div>
  );
}
