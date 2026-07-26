// ステップ進行表示(純粋 leaf UI)。done / current / todo の3状態ピル列で「今どこにいるか」を示す
// (リレーゲームのフェーズ表示等 #974)。文言は i18n を持たないため steps[].label で注入する。
//
// ── ここは Base UI に載せない（#33 での判断）──────────────
// 当初 Progress へ載せる想定だったが、**progressbar は不適切**と判断して見送った。
// role="progressbar" は「40% 完了」のような単一の数値を伝えるロールで、要素の中身は
// 読み上げ対象から外れる。StepFlow が伝えたいのは「どのステップに居るか」という
// **ラベル付きの位置**なので、数値に潰すと情報が減る。
// 代わりにネイティブの正しいセマンティクスを与えた: 順序付きリスト（<ol>/<li>）+
// 現在位置に aria-current="step"。これで支援技術は「3項目中2番目、現在: 集計」と読める。
// 移行前は素の <div> の入れ子で、順序も現在位置も一切伝わっていなかった。
export type StepFlowStep = {
  key: string;
  label: string;
};

export type StepFlowProps = {
  steps: StepFlowStep[];
  currentIndex: number;
  direction?: 'row' | 'column';
  className?: string;
};

type StepTone = 'done' | 'current' | 'todo';

const PILL_TONE: Record<StepTone, string> = {
  done: 'bg-success-surface text-success border-success-border',
  current: 'bg-accent text-on-accent border-transparent',
  todo: 'bg-surface text-text-dim border-transparent',
};

function stepTone(index: number, currentIndex: number): StepTone {
  if (index < currentIndex) return 'done';
  if (index === currentIndex) return 'current';
  return 'todo';
}

export default function StepFlow({
  steps,
  currentIndex,
  direction = 'row',
  className = '',
}: StepFlowProps) {
  const isRow = direction === 'row';
  // <ol>/<li> のマーカーと既定の余白は消す（見た目は移行前の <div> と同一に保つ）。
  return (
    <ol
      className={`m-0 flex list-none p-0 ${isRow ? 'flex-row flex-wrap items-center gap-1.5' : 'flex-col items-stretch gap-1.5'} ${className}`.trim()}
    >
      {steps.map((step, index) => {
        const tone = stepTone(index, currentIndex);
        const showSeparator = isRow && index < steps.length - 1;
        return (
          <li
            key={step.key}
            // 現在のステップだけ aria-current="step"。支援技術が「ここに居る」と読める。
            aria-current={tone === 'current' ? 'step' : undefined}
            className={isRow ? 'inline-flex items-center gap-1.5' : 'contents'}
          >
            <span
              className={`inline-flex items-center justify-center border border-solid px-2.5 py-1 text-smd font-bold ${isRow ? 'rounded-pill' : 'rounded-md'} ${PILL_TONE[tone]}`}
            >
              {step.label}
            </span>
            {showSeparator && (
              <span className="text-xs text-text-dim" aria-hidden="true">
                ▸
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
