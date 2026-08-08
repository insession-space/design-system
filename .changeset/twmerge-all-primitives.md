---
"@insession/design-system": patch
---

fix(className): 全プリミティブの `className` 合成を twMerge 経由に統一する

これまで `twMerge`（`src/lib/tw-merge.ts`）を通していたのは `Button` だけで、他の全コンポーネントは `` `${BASE} ${variant} ${className}`.trim() `` の**単純連結**で class を組んでいた。連結は class 属性の並びを変えるだけなので、消費側の `className` が効くかどうかは配布 CSS の生成順で決まり、`<Chip className="text-accent">` のような上書きが variant 側のユーティリティに負けていた（消費側は毎回 `text-accent!` のように `!important` で回避する必要があった）。

全プリミティブ／ui-kit の className 合成を `twMerge(...)` へ置き換え、`BASE < variant < className` の順序を優先順位として確定させた。これにより消費側の `className` が `!` なしで確実に勝つ。DS 自身の class 文字列は「同一プロパティのユーティリティを1つだけ出す」契約を守っているため、既存の描画は変わらない（`scripts/check-merge-collapse.mjs` が1リテラル内の同一プロパティ重複が無いことを機械的に検証する）。DOM に出るクラス名は公開契約ではないため、消費側の import は不変。
