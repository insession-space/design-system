// ロゴマーク（純粋 leaf UI）。claude design "INSESSION Design System" のロゴ仕様に準拠（ON SESSION #682）。
// 4色(coral/amber/green/blue)のドットを重ねて表現する。variant='row' は横並びクラスタ +
// showWordmark で "INSESSION" ワードマーク(Archivo/font-display)を並べる。variant='cluster' は
// 2x2 グリッドの単体マーク（プロダクト切替チップ等の小さな箇所向け）。
// ドットは mix-blend-mode(theme.css 側に --dot-blend トークンがあれば従う。無ければ normal
// フォールバック)で重なり合成する。色は @theme のブランドトークン(CSS var)を参照し、生 hex は使わない。
import type { CSSProperties } from 'react';

export type LogoMarkVariant = 'row' | 'cluster';

export type LogoMarkProps = {
  variant?: LogoMarkVariant;
  // ドット領域の高さ(px)。既定 20。
  size?: number;
  showWordmark?: boolean;
  // ワードマークの文字サイズ(px)。省略時は size から比例算出。
  wordmarkSize?: number;
  className?: string;
};

// coral / amber / green / blue の順(DS 準拠)。
const DOT_COLORS = [
  'var(--color-mint)',
  'var(--color-warning)',
  'var(--color-success)',
  'var(--color-info)',
];

// mix-blend-mode は --dot-blend が未定義なら初期値(normal)にフォールバックする(Tailwind の
// 任意プロパティ構文。値未定義時は var() のフォールバックが効く)。
const BLEND_CLASS = '[mix-blend-mode:var(--dot-blend,normal)]';

export default function LogoMark({
  variant = 'row',
  size = 20,
  showWordmark = false,
  wordmarkSize,
  className = '',
}: LogoMarkProps) {
  if (variant === 'cluster') {
    return (
      <span
        aria-hidden="true"
        className={`inline-grid grid-cols-2 grid-rows-2 gap-px ${className}`.trim()}
        style={{ width: size, height: size }}
      >
        {DOT_COLORS.map((color) => (
          <span
            key={color}
            className={`rounded-pill ${BLEND_CLASS}`}
            style={{ background: color }}
          />
        ))}
      </span>
    );
  }

  const dotSize = Math.round(size * 0.6);
  const wordmarkPx = wordmarkSize ?? Math.round(size * 0.85);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span
        aria-hidden="true"
        className="inline-flex items-center"
        style={{ height: size } as CSSProperties}
      >
        {DOT_COLORS.map((color, i) => (
          <span
            key={color}
            className={`inline-block rounded-pill ${BLEND_CLASS}`}
            style={{
              width: dotSize,
              height: dotSize,
              background: color,
              marginLeft: i === 0 ? 0 : -Math.round(dotSize * 0.4),
            }}
          />
        ))}
      </span>
      {showWordmark && (
        <span
          className="font-display font-extrabold uppercase tracking-tight text-text"
          style={{ fontSize: wordmarkPx }}
        >
          INSESSION
        </span>
      )}
    </span>
  );
}
