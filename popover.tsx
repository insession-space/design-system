import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useDismiss } from './use-dismiss.ts';

// ポップオーバーの共通基盤（純粋 leaf UI）。トリガーとフローティングパネルを相対配置でまとめ、
// 外側クリック / Escape での close を内包する（useDismiss）。個別に mousedown+keydown を張って
// いた space-topbar / notification-bell / message-action-bar / sticker-picker / video-search-box を
// 将来この一本へ寄せられる API にする。open 制御は呼び出し側（controlled）。i18n は持たない。
export type PopoverPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export type PopoverProps = {
  open: boolean;
  onClose: () => void;
  // 開閉トリガー（呼び出し側が open をトグルするボタン等）。相対配置の基準にもなる。
  trigger: ReactNode;
  children: ReactNode;
  placement?: PopoverPlacement;
  ariaLabel?: string;
  // role。メニューを載せるときは 'menu'（既定）、それ以外の内容は 'dialog' 等に。
  role?: string;
  // パネル（浮く面）に足す追加クラス（幅・最大高さ等の文脈調整用）。
  panelClassName?: string;
  // パネルの影ユーティリティ。既定は DS の popover 影（UserMenu/🧩 スイッチャーと同じ。#867）。
  panelShadow?: string;
  // 既定の内側 padding(p-3) を出すか。ヘッダー/リストが独自 padding を持つ通知センターのような
  // パネルは false にして呼び出し側で表現する（既定 true = 従来挙動）。
  panelPadding?: boolean;
  // 既定の最大高さ(max-h-80) + 内部スクロールを出すか。呼び出し側で独自の高さ/内部スクロール
  // (例: ヘッダー固定+リストだけスクロール)を組みたい場合は false にする（既定 true = 従来挙動）。
  panelScroll?: boolean;
  // max-sm でトリガー追従（placement アンカー）をやめ、position:fixed + 左右対称ガター(12px)で
  // ビューポートに固定するモバイルシート表示にする。上端はトリガー直下に合わせる。sm 以上は
  // 従来どおり placement 通りのトリガー追従。既定 false（他 consumer の従来挙動は不変）。
  mobileSheet?: boolean;
  // true でパネルを createPortal で document.body 直下へ出し、position:fixed +
  // トリガーの getBoundingClientRect() 実測で配置する。overflow:hidden/auto な親（例:
  // スクロールする一覧パネル）にクリップされたくない場合に使う(#885)。既定 false = 従来の
  // absolute（トリガー追従・親に内包される）挙動を完全維持。mobileSheet と同時指定時は
  // mobileSheet を優先する（モバイルの固定シート表示はそのまま。破壊しない）。
  portal?: boolean;
  closeOnEsc?: boolean;
  closeOnOutside?: boolean;
};

// 8px オフセットは下の PORTAL_OFFSET_PX と値を揃えてある(非 portal 版と portal 版で見た目の
// 間隔を一致させるため)。どちらか一方を変えたら必ずもう一方も変えること。
const PLACEMENT: Record<PopoverPlacement, string> = {
  'bottom-start': 'top-[calc(100%+8px)] left-0',
  'bottom-end': 'top-[calc(100%+8px)] right-0',
  'top-start': 'bottom-[calc(100%+8px)] left-0',
  'top-end': 'bottom-[calc(100%+8px)] right-0',
};

// パネル本体の見た目（面・境界・角丸・入場アニメ）。位置と影は呼び出し側の設定で足す。z-index は
// portal 有無で変わる（下記 zIndexClass）ためここには含めない。
// max-w は mobileSheet の左右ガター(12px×2=24px)と揃え、mobileSheet を使わない呼び出し側でも
// 極小幅のビューポートで横にはみ出さないようにする(#867)。
const PANEL_BASE =
  'min-w-[220px] max-w-[calc(100vw-24px)] bg-surface border border-solid border-border-strong rounded-card animate-[card-in_var(--dur-base)_var(--ease-spring)_both]';

// portal 時の位置計算に使う定数(px)。トリガーとの間隔・ビューポート端からの最低ガター。
// PORTAL_OFFSET_PX は上の PLACEMENT の calc(100%+8px) と値を揃えてある。片方を変えたら
// もう片方も変えること。
const PORTAL_OFFSET_PX = 8;
const PORTAL_GUTTER_PX = 12;

