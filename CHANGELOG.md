# @in-session/ui

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
