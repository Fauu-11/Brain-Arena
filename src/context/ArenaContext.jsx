import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GAMES, gameById } from '../data/games.js';
import { ACHIEVEMENTS, achievementById, newlyCompletedAchievements } from '../data/achievements.js';
import { allMissionCards, missionClaimKey, missionProgress } from '../utils/missions.js';
import { readJSON, readText, writeJSON, writeText, storageAvailable } from '../utils/storage.js';
import { BASE_COMPLETION_XP, FIRST_PLAY_XP, DAILY_CHALLENGE_XP, bestDailyStreak, calculateDailyStreak, getDailyChallenge, getLevelInfo, localDateKey } from '../utils/progression.js';

const ArenaContext = createContext(null);
const favoriteKey = 'ba_favorites_v2';
const historyKey = 'ba_recent_v2';
const profileKey = 'ba_profile_v1';
const dailyKey = 'ba_daily_v1';
const lastCompletionKey = 'ba_last_completion_v1';
const achievementKey = 'ba_achievements_v1';
const missionKey = 'ba_missions_v1';

const emptyProfile = () => ({ name:'', xp:0, completions:0, playDates:[], perGame:{}, xpEvents:[], completionEvents:[] });
const emptyDaily = () => ({ completedByDate:{} });
const emptyAchievements = () => ({ unlocked:{}, selectedBadge:null });
const emptyMissions = () => ({ claims:{} });

const loadFavorites = () => {
  const data = readJSON(favoriteKey, []);
  return Array.isArray(data) ? [...new Set(data.filter(id => gameById(id)))] : [];
};
const loadHistory = () => {
  const data = readJSON(historyKey, []);
  return Array.isArray(data) ? data.filter(item => item && gameById(item.id) && Number.isFinite(item.time) && item.time > 0 && !Number.isNaN(new Date(item.time).getTime())).slice(0,100) : [];
};
const loadProfile = () => {
  const raw = readJSON(profileKey, emptyProfile());
  const profile = emptyProfile();
  profile.name = typeof raw?.name === 'string' ? raw.name.trim().slice(0,24) : '';
  profile.xp = Math.max(0, Math.floor(Number(raw?.xp) || 0));
  profile.completions = Math.max(0, Math.floor(Number(raw?.completions) || 0));
  profile.playDates = Array.isArray(raw?.playDates) ? [...new Set(raw.playDates.filter(value => typeof value === 'string'))].slice(-400) : [];
  profile.perGame = raw?.perGame && typeof raw.perGame === 'object' ? raw.perGame : {};
  profile.xpEvents = Array.isArray(raw?.xpEvents) ? raw.xpEvents.filter(item => item && Number.isFinite(item.amount) && (gameById(item.gameId) || item.source)).slice(0,100) : [];
  profile.completionEvents = Array.isArray(raw?.completionEvents) ? raw.completionEvents.filter(item => item && gameById(item.gameId) && typeof item.dateKey === 'string').slice(0,500) : [];
  return profile;
};
const loadDaily = () => {
  const raw = readJSON(dailyKey, emptyDaily());
  return { completedByDate:raw?.completedByDate && typeof raw.completedByDate === 'object' ? raw.completedByDate : {} };
};
const loadAchievements = () => {
  const raw = readJSON(achievementKey, emptyAchievements());
  const unlocked = {};
  if (raw?.unlocked && typeof raw.unlocked === 'object') {
    for (const [id,value] of Object.entries(raw.unlocked)) if (achievementById(id) && value) unlocked[id] = value;
  }
  const selectedBadge = achievementById(raw?.selectedBadge) && unlocked[raw.selectedBadge] ? raw.selectedBadge : null;
  return { unlocked, selectedBadge };
};
const loadMissions = () => {
  const raw = readJSON(missionKey, emptyMissions());
  return { claims:raw?.claims && typeof raw.claims === 'object' ? raw.claims : {} };
};

