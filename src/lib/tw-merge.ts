import { extendTailwindMerge } from 'tailwind-merge';

/* DS 専用の tailwind-merge インスタンス（#137）。
 *
 * ── なぜ入れたか ─────────────────────────────────────
 * プリミティブは variant / size のスタイルを素の Tailwind ユーティリティ文字列で持ち、
 * 消費側の `className` を **単純連結** していた。連結は class 属性の並びを変えるだけで、
 * どちらが効くかは **配布 CSS の生成順** で決まる。結果として
 *
 *   <Button variant="ghost" className="text-accent">Mix</Button>
 *
 * の computed color が variant 側の `text-info`（青）のまま、という「書いたのに効かない」が
 * 起きていた。消費側（insession-app）は毎回 important 接尾辞（`text-accent!` `px-3!`）で
 * 回避しており、**DS を使うと消費側に important が増える**という形で漏れ出していた。
 * これは #58（BASE の border-transparent が secondary の border-text に勝って 2px
 * アウトラインが消えていた）と同じ失敗が、DS の外側で再演されている状態でもある。
 *
 * twMerge は「同じ CSS プロパティのユーティリティは後勝ちで1つに畳む」を **クラス文字列の
 * 組み立て時（JS 側）** に行う。DS が守ってきた「同一プロパティのユーティリティは排他的に
 * 1つだけ出す」という契約を、消費側の className まで含めて機械的に成立させるための道具。
 *
 * ── なぜ @layer components ではないのか ──────────────────
 * 「variant のスタイルを @layer components に置けば utilities の消費側指定が常に勝つ」は
 * Tailwind 単体では正しいが、**この DS では消費側によって効いたり効かなかったりする**。
 * CSS の配達経路が3通りあるため:
 *
 *   1. loophub-app  … `@insession/design-system/styles.css`（プリビルド1枚）を import
 *   2. insession-app の web / admin … Tailwind + `@source dist` 走査（+ components.css）
 *   3. insession-app の lp / help   … `@source dist` 走査のみ。**components.css を import していない**
 *
 * 3 には `src/styles/components.css` が届かない。つまり @layer components に置いた variant は
 * lp / help では**そもそも配られない**。全消費側に確実に届くのは「部品のクラス文字列に書いた
 * Tailwind ユーティリティ」だけなので、衝突解決は CSS レイヤーではなく JS 側で行う。
 *
 * ⚠ この経路の前提として、**クラス名はソースに静的な文字列リテラルとして残す**こと。
 * twMerge に渡すのは下の BASE / VARIANT のような定数であり、走査（`@source dist`）は
 * 引き続き機能する。クラス名をテンプレートで動的生成し始めると、その瞬間に生成が止まる。
 *
 * ── 何を教える必要があるか ────────────────────────────
 * tailwind-merge は既定テーマ（素の Tailwind）のスケールしか知らない。DS のカスタムトークンの
 * うち、**既定のスケールに乗らない名前**は「未知のクラス」として素通しされ、衝突解決の対象から
 * 外れる（= 2つ出たままになり、順序勝負が復活する）。下の `extend.theme` はそれを塞ぐ。
 *
 * 分類は推測せず実測すること（`node scripts/check-tw-merge.mjs`）。とくに `text-*` は
 * **font-size と color の2グループに分かれる**のが要点で、tailwind-merge の既定は
 *   - `text-<既知の font-size 名>` → font-size
 *   - それ以外の `text-*`         → color（theme.color が `isAny` のため何でも通る）
 * と判定する。したがって `text-accent` / `text-on-fill` のような色名は**追加設定なしで正しく
 * color に落ちる**が、DS のセマンティック段（`text-body` / `text-small` / `text-label` /
 * `text-h1` / `text-h2` / `text-display`）は放っておくと **color に誤分類される** —
 * `text-body` と `text-accent` が同じグループになり、後から書いたほうが前を消してしまう。
 * だから font-size 側（theme.text）へ明示的に足す。
 *
 * radius / shadow / ease も同型の問題。`rounded-pill` `shadow-focus` `ease-spring` は
 * 既定の t-shirt スケールに無いため、足さないと `rounded-md` と `rounded-pill` が
 * **排他にならない**（#517 の radius 契約が壊れる）。
 *
 * ⚠ theme.css にトークンを足したら、ここにも足すこと。ズレは
 * `pnpm check:tw-merge` が theme.css と突き合わせて機械的に検出する。
 *
 * ── important 接尾辞（`!`）の扱い ────────────────────────
 * ⚠ **`!` 付きと素のクラスは畳まれない**（実測）。tailwind-merge の衝突キーは
 * `{importantModifier}{variantModifiers}{classGroupId}` で、important の有無まで含めて別グループに
 * なる（`!px-3` と `px-3` は「強制」と「既定」として共存しうる、という設計判断）。
 * つまり消費側が `text-accent!` と書くと、variant 側の `text-info` は class 属性に残る。
 * それでも描画は正しい — important は同じ utilities レイヤーで常に最強なので、並び順に関係なく
 * `text-accent!` が勝つ。**既存の `!` は壊れないし効きすぎもしない**。
 * そして `!` を外せば同じグループへ落ちて DS 側が畳まれるので、消費側は `!` を掃除できる。
 *
 * ── 公開 API ではない ───────────────────────────────
 * これは内部実装。`src/index.ts` からは export しない（消費側が DS の内部設定に依存すると、
 * トークンを増やすたびに消費側が壊れる）。
 */
export const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // font-size。既定は xs/sm/base/lg…（t-shirt サイズ）しか知らないので、DS の
      // セマンティック段を足す。足さないと色（text-color）へ誤分類される。
      // 値の定義は theme.css の `--text-*`。
      text: ['display', 'h1', 'h2', 'body', 'small', 'label'],
      // border-radius。`md` は t-shirt サイズとして既定が拾うが、DS 固有名は拾わない。
      // ここが欠けると rounded-md と rounded-pill が排他にならない（#517）。
      radius: ['chip', 'card', 'panel', 'pill', 'sheet'],
      // box-shadow。足さないと `shadow-focus` が **shadow-color** と誤分類され、
      // box-shadow 同士の衝突解決が効かない。
      shadow: [
        'focus',
        'soft',
        'popover',
        'overlay',
        'glow',
        'glow-strong',
        'elevation-0',
        'elevation-1',
        'elevation-2',
        'elevation-3',
        'elevation-4',
        'rp-convex',
        'rp-convex-lg',
        'rp-concave',
        'rp-concave-lg',
      ],
      // transition-timing-function。spring=形・位置（オーバーシュートする）、
      // standard=色・不透明度・影（#960。theme.css の当該コメント参照）。
      ease: ['spring', 'standard'],
      // letter-spacing。DS が切り出した中間値（badge / lozenge の uppercase caps）。
      tracking: ['tag', 'pill'],
    },
  },
});
