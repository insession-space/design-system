# @insession/design-system

## 7.0.2

### Patch Changes

- fe0feda: Button: 消費側の className で variant / size のスタイルを上書きできるようにする（#137）

  `Button` の class 文字列の組み立てを単純連結から tailwind-merge へ置き換えた。同じ CSS プロパティの
  ユーティリティが後勝ちで 1 つに畳まれるので、`<Button variant="ghost" className="text-accent">` が
  `!`（important 接尾辞）なしで効くようになる（従来は variant 側の `text-info` が配布 CSS の
  出力順で勝っていた）。`px-*` / `py-*` / `text-<size>` / `bg-*` / `border-*` / `font-*` も同様。

  出荷済みの見た目は変えていない（全 variant × 全 size の computed style が実ブラウザで一致することを
  確認済み）。消費側に既にある `!` も従来どおり効く（important は別グループとして扱われるため、
  効きすぎることもない）。

## 7.0.1

### Patch Changes

- 9e84f02: 単辺の border-\* に border-solid を併記していた箇所で、消費側に 3px の枠線が出ていたのを直す

  `border-b border-solid` と書くと border-style は 4 辺すべてに付く。Tailwind のプリフライトを
  読み込む環境では border-width の既定が 0 なので下辺だけの線になるが、**プリフライトを使わない
  消費側では border-width の既定 medium(3px) が残り 3 辺に出て、要素が枠で囲まれて見える**。

  対象は AppBar / Footer(page.tsx)・Modal のフッター・SplitModal(ヘッダー / ナビ列 / フッター /
  モバイルの行)の計 9 箇所。他 3 辺を 0 にする指定を添えた(`border-0` は shorthand で単辺指定との
  勝敗が生成 CSS の出力順で決まるため使わない)。

  このバグは DS 自身の Storybook では見えない(プリフライトを読み込むため)ので、
  `pnpm check:border-width` を追加して verify で機械的に止める。

## 7.0.0

### Major Changes

- 6a1cfd4: アクセント塗りの上のラベルを白へ戻し、accent ボタンの塗りを accent 本体へ戻した（#122 / #130 の撤回）。

  - `--color-on-accent` を `#17160f`（ダークインク）から `#ffffff` へ戻した。ToggleGroup / StepFlow / FeedItem / Button / IconButton など、`text-on-accent` を使う箇所すべてが白抜きになる。
  - `--color-accent-fill`（dark `#df7e67` / light `#d65a3f`）を**削除**し、Button の accent variant の塗りを `bg-accent` へ戻した。DS 内外に他の利用箇所は無い（消費側の実使用ゼロを実測）。

  ⚠ **breaking**: `--color-accent-fill` / `bg-accent-fill` は解決されなくなる。また、この組み合わせ（accent 塗り + 白ラベル）は WCAG 1.4.3 の 4.5:1 を意図的に満たさない（dark 2.84:1 / light 3.10:1）。コントラストを上げる必要が出たときは、ラベルを暗インクに戻すのではなく塗り側（accent）を暗くすること。

## 6.2.0

### Minor Changes

- 869971a: Button の accent variant の塗りを専用トークン `--color-accent-fill` に分離し、彩度を 35% 落として和らげた（#130）。

  彩度 100% のコーラルをボタンの面積で敷くと周囲の面から浮きすぎて目に刺さっていた。色相は据え置き（dark 11.4° / light 10.7°）、明度も動かさず彩度だけを落としている。`--color-accent` 本体は変更していないので、バッジ・枠・リンク・フォーカスリング・ティント面（`--color-tint-*`）の見た目は変わらない。

  | テーマ | 変更前（accent） | 変更後（accent-fill） | ラベル（on-accent） | 最悪背景面      |
  | ------ | ---------------- | --------------------- | ------------------- | --------------- |
  | dark   | `#ff6a47`        | `#df7e67`             | 6.39 → 6.31 : 1     | 5.00 → 4.93 : 1 |
  | light  | `#ff2f02`        | `#d65a3f`             | 4.89 → 4.67 : 1     | 3.00 → 3.14 : 1 |

  いずれも文字 4.5:1（WCAG 1.4.3）・面 3:1（1.4.11）を満たす。ライトの最悪面はちょうど基準線だった 3.00:1 から 3.14:1 へ改善している。

  「アクセント色の広い塗り」が新たに必要になったときは `accent` ではなく `accent-fill` を使うこと。

## 6.1.0

### Minor Changes

