import { useState } from 'react';
import { MediaCard } from '../ui-kit/media-card.tsx';
import Skeleton from './skeleton.tsx';

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
// ── 見た目は MediaCard に委譲する（#112）─────────────────
// 当初は Surface + 自前の画像枠 + サイト名/タイトル/説明の3行で組んでいたが、実アプリ
// （InSession の space チャット）で**読みづらい**という問題が2つ出たため MediaCard へ寄せた。
//
//   1) **テキスト全体に下線が入っていた。** カード全体を1つの `<a>` にしているが、`<a>` には
//      ブラウザ既定の下線が残る（配布 CSS に preflight の `a` リセットが無い）。
//      `text-decoration` は**祖先から子孫のインラインボックスへ描画される**ので、中の
//      `<span>` で `text-decoration: none` を書いても線は消えない。根で `no-underline` を
//      当てるのが唯一の正しい対処（下記 CARD_CLASS）。
//   2) **画像がアスペクト比に収まらなかった。** 画像枠に `aspect-[1.91/1]`（arbitrary value）を
//      使っていたため、消費側の Tailwind の生成に乗らず縦長の OG 画像がそのまま出て、
//      チャットのログが1件のプレビューで埋まっていた。
//
// MediaCard はカバー枠に **`aspect-video`（標準ユーティリティ）+ overflow-hidden + full-bleed**
// を持ち、タイトル（1行 truncate）とメタ行（1行 truncate）のスロットを持つので、
// どちらも構造的に解消される。arbitrary value に依存しないため消費側での生成漏れも起きない。
//
// **`description` は出さない。** MediaCard は 1行 truncate の `meta` しか持たず、
// 「縦幅を食わない」ことが今回の目的だから。リンク先の識別はタイトル + サイト名で足りる
// （型からは消していないので、消費側が別用途で使うことはできる）。
//
// カード全体を1つの `<a>` として描くのは従来どおり（MediaCard の `render` に渡す）。
// 「リセットした `<a>` の中に `<div>` を入れる」構造は content model 違反になるため、
// `render={<a .../>}` で1要素に畳む流儀（surface.tsx 冒頭のコメント参照）を維持する。
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

// ⚠ `no-underline` は必須（#112）。カード全体が `<a>` なので、ブラウザ既定の下線が
// 子孫のテキストすべてに描画されてしまう。子側で `text-decoration: none` を書いても
// 祖先の線は消せないため、根で消す。消費側の CSS 事情に依存させないよう DS 側で持つ。
// `block` は `<a>` の既定 inline を潰してカード幅を取り切るため。
const CARD_CLASS = 'block no-underline';

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
      <MediaCard
        className={`${CARD_CLASS} ${className}`.trim()}
        cover={<Skeleton width="100%" height="100%" />}
        title={<Skeleton width="70%" />}
        meta={<Skeleton width="35%" />}
      />
    );
  }

  if (meta == null) return null;

  const siteName = meta.siteName || hostnameOf(meta.url);
  const showImage = meta.imageUrl != null && brokenImageUrl !== meta.imageUrl;
  // アクセシブル名は「タイトル + サイト名」。タイトルが無ければサイト名(/ホスト名)だけにする。
  const accessibleName = meta.title ? `${meta.title} — ${siteName}` : siteName;

  return (
    <MediaCard
      interactive
      className={`${CARD_CLASS} ${className}`.trim()}
      render={
        <a href={meta.url} target="_blank" rel="noopener noreferrer" aria-label={accessibleName} />
      }
      cover={
        showImage ? (
          <img
            src={meta.imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            // 枠(aspect-video・overflow-hidden・角丸)は MediaCard 側が持つので、ここは
            // 「枠いっぱいに敷いて切り落とす」ことだけを指定する。
            className="h-full w-full object-cover"
            onError={() => setBrokenImageUrl(meta.imageUrl ?? null)}
          />
        ) : undefined
      }
      // タイトルが無いページではサイト名を主役に繰り上げる(空のタイトル行を出さない)。
      title={meta.title || siteName}
      meta={meta.title ? siteName : undefined}
    />
  );
}
