import type { ReactNode } from 'react';

// ロゴマーク（純粋 leaf UI）。DS 既定は「リング＋3 ドット」マーク（loophub #724）。
// リング(ストローク)は @theme の text トークン(var(--color-text)=currentColor)を参照し、ライト/ダークで
// 自動的に色が切り替わる。3 ドットの配色はデザイン指定 hex(coral/amber/blue)を使う(ブランド固定色)。
// variant='row' は横並びマーク + showWordmark でワードマーク(Archivo/font-display)を並べる。
// variant='cluster' は単体マーク（プロダクト切替チップ等の小さな箇所向け）。
//
// ⚠ ワードマークは以前 "LOOPHUB" をハードコードしていた（#74）。DS は2プロダクト
// (InSession / loophub)で共有するため、`wordmark` / `mark` prop で差し替えられるようにした。
// 既定値 'LOOPHUB' は既存呼び出しの見た目を変えないために残しているだけで、新しい呼び出しは
// 必ず `wordmark` を明示すること。プロダクト固有のロゴ画像をライト/ダークで出し分けるだけなら
// 同ファイルの `BrandImage` を使う。
export type LogoMarkVariant = 'row' | 'cluster';

export type LogoMarkProps = {
  variant?: LogoMarkVariant;
  // マークの一辺(px)。既定 20。
  size?: number;
  showWordmark?: boolean;
  // ワードマークの文字列/要素(#74)。既定は 'LOOPHUB'（後方互換）。
  wordmark?: ReactNode;
  // ワードマークの文字サイズ(px)。省略時は size から比例算出。
  wordmarkSize?: number;
  // マーク自体の差し替え(#74)。省略時は DS 既定の「リング + 3 ドット」を描く。
  // プロダクト固有のロゴ(SVG / BrandImage)を渡すと、ワードマークとの間隔・揃えだけを再利用できる。
  mark?: ReactNode;
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

// ライト/ダークで別画像を出し分けるだけの薄い器(#74)。
// 出し分けの条件(`<html data-theme="light">`)は DS のテーマ機構そのものなので、消費側が
// `[[data-theme=light]_&]:hidden` のような任意バリアント文字列を各所へ複製しなくて済むよう
// DS 側へ引き取る(insession-app では利用箇所8つが同じ文字列を持っていた)。
//
// ⚠ 表示/非表示の切り替えであって src の差し替えではないので、**両方の画像が読み込まれる**。
// ロゴのような小さな SVG を前提にしている。
export type BrandImageProps = {
  // 既定(ダーク)テーマで出す画像。
  src: string;
  // ライトテーマ(`<html data-theme="light">`)で出す画像。省略時は src を両テーマで使う。
  lightSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

export function BrandImage({ src, lightSrc, alt, width, height, className = '' }: BrandImageProps) {
  const imgClass = `block ${className}`.trim();
  if (lightSrc == null) {
    return <img src={src} alt={alt} width={width} height={height} className={imgClass} />;
  }
  return (
    <>
      {/* ⚠ クラス名は静的リテラルで書く(動的合成は @source 走査に引っかからず配布 CSS
          だけが静かに欠ける。layout.tsx の GAP_CLASS と同じ理由)。 */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${imgClass} [[data-theme=light]_&]:hidden`}
      />
      {/* ライト版は同じ内容なので支援技術には読ませない(名前の二重読み上げを避ける)。 */}
      <img
        src={lightSrc}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        className={`hidden [[data-theme=light]_&]:block ${className}`.trim()}
      />
    </>
  );
}

export default function LogoMark({
  variant = 'row',
  size = 20,
  showWordmark = false,
  wordmark = 'LOOPHUB',
  wordmarkSize,
  mark,
  className = '',
}: LogoMarkProps) {
  const markNode = mark ?? <Mark size={size} />;

  if (variant === 'cluster') {
    return <span className={`inline-flex ${className}`.trim()}>{markNode}</span>;
  }

  const wordmarkPx = wordmarkSize ?? Math.round(size * 0.85);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      {markNode}
      {showWordmark && (
        <span
          className="font-display font-extrabold uppercase tracking-tight text-text"
          style={{ fontSize: wordmarkPx }}
        >
          {wordmark}
        </span>
      )}
    </span>
  );
}