- 7a49257: a11y: ライトテーマの色コントラスト・タッチ領域・リンクの色依存を是正する (#122)

  **⚠ 見た目が変わる。** 消費側 2 リポジトリ（insession-app / loophub-app）は、publish 後にライトテーマの画面を確認すること。

  **accent を「塗り」、accent-soft を「文字」に役割分離した。** コメント上はそう書かれていたが、実際には accent が塗り 12 箇所と文字 15 箇所を兼ねており、ライトの accent (#ff5a36) は bg 上 2.55:1 と WCAG 1.4.3 の 4.5:1 を大きく割っていた。accent 自体を 4.5:1 まで暗くするとライトの CTA・バッジ・枠がすべて暗い赤橙になるため、**塗りは明るいコーラルのまま (3:1)、文字は accent-soft (4.5:1)** に寄せた。`text-accent` を使っていた箇所は `text-accent-soft` へ移した。今後「アクセント色の文字」が要るときは accent ではなく accent-soft を使うこと。

  **アクセント塗りの上の文字色を白からダークインクへ変えた。** 白抜きは dark 2.84:1 / light 3.10:1 しかない。コーラルは中明度の暖色なので白では届かず、「ブランド色を暗くする」か「ラベルを暗くする」かの二択で後者を採った（コーラルの見た目を一切動かさずに済むため）。結果 dark 6.39:1 / light 4.89:1。

  **ライトテーマのセマンティック色と text-faint を濃くした。** text-faint 2.10 / warning 2.04 / success 2.60 / danger 3.55 / info 3.75 → いずれも 4.5:1 以上。判定は `--color-bg` だけでなく **DS の全背景面（bg / bg-elevated / surface / surface-hover / surface-3）と、その色自身のティント面（`*-surface` 12% / `*-surface-strong` 20%）**を含めた最悪ケースで行った。Lozenge / Badge / Chip は「同系色のティント面に同系色の文字」を載せる作りなので、bg 上だけで判定すると通ってもバッジ内で割る。ダークは text-faint と info のみ微調整。

  **Checkbox / Radio の枠に `--color-control-border` を新設した。** off 状態は枠だけが「操作可能なコントロールがある」ことを伝えるため WCAG 1.4.11 の 3:1 が要るが、装飾用の `border-strong` は 1.2〜1.5:1 しかない。`border-strong` 自体を濃くすると全ての区切り線が硬くなり DS の意匠を壊すので、コントロール専用トークンを分けた。

  **タッチ領域の下限を揃えた。** Checkbox / Radio / Toggle / Slider のつまみ / SegmentedControl / Chip が、ポインタ端末で 24×24 CSS px（WCAG 2.2 SC 2.5.8）、タッチ端末で 44×44（Apple HIG）以上になる。下限値は `--control-hit-size` / `--control-touch-size` に単一ソース化した。**見た目のサイズは変えず、見えない擬似要素で当たり判定だけを広げている**（Checkbox / Radio は行の最小高さも上げているため、広げた当たり判定が隣の行と重ならない）。

  **本文中リンク（`variant="inline"`）に下線を戻した。** 色とウェイトだけでは地の文と区別できず WCAG 1.4.1 に触れるため。ベタ下線ではなく 1px + 4px オフセットの控えめな下線にして、DS の「下線を使わない」意匠からの逸脱を最小に留めた。他の variant は本文に埋め込まれないので下線を持たない。

- 4ebdc88: a11y: キーボードフォーカスを可視化し、モーション抑制と強制カラーモードを DS 単体で完結させる (#121)

  **フォーカスリングが実質不可視だったのを修正した。** `--shadow-focus` は α が 0.16 しかなく、背景へ合成した実効コントラストが 1.16〜1.25:1（WCAG 1.4.11 は 3:1 必須）しかない。それを 17 部品が `focus-visible:outline-none` と併記していたため、ブラウザ既定の可視アウトラインを消したうえで見えないリングに差し替える形になっており、キーボードユーザーはフォーカス位置を判別できなかった。

  既に定義済みで基準を満たしていた `--color-focus-ring`（dark 5.71:1 / light 4.63:1）・`--focus-ring-width`・`--focus-ring-offset` をトークン参照のまま使うアウトラインへ置き換えた。値の単一ソースは `theme.css` のままで、部品側に `2px` 等の直書きはしない。フォーカスしていない通常表示のレンダリング結果は変わらない。

  代替のフォーカス表現を持たず完全に不可視だった `Stepper` の数値入力と `Composer` にもフォーカス表示を追加した（Composer は器側に `focus-within` で出す。`Input` / `Textarea` / `SearchField` は従来どおり枠色の変化で示す）。

  **`prefers-reduced-motion` の抑制を DS の配布物だけで完結させた。** Spinner の回転・RingTimer の脈動・各部品のトランジションは、ソースコメントに反して消費側アプリの `style.css` にしか抑制規則が無く、DS のプリビルド CSS だけを読む loophub・DS 単体利用・Storybook では止まっていなかった（RingTimer の脈動は無限アニメーション）。抑制を部品のクラス文字列側に持たせ、取り込み方（`@source` 方式 / プリビルド CSS 方式）に依らず届くようにした。実態と食い違っていたコメントも修正した。

  **`forced-colors`（Windows ハイコントラスト）に対応した。** 強制カラーモードでは `background-color` と `box-shadow` が無効化されるため、面の色だけで状態を示していた SegmentedControl / ToggleGroup の選択中は判別不能だった。選択中・チェック済み・オン・ハイライト行をシステム色で示し、無効状態は `GrayText` へ寄せた。

### Patch Changes

- 3c10af6: 検証チャネルを `pnpm verify` / `pnpm verify:full` に一本化し、カタログ網羅と a11y を機械検査で守るようにした（#120）。

  - `pnpm verify`（型検査・lint・タイポグラフィ・カタログ網羅・ビルド・配布 CSS・パッケージ内容）と `pnpm verify:full`（+ カタログのビルド + 全 story への axe）を追加。CI は個別チェックを列挙せずこの 2 つを呼ぶだけにしたので、手元の確認と CI が構造的にズレなくなった
  - `pnpm check:stories` を追加。public export したコンポーネントが story で一度も描画されていなければ CI で落ちる
  - `pnpm check:package` を追加。CI にインラインで埋まっていた tarball 検査をスクリプトへ切り出し、手元でも実行できるようにした。あわせて `exports` が指す先が実際に同梱されているかも見る
  - Storybook に `@storybook/addon-a11y` + `@storybook/addon-vitest` を導入し、全 story（206 件）を実ブラウザで描画して axe を掛ける（違反があれば CI が落ちる）
  - `RingTimer` に `ariaLabel` を追加。`role="progressbar"` にアクセシブルな名前が無く「何の進捗か」が支援技術へ伝わっていなかった（省略時は `caption`、それも無ければ「残り時間」）

  `color-contrast` は一時的に抑制している（色トークンの再設計が要るため別 Issue）。それ以外の見た目・出荷物（`dist` / 配布 CSS / 型）は変更していない。

## 6.0.0

### Major Changes

- 35aaa4b: タイポグラフィをセマンティックスケール 1 本に統一し、逸脱を CI で機械強制する（#117）

  **破壊的変更: 公開トークン（`theme.css`）から 9 つのサイズ段を削除する。** 消費側が使っている場合、版を上げた時点でそのユーティリティは生成されなくなる（クラス名は DOM に残るが CSS が当たらない）ため、追随が必要。

  | 廃止       | 現状 | 置換先                |
  | ---------- | ---- | --------------------- |
  | `text-2xs` | 10px | `text-xs` (11px)      |
  | `text-smd` | 13px | `text-base` (14px)    |
  | `text-md`  | 15px | `text-base` (14px)    |
  | `text-xl`  | 17px | `text-lg` (16px)      |
  | `text-2xl` | 18px | `text-lg` (16px)      |
  | `text-3xl` | 21px | `text-h2` (22px)      |
  | `text-4xl` | 24px | `text-h2` (22px)      |
  | `text-5xl` | 30px | `text-h1` (32px)      |
  | `text-6xl` | 56px | `text-display` (44px) |

  **なぜ major か**: サイズ段の削除は消費側のビルドを壊さずに見た目だけを静かに変える。エラーもワーニングも出ないので、patch / minor で配ると気づかないまま本番に出る。

  その他の変更:

  - 残した補助スケール（`text-xs` / `text-sm` / `text-base` / `text-lg`）の `line-height` を `normal` から実数へ。環境のフォントによる行送りのブレを無くす（同じ `font-size` でも行高が変わる状態を解消）。
  - DS 内の `text-[12.5px]` 等の任意値 15 箇所を廃止し、スケールへ寄せた。Toast / Chip / Menu / SplitModal / MessageItem の端数サイズが整数に丸まる。
  - フォームコントロール（Button / Input / Checkbox / Radio / Composer / SettingRow / UploadTile）が 15px → 14px、Tabs / StepFlow / FeedItem のラベルが 13px → 14px、RingTimer / Status / MediaThumbnail のメタ表示が 10px → 11px に変わる。
  - コンポーネントの `font-display` / `font-mono` を `font-body` に一本化（3 トークンは同値。`LogoMark` のワードマークだけ例外として残す）。トークン定義自体は別名として残るので、消費側の `font-*` 参照は壊れない。
  - `components.css` のテキスト用 `font-size` / `letter-spacing` の直書きをトークン経由に変更。
  - Tailwind 既定テーマの段（`text-xl` 以上）を `initial` で明示的に潰した。上書きを削るだけだと既定値（20/24/30/36/48/60px）が表に出て、廃止したはずの段が DS の意図と違うサイズで生き続けるため。`text-7xl` 以上も同じ理由で塞いである。
  - `pnpm check:typography` を追加し CI に組み込み。スケール外の任意値・廃止した段・CSS への直書き・Tailwind 既定の復活を機械的に止める。

## 5.0.0

### Major Changes

- 177900e: **BREAKING:** ブランド色トークンを役割ベースの名前へ一本化した（#109）。

  ## なぜ

  ブランドを 4 色パレットへ刷新したときに**値だけ差し替えて名前を旧名のまま据え置いた**ため、全色で名前と実値が食い違っていた。`--color-mint` はコーラル、`--color-cyan` はブルー、`--color-violet` に至ってはグリーンを返す状態で、`text-violet` と書いた人は緑が出ることを読めなかった。実際、消費側では実態に気づいた人が `--green: var(--color-violet)` のような別名を個別に生やして迂回していた。

  色名をトークン名にするのをやめ、役割で名付けることで、次にブランド色を変えても名前が崩れないようにする。

  ## 移行方法（消費側は一括置換でよい）

  | 旧                  | 新                    | 役割                                     |
  | ------------------- | --------------------- | ---------------------------------------- |
  | `--color-mint`      | `--color-accent`      | プライマリアクセント                     |
  | `--color-mint-soft` | `--color-accent-soft` | 淡いアクセント（リンク静止色・アイコン） |
  | `--color-cyan`      | `--color-accent-2`    | セカンダリアクセント（focus リング等）   |
  | `--color-violet`    | `--color-decor-1`     | 装飾の色分け                             |
  | `--color-maroon`    | **削除**              | DS でも消費側でも実使用がゼロだったため  |

  Tailwind ユーティリティも同様（`text-mint` → `text-accent`、`bg-violet` → `bg-decor-1`、`border-cyan` → `border-accent-2` など）。`-soft` 付きを先に置換すること（`--color-mint-soft` を `--color-mint` より先に処理しないと `--color-accent-soft` にならない）。

  装飾の色数が足りなくなったら `--color-decor-2` として足すこと。新しい色を足すときも「その色が何に使われるか」で名付け、色名トークンを復活させないこと。

  ## 見た目は変わらない

  **名前だけの変更で、色の値は 1 つも変えていない。** 検証として、リネーム前後の `dist/styles.css` を変数名の違いだけ正規化して比較し、**色の実値の差は削除した `--color-maroon`（`#8a4a1f`）が消えたことのみ**であることを確認した。

  ## 併せて直したもの

  - `RingTimer`: `urgent ? 'var(--color-accent)' : 'var(--color-mint)'` と書かれていたが、当時 `--color-accent` は `--color-mint` の別名だったので**両者が同じ色**で、この分岐は一度も効いていなかった。トークンを役割名へ寄せた時点で同語反復が露呈したため三項を畳んだ（見た目は従来と同一）。urgent を色でも示すかはデザイン判断として別途決める

  ## 既知の据え置き

  `--color-tint-*`（9 段階）の合成元は `var(--color-accent)` ではなく生値 `rgb(255 90 54)` のまま残した。この値は**ライト側の accent（`#ff5a36`）**であってダーク既定の `#ff6a47` ではないため、`var()` 参照に置き換えると**ダークでのティント面の色が変わる**（＝見た目が動く）。この変更は「名前だけを直し値は変えない」ものなので据え置いた。ティント面をアクセントに追従させるかは、見た目の変更を伴う別の判断として扱う。

## 4.5.0

### Minor Changes

- 96b6e6b: `LinkPreview` を `MediaCard` ベースに作り替える（#112）。**見た目が変わる。**

  実アプリ（InSession の space チャット）で読みづらいという問題が 2 つ出たため:

  1. **テキスト全体に下線が入っていた。** カード全体を 1 つの `<a>` にしているが、`<a>` にはブラウザ既定の下線が残る（配布 CSS に preflight の `a` リセットが無い）。`text-decoration` は**祖先から子孫のインラインボックスへ描画される**ので、中の `<span>` で `text-decoration: none` を書いても線は消えない。→ 根に `no-underline` を当てた（これが唯一の正しい対処）。
  2. **画像がアスペクト比に収まらなかった。** 画像枠に `aspect-[1.91/1]`（arbitrary value）を使っていたため、消費側の Tailwind の生成に乗らず縦長の OG 画像がそのまま出て、チャットのログが 1 件のプレビューで埋まっていた。→ `MediaCard` のカバー枠（`aspect-video` + `overflow-hidden` + full-bleed）に委譲した。標準ユーティリティなので消費側での生成漏れが起きない。

  **変更点:**

  | 以前                                                         | 現在                                                                           |
  | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
  | `Surface` + 自前の画像枠 + サイト名 / タイトル / 説明の 3 行 | `MediaCard` に委譲                                                             |
  | 画像は 1.91:1（arbitrary value）                             | カバーは **16:9**（`aspect-video`・full-bleed）                                |
  | タイトル・説明とも `line-clamp-2`                            | タイトル・メタとも **1 行 truncate**                                           |
  | 説明文を表示                                                 | **表示しない**（縦幅を食わないため。`LinkPreviewMeta` の型からは消していない） |
  | サイト名 → タイトル の順                                     | **タイトル**（太字）→ **サイト名**（メタ行）の順                               |

  タイトルが無いページでは空のタイトル行を出さず、サイト名（またはホスト名）を主役に繰り上げる。

  a11y は据え置き — OG 画像は装飾（`alt=""` / `aria-hidden`）、リンクのアクセシブル名は「タイトル + サイト名」。`loading` も `MediaCard` と同じ形（カバー + タイトル + メタ）の Skeleton にした。

## 4.4.1

### Patch Changes

- 587a672: fix(MediaRow/MediaCard): 行の背景を surface に、カバー画像を full-bleed に

  - `MediaRow`: ルート要素が `bg-surface-2`（背景面より一段濃い、浮かせるための面）で塗られており、リスト行として周囲より沈んで見えていた。標準の背景面 `bg-surface` に揃えて Card 等と同じ段に載せる（#107）
  - `MediaCard`: カバー画像が `Card padding="lg"` の内側に収まって上・左・右に 16px の余白が入っていたのを、`-mx-4 -mt-4` で打ち消してカード端まで出す。あわせて上側の角丸を Card と同じ `rounded-t-card`（16px）に合わせる（#108）

## 4.4.0

### Minor Changes

- 91729e7: `MediaCard` が `render` プロップを受け取れるようになった。

  - 背景: 消費側（insession-app の `SpaceCard`）は「カード全体がクリック可能」な UI を、`<button>` の中に `<div>` を置く content model 違反を避けるため `<Card render={<button type="button" />} onClick={…}>` と自前で組んでいた。`MediaCard` へ寄せようとすると `MediaCardProps` が `Omit<ComponentProps<'div'>, …>` ベースで `render` を型に持たず、内部の `Card` へ流し込めなかった。
  - 対策: `MediaCardProps` のベースを `ComponentProps<'div'>` から `Surface`（`surface.tsx`）と同じ `useRender.ComponentProps<'div'>` に揃え、`render` をそのまま内部の `Card` へ通すようにした。あわせて `interactive`（ホバーの持ち上げ + フォーカスリング）も通せるようにした。これにより `<MediaCard render={<button type="button" />} interactive onClick={…} …/>` の 1 要素でクリック可能なメディアカードを描ける。
  - `interactive` の既定値は従来と同じ `false` で、`render` を渡さない既存の `<MediaCard cover=… title=… />` 呼び出しは一切変更なしで従来どおり `<div>`（Card）として描画され、見た目も変わらない（追加のみで破壊的変更ではない）。
  - `MediaCard` が持つ「並び・余白・truncate の取り決めだけを持ち、プロダクト固有の意味づけは持たない」という設計は崩していない。今回増やしたのは「要素の実体を差し替える口」（`render`）と「相互作用の見た目」（`interactive`）の 2 つだけで、`onPlay` のような用途固定の props は足していない。

### Patch Changes

- 78873f9: MessageItem: リアクションピルの絵文字を大きくして余白を詰め、押している状態の数字が背景に溶けないようにした (#103)

  リアクションピルは Chip の既定スタイル（12.5px + `px-3.5 py-[7px]`）をそのまま使っていたため、主役の絵文字が小さいのにボタンだけが大きく見えていた。さらに `selected` は accent tint の面に accent の文字を載せる配色だったため、数字が背景色と同系色になって読めなかった。

  MessageItem 側にリアクション専用のピルを持たせ、絵文字 15px・数字 11.5px・`px-2 py-1` に詰めた。押している状態は tint の面ではなく accent の枠で示し、数字は状態に関わらず text 色にしてコントラストを確保している。

  `Chip` の実装・API・見た目は変更していないため、フィルター / タグ / 入力トークンとしての既存の利用箇所に影響はない。

## 4.3.2

### Patch Changes

- b9e242a: `MessageItem` のヘッダーで投稿者名と時刻のベースラインが揃っていなかったのを直した（#97）。

  - 原因: ヘッダーが `HStack align="baseline"` で `UserLabel` と時刻 `<span>` を兄弟として並べていたが、`UserLabel` 内部は `HStack align="center"` のフレックスで、最初の要素はテキストを持たないアバターの `<div>`。フレックスの first baseline はこのアバター div から合成されるため、外側の `align="baseline"` は「名前のベースライン」ではなくアバターの下端を基準にしてしまっていた。ヘッドレス Chromium の実測でアバター有りのとき時刻が名前より 1.84px ずれ、アバター無しのときだけ 0px だった（修正後はアバターの有無・`href`/`onClick` の有無いずれの組み合わせでも 0px）。
  - 対策として `UserLabel` に `trailing` slot を追加した。名前の**右**に、名前と**同じベースライン**で置く小さな要素（時刻・バッジ等）向けの差し込み口で、名前の"下"に置く `subtitle` と対になる。名前と `trailing` を同じ flex 行のテキスト同士として描くため、アバターの有無や `href`/`onClick` による要素分岐（`<div>`/`<a>`/`<button>`）に関係なくベースラインが一致する。`MessageItem` はこれを使って時刻を `UserLabel` の `trailing` に渡すよう変更した。
  - `MessageItem` に `actionsSlot` を追加した。既存の `actions` は `{icon,label,onClick}` の配列しか表現できず、Popover を伴うアクション UI（絵文字ピッカー等）を置けない。消費側（insession-app）はこれを `MessageItem` の兄弟として行方向 flex の中に横並びで置かざるを得なかったが、アクション UI は非表示（`opacity-0`）でも in-flow のため常時レイアウト幅を占有し、本文の折り返し幅を奪っていた（実測で本文が約 100px 分狭くなり早期折り返しが起きていた）。`actionsSlot` はヘッダー行の中（`actions` の後ろ）に任意のノードを描画できる差し込み口で、消費側が兄弟として置く必要をなくす。表示/非表示の制御は消費側の責務のため、DS 側の opacity 制御はここには当てない。
  - `MessageItem` のルートに `w-full` を追加した。`min-w-0` は flex アイテムが縮むことを許可するだけで幅を取り切る指定ではないため、行方向 flex の子に置かれたときに与えられた幅を使い切るよう明示した。

  - `trailing` は `UserLabel` が操作可能（`href`/`onClick`）なとき、時刻もその `<a>`/`<button>` の内側に入る。時刻は押しても何も起きない飾りなので、`MessageItem` は操作可能なときだけ時刻を無害化する: クリック/中クリックを `preventDefault` + `stopPropagation` で止め、`aria-hidden` にしたうえで操作領域の外側に `sr-only` の時刻を置いて読み上げを保つ（リンク名が「表示名 + 時刻」に汚れないよう `ariaLabel` に表示名だけを渡す）。`<a href>` を右クリックしてコンテキストメニューから「新しいタブで開く」を選ぶ経路だけは DOM イベントで止められないため、時刻を完全に不活性にしたい場合は `authorHref` ではなく `authorOnClick` を使う。
  - `ReactNode` の差し込み口の有無判定に `hasSlotContent`（`src/ui-kit/slot.ts`）を足した。`trailing={cond && <Badge />}` のような条件付き描画で条件が false のとき、素朴な `!= null` 判定だと「中身あり」と誤判定してラッパーと `gap` だけが増え、余白と truncate の効き方が静かにずれるため。React 自身に合わせて `false` / `null` / `undefined` / `''` を「中身なし」として扱う。

  いずれも既存 props の意味・既定値・見た目は変えない破壊的変更ではない（`trailing`/`actionsSlot` 未指定なら従来と同一の DOM・見た目）。

## 4.3.1

### Patch Changes

- 6c6f116: field の枠幅を 1.5px から 1px に変える（#35）

  `Input` / `Textarea` / `SearchField`（`FIELD_BOX_BASE` を共有）と `Composer` / `UploadTile` の枠幅を `1.5px` から `1px` にした。

  ## 理由: 1.5px は「効くブラウザと効かないブラウザがある」値だった

  3 エンジン × DPR で実測した結果（左右合計を `getBoundingClientRect` で測定）:

  | エンジン   | DPR1 | DPR2      | DPR3        |
  | ---------- | ---- | --------- | ----------- |
  | Chromium   | 1px  | 1px       | 1px         |
  | Firefox    | 1px  | 1px       | 1px         |
  | **WebKit** | 1px  | **1.5px** | **1.333px** |

  つまり 1.5px が実際に描かれるのは **WebKit の DPR≥2 だけ**。据え置くと「iOS Safari では枠が太く Android Chrome では細い」「同じ Retina Mac でも Safari と Chrome で違う」という**意図しないプラットフォーム差が仕様として固定される**。消費側（insession-app）は Capacitor で iOS / Android の両方に出しているため実ユーザーに見える差になる。

  ## なぜ 2px ではなく 1px か

  - **1px は現状の大多数の見え方**（Chromium / Firefox / Android は既に 1px で描画されている）。変更による見た目の差が最小
  - 2px にすると全プラットフォームで太くなるうえ、「Inputs は控えめ / コントロール（`Button` / `Checkbox` / `Radio` は `border-2`）」という**意図的な強弱の区別が消える**
  - 1px なら設計意図（fields はコントロールより細い）を保ったまま、**宣言値と実描画が全エンジンで一致**する

  ## 影響

  **WebKit の DPR≥2（iOS / Retina Safari）でのみ枠がわずかに細くなる。** それ以外のプラットフォームでは見た目は変わらない（既に 1px で描かれていたため）。

  修正後、全エンジン・全 DPR で `borderTopWidth: 1px` になることを実測で確認済み。

## 4.3.0

### Minor Changes

- 24f321e: `MediaRow` / `MediaCard` / `MediaThumbnail` を追加する（#94）。破壊的変更は無い（新規コンポーネントのみ）。

  **`MediaRow`（キュー/プレイリストの 1 行）**:

  ```tsx
  <MediaRow
    dragHandle
    thumbnail={<MediaThumbnail quality="4K" duration="3:32"><img … /></MediaThumbnail>}
    title="深夜のプレイリスト特集"
    subtitle="1番目 · Seiya が追加"
    actions={
      <>
        <IconButton label="再生" icon={<Icon name="play_arrow" />} variant="ghost" touchSize={44} />
        <IconButton label="お気に入りに追加" icon={<Icon name="star_outline" />} variant="ghost" touchSize={44} />
        <IconButton label="キューから削除" icon={<Icon name="close" />} variant="ghost" touchSize={44} />
      </>
    }
  />
  ```

  **`MediaCard`（メディア/ライブのカード）**:

  ```tsx
  <MediaCard
    cover={<img … />}
    overlay={
      <>
        <Badge tone="live" dot>LIVE</Badge>
        <CircleBadge><Icon name="public" size={14} /></CircleBadge>
      </>
    }
    title="Working hard"
    meta="1 watching · playing · late night"
    footer={<AvatarStack people={people} size={28} />}
  />
  ```

  - `dragHandle` / `thumbnail` / `actions`（`MediaRow`）、`cover` / `overlay` / `footer`（`MediaCard`）はいずれも `ReactNode` のスロットで、`onPlay` / `isStarred` / `watchingCount` のような用途固定の意味づけ props は持たない。`title` / `subtitle` / `meta` も**整形済みの文字列**（または `ReactNode`）を受け取るだけで、i18n・データ取得・`kind: 'space-live' | …` のようなプロダクト固有の union は持たない
  - サムネイルの尺・画質オーバーレイは補助コンポーネント `MediaThumbnail`（`src` または `children` / `duration` / `quality` / `alt`）に切り出した。画質ラベルは既存の `Badge`（`tone="neutral"`）を流用する
  - `MediaCard` のバッジ列に置く正円バッジとして `CircleBadge` も追加した（`Badge` はピル/角丸矩形専用のため）
  - ドラッグハンドルは装飾のみ（`aria-hidden="true"`）。実際の DnD 操作は消費側の責務

- 12d0127: `MessageItem` に OGP リンクプレビュー(fetcher 注入)と、新規コンポーネント `LinkPreview` を追加した(#93)。**破壊的変更は無い**（`fetchLinkPreview` 未指定なら既存の描画と完全に同じ）。

  **`LinkPreview`(新規・`src/components/link-preview.tsx`)**: メタデータを props で受け取るだけの presentational コンポーネント。大きい OG 画像を上に、その下にサイト名 → タイトル → 説明文(1〜2 行クランプ)を縦積みする。

  ```tsx
  <LinkPreview
    meta={{ url, title, description, siteName, imageUrl }}
    loading={false}
  />
  ```

  - 画像が無いメタデータなら画像領域自体を出さない
  - カード全体を 1 つの `<a>` として描く(`Surface` の `render` prop)。OG 画像は装飾扱い(`alt=""` / `aria-hidden`)にし、リンクのアクセシブル名は「タイトル + サイト名」で構成する
  - `loading` の間は `Skeleton` でプレースホルダを出す

  **`MessageItem`**: fetcher 注入の口を追加した。

  ```tsx
  <MessageItem
    fetchLinkPreview={(url, signal) => fetchOgpMetadata(url, signal)}
    maxLinkPreviews={1}
  >
    記事はこちら https://example.com/article です
  </MessageItem>
  ```

  - `@insession/design-system` は public npm の presentational パッケージであり、fetch / network を自身で持たない。そのため実際の HTTP 取得(OGP の HTML パース・CORS/SSRF 対策・キャッシュを含む)は消費側(insession-app / loophub-app、別リポジトリ別 Issue)に委ね、DS は `fetchLinkPreview` という関数を受け取る口だけを持つ
  - `fetchLinkPreview` 省略時は対象 URL の計算自体を行わず、既存の呼び出しに一切影響しない
  - 本文(`children`)が文字列(または文字列を含む配列)のときだけ URL を自動検出する。`children` に JSX を渡す呼び出し側のため、対象 URL を明示できる `previewUrls?: string[]` も用意した(指定時は自動検出を行わない)
  - `maxLinkPreviews?: number`(既定 1)で表示件数の上限を変更できる
  - 取得は `AbortController` で管理し、unmount / 対象 URL 変化時に in-flight を abort する(unmount 後に setState しない)。同じ URL への重複呼び出しも抑制する
  - `fetchLinkPreview` が `null` を返す/reject する場合はカードを出さず、エラー UI も出さない(本文だけが残る)

  `src/index.ts` から `LinkPreview` / `LinkPreviewProps` / `LinkPreviewMeta` を追加 export した。

## 4.2.0

### Minor Changes

- b1165f0: Button のボーダー消失を直し、Sign in with Apple 用 variant を追加する（#58 / #35 / #71 / #72）

  - **#58 `Button variant="secondary"` の 2px アウトラインが描かれない問題を修正。** BASE の `border-transparent` と variant の `border-text` が同じ utilities レイヤーの `border-color` ユーティリティで、勝敗が配布 CSS の出力順で決まり BASE が勝っていた（実測 `border-top-color: rgba(0, 0, 0, 0)`）。`border-color` を **variant 側だけ**が持つ構造に変え、同一プロパティのユーティリティが同時に並ばないようにした（#17 / #21 と同じ方針）。消費側の `border-text!` 応急処置は外せる。
  - **#72 `variant="apple"` を追加。** Apple HIG に沿った黒地 / 白文字 / 白ロゴで、ライトテーマでも黒地を維持する（`--color-apple` / `--color-on-apple` / `--color-apple-hover` を追加）。hover は黒地では効かない `brightness` ではなく面の変化で出す。
  - **#35 field の枠幅を仕様どおり 1.5px にする。** 裸の任意値（`border-[1.5px]`）は Tailwind v4 が border-color 側と解釈しうる曖昧な書き方で、生成されないと DOM にクラスだけが出て枠が 1px になる。型を明示した書き方へ統一し（`Input` / `Textarea` / `SearchField` / `Composer` / `UploadTile`）、`pnpm check:styles` に任意値ユーティリティの生成検査を足した。
  - **#71 `Stepper` の +/- ボタンに `cursor-pointer` を追加。** DS の他のボタン系だけが持っていて Stepper に無く、「押せることが分からない」状態だった。

- 909f86e: `IconButton` にタッチ端末向けの `touchSize` を足し、設定行の `SettingRow` を追加し、`LogoMark` のワードマークを差し替え可能にする（#60 / #73 / #74）。**破壊的変更は無い**（既存 props の意味・既定値・見た目はいずれも据え置き）。

  **`IconButton`（#60）**: 寸法をインライン style ではなくユーティリティ + CSS 変数で当てるようにし、`touchSize`（`@media (pointer: coarse)` のときに保証する最小の一辺）を追加した。

  ```tsx
  <IconButton label="リアクション" icon={…} size={30} touchSize={44} />
  ```

  - 従来は `style={{ width, height }}` だったため、インライン style があらゆるセレクタより強く、消費側が `@media (pointer: coarse)` やユーティリティで**上書きできなかった**（insession-app のリアクション送信ボタンが legacy CSS の 44px から 30px に縮み、Apple HIG のタップターゲット下限を割った）
  - `touchSize` 省略時はタッチ端末でも `size` のまま。**既存呼び出しの見た目は変わらない**（実測: 既定 36px は 36x36px のまま / `size=30` は touch 環境でも 30x30px）
  - 寸法がクラス側に移ったので、`className="max-md:size-11"` のようなバリアント付きユーティリティでも広げられる（実測で 44x44px）。`min-*` は `width`/`height` より常に強く、バリアント付きは base より後に出力されるため、クラスの並び順に依存しない

  **`SettingRow`（#73・新規）**: 「ラベル（+ 説明）+ 末尾のコントロール」からなる設定行。

  ```tsx
  <SettingRow
    label="効果音"
    description="チャットの受信やリアクションで音を鳴らす"
    trailing={<Toggle checked={sound} onChange={toggle} label="効果音" />}
  />
  ```

  - **既定は非対話**（`<div>`）。`href` → `<a>` / `onClick` → `<button>`（`UserLabel` と同じ流儀）
  - **対話的にしても `trailing` は対話要素の外（兄弟）に置く**ので、`<button>` の中に `<button>` / `<input>` が入る不正な DOM が構造的に起きない。廃止した `ListRow` は `<button>` 固定でこれができず、insession-app #1172 のアカウント設定 14 行が**1 行も載せられなかった**
  - `descriptionLines` で説明文を 1 行省略 / 2〜3 行クランプ / 折り返し（既定）から選べる（旧 `ListRow` は `truncate` 固定だった）
  - `icon` / `chevron` / `danger` / `disabled` / `ariaLabel` も持つ

  **`LogoMark` / `BrandImage`（#74）**: ワードマークの `"LOOPHUB"` ハードコードをやめ、`wordmark`（`ReactNode`。**既定は従来どおり `'LOOPHUB'`**）と `mark`（マーク自体の差し替え）を追加した。あわせてライト/ダークで画像を出し分けるだけの `BrandImage` を追加した。

  ```tsx
  <LogoMark size={24} showWordmark wordmark="INSESSION" />
  <BrandImage src={logoDark} lightSrc={logoLight} alt="InSession" height={28} />
  ```

  - DS は 2 プロダクト（InSession / loophub）で共有するので、新しい呼び出しは `wordmark` を明示する
  - `BrandImage` は `<html data-theme="light">` の判定を DS 側へ引き取る（insession-app では利用箇所 8 つが `[[data-theme=light]_&]:hidden` の任意バリアント文字列を複製していた）。⚠ 表示切り替えなので**両方の画像が読み込まれる**（ロゴのような小さな SVG 前提）

- 75b9fc5: 汎用の `Skeleton` と、`MessageItem`(#83)向けの `MessageItemSkeleton` を追加する(#87)。投稿一覧のような取得に時間がかかるリストで、読み込み中に「これから出る形」を見せてレイアウトシフトを防げるようにする。

  ```tsx
  <Skeleton width={120} height={14} />   // 矩形
  <Skeleton circle size={24} />          // 円(アバターのプレースホルダ)
  <Skeleton.Text lines={2} />            // テキスト複数行(最終行だけ短くする)

  <MessageItemSkeleton />                               // 既定: アバター無し・本文1行・リアクション無し
  <MessageItemSkeleton avatar lines={3} reactions={2} />
  ```

  - `Skeleton` の面には shimmer(淡いハイライトが左 → 右へ流れる)アニメーションが付く。`prefers-reduced-motion: reduce` では静止した面になる
  - 装飾要素なので `aria-hidden="true"`。「読み込み中」であることの読み上げ(`aria-busy` / live region)は呼び出し側の責務
  - `MessageItemSkeleton` は `MessageItem` と同じ VStack/HStack の gap・寸法でヘッダー行/本文/リアクション行を組んでおり、実データに差し替わったときのレイアウトシフトが最小になる。ホバーアクションのプレースホルダは出さない(読み込み中は操作できないため)

  ⚠ shimmer の `@keyframes skeleton-shimmer` は `src/styles/components.css` に追加した。**従来方式(`@source` で `dist` を走査する)の消費側は、`@insession/design-system/components.css` を import していないと shimmer だけが静かに効かない**(面自体は出るのでビルドもエラーも通る)。README の記載どおり、1.4.0 以降は `components.css` の import が必要な点を改めて明記する。

- 521a959: 面プリミティブに `render` を、`elevation` に直交する `tone` / `shadow` 軸を、余白スケールに `xs.5`（6px）を足す

  - **`Surface` / `Paper` / `Card` / `Panel` に `render` プロップ**（Base UI の `useRender`。`SideNav` と同じ流儀）。`<Card render={<button type="button" />} interactive onClick={…}>` で**クリックできるカードを 1 要素で描ける**ようになり、「リセットした `<button>` > `Surface`」の入れ子と、消費側が書いていた打ち消しユーティリティ（`border-none bg-transparent p-0 shadow-none`）が不要になる。`<button>` の中に `<div>` を置く content model 違反も解消する。UA 既定のボタン外観（`appearance` / マージン / `text-align: center`）の打ち消しは **`render` を渡したときだけ** DS 側で当てる（#56）
  - **`Surface` に `tone`（`'default' | 'tint'`）と `shadow`（`'auto' | 'none'`）**。`elevation` の段（1〜4 = Paper / Card / Popover / Modal）は増やさず、面の色だけ・影だけを切る直交軸として足した。消費側が `className="shadow-none"` / `className="bg-tint-5"` と 1 プロパティだけ上書きしていたパターンを props で表現できる。**新しい影の実値・トークンは追加していない**（#57）
  - **`Gap` / `SurfacePadding` に `xs.5`（6px = `gap-1.5` / `p-1.5`）**。`xs`(4px) と `sm`(8px) の間に段が無く `Stack` に載せられなかったレイアウトを吸収する。`2xs` は「`xs` より小さい」と誤読されるため採らない（#57）

  既定値は従来と同一なので、**既存の呼び出しの見た目は変わらない**（追加のみ）。

## 4.1.0

### Minor Changes

- 64b30e4: `SideNav` のリンクから UA 既定の下線を取り除き、打ち消しを `Link` に一元化する。

  - `SideNav.Account` の `href` 付きメニュー項目を DS の `Link` で描くようにした。DS は preflight を配らないため、素の `<a>` では下線が残っていた（`Menu` の行クラスは `no-underline` を持たない）
  - `SideNav.Brand` の下線打ち消しも `linkClass` 由来にした
  - `Link` に **`bare` variant** を追加した（`no-underline cursor-pointer`。色を出さない）。`wrapper` の `text-inherit` は、自前の色クラスを持つ要素（`Menu.Item` の tone など）へ重ねると特異度が同じで配布 CSS の出力順しだいに色を潰す（実測で `danger` の警告色が消えた）。色を持つ要素へ下線打ち消しだけを足すときは `bare` を使う
  - `Link` の `children` を任意にした。Base UI の `render` に渡す器として使う場合（`<Menu.Item render={<Link variant="bare" href="…" />}>`）、children は Base UI 側が注入するため

- 2986b48: `SideNav.Account` を追加する。左レール最下部に常設するログインユーザーのエリアで、行（アバター + 名前 + 補助テキスト + 上下シェブロン）と、押したときに開くアカウントメニューをセットで持つ。

  ```tsx
  <SideNav.Account
    name="Cameron Yang"
    subtitle="cam@untitledui.com"
    status="live"
    menuLabel="アカウントメニュー"
    items={[
      { key: 'profile', icon: 'account_circle', label: 'マイプロフィール' },
      { key: 'signout', icon: 'logout', label: 'サインアウト', separatorBefore: true, danger: true },
    ]}
    onSelect={(key) => …}
  />
  ```

  - メニューは既存の `Menu`（Base UI）で組むため、矢印キー移動・typeahead・フォーカストラップがそのまま効く。レール最下部にあるので**上方向**へ開き、幅はトリガー行に揃う
  - 項目は `items` 配列。`separatorBefore` で区切り線、`danger` で警告色、`disabled` で操作不可
  - `items` を渡さなければ行だけを描く（表示専用）。込み入ったメニューが要るときは `Menu` を直接組む
  - 行の中身は既存の `UserLabel` に委譲するのでアバター寸法と文字サイズが常に連動する。既定 `size='sm'` はレール既定幅 232px で名前が省略されずに収まる段
  - 開閉アフォーダンス用に `unfold_more` アイコンを追加した

- cd2d92d: `MessageItem` を追加する。「誰かの投稿 1 件」を表す複合コンポーネントで、InSession の space 内チャット発言にも loophub のスレッド投稿/コメントにも使える汎用部品として作った。

  ```tsx
  <MessageItem
    authorName="川村静哉"
    authorHref="/u/kawamura"
    timestamp="01:03"
    reactions={[
      { emoji: "🙂", count: 1, reacted: true, label: "にっこり", onClick },
    ]}
    actions={[
      { icon: "push_pin", label: "ピン留め", onClick },
      { icon: "reply", label: "返信", onClick },
      { icon: "add_reaction", label: "リアクション", onClick },
    ]}
  >
    本文
  </MessageItem>
  ```

  - ヘッダー行の表示名は既存の `UserLabel` に委譲する(押せる/押せない分岐も `UserLabel` 任せ)
  - `avatarSrc` を渡すとアバター付き、省略するとアバター無しのコンパクト表示になる
  - `actions` はホバー/キーボードフォーカス時のみ表示される(`group-focus-within` を併記しキーボード操作でも到達できる)
  - `reactions` のピルは既存の `Chip`(`selected`)を使い、`reacted: true` のものを視覚的に強調する(面と枠だけで示し、check は出さない)

  これに合わせて `Chip` に `showCheck?: boolean`(既定 `true`)を追加した。`false` にすると `selected` の色(accent tint + accent 枠)だけを使い、行頭の check を出さない。行頭に絵文字が来るリアクションピルで、チェックと絵文字が並んで意味が読めなくなるのを避けるため。既定は据え置きなのでフィルター/選択トークンとしての既存の見た目は変わらない。

  また `UserLabel` に `hideAvatar?: boolean`(既定 `false`)を追加した。true のときアバターの `div` ごと描画しない。既存呼び出し側の見た目・挙動は変わらない(省略時の既定はアバター表示のまま)。

- 51c4ae7: `SideNav.Account` のメニュー項目を `href`（リンク）にも対応させる。

  ```tsx
  items={[
    { key: 'profile', icon: 'account_circle', label: 'マイプロフィール', href: '/users/me' },
    { key: 'help',    icon: 'help',           label: 'ヘルプ', href: 'https://…', external: true },
    { key: 'signout', icon: 'logout',         label: 'サインアウト', danger: true }, // href 無し＝操作
  ]}
  ```

  - `href` を渡した項目は `<a href>` として描かれる（`role="menuitem"` は保たれる）。操作（`onSelect` だけ）だと中クリック / Cmd+クリックでの別タブ・リンクのコピーができず、読み上げも「リンク」にならないため
  - `external` で別タブ（`target="_blank"` + `rel="noopener noreferrer"`）になり、行末に `open_in_new` が出る（`SideNav.Item` の `external` と同じ扱い）
  - `href` 付きの項目でも `onSelect(key)` は従来どおり呼ばれる（計測や後処理のフック）
  - `disabled` の項目は `href` があっても `<a>` にしない（HTML の `<a>` に `disabled` は無く、遷移が止まらないため）

- 691affd: `SideNav`（左レール）を追加する。insession-app（web / help）と loophub-app が別々に持っていた同型の縦ナビを、アプリ非依存のプリミティブとして DS へ集約する。

  Base UI 準拠の compound parts（`SideNav.Root` / `.Brand` / `.Group` / `.Item`）で、要素の実体は `render` プロップで差し替えられる（`<SideNav.Item render={<NavLink to="/" />} />`）。`href` を渡せば `<a>`、渡さなければ `<button type="button">` として描画される。

  - active は DS が導出せず呼び出し側が `active` で渡す（ルーターを DS に持ち込まない）。`aria-current="page"` と `data-active` が付く
  - `Group` の `secondary` で最下部寄せ + 上区切り線 + 弱色になり、配下の `Item` へ Context 越しに伝わる（`data-secondary`）
  - `Item` は `icon` / `trailing`（バッジ等）/ `external`（別タブ + `open_in_new`）を持つ
  - `Root` は `aria-label` 必須の `<nav>`。`fullHeight`（既定 true）で `h-dvh` / `h-full` を切り替える

## 4.0.0

### Major Changes

- 7d5f946: **破壊的変更: `ListRow` を廃止し、人の行は `UserLabel` へ集約した。**

  `UserLabel` が `href` / `onClick` を受け取れるようになった。`href` を渡すと `<a>`、`onClick` を
  渡すと `<button>`、どちらも無ければ従来どおり `<div>` を描く。あわせて `target` / `rel` /
  `disabled` / `ariaLabel` を追加した。操作可能なときに必要な打ち消し（`bg-transparent` /
  `border-none` / `p-0` / `text-left` / `no-underline`）と、`cursor` ・ hover の面 ・
  focus リング ・ disabled 表現は DS 側が持つので、消費側はユーティリティの列を書かなくてよい。

  `ListRow` は次の理由で廃止した。

  - **人の行に使うと `UserLabel` の保証が効かない。** `ListRow` は `icon` と `label` を別々に
    受けるため、アバター寸法と文字サイズを呼び出し側が個別に指定することになり、`UserLabel` が
    防いでいる「アバターだけ大きい / 文字だけ大きい」ずれが再び起きる
  - **`UserLabel` を入れられない。** `ListRow` は `label` を `<span className="truncate">` で包む
    実装で、ルートが `<div>` の `UserLabel` を渡すと `<span><div>` という不正なネストになり、
    `truncate` も効かなくなる
  - **汎用の行部品としては窮屈だった。** `icon` / `label` / `description` / `trailing` /
    `chevron` という固定スロットに収まらない行（時刻を先頭に置く履歴行など）が実際にあり、
    スロットを増やし続けるか手組みに戻るかの二択になっていた

  移行方法:

  ```tsx
  // 人の行（プロフィールへ遷移する / モーダルを開く）
  - <ListRow icon={<Avatar name={name} src={src} size={40} />} label={name} onClick={open} />
  + <UserLabel name={name} src={src} onClick={open} />

  // 人以外の行（設定行など）は素の <button> + HStack/VStack で組む
  - <ListRow icon={<Icon name="extension" size={24} />} label={name} description={hint} chevron />
  + <button type="button" className="…" onClick={…}>
  +   <HStack gap="md" align="center">…</HStack>
  + </button>
  ```

  `ListRow` の利用は insession-app の 3 箇所のみで loophub は未使用のため、影響範囲は限定的。

### Patch Changes

- c4fa945: Storybook のカテゴリ体系を役割ベースに再編（`Components/` を廃止し、Foundations / Layout / Surfaces / Actions / Inputs / Data Display / Feedback / Overlays / Navigation / Page / Patterns に分類）。カタログ表示のみの変更で、公開 API に影響はない。

## 3.4.0

### Minor Changes

- 46cd457: `Accordion` / `AccordionItem` を追加。一覧の各行を要約 1 行に圧縮し、開いた 1 件だけが中身を出す折りたたみリスト（単一開閉）。スレッド一覧のように件数が増えてもページの縦の長さと DOM のノード数を一定に保ちたい場面で使う。

  - 完全な制御コンポーネント（`value: string | null` / `onChange`）。開閉 state は DS が持たない
  - `AccordionItem` は `leading` / `title` / `summary` / `meta` のスロットを持つ。閉じているとき `summary` は `summaryLines`（既定 2）行でクランプし、開くと全文になる
  - a11y: ヘッダは `<button>`、`aria-expanded` / `aria-controls` / パネルの `role="region"` + `aria-labelledby`。↑ ↓ / Home / End で item 間をフォーカス移動し、`disabled` な item はスキップする。タップ領域は 44px 以上
  - 開閉は grid-template-rows `0fr → 1fr` でアニメーションし、`prefers-reduced-motion: reduce` では抑制する

- 410e391: UserLabel（アバター + ユーザー名）を追加

## 3.3.0

### Minor Changes

- 8d2af69: `Slider` / `SegmentedControl` / `ToggleGroup`（`ToolButton`）を追加した（#53）

  いずれも消費側（insession-app）が legacy CSS や `<input type="range">` で手組みしていたものを DS に上げたもの。振る舞いは Base UI へ委譲し、DS 側はトークンベースの見た目だけを持つ（#6 / #22 と同じ方針）。

  - **`Slider`** — Base UI の `slider` へ委譲。`label` と `valueLabel`（整形済み文字列を受ける。単位付けは消費側の責務）を持つ。消費側は音量スライダー 3 種と whiteboard のペン太さ・不透明度で計 6 箇所を `<input type="range">` + `::-webkit-slider-thumb` / `::-moz-range-thumb` のブラウザ別記述で手組みしており、track の塗り分けも `linear-gradient` を自前で組み立てていた。
  - **`SegmentedControl`** — Base UI の `radio-group` へ委譲。`items` を渡すだけで組める。**`ToggleGroup` ではなく `RadioGroup` に載せた**理由は README に書いた（セグメンテッドコントロールは常に 1 つが選択されている＝未選択状態が無いので、`aria-pressed` ベースの `ToggleGroup` では全部 off を型でも a11y でも許してしまう）。
  - **`ToggleGroup` / `ToolButton`** — Base UI の `toggle-group` / `toggle` へ委譲。ツールバーの排他選択。`multiple` で複数選択にもできる。消費側は whiteboard（`whiteboard-chip`）と伝言ゲーム（`canvas-relay-draw-tool`）で**同じ構造の legacy CSS を 2 セット**持っていた。

  ⚠ `Slider` の Indicator には position 系のクラスを置いていない。Base UI が Indicator へ `position: relative` を**inline style で**当てるため `absolute` を書いても無効になる（実測で確認）。効かないクラスを残すと「絶対配置で組んである」という誤読を招くため置かない。

- a66ae80: `UploadTile` / `ColorSwatchGroup` / `ColorInput` / `ListRow` / `AppleIcon` を追加した（#53）

  `Slider` / `SegmentedControl` / `ToggleGroup` に続く後半 4 種。いずれも消費側（insession-app）が legacy CSS や打ち消しユーティリティで手組みしていたものを DS に上げたもの。

  - **`UploadTile`** — 破線タイル + 隠しファイル入力。消費側はこの構造を**8 箇所で手組み**しており（コミュニティのスタンプ追加 ×2 / カバー画像 / スタンプピッカー ×2 / 個人設定 ×3）、`min-h-35` と `min-h-[172px]` のように寸法だけが揺れていた。ドラッグ&ドロップにも対応する（`dragenter` / `dragleave` は子要素を跨ぐたびに発火するので深さを数える。数えないと子の上を通過した瞬間に枠がちらつく）。⚠ `<button>` の中に `<input>` を入れずに **`<label>` を面にした** — インタラクティブ要素の入れ子は HTML 仕様違反でクリックが二重発火する。label なら `input.click()` の呼び出しすら不要になる。
  - **`ColorSwatchGroup` / `ColorInput`** — パレット選択（Base UI の `radio-group` 委譲）と任意色選択。消費側は `whiteboard-color-input` と `canvas-relay-draw-swatch` という**同じ構造の legacy CSS を 2 セット**持っていた。⚠ `<input type="color">` はブラウザ既定の枠・余白をベンダー別疑似要素でしか消せないため、**input を親より一段大きく広げ、親の `overflow-hidden` で既定の枠を切り落とす**実装にした（配布 CSS にベンダー疑似要素のルールを足さずに済む）。
  - **`ListRow`** — 画面内に置くクリックできる行。`MenuPlainItem` とは別部品にした。`MenuPlainItem` は `role="menu"` の中の `role="menuitem"` として振る舞う前提で、**メニュー外に置くとセマンティクスが嘘になる**（メニューでないものを menu として読み上げる）。消費側は同じ形を `bg-transparent border-none shadow-none p-0` のような**打ち消しユーティリティの列**で毎回書いていた（打ち消しが必要なのは legacy の素の `button {}` が塗りと padding を与えているため）。
  - **`AppleIcon`** — `GoogleIcon` と対になる部品。DS に Google だけがあり Apple が無かったため、消費側が `user-signin-apple-btn` として手組みしていた。⚠ 色は `currentColor` に従わせる（Apple の HIG が「黒地には白、白地には黒」を要求するため。GoogleIcon がブランド多色で固定なのとは事情が違う）。

  なお `pnpm check:styles`（DOM に出るクラスに対応する CSS があるかの検査）が `AppleIcon` の `.apple-icon` を「対応ルール無し」で捕まえた。`GoogleIcon` の `.google-icon` は中身が `flex-shrink: 0` の 1 行だけなので、`AppleIcon` は部品 CSS を増やさず `shrink-0` ユーティリティで書いた。

## 3.2.0

### Minor Changes

- 3af9806: フィードの 1 件分を組み立てる複合コンポーネント `FeedItem` / `FeedItemAttachment` を追加した。

  プリミティブ（`src/components/`）と区別するため、複合コンポーネントの置き場所として `src/ui-kit/` を新設した。Storybook のカテゴリは `UI Kit/`。

  `FeedItem` は見た目だけを持ち、文言の解決（i18n）・データ更新・画面遷移は呼び出し側の責務にしている。`timeLabel` / `message` は整形済みの文字列を受け取り、アバター・サムネイル・アクションはスロットで差す。

### Patch Changes

- 65a2dab: `PageHeader` の `title` に ReactNode を渡せなかったのを修正した。`PageHeaderProps` が `Omit<ComponentProps<'div'>, 'className'>` を広げていたため、HTML の `title` 属性(`string`)と `title: ReactNode` が交差して `ReactNode & string` に潰れ、要素を渡すと型エラーになっていた（アイコンやブランドドット付きの見出しが書けない）。`title` も Omit するようにした。

  他のプリミティブの props（`gap` / `align` / `padding` / `elevation` / `size` / `wrap` など）は `div` の HTMLAttributes に同名が無く衝突しないことを型レベルで確認済み。

## 3.1.0

### Minor Changes

- c85149c: BottomSheet に `defaultSnapPoint` を追加する

  開いた直後の高さを `'mid'`(既定・従来どおり) / `'full'` から選べるようにした。

  Popup の高さは常にフル(94dvh)で、snapPoint までの差分は `translateY()` で押し下げて表現している。
  そのため `'mid'` では **Popup の下端 26dvh 分がビューポートの外に出る**。中身が「上から順に読む
  リスト」なら問題にならないが、**下端に固定された入力欄や送信ボタンは画面外に落ちて、ユーザーが
  一度シートを上へスワイプするまで触れない**。insession-app のモバイルチャットで実際にこれを踏んで
  いた（ビューポート 844px に対し入力欄が 955..1063px = 完全に画面外。`'full'` なら 736..844px）。

  スナップ先自体は `'mid'` / `'full'` の 2 点で従来と変わらず、既定値も `'mid'` なので既存の
  消費側の挙動は変わらない。

- f1a14b6: 画面骨格プリミティブ(`AppBar` / `Toolbar` / `PageHeader` / `PageLayout` / `Footer`)を追加した。既存のレイアウト(`Stack` 系)/ Surface プリミティブを組み合わせて作っており、新しい並び・面のロジックは持たない。あわせて README に新プリミティブ一覧・elevation スケールの対応表・Tailwind 直書きからの移行ガイドを追記した。
- f1a14b6: 面プリミティブ(`Surface` / `Paper` / `Card` / `Panel`)と、`theme.css` に elevation スケール(`--shadow-elevation-0`〜`4`。既存の `--shadow-soft` / `-popover` / `-overlay` を参照する別名トークンで、新しい影の実値は追加していない)を追加した。`elevation` プロパティ 1 つで背景/境界/影の 3 点セットが決まり、既存の Card(2) / Popover・Menu(3) / Modal(4) と同じ組に対応する。
- f1a14b6: レイアウトプリミティブ（`Stack` / `VStack` / `HStack` / `Grid` / `Spacer` / `Divider` / `Center` / `Container`）を追加した。`gap`（Stack / Grid）と `columns`（Grid）はブレークポイント別に指定できるレスポンシブ値（`Responsive<T>`）を受け付ける。

## 3.0.1

### Patch Changes

- 83fdff4: 内部のディレクトリ構成を整理し、出荷物のソースを `src/` 配下（`components/` / `icons/` / `styles/`）へ集約した。

  公開 API と `exports` のキー（`.` / `./styles.css` / `./theme.css` / `./base.css` / `./components.css`）は変更していないため、**消費側の import は一切変わらない**。移行前後で `dist/index.js` の生成コードはバイト単位で同一、`dist/styles.css` も 59,310 バイト・クラス 524 種・`@keyframes` 7 種で完全一致していることを確認済み。

## 3.0.0

### Major Changes

- 37c20fe: フォーム系プリミティブ（Checkbox / Radio / Toggle / Input / Textarea）を Base UI へ移行した（#22）

  `@base-ui/react` の `checkbox` / `radio` + `radio-group` / `switch` / `field` へ振る舞いを委譲し、DS 側はトークンベースの見た目だけを持つ構造にした（#6 で Popover / Menu / Modal / ConfirmModal / Tabs に対して行ったのと同じ方針）。**見た目は移行前と同じ**（算出スタイルを実測して確認済み）。

  ## 破壊的変更

  ### `Checkbox` — `onChange` → `onCheckedChange`

  Base UI の Checkbox は `<button role="checkbox">`（実体は `<span>`）を描画し、フォーム連携用の `<input>` を内部に隠し持つ。DS から `React.ChangeEvent` を組み立てて渡すことはできないため、状態通知を `onCheckedChange(checked)` に変えた。

  ```tsx
  <Checkbox checked={v} onChange={(e) => set(e.target.checked)} />   // 2.x
  <Checkbox checked={v} onCheckedChange={(c) => set(c)} />           // 3.0
  ```

  `label` / `disabled` / `name` / `id` / `className` はそのまま。`defaultChecked` / `readOnly` / `required` が使えるようになった。

  ### `Radio` — 単体コンポーネント → `Radio.Group` + `Radio.Item`

  Base UI の Radio は選択状態を親の RadioGroup（`value` / `onValueChange`）から解決する設計で、個々の Radio が `checked` を受け取る形にはできない。矢印キーでのグループ内移動と roving tabIndex（グループ全体で tab stop が 1 つだけ）は、この構造が前提。

  ```tsx
  // 2.x
  {
    opts.map((o) => (
      <Radio
        key={o.key}
        name="visibility"
        checked={val === o.key}
        onChange={() => setVal(o.key)}
        label={o.label}
      />
    ));
  }

  // 3.0
  <Radio.Group
    name="visibility"
    value={val}
    onValueChange={setVal}
    aria-label="公開範囲"
  >
    {opts.map((o) => (
      <Radio.Item key={o.key} value={o.key} label={o.label} />
    ))}
  </Radio.Group>;
  ```

  `Radio.Group` は既定で縦積み（`flex flex-col gap-2.5`）。横並びにしたいときは `className` で上書きする。

  ## 非破壊の変更

  - **`Toggle`** — props（`checked` / `onChange`（引数なしトグル）/ `label` / `disabled`）は移行前と完全に同じ。内部が Base UI の Switch になり、隠しネイティブ input による form 連携（`name` / `value` / `form`）と `readOnly` が使えるようになった
  - **`Input` / `Textarea`** — props シグネチャは移行前と同じ。内部で `useId` + `htmlFor` の手組みをやめ、Field.Label / Field.Control の自動紐付けに委譲した。`Input` から見た目の定数（`FIELD_LABEL` / `FIELD_BOX_BASE` / `FIELD_CONTROL`）と状態関数（`fieldLabelColor` / `fieldBoxState`）を export し、Textarea と共有するようにした（移行前は同じ文字列を二重に持っていた）

  ## a11y の改善（実測で確認）

  - **エラーが入力欄に紐付くようになった。** `error` を渡すと `aria-invalid="true"` + `aria-describedby` がエラー要素に張られる（移行前は素の `<span>` で、支援技術からエラーが入力欄に紐付いていなかった）
  - **Radio に roving tabIndex が付いた。** グループ内の tab stop が 1 つだけになり、矢印キーで選択を移動できる（移行前は全ての Radio が tab stop で、矢印キーは効かなかった）
  - Checkbox / Radio のラベルクリックが Field.Label 経由になった（`<button>` は HTML 仕様上 labelable element ではないため `<label htmlFor>` が使えない）。**二重トグルが起きないことを実測で確認済み**

  ## 移行時の落とし穴（消費側が同種の実装をするとき用）

  **`disabled:` は効かない。`data-disabled:` を使うこと。** Base UI の Checkbox / Radio / Switch が描画するのは `<span>` で（`nativeButton` の既定が false）、CSS の `:disabled` 疑似クラスはフォーム要素にしか適用されない。この移行でも一度踏んでおり、型検査もビルドも通ったまま disabled が視覚的に無効化されない状態になった（実測で `opacity: 1` / `cursor: pointer` のままだった）。

  **状態別のクラスは `data-checked:` バリアントではなく `className` の関数形（`(state) => string`）で排他的に出している。** 同一プロパティ（`background-color` / `border-color`）のユーティリティを 1 つのクラス属性に同時に並べると、勝敗が配布 CSS の出力順で決まってしまうため（#21 / #17 と同じ構図）。

  **`cursor` は `<label>` に継承されない。** ラベルテキスト上だけカーソルが変わらない状態になるため、`cursor-[inherit]` を明示して行に追従させている。なお Tailwind に `cursor-inherit` ユーティリティは無く、子孫セレクタ記法（`[&_label]:cursor-pointer`）は**ソース走査で拾われず配布 CSS に生成されなかった**（`check:styles` は素のクラス名しか見ないのでこの欠損を検出できない）。

  **disabled が親から降ってくる経路がある。** `<Radio.Group disabled>` では各 `Radio.Item` の `disabled` prop は `undefined` のままなので、それだけを見ると円だけ無効化されてラベル側が通常表示で残る。`has-[>[data-disabled]]`（**直接の子**に限定）で拾っている。子孫全体（`has-[[data-disabled]]`）にすると、ラベル内に `data-disabled` を持つ装飾ノードがあるだけで誤判定する。

  ## その他

  - `Toggle` の `checked` にデフォルト値を持たせていない。常に `checked` を渡すと `Switch.Root` が必ず controlled 扱いになり、`defaultChecked` が無視される（`<Toggle defaultChecked />` が初期 ON にならない）
  - Storybook に回帰ネットを追加した: `Controls > Switches`（Toggle は story が無く見た目の回帰を検出できなかった）/ `Controls > RadioGroupDisabled`（親から降る disabled）/ `Controls > Uncontrolled`（`defaultChecked` / `defaultValue`）
  - `Checkbox` の `indeterminate` は対応しない（移行前も持っておらず、DS に中間状態のアイコンが無いため）

- 9849eff: オーバーレイ系プリミティブ（BottomSheet / Toast）を Base UI へ移行した（#23）

  これで DS のプリミティブは**すべて Base UI ベース**になった（#6 でオーバーレイ、#22 でフォーム系、本 PR で残り）。

  ## `BottomSheet` — Base UI の Drawer へ（**props は非破壊**）

  `open` / `onClose` / `ariaLabel` / `closeLabel` / `closeOnEsc` は移行前と同じ。内部で捨てたものが大きい。

  - **Pointer Events による自前のドラッグ実装（約 60 行）** — `setPointerCapture` / `pointermove` / スナップ計算を全部やめ、Drawer の `snapPoints={[0.68, 0.94]}` に置き換えた（`MID_RATIO` / `FULL_RATIO` の値はそのまま）
  - `window` への `keydown` リスナーによる Esc close → Drawer 標準
  - backdrop クリック + 中身側の `stopPropagation` → `Drawer.Backdrop` 標準
  - `if (!open) return null` の手動アンマウント → `Drawer.Portal`

  併せて、移行前に無かった**フォーカストラップ・スクロールロック・閉じた後のフォーカス復帰**が付いた。

  高さの扱いが変わっている（見た目の結果は同じ）。移行前は `mode('mid'|'full')` を state で持って `.bottom-sheet--mid`(68dvh) / `--full`(94dvh) を切り替えていたが、**高さは常にフル（94dvh）にして「どこまでせり出すか」を transform で表現する**方式にした。`.bottom-sheet--mid` は使わなくなったので削除した。

  > ⚠ **Base UI の Drawer は位置を自分で当てず、CSS 変数として出すだけ。** `components.css` の `.bottom-sheet` に `transform: translateY(calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px)))` を足して反映している。これを書かないと**シートが常にフルハイトで表示される**（型検査もビルドも通る）。

  `SplitModal` は BottomSheet / Modal の API が変わっていないため**変更不要**（768px 以下のドリルダウン維持を実測で確認）。

  ## `Toast` — Base UI の Toast へ（**破壊的変更**）

  **`<Toast title=… />` を自分で置く使い方は廃止した。** Base UI の Toast は「Provider が持つキューに add して Viewport が描画する」命令的 API で、`ToastRoot` は `toast` オブジェクトと ToastProviderContext を要求するため、見た目部品として単体で置くことはできない。

  ```tsx
  // 2.x — 表示制御は消費側が useState で持っていた
  {
    show && (
      <Toast
        tone="success"
        title="保存しました"
        onClose={() => setShow(false)}
      />
    );
  }

  // 3.0 — アプリのルートに Provider + Viewport を1度だけ置く
  <Toast.Provider>
    <App />
    <Toast.Viewport />
  </Toast.Provider>;

  // 呼び出し側
  const toast = Toast.useToast();
  toast.add({
    title: "保存しました",
    description: "…",
    data: { tone: "success" },
  });
  ```

  `tone` / `variant` / `icon` は `data` に載せる（`ToastData` 型）。`variant='snackbar'` の legacy 互換パレットは維持し、**ピクセル同一を実測で確認済み**（pill / `radius 999px` / `bg rgba(16,22,25,.94)`）。

  得られたもの: **キュー管理・`timeout` による自動 dismiss・スワイプで閉じる・複数トーストの重ね表示・aria-live リージョンへの通知**。移行前は `role="status"` を要素に直接置いていただけで、後から出たトーストが読み上げられる保証が無かった。

  > ⚠ DS は本来「アプリ依存を持たない純粋 leaf UI」の方針だが、**Toast だけは Provider を持つ**（＝消費側のアプリ構造に踏み込む）。キュー管理を伴う通知はアプリ全体で 1 つの出口を共有する必要があり、部品単体では成立しないため。方針からの意図的な逸脱。

  ## 移行時の落とし穴

  **`useToastManager` はトップレベルからは型としてしか export されていない**（`@base-ui/react/toast` の `index.d.ts` が `export type * from "./useToastManager.js"`）。値として使うには名前空間経由（`Toast.useToastManager`）で参照する。

  ## カタログ（Storybook）についての注意

  `Components/Toast` のカタログ上では **DS トーストの左 3px tone ボーダーが 1px の既定ボーダー色で表示される**。`.storybook/preview.css` が `dist/styles.css` を読んだ**後に** stories 用のユーティリティを追加生成する構成のため、stories が使っている `.border`（`border-width: 1px`）が `.border-l-[3px]` より後に出力されて勝つのが原因。**配布 CSS だけを読む消費側では正しく 3px / tone 色が出る**ことを実測で確認済み（この現象は移行前の Toast も同じクラス構成だったため、本 PR による回帰ではない）。

- bedd05c: 残りのプリミティブを Base UI へ移行し、`useDismiss` を削除した（#33）

  棚卸ししたところ、振る舞いを持つプリミティブがまだ残っていた。ここで片付けて **DS のプリミティブはすべて Base UI ベース**になった（#6 オーバーレイ → #22 フォーム系 → #23 BottomSheet / Toast → 本 PR）。

  ## 破壊的変更

  ### `useDismiss` を削除した

  `Popover` を Base UI 化（#6）した時点で役目を終えており、**DS 内の利用はゼロ**だった（`index.ts` から export だけが残っていた）。消費側がまだ import している場合は、`Popover.Root` の `closeOnEsc` / `closeOnOutside`、または Base UI の `useDismiss` 相当へ置き換えること。

  ### `Stepper` は値が `<input>` になった

  表示専用の `<span>` から `NumberField.Input` に変わり、**値を直接編集できる**ようになった。`value` / `min` / `max` / `step` / `onChange` / `disabled` / `decLabel` / `incLabel` はそのまま。`valueLabel`（入力欄の aria-label）を追加した — 編集可能になったので、何の数値なのかを支援技術へ伝えるために渡すことを推奨する。

  ## 得られたもの

  |                         | 移行先                         | 効果                                                                                                                                                                                                               |
  | ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `Stepper`               | `number-field`                 | **矢印キー（↑↓）で増減できる**（PageUp/Down は largeStep）。値の直接入力。min/max による端の disabled 判定と clamp が自動に（移行前は `disabled={disabled \|\| value <= min}` と `Math.min/max` を手書きしていた） |
  | `Avatar`                | `avatar`                       | **壊れた `src` で fallback 円に切り替わる**。移行前は無条件で `<img>` を描いていたため、URL が壊れていても画像が割れたまま残った                                                                                   |
  | `SearchField`           | `field` + `input`              | **#22 の取りこぼしだった。** label と control が自動で紐付く。Input と見た目の定数を共有し、二重管理を解消                                                                                                         |
  | `Button` / `IconButton` | `button`                       | `focusableWhenDisabled` が使えるようになった（**disabled なボタンはキーボードナビから消える**問題への対処）。`render` prop で `<a>` 等に差し替えも可能                                                             |
  | `RingTimer`             | `progress`                     | `role="progressbar"` + `aria-valuenow/min/max` + `aria-valuetext` が付いた。描画は従来どおり conic-gradient                                                                                                        |
  | `StepFlow`              | （Base UI ではなくネイティブ） | `<ol>`/`<li>` + `aria-current="step"`。下記参照                                                                                                                                                                    |

  ## `StepFlow` は Progress に載せなかった

  当初 `progress` へ載せる想定だったが、**`role="progressbar"` は不適切**と判断して見送った。progressbar は「40% 完了」のような単一の数値を伝えるロールで、**要素の中身が読み上げ対象から外れる**。StepFlow が伝えたいのは「どのステップに居るか」という**ラベル付きの位置**なので、数値に潰すと情報が減る。

  代わりにネイティブの正しいセマンティクス（順序付きリスト + `aria-current="step"`）を与えた。移行前は素の `<div>` の入れ子で、順序も現在位置も伝わっていなかった。見た目は変わらない（`list-none` / `m-0` / `p-0` でマーカーと既定余白を消している。実測で確認済み）。

  ## `Avatar` は DS 経路だけ移行した

  **legacy 経路（`status` / `ring` を使わない呼び出し）は据え置き。** 「素の img/span を返す」後方互換に消費側の `.avatar` / `.auth-avatar` が依存しており、`Avatar.Root` でラップすると DOM が 1 階層増えて既存の CSS セレクタが外れるため。同じ理由で、legacy 経路には fallback 切り替えも入らない（後方互換とのトレードオフ）。

  なお DS 経路では、画像の有無に関わらず Root に背景色を置くようにした（移行前は `src` があるとき `bg-transparent`）。読み込み失敗時に fallback の文字が地なしで出てしまうため。**透過 PNG のときだけ移行前と差が出る**が、fallback が成立する方を優先した。

  ## 移行時の落とし穴

  **`focusableWhenDisabled` を使うと `disabled` 属性が `aria-disabled` に置き換わる**（`utils/useFocusableWhenDisabled.js`）。そのとき CSS の `:disabled` / `:enabled` 疑似クラスはマッチしなくなり、**disabled が視覚的に無効化されないうえ hover まで効いてしまう**。`Button` / `IconButton` / `Stepper` のボタンは `disabled:` / `enabled:hover:` をやめ、**`data-disabled:` / `hover:not-data-disabled:`** に統一した（Base UI Button は state の disabled を常に `data-disabled` として出すので、これで両方の経路を 1 つの書き方で拾える）。

  **`FIELD_BOX_BASE` から縦 padding を外した。** Input / Textarea は `py-3`、SearchField は `py-2.5` と一段浅いが、共通側に `py-3` を持たせると呼び出し側の `py-2.5` では打ち消せない（同一プロパティのユーティリティは配布 CSS の出力順で決まる。#21 と同じ構図で、実測でも `py-3` が勝って padding が 12px になっていた）。**縦 padding は各コンポーネントが必ず自分で指定する**契約にした。

  **`check-styles.mjs` はコメント内のクラス属性も実クラス名として拾う。** ソースを正規表現で走査するため、コメントに例を書くと存在しないクラスで検査が落ちる（実際に踏んだ）。

  ## 別途対応が必要な発見（#35 に切り出した）

  **`border-[1.5px]` が配布 CSS に生成されていない。** `Input` / `Textarea` / `SearchField` の field 枠は 1.5px のつもりだが、実測では **1px** で描かれている（`dist/styles.css` に `.border-\[1\.5px\]` が 0 件）。**移行前から同じ**なので本 PR による回帰ではないが、DS 全体で意図した枠幅が出ていない。直すと見た目が変わる（1px → 1.5px）ため、意図的な変更として別途判断する。`check:styles` は任意値クラスを検査対象にしていないので、この種の欠損を今後も拾えない点も #35 に含めた。

## 2.1.0

### Minor Changes

- 18abd6b: `Popover.Popup` / `Menu.Popup` に `padding` / `scroll` props を足した（#21）

  2.0.0 で `panelPadding` / `panelScroll` の専用 props を廃止し「外したい呼び出し側は `className` で `p-0` / `max-h-none overflow-visible` を渡して打ち消す」契約にしたが、**この打ち消しは効かなかった。**

  **クラス属性の並び順は CSS の勝敗に無関係で、同一プロパティのユーティリティは配布 CSS の出力順で決まる。** 実測（insession-app の本番ビルド CSS / Tailwind 4.3.2）:

  | クラス              | 出力位置   | 勝敗                 |
  | ------------------- | ---------- | -------------------- |
  | `.p-0`              | idx 163644 | 負ける               |
  | `.p-3`              | idx 163880 | **これが適用される** |
  | `.overflow-visible` | idx 154257 | 負ける               |
  | `.overflow-y-auto`  | idx 154325 | **これが適用される** |
  | `.max-h-none`       | idx 147707 | たまたま勝つ         |

  つまり `max-height` だけ偶然効いて padding と overflow は効かない、という一貫性のない状態だった。実害として消費側（insession-app の通知センター / MiniProfile）に **v1 に無かった 12px の padding と内部スクロール**が付いていた。

  **「打ち消す」のをやめ、そもそも出さない方式へ戻した。** v1 が `panelPadding` / `panelScroll` という props を持っていたのは正しかった。

  ```tsx
  <Popover.Popup
    padding={false}
    scroll={false}
    className="flex max-h-[220px] flex-col overflow-hidden"
  >
    <div className="shrink-0 border-b border-solid border-border px-4 py-3">
      固定ヘッダー
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{items}</div>
  </Popover.Popup>
  ```

  - `padding` / `scroll` はどちらも**既定 true**（v1 の `panelPadding` / `panelScroll` と同じ既定）。**既定の見た目は 2.0 から変わらない**ので、既存の呼び出し側は無変更で動く
  - `POPOVER_POPUP_BASE` から padding とスクロールを外し、`POPOVER_POPUP_PADDING`（`p-3`）と `POPOVER_POPUP_SCROLL`（`max-h-80 overflow-y-auto`）として分離・export した
  - `Popover.Popup` と `Menu.Popup` で組み立てを共有する（`popupBase` / `mergePopupClassName`）
  - **Base UI の `className` は `string | ((state) => string)` の union を受ける**ので、関数形をそのまま文字列連結して関数の実装がクラス名に埋め込まれないよう、形ごとに分けて合成している
  - `README.md` に「`className` では打ち消せない」理由を実測つきで明記し、`padding` / `scroll` の使い方を追記した
  - Storybook に `Popover / Panel Options` story を追加（既定 / `padding={false}` / `padding={false} scroll={false}` を並べて比較できる）

  修正後の実測（Storybook / 算出スタイル）:

  | story                            | padding | max-height            | overflow-y |
  | -------------------------------- | ------- | --------------------- | ---------- |
  | 既定                             | 12px    | 320px                 | auto       |
  | `padding={false}`                | **0px** | 320px                 | auto       |
  | `padding={false} scroll={false}` | **0px** | **220px**（独自指定） | **hidden** |

  これにより消費側は Tailwind v4 の important 接尾辞（`p-0!`）に頼らなくてよくなる（insession-app は現在その回避策を使っている。insession-space/insession-app#1107）。

### Patch Changes

- bc0d4e4: メニューの `active` 行の green tint が表示されていなかったのを直した（#17）

  `Menu.Item` / `RadioItem` / `CheckboxItem` / `PlainItem` に `active` を渡したとき、テキスト色（green）は出るのに**背景の tint（`--color-success` 10%）が出ていなかった**。

  **これは 2.x の回帰ではなく 1.x から続いていた不具合。** #9 の移行作業中に実測で気づいたが、当時は「振る舞いの委譲のみで見た目は変えない」方針だったため changeset に記録だけ残していた。

  ## 原因

  行の基底クラス（`MENU_ROW_BASE`）に `bg-transparent` があり、`active` 分岐の tint と**同じクラス属性に両方が並んでいた**。どちらもクラス 1 つで特異度が同じなので、勝敗は**配布 CSS の出力順**で決まる。

  ```
  color-mix(in srgb,var(--color-success) 10%,transparent)  idx=20987   ← 負ける
  .bg-transparent                                          idx=22906   ← 後勝ち
  ```

  結果、**「静止時は tint なし、hover / キーボードハイライト時だけ tint が出る」**という中途半端な状態になっていた（`hover:` / `data-highlighted:` のバリアント付きルールは出力順が後なので勝つ）。

  ## 直し方

  **`MENU_ROW_BASE` から `bg-transparent` を外し、`toneClassName` / `plainToneClassName` が背景を排他的に出す**形にした（`active` なら tint、それ以外なら `bg-transparent`）。

  `bg-transparent` を単に落とすだけにしないのは、DS が preflight を配っていないため `PlainItem`（`<button>`）に UA 既定の `buttonface` 背景が残るから。排他で出せば両方満たせる。

  ## 修正後の実測（Storybook / 算出スタイル）

  | 行                                       | 描画要素   | 背景                                      |
  | ---------------------------------------- | ---------- | ----------------------------------------- |
  | `active` な `Menu.Item`                  | `<div>`    | **`color(srgb 0.192 0.769 0.494 / 0.1)`** |
  | `active` な `RadioItem` / `CheckboxItem` | `<div>`    | **同上**                                  |
  | `active` な `PlainItem`                  | `<button>` | **同上**                                  |
  | 非 `active` の行                         | 両方       | `rgba(0, 0, 0, 0)`                        |
  | `danger` 行                              | 両方       | 透明・文字色 `rgb(255, 107, 107)` を維持  |

  hover / キーボードハイライト時の 20% tint も引き続き出るので、**静止 10% → ハイライト 20%** で区別が付く状態は保たれている。

## 2.0.1

### Patch Changes

- 60ae323: `Popover` / `Menu` のパネルの `z-index` が無効だったのを直した（#14）

  2.0.0 では `POPOVER_POPUP_BASE`（`Popover.Popup` と `Menu.Popup` が共有）に `z-[var(--z-popover-portal,35)]` を当てていたが、**Base UI では `Popup` が `position: static`** で、位置決めをしているのは親の `Positioner` である。CSS 仕様上 `position: static` の要素に `z-index` は効かないため、**指定が完全に無効だった**。

  実測（loophub-app で 2.0.0 を動かして確認）:

  ```
  DIV  pos=static     z=35     ← Popup。z-index が付いているが static なので無効
  DIV  pos=absolute   z=auto   ← Positioner。位置決めはここ。z-index を持っていなかった
  ```

  パネルの上に **DOM 上で前にある `z-index: 5` の要素**を置くと `elementFromPoint` がその要素を返した = **パネルが覆われた**。

  `z-index` を `Positioner`（positioned な要素）へ移した。修正後は同じ手順でパネルが覆われないことを確認済み（`Positioner` が `pos=absolute z=35`、`Popup` は `z=auto`）。

  - `POPOVER_POPUP_BASE` から `z-index` のユーティリティを外した
  - **`POPOVER_POSITIONER_BASE`** を新設して export し、`Popover.Positioner` と `Menu.Positioner` の既定クラスに当てた。呼び出し側が `className` で上書きできるようマージでは前に置いている
  - フォールバック付きの任意値記法（`z-[var(--z-popover-portal,35)]`）は維持（`theme.css` を import しない consumer で `z-index: auto` に落ちないため。#885 由来）

  `Modal` / `ConfirmModal` は影響を受けない（`Dialog.Viewport` / `AlertDialog.Viewport` という **positioned な要素**に `zIndex` を当てているため元から正しく効いていた）。重なり順が `--z-modal`(100) > `--z-popover-portal`(35) のままであることも確認済み。

  2.0.0 の PR 本文に「非 portal の Popover の z-index を消費側で確認すること」と申し送っていたが、**そもそも値が適用されていなかった**ので、どちらの値でもなかったというのが正確な状態だった。

## 2.0.0

### Major Changes

- 707b60a: Popover / Menu / Modal / ConfirmModal / Tabs の振る舞いを [Base UI](https://base-ui.com)（`@base-ui/react`）へ委譲し、compound API へ移行した（#6）

  **破壊的変更。** これらのコンポーネントは props を渡す単一コンポーネントではなくなり、`Popover.Root` / `Popover.Trigger` / … のパートを組み合わせる形になった。見た目は変えていない（移行前の Storybook と矩形・色を突き合わせて一致を確認済み）。

  ## なぜ

  フローティング系・ダイアログ系の振る舞いをすべて自前で持っていた。`popover.tsx` は 431 行で placement をクラスマップ（`top-[calc(100%+8px)] left-0` 等）で表現し、portal 版は `getBoundingClientRect()` の実測配置を自前で回していた。その結果:

  - **Popover にフリップ・シフト（衝突回避）が無く、ビューポート端で見切れていた**
  - **Modal に focus trap も scroll lock も閉じた後のフォーカス復帰も無かった**
  - **Menu に矢印キーナビ・typeahead が無く、実質マウス専用だった**
  - **Tabs に矢印キーでのタブ移動が無かった**

  WAI-ARIA 準拠の振る舞いはプロダクトの差別化に寄与しない。Base UI（unstyled / headless。styling を一切持たない）へ委譲し、DS は「トークンでの見た目」だけを持つ構造にした。

  ## 得られたもの（実機で計測して確認）

  |                       | 移行前                                 | 移行後                                                                                                                                                                                                                                                                                     |
  | --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | Popover の衝突回避    | 無し                                   | 下端で `data-side` が `bottom`→`top` に反転しビューポート内に収まる。右端では `align=end` ではみ出し 0                                                                                                                                                                                     |
  | Modal の scroll lock  | `body` の overflow は `visible` のまま | 開くと `hidden`                                                                                                                                                                                                                                                                            |
  | Modal の focus trap   | 無し                                   | `body` 直下の兄弟すべてに `data-base-ui-inert` + `aria-hidden`                                                                                                                                                                                                                             |
  | Menu のキーボード操作 | 無し                                   | 矢印キー / Home / End / typeahead（"v"→Version, "d"→Delete …）。tone ごとにハイライトの面色が出る（既定=`surface-hover` / danger=`danger-surface` / active=success 20% tint）。`disabled` 行はハイライト対象に含まれるが面色は出さず、フォーカスリング（`--shadow-focus`）だけで位置を示す |
  | Tabs のキーボード操作 | 無し                                   | 矢印キー / Home / End / 端でラップ / Space・Enter で選択                                                                                                                                                                                                                                   |
  | ConfirmModal の role  | `dialog`                               | `alertdialog`（背景クリックで閉じない = 確認ダイアログとして正しい）                                                                                                                                                                                                                       |

  ## 依存の変更

  **`@base-ui/react@1.6.0` が `dependencies` に入った（バージョン完全固定）。** DS にとって初めての runtime 依存で、`@floating-ui/react-dom` / `@floating-ui/utils` / `use-sync-external-store` / `@babel/runtime` / `@base-ui/utils` を引き連れる。消費側は `pnpm add` するだけでよい（peer にはしていない）。

  `dist/index.js` は 80KB（移行前 61KB）。Base UI 自体はバンドルせず external 参照なので、この増分は DS 自身のコード分。`date-fns` / `@date-fns/tz` は Base UI の peer に載っているが `optional: true`（日付系コンポーネント用）なので install 不要。

  > 旧パッケージ名 `@base-ui-components/react` は `1.0.0-rc.0` で deprecated になり `@base-ui/react` へ改名されている。新しい名前を使うこと。

  ## 移行手順

  ### Popover

  ```tsx
  // 移行前
  <Popover open={open} onClose={close} trigger={<button>開く</button>}
    placement="bottom-end" panelClassName="w-80" panelPadding={false} portal mobileSheet>
    {children}
  </Popover>

  // 移行後
  <Popover.Root open={open} onOpenChange={(o) => !o && close()}>
    <Popover.Trigger>開く</Popover.Trigger>
    <Popover.Portal>                             {/* portal={false} 相当なら Portal を挟まない */}
      <Popover.Positioner side="bottom" align="end" mobileSheet>
        <Popover.Popup className="w-80 p-0">     {/* panelPadding={false} 相当は p-0 で打ち消す */}
          {children}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
  ```

  `placement` の対応: `bottom-start` → `side="bottom" align="start"`（既定）/ `bottom-end` → `side="bottom" align="end"` / `top-start` → `side="top" align="start"` / `top-end` → `side="top" align="end"`。

  専用 props の `panelClassName` / `panelShadow` / `panelPadding` / `panelScroll` は廃止し、`Popover.Popup` の `className` に一本化した。既定は移行前と同じ（padding あり / `max-h-80` スクロールあり / DS の popover 影）で、打ち消したいときだけユーティリティを足す（`p-0` / `max-h-none overflow-visible`）。

  ### Menu — 2 系統ある

  **a) 独立して開閉するメニュー**（キーボードナビ・typeahead が効く）: `Menu.Root` / `Trigger` / `Portal` / `Positioner` / `Popup` / `Item` / `RadioGroup` / `RadioItem` / `CheckboxItem` / `Separator` / `Group` / `GroupLabel` / `SubmenuRoot` / `SubmenuTrigger`。

  **b) Popover のパネルに行だけ載せる**（移行前と同じ、振る舞いを持たない見た目のみ）: `Menu.PlainList` / `Menu.PlainItem`。

  **Base UI の Menu パートは `Menu.Root` の React context を要求するため、`Popover.Popup` の中では使えない**（`MenuRootContext is missing` で throw する）。ヘッダとメニュー行を 1 つのパネルに混在させる通知センターのような UI は (b) を使う。移行前の `Menu` / `MenuItem` はそのまま `Menu.PlainList` / `Menu.PlainItem` に読み替えられる（props も同じ）。

  `role` prop でラジオ/チェックボックスを切り替えていた箇所は、(a) では `Menu.RadioItem` / `Menu.CheckboxItem` というパートに分かれた。`onSelect` は `onClick` になった。

  ### Modal

  ```tsx
  // 移行前
  <Modal onClose={close} title="通知設定" footer={<Button/>} width="min(760px, 94vw)">{children}</Modal>

  // 移行後
  <Modal.Root open={open} onOpenChange={(o) => !o && close()}>
    <Modal.Portal>
      <Modal.Backdrop />
      <Modal.Popup variant="ds" style={{ width: 'min(760px, 94vw)' }}>
        <div className="flex items-center justify-between gap-3 border-b border-solid border-border px-[18px] py-4">
          <Modal.Title>通知設定</Modal.Title>
          <Modal.Close variant="ds" aria-label={t('close')} />
        </div>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer><Button /></Modal.Footer>
      </Modal.Popup>
    </Modal.Portal>
  </Modal.Root>
  ```

  `variant` は `'legacy'`（既定。`.modal` / `.modal-backdrop` / `.modal-close` の従来クラスを使う経路。`.modal h2` / `.modal button[type="submit"]` のグローバル装飾に依存している消費側はこちら）と `'ds'`（トークンのユーティリティで title / body / footer を組む体裁）。移行前の「`title`/`footer` を渡すと DS 構造」という暗黙の切り替えを明示した。

  `width` は `Modal.Popup` の `style` へ。`ariaLabel` は `aria-label` の透過。`closeLabel` は `Modal.Close` の `aria-label`（i18n は props 注入のまま維持）。`as='form'` + `onSubmit` は `render` に一本化した:

  ```tsx
  <Modal.Popup render={<form onSubmit={handleSubmit} />}>…</Modal.Popup>
  ```

  ### ConfirmModal

  外部 props は変わらない（`tone` の見た目も同一）。内部実装が Base UI AlertDialog になり、**背景クリックで閉じなくなった**（確認ダイアログとして正しい挙動）。背景クリックで閉じることに依存していた箇所があれば見直すこと。

  ### Tabs

  ```tsx
  // 移行前
  <Tabs tabs={[{ key: 'queue', label: 'キュー', badge: <CountChip n={3} /> }]}
    value={value} onChange={setValue} variant="fill" trailing={<IconButton/>} />

  // 移行後
  <Tabs.Root value={value} onValueChange={setValue}>
    <Tabs.List variant="fill" trailing={<IconButton />}>
      <Tabs.Tab value="queue">キュー<CountChip n={3} /></Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="queue">…</Tabs.Panel>   {/* 任意。移行前は panel を持たなかった */}
  </Tabs.Root>
  ```

  `TabItem` 型は廃止。`badge` は `Tabs.Tab` の children に直接書く。アクティブ状態は JS 比較ではなく Base UI の `data-active` 属性で表現するようになった（下線アニメーションと `variant` の見た目は移行前と同一）。

  ## 変えていないもの

  - **`useDismiss` は残した。** 消費側が DS の Popover を経由せず自前のドロップダウンに使っており、Document Picture-in-Picture 対応（`ownerDocument.defaultView` からリスナーを張る）という Base UI に無い要件を持つ。
  - `SplitModal` / `BottomSheet` / `ProfileModal` / `Toast` / `Checkbox` / `Radio` / `Toggle` などは移行対象外（`SplitModal` は新しい `Modal` API に追随させただけで見た目・挙動は不変）。

  ## 移行中に見つけた既存バグ（このリリースでは直していない）

  **メニューの `active` 行の green tint（10%）は、v1 でも表示されていなかった。** 行の基底クラスにある `bg-transparent` が配布 CSS 上で tint より後に出力されるため打ち消される（`.bg-transparent` の方が後勝ち）。`origin/main` の実測でも `active` 行の背景は透明だった。

  このリリースは「振る舞いの委譲のみで見た目は変えない」方針なので**意図的に直していない**（直すと v1 に無かった tint が出て見た目が変わる）。ハイライト時（hover / キーボード）の 20% tint は特異度と出力順が勝つため正しく表示される。恒久対応は別 Issue で。

  ## 消費側で確認が必要なこと

  - **PiP（Document Picture-in-Picture）へモーダルを出している箇所**は改修が必要。移行前は `ownerDocument` から描画先を自動検出していたが、Base UI では `Modal.Portal` の `container` prop で明示指定する。
  - **非 portal の Popover の z-index。** 移行前は portal 有無で `--z-dropdown`(30) / `--z-popover-portal`(35) を使い分けていたが、Popup 自身が portal されたかを知れないため常に後者に統一した。30〜35 の間に z-index を持つ要素と重なる箇所がないか確認すること。
  - **`mobileSheet` を内部スクロールコンテナの中のトリガーで使っている箇所。** `mobileSheet` 時は `positionMethod="fixed"` になるため、そのコンテナのスクロールに追従しない。

### Minor Changes

- 15788e4: `Textarea` プリミティブを追加した。

  DS は `Input`（1 行）と `Composer`（チャット送信欄。送信ボタンと添付を内包する専用部品）は持っていたが、**汎用の複数行入力が無かった**。そのため消費側は raw な `<textarea>` を置き、見た目はアプリ側のグローバル CSS（`textarea { … }`）で与えるしかなかった。insession-app にも 4 箇所の raw な textarea が残っており、`apps/web/src/style.css` に 38 行のグローバル定義を抱えていた。

  ラベル（mono caps）・field（surface-2 + 1.5px border + radius md）・状態の優先度（error > focused > default）と色は **`Input` と完全に同一**。フォームで並べたときに揃うことが要件なので、値を変えるときは両方まとめて変えること。

  textarea 固有の差分は 3 点だけ:

  - field を `items-center` ではなく `items-stretch` にする（複数行なので中央寄せは不要）
  - `rows` の既定を **4** にする（HTML 既定の 2 行は狭い）
  - `resize` prop で方向を選べる（既定 `'vertical'`。横に伸ばせると親のレイアウトが崩れるため `'none'` も用意）

  ライト/ダーク両テーマで `Input` と並べた見た目・focus リング・error 表示を実ブラウザで確認済み。

## 1.5.0

### Minor Changes

- 76bc475: ライトテーマを DS に取り込んだ。`<html data-theme="light">` だけでライトになる。

  これまで `theme.css` はダーク単一トーンで、ライトは**消費側が自前でオーバーレイを持つ**契約だった。結果として同じライト値が insession-app（`apps/web`）と loophub（`apps/web` / `apps/lp`）に重複し、DS の README にも「値は揃えて保守する」と書かれた三重管理になっていた。ここへ一本化した。

  移設前に 3 者の値を突き合わせ、**loophub の 17 トークンは insession-app の 30 トークンの部分集合で、値も完全に一致**していることを確認している。insession-app 固有で DS が持たない 3 つ（`--color-visibility-public` / `-followers` / `-community`）は移していない。

  **設計:**

  - **ダークが既定。** `@theme` の値がそのままダークのトーンで、ライトのオーバーレイは `data-theme="light"` が付くまで不活性。**ダーク固定のプロダクトは何も意識しなくてよい。**
  - **ダーク側（`[data-theme="dark"]`）の再宣言は置かない。** 移設元には 25 トークン分あったが、全て `@theme` の既定値と完全一致だったため、持ち込むと同じ値の二重管理が DS 側に移るだけになる。属性なしと `"dark"` はどちらも `:root` の値で成立する。
  - オーバーレイは**どの `@layer` にも属さない**ので `@theme` の出力（theme レイヤー）より必ず強い。詳細度でも `:root[data-theme="light"]`(0,2,0) > `:root`(0,1,0) なので、消費側の取り込み方に依らず効く。
  - 上書きするのは**参照元の生値だけ**（27 トークン）。ティント面とセマンティック面は `color-mix(…, var(--color-bg))` の合成なので追従する。
  - セレクタは `:root[…]` で html 要素だけに効く。要素単位の部分切替が必要なプロダクトは自分側で足す。

  **Storybook にツールバーの Theme トグルを追加した。** これが無いとライト値を目視検証できなかった。`scripts/check-styles.mjs` にもオーバーレイの回帰検査を足した（存在すること・レイヤー外にあること・面やティントを二重に書いていないこと・ダーク側の再宣言が無いこと）。

## 1.4.1

### Patch Changes

- 7221f60: ライセンスを MIT にした（`LICENSE` を追加し、`package.json` の `license` を `UNLICENSED` から `MIT` へ）。

  public リポジトリで npm にも公開しているのに `license` が `UNLICENSED`（=「許諾しない」の明示）のままで、**InSession / loophub 以外のプロダクトは法的に採用できない**状態だった。他プロダクトへ配る前提と矛盾していたので改めた。

  著作権表示は `Copyright (c) 2026 INSESSION Space`。`LICENSE` は `files` に明示し、CI の npm pack 検査でも同梱を必須にした。

## 1.4.0

### Minor Changes

- 15a4206: 消費側の Tailwind 依存を外し、パッケージを自己完結させた。

  **`@insession/design-system/styles.css` を追加した。** publish 時にプリビルドした配布 CSS（トークン + 部品 CSS + このパッケージが使うユーティリティ、約 53KB / gzip 約 9KB）で、これ 1 枚を読むだけで動く。消費側に Tailwind v4 は不要になり、`@source` の設定ミスで「ビルドは緑のままスタイルが静かに欠ける」失敗モードも消える。

  **パッケージ内に定義が無かった CSS を移植した（`components.css`）。** 以下は定義が消費側 insession-app の legacy CSS にしか存在せず、publish された中身だけでは完成していなかった。そのため **insession-app の外では静かに崩れていた**:

  - `.modal` / `.modal-backdrop` / `.modal-close` / `.modal h2` → Modal の既定経路（`title`/`footer` を渡さない呼び方）と、それに載る ConfirmModal / ProfileModal
  - `.bottom-sheet*` → BottomSheet 全体
  - `.google-icon` → GoogleIcon
  - `@keyframes card-in` / `fade-in` / `pop-in` / `snackbar-in` / `ring-timer-urgent-pulse` → Modal / BottomSheet / Badge / Toast(snackbar) / RingTimer のアニメーション

  **その他:**

  - `base.css` を追加。コンポーネントが前提にする最小リセット（`box-sizing` とフォームコントロールのフォント継承）のみを `@layer base` に持つ。Tailwind の preflight は消費側のページ全体を書き換えるので配らない。
  - `--radius-sheet: 22px` をトークンに追加（BottomSheet が参照する）。
  - `scripts/check-styles.mjs` を追加し CI に組み込んだ。「クラス名は DOM に出るのに CSS が無い」欠損を機械的に検出する。
  - Storybook を「消費側と同じ経路」（`dist/styles.css` のみからコンポーネントを描く）に変更した。従来はカタログ側で独自にユーティリティを生成していたため、上記の欠損を見逃す構造だった。
  - BottomSheet の × 閉じるボタンに flex の中央揃えを足した（移植元はグリフが左上に寄っていた）。既存の消費側 insession-app は自分の legacy CSS で描画を続けるため影響を受けない。

  **破壊的変更ではない。** 従来方式（`theme.css` + `@source`）はそのまま動く。ただしその方式を続ける場合は、上記の部品 CSS を得るために `@insession/design-system/components.css` の import を足すこと。

> **このパッケージは `@in-session/ui` から `@insession/design-system` へ改名されました**
> （リポジトリ分割時。旧モノレポ `insession-space/insession-app` の `foundation/ui` が
> `insession-space/design-system` として独立し、npm へ公開されました）。
> 以下の履歴は改名前の記述をそのまま残しています（当時のパッケージ名は `@in-session/ui`、
> ソースの置き場所は `packages/ui` → `foundation/ui` でした）。

## 1.3.1

### Patch Changes

- 7d8a565: DS の tinted surface（`--color-tint-*` / `--color-*-surface(-strong)`）を不透過化。テーマ背景 `var(--color-bg)` への color-mix 合成で、既定背景上の見え方は従来と同一のままバッジ/ロゼンジ等の塗りが透けなくなる。透明度が必要な装飾（CD 盤の光沢・ボイス発話グロー・スキャングラデ）は `color-mix(…, transparent)` をその場で使う形へ置換して透過を維持。

## 1.3.0

### Minor Changes

- f137883: コミュニティ画面の再設計（#1027）: 「みんなの様子」を「トピック」に改名、投稿入力を DS 共通の Composer（@in-session/ui 新設。Enter 送信・Shift+Enter 改行・IME ガード・自動伸長）へ統一し space チャットと共通化、「スペース」タブ新設（コミュニティのスペースをホームから移行）、「設定」タブ新設（名前・説明文の編集 / 招待リンク / コミュニティ削除。owner 限定・サーバー側 PATCH/DELETE /api/communities/:id 追加）、コミュニティの emoji アバター表示を全廃

### Patch Changes

- 436523e: コミュニティ入力欄のスタイル修正（#1038 フォローアップ）: Composer の送信ボタンに legacy グローバル button スタイル（灰色塗り・padding）が透過していたのをリセットしアイコン表示に修正、スレッド返信ブロックの意図しない四辺枠線を解消（border-0 で左線のみに）、コミュニティ入力欄から定型文ボタン/チップを撤去（ユーザー要望）

## 1.2.0

### Minor Changes

- f1cc47a: 伝言ゲーム（whiteboard plugin relay-game モード）の UI をデザインコンプへ刷新した（#974）。ロビーは参加スロットグリッド + 募集中バッジ + 過去ゲーム一覧、プレイ中は円形カウントダウンタイマー・ステップ進行・提出状況のサイドレール（狭幅では上部ストリップ）、お絵描きはペン 5 種/インク 9 色/太さスライダーのフローティングツールバー（usketch freedraw の外部制御イベントで駆動・relay では設定を localStorage に永続化しない）、結果はチェーンカード + confetti になった。汎用部品として RingTimer / StepFlow を @in-session/ui へ追加（Storybook ストーリー付き。サーバー/WS プロトコルは無変更）。

### Patch Changes

- f96bcf5: Habitat Phase 2「社会性と生きた環境」を追加した（#982）。親密度（creature_relations テーブル・近接/遊びで蓄積・ユーザーをまたいで永続）と再会 greet、性格 4 軸（uid から決定論生成・経験で微小ドリフト・DB 永続化）、感情エモート、短期の天気（チャット盛況 →bloom / Watch Party 再生 →dusk+集合 / 深夜少人数 →night+蛍+添い寝。すべて行動 AI への入力）、アンビエントモード（スペース画面下端の帯。スペース設定と個人設定の両方で OFF 可・モバイル既定 OFF）。モバイル判定の単一ソースとして foundation/ui に MOBILE_LAYOUT_MQ を新設。

## 1.1.3

### Patch Changes

- 24e2a30: foundation/ui 自体の DS 逸脱を解消: --shadow-_ を間接参照（--elev-_）化しテーマ上書き可能に、tracking 任意値を tracking-tag/pill トークン化、rounded-[2px] を rounded-xs へ。loophub の light 影上書きを --elev-\* に追随、help のテーマコピーに tracking トークンを補完

## 1.1.2

### Patch Changes

- ccb0e5b: 参加者パネル（`.cp-popover`。`overflow-y:auto`）内で MiniProfile を開くと、パネルの overflow にカードがクリップされて左側が見えなくなる問題を直した（#885）。`foundation/ui/popover.tsx` の `Popover` に `portal` オプションを追加し、指定時はパネルを `createPortal` で `document.body` 直下へ出し、トリガーの実測位置から `position:fixed` で配置するようにした（既定 `false` で他 consumer の従来挙動は変えていない）。

  あわせて、portal 化に伴う副作用（フォーカス移動・トリガーのスクロールアウト・入場アニメ中の誤ったサイズでの位置確定）にも対応した: open 時にパネル内へ focus を移し close でトリガーへ戻す、`aria-owns` で DOM 非隣接になったトリガーとパネルの関連を明示、`ResizeObserver` でパネルの後発サイズ変化に追従、トリガーがスクロールでクリップ境界の外に出たら `onClose()` せず `visibility:hidden` で隠して再表示可能にする、といった調整を行っている。

## 1.1.1

### Patch Changes

- 177f397: 通知ポップオーバーがライトテーマで崩れて見える不具合を修正した（#867）。原因は Tailwind v4 が `@theme` 内の `--shadow-*` を**ビルド時にリテラル展開**して `.shadow-*` ユーティリティを生成する挙動にあり、`:root[data-theme="light"]` での同名トークン上書きがユーティリティには一切効いていなかった。legacy CSS の `box-shadow: var(--shadow-popover)` はランタイム参照なので正しく追従しており、この非対称のせいで「UserMenu と 🧩 スイッチャーは正常なのに、DS の `shadow-*` ユーティリティを使う通知パネルだけライトテーマでダーク影（`inset 0 1px 0 rgba(255,255,255,.06)` の白い内側ハイライト付き）が当たる」状態になっていた。白背景の上端にこのハイライトが線を引くため、ヘッダーとリストが別々の面に分離して見えていた。

  影の実値を `--elev-*` トークンへ移し、`@theme` 側は `--shadow-x: var(--elev-x)` の参照だけを持つ形にして、`shadow-soft` / `shadow-popover` / `shadow-overlay` の全ユーティリティがライト/ダークにランタイム追従するようにした（同じ不具合を抱えていた `shadow-soft` / `shadow-overlay` も併せて解消）。影の値そのものは変えていない。

  あわせて UserMenu / 🧩 ステージスイッチャーを「正」として通知パネルの見た目を揃えた: `shadow-popover-strong`（#564 で導入、唯一の利用者が通知パネルだった）を廃止して既定の `shadow-popover` に統一、`--z-dropdown` を 30→50 にして UserMenu / 🧩 のハードコード `z-index: 50` をトークン参照へ寄せ、🧩 の `border-radius: 14px` ハードコードを `var(--radius-card)`（16px）に揃えた。

  共通 `Popover` には `panelPadding` / `panelScroll`（いずれも既定 `true` で従来挙動）を追加し、「ヘッダー固定＋本文だけスクロール」なパネルを `p-0!` / `overflow-hidden!` / `max-h-...!` の `!` 打ち消し連鎖なしに書けるようにした。狭幅ビューポートで横にはみ出さないよう `max-w-[calc(100vw-24px)]` のクランプも入れている。

## 1.1.0

### Minor Changes

- 7d26fe9: 設定モーダルの 2 ペイン外殻を `@in-session/ui` の `SplitModal` に集約した（#842）。スペース設定とアカウント設定が同じ左 nav 構造を各々でベタ書きしていた重複を解消し、両方が共通プリミティブを使うようにした。合わせて、狭い画面（560px 以下）では左右 2 ペインを縮めるのをやめ、「セクション一覧 → タップで詳細 → 戻る」のドリルダウンにレイアウトごと差し替えるようにした。ネイティブの設定アプリと同じ操作感になり、セクションが増えても窮屈にならない。広い画面の見た目と、スペース設定のモバイルがボトムシートで開く挙動は従来どおり。

### Patch Changes

- 0cc1d3f: デザインシステムの Button / IconButton に `xs` サイズを追加し、DS（claude.ai/design の INSESSION Design System）と実装の食い違いを解消した（#854）。DS 側の Button は `sm` / `md` の 2 段階しか定義しておらず、リポジトリの `foundation/ui/button.tsx` が既に持っていた `xs` が DS に載っていない状態だった。DS の Button を `xs`（padding 6px 12px・font 11px）を含む 3 段階に揃え、IconButton も同じ呼称のサイズトークン（`xs` 30 / `sm` 34 / `md` 38）で指定できるようにした（従来の数値 px 指定も引き続き動く）。合わせて legacy CSS 側にも素の `button` の既定サイズを打ち消せる `.btn-xs` を用意し、密な UI（インライン行アクション・ポップオーバー内・コンパクトなモバイル面）で使えるようにした。既存の `sm` / `md` の見た目は変えていない。
- 9f63b09: 設定モーダル（ユーザー設定・スペース設定）のドリルダウン切替の閾値を 560px から 768px へ引き上げた（#861）。タブレットや狭い PC ウィンドウの幅だと、レール(214px)+本文の 2 ペイン表示が窮屈だったため、より広い幅からドリルダウン（一覧 → タップで詳細）に切り替わるようにした。

## 1.0.2

### Patch Changes

- aa448a1: loophub のヘッダー崩れを修正し、ブランドロゴを 48px にする

  ヘッダー行の子要素に `shrink-0` が無く、幅が足りないと全要素が等しく縮んで「新規リクエスト」ボタンのラベルが縦折り返しになり、検索欄が潰れて placeholder が重なっていた。検索欄だけが `min-w` の下限まで縮む構成に整理し、他の子は固有幅を保つようにした。あわせて `SearchField` プリミティブから `w-full` を外し、幅は呼び出し側が決める形にした。

## 1.0.1

### Patch Changes

- 7747ac5: 共通 UI コンポーネント群の配置を foundation 配下のモノレポ構成へ再編
