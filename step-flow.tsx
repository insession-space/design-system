// ステップ進行表示(純粋 leaf UI)。done / current / todo の3状態ピル列で「今どこにいるか」を示す
// (リレーゲームのフェーズ表示等 #974)。文言は i18n を持たないため steps[].label で注入する。
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
  return (
    <div
      className={`flex ${isRow ? 'flex-row flex-wrap items-center gap-1.5' : 'flex-col items-stretch gap-1.5'} ${className}`.trim()}
    >
      {steps.map((step, index) => {
        const tone = stepTone(index, currentIndex);
        const showSeparator = isRow && index < steps.length - 1;
        return (
          <div key={step.key} className={isRow ? 'inline-flex items-center gap-1.5' : 'contents'}>
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
          </div>
        );
      })}
    </div>
  );
}
