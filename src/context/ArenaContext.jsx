import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GAMES, gameById } from '../data/games.js';
import { readJSON, readText, writeJSON, writeText, storageAvailable } from '../utils/storage.js';
import { BASE_COMPLETION_XP, FIRST_PLAY_XP, DAILY_CHALLENGE_XP, bestDailyStreak, calculateDailyStreak, getDailyChallenge, getLevelInfo, localDateKey } from '../utils/progression.js';

const ArenaContext = createContext(null);
const favoriteKey = 'ba_favorites_v2';
const historyKey = 'ba_recent_v2';
const profileKey = 'ba_profile_v1';
const dailyKey = 'ba_daily_v1';
const lastCompletionKey = 'ba_last_completion_v1';

const emptyProfile = () => ({ name: '', xp: 0, completions: 0, playDates: [], perGame: {}, xpEvents: [] });
const emptyDaily = () => ({ completedByDate: {} });

const loadFavorites = () => {
  const data = readJSON(favoriteKey, []);
  return Array.isArray(data) ? [...new Set(data.filter(id => gameById(id)))] : [];
};
const loadHistory = () => {
  const data = readJSON(historyKey, []);
  return Array.isArray(data) ? data.filter(item => item && gameById(item.id) && Number.isFinite(item.time) && item.time > 0 && !Number.isNaN(new Date(item.time).getTime())).slice(0, 100) : [];
};
const loadProfile = () => {
  const raw = readJSON(profileKey, emptyProfile());
  const profile = emptyProfile();
  profile.name = typeof raw?.name === 'string' ? raw.name.trim().slice(0, 24) : '';
  profile.xp = Math.max(0, Math.floor(Number(raw?.xp) || 0));
  profile.completions = Math.max(0, Math.floor(Number(raw?.completions) || 0));
  profile.playDates = Array.isArray(raw?.playDates) ? [...new Set(raw.playDates.filter(value => typeof value === 'string'))].slice(-400) : [];
  profile.perGame = raw?.perGame && typeof raw.perGame === 'object' ? raw.perGame : {};
  profile.xpEvents = Array.isArray(raw?.xpEvents) ? raw.xpEvents.filter(item => item && gameById(item.gameId) && Number.isFinite(item.amount)).slice(0, 50) : [];
  return profile;
};
const loadDaily = () => {
  const raw = readJSON(dailyKey, emptyDaily());
  const completedByDate = raw?.completedByDate && typeof raw.completedByDate === 'object' ? raw.completedByDate : {};
  return { completedByDate };
};

