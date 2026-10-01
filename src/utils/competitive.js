import { gameById } from '../data/games.js';

const nativeRandom = Math.random.bind(Math);
let activeRandom = null;

export const COMPETITIVE_LEVEL_KEYS = ['sd','smp','sma','uni-hard','uni-very-hard','uni-impossible'];

export function hashSeed(input='brain-arena') {
  let h = 2166136261 >>> 0;
  for (let i=0;i<String(input).length;i+=1) {
    h ^= String(input).charCodeAt(i);
    h = Math.imul(h,16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normalizeChallengeCode(value='') {
  return String(value).toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/-+/g,'-').slice(0,32);
}

export function createChallengeCode(gameId, token=null) {
  const game = gameById(gameId);
  const raw = token || `${Date.now().toString(36)}${Math.floor(nativeRandom()*0xffffff).toString(36)}`;
  const tail = hashSeed(raw).toString(36).toUpperCase().padStart(7,'0').slice(-7);
  return `BA-${(game?.id || gameId || 'GAME').toUpperCase()}-${tail}`;
}

export function challengeCodeGameId(code='') {
  const parts = normalizeChallengeCode(code).split('-');
  if (parts[0] !== 'BA' || !parts[1]) return null;
  const id = parts[1].toLowerCase();
  return gameById(id)?.id || null;
}

export function challengeSeed(code='') {
  return hashSeed(normalizeChallengeCode(code) || 'BRAIN-ARENA');
}

export function validateChallengeCode(code, gameId) {
  const normalized = normalizeChallengeCode(code);
  if (!/^BA-[A-Z0-9]+-[A-Z0-9]{4,}$/.test(normalized)) return { valid:false, code:normalized, reason:'format' };
  const embedded = challengeCodeGameId(normalized);
  if (!embedded || embedded !== gameId) return { valid:false, code:normalized, reason:'game' };
  return { valid:true, code:normalized, seed:challengeSeed(normalized) };
}

export function activateSeededRandom(code) {
  const seed = challengeSeed(code);
  activeRandom = { code:normalizeChallengeCode(code), seed, rng:mulberry32(seed) };
  Math.random = () => activeRandom?.rng?.() ?? nativeRandom();
  return seed;
}

export function resetSeededRandom(code) {
  return activateSeededRandom(code);
}

export function restoreNativeRandom() {
  activeRandom = null;
  Math.random = nativeRandom;
}

export function nativeShuffle(values=[]) {
  const result=[...values];
  for (let i=result.length-1;i>0;i-=1) {
    const j=Math.floor(nativeRandom()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

export function levelCompletionKey(level='sd', universityDifficulty='hard') {
  if (level !== 'universitas') return ['sd','smp','sma'].includes(level) ? level : 'sd';
  const difficulty=['hard','very-hard','impossible'].includes(universityDifficulty) ? universityDifficulty : 'hard';
  return `uni-${difficulty}`;
}

export function bestKey(gameId, level='sd', universityDifficulty='hard') {
  return `${gameId}:${levelCompletionKey(level, universityDifficulty)}`;
}

export function formatDuration(ms=0) {
  const total=Math.max(0,Math.round((Number(ms)||0)/1000));
  const minutes=Math.floor(total/60);
  const seconds=total%60;
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

export function performanceForRun({ durationMs=0, previousBestMs=0, outcome='completed', hintsUsed=0 }={}) {
  const duration=Math.max(1,Number(durationMs)||1);
  const previous=Math.max(0,Number(previousBestMs)||0);
  let score;
  if (outcome === 'loss') score=48;
  else if (outcome === 'draw') score=68;
  else if (!previous) score=84;
  else {
    const ratio=previous/duration;
    score=Math.round(Math.max(55,Math.min(100,70 + (ratio-0.75)*80)));
    if (duration < previous) score=Math.max(score,96);
  }
  score=Math.max(35,Math.min(100,score-(Math.max(0,hintsUsed)*4)));
  const grade=score>=96?'S':score>=88?'A':score>=78?'B':score>=65?'C':'D';
  return { score, grade };
}

export function rankedDeltaFor({ grade='C', outcome='completed', hintsUsed=0 }={}) {
  if (outcome === 'loss') return -12;
  if (outcome === 'draw') return Math.max(2,6-(hintsUsed*2));
  const values={S:30,A:24,B:18,C:12,D:6};
  return Math.max(2,(values[grade]||8)-(hintsUsed*3));
}

export function runPreset(size) {
  const count=Math.max(3,Math.min(12,Number(size)||3));
  if (count<=3) return { id:'quick',count:3,label:{id:'Quick Run',en:'Quick Run'} };
  if (count<=5) return { id:'standard',count:5,label:{id:'Standard Run',en:'Standard Run'} };
  if (count<=8) return { id:'master',count:8,label:{id:'Master Run',en:'Master Run'} };
  return { id:'ultimate',count:12,label:{id:'Ultimate Run',en:'Ultimate Run'} };
}
