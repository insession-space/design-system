---
"@insession/design-system": patch
---

refactor(composer): `textareaRef` の型を非推奨の `MutableRefObject` から `RefObject` へ

`Composer` の `textareaRef` prop が React 19 で非推奨の `MutableRefObject<HTMLTextAreaElement | null>` を使っていた。兄弟コンポーネント（`Suggest` / `Mention` / `EmojiSuggest`）と同じ `RefObject<HTMLTextAreaElement | null>` へ揃えた。React 19 では両者は構造的に同一（`{ current: T }`）で、`useRef(null)` の戻り値もそのまま渡せるため、消費側の変更は不要。
