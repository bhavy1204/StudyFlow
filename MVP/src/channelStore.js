// src/channelStore.js
import { STORAGE_KEY } from './config';

export function getSavedChannels() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveChannel(channel) {
    const existing = getSavedChannels();
    if (existing.some((c) => c.channelId === channel.channelId)) {
        return existing; // already saved
    }
    const updated = [...existing, channel];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
}

export function savePlaylist(playlist) {
    const all = getSavedChannels(); // however your existing getter is named
    const exists = all.some((c) => c.id === playlist.id);
    if (exists) return all;

    const updated = [...all, { ...playlist, type: 'playlist' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
}

export function removeChannel(channelId) {
    const updated = getSavedChannels().filter((c) => c.channelId !== channelId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
}