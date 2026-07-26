// 共有ブレークポイント定数。純粋な文字列定数のみ(leaf。他 foundation パッケージに依存しない)。

// タッチ端末/狭幅レイアウトの判定に使う複合メディアクエリ。「ホバー無し/タッチポインタ/狭幅」の
// いずれかに一致すればモバイル相当のレイアウトとみなす(pointer:coarse ベースの判定を正とする)。
// SplitModal のドリルダウン閾値(768px。widthのみの判定)とは意図的に別物。こちらは「D&Dが使えるか」
// 「タッチ主体のコンパクトUIにするか」の判定で、幅だけでなくポインタ種別も見る。
export const MOBILE_LAYOUT_MQ = '(hover: none), (pointer: coarse), (max-width: 560px)';
