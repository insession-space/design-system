import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useRef,
} from 'react';
import Icon from '../icons/icon.tsx';
import { twMerge } from '../lib/tw-merge.ts';

// 折りたたみリスト（アコーディオン）。「一覧の各行を要約1行に圧縮し、開いた1件だけが中身を出す」
// という形を提供する。スレッド一覧・FAQ・設定のセクションなど、件数が増えてもページの縦の長さを
// ほぼ一定に保ちたい場面で使う。
//
// ── ドメイン語彙を持たない ─────────────────────────────
// 発端は「コミュニティのトピック（スレッド）が縦に無限に伸びる」という課題だが、DS は
// トピック/返信/リアクションといったプロダクト固有の語彙を持たない。ここが規定するのは
// 「ヘッダ（leading / title / summary / meta）＋展開部」という**器と余白と開閉の作法**だけで、
// 中に何を差すか（Avatar・AvatarStack・Chip・Input …）は呼び出し側が決める。
//
// ── 完全な制御コンポーネント ────────────────────────────
// 開閉 state は内部に持たず `value` / `onChange` で外から与える。どのトピックが開いているかは
// アプリの状態（URL に載せる/載せない、他の操作で閉じる等）と絡むため、DS が握らない。
// `value` は「開いている item の id、無ければ null」なので、**単一開閉であることが型で保証される**
// （複数開ける mode='multiple' は今回スコープ外。将来 API を壊さず足せるよう型だけ用意する）。
// `value` / `onChange` は Accordion↔AccordionItem 間だけの内部 context で配る。消費側に Provider を
// 要求しない純粋 leaf である点は他のプリミティブと同じ。
//
// ── Base UI の Accordion に委譲しない理由 ──────────────────
// このパッケージは Tabs 等を Base UI へ寄せているが、Accordion はここでは自前で持つ:
//   1. Base UI の Accordion は APG のガイダンス更新に追随して**ローミングフォーカスを廃止**した
//      （`loopFocus` / `orientation` が deprecated で「キーボードフォーカスの挙動に影響しない」）。
//      ここが要求する ↑ ↓ / Home / End での item 間移動は、いずれにせよ自前で書くことになる。
//   2. 高さのアニメーションを grid-template-rows 0fr→1fr で行う（中身の高さを測らずに済み、
//      画像やフォントの遅延読み込みで高さが変わってもズレない）。Base UI の Panel は
//      `--accordion-panel-height` を実測して当てる方式なので、両者は噛み合わない。
// 委譲で得られるはずだった aria 配線（aria-expanded / aria-controls / role="region"）は
// 40 行程度なので、上記2点を犠牲にしてまで寄せる利得が無い。

