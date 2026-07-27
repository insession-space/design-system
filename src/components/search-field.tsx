import { Field } from '@base-ui/react/field';
import type { InputHTMLAttributes, ReactNode } from 'react';
import Icon from '../icons/icon.tsx';
import { FIELD_BOX_BASE, FIELD_CONTROL, FIELD_LABEL, fieldLabelColor } from './input.tsx';

// 検索入力（純粋 leaf UI）。claude design "INSESSION Design System" 準拠（loophub #682）。
// label と control の紐付けを Base UI の Field へ委譲する（#33）。DS 側は見た目だけを持つ。
//
// ── #22 の取りこぼしだった ──────────────────────────
// フォーム系の移行（#22）で Checkbox / Radio / Toggle / Input / Textarea を Base UI へ載せた際、
// この部品だけスコープから漏れていた。Input と同系の見た目なのに **定数を共有しておらず**、
// field / control のクラス文字列を自前で二重に持っていた（片方だけ変えてもずれに気づけない）。
// ここで input.tsx の定数を import して一本化する。
//
// 見た目: surface-2 面 + 1px border + radius-md + フォーカスリング（枠幅は #35 で 1.5px から変更）。
// 左に search アイコンを固定表示する（常時 search 固定なので Input の prefix とは別プリミティブ）。
// i18n は持たない（placeholder / label は呼び出し側が渡す）。
//
// ⚠ フォーカスの枠色は `focus-within:` のバリアントで出す。Input は自前の useState で focused を
// 追跡しているが（error > focused > default の3値が同じプロパティを奪い合うため）、SearchField は
// error 状態を持たず「既定 or フォーカス」の2値しかない。バリアント付きは base より後に出力される
// ので確実に勝ち、#21 / #17 のような出力順の衝突は起きない。
export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  // 可視ラベル（任意）。渡すと Field.Label として control に自動で紐付く。
  label?: ReactNode;
  className?: string;
};

const FOCUS_RING = 'border-border focus-within:border-info focus-within:shadow-focus';

export default function SearchField({
  label,
  className = '',
  disabled,
  ...rest
}: SearchFieldProps) {
  // 検索ボックス本体。
  // ⚠ 移行前と同じ px-3.5 py-2.5。Input の py-3 より一段浅いのは意図的（検索欄は1行で
  // 詰まって見える方が収まりが良い）。FIELD_BOX_BASE は縦 padding を持たない契約なので
  // ここで必ず指定する。最初は共通側に py-3 を置いて py-2.5 で打ち消す実装にしていたが
  // **打ち消せなかった**（同一プロパティのユーティリティは配布 CSS の出力順で決まる。
  // 実測で py-3 が勝ち padding が 12px になっていた）。#21 と同じ構図。
  const box = (extra: string) => (
    <div className={`${FIELD_BOX_BASE} items-center gap-2 py-2.5 ${FOCUS_RING} ${extra}`.trim()}>
      <Icon name="search" size={16} className="shrink-0 text-text-faint" />
      <Field.Control type="search" className={FIELD_CONTROL} disabled={disabled} {...rest} />
    </div>
  );

  // label が無いときは Field.Root を挟まず、**移行前とまったく同じ DOM**（ボックス1枚）を返す。
  // label を持たない呼び出しでは Field.Root の役目（label と control の紐付け）が無いうえ、
  // 挟むと className の載る要素が1つ外側にずれて、移行前に効いていたボックスの見た目上書き
  // （rounded-pill / bg-surface-3 など）が届かなくなるため。
  // Base UI の Field パートは Root 無しでも throw しない（useFieldRootContext の optional が
  // 既定 true）ので、Field.Control をそのまま置ける。
  if (label == null) return box(className);

  // label があるときは縦積みの Root が要る。className はラベルとボックスの両方を含む
  // **全体**に効かせる（max-w-* のような幅制御でラベルとボックスの幅を揃えるため）。
  return (
    <Field.Root disabled={disabled} className={`flex flex-col gap-[7px] ${className}`.trim()}>
      <Field.Label className={`${FIELD_LABEL} ${fieldLabelColor(false, false)}`}>
        {label}
      </Field.Label>
      {box('')}
    </Field.Root>
  );
}
