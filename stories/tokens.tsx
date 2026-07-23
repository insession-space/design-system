// デザイントークン・カタログ(Storybook / Issue #69)専用の描画ヘルパー。
// 「トークンそのものを一覧する」ためのカタログコードなので、例外的に CSS 変数名
// (var(--color-*) 等)を色に直接参照する。アプリ本体の JSX ではこの書き方はしない
// (色=セマンティックトークンのユーティリティで書く。STYLE_GUIDE.md 参照)。
// レイアウト(サイズ/余白/グリッド)は生 px を避け、Tailwind ユーティリティ
// (必要な箇所のみ arbitrary 値=STYLE_GUIDE 公認)で表現する。
import { type ReactNode, useEffect, useState } from 'react';

// ドキュメントルートから解決済みの CSS 変数値(例: #3bf7a4)を読む。
function useResolvedVar(varName: string) {
  const [value, setValue] = useState('');
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    setValue(raw);
  }, [varName]);
  return value;
}

export function Grid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">{children}</div>
  );
}

export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <h3 className="font-display text-xl font-bold text-text mb-1">{title}</h3>
      {note && <p className="text-smd text-text-dim mb-4 leading-normal">{note}</p>}
      {children}
    </section>
  );
}

// 色トークンの見本。背景に var(--name) を敷き、トークン名と解決値を添える。
export function ColorSwatch({ varName, label }: { varName: string; label: string }) {
  const resolved = useResolvedVar(varName);
  return (
    <div className="rounded-card border border-solid border-border overflow-hidden bg-surface">
      <div className="h-18" style={{ background: `var(${varName})` }} />
      <div className="p-3">
        <div className="text-smd font-semibold text-text">{label}</div>
        <code className="text-2xs text-text-faint">{varName}</code>
        <div className="text-2xs text-text-dim mt-1">{resolved || '—'}</div>
      </div>
    </div>
  );
}

// テキスト色・境界色など「面で見せにくい」トークン向け。
export function LineSwatch({ varName, label }: { varName: string; label: string }) {
  const resolved = useResolvedVar(varName);
  return (
    <div className="rounded-card border border-solid border-border p-3 bg-tint-5">
      <div
        className="border-b-2 border-solid pb-2 mb-2"
        style={{ borderBottomColor: `var(${varName})` }}
      >
        <span className="text-md font-semibold" style={{ color: `var(${varName})` }}>
          {label}
        </span>
      </div>
      <code className="text-2xs text-text-faint">{varName}</code>
      <div className="text-2xs text-text-dim mt-1">{resolved || '—'}</div>
    </div>
  );
}

// 半径・グロー等の「箱で見せる」トークン向け。
export function BoxSwatch({
  label,
  varName,
  boxClassName,
}: {
  label: string;
  varName: string;
  boxClassName?: string;
}) {
  const resolved = useResolvedVar(varName);
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-24 h-18 bg-tint-13 border border-solid border-border-strong ${boxClassName ?? ''}`}
      />
      <div className="text-smd font-semibold text-text">{label}</div>
      <code className="text-2xs text-text-faint">{varName}</code>
      <div className="text-2xs text-text-dim">{resolved || '—'}</div>
    </div>
  );
}

// z-index 等「値そのものを並べる」トークン向けの表。
export function TokenTable({ rows }: { rows: Array<{ varName: string; label: string }> }) {
  return (
    <div className="rounded-card border border-solid border-border overflow-hidden">
      {rows.map((row) => (
        <TokenTableRow key={row.varName} varName={row.varName} label={row.label} />
      ))}
    </div>
  );
}

function TokenTableRow({ varName, label }: { varName: string; label: string }) {
  const resolved = useResolvedVar(varName);
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-tint-3 border-b border-solid border-border">
      <span className="text-smd text-text">{label}</span>
      <code className="text-2xs text-text-faint">{varName}</code>
      <span className="text-smd text-text-dim tabular-nums">{resolved || '—'}</span>
    </div>
  );
}
