// src/ChannelList.jsx
import { useState } from "react";

export default function ChannelList({ channels, onAdd, onAddPlaylist, onSelect, onRemove }) {
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd(input.trim());
      setInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  const [playlistInput, setPlaylistInput] = useState("");
  const [addingPlaylist, setAddingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState("");

  async function handleAddPlaylist(e) {
    e.preventDefault();
    if (!playlistInput.trim()) return;
    setAddingPlaylist(true);
    setPlaylistError("");
    try {
      await onAddPlaylist(playlistInput.trim());
      setPlaylistInput("");
    } catch (err) {
      setPlaylistError(err.message);
    } finally {
      setAddingPlaylist(false);
    }
  }

  return (
    <div className="channel-list-screen">
      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="@handle, channel URL, or ID"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={adding}
        />
        <button type="submit" disabled={adding}>
          {adding ? "Adding…" : "Add"}
        </button>
      </form>
      {error && <p className="inline-error">{error}</p>}

      <form className="add-form" onSubmit={handleAddPlaylist}>
        <input
          type="text"
          placeholder="Paste a playlist link"
          value={playlistInput}
          onChange={(e) => setPlaylistInput(e.target.value)}
          disabled={addingPlaylist}
        />
        <button type="submit" disabled={addingPlaylist}>
          {addingPlaylist ? "Adding…" : "Add Playlist"}
        </button>
      </form>
      {playlistError && <p className="inline-error">{playlistError}</p>}

      {channels.length === 0 ? (
        <p className="status-text">
          No channels yet. Add one above to get started.
        </p>
      ) : (
        <ul className="channel-ul">
          {channels.map((c) => {
            const itemId = c.channelId || c.id;
            const isPlaylist = c.type === "playlist";
            return (
              <li key={itemId} className="channel-row">
                <button className="channel-row-main" onClick={() => onSelect(c)}>
                  {c.thumbnail && <img src={c.thumbnail} alt="" />}
                  <span>{c.name}</span>
                  {isPlaylist && <span className="badge">Playlist</span>}
                </button>
                {!isPlaylist && (
                  <button
                    className="remove-btn"
                    onClick={() => onRemove(itemId)}
                    aria-label={`Remove ${c.name}`}
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
