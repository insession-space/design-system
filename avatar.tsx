import type { CSSProperties, ReactNode } from 'react';

// アバター（純粋 leaf UI）。DS(claude design "INSESSION Design System" #663)の Avatar 仕様へ寄せる。
// 画像があれば <img>、無ければ名前先頭1文字（label 指定時はその文字列）の fallback 円を出す。
//
// 後方互換: 既存消費側（presence バー・space-card・account 等）は className / fallbackClassName で
// legacy の .avatar / .auth-avatar を注入して見た目・スタック重ね・アニメを得ているため、
// status / ring を使わない呼び出しは従来どおり素の img/span を返す（見た目を変えない）。
// DS 化: name→label / bgColor→color を別名として受け、status（右下の状態点）/ ring（surface 枠）を
// 追加。status/ring を使う（＝新 API）の呼び出しは token/props ベースの自己完結した DS 円を描く。
export type AvatarStatus = 'live' | 'offline';

export type AvatarProps = {
  // 表示ラベル（DS 名）。文字列ならそのまま円内に描く（呼び出し側が頭文字を渡す想定）。旧 `name` の別名。
  label?: ReactNode;
  // 表示名（旧名）。label が無ければ先頭1文字を fallback 円に使う。
  name?: string | null;
  // アバター画像 URL。あれば画像を優先。
  src?: string | null;
  // name が空のときのフォールバック文字ソース（例: email）。
  fallback?: string | null;
  // 円の背景色（DS 名。CSS 色）。旧 `bgColor` の別名。DS 経路で省略時は info(blue)。
  color?: string;
  // 円の背景色（旧名）。color が無ければこちらを使う。
  bgColor?: string;
  // 円の寸法（px）。省略時はクラス側の寸法（legacy）または 40（DS）。
  size?: number;
  // 右下の状態点。'live'=success / それ以外=text-dim。指定時は DS 円で描画する。
  status?: AvatarStatus;
  // surface 色の 2px 枠（スタック等での重なりの縁取り）。指定時は DS 円で描画する。
  ring?: boolean;
  // 文脈クラス（'avatar' / 'auth-avatar' など）。img/fallback 両方に付く（legacy 経路）。
  className?: string;
  // fallback 円だけに足すクラス（例 'auth-avatar-fallback' で既定背景を供給）。
  fallbackClassName?: string;
  alt?: string;
};

function initialOf(name?: string | null, fallback?: string | null): string {
  return [...(name || fallback || '?')][0].toUpperCase();
}

export default function Avatar({
  label,
  name,
  src,
  fallback,
  color,
  bgColor,
  size,
  status,
  ring,
  className = '',
  fallbackClassName = '',
  alt = '',
}: AvatarProps) {
  const bg = color ?? bgColor;
  const content = label != null ? label : initialOf(name, fallback);
  const ds = status != null || ring === true;

  // DS 経路: token/props ベースの自己完結した円（新 API 専用。legacy CSS に依存しない）。
  if (ds) {
    const dim = size ?? 40;
    const circleStyle: CSSProperties = {
      width: dim,
      height: dim,
      fontSize: dim * 0.4,
      ...(!src && bg ? { background: bg } : undefined),
    };
    return (
      <span
        className={`relative inline-flex shrink-0 ${className}`.trim()}
        style={{ width: dim, height: dim }}
      >
        <span
          className={`inline-flex items-center justify-center overflow-hidden rounded-pill font-bold text-white ${
            src ? 'bg-transparent' : bg ? '' : 'bg-info'
          } ${ring ? 'border-2 border-solid border-surface' : ''}`.trim()}
          style={circleStyle}
        >
          {src ? (
            <img
              src={src}
              alt={alt || (typeof label === 'string' ? label : name || '')}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            content
          )}
        </span>
        {status != null && (
          <span
            aria-hidden="true"
            className={`absolute right-0 bottom-0 rounded-pill border-2 border-solid border-surface ${
              status === 'live' ? 'bg-success' : 'bg-text-dim'
            }`}
            style={{ width: dim * 0.28, height: dim * 0.28 }}
          />
        )}
      </span>
    );
  }

  // legacy 経路: 見た目は className / fallbackClassName（.avatar 等）が供給する。従来と同一。
  const dim = size != null ? { width: size, height: size } : undefined;
  if (src) {
    return (
      <img className={className} src={src} alt={alt} referrerPolicy="no-referrer" style={dim} />
    );
  }
  return (
    <span
      className={`${className} ${fallbackClassName}`.trim()}
      style={bg ? { ...dim, background: bg } : dim}
    >
      {content}
    </span>
  );
}

// DS の AvatarStack（+N overflow）。people を size*0.3 だけ重ね、max を超えた分は +N の中立トークンで示す。
// presence 表示などの将来集約先（token/props ベース。legacy .avatar-stack CSS には依存しない）。
export type AvatarStackPerson = {
  label?: ReactNode;
  name?: string | null;
  src?: string | null;
  color?: string;
  bgColor?: string;
};

export type AvatarStackProps = {
  people?: AvatarStackPerson[];
  max?: number;
  size?: number;
  className?: string;
};

export function AvatarStack({ people = [], max = 4, size = 40, className = '' }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const overlap = -(size * 0.3);
  return (
    <span className={`inline-flex items-center ${className}`.trim()}>
      {shown.map((p, i) => (
        <span key={i} style={{ marginLeft: i ? overlap : 0 }} className="inline-flex rounded-pill">
          <Avatar {...p} size={size} ring />
        </span>
      ))}
      {extra > 0 && (
        <span
          style={{ marginLeft: overlap, width: size, height: size, fontSize: size * 0.32 }}
          className="inline-flex items-center justify-center rounded-pill border-2 border-solid border-surface bg-surface-3 font-bold text-text-dim"
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
