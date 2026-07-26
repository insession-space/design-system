---
"@insession/design-system": patch
---

`PageHeader` の `title` に ReactNode を渡せなかったのを修正した。`PageHeaderProps` が `Omit<ComponentProps<'div'>, 'className'>` を広げていたため、HTML の `title` 属性(`string`)と `title: ReactNode` が交差して `ReactNode & string` に潰れ、要素を渡すと型エラーになっていた（アイコンやブランドドット付きの見出しが書けない）。`title` も Omit するようにした。

他のプリミティブの props（`gap` / `align` / `padding` / `elevation` / `size` / `wrap` など）は `div` の HTMLAttributes に同名が無く衝突しないことを型レベルで確認済み。
