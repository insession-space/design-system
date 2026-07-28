// サイズ可変のローディングインジケータ（純粋 leaf UI）。
// 旧来 feature ごとに散っていた回転スピナー（voice-chat-connecting-spinner /
// playlist の読み込み中表示等）を DS に集約する。トンマナに合わせ、薄いミントのリングに
// ミントの先頭という控えめな見た目。回転は Tailwind の回転アニメーションユーティリティ。
//
// ⚠ 抑制は **このパッケージだけで完結させる**(#121)。以前ここには「消費側 style.css 末尾の
// legacy ルールが全体に効く」と書かれていたが、その規則は消費側アプリ(insession-app)にしか
// 無く、DS の配布 CSS には含まれていなかった。DS のプリビルド CSS だけを読む loophub や、
// DS 単体利用・Storybook では回転が止まらないままだった。動きの抑制ユーティリティを
// クラス文字列に併記して、取り込み方に依らず必ず届くようにしている。
export type SpinnerProps = {
  // 直径(px)。既定 16。
  size?: number;
  // リングの太さ(px)。既定は size に応じて 2。
  thickness?: number;
  // スクリーンリーダー向けラベル(i18n は props 注入)。省略時は aria-hidden。
  label?: string;
  className?: string;
};

export default function Spinner({ size = 16, thickness, label, className = '' }: SpinnerProps) {
  const border = thickness ?? Math.max(2, Math.round(size / 8));
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 rounded-pill border-solid border-border-strong animate-spin motion-reduce:animate-none ${className}`.trim()}
      style={{
        width: size,
        height: size,
        borderWidth: border,
        borderTopColor: 'var(--color-accent)',
      }}
    />
  );
}
