/* DS のセマンティックトーン語彙の単一ソース（#962）。
 *
 * ── なぜ型を1つにするか ─────────────────────────────────
 * 状態を色で表す部品（Status / Lozenge / Badge / CountChip）は、それぞれが独立に tone の
 * 文字列ユニオンを持っていた。結果として **同じ緑を出すのに `tone="live"` と `tone="success"`
 * の2通りの書き方**があり、琥珀も `warn` と `warning` に割れていた。部品を乗り換えるたびに
 * 呼び出し側が書き換えを迫られるうえ、どちらが正しいのかがコードのどこにも書いていない。
 *
 * ここを 1 つの型にすると、語彙のズレが**型検査で落ちる**ようになる（`tone="warn"` は
 * SemanticTone に無いのでコンパイルが通らない）。新しく状態を色で表す部品を足すときは、
 * 独自のユニオンを書かずにこの型を使うこと。
 *
 * ── 値の対応 ────────────────────────────────────────
 * theme.css のセマンティックカラーと 1:1 で対応する。各トーンは「地の色(text/icon)」
 * 「面(surface / surface-strong)」「枠(border)」の3点を持つ:
 *   success → --color-success / -surface / -surface-strong / -border
 *   warning → --color-warning / …
 *   danger  → --color-danger  / …
 *   info    → --color-info    / …
 *   neutral → セマンティック色を持たない中立。面は --color-surface-3、地は --color-text-dim
 *             （部品によって濃度が違うので、neutral だけは部品側が値を決める）
 *
 * ⚠ **ブランド色(accent = コーラル)はここに入れない。** accent は「危険」でも「成功」でも
 * ない、意味を持たない強調色。必要な部品（Badge / Lozenge）が SemanticTone に自分で足す。
 *
 * ⚠ **Badge だけはこの型をそのまま使えない。** Badge の `danger` は歴史的に**赤ではなく
 * コーラル**を描画する（DS 仕様がそう定めている）。ここに寄せると出荷済みの色が静かに
 * 変わってしまうため、Badge は独自のユニオンを持ち、正名として `accent` を用意して
 * `danger` を旧名扱いにしている。詳細は badge.tsx のコメント。 */
export type SemanticTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
