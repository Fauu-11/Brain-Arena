import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GAMES, gameById } from '../data/games.js';
import { ACHIEVEMENTS, achievementById, newlyCompletedAchievements } from '../data/achievements.js';
import { allMissionCards, missionClaimKey, missionProgress } from '../utils/missions.js';
import { readJSON, readText, writeJSON, writeText, storageAvailable } from '../utils/storage.js';
import { BASE_COMPLETION_XP, FIRST_PLAY_XP, DAILY_CHALLENGE_XP, bestDailyStreak, calculateDailyStreak, getDailyChallenge, getLevelInfo, localDateKey } from '../utils/progression.js';
import { getRankInfo } from '../utils/rank.js';
import { AVATARS, PROFILE_BANNERS, PROFILE_FRAMES, PROFILE_TITLES, DEFAULT_CUSTOMIZATION, customizationById, customizationUnlocked } from '../data/customization.js';
import { CURRENT_SEASON, SEASON_COMPLETION_XP, getSeasonLevel, seasonIsActive } from '../utils/season.js';
import { eventBonusForGame, getActiveEvent } from '../utils/events.js';
import { MASTERY_XP_PER_COMPLETION, getMasteryInfo, masteryFromProfile } from '../utils/mastery.js';
import { adaptiveRecommendation } from '../utils/adaptive.js';
import { bestKey, createChallengeCode, activateSeededRandom, restoreNativeRandom, validateChallengeCode, normalizeChallengeCode, performanceForRun, rankedDeltaFor, levelCompletionKey, nativeShuffle, runPreset } from '../utils/competitive.js';
import { coachTip } from '../data/coachTips.js';

const ArenaContext = createContext(null);
const favoriteKey = 'ba_favorites_v2';
const historyKey = 'ba_recent_v2';
const profileKey = 'ba_profile_v1';
const dailyKey = 'ba_daily_v1';
const lastCompletionKey = 'ba_last_completion_v1';
const achievementKey = 'ba_achievements_v1';
const missionKey = 'ba_missions_v1';
const customizationKey = 'ba_customization_v1';
const seasonKey = 'ba_season_v1';
const accessibilityKey = 'ba_accessibility_v1';
const competitionSetupKey = 'ba_competition_setup_v1';
const matchHistoryKey = 'ba_match_history_v1';
const personalBestKey = 'ba_personal_bests_v1';
const completionMapKey = 'ba_game_completion_v1';
const arenaRunKey = 'ba_arena_run_v1';
const selectedReplayKey = 'ba_selected_replay_v1';

