# FocusTube (MVP)

A distraction-free way to watch videos from **one** YouTube channel only. No homepage feed, no recommendations, no rabbit holes.

## How it works

- React + Vite frontend, no backend needed.
- Calls the YouTube Data API v3 `playlistItems` endpoint directly from the browser, using the channel's "uploads" playlist (this is cheaper on API quota than the `search` endpoint and returns videos in upload order).
- Click a thumbnail → plays inline in an embedded, no-cookie YouTube player (no jumping to youtube.com).
- Installable as a PWA (manifest + service worker), so it can be "Added to Home Screen" on mobile or installed as a desktop app.

## 1. Get your API key and playlist ID

**API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a project (or use an existing one).
3. Enable the **YouTube Data API v3** (APIs & Services → Library → search for it → Enable).
4. Go to **Credentials → Create Credentials → API Key**. Copy it.
5. (Recommended) Restrict the key to the YouTube Data API v3, and add an HTTP referrer restriction pointing to your Vercel domain once deployed, so it can't be abused if leaked.

**Uploads Playlist ID** (this is the "channel", hardcoded):
1. Find the channel's Channel ID. Easiest way: go to the channel's page → About tab → Share channel → Copy channel ID. It looks like `UC_x5XG1OV2P6uZZ5FSM9Ttw`.
2. Take that ID and replace the leading `UC` with `UU`. That's the uploads playlist ID.
   - Example: `UC_x5XG1OV2P6uZZ5FSM9Ttw` → `UU_x5XG1OV2P6uZZ5FSM9Ttw`

## 2. Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_YOUTUBE_API_KEY=your_actual_key
VITE_UPLOADS_PLAYLIST_ID=UU_x5XG1OV2P6uZZ5FSM9Ttw
VITE_CHANNEL_NAME=Whatever Channel Name
```

Run it:
```bash
npm run dev
```

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. Vercel auto-detects Vite. Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
4. Add the same three environment variables (`VITE_YOUTUBE_API_KEY`, `VITE_UPLOADS_PLAYLIST_ID`, `VITE_CHANNEL_NAME`) in Vercel Project Settings → Environment Variables.
5. Deploy.

## Notes / next steps for you to consider later

- **API key exposure**: since this is a pure frontend app, the API key is visible in the browser network tab. That's fine for a personal demo, but restrict the key (HTTP referrer + API restriction in Google Cloud Console) before sharing widely. For a "real" product, you'd proxy this through a backend (your MERN "M/E/N" part) so the key never reaches the client.
- **Quota**: YouTube Data API has a free daily quota (10,000 units/day). `playlistItems.list` costs 1 unit per call, so this is very cheap — you can load thousands of pages a day.
- **Multiple channels later**: right now the channel is hardcoded in `src/config.js`. When you're ready to support user-selected channels, that's where a real Node/Express + MongoDB backend would come in (store user's chosen channel, resolve handles → channel IDs server-side, hide the API key).
