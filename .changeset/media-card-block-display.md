---
"@insession/design-system": patch
---

MediaCard を常に block レベルのボックスとして描くようにした（#207）

`render` で `<a>` / `<button>` に差し替えたカードは、grid / flex の item にならない位置（ラッパー `<div>` の中など）に置くと `display: inline` のまま残っていた。inline のまま `padding` / `border` / `border-radius` / `background` が付くため、背景ボックスが行の切れ目で断片に割れ（実測3断片）、カードの面が消えたように見えていた。カバーの full-bleed（`-mx-4`）も親幅を基準にできずカード幅を超えてはみ出していた（実測 +32px）。

`MediaCard` のルートに `block` を持たせて解決した。`className` は `twMerge` を通るので、呼び出し側が `inline-block` 等を渡せば従来どおり上書きできる。

`w-full` は足していない。block ボックスは `width: auto` で containing block の幅いっぱいになるので不要な上、`twMerge` は `display` と `width` を別グループとして扱うため、呼び出し側が `inline-block` を渡しても幅だけ 100% が残る中途半端な状態になるため。`render={<button />}` のカードは `display: block` でもフォームコントロールの fit-content 幅が効くので、**既存の見た目は変わらない**（Storybook の `Clickable` で幅 252px のまま変化しないことを実測確認）。

⚠ 同じ穴は `Surface` の `render` リセット（`display` を持たない）にも空いており、`Surface` / `Card` / `Paper` / `Panel` を `render` 付きで grid / flex item にならない位置へ置くと同じ症状が出る。影響範囲が広いためこの変更では触れていない（別 Issue で扱う）。