export function ArenaProvider({ children }) {
  const [favorites,setFavorites] = useState(loadFavorites);
  const [history,setHistory] = useState(loadHistory);
  const [muted,setMuted] = useState(() => readText('ba_muted') === 'true');
  const [storageOk,setStorageOk] = useState(storageAvailable);
  const [notice,setNotice] = useState('');
  const [profile,setProfile] = useState(loadProfile);
  const [daily,setDaily] = useState(loadDaily);
  const [achievements,setAchievements] = useState(loadAchievements);
  const [missions,setMissions] = useState(loadMissions);
  const profileRef = useRef(profile);
  const dailyRef = useRef(daily);
  const achievementRef = useRef(achievements);
  const missionRef = useRef(missions);
  const lastRewardRef = useRef(readJSON(lastCompletionKey, null));

  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { dailyRef.current = daily; }, [daily]);
  useEffect(() => { achievementRef.current = achievements; }, [achievements]);
  useEffect(() => { missionRef.current = missions; }, [missions]);

  const saveProfile = useCallback(next => { profileRef.current = next; setProfile(next); writeJSON(profileKey,next); }, []);
  const toggleFavorite = useCallback(id => {
    if (!gameById(id)) return;
    setFavorites(prev => { const next = prev.includes(id) ? prev.filter(value => value !== id) : [...prev,id]; writeJSON(favoriteKey,next); return next; });
  }, []);
  const recordVisit = useCallback(id => {
    if (!gameById(id)) return;
    setHistory(prev => {
      const now = Date.now();
      if (prev[0]?.id === id && now - prev[0].time < 1500) return prev;
      const next = [{ id,time:now }, ...prev].slice(0,100); writeJSON(historyKey,next); return next;
    });
  }, []);
  const clearHistory = useCallback(() => { writeJSON(historyKey,[]); setHistory([]); }, []);
  const toggleSound = useCallback(() => setMuted(value => !value), []);

  const updatePlayerName = useCallback(value => {
    const name = String(value ?? '').replace(/\s+/g,' ').trim().slice(0,24);
    saveProfile({ ...profileRef.current, name });
    return name;
  }, [saveProfile]);

  const grantXp = useCallback((amount, meta = {}) => {
    const reward = Math.max(0,Math.floor(Number(amount) || 0));
    if (!reward) return null;
    const now = Date.now();
    const old = profileRef.current;
    const beforeLevel = getLevelInfo(old.xp).level;
    const event = { id:`${now}-${meta.source || 'bonus'}-${meta.id || 'xp'}`, gameId:meta.gameId || null, amount:reward, dateKey:localDateKey(), time:now, source:meta.source || 'bonus', sourceId:meta.id || null };
    const next = { ...old, xp:old.xp + reward, xpEvents:[event,...old.xpEvents].slice(0,100) };
    saveProfile(next);
    setNotice(`+${reward} XP`);
    return { ...event, levelBefore:beforeLevel, levelAfter:getLevelInfo(next.xp).level };
  }, [saveProfile]);

  const recordGameCompletion = useCallback(id => {
    if (!gameById(id)) return null;
    const now = Date.now();
    const prior = lastRewardRef.current;
    if (prior?.gameId === id && Number.isFinite(prior.time) && now - prior.time < 2500) return prior;

    const dateKey = localDateKey();
    const oldProfile = profileRef.current;
    const challenge = getDailyChallenge(GAMES,dateKey);
    const firstOfDay = !oldProfile.playDates.includes(dateKey);
    const alreadyDaily = Boolean(dailyRef.current.completedByDate?.[dateKey]);
    const dailyBonus = challenge.gameId === id && !alreadyDaily ? DAILY_CHALLENGE_XP : 0;
    const firstBonus = firstOfDay ? FIRST_PLAY_XP : 0;
    const amount = BASE_COMPLETION_XP + firstBonus + dailyBonus;
    const beforeLevel = getLevelInfo(oldProfile.xp).level;
    const gameStats = oldProfile.perGame?.[id] || { completions:0,xp:0,lastPlayedAt:null };
    const event = { id:`${now}-${id}`, gameId:id, amount, baseXp:BASE_COMPLETION_XP, firstBonus, dailyBonus, dateKey, time:now, source:'game' };
    const completionEvent = { id:`play-${now}-${id}`, gameId:id, dateKey, time:now };
    const nextProfile = {
      ...oldProfile,
      xp:oldProfile.xp + amount,
      completions:oldProfile.completions + 1,
      playDates:firstOfDay ? [...oldProfile.playDates,dateKey].slice(-400) : oldProfile.playDates,
      perGame:{ ...oldProfile.perGame, [id]:{ completions:(Number(gameStats.completions) || 0) + 1, xp:(Number(gameStats.xp) || 0) + amount, lastPlayedAt:now } },
      xpEvents:[event,...oldProfile.xpEvents].slice(0,100),
      completionEvents:[completionEvent,...(oldProfile.completionEvents || [])].slice(0,500),
    };
    saveProfile(nextProfile);

    if (dailyBonus) {
      const nextDaily = { completedByDate:{ ...dailyRef.current.completedByDate, [dateKey]:{ gameId:id,completedAt:now,rewardXp:DAILY_CHALLENGE_XP } } };
      dailyRef.current = nextDaily; setDaily(nextDaily); writeJSON(dailyKey,nextDaily);
    }

    const reward = { ...event, levelBefore:beforeLevel, levelAfter:getLevelInfo(nextProfile.xp).level, dailyCompleted:Boolean(dailyBonus) };
    lastRewardRef.current = reward; writeJSON(lastCompletionKey,reward); setNotice(`+${amount} XP`);
    return reward;
  }, [saveProfile]);

  const selectBadge = useCallback(id => {
    if (id !== null && (!achievementById(id) || !achievementRef.current.unlocked[id])) return false;
    const next = { ...achievementRef.current, selectedBadge:id };
    achievementRef.current = next; setAchievements(next); writeJSON(achievementKey,next); return true;
  }, []);

  const claimMission = useCallback(mission => {
    if (!mission?.id) return null;
    const dateKey = localDateKey();
    const key = missionClaimKey(mission,dateKey);
    if (missionRef.current.claims[key]) return null;
    const progress = missionProgress(mission,profileRef.current,dailyRef.current,dateKey);
    if (!progress.complete) return null;
    const now = Date.now();
    const nextMissions = { claims:{ ...missionRef.current.claims, [key]:{ claimedAt:now,rewardXp:mission.rewardXp } } };
    missionRef.current = nextMissions; setMissions(nextMissions); writeJSON(missionKey,nextMissions);
    return grantXp(mission.rewardXp,{ source:'mission',id:mission.id });
  }, [grantXp]);

  const todayKey = localDateKey();
  const levelInfo = useMemo(() => getLevelInfo(profile.xp), [profile.xp]);
  const todayChallenge = useMemo(() => getDailyChallenge(GAMES,todayKey), [todayKey]);
  const completedDateKeys = useMemo(() => Object.keys(daily.completedByDate || {}), [daily.completedByDate]);
  const currentStreak = useMemo(() => calculateDailyStreak(completedDateKeys,todayKey), [completedDateKeys,todayKey]);
  const bestStreak = useMemo(() => bestDailyStreak(completedDateKeys), [completedDateKeys]);
  const dailyCompleted = Boolean(daily.completedByDate?.[todayKey]);
  const missionCards = useMemo(() => allMissionCards(profile,daily,missions.claims,todayKey), [profile,daily,missions.claims,todayKey]);
  const selectedBadge = achievementById(achievements.selectedBadge);

  useEffect(() => {
    const fresh = newlyCompletedAchievements(profileRef.current,dailyRef.current,achievementRef.current.unlocked);
    if (!fresh.length) return;
    const now = Date.now();
    const unlocked = { ...achievementRef.current.unlocked };
    let rewardTotal = 0;
    const rewardEvents = [];
    for (const item of fresh) {
      unlocked[item.id] = { unlockedAt:now,rewardXp:item.rewardXp };
      rewardTotal += item.rewardXp;
      rewardEvents.push({ id:`${now}-${item.id}`, gameId:null, amount:item.rewardXp, dateKey:localDateKey(), time:now, source:'achievement', sourceId:item.id });
    }
    const nextAchievements = { unlocked, selectedBadge:achievementRef.current.selectedBadge || fresh[0].id };
    achievementRef.current = nextAchievements; setAchievements(nextAchievements); writeJSON(achievementKey,nextAchievements);
    if (rewardTotal) {
      const old = profileRef.current;
      saveProfile({ ...old, xp:old.xp + rewardTotal, xpEvents:[...rewardEvents,...old.xpEvents].slice(0,100) });
    }
    const first = fresh[0];
    setNotice(fresh.length === 1 ? `Badge: ${first.title.id} · +${rewardTotal} XP` : `${fresh.length} badge terbuka · +${rewardTotal} XP`);
  }, [profile,daily,saveProfile]);

  useEffect(() => {
    writeText('ba_muted',muted); window.__BA_MUTED__ = muted;
    window.dispatchEvent(new CustomEvent('ba-sound-toggle',{ detail:{ muted } }));
  }, [muted]);
  useEffect(() => {
    const sync = e => {
      if (!e.key || e.key === favoriteKey) setFavorites(loadFavorites());
      if (!e.key || e.key === historyKey) setHistory(loadHistory());
      if (!e.key || e.key === 'ba_muted') setMuted(readText('ba_muted') === 'true');
      if (!e.key || e.key === profileKey) setProfile(loadProfile());
      if (!e.key || e.key === dailyKey) setDaily(loadDaily());
      if (!e.key || e.key === achievementKey) setAchievements(loadAchievements());
      if (!e.key || e.key === missionKey) setMissions(loadMissions());
    };
    const unavailable = () => setStorageOk(false);
    window.addEventListener('storage',sync); window.addEventListener('ba-storage-unavailable',unavailable);
    return () => { window.removeEventListener('storage',sync); window.removeEventListener('ba-storage-unavailable',unavailable); };
  }, []);
  useEffect(() => { if (!notice) return; const timer=setTimeout(()=>setNotice(''),3000); return()=>clearTimeout(timer); }, [notice]);

  return <ArenaContext.Provider value={{
    favorites,toggleFavorite,history,recordVisit,clearHistory,muted,toggleSound,storageOk,notice,setNotice,
    profile,levelInfo,updatePlayerName,recordGameCompletion,grantXp,
    todayChallenge,dailyCompleted,daily,currentStreak,bestStreak,
    achievements,achievementList:ACHIEVEMENTS,selectedBadge,selectBadge,
    missions,missionCards,claimMission,
  }}>{children}</ArenaContext.Provider>;
}
export function useArena() { return useContext(ArenaContext); }
