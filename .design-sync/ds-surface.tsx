// design-sync 専用: プレビューカードをアプリの実背景(--bg)の上で描画するためのサーフェス。
// プレビューカードのテンプレートは body{background:#fff} を強制するため、ダークテーマの
// 本 DS はこのラッパー無しだと白地に薄色テキストで描画されてしまう。
// 実デザイン(claude.ai/design の生成ページ)では styles.css の body ルールが暗背景を
// 当てるので、このラッパーをデザインコードで使う必要はない。
import type { ReactNode } from 'react';

export function DsSurface({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 16,
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}
