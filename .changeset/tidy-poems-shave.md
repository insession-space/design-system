---
"@insession/design-system": minor
---

フィードの1件分を組み立てる複合コンポーネント `FeedItem` / `FeedItemAttachment` を追加した。

プリミティブ（`src/components/`）と区別するため、複合コンポーネントの置き場所として `src/ui-kit/` を新設した。Storybook のカテゴリは `UI Kit/`。

`FeedItem` は見た目だけを持ち、文言の解決（i18n）・データ更新・画面遷移は呼び出し側の責務にしている。`timeLabel` / `message` は整形済みの文字列を受け取り、アバター・サムネイル・アクションはスロットで差す。
