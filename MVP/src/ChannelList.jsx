// src/ChannelList.jsx
import { useState } from "react";

export default function ChannelList({ channels, onAdd, onSelect, onRemove }) {
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

      {channels.length === 0 ? (
        <p className="status-text">
          No channels yet. Add one above to get started.
        </p>
      ) : (
        <ul className="channel-ul">
          {channels.map((c) => (
            <li key={c.channelId} className="channel-row">
              <button className="channel-row-main" onClick={() => onSelect(c)}>
                {c.thumbnail && <img src={c.thumbnail} alt="" />}
                <span>{c.name}</span>
              </button>
              <button
                className="remove-btn"
                onClick={() => onRemove(c.channelId)}
                aria-label={`Remove ${c.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