const emptyProfile = () => ({ name:'', xp:0, rankedPoints:0, completions:0, playDates:[], perGame:{}, xpEvents:[], completionEvents:[] });
const emptyDaily = () => ({ completedByDate:{} });
const emptyAchievements = () => ({ unlocked:{}, selectedBadge:null });
const emptyMissions = () => ({ claims:{} });
const emptyCustomization = () => ({ ...DEFAULT_CUSTOMIZATION });
const emptySeason = () => ({ id:CURRENT_SEASON.id, xp:0, claimed:{} });
const emptyAccessibility = () => ({ theme:'system', reducedMotion:false, highContrast:false, largeText:false });
const emptyCompetitionSetup = () => ({ mode:'practice', challengeCodes:{}, schoolLevels:{}, universityDifficulties:{} });

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
  profile.rankedPoints = Math.max(0, Math.floor(Number(raw?.rankedPoints) || 0));
  profile.completions = Math.max(0, Math.floor(Number(raw?.completions) || 0));
  profile.playDates = Array.isArray(raw?.playDates) ? [...new Set(raw.playDates.filter(value => typeof value === 'string'))].slice(-400) : [];
  profile.perGame = raw?.perGame && typeof raw.perGame === 'object' ? Object.fromEntries(Object.entries(raw.perGame).filter(([id])=>gameById(id)).map(([id,value])=>[id,{
    ...(value && typeof value === 'object' ? value : {}),
    completions:Math.max(0,Math.floor(Number(value?.completions)||0)),
    xp:Math.max(0,Math.floor(Number(value?.xp)||0)),
    masteryXp:Math.max(0,Math.floor(Number(value?.masteryXp)||0)),
  }])) : {};
  profile.xpEvents = Array.isArray(raw?.xpEvents) ? raw.xpEvents.filter(item => item && Number.isFinite(item.amount) && (gameById(item.gameId) || item.source)).slice(0,150) : [];
  profile.completionEvents = Array.isArray(raw?.completionEvents) ? raw.completionEvents.filter(item => item && gameById(item.gameId) && typeof item.dateKey === 'string').slice(0,700) : [];
  return profile;
};
const loadDaily = () => {
  const raw = readJSON(dailyKey, emptyDaily());
  return { completedByDate:raw?.completedByDate && typeof raw.completedByDate === 'object' ? raw.completedByDate : {} };
};
const loadAchievements = () => {
  const raw = readJSON(achievementKey, emptyAchievements());
  const unlocked = {};
  if (raw?.unlocked && typeof raw.unlocked === 'object') for (const [id,value] of Object.entries(raw.unlocked)) if (achievementById(id) && value) unlocked[id] = value;
  const selectedBadge = achievementById(raw?.selectedBadge) && unlocked[raw.selectedBadge] ? raw.selectedBadge : null;
  return { unlocked, selectedBadge };
};
const loadMissions = () => {
  const raw = readJSON(missionKey, emptyMissions());
  return { claims:raw?.claims && typeof raw.claims === 'object' ? raw.claims : {} };
};
const loadCustomization = () => {
  const raw = readJSON(customizationKey, emptyCustomization());
  return {
    avatar:customizationById(AVATARS,raw?.avatar).id,
    frame:customizationById(PROFILE_FRAMES,raw?.frame).id,
    title:customizationById(PROFILE_TITLES,raw?.title).id,
    banner:customizationById(PROFILE_BANNERS,raw?.banner).id,
  };
};
const loadSeason = () => {
  const raw = readJSON(seasonKey, emptySeason());
  if (raw?.id !== CURRENT_SEASON.id) return emptySeason();
  return { id:CURRENT_SEASON.id, xp:Math.max(0,Math.floor(Number(raw?.xp)||0)), claimed:raw?.claimed && typeof raw.claimed === 'object' ? raw.claimed : {} };
};
const loadAccessibility = () => {
  const raw = readJSON(accessibilityKey, emptyAccessibility());
  const theme = ['system','light','dark'].includes(raw?.theme) ? raw.theme : 'system';
  return { theme, reducedMotion:Boolean(raw?.reducedMotion), highContrast:Boolean(raw?.highContrast), largeText:Boolean(raw?.largeText) };
};
const loadCompetitionSetup = () => {
  const raw = readJSON(competitionSetupKey, emptyCompetitionSetup());
  const cleanMap = value => value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([id])=>gameById(id))) : {};
  return {
    mode:['practice','ranked'].includes(raw?.mode) ? raw.mode : 'practice',
    challengeCodes:cleanMap(raw?.challengeCodes),
    schoolLevels:cleanMap(raw?.schoolLevels),
    universityDifficulties:cleanMap(raw?.universityDifficulties),
  };
};
const loadMatches = () => {
  const raw=readJSON(matchHistoryKey,[]);
  return Array.isArray(raw) ? raw.filter(item=>item&&gameById(item.gameId)&&Number.isFinite(item.time)).slice(0,300) : [];
};
const loadPersonalBests = () => {
  const raw=readJSON(personalBestKey,{});
  return raw&&typeof raw==='object' ? Object.fromEntries(Object.entries(raw).filter(([,value])=>Number(value)>0)) : {};
};
const loadCompletionMap = () => {
  const raw=readJSON(completionMapKey,{});
  return raw&&typeof raw==='object' ? raw : {};
};
const loadArenaRun = () => {
  const raw=readJSON(arenaRunKey,null);
  if (!raw || !Array.isArray(raw.stages)) return null;
  return raw;
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
  const [customization,setCustomization] = useState(loadCustomization);
  const [season,setSeason] = useState(loadSeason);
  const [accessibility,setAccessibility] = useState(loadAccessibility);
  const [competitionSetup,setCompetitionSetup] = useState(loadCompetitionSetup);
  const [matches,setMatches] = useState(loadMatches);
  const [personalBests,setPersonalBests] = useState(loadPersonalBests);
  const [completionMap,setCompletionMap] = useState(loadCompletionMap);
  const [arenaRun,setArenaRun] = useState(loadArenaRun);
  const [currentSession,setCurrentSession] = useState(null);
  const [selectedReplayId,setSelectedReplayId] = useState(() => readText(selectedReplayKey,''));
  const profileRef = useRef(profile);
  const dailyRef = useRef(daily);
  const achievementRef = useRef(achievements);
  const missionRef = useRef(missions);
  const seasonRef = useRef(season);
  const lastRewardRef = useRef(readJSON(lastCompletionKey, null));
  const competitionSetupRef = useRef(competitionSetup);
  const matchesRef = useRef(matches);
  const personalBestsRef = useRef(personalBests);
  const completionMapRef = useRef(completionMap);
  const arenaRunRef = useRef(arenaRun);
  const sessionRef = useRef(currentSession);

  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { dailyRef.current = daily; }, [daily]);
  useEffect(() => { achievementRef.current = achievements; }, [achievements]);
  useEffect(() => { missionRef.current = missions; }, [missions]);
  useEffect(() => { seasonRef.current = season; }, [season]);
  useEffect(() => { competitionSetupRef.current = competitionSetup; }, [competitionSetup]);
  useEffect(() => { matchesRef.current = matches; }, [matches]);
  useEffect(() => { personalBestsRef.current = personalBests; }, [personalBests]);
  useEffect(() => { completionMapRef.current = completionMap; }, [completionMap]);
  useEffect(() => { arenaRunRef.current = arenaRun; }, [arenaRun]);
  useEffect(() => { sessionRef.current = currentSession; }, [currentSession]);

  const saveProfile = useCallback(next => { profileRef.current = next; setProfile(next); writeJSON(profileKey,next); }, []);
  const saveSeason = useCallback(next => { seasonRef.current = next; setSeason(next); writeJSON(seasonKey,next); }, []);
  const saveCompetitionSetup = useCallback(next => { competitionSetupRef.current=next; setCompetitionSetup(next); writeJSON(competitionSetupKey,next); }, []);
  const saveMatches = useCallback(next => { matchesRef.current=next; setMatches(next); writeJSON(matchHistoryKey,next); }, []);
  const savePersonalBests = useCallback(next => { personalBestsRef.current=next; setPersonalBests(next); writeJSON(personalBestKey,next); }, []);
  const saveCompletionMap = useCallback(next => { completionMapRef.current=next; setCompletionMap(next); writeJSON(completionMapKey,next); }, []);
  const saveArenaRun = useCallback(next => { arenaRunRef.current=next; setArenaRun(next); if (next) writeJSON(arenaRunKey,next); else { try { localStorage.removeItem(arenaRunKey); } catch {} } }, []);
  const updateSession = useCallback(updater => {
    const next=typeof updater==='function'?updater(sessionRef.current):updater;
    sessionRef.current=next; setCurrentSession(next); return next;
  },[]);
  const setPlayMode = useCallback(mode => {
    const safe=mode==='ranked'?'ranked':'practice';
    saveCompetitionSetup({ ...competitionSetupRef.current, mode:safe });
  },[saveCompetitionSetup]);
  const ensureCompetitionSetup = useCallback(gameId => {
    if (!gameById(gameId)) return null;
    const current=competitionSetupRef.current;
    const run=arenaRunRef.current;
    const stage=run?.status==='active' ? run.stages?.[run.index] : null;
    if (stage?.gameId===gameId) {
      const next={ ...current,mode:run.mode||current.mode,challengeCodes:{...current.challengeCodes,[gameId]:stage.challengeCode} };
      if (current.challengeCodes?.[gameId]!==stage.challengeCode || current.mode!==next.mode) saveCompetitionSetup(next);
      return stage.challengeCode;
    }
    if (current.challengeCodes?.[gameId]) return current.challengeCodes[gameId];
    const code=createChallengeCode(gameId);
    saveCompetitionSetup({ ...current, challengeCodes:{...current.challengeCodes,[gameId]:code} });
    return code;
  },[saveCompetitionSetup]);
  const setChallengeCode = useCallback((gameId,value) => {
    if (!gameById(gameId)) return null;
    const code=normalizeChallengeCode(value);
    saveCompetitionSetup({ ...competitionSetupRef.current, challengeCodes:{...competitionSetupRef.current.challengeCodes,[gameId]:code} });
    return code;
  },[saveCompetitionSetup]);
  const regenerateChallengeCode = useCallback(gameId => {
    const code=createChallengeCode(gameId);
    setChallengeCode(gameId,code); return code;
  },[setChallengeCode]);
  const setSessionSchoolLevel = useCallback((gameId,level) => {
    if (!gameById(gameId) || !['sd','smp','sma','universitas'].includes(level)) return;
    const current=competitionSetupRef.current;
    if (current.schoolLevels?.[gameId]===level) return;
    saveCompetitionSetup({ ...current, schoolLevels:{...current.schoolLevels,[gameId]:level} });
  },[saveCompetitionSetup]);
  const setSessionUniversityDifficulty = useCallback((gameId,value) => {
    if (!gameById(gameId) || !['hard','very-hard','impossible'].includes(value)) return;
    const current=competitionSetupRef.current;
    if (current.universityDifficulties?.[gameId]===value) return;
    saveCompetitionSetup({ ...current, universityDifficulties:{...current.universityDifficulties,[gameId]:value} });
  },[saveCompetitionSetup]);
  const appendSessionAction = useCallback(action => {
    const current=sessionRef.current;
    if (!current?.active || !gameById(current.gameId)) return;
    const elapsed=Math.max(0,Date.now()-current.startedAt);
    const nextAction={ t:elapsed, ...action };
    const actions=[...(current.actions||[]),nextAction].slice(-240);
    updateSession({ ...current, actions });
  },[updateSession]);
  const beginGameSession = useCallback(gameId => {
    if (!gameById(gameId)) return null;
    let setup=competitionSetupRef.current;
    let code=setup.challengeCodes?.[gameId] || ensureCompetitionSetup(gameId);
    const activeRun=arenaRunRef.current;
    const stage=activeRun?.status==='active' ? activeRun.stages?.[activeRun.index] : null;
    let mode=setup.mode;
    if (stage?.gameId===gameId) { code=stage.challengeCode; mode=activeRun.mode || mode; }
    let check=validateChallengeCode(code,gameId);
    if (!check.valid) { code=createChallengeCode(gameId); setChallengeCode(gameId,code); check=validateChallengeCode(code,gameId); }
    activateSeededRandom(code);
    const level=setup.schoolLevels?.[gameId] || 'sd';
    const universityDifficulty=setup.universityDifficulties?.[gameId] || 'hard';
    const key=bestKey(gameId,level,universityDifficulty);
    const next={ id:`session-${Date.now()}-${gameId}`,gameId,active:true,startedAt:Date.now(),mode,challengeCode:code,seed:check.seed,schoolLevel:level,universityDifficulty,hintsUsed:0,actions:[],personalBestMs:Number(personalBestsRef.current[key])||0,arenaRunId:stage?.gameId===gameId?activeRun.id:null };
    updateSession(next);
    return next;
  },[ensureCompetitionSetup,setChallengeCode,updateSession]);
  const prepareFreshSession = useCallback(gameId => {
    if (!gameById(gameId)) return null;
    const code=createChallengeCode(gameId);
    setChallengeCode(gameId,code);
    activateSeededRandom(code);
    const setup=competitionSetupRef.current;
    const level=setup.schoolLevels?.[gameId]||'sd';
    const universityDifficulty=setup.universityDifficulties?.[gameId]||'hard';
    const next={ id:`session-${Date.now()}-${gameId}`,gameId,active:true,startedAt:Date.now(),mode:setup.mode,challengeCode:code,seed:validateChallengeCode(code,gameId).seed,schoolLevel:level,universityDifficulty,hintsUsed:0,actions:[],personalBestMs:Number(personalBestsRef.current[bestKey(gameId,level,universityDifficulty)])||0,arenaRunId:null };
    updateSession(next); return next;
  },[setChallengeCode,updateSession]);
  const leaveGameSession = useCallback(() => {
    restoreNativeRandom();
    if (sessionRef.current?.active) updateSession({ ...sessionRef.current,active:false,abandonedAt:Date.now() });
  },[updateSession]);
  const requestCoachHint = useCallback((gameId,lang='id') => {
    const current=sessionRef.current;
    const used=current?.gameId===gameId ? Number(current.hintsUsed)||0 : 0;
    if (current?.mode==='ranked' && used>=2) return { limited:true,text:lang==='en'?'Ranked mode allows a maximum of 2 Brain Coach hints.':'Mode Ranked membatasi Brain Coach maksimal 2 hint.',used,remaining:0 };
    const text=coachTip(gameId,used,lang);
    if (current?.gameId===gameId) {
      const next={...current,hintsUsed:used+1,actions:[...(current.actions||[]),{t:Math.max(0,Date.now()-current.startedAt),type:'hint',label:`Brain Coach #${used+1}`}].slice(-240)};
      updateSession(next);
    }
    return { limited:false,text,used:used+1,remaining:current?.mode==='ranked'?Math.max(0,1-used):null };
  },[updateSession]);
  const personalBestFor = useCallback((gameId,level=null,universityDifficulty=null) => {
    const setup=competitionSetupRef.current;
    const lvl=level||setup.schoolLevels?.[gameId]||'sd';
    const uni=universityDifficulty||setup.universityDifficulties?.[gameId]||'hard';
    return Number(personalBestsRef.current[bestKey(gameId,lvl,uni)])||0;
  },[]);
  const selectReplay = useCallback(id => { setSelectedReplayId(id||''); writeText(selectedReplayKey,id||''); },[]);
  const startArenaRun = useCallback((size=3,mode='ranked') => {
    const preset=runPreset(size);
    const id=`run-${Date.now().toString(36)}`;
    const games=nativeShuffle(GAMES).slice(0,preset.count);
    const stages=games.map((game,index)=>({ gameId:game.id,challengeCode:createChallengeCode(game.id,`${id}-${index}-${game.id}`) }));
    const next={ id,preset:preset.id,count:preset.count,mode:mode==='practice'?'practice':'ranked',status:'active',startedAt:Date.now(),index:0,stages,results:[] };
    saveArenaRun(next); return next;
  },[saveArenaRun]);
  const cancelArenaRun = useCallback(() => saveArenaRun(null),[saveArenaRun]);
  const continueArenaRun = useCallback(() => {
    const run=arenaRunRef.current;
    if (!run) return 'arena-run';
    if (run.status==='complete') return 'arena-run';
    return run.stages?.[run.index]?.gameId || 'arena-run';
  },[]);

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
    const next = { ...old, xp:old.xp + reward, xpEvents:[event,...old.xpEvents].slice(0,150) };
    saveProfile(next);
    setNotice(`+${reward} XP`);
    return { ...event, levelBefore:beforeLevel, levelAfter:getLevelInfo(next.xp).level };
  }, [saveProfile]);

  const recordGameCompletion = useCallback((id, meta={}) => {
    const game = gameById(id);
    if (!game) return null;
    const now = Date.now();
    const prior = lastRewardRef.current;
    if (prior?.gameId === id && Number.isFinite(prior.time) && now - prior.time < 2500) return prior;

    const session=sessionRef.current?.gameId===id ? sessionRef.current : null;
    const setup=competitionSetupRef.current;
    const mode=session?.mode || setup.mode || 'practice';
    const level=session?.schoolLevel || setup.schoolLevels?.[id] || 'sd';
    const universityDifficulty=session?.universityDifficulty || setup.universityDifficulties?.[id] || 'hard';
    const challengeCode=session?.challengeCode || setup.challengeCodes?.[id] || createChallengeCode(id);
    const durationMs=session?.startedAt ? Math.max(1000,now-session.startedAt) : 0;
    const outcome=meta.outcome || 'completed';
    const success=['completed','win'].includes(outcome);
    const pbKey=bestKey(id,level,universityDifficulty);
    const previousBestMs=Number(personalBestsRef.current[pbKey])||0;
    const hintsUsed=Number(session?.hintsUsed)||0;
    const performance=performanceForRun({durationMs:durationMs||previousBestMs||60000,previousBestMs,outcome,hintsUsed});
    const rankedDelta=mode==='ranked' ? rankedDeltaFor({grade:performance.grade,outcome,hintsUsed}) : 0;
    const newBest=Boolean(success && durationMs && (!previousBestMs || durationMs<previousBestMs));

    const dateKey = localDateKey();
    const oldProfile = profileRef.current;
    const challenge = getDailyChallenge(GAMES,dateKey);
    const firstOfDay = !oldProfile.playDates.includes(dateKey);
    const alreadyDaily = Boolean(dailyRef.current.completedByDate?.[dateKey]);
    const dailyBonus = challenge.gameId === id && !alreadyDaily ? DAILY_CHALLENGE_XP : 0;
    const firstBonus = firstOfDay ? FIRST_PLAY_XP : 0;
    const eventInfo = eventBonusForGame(game,BASE_COMPLETION_XP,dateKey);
    const eventBonus = eventInfo.bonus;
    const amount = BASE_COMPLETION_XP + firstBonus + dailyBonus + eventBonus;
    const beforeLevel = getLevelInfo(oldProfile.xp).level;
    const gameStats = oldProfile.perGame?.[id] || { completions:0,xp:0,masteryXp:0,lastPlayedAt:null };
    const masteryBefore = getMasteryInfo(gameStats.masteryXp || 0);
    const masteryXp = MASTERY_XP_PER_COMPLETION;
    const masteryAfter = getMasteryInfo((gameStats.masteryXp || 0) + masteryXp);
    const seasonXp = seasonIsActive(dateKey) ? SEASON_COMPLETION_XP : 0;
    const seasonXpBefore = seasonRef.current.xp;
    const seasonBefore = getSeasonLevel(seasonXpBefore);
    const event = { id:`${now}-${id}`, gameId:id, amount, baseXp:BASE_COMPLETION_XP, firstBonus, dailyBonus, eventBonus, dateKey, time:now, source:'game', mode, rankedDelta, performance:performance.score };
    const completionEvent = { id:`play-${now}-${id}`, gameId:id, dateKey, time:now, masteryXp, seasonXp,mode,rankedDelta,performance:performance.score };
    const nextProfile = {
      ...oldProfile,
      xp:oldProfile.xp + amount,
      rankedPoints:Math.max(0,(Number(oldProfile.rankedPoints)||0)+rankedDelta),
      completions:oldProfile.completions + 1,
      playDates:firstOfDay ? [...oldProfile.playDates,dateKey].slice(-400) : oldProfile.playDates,
      perGame:{ ...oldProfile.perGame, [id]:{ completions:(Number(gameStats.completions)||0)+1, xp:(Number(gameStats.xp)||0)+amount, masteryXp:(Number(gameStats.masteryXp)||0)+masteryXp, lastPlayedAt:now, bestPerformance:Math.max(Number(gameStats.bestPerformance)||0,performance.score) } },
      xpEvents:[event,...oldProfile.xpEvents].slice(0,150),
      completionEvents:[completionEvent,...(oldProfile.completionEvents || [])].slice(0,700),
    };
    saveProfile(nextProfile);

    if (seasonXp) saveSeason({ ...seasonRef.current, xp:seasonXpBefore + seasonXp });
    if (dailyBonus) {
      const nextDaily = { completedByDate:{ ...dailyRef.current.completedByDate, [dateKey]:{ gameId:id,completedAt:now,rewardXp:DAILY_CHALLENGE_XP } } };
      dailyRef.current = nextDaily; setDaily(nextDaily); writeJSON(dailyKey,nextDaily);
    }
    if (newBest) savePersonalBests({ ...personalBestsRef.current,[pbKey]:durationMs });
    if (success) {
      const completionKey=levelCompletionKey(level,universityDifficulty);
      const gameMap=completionMapRef.current[id]&&typeof completionMapRef.current[id]==='object'?completionMapRef.current[id]:{};
      saveCompletionMap({ ...completionMapRef.current,[id]:{...gameMap,[completionKey]:gameMap[completionKey]||now} });
    }

    const match={ id:`match-${now}-${id}`,gameId:id,time:now,dateKey,mode,outcome,schoolLevel:level,universityDifficulty:level==='universitas'?universityDifficulty:null,challengeCode,durationMs,performance:performance.score,grade:performance.grade,hintsUsed,rankedDelta,xp:amount,isPersonalBest:newBest,previousBestMs,replay:Array.isArray(session?.actions)?session.actions:[],arenaRunId:session?.arenaRunId||null };
    saveMatches([match,...matchesRef.current.filter(item=>item.id!==match.id)].slice(0,300));
    selectReplay(match.id);

    const activeRun=arenaRunRef.current;
    if (activeRun?.status==='active' && activeRun.stages?.[activeRun.index]?.gameId===id) {
      const results=[...(activeRun.results||[]),{matchId:match.id,gameId:id,durationMs,performance:performance.score,grade:performance.grade,rankedDelta,outcome}];
      const finished=activeRun.index>=activeRun.stages.length-1;
      saveArenaRun({ ...activeRun,results,index:finished?activeRun.index:activeRun.index+1,status:finished?'complete':'active',completedAt:finished?now:null });
    }

    const reward = {
      ...event,
      levelBefore:beforeLevel,
      levelAfter:getLevelInfo(nextProfile.xp).level,
      dailyCompleted:Boolean(dailyBonus),
      event:eventInfo.event,
      eventEligible:eventInfo.eligible,
      masteryXp,
      masteryLevelBefore:masteryBefore.level,
      masteryLevelAfter:masteryAfter.level,
      seasonXp,
      seasonLevelBefore:seasonBefore.level,
      seasonLevelAfter:getSeasonLevel(seasonXpBefore + seasonXp).level,
      durationMs,previousBestMs,isPersonalBest:newBest,performance:performance.score,grade:performance.grade,mode,rankedDelta,hintsUsed,challengeCode,matchId:match.id,arenaRunId:match.arenaRunId,
    };
    if (session) updateSession({ ...session,active:false,endedAt:now,lastMatchId:match.id });
    restoreNativeRandom();
    lastRewardRef.current = reward; writeJSON(lastCompletionKey,reward); setNotice(`+${amount} XP${rankedDelta?` · ${rankedDelta>0?'+':''}${rankedDelta} RP`:''}`);
    return reward;
  }, [saveProfile,saveSeason,savePersonalBests,saveCompletionMap,saveMatches,saveArenaRun,selectReplay,updateSession]);

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

  const claimSeasonReward = useCallback(reward => {
    if (!reward?.id || seasonRef.current.claimed?.[reward.id] || seasonRef.current.xp < reward.xp) return null;
    const next = { ...seasonRef.current, claimed:{ ...seasonRef.current.claimed, [reward.id]:{ claimedAt:Date.now(), rewardXp:reward.rewardXp } } };
    saveSeason(next);
    return grantXp(reward.rewardXp,{ source:'season',id:reward.id });
  }, [grantXp,saveSeason]);

  const updateAccessibility = useCallback((field,value) => {
    const allowed = ['theme','reducedMotion','highContrast','largeText'];
    if (!allowed.includes(field)) return false;
    setAccessibility(previous => {
      const next={...previous,[field]:field==='theme' && ['system','light','dark'].includes(value) ? value : field==='theme' ? previous.theme : Boolean(value)};
      writeJSON(accessibilityKey,next); return next;
    });
    return true;
  }, []);

  const todayKey = localDateKey();
  const levelInfo = useMemo(() => getLevelInfo(profile.xp), [profile.xp]);
  const todayChallenge = useMemo(() => getDailyChallenge(GAMES,todayKey), [todayKey]);
  const completedDateKeys = useMemo(() => Object.keys(daily.completedByDate || {}), [daily.completedByDate]);
  const currentStreak = useMemo(() => calculateDailyStreak(completedDateKeys,todayKey), [completedDateKeys,todayKey]);
  const bestStreak = useMemo(() => bestDailyStreak(completedDateKeys), [completedDateKeys]);
  const dailyCompleted = Boolean(daily.completedByDate?.[todayKey]);
  const missionCards = useMemo(() => allMissionCards(profile,daily,missions.claims,todayKey), [profile,daily,missions.claims,todayKey]);
  const rankInfo = useMemo(() => getRankInfo(profile,daily,achievements), [profile,daily,achievements]);
  const seasonLevel = useMemo(() => getSeasonLevel(season.xp), [season.xp]);
  const activeEvent = useMemo(() => getActiveEvent(todayKey), [todayKey]);
  const selectedBadge = achievementById(achievements.selectedBadge);
  const avatarOption = customizationById(AVATARS,customization.avatar);
  const frameOption = customizationById(PROFILE_FRAMES,customization.frame);
  const titleOption = customizationById(PROFILE_TITLES,customization.title);
  const bannerOption = customizationById(PROFILE_BANNERS,customization.banner);
  const masteryForGame = useCallback(id => masteryFromProfile(profileRef.current,id), []);
  const adaptiveForGame = useCallback(id => adaptiveRecommendation(profileRef.current,id), []);

  const updateCustomization = useCallback((type,id) => {
    const lists = { avatar:AVATARS, frame:PROFILE_FRAMES, title:PROFILE_TITLES, banner:PROFILE_BANNERS };
    const list = lists[type];
    const item = list?.find(option=>option.id===id);
    if (!item) return false;
    const currentLevel = getLevelInfo(profileRef.current.xp);
    const currentRank = getRankInfo(profileRef.current,dailyRef.current,achievementRef.current);
    if (!customizationUnlocked(item,{ profile:profileRef.current,levelInfo:currentLevel,rankInfo:currentRank,achievements:achievementRef.current,daily:dailyRef.current })) return false;
    setCustomization(previous => { const next={...previous,[type]:id}; writeJSON(customizationKey,next); return next; });
    setNotice('Profil diperbarui');
    return true;
  }, []);

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
      saveProfile({ ...old, xp:old.xp + rewardTotal, xpEvents:[...rewardEvents,...old.xpEvents].slice(0,150) });
    }
    const first = fresh[0];
    setNotice(fresh.length === 1 ? `Badge: ${first.title.id} · +${rewardTotal} XP` : `${fresh.length} badge terbuka · +${rewardTotal} XP`);
  }, [profile,daily,saveProfile]);

  useEffect(() => {
    const recordClick=e => {
      if (!sessionRef.current?.active) return;
      const main=e.target?.closest?.('#main-content');
      if (!main) return;
      const target=e.target.closest?.('button,[role="button"],input');
      if (!target) return;
      const label=(target.getAttribute('aria-label')||target.textContent||target.getAttribute('value')||target.tagName).replace(/\s+/g,' ').trim().slice(0,64);
      if (label) appendSessionAction({type:'click',label});
    };
    const recordKey=e => {
      if (!sessionRef.current?.active) return;
      const tag=e.target?.tagName;
      if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
      if (/^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|w|a|s|d|W|A|S|D|Enter|Space)$/.test(e.key)) appendSessionAction({type:'key',label:e.key});
    };
    document.addEventListener('click',recordClick);
    window.addEventListener('keydown',recordKey);
    return()=>{document.removeEventListener('click',recordClick);window.removeEventListener('keydown',recordKey);};
  },[appendSessionAction]);

  useEffect(() => {
    writeText('ba_muted',muted); window.__BA_MUTED__ = muted;
    window.dispatchEvent(new CustomEvent('ba-sound-toggle',{ detail:{ muted } }));
  }, [muted]);
  useEffect(() => {
    const root=document.documentElement;
    root.dataset.baTheme=accessibility.theme;
    root.classList.toggle('ba-reduced-motion',accessibility.reducedMotion);
    root.classList.toggle('ba-high-contrast',accessibility.highContrast);
    root.classList.toggle('ba-large-text',accessibility.largeText);
  }, [accessibility]);
  useEffect(() => {
    const sync = e => {
      if (!e.key || e.key === favoriteKey) setFavorites(loadFavorites());
      if (!e.key || e.key === historyKey) setHistory(loadHistory());
      if (!e.key || e.key === 'ba_muted') setMuted(readText('ba_muted') === 'true');
      if (!e.key || e.key === profileKey) setProfile(loadProfile());
      if (!e.key || e.key === dailyKey) setDaily(loadDaily());
      if (!e.key || e.key === achievementKey) setAchievements(loadAchievements());
      if (!e.key || e.key === missionKey) setMissions(loadMissions());
      if (!e.key || e.key === customizationKey) setCustomization(loadCustomization());
      if (!e.key || e.key === seasonKey) setSeason(loadSeason());
      if (!e.key || e.key === accessibilityKey) setAccessibility(loadAccessibility());
      if (!e.key || e.key === competitionSetupKey) setCompetitionSetup(loadCompetitionSetup());
      if (!e.key || e.key === matchHistoryKey) setMatches(loadMatches());
      if (!e.key || e.key === personalBestKey) setPersonalBests(loadPersonalBests());
      if (!e.key || e.key === completionMapKey) setCompletionMap(loadCompletionMap());
      if (!e.key || e.key === arenaRunKey) setArenaRun(loadArenaRun());
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
    rankInfo,customization,updateCustomization,avatarOption,frameOption,titleOption,bannerOption,
    season,currentSeason:CURRENT_SEASON,seasonLevel,claimSeasonReward,activeEvent,
    masteryForGame,adaptiveForGame,
    competitionSetup,setPlayMode,ensureCompetitionSetup,setChallengeCode,regenerateChallengeCode,setSessionSchoolLevel,setSessionUniversityDifficulty,beginGameSession,prepareFreshSession,leaveGameSession,currentSession,personalBests,personalBestFor,
    matches,selectReplay,selectedReplayId,requestCoachHint,completionMap,
    arenaRun,startArenaRun,cancelArenaRun,continueArenaRun,
    accessibility,updateAccessibility,
  }}>{children}</ArenaContext.Provider>;
}
export function useArena() { return useContext(ArenaContext); }
