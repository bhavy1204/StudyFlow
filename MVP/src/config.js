// src/config.js

// Get a free API key from Google Cloud Console (enable YouTube Data API v3).
// https://console.cloud.google.com/apis/credentials
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'PASTE_YOUR_API_KEY_HERE';

export const VIDEOS_PER_PAGE = 24;

export const STORAGE_KEY = 'focustube_channels';