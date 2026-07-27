---
'@insession/design-system': minor
---

`SideNav`（左レール）を追加する。insession-app（web / help）と loophub-app が別々に持っていた同型の縦ナビを、アプリ非依存のプリミティブとして DS へ集約する。

Base UI 準拠の compound parts（`SideNav.Root` / `.Brand` / `.Group` / `.Item`）で、要素の実体は `render` プロップで差し替えられる（`<SideNav.Item render={<NavLink to="/" />} />`）。`href` を渡せば `<a>`、渡さなければ `<button type="button">` として描画される。

- active は DS が導出せず呼び出し側が `active` で渡す（ルーターを DS に持ち込まない）。`aria-current="page"` と `data-active` が付く
- `Group` の `secondary` で最下部寄せ + 上区切り線 + 弱色になり、配下の `Item` へ Context 越しに伝わる（`data-secondary`）
- `Item` は `icon` / `trailing`（バッジ等）/ `external`（別タブ + `open_in_new`）を持つ
- `Root` は `aria-label` 必須の `<nav>`。`fullHeight`（既定 true）で `h-dvh` / `h-full` を切り替える
