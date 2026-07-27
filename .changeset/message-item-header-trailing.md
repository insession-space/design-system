---
'@insession/design-system': patch
---

`MessageItem` のヘッダーで投稿者名と時刻のベースラインが揃っていなかったのを直した（#97）。

- 原因: ヘッダーが `HStack align="baseline"` で `UserLabel` と時刻 `<span>` を兄弟として並べていたが、`UserLabel` 内部は `HStack align="center"` のフレックスで、最初の要素はテキストを持たないアバターの `<div>`。フレックスの first baseline はこのアバター div から合成されるため、外側の `align="baseline"` は「名前のベースライン」ではなくアバターの下端を基準にしてしまっていた。ヘッドレス Chromium の実測でアバター有りのとき時刻が名前より 1.84px ずれ、アバター無しのときだけ 0px だった（修正後はアバターの有無・`href`/`onClick` の有無いずれの組み合わせでも 0px）。
- 対策として `UserLabel` に `trailing` slot を追加した。名前の**右**に、名前と**同じベースライン**で置く小さな要素（時刻・バッジ等）向けの差し込み口で、名前の"下"に置く `subtitle` と対になる。名前と `trailing` を同じ flex 行のテキスト同士として描くため、アバターの有無や `href`/`onClick` による要素分岐（`<div>`/`<a>`/`<button>`）に関係なくベースラインが一致する。`MessageItem` はこれを使って時刻を `UserLabel` の `trailing` に渡すよう変更した。
- `MessageItem` に `actionsSlot` を追加した。既存の `actions` は `{icon,label,onClick}` の配列しか表現できず、Popover を伴うアクション UI（絵文字ピッカー等）を置けない。消費側（insession-app）はこれを `MessageItem` の兄弟として行方向 flex の中に横並びで置かざるを得なかったが、アクション UI は非表示（`opacity-0`）でも in-flow のため常時レイアウト幅を占有し、本文の折り返し幅を奪っていた（実測で本文が約100px 分狭くなり早期折り返しが起きていた）。`actionsSlot` はヘッダー行の中（`actions` の後ろ）に任意のノードを描画できる差し込み口で、消費側が兄弟として置く必要をなくす。表示/非表示の制御は消費側の責務のため、DS 側の opacity 制御はここには当てない。
- `MessageItem` のルートに `w-full` を追加した。`min-w-0` は flex アイテムが縮むことを許可するだけで幅を取り切る指定ではないため、行方向 flex の子に置かれたときに与えられた幅を使い切るよう明示した。

- `trailing` は `UserLabel` が操作可能（`href`/`onClick`）なとき、時刻もその `<a>`/`<button>` の内側に入る。時刻は押しても何も起きない飾りなので、`MessageItem` は操作可能なときだけ時刻を無害化する: クリック/中クリックを `preventDefault` + `stopPropagation` で止め、`aria-hidden` にしたうえで操作領域の外側に `sr-only` の時刻を置いて読み上げを保つ（リンク名が「表示名 + 時刻」に汚れないよう `ariaLabel` に表示名だけを渡す）。`<a href>` を右クリックしてコンテキストメニューから「新しいタブで開く」を選ぶ経路だけは DOM イベントで止められないため、時刻を完全に不活性にしたい場合は `authorHref` ではなく `authorOnClick` を使う。
- `ReactNode` の差し込み口の有無判定に `hasSlotContent`（`src/ui-kit/slot.ts`）を足した。`trailing={cond && <Badge />}` のような条件付き描画で条件が false のとき、素朴な `!= null` 判定だと「中身あり」と誤判定してラッパーと `gap` だけが増え、余白と truncate の効き方が静かにずれるため。React 自身に合わせて `false` / `null` / `undefined` / `''` を「中身なし」として扱う。

いずれも既存 props の意味・既定値・見た目は変えない破壊的変更ではない（`trailing`/`actionsSlot` 未指定なら従来と同一の DOM・見た目）。