// portal 時のフォーカス移動(open時の最初のfocusable探索・下記フォーカストラップ)で共通して使う
// focusable 要素セレクタ。1箇所にまとめて open/Tab トラップの判定基準がズレないようにする。
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// 指摘5(#885 レビュー3周目): トリガーを直接内包する、overflow がクリップを起こしうる祖先
// (overflowX/overflowY が visible 以外)を探す。見つからなければビューポート自体を
// クリップ境界とみなす(null)。document.body/html はクリップ元として扱わない(ページ全体の
// スクロールはこれまで通りビューポート基準)。open のたびに一度だけ呼べば足りる
// (トリガーとその祖先の DOM 構造は開いている間変わらない前提)。
//
// 指摘5(#885 レビュー4周目): このループは overflow だけを見ており、`position: fixed`(や、
// containing block にならない `absolute` )の祖先を無視している。position:fixed な要素は
// ビューポートを基準に配置され、祖先の overflow:hidden にクリップされない仕様のため、
// そのような祖先を「クリップ境界」と誤認すると、無関係な祖先の矩形とトリガーが交差しなく
// なるたびに理由なくパネルが消えてしまう。position:fixed に到達したらそこで探索を打ち切り
// 「クリップ元なし(ビューポート基準)」として扱う。
// なお、このループは「最も近いクリッパー1つ」しか見ないため、入れ子になった複数の overflow
// クリッパー(祖先A の中に祖先B があり、どちらも独立してクリップしうるケース)は検出できない
// (現状の唯一の portal consumer は `.cp-popover` 自身が最初に見つかるクリッパーで探索が
// そこで止まるため未到達。将来 portal consumer が増えたら要検討)。
function getScrollClipAncestor(el: Element | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (style.position === 'fixed') return null;
    if (style.overflowY !== 'visible' || style.overflowX !== 'visible') return node;
    node = node.parentElement;
  }
  return null;
}

