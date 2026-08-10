---
'@insession/design-system': minor
---

モーションのイージングと filled な hover をトークン化する（見た目はほぼ不変）

DS が管理していない値がモーションと hover に残っており、同じ DS の中で動きの質が揃っていなかった。トークンへ寄せて DS 側から動かせるようにする。

**追加したトークン**

- `--ease-standard` (`cubic-bezier(0.2, 0, 0, 1)`) — 色・不透明度・影用のイージング。オーバーシュートしない。
- `--color-fill-hover` / `--color-accent-hover` / `--color-success-hover` / `--color-danger-hover` — filled な面の hover 色。

**イージングをプロパティの種類で使い分ける**

これまで DS が持つイージングは `--ease-spring` 1 本だけで、足りない分は Tailwind 既定テーマの `ease-out` / `ease-in-out` がそのまま使われていた（実測 6 箇所）。`#117` で `text-xl` 以上を `initial` で塞いだのと同じ「DS が管理していない値が静かに生き続ける」状態にあたる。

加えて `Button` と `Link`(`pill`) は `transition-[transform,background,color,...]` に `ease-spring` を 1 つ掛けており、**hover の色変化までオーバーシュートしていた**。`--ease-spring` は制御点に 1.56 を持つ、終点を行き過ぎて戻るカーブで、位置や大きさが行き過ぎるのは「弾んだ」と読めるが、色が目標より濃くなって戻るのはちらつきとしてしか知覚されない。

- `--ease-spring` は形・位置・大きさ（transform / 入場アニメ）専用にする。
- 色・不透明度・影は `--ease-standard` を使う。
- `TRANSITION_COLORS` にイージング指定を足した（従来は省略され Tailwind 既定が効いていた）。
- `Button` は transform だけに spring、色と影は standard を当てる（プロパティごとに別イージングを当てるため `transition` ショートハンドを直接指定する）。
- `Link`(`pill`) は standard に統一した。ここの transform は hover 時の 1px の持ち上げだけで、その量では spring のオーバーシュートが知覚できない。
- `.accordion-panel` / `.accordion-panel-content` が参照していた Tailwind 既定の `--ease-out` を `--ease-standard` へ移した。

**filled な hover を面変化へ統一する**

`hover` の実装が filled=`brightness(.93)` / soft=`bg-surface-hover` / apple=`bg-apple-hover` の 3 通りに割れていたので、全て面変化へ寄せた。`Button` の 5 variant と `IconButton` の `accent` が対象。

**描画は変わらない。** 新トークンの実体は `color-mix(in srgb, black 7%, X)` で、これは `brightness(0.93)` と数学的に同一（どちらも各チャンネルを 0.93 倍する。`#ff6a47` → 両者とも `#ed6342`）。変わったのは次の 3 点:

1. `.93` が 6 箇所へ散っていたため hover の強さを DS 側から動かせなかったのが、トークン 1 本で効くようになる。
2. `filter` を遷移させなくて済む（`filter` は新しいスタッキングコンテキストを作るため、ボタン内の `Spinner` やアイコンの重なりに影響し得る）。
3. 黒地で `brightness` が効かず独自に面変化を採っていた `apple` variant と同じ形になる。

なお hover で面を**明るくする**方式（Material 3 の state layer のように文字色を重ねる）は採っていない。白ラベルの面に白を混ぜることになり、ラベルのコントラストが下がるため（実測: accent 上の白ラベルが 2.84:1 → 2.63:1、success 上が 2.25:1 → 2.11:1）。`--color-on-accent` の項に書いたとおり、この DS はコントラストを上げたいときに塗り側を暗くする方針を採っている。
