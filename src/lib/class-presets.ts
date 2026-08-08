/* DS 全体で重複していた「トークン参照つきの定型クラス文字列」を1箇所へ集約する内部モジュール。
 *
 * ── なぜ定数にするか ─────────────────────────────────
 * フォーカスリングや色トランジションの指定は、これまで各コンポーネントの class 文字列へ
 * 同じ数クラスをそのままベタ書きしていた（focus ring は 16 ファイル、色トランジションも同程度）。
 * 1つでも綴りがズレると「そのコンポーネントだけフォーカス枠が出ない / 太さが違う」が起きるが、
 * 型検査もビルドも緑のまま通り、気づくのは実機で見比べたときになる。定数へ寄せると綴りの
 * ドリフトが構造的に起きなくなる（1箇所を直せば全部に効く）。
 *
 * ⚠ クラス名は静的な文字列リテラルのまま残すこと（tw-merge.ts と同じ制約）。ここに書くのは
 * 完成したユーティリティ列であって、動的生成ではない。消費側の class 文字列を走査する Tailwind
 * （@source）は、この定数の中の静的リテラルをそのまま拾う。
 *
 * ⚠ このファイルは @source の走査対象に含まれる。コメントに Tailwind のクラスに見える文字列
 * （角括弧つきの arbitrary 記法など）を書かないこと。走査が拾って配布 CSS へ空ルールが混ざる。
 *
 * ── 公開 API ではない ───────────────────────────────
 * 内部実装。src/index.ts からは export しない（消費側が DS の内部クラス文字列に依存すると、
 * トークンを整理するたびに壊れる）。DOM に出るクラス名は公開契約ではない、という styles.src.css の
 * 方針と同じ。 */

// フォーカス可視時のリング。shadow-focus（内側リング）と outline（外側リング。太さ・オフセット・
// 色はトークン）の組。button / icon-button / checkbox / radio / toggle など全操作要素で共通。
export const FOCUS_RING =
  'focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring';

// 色（背景 / 文字 / 枠）だけを DS の速い duration で遷移させる。motion-reduce では遷移を切る。
// hover で面色が変わる行・チップ・リンクなどで共通。transform や box-shadow まで遷移させたい
// ボタン等はこの定数を使わず、遷移プロパティを個別に指定する。
export const TRANSITION_COLORS =
  'transition-colors motion-reduce:transition-none duration-(--dur-fast)';

// data-disabled 時の共通の見た目（カーソル / 強制カラー時の文字色 / 半透明）。Base UI 由来で
// data-disabled を出す操作要素（segmented-control / toggle-group / color-input / slider など）で共通。
// ⚠ ネイティブの form 要素で `:disabled` 疑似クラスを使う要素はこの定数を使わない（別の書き方）。
export const DISABLED_STATE =
  'data-disabled:cursor-not-allowed data-disabled:forced-colors:text-[color:GrayText] data-disabled:opacity-50';
