// src/App.jsx
import { useEffect, useState, useCallback } from "react";
import { fetchChannelVideos, resolveChannel } from "./youtube";
import { getSavedChannels, saveChannel, removeChannel } from "./channelStore";
import ChannelList from "./ChannelList";
import VideoCard from "./VideoCard";
import VideoPlayer from "./VideoPlayer";

export default function App() {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    setChannels(getSavedChannels());
  }, []);

  async function handleAddChannel(input) {
    const resolved = await resolveChannel(input);
    const updated = saveChannel(resolved);
    setChannels(updated);
  }

  function handleRemoveChannel(channelId) {
    const updated = removeChannel(channelId);
    setChannels(updated);
  }

  const loadVideos = useCallback(
    async (channel, pageToken = null, append = false) => {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);
      try {
        const { videos: v, nextPageToken: token } = await fetchChannelVideos(
          channel.uploadsPlaylistId,
          pageToken,
        );
        setVideos((prev) => (append ? [...prev, ...v] : v));
        setNextPageToken(token);
      } catch (err) {
        setError(err.message);
      } finally {
        append ? setLoadingMore(false) : setLoading(false);
      }
    },
    [],
  );

  function handleSelectChannel(channel) {
    setActiveChannel(channel);
    setVideos([]);
    setNextPageToken(null);
    loadVideos(channel);
  }

  function handleBack() {
    setActiveChannel(null);
    setVideos([]);
    setError(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        {activeChannel ? (
          <button className="back-btn" onClick={handleBack}>
            ← Channels
          </button>
        ) : null}
        <h1>FocusTube</h1>
        {activeChannel && <p className="channel-name">{activeChannel.name}</p>}
      </header>

      <main>
        {!activeChannel && (
          <ChannelList
            channels={channels}
            onAdd={handleAddChannel}
            onSelect={handleSelectChannel}
            onRemove={handleRemoveChannel}
          />
        )}

        {activeChannel && (
          <>
            {loading && <p className="status-text">Loading videos…</p>}

            {error && (
              <div className="error-box">
                <p>{error}</p>
                <button onClick={() => loadVideos(activeChannel)}>Retry</button>
              </div>
            )}

            {!loading && !error && videos.length === 0 && (
              <p className="status-text">No videos found.</p>
            )}

            {!loading && !error && videos.length > 0 && (
              <>
                <div className="video-grid">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onSelect={setActiveVideo}
                    />
                  ))}
                </div>

                {nextPageToken && (
                  <div className="load-more-wrapper">
                    <button
                      onClick={() =>
                        loadVideos(activeChannel, nextPageToken, true)
                      }
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}