export function ArenaProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);
  const [history, setHistory] = useState(loadHistory);
  const [muted, setMuted] = useState(() => readText('ba_muted') === 'true');
  const [storageOk, setStorageOk] = useState(storageAvailable);
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState(loadProfile);
  const [daily, setDaily] = useState(loadDaily);
  const profileRef = useRef(profile);
  const dailyRef = useRef(daily);
  const lastRewardRef = useRef(readJSON(lastCompletionKey, null));

  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { dailyRef.current = daily; }, [daily]);

  const toggleFavorite = useCallback(id => {
    if (!gameById(id)) return;
    setFavorites(prev => { const next = prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]; writeJSON(favoriteKey, next); return next; });
  }, []);
  const recordVisit = useCallback(id => {
    if (!gameById(id)) return;
    setHistory(prev => {
      const now = Date.now();
      if (prev[0]?.id === id && now - prev[0].time < 1500) return prev;
      const next = [{ id, time: now }, ...prev].slice(0, 100); writeJSON(historyKey, next); return next;
    });
  }, []);
  const clearHistory = useCallback(() => { writeJSON(historyKey, []); setHistory([]); }, []);
  const toggleSound = useCallback(() => setMuted(value => !value), []);

  const updatePlayerName = useCallback(value => {
    const name = String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 24);
    const next = { ...profileRef.current, name };
    profileRef.current = next; setProfile(next); writeJSON(profileKey, next);
    return name;
  }, []);

  const recordGameCompletion = useCallback(id => {
    if (!gameById(id)) return null;
    const now = Date.now();
    const prior = lastRewardRef.current;
    if (prior?.gameId === id && Number.isFinite(prior.time) && now - prior.time < 2500) return prior;

    const dateKey = localDateKey();
    const oldProfile = profileRef.current;
    const challenge = getDailyChallenge(GAMES, dateKey);
    const firstOfDay = !oldProfile.playDates.includes(dateKey);
    const alreadyDaily = Boolean(dailyRef.current.completedByDate?.[dateKey]);
    const dailyBonus = challenge.gameId === id && !alreadyDaily ? DAILY_CHALLENGE_XP : 0;
    const firstBonus = firstOfDay ? FIRST_PLAY_XP : 0;
    const amount = BASE_COMPLETION_XP + firstBonus + dailyBonus;
    const beforeLevel = getLevelInfo(oldProfile.xp).level;
    const gameStats = oldProfile.perGame?.[id] || { completions: 0, xp: 0, lastPlayedAt: null };
    const event = {
      id: `${now}-${id}`,
      gameId: id,
      amount,
      baseXp: BASE_COMPLETION_XP,
      firstBonus,
      dailyBonus,
      dateKey,
      time: now,
    };
    const nextProfile = {
      ...oldProfile,
      xp: oldProfile.xp + amount,
      completions: oldProfile.completions + 1,
      playDates: firstOfDay ? [...oldProfile.playDates, dateKey].slice(-400) : oldProfile.playDates,
      perGame: {
        ...oldProfile.perGame,
        [id]: { completions: (Number(gameStats.completions) || 0) + 1, xp: (Number(gameStats.xp) || 0) + amount, lastPlayedAt: now },
      },
      xpEvents: [event, ...oldProfile.xpEvents].slice(0, 50),
    };
    profileRef.current = nextProfile; setProfile(nextProfile); writeJSON(profileKey, nextProfile);

    if (dailyBonus) {
      const nextDaily = {
        completedByDate: {
          ...dailyRef.current.completedByDate,
          [dateKey]: { gameId: id, completedAt: now, rewardXp: DAILY_CHALLENGE_XP },
        },
      };
      dailyRef.current = nextDaily; setDaily(nextDaily); writeJSON(dailyKey, nextDaily);
    }

    const reward = {
      ...event,
      gameId: id,
      levelBefore: beforeLevel,
      levelAfter: getLevelInfo(nextProfile.xp).level,
      dailyCompleted: Boolean(dailyBonus),
    };
    lastRewardRef.current = reward; writeJSON(lastCompletionKey, reward);
    setNotice(`+${amount} XP`);
    return reward;
  }, []);

  const levelInfo = useMemo(() => getLevelInfo(profile.xp), [profile.xp]);
  const todayKey = localDateKey();
  const todayChallenge = useMemo(() => getDailyChallenge(GAMES, todayKey), [todayKey]);
  const completedDateKeys = useMemo(() => Object.keys(daily.completedByDate || {}), [daily.completedByDate]);
  const currentStreak = useMemo(() => calculateDailyStreak(completedDateKeys, todayKey), [completedDateKeys, todayKey]);
  const bestStreak = useMemo(() => bestDailyStreak(completedDateKeys), [completedDateKeys]);
  const dailyCompleted = Boolean(daily.completedByDate?.[todayKey]);

  useEffect(() => {
    writeText('ba_muted', muted); window.__BA_MUTED__ = muted;
    window.dispatchEvent(new CustomEvent('ba-sound-toggle', { detail: { muted } }));
  }, [muted]);
  useEffect(() => {
    const sync = e => {
      if (!e.key || e.key === favoriteKey) setFavorites(loadFavorites());
      if (!e.key || e.key === historyKey) setHistory(loadHistory());
      if (!e.key || e.key === 'ba_muted') setMuted(readText('ba_muted') === 'true');
      if (!e.key || e.key === profileKey) setProfile(loadProfile());
      if (!e.key || e.key === dailyKey) setDaily(loadDaily());
    };
    const unavailable = () => setStorageOk(false);
    window.addEventListener('storage', sync); window.addEventListener('ba-storage-unavailable', unavailable);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('ba-storage-unavailable', unavailable); };
  }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2400); return () => clearTimeout(timer); }, [notice]);

  return <ArenaContext.Provider value={{
    favorites, toggleFavorite, history, recordVisit, clearHistory, muted, toggleSound, storageOk, notice, setNotice,
    profile, levelInfo, updatePlayerName, recordGameCompletion,
    todayChallenge, dailyCompleted, daily, currentStreak, bestStreak,
  }}>{children}</ArenaContext.Provider>;
}
export function useArena() { return useContext(ArenaContext); }
