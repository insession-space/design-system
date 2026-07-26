// ロゴマーク（純粋 leaf UI）。LOOPHUB ブランドの「リング＋3 ドット」マークに準拠（loophub #724）。
// リング(ストローク)は @theme の text トークン(var(--color-text)=currentColor)を参照し、ライト/ダークで
// 自動的に色が切り替わる。3 ドットの配色はデザイン指定 hex(coral/amber/blue)を使う(ブランド固定色)。
// variant='row' は横並びマーク + showWordmark で "LOOPHUB" ワードマーク(Archivo/font-display)を並べる。
// variant='cluster' は単体マーク（プロダクト切替チップ等の小さな箇所向け）。
export type LogoMarkVariant = 'row' | 'cluster';

export type LogoMarkProps = {
  variant?: LogoMarkVariant;
  // マークの一辺(px)。既定 20。
  size?: number;
  showWordmark?: boolean;
  // ワードマークの文字サイズ(px)。省略時は size から比例算出。
  wordmarkSize?: number;
  className?: string;
};

// デザイン指定のドット配色(coral / amber / blue)。ブランド固定色のため生 hex を使う。
const DOT_CORAL = '#FF5A36';
const DOT_AMBER = '#F5A524';
const DOT_BLUE = '#3B6FE0';

// リング＋3 ドットの単体マーク。stroke は currentColor(=var(--color-text))でテーマ追従する。
function Mark({ size }: { size: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-text"
    >
      <circle cx="24" cy="24" r="13" stroke="currentColor" strokeWidth="4" fill="none" />
      <circle cx="24" cy="11" r="6.5" fill={DOT_CORAL} />
      <circle cx="35.3" cy="30.5" r="6.5" fill={DOT_AMBER} />
      <circle cx="12.7" cy="30.5" r="6.5" fill={DOT_BLUE} />
    </svg>
  );
}

export default function LogoMark({
  variant = 'row',
  size = 20,
  showWordmark = false,
  wordmarkSize,
  className = '',
}: LogoMarkProps) {
  if (variant === 'cluster') {
    return (
      <span className={`inline-flex ${className}`.trim()}>
        <Mark size={size} />
      </span>
    );
  }

  const wordmarkPx = wordmarkSize ?? Math.round(size * 0.85);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <Mark size={size} />
      {showWordmark && (
        <span
          className="font-display font-extrabold uppercase tracking-tight text-text"
          style={{ fontSize: wordmarkPx }}
        >
          LOOPHUB
        </span>
      )}
    </span>
  );
}