export default function Popover({
  open,
  onClose,
  trigger,
  children,
  placement = 'bottom-start',
  ariaLabel,
  role = 'menu',
  panelClassName = '',
  panelShadow = 'shadow-popover',
  panelPadding = true,
  panelScroll = true,
  mobileSheet = false,
  portal = false,
  closeOnEsc = true,
  closeOnOutside = true,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // 指摘6(#885 レビュー3周目): portal でパネルが document.body 直下へ移り、トリガーの直後の
  // 兄弟でなくなる(DOM 隣接性が失われる)ため、支援技術へ関連を明示するための安定 id。
  // useId() はコンポーネントインスタンスごとに一意なので複数の Popover が同時に開いても衝突しない。
  const panelId = useId();
  // mobileSheet はトリガー追従をやめる既存挙動なので、同時指定時は mobileSheet を優先する
  // （#885。portal はトリガー追従の実測配置なので mobileSheet の固定シート表示とは両立しない）。
  const effectivePortal = portal && !mobileSheet;

  // 外側クリック判定: 通常はラッパー(トリガー+パネル)の ref 1つで足りるが、portal 時はパネルが
  // document.body 直下に出て DOM 上ラッパーの子でなくなるため、パネル自身の ref も渡して
  // 「どちらにも含まれないクリック」だけを外側と判定する（use-dismiss.ts の二重 ref containment）。
  const dismissRefs = useMemo(() => (effectivePortal ? [ref, panelRef] : ref), [effectivePortal]);
  useDismiss(open, dismissRefs, onClose, { closeOnEsc, closeOnOutside });

  // モバイルシートは position:fixed なので上端をトリガー直下に固定するため実測する
  // （トップバー高さがページで異なり静的値を置けない）。max-sm 以外・非表示時は使わない。
  const [sheetTop, setSheetTop] = useState(0);
  useLayoutEffect(() => {
    if (!open || !mobileSheet) return undefined;
    const measure = () => {
      const el = ref.current;
      if (el) setSheetTop(el.getBoundingClientRect().bottom + 8);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, mobileSheet]);

  // portal 時の位置(fixed の top/left)。トリガーの実測 rect + パネル自身の実測サイズから
  // placement の意味(absolute 版と同じ: bottom/top はトリガーとの上下関係、start/end は
  // 左右どちらの端を揃えるか)を再現し、ビューポート外にはみ出す場合はガター分クランプする。
  // null の間はまだ未測定 = 画面外(見えない位置)に置いて初期フレームのちらつきを防ぐ。
  const [portalPos, setPortalPos] = useState<{ top: number; left: number } | null>(null);
  // 指摘5(#885 レビュー3周目): トリガーが自身を内包するスクロールコンテナ(例: 参加者一覧の
  // .cp-popover。max-height+overflow-y:auto)の外へスクロールで隠れたかどうか。portal 化で
  // 親の overflow によるクリップから popover 自体は解放された結果、トリガーだけがクリップされて
  // 見えなくなっても popover は最後に計算した位置に浮いたまま追従し続けてしまう(修正前の
  // portal化が新たに持ち込んだ退行。トリガーごと隠れていた従来の absolute 版には存在しない)。
  const [triggerClipped, setTriggerClipped] = useState(false);
  useLayoutEffect(() => {
    if (!open || !effectivePortal) {
      setPortalPos(null);
      setTriggerClipped(false);
      return undefined;
    }
    // クリップ境界は開いている間の DOM 構造では変わらない前提なので、スクロールのたびではなく
    // 開いたときに一度だけ特定する(getComputedStyle は高コストなので rAF ループ内で毎回呼びたくない)。
    const clipAncestor = getScrollClipAncestor(ref.current);
    const compute = () => {
      const triggerEl = ref.current;
      const panelEl = panelRef.current;
      if (!triggerEl || !panelEl) return;
      const triggerRect = triggerEl.getBoundingClientRect();
      // offsetWidth/offsetHeight は border-box のレイアウト値で CSS transform を含まない。
      // getBoundingClientRect() だと PANEL_BASE の入場アニメ(card-in: scale(0.97)から開始)の
      // 影響でマウント直後の実寸より小さい値を掴んでしまい、位置がズレたまま固定される(#885)。
      const panelWidth = panelEl.offsetWidth;
      const panelHeight = panelEl.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // 指摘5: トリガーがクリップ境界(スクロールコンテナ、無ければビューポート)と全く重ならなく
      // なったら「見えなくなった」とみなす。部分的にでも重なっていれば従来通り可視として扱う
      // (グリッド境界ぎりぎりで揺れるだけの一瞬をチラつかせないため)。
      const clipRect = clipAncestor
        ? clipAncestor.getBoundingClientRect()
        : { top: 0, left: 0, right: vw, bottom: vh };
      const clipped =
        triggerRect.bottom <= clipRect.top ||
        triggerRect.top >= clipRect.bottom ||
        triggerRect.right <= clipRect.left ||
        triggerRect.left >= clipRect.right;
      setTriggerClipped((prev) => (prev === clipped ? prev : clipped));

      let top = placement.startsWith('bottom')
        ? triggerRect.bottom + PORTAL_OFFSET_PX
        : triggerRect.top - PORTAL_OFFSET_PX - panelHeight;
      let left = placement.endsWith('end') ? triggerRect.right - panelWidth : triggerRect.left;

      const maxLeft = Math.max(PORTAL_GUTTER_PX, vw - panelWidth - PORTAL_GUTTER_PX);
      const maxTop = Math.max(PORTAL_GUTTER_PX, vh - panelHeight - PORTAL_GUTTER_PX);
      left = Math.min(Math.max(left, PORTAL_GUTTER_PX), maxLeft);
      top = Math.min(Math.max(top, PORTAL_GUTTER_PX), maxTop);

      // 値が変わらないなら前の参照を返し、無変化の再レンダリングを避ける(#885)。capture:true の
      // window scroll は文書内のあらゆるスクロールを拾うため、これが無いと無関係なスクロールの
      // たびに毎回新しいオブジェクトで再レンダリングが走ってしまう。
      setPortalPos((p) => (p && p.top === top && p.left === left ? p : { top, left }));
    };
    compute();
    // resize/scroll は rAF で間引く(#885)。scroll は capture:true のため文書内のあらゆる
    // スクローラ(チャットログ・キュー一覧・自パネルの overflow-y:auto 等)の全スクロールを拾い、
    // 素通しだと compute() のレイアウト計測(getBoundingClientRect 等)がイベントの数だけ走って
    // しまう。同一フレーム内の複数発火を1回のcompute()にまとめる。
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    // パネル自身のサイズ変化(#885)。fetch解決前後でパネルの内容が差し替わり高さが変わる
    // consumer(MemberProfileCard: ローディング表示→取得後のbio/バッジ入りカード)があり、
    // それは resize/scroll のどちらのイベントも発生させない。ResizeObserver でパネル本体の
    // border-box 変化を直接観測し、変化のたびに実測し直して top/left を追従させる。これが無いと
    // 計測時の小さい高さでクランプ判定が確定してしまい、後から伸びた分だけビューポート外へ
    // はみ出す(bottom-*)/トリガーを覆う(top-*)まま固定されてしまう。初回位置を1フレーム遅らせ
    // ないよう、ResizeObserver のコールバックは schedule ではなく compute を直接呼ぶ。
    const panelEl = panelRef.current;
    let ro: ResizeObserver | undefined;
    if (panelEl) {
      ro = new ResizeObserver(compute);
      ro.observe(panelEl);
    }
    return () => {
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open, effectivePortal, placement]);

  // 指摘6(#885 レビュー3周目): portal 時は open のたびにパネル内へ focus を移し、閉じたら
  // トリガーへ戻す。旧実装(非 portal)はパネルがトリガー直後の兄弟だったため、アバターボタンから
  // Tab するだけで自然にカード内(フォローボタン等)へ入れたが、portal 化で document.body 末尾に
  // 移った結果 Tab がページ末尾まで飛ぶようになった(#885 で新たに生じた退行)。role="menu"(既定)
  // の非 portal consumer 5箇所(forum-switcher / app-shell / notification-bell /
  // Popover.stories / admin icon-rail)はいずれも portal を指定していないため、この effect は
  // effectivePortal でガードして portal consumer(現状 MemberProfileCard の role="dialog" のみ)
  // に限定し、既存挙動を一切変えない。
  //
  // open/close と「実際に focus を移す」を2つの effect に分けている理由: 開いた直後の1フレーム目は
  // portalPos がまだ null で panelStyle が visibility:hidden(#885 の未測定時フォールバック)を
  // 返す。visibility:hidden の要素は仕様上フォーカス対象にならず focus() が黙って失敗するため、
  // portalPos が確定してから(=可視になってから)focus を移す必要がある。ただし portalPos は
  // リサイズ/スクロールのたびに再計算され続けるので、そのたびに focus し直すとカーソルが
  // カクカク奪われる。そこで「開いていた間に一度だけ動かす」を focusMovedRef で保証する。
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusMovedRef = useRef(false);
  useLayoutEffect(() => {
    if (!open || !effectivePortal) return undefined;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    focusMovedRef.current = false;
    return () => {
      // 閉じたときトリガー(またはトリガー内の元々フォーカスされていた要素)へ戻す。フォーカスが
      // body へ落ちると Tab 順が失われるため。ただし「フォーカスがパネル内にあった場合だけ」に
      // 限定する必要がある(指摘2 #885 レビュー4周目)。cleanup 実行時点でパネルは既に DOM から
      // 削除済みのため、パネル内にフォーカスがあったなら document.activeElement は body に
      // 落ちている。この判定を欠くと、ユーザーが MiniProfile を開いたまま Tab/クリックで
      // 無関係な要素(例: チャット入力欄)へ移った後、consumer 側の都合で popover が閉じた
      // (例: 対象メンバーの退室で expandedId がクリアされる)ときに、入力中のフォーカスを
      // 奪ってトリガーへ引き戻してしまう。Radix / react-aria と同じ判定。
      const prev = previousFocusRef.current;
      if (focusMovedRef.current && document.activeElement === document.body && prev?.isConnected) {
        prev.focus({ preventScroll: true });
      }
      previousFocusRef.current = null;
    };
  }, [open, effectivePortal]);
  useLayoutEffect(() => {
    if (!open || !effectivePortal || !portalPos || triggerClipped || focusMovedRef.current)
      return undefined;
    const panelEl = panelRef.current;
    if (!panelEl) return undefined;
    // フォーカス可能な最初の子要素(フォローボタン等)へ入れる。無ければパネル自身(tabIndex=-1
    // を付けてある)へ focus し、少なくとも Escape でパネルを閉じられる状態にする。
    const focusable = panelEl.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable ?? panelEl).focus({ preventScroll: true });
    // 指摘4(#885 レビュー4周目): focus() の成否を実際に確認してからラッチする。triggerClipped
    // (visibility:hidden で focus 不可)のガードを上に足したので現行 UI では通らないが、将来
    // programmatic open 等で portalPos 確定時点でも focus に失敗しうるケースに備え、
    // 「本当にパネル内へ移せた場合だけ」フラグを立てる(失敗時にラッチされたままだと、後から
    // 可視になっても二度と focus が入らなくなる)。
    focusMovedRef.current = panelEl.contains(document.activeElement);
    return undefined;
  }, [open, effectivePortal, portalPos, triggerClipped]);

  // 「出口」のフォーカス退行(#885)への対処: portal 化でパネルが document.body 末尾に移った
  // ため、パネル内最後の要素から Tab すると(パネルの次にDOM上何もない=)ブラウザUIへ抜け、
  // 逆にパネル先頭から Shift+Tab してもトリガーへ戻らない(非 portal 時代はパネルがトリガー
  // 直後の兄弟だったため自然につながっていた)。
  //
  // 案A(パネル内フォーカストラップ)を採用し、案B(Tabで抜けたらトリガーへ戻す)は採らなかった。
  // 理由: 現状の唯一の portal consumer(MemberProfileCard)は role="dialog" で、かつ「参加者一覧
  // ポップオーバー(非 portal)がまだ開いている入れ子」の中に浮く。案Bだとパネル最後から Tab で
  // 参加者一覧ポップオーバーのトリガー(アバターボタン)へ戻ってしまい、続けて Tab すると参加者
  // 一覧の次の項目 → …と、開いている dialog の外の要素へフォーカスが漏れてしまう(WAI-ARIA の
  // dialog パターンとして期待される「閉じるまで dialog 内に留まる」に反する)。案Aならその漏れが
  // 起きず、Esc/外側クリックで MiniProfile だけ閉じる二段階 dismiss(既存)とも自然に噛み合う。
  // role="menu"(既定)の非 portal consumer 5箇所は portal を指定しないため effectivePortal が
  // false のまま=この effect も handleTabTrap も一切関与しない(挙動不変)。
  //
  // aria-modal="true" はあえて付けない: 本当に背景(参加者一覧)を inert にしているわけではなく
  // (裏の一覧は依然スクロール・フォーカス可能な要素を持つ)、trap しているのは Tab キー操作の
  // 範囲だけなので、aria-modal を付けると支援技術に「背景は完全に無効化されている」という
  // 不正確な情報を伝えてしまう。
  const handlePanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const panelEl = panelRef.current;
    if (!panelEl) return;
    const focusables = panelEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusables.length === 0) {
      // focusable な子が無い(パネル自身に tabIndex=-1 で focus している)場合は Tab 自体を
      // 無効化し、パネル自身に留める。
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      // 先頭要素、または(何らかの理由で)パネル外へフォーカスが逃げていた場合は末尾へ回す。
      if (active === first || !panelEl.contains(active)) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      }
    } else if (active === last || !panelEl.contains(active)) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  // 位置決め。通常は absolute でトリガー追従。mobileSheet は max-sm で fixed + 左右ガター、
  // sm 以上で placement 通りの absolute に戻す（sm: プレフィックスで上書き）。portal は
  // fixed + 上記 portalPos の実測値を inline style で当てる（クラスでは表現しない）。
  const smAnchor = PLACEMENT[placement]
    .split(' ')
    .map((c) => `sm:${c}`)
    .join(' ');
  const positioning = mobileSheet
    ? `fixed top-(--popover-sheet-top) left-3 right-3 w-auto sm:absolute sm:left-auto ${smAnchor}`
    : effectivePortal
      ? 'fixed'
      : `absolute ${PLACEMENT[placement]}`;

  // z-index: portal は body 直下に出るため、クリップ元の親パネル自身(参加者パネル等。
  // --z-dropdown を使用)より確実に手前へ出す専用トークンを使う。既存の z-(--z-dropdown) と
  // 同じ CSS変数参照記法ではなく `z-[var(--z-popover-portal,35)]` という
  // 任意値記法にしてあるのは、このパッケージの theme.css を import しない consumer(例:
  // products/insession/apps/help は自前で z スケールを定義し theme.css を読み込まない)で
  // --z-popover-portal が未定義になり、無指定の var() が invalid → z-index:auto に静かに
  // 落ちて背面に沈む事故を防ぐため(#885)。フォールバック値 35 は theme.css の
  // --z-popover-portal の定義値と揃えてある。
  const zIndexClass = effectivePortal ? 'z-[var(--z-popover-portal,35)]' : 'z-(--z-dropdown)';

  // 指摘5(#885): クリップされた間は「隠す」(visibility:hidden + pointer-events:none)を選び、
  // onClose() は呼ばない。理由: パネル内スクロールでトリガーが一瞬クリップ境界をまたぐたびに
  // onClose() すると、スクロールを少し戻しただけでは再表示されず(呼び出し側の state は既に
  // closed)ユーザーがもう一度アバターをクリックし直す必要が生じて体感が悪い。隠すだけにすれば
  // スクロールで戻ったときに compute() が自動で visibility を復帰させ、シームレスに再表示できる。
  // visibility:hidden の要素は仕様上ヒットテスト対象外(クリックは背後の要素へ通る)だが、念のため
  // pointer-events:none も明示して「隠れている間クリックを吸わない」ことを保証する。
  const panelStyle: CSSProperties | undefined = mobileSheet
    ? ({ '--popover-sheet-top': `${sheetTop}px` } as CSSProperties)
    : effectivePortal
      ? portalPos
        ? triggerClipped
          ? {
              top: portalPos.top,
              left: portalPos.left,
              visibility: 'hidden',
              pointerEvents: 'none',
            }
          : { top: portalPos.top, left: portalPos.left }
        : { top: -9999, left: -9999, visibility: 'hidden', pointerEvents: 'none' }
      : undefined;

  const panel = open && (
    <div
      ref={panelRef}
      // 指摘6: portal 時だけ安定 id を振り、下のトリガー側ラッパーの aria-owns から参照させる。
      // 非 portal 時は DOM 隣接性がそのまま関連を表すので id は付けない(従来どおり)。
      id={effectivePortal ? panelId : undefined}
      // 指摘6: portal 時はフォーカス可能な子が無いケースでもパネル自身へ focus できるように
      // tabIndex=-1 を付ける(プログラム的 focus のみ許可。Tab キーでは踏まない)。
      tabIndex={effectivePortal ? -1 : undefined}
      role={role}
      aria-label={ariaLabel}
      // 「出口」フォーカストラップ(上記コメント参照)。portal 時だけ Tab/Shift+Tab をパネル内で
      // ループさせる。非 portal consumer は effectivePortal===false のため onKeyDown 自体が
      // undefined になり一切影響しない。
      onKeyDown={effectivePortal ? handlePanelKeyDown : undefined}
      className={`${PANEL_BASE} ${zIndexClass} ${panelScroll ? 'max-h-80 overflow-y-auto' : ''} ${panelPadding ? 'p-3' : ''} ${positioning} ${panelShadow} ${panelClassName}`.trim()}
      style={panelStyle}
    >
      {children}
    </div>
  );

  return (
    <div
      className="relative inline-flex"
      ref={ref}
      // 指摘6: portal でパネルが document.body 直下へ出て DOM 上トリガーの兄弟でなくなるため、
      // aria-owns でトリガー(を含むこのラッパー)とパネルの関連を支援技術へ明示する。
      aria-owns={effectivePortal && open ? panelId : undefined}
    >
      {trigger}
      {effectivePortal ? (panel ? createPortal(panel, document.body) : null) : panel}
    </div>
  );
}
