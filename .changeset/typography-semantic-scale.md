---
'@insession/design-system': major
---

タイポグラフィをセマンティックスケール1本に統一し、逸脱を CI で機械強制する（#117）

**破壊的変更: 公開トークン（`theme.css`）から9つのサイズ段を削除する。** 消費側が使っている場合、版を上げた時点でそのユーティリティは生成されなくなる（クラス名は DOM に残るが CSS が当たらない）ため、追随が必要。

| 廃止 | 現状 | 置換先 |
| --- | --- | --- |
| `text-2xs` | 10px | `text-xs` (11px) |
| `text-smd` | 13px | `text-base` (14px) |
| `text-md` | 15px | `text-base` (14px) |
| `text-xl` | 17px | `text-lg` (16px) |
| `text-2xl` | 18px | `text-lg` (16px) |
| `text-3xl` | 21px | `text-h2` (22px) |
| `text-4xl` | 24px | `text-h2` (22px) |
| `text-5xl` | 30px | `text-h1` (32px) |
| `text-6xl` | 56px | `text-display` (44px) |

**なぜ major か**: サイズ段の削除は消費側のビルドを壊さずに見た目だけを静かに変える。エラーもワーニングも出ないので、patch / minor で配ると気づかないまま本番に出る。

その他の変更:

- 残した補助スケール（`text-xs` / `text-sm` / `text-base` / `text-lg`）の `line-height` を `normal` から実数へ。環境のフォントによる行送りのブレを無くす（同じ `font-size` でも行高が変わる状態を解消）。
- DS 内の `text-[12.5px]` 等の任意値 15 箇所を廃止し、スケールへ寄せた。Toast / Chip / Menu / SplitModal / MessageItem の端数サイズが整数に丸まる。
- フォームコントロール（Button / Input / Checkbox / Radio / Composer / SettingRow / UploadTile）が 15px → 14px、Tabs / StepFlow / FeedItem のラベルが 13px → 14px、RingTimer / Status / MediaThumbnail のメタ表示が 10px → 11px に変わる。
- コンポーネントの `font-display` / `font-mono` を `font-body` に一本化（3トークンは同値。`LogoMark` のワードマークだけ例外として残す）。トークン定義自体は別名として残るので、消費側の `font-*` 参照は壊れない。
- `components.css` のテキスト用 `font-size` / `letter-spacing` の直書きをトークン経由に変更。
- Tailwind 既定テーマの段（`text-xl` 以上）を `initial` で明示的に潰した。上書きを削るだけだと既定値（20/24/30/36/48/60px）が表に出て、廃止したはずの段が DS の意図と違うサイズで生き続けるため。`text-7xl` 以上も同じ理由で塞いである。
- `pnpm check:typography` を追加し CI に組み込み。スケール外の任意値・廃止した段・CSS への直書き・Tailwind 既定の復活を機械的に止める。
