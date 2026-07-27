import type { ReactNode } from 'react';

// ReactNode を受け取る「差し込み口(slot)」に中身があるかを判定する共有ヘルパー。
//
// 素朴に `slot != null` で判定すると、React でごく普通に書かれる
// `trailing={isMine && <Badge />}` のような条件付き描画で条件が false のとき、
// `false != null` が true になってしまい「中身がある」と誤判定する。React 自身は
// false / null / undefined / '' を「何も描かない」として扱うので、slot の有無も
// それに合わせる。合わせないと、中身が空のままラッパー要素と gap だけが増えて
// レイアウト(余白・truncate の効き方)が静かにずれる。
//
// 数値の 0 は React が "0" と描くので「中身あり」に含める(意図的に != 0 を書かない)。
export function hasSlotContent(slot: ReactNode): boolean {
  return slot != null && slot !== false && slot !== true && slot !== '';
}
