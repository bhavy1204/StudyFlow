// src/youtube.js
import { YOUTUBE_API_KEY, VIDEOS_PER_PAGE } from './config';

const CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';
const PLAYLIST_ITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

function assertApiKey() {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.startsWith('PASTE_')) {
    throw new Error('Missing YouTube API key. Add VITE_YOUTUBE_API_KEY in your .env file.');
  }
}

/**
 * Resolves a channel from a handle (e.g. "@mkbhd"), a raw channel ID (UC...),
 * or a full channel URL, into { channelId, uploadsPlaylistId, name, thumbnail }.
 * Uses channels.list (cheap: 1 unit) instead of search.list (expensive: 100 units).
 */
export async function resolveChannel(input) {
  assertApiKey();

  const raw = input.trim();
  if (!raw) throw new Error('Please enter a channel handle, URL, or ID.');

  // Extract a handle or channel ID out of a pasted URL, if given.
  let query = raw;
  const urlMatch = raw.match(/youtube\.com\/(@[\w.-]+|channel\/(UC[\w-]+))/i);
  if (urlMatch) {
    query = urlMatch[2] || urlMatch[1];
  }

  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: YOUTUBE_API_KEY,
  });

  if (query.startsWith('UC')) {
    params.set('id', query);
  } else {
    const handle = query.startsWith('@') ? query : `@${query}`;
    params.set('forHandle', handle);
  }

  const res = await fetch(`${CHANNELS_URL}?${params.toString()}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `YouTube API error (${res.status})`);
  }

  const data = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error("Couldn't find that channel. Check the handle/URL and try again.");

  return {
    channelId: item.id,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
    name: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.default?.url,
  };
}

// Extracts a playlist ID from a full URL or raw ID
function extractPlaylistId(input) {
  const trimmed = input.trim();
  if (/^(PL|UU|FL|LL)[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const listParam = url.searchParams.get('list');
    if (listParam) return listParam;
  } catch {
    // not a URL, fall through
  }
  return null;
}

export async function resolvePlaylist(input) {
  const playlistId = extractPlaylistId(input);
  if (!playlistId) throw new Error('Could not find a playlist ID in that link.');

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
  );
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('Playlist not found or is private.');
  }

  const item = data.items[0];
  return {
    id: playlistId,
    type: 'playlist',
    uploadsPlaylistId: playlistId, // reuse same field your video grid already reads
    name: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
  };
}

/**
 * Fetches a page of videos from a given uploads playlist.
 */
export async function fetchChannelVideos(uploadsPlaylistId, pageToken = null) {
  assertApiKey();
  if (!uploadsPlaylistId) throw new Error('No playlist ID provided.');

  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: String(VIDEOS_PER_PAGE),
    key: YOUTUBE_API_KEY,
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`${PLAYLIST_ITEMS_URL}?${params.toString()}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `YouTube API error (${res.status})`);
  }

  const data = await res.json();

  const videos = (data.items || [])
    .filter((item) => item.snippet?.title !== 'Private video' && item.snippet?.title !== 'Deleted video')
    .map((item) => ({
      id: item.contentDetails?.videoId,
      title: item.snippet?.title,
      publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt,
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
    }))
    .filter((v) => v.id);

  return { videos, nextPageToken: data.nextPageToken || null };
}

