function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function VideoCard({ video, onSelect }) {
  return (
    <button className="video-card" onClick={() => onSelect(video)}>
      <div className="thumb-wrapper">
        <img src={video.thumbnail} alt={video.title} loading="lazy" />
      </div>
      <div className="video-info">
        <p className="video-title">{video.title}</p>
        <p className="video-date">{formatDate(video.publishedAt)}</p>
      </div>
    </button>
  );
}
