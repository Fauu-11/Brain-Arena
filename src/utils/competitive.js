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
  const rng = () => {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.state=()=>value>>>0;
  return rng;
}

export function normalizeChallengeCode(value='') {
  return String(value).toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/-+/g,'-').slice(0,4096);
}

export function createChallengeCode(gameId, token=null) {
  const game = gameById(gameId);
  const raw = token || `${Date.now().toString(36)}${Math.floor(nativeRandom()*0xffffff).toString(36)}`;
  const tail = hashSeed(raw).toString(36).toUpperCase().padStart(7,'0').slice(-7);
  return `BA-${(game?.id || gameId || 'GAME').toUpperCase()}-${tail}`;
}

export function challengeCodeGameId(code='') {
  const parts = normalizeChallengeCode(code).split('-');
  if (!['BA','BA2'].includes(parts[0]) || !parts[1]) return null;
  const id = parts[1].toLowerCase();
  return gameById(id)?.id || null;
}

export function challengeSeed(code='') {
  return hashSeed(normalizeChallengeCode(code) || 'BRAIN-ARENA');
}

const LEVEL_CODES={sd:'SD',smp:'SMP',sma:'SMA',universitas:'UNI'};
const DIFFICULTY_CODES={hard:'H','very-hard':'V',impossible:'I'};
export function challengeConfiguration(code) {
  const parts=normalizeChallengeCode(code).split('-');
  if(parts[0]!=='BA2') return null;
  if(parts.length<7||parts.length>8||parts[5]!=='1'||!gameById(parts[1].toLowerCase())||!/^\w{4,20}$/.test(parts[6])) return null;
  const schoolLevel=Object.keys(LEVEL_CODES).find(k=>LEVEL_CODES[k]===parts[2]);
  const universityDifficulty=Object.keys(DIFFICULTY_CODES).find(k=>DIFFICULTY_CODES[k]===parts[3]);
  // Field 4 reserves the challenge format version, separate from generator rules.
  if(!schoolLevel||!universityDifficulty||parts[4]!=='1') return null;
  let options={};
  if(parts[7]) {
    if(!/^(?:[0-9A-F]{2})+$/.test(parts[7]))return null;
    try{options=JSON.parse(new TextDecoder().decode(Uint8Array.from(parts[7].match(/../g),v=>parseInt(v,16))));}catch{return null;}
    if(!options||typeof options!=='object'||Array.isArray(options))return null;
    const allowed=['mode','difficulty','warPagesCount','practiceQuestionsCount','categories'];
    if(Object.keys(options).some(k=>!allowed.includes(k)))return null;
    if(options.warPagesCount!==undefined&&(!Number.isInteger(options.warPagesCount)||options.warPagesCount<1||options.warPagesCount>10))return null;
    if(options.practiceQuestionsCount!==undefined&&(!Number.isInteger(options.practiceQuestionsCount)||options.practiceQuestionsCount<1||options.practiceQuestionsCount>300))return null;
    if(options.difficulty!==undefined&&!['easy','medium','hard'].includes(options.difficulty))return null;
    if(options.mode!==undefined&&!['pvp','pve','practice_setup','war_setup'].includes(options.mode))return null;
    if(options.categories!==undefined&&(!options.categories||typeof options.categories!=='object'||Array.isArray(options.categories)||Object.values(options.categories).some(v=>typeof v!=='boolean')))return null;
  }
  return {schoolLevel,universityDifficulty,rulesVersion:1,options};
}
export function configuredChallengeCode(code, schoolLevel='sd', universityDifficulty='hard', options=null) {
  const gameId=challengeCodeGameId(code);if(!gameId)return code;
  const previous=challengeConfiguration(code);
  const parts=normalizeChallengeCode(code).split('-');
  const token=parts[0]==='BA2'?parts[6]:parts[2];
  const settings=options??previous?.options??{};
  const json=JSON.stringify(settings);
  const hex=Array.from(new TextEncoder().encode(json),v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
  return `BA2-${gameId.toUpperCase()}-${LEVEL_CODES[schoolLevel]||'SD'}-${DIFFICULTY_CODES[universityDifficulty]||'H'}-1-1-${token}${json==='{}'?'':`-${hex}`}`;
}

export function validateChallengeCode(code, gameId) {
  const normalized = normalizeChallengeCode(code);
  if (!(normalized.startsWith('BA2-')?Boolean(challengeConfiguration(normalized)):/^BA-[A-Z0-9]+-[A-Z0-9]{4,}$/.test(normalized))) return { valid:false, code:normalized, reason:'format' };
  const embedded = challengeCodeGameId(normalized);
  if (!embedded || embedded !== gameId) return { valid:false, code:normalized, reason:'game' };
  return { valid:true, code:normalized, seed:challengeSeed(normalized),config:challengeConfiguration(normalized) };
}

export function activateSeededRandom(code) {
  const seed = challengeSeed(code);
  activeRandom = { code:normalizeChallengeCode(code), seed, rng:mulberry32(seed) };
  return seed;
}

export function randomSnapshot() { return activeRandom ? {code:activeRandom.code,state:activeRandom.rng.state()} : null; }
export function restoreRandomSnapshot(snapshot) {
  if (!snapshot?.code || !Number.isInteger(snapshot.state)) return false;
  activeRandom={code:snapshot.code,seed:challengeSeed(snapshot.code),rng:mulberry32(snapshot.state)};
  return true;
}

export function resetSeededRandom(code) {
  return activateSeededRandom(code);
}

export function restoreNativeRandom() {
  activeRandom = null;
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

export function performanceForRun({ durationMs=0, previousBestMs=0, outcome='completed', hintsUsed=0, accuracy=null }={}) {
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
  if (accuracy !== null && Number.isFinite(Number(accuracy))) score=Math.min(score,Math.round(Math.max(0,Math.min(1,Number(accuracy)))*100));
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

export function sessionRandom(gameId) {
  return activeRandom && challengeCodeGameId(activeRandom.code)===gameId ? activeRandom.rng() : nativeRandom();
}
