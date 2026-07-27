import { useState } from 'react';
import { VStack } from './layout.tsx';
import Skeleton from './skeleton.tsx';
import { Surface } from './surface.tsx';

// OGP（Open Graph）リンクプレビューカード（純粋 leaf UI。#93）。Slack / Discord のように、
// 投稿本文に貼られた URL のリンク先が何なのかをカードで見せる。
//
// ── 何を持ち、何を持たないか ─────────────────────────────
// このコンポーネントは**メタデータを props で受け取って描くだけ**で、自分では一切
// fetch/network を持たない（`@insession/design-system` は public npm の presentational
// パッケージであり、この境界は壊さない）。URL からメタデータを取りに行く非同期処理・
// 本文からの URL 検出・呼び出しの重複排除は `MessageItem`（`src/ui-kit/message-item.tsx`）側の
// 責務であり、ここは常に「今すでに分かっているメタデータ（あるいは loading 状態）」だけを見る。
//
// ── 見た目（ユーザー合意済み・compact variant は作らない）───────
// 大きい OG 画像を上、その下にサイト名 → タイトル → 説明文（1〜2行クランプ）の縦積み。
// 画像が無いメタデータなら画像領域自体を出さない（無理に汎用のプレースホルダ矩形を残さない）。
//
// ── 面は Surface を再利用する ───────────────────────────
// 背景/境界/角丸/影を自前の Tailwind クラスで再実装しない。カード全体を1つの `<a>` として
// 描くために Surface の `render` prop（Base UI の useRender。side-nav.tsx / surface.tsx 冒頭の
// コメント参照）を使う。「リセットした `<a>` の中に `<div>` を入れる」構造にすると
// content model 違反（インタラクティブ要素の入れ子）になるため、`render={<a .../>}` で
// Surface 自身を `<a>` として1要素に畳む。
//
// ── a11y ────────────────────────────────────────────
// OG 画像は装飾（`alt=""` + `aria-hidden`）。リンクのアクセシブル名は画像 URL や生の URL が
// 読み上げられないよう、`aria-label` で「タイトル + サイト名」を明示的に組む
// （タイトルが無ければサイト名/ホスト名だけになる）。
export type LinkPreviewMeta = {
  // プレビュー対象の URL。カードのリンク先になる。
  url: string;
  title?: string;
  description?: string;
  // 省略時は url のホスト名を表示に使う（siteName が無い OGP はよくある）。
  siteName?: string;
  // 無ければ画像領域自体を描かない。
  imageUrl?: string;
};

export type LinkPreviewProps = {
  // 未指定 かつ loading でなければ何も描かない（null）。
  meta?: LinkPreviewMeta;
  // true の間は Skeleton のプレースホルダを出す。meta より優先する
  // （取得中に古い meta が残っていても loading 表示を優先させるため）。
  loading?: boolean;
  className?: string;
};

// OGP の標準的な画像比率（1.91:1）。固定の文字列リテラルとして書く
// （Tailwind の @source 走査は動的合成に乗らないため、可変にしない）。
const IMAGE_ASPECT = 'aspect-[1.91/1] w-full object-cover';

// url が不正で URL constructor が投げても、生の url をそのまま表示に落とす
// （表示できないより多少見苦しくてもフォールバックがある方がまし）。
function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function LinkPreview({ meta, loading = false, className = '' }: LinkPreviewProps) {
  // OG 画像の読み込みに失敗したら領域ごと隠す。壊れたアイコンを出さないための保険。
  // 真偽値ではなく「失敗した画像 URL」を覚える — 真偽値だと、同じインスタンスに別の meta が
  // 差し替わったとき(消費側がカードを使い回すケース)にフラグが立ちっぱなしになり、
  // 新しい画像を二度と出せなくなるため。URL 単位で持てば差し替えで自動的に復帰する。
  const [brokenImageUrl, setBrokenImageUrl] = useState<string | null>(null);

  if (loading) {
    return (
      <Surface elevation={1} radius="card" padding="none" className={className}>
        <VStack gap="none">
          <Skeleton className={IMAGE_ASPECT} height="auto" />
          <VStack gap="xs" className="p-3">
            <Skeleton.Text lines={3} />
          </VStack>
        </VStack>
      </Surface>
    );
  }

  if (meta == null) return null;

  const siteName = meta.siteName || hostnameOf(meta.url);
  const showImage = meta.imageUrl != null && brokenImageUrl !== meta.imageUrl;
  // アクセシブル名は「タイトル + サイト名」。タイトルが無ければサイト名(/ホスト名)だけにする。
  const accessibleName = meta.title ? `${meta.title} — ${siteName}` : siteName;

  return (
    <Surface
      elevation={1}
      radius="card"
      padding="none"
      interactive
      className={`block overflow-hidden ${className}`.trim()}
      render={
        <a href={meta.url} target="_blank" rel="noopener noreferrer" aria-label={accessibleName} />
      }
    >
      <VStack gap="none">
        {showImage && (
          <img
            src={meta.imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={IMAGE_ASPECT}
            onError={() => setBrokenImageUrl(meta.imageUrl ?? null)}
          />
        )}
        <VStack gap="xs" className="p-3">
          <span className="font-body text-xs text-text-dim">{siteName}</span>
          {meta.title != null && (
            <span className="line-clamp-2 font-body text-small font-semibold text-text">
              {meta.title}
            </span>
          )}
          {meta.description != null && (
            <span className="line-clamp-2 font-body text-xs text-text-dim">{meta.description}</span>
          )}
        </VStack>
      </VStack>
    </Surface>
  );
}
