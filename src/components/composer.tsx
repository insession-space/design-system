import type { FormEvent, KeyboardEvent, MutableRefObject, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import Icon from '../icons/icon.tsx';
import { twMerge } from '../lib/tw-merge.ts';

// メッセージ入力フォーム(純粋 leaf UI)。space のチャット入力とコミュニティの投稿入力の共通化
// (#1027)。textarea + 下段アクション行(左: actions props / 右: 送信アイコンボタン)の構成で、
// 呼び出し側は controlled(value/onChange)で使う。i18n は持たない(placeholder / sendLabel は
// 呼び出し側が文字列を渡す)。
//
// 挙動:
// - Enter で送信 / Shift+Enter で改行 / IME変換確定のEnterは送信しない(isComposing ガード)
// - textarea は rows=1 から内容に応じて自動で伸びる(max-height到達でスクロール可能に切替)。
//   PiP(別ドキュメントへcreatePortal)でCSSが未適用のままautoGrowが走るケースに備え、
//   getComputedStyle().maxHeightが解決するまで短い間隔でリトライする(space-core chat-panel の
//   実装をそのまま移設。挙動は変えない)。
// - onSubmit は trim 後に非空のときだけ呼ぶ。value のクリアは呼び出し側の責務(controlled なので
//   このコンポーネントは value を保持しない)。
export type ComposerProps = {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  // 送信ボタンの aria-label / title(表示ラベルではない。送信ボタンはアイコンのみ)。
  sendLabel: string;
  // 送信ボタンの左に置くアクション領域(スタンプピッカー・定型文ボタン等)。
  actions?: ReactNode;
  // 送信直後の一瞬の強調(呼び出し側が setTimeout で false に戻す想定)。
  flash?: boolean;
  // 外部から textarea へ focus するための ref。
  textareaRef?: MutableRefObject<HTMLTextAreaElement | null>;
  // コンパクト表示(コミュニティの返信欄等、狭い行内に馴染ませたい場合)。
  size?: 'default' | 'compact';
  className?: string;
};

const AUTO_GROW_RETRY_MS = 200;
const AUTO_GROW_RETRY_LIMIT = 25;

export default function Composer({
  value,
  onChange,
  onSubmit,
  placeholder,
  maxLength,
  disabled = false,
  sendLabel,
  actions,
  flash = false,
  textareaRef,
  size = 'default',
  className = '',
}: ComposerProps) {
  const ownRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef ?? ownRef;
  const autoGrowRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoGrowRetryCountRef = useRef(0);

  function clearAutoGrowRetry() {
    if (autoGrowRetryTimerRef.current !== null) {
      clearTimeout(autoGrowRetryTimerRef.current);
      autoGrowRetryTimerRef.current = null;
    }
  }

  // 入力欄(textarea)は複数行入力に合わせて自動で伸びる。最大高さはCSS側(max-h-*)で制御する。
  // scrollHeightがmax-height未満の間はoverflow-yをhiddenにし、内容が収まっているのに
  // スクロールバーが出てしまうのを防ぐ(max-heightに達したときだけauto化してスクロール可能にする)。
  // PiP(別ドキュメントへcreatePortal)ではCSSが<link>の非同期再フェッチで届くため、適用前に
  // autoGrowが走るとgetComputedStyle().maxHeightが'none'のまま(未解決)になり得る。未解決の間は
  // 安全側としてoverflow-yをhiddenに固定し(スクロールバーを出さない)、CSS適用後に再計測できるよう
  // 短い間隔(200ms)でリトライする(上限25回=5秒で打ち切り)。
  function autoGrow() {
    // 前回スケジュールしたリトライが残っていれば必ず先にclearする(多重スケジュール防止)
    clearAutoGrowRetry();
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    const maxHeight = Number.parseFloat(getComputedStyle(el).maxHeight);
    if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
      el.style.overflowY = 'hidden';
      if (autoGrowRetryCountRef.current < AUTO_GROW_RETRY_LIMIT) {
        autoGrowRetryCountRef.current += 1;
        autoGrowRetryTimerRef.current = setTimeout(autoGrow, AUTO_GROW_RETRY_MS);
      }
      return;
    }
    autoGrowRetryCountRef.current = 0;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: autoGrowは毎レンダー作り直す純粋な関数(state更新なし)なので依存に含めない
  useEffect(() => {
    autoGrow();
    // unmount時・次のautoGrow実行(value変化での再実行)時のいずれもクリーンアップで確実にclearする
    return () => clearAutoGrowRetry();
  }, [value]);

  function trySubmit() {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    trySubmit();
  }

  // Enterで送信、Shift+Enterで改行(複数行入力対応)。IME変換確定のEnterでは送信しない。
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      trySubmit();
    }
  }

  const canSubmit = !disabled && value.trim().length > 0;
  const textareaPad = size === 'compact' ? 'px-3.5 pt-2 pb-0.5' : 'px-4.5 pt-2.5 pb-1';
  const actionsPad = size === 'compact' ? 'px-2 py-1.5' : 'px-2 py-2.5';
  // #138: 送信アイコンが小さくて視認性が悪かったので 16→18（compact は 14→16）へ上げた。
  // ボタンの外寸（btnSize）は据え置きなので、アクション行の高さやレイアウトは変わらない。
  const iconSize = size === 'compact' ? 16 : 18;
  const btnSize = size === 'compact' ? 'h-6.5 w-6.5' : 'h-7.5 w-7.5';

  return (
    // フォーカスリングは **器（form）側** に出す。中の textarea は枠も背景も持たない素の入力なので、
    // そこへリングを出すと入力欄の内側に矩形が浮いて見た目が壊れる（Input / Textarea が枠色の変化を
    // 器側に出しているのと同じ考え方）。
    // ⚠ focus-within は疑似クラスのぶん詳細度が一段高いので、flash 側の枠色指定に勝つ。フラッシュ中に
    // フォーカスが来た場合はフォーカス表示が優先される（意図どおり）。
    <form
      onSubmit={handleFormSubmit}
      className={twMerge(
        'flex flex-col rounded-card border border-solid bg-surface transition-[border-color,box-shadow] motion-reduce:transition-none duration-(--dur-fast) focus-within:outline-(length:--focus-ring-width) focus-within:outline-offset-(--focus-ring-offset) focus-within:outline-focus-ring',
        flash ? 'border-accent shadow-focus' : 'border-border',
        className,
      )}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        rows={1}
        autoComplete="off"
        className={`max-h-[120px] resize-none border-none bg-transparent font-body text-base leading-snug text-text outline-none placeholder:text-text-faint ${textareaPad}`}
      />
      <div className={`flex items-center justify-between gap-2 ${actionsPad}`}>
        <div className="flex items-center gap-0.5">{actions}</div>
        <button
          type="submit"
          aria-label={sendLabel}
          title={sendLabel}
          disabled={!canSubmit}
          className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-pill border-none bg-transparent p-0 transition-colors motion-reduce:transition-none duration-(--dur-fast) ${btnSize} ${
            canSubmit ? 'text-accent-soft' : 'text-text-dim'
          } enabled:hover:bg-tint-5 enabled:hover:text-accent-soft disabled:cursor-not-allowed disabled:forced-colors:text-[color:GrayText] disabled:opacity-35 focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring`}
        >
          <Icon name="send" size={iconSize} />
        </button>
      </div>
    </form>
  );
}