type AccordionContextValue = {
  value: string | null;
  onChange: (value: string | null) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

// 開閉の対象になるヘッダ button の目印。キーボード移動の探索に使う。data-* にしておくと、
// className を消費側が差し替えても探索が壊れない。
const TRIGGER_ATTR = 'data-accordion-trigger';
// Accordion 自身の目印。展開部にさらに Accordion を差せる（ネストできる）ので、キーボード移動の
// 対象は「この root を最も近い Accordion に持つ trigger」だけに絞る必要がある。
const ROOT_ATTR = 'data-accordion-root';

// ヘッダの左右 padding と leading↔本文の間隔。展開部の字下げをヘッダ本文の左端に合わせるため、
// クラス名(px-[18px] / gap-3)と同じ値をここからも参照する。
const HEADER_PADDING_X = 18;
const HEADER_GAP = 12;

export type AccordionProps = {
  // 開いている item の `itemId`。`null` で全閉。制御コンポーネントなので必須。
  value: string | null;
  onChange: (value: string | null) => void;
  // 単一開閉のみ。'multiple' は今回スコープ外（型だけ用意し、実装は持たない）。
  mode?: 'single';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<ComponentProps<'div'>, 'className' | 'children' | 'style' | 'onChange'>;

export function Accordion({
  value,
  onChange,
  // mode は将来の 'multiple' 追加時に呼び出し側の分岐を増やさないための予約。現状は読まない。
  mode: _mode = 'single',
  children,
  className = '',
  onKeyDown,
  ...rest
}: AccordionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // ↑ ↓ / Home / End で item 間をフォーカス移動する（WAI-ARIA APG の Accordion パターン）。
  // ハンドラは root に置くが、**フォーカスがヘッダ button 上にあるときだけ**反応する。展開部に
  // Input やリストを差したとき、その中での矢印キーを奪わないため。
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // 呼び出し側の onKeyDown を先に通す。これを踏み潰すと、消費側が onKeyDown を1つ渡しただけで
      // キーボード操作が消える（逆に、呼び出し側が preventDefault したらこちらは何もしない）。
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const { key } = event;
      if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;

      const root = rootRef.current;
      if (!root) return;

      // ネストした Accordion では内側の root のハンドラが先に走る。ここで「origin にとって最も近い
      // Accordion がこの root か」を見て、そうでなければ外側は何もしない（内側の移動を尊重する）。
      const origin = (event.target as HTMLElement | null)?.closest(`[${TRIGGER_ATTR}]`);
      if (!origin || origin.closest(`[${ROOT_ATTR}]`) !== root) return;

      // disabled な item は移動先から外す（button の disabled はフォーカス不能なので、当てても
      // 「押せないところで詰まる」だけになる）。内側の Accordion の trigger も同様に外す。
      const triggers = Array.from(
        root.querySelectorAll<HTMLButtonElement>(`[${TRIGGER_ATTR}]:not(:disabled)`),
      ).filter((t) => t.closest(`[${ROOT_ATTR}]`) === root);
      if (triggers.length === 0) return;

      const current = triggers.indexOf(origin as HTMLButtonElement);
      let next: number;
      if (key === 'Home') {
        next = 0;
      } else if (key === 'End') {
        next = triggers.length - 1;
      } else if (current === -1) {
        return;
      } else {
        // 端は反対側へ回り込む（APG の推奨は任意だが、件数が多い一覧では末尾↔先頭の移動が効く）。
        next =
          key === 'ArrowDown'
            ? (current + 1) % triggers.length
            : (current - 1 + triggers.length) % triggers.length;
      }

      event.preventDefault();
      triggers[next]?.focus();
    },
    [onKeyDown],
  );

  return (
    <AccordionContext.Provider value={{ value, onChange }}>
      {/* onKeyDown をこの div に置くのはイベントの委譲のためで、この div 自身は操作対象ではない
          （実際にフォーカスを受けて押されるのは子のヘッダ button）。 */}
      <div
        ref={rootRef}
        {...{ [ROOT_ATTR]: '' }}
        onKeyDown={handleKeyDown}
        className={twMerge('flex flex-col gap-2.5', className)}
        {...rest}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// ⚠ `leading` / `title` / `summary` / `meta` はヘッダの <button> の中に入る。<button> の content
// model は phrasing content なので、これらのスロットに <div> / <p> / 見出しや、ボタン・リンクなどの
// 対話的な要素を差してはいけない（前者は不正な HTML、後者は入れ子の対話要素になる）。DS の
// Avatar / AvatarStack / Badge / Lozenge / CountChip はいずれも span 系なのでそのまま置ける。
// 対話的なものは開いたあとの `children`（<button> の外）に置く。
export type AccordionItemProps = {
  // この item を識別する値。Accordion の `value` と突き合わせて開閉が決まる。
  // DOM の `id` 属性とは別物なので、名前を分けている。
  // 1つの Accordion の中で**一意**であること（React の key と同じ約束事。重複すると
  // `value` が両方に一致して同時に開き、単一開閉が崩れる）。
  itemId: string;
  // ヘッダ左のメディア領域。`<Avatar …/>` を想定するが、器のサイズは呼び出し側が決める。
  leading?: ReactNode;
  // `leading` の幅(px)。展開部の字下げをヘッダ本文の左端に揃えるためだけに使う（レイアウトは
  // スロットの実寸で決まるので、ここを変えても leading 自体の大きさは変わらない）。既定は
  // Avatar の既定寸法に合わせた 40。`leading` が無いときは無視される。
  leadingWidth?: number;
  // 1行目。名前・時刻・バッジなど。
  title: ReactNode;
  // ヘッダを包む見出しの階層。WAI-ARIA APG の Accordion パターンはヘッダ button を見出し要素で
  // 包むことを求めており（スクリーンリーダーの見出しナビゲーションの対象にするため）、適切な
  // 階層はページの見出し構造次第なので呼び出し側が決める。見た目は階層によらず変わらない。
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  // 2行目。閉じているとき `summaryLines` 行でクランプし、開くと全文を出す。
  summary?: ReactNode;
  // 3行目。AvatarStack・件数・リアクションなどのメタ行。
  meta?: ReactNode;
  // 閉じているときの `summary` のクランプ行数。
  summaryLines?: number;
  // 開いたときに出る中身。
  // ⚠ **閉じていてもマウントされたまま**である（開閉を高さのアニメーションで見せるには中身が
  // DOM に居る必要があるため。閉じている間は visibility:hidden なので、支援技術とタブ順からは
  // 外れる）。したがって、中身が重い / フォーム部品を含む / マウント時に副作用がある場合は、
  // **呼び出し側が open 状態を見て条件付きで描く**こと。DS はここを勝手にアンマウントしない
  // （閉じるアニメーションの途中で中身が消えるため）。
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
} & Omit<ComponentProps<'div'>, 'className' | 'children' | 'style' | 'title'>;

export function AccordionItem({
  itemId,
  leading,
  leadingWidth = 40,
  title,
  headingLevel = 3,
  summary,
  meta,
  summaryLines = 2,
  children,
  disabled = false,
  className = '',
  ...rest
}: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('AccordionItem は Accordion の中でのみ使えます。');
  }

  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const panelId = `${reactId}-panel`;
  // disabled な item は、親が誤って `value` に指すことがあっても開かない。開閉の唯一の入口である
  // ヘッダ button が押せない以上、閉じたまま留まるのが一貫した振る舞いになる。
  const open = ctx.value === itemId && !disabled;
  // APG の Accordion パターンに従い、ヘッダ button を見出しで包む。見出しは器でしかないので
  // 既定の余白と字面を打ち消し、見た目は button の中身が決める（プリフライト未使用のため
  // ブラウザ既定の margin / font-size が残る。ここで明示的に潰す）。
  const Heading = `h${headingLevel}` as 'h3';

  return (
    <div
      // overflow-hidden は展開部の角が枠からはみ出すのを防ぐ。開いている間は枠を一段強くして、
      // 「どれが開いているか」を色の差だけで伝える（位置や影を動かさない）。
      className={twMerge(
        'overflow-hidden rounded-card border border-solid bg-surface transition-colors motion-reduce:transition-none duration-(--dur-fast)',
        open ? 'border-border-strong' : 'border-border',
        className,
      )}
      {...rest}
    >
      <Heading className="m-0 font-body text-base font-normal leading-none">
        <button
          type="button"
          id={triggerId}
          {...{ [TRIGGER_ATTR]: '' }}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => ctx.onChange(open ? null : itemId)}
          // shadow-none / hover:shadow-none / active:scale-100 は、プリフライト未使用のため露出する
          // legacy のグローバル button(glow)・button:active(scale) を打ち消す（Tabs と同じ理由。
          // 静止時にも当てないとホバー前から影が漏れる）。
          // min-h-11 = 44px でタップ領域の下限を満たす。モバイルは padding を 14px 均等に落とす。
          className="flex min-h-11 w-full cursor-pointer items-start gap-3 border-none bg-transparent px-[18px] py-4 text-left shadow-none transition-colors motion-reduce:transition-none duration-(--dur-fast) hover:bg-surface-hover hover:shadow-none active:scale-100 focus-visible:shadow-focus focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:forced-colors:text-[color:GrayText] disabled:opacity-(--disabled-opacity) disabled:hover:bg-transparent max-[480px]:p-3.5"
        >
          {/* ヘッダの器を全て <span> にしているのは、<button> の content model が phrasing content
              で、<div> を入れると HTML として不正になるため（ブラウザは許容するが仕様違反）。
              同じ理由で leading / title / summary / meta のスロットにも <div> や <p> を差さない
              （Avatar・Badge・Chip 等の DS プリミティブはいずれも span 系なのでそのまま置ける）。 */}
          {leading && <span className="shrink-0 self-start">{leading}</span>}
          {/* min-w-0 が無いと flex の既定(min-width:auto)により子のクランプ/truncate が効かない。 */}
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-body text-sm font-bold text-text">
              {title}
            </span>
            {summary && (
              // クランプは行数が props で変わるためユーティリティにできない（動的クラス生成は禁止）。
              // 開いているときは style を外して全文に戻す。
              <span
                className="font-body text-sm text-text-dim"
                style={
                  open
                    ? { display: 'block' }
                    : {
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: summaryLines,
                        overflow: 'hidden',
                      }
                }
              >
                {summary}
              </span>
            )}
            {meta && (
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-body text-xs text-text-faint">
                {meta}
              </span>
            )}
          </span>
          <Icon
            name={open ? 'expand_less' : 'expand_more'}
            size={20}
            className="mt-0.5 shrink-0 text-text-dim"
          />
        </button>
      </Heading>
      {/* 高さのアニメーションと開閉時の可視/不可視は components.css の .accordion-panel が持つ
          （grid-template-rows 0fr→1fr。prefers-reduced-motion の抑制も同じ場所でまとめて行う）。
          閉じている間は visibility:hidden になるので、支援技術とタブ順から中身が外れる。 */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className="accordion-panel"
        data-open={open ? '' : undefined}
        // visibility が hidden になるのは閉じるアニメーションが終わってからなので、その間だけ中の
        // フォーカス可能要素が Tab で拾えてしまう。inert は即座に効くので、aria-expanded=false と
        // 実際に操作できるかを最初のフレームから一致させられる。
        inert={!open}
      >
        <div className="accordion-panel-clip">
          {/* 字下げ量はヘッダの左 padding(18px) + leading の幅 + ヘッダの gap(12px)。leading の幅は
              スロットなので DS からは分からず、`leadingWidth` で受ける（既定 40px = Avatar の既定寸法）。
              余白そのものは .accordion-panel-content が持つ（狭幅で字下げを解除する分岐込み）。 */}
          <div
            className="accordion-panel-content border-x-0 border-t border-b-0 border-solid border-border"
            style={
              leading
                ? ({
                    '--accordion-indent': `${HEADER_PADDING_X + leadingWidth + HEADER_GAP}px`,
                  } as CSSProperties)
                : undefined
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accordion;
