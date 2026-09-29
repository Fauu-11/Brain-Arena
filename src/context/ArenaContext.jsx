import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GAMES, gameById } from '../data/games.js';
import { readJSON, readText, writeJSON, writeText, storageAvailable } from '../utils/storage.js';
const ArenaContext = createContext(null);
const favoriteKey = 'ba_favorites_v2';
const historyKey = 'ba_recent_v2';
const loadFavorites = () => {
  const data = readJSON(favoriteKey, []);
  return Array.isArray(data) ? [...new Set(data.filter(id => gameById(id)))] : [];
};
const loadHistory = () => {
  const data = readJSON(historyKey, []);
  return Array.isArray(data) ? data.filter(item => item && gameById(item.id) && Number.isFinite(item.time) && item.time > 0 && !Number.isNaN(new Date(item.time).getTime())).slice(0, 100) : [];
};
export function ArenaProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);
  const [history, setHistory] = useState(loadHistory);
  const [muted, setMuted] = useState(() => readText('ba_muted') === 'true');
  const [storageOk, setStorageOk] = useState(storageAvailable);
  const [notice, setNotice] = useState('');
  const toggleFavorite = useCallback(id => {
    if (!gameById(id)) return;
    setFavorites(prev => { const next = prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]; writeJSON(favoriteKey, next); return next; });
  }, []);
  const recordVisit = useCallback(id => {
    if (!gameById(id)) return;
    setHistory(prev => {
      const now = Date.now();
      // Avoid duplicate effect runs and refreshes immediately after navigation.
      if (prev[0]?.id === id && now - prev[0].time < 1500) return prev;
      const next = [{ id, time: now }, ...prev].slice(0, 100); writeJSON(historyKey, next); return next;
    });
  }, []);
  const clearHistory = useCallback(() => { writeJSON(historyKey, []); setHistory([]); }, []);
  const toggleSound = useCallback(() => setMuted(value => !value), []);
  useEffect(() => {
    writeText('ba_muted', muted); window.__BA_MUTED__ = muted;
    window.dispatchEvent(new CustomEvent('ba-sound-toggle', { detail: { muted } }));
  }, [muted]);
  useEffect(() => {
    const sync = e => { if (!e.key || e.key === favoriteKey) setFavorites(loadFavorites()); if (!e.key || e.key === historyKey) setHistory(loadHistory()); if (!e.key || e.key === 'ba_muted') setMuted(readText('ba_muted') === 'true'); };
    const unavailable = () => setStorageOk(false);
    window.addEventListener('storage', sync); window.addEventListener('ba-storage-unavailable', unavailable);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('ba-storage-unavailable', unavailable); };
  }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2400); return () => clearTimeout(timer); }, [notice]);
  return <ArenaContext.Provider value={{ favorites, toggleFavorite, history, recordVisit, clearHistory, muted, toggleSound, storageOk, notice, setNotice }}>{children}</ArenaContext.Provider>;
}
export function useArena() { return useContext(ArenaContext); }
