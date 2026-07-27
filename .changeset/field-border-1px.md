---
'@insession/design-system': patch
---

field の枠幅を 1.5px から 1px に変える（#35）

`Input` / `Textarea` / `SearchField`（`FIELD_BOX_BASE` を共有）と `Composer` / `UploadTile` の枠幅を `1.5px` から `1px` にした。

## 理由: 1.5px は「効くブラウザと効かないブラウザがある」値だった

3エンジン × DPR で実測した結果（左右合計を `getBoundingClientRect` で測定）:

| エンジン | DPR1 | DPR2 | DPR3 |
| --- | --- | --- | --- |
| Chromium | 1px | 1px | 1px |
| Firefox | 1px | 1px | 1px |
| **WebKit** | 1px | **1.5px** | **1.333px** |

つまり 1.5px が実際に描かれるのは **WebKit の DPR≥2 だけ**。据え置くと「iOS Safari では枠が太く Android Chrome では細い」「同じ Retina Mac でも Safari と Chrome で違う」という**意図しないプラットフォーム差が仕様として固定される**。消費側（insession-app）は Capacitor で iOS / Android の両方に出しているため実ユーザーに見える差になる。

## なぜ 2px ではなく 1px か

- **1px は現状の大多数の見え方**（Chromium / Firefox / Android は既に 1px で描画されている）。変更による見た目の差が最小
- 2px にすると全プラットフォームで太くなるうえ、「Inputs は控えめ / コントロール（`Button` / `Checkbox` / `Radio` は `border-2`）」という**意図的な強弱の区別が消える**
- 1px なら設計意図（fields はコントロールより細い）を保ったまま、**宣言値と実描画が全エンジンで一致**する

## 影響

**WebKit の DPR≥2（iOS / Retina Safari）でのみ枠がわずかに細くなる。** それ以外のプラットフォームでは見た目は変わらない（既に 1px で描かれていたため）。

修正後、全エンジン・全 DPR で `borderTopWidth: 1px` になることを実測で確認済み。
