// 動画1件の行UI（純粋 leaf）。ボタンの title ラベルは i18n を持ち込まず props で注入する。
type VideoItemProps = {
  videoId: any;
  title?: any;
  meta?: any;
  onClick?: any;
  onPlay?: any;
  onQueue?: any;
  onRemove?: any;
  // ボタンの title（ツールチップ）。呼び出し側が i18n の t() で解決して渡す。
  playLabel?: string;
  queueLabel?: string;
  removeLabel?: string;
  dnd?: any;
  dragging?: any;
  dragOver?: any;
  dragOverEnd?: any;
};

export default function VideoItem({
  videoId,
  title,
  meta,
  onClick,
  onPlay,
  onQueue,
  onRemove,
  playLabel,
  queueLabel,
  removeLabel,
  dnd,
  dragging,
  dragOver,
  dragOverEnd,
}: VideoItemProps) {
  return (
    <li
      className={
        `video-item${onClick ? ' clickable' : ''}` +
        `${dnd ? ' draggable' : ''}${dragging ? ' dragging' : ''}` +
        `${dragOver ? ' drag-over' : ''}${dragOverEnd ? ' drag-over-end' : ''}`
      }
      onClick={onClick}
      onClickCapture={dnd?.onClickCapture}
    >
      {dnd && (
        <span className="drag-handle" aria-hidden="true" onPointerDown={dnd.onPointerDown}>
          ⠿
        </span>
      )}
      <img className="video-thumb" src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`} alt="" />
      <span className="video-item-info">
        <span className="video-item-title">{title || videoId}</span>
        <span className="video-item-meta">{meta}</span>
      </span>
      {onPlay && (
        <button
          type="button"
          className="play-btn"
          title={playLabel}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
        >
          ▶
        </button>
      )}
      {onQueue && (
        <button
          type="button"
          className="queue-btn"
          title={queueLabel}
          onClick={(e) => {
            e.stopPropagation();
            onQueue();
          }}
        >
          ＋
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          className="remove-btn"
          title={removeLabel}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ×
        </button>
      )}
    </li>
  );
}
