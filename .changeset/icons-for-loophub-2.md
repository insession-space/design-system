---
'@insession/design-system': minor
---

Icon に 15 種を追加（code / content_copy / dark_mode / error_outline / folder / groups / how_to_vote / hub / light_mode / menu_book / publish / rocket_launch / sync / tune / visibility）。

7.5.0（#161）で loophub の `.mi` を引き取ったが、**あの調査は JSX 直書きのリガチャしか拾えておらず数え落としがあった**。`HELP_CATEGORY_ICON` のようなデータ定義（`はじめに: 'rocket_launch'`）、`NAV_ITEMS` の `icon:` フィールド、三項分岐の中の名前（`theme === 'dark' ? 'light_mode' : 'dark_mode'`）を走査できていなかった。

消費側の全量（49 種）を洗い直し、DS に無い残り 15 種を引き取る。これで loophub は `.mi` webfont を完全に捨てられる。

- 追加のみで既存 `IconName` の変更・削除は無い（破壊的変更なし）
- 15 種すべてクラシックな Material Icons（`0 0 24 24`）に存在したため `PATHS` へ。`CUSTOM_VIEWBOX` は不要
- path data はすべて `google/material-design-icons` の公式 SVG から取得
- 15 種すべてヘッドレス Chromium で実レンダリングし、図形が壊れていないことを確認済み
