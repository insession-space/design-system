// アバター（純粋 leaf UI）。画像があれば <img>、無ければ名前先頭1文字の fallback 円を出す。
// 先頭1文字ロジック・referrerPolicy="no-referrer"・fallback 分岐が4箇所で重複していたのを集約。
// 見た目クラス（.avatar / .auth-avatar 等）は文脈ごとに異なるため className で注入する
// （スタック重ね・アニメ・レスポンシブは各コンテキストの legacy CSS が供給する。段階移行）。
// 背景色（space-topbar は id から生成、account は既定）と寸法は props 注入（utils 非依存を保つ）。
export type AvatarProps = {
  // 表示名。先頭1文字を fallback 円に使う。
  name?: string | null;
  // アバター画像 URL。あれば画像を優先。
  src?: string | null;
  // name が空のときのフォールバック文字ソース（例: email）。
  fallback?: string | null;
  // fallback 円の背景色（CSS 色。省略時はクラス側の既定色）。
  bgColor?: string;
  // 円の寸法（px）。Modal の width と同様に inline style で当てる。省略時はクラス側の寸法。
  size?: number;
  // 文脈クラス（'avatar' / 'auth-avatar' など）。img/fallback 両方に付く。
  className?: string;
  // fallback 円だけに足すクラス（例 'auth-avatar-fallback' で既定背景を供給）。
  fallbackClassName?: string;
  alt?: string;
};

export default function Avatar({
  name,
  src,
  fallback,
  bgColor,
  size,
  className = '',
  fallbackClassName = '',
  alt = '',
}: AvatarProps) {
  const dim = size != null ? { width: size, height: size } : undefined;
  if (src) {
    return (
      <img className={className} src={src} alt={alt} referrerPolicy="no-referrer" style={dim} />
    );
  }
  const initial = [...(name || fallback || '?')][0].toUpperCase();
  return (
    <span
      className={`${className} ${fallbackClassName}`.trim()}
      style={bgColor ? { ...dim, background: bgColor } : dim}
    >
      {initial}
    </span>
  );
}
