---
'@insession/design-system': patch
---

SplitModal: `asSheet` のとき自前の × を描かないようにした（× が2つ並ぶのを修正）。

外殻が BottomSheet になる `asSheet` では、同じ `closeLabel` が BottomSheet 側にも渡って
`.bottom-sheet-close` が出るため、狭幅ヘッダー（一覧 / 詳細）と paneHead の × と合わせて
閉じるボタンが二重に描画されていた（実測: シート右上に浮く 36px の × と、その 25px 下の
ヘッダー行に 30px の ×）。`asSheet` では自前の × を止め、閉じる手段はシート側の × ・
下スワイプ・背景タップに一本化する。中央 Modal（既定）の見た目と挙動は変わらない。
