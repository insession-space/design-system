---
'@insession/design-system': minor
---

a11y: ライトテーマの色コントラスト・タッチ領域・リンクの色依存を是正する (#122)

**⚠ 見た目が変わる。** 消費側 2 リポジトリ（insession-app / loophub-app）は、publish 後にライトテーマの画面を確認すること。

**accent を「塗り」、accent-soft を「文字」に役割分離した。** コメント上はそう書かれていたが、実際には accent が塗り 12 箇所と文字 15 箇所を兼ねており、ライトの accent (#ff5a36) は bg 上 2.55:1 と WCAG 1.4.3 の 4.5:1 を大きく割っていた。accent 自体を 4.5:1 まで暗くするとライトの CTA・バッジ・枠がすべて暗い赤橙になるため、**塗りは明るいコーラルのまま (3:1)、文字は accent-soft (4.5:1)** に寄せた。`text-accent` を使っていた箇所は `text-accent-soft` へ移した。今後「アクセント色の文字」が要るときは accent ではなく accent-soft を使うこと。

**アクセント塗りの上の文字色を白からダークインクへ変えた。** 白抜きは dark 2.84:1 / light 3.10:1 しかない。コーラルは中明度の暖色なので白では届かず、「ブランド色を暗くする」か「ラベルを暗くする」かの二択で後者を採った（コーラルの見た目を一切動かさずに済むため）。結果 dark 6.39:1 / light 4.89:1。

**ライトテーマのセマンティック色と text-faint を濃くした。** text-faint 2.10 / warning 2.04 / success 2.60 / danger 3.55 / info 3.75 → いずれも 4.5:1 以上。判定は `--color-bg` だけでなく **DS の全背景面（bg / bg-elevated / surface / surface-hover / surface-3）と、その色自身のティント面（`*-surface` 12% / `*-surface-strong` 20%）**を含めた最悪ケースで行った。Lozenge / Badge / Chip は「同系色のティント面に同系色の文字」を載せる作りなので、bg 上だけで判定すると通ってもバッジ内で割る。ダークは text-faint と info のみ微調整。

**Checkbox / Radio の枠に `--color-control-border` を新設した。** off 状態は枠だけが「操作可能なコントロールがある」ことを伝えるため WCAG 1.4.11 の 3:1 が要るが、装飾用の `border-strong` は 1.2〜1.5:1 しかない。`border-strong` 自体を濃くすると全ての区切り線が硬くなり DS の意匠を壊すので、コントロール専用トークンを分けた。

**タッチ領域の下限を揃えた。** Checkbox / Radio / Toggle / Slider のつまみ / SegmentedControl / Chip が、ポインタ端末で 24×24 CSS px（WCAG 2.2 SC 2.5.8）、タッチ端末で 44×44（Apple HIG）以上になる。下限値は `--control-hit-size` / `--control-touch-size` に単一ソース化した。**見た目のサイズは変えず、見えない擬似要素で当たり判定だけを広げている**（Checkbox / Radio は行の最小高さも上げているため、広げた当たり判定が隣の行と重ならない）。

**本文中リンク（`variant="inline"`）に下線を戻した。** 色とウェイトだけでは地の文と区別できず WCAG 1.4.1 に触れるため。ベタ下線ではなく 1px + 4px オフセットの控えめな下線にして、DS の「下線を使わない」意匠からの逸脱を最小に留めた。他の variant は本文に埋め込まれないので下線を持たない。
