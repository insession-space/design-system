// design-sync 専用: プレビューカードをアプリの実背景(--color-bg)の上で描画するためのサーフェス。
// トークン名は Tailwind v4 の @theme が出す `--color-*` 系。`--bg` / `--text` は存在しない
// (未定義 var は透明へフォールバックするため、白地に薄色テキスト = ラッパー無しと同じ状態になる)。
// プレビューカードのテンプレートは body{background:#fff} を強制するため、ダークテーマの
// 本 DS はこのラッパー無しだと白地に薄色テキストで描画されてしまう。
// 実デザイン(claude.ai/design の生成ページ)では styles.css の body ルールが暗背景を
// 当てるので、このラッパーをデザインコードで使う必要はない。
import type { ReactNode } from 'react';

export function DsSurface({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: 16,
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}
