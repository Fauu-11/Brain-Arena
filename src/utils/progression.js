export const BASE_COMPLETION_XP = 60;
export const FIRST_PLAY_XP = 25;
export const DAILY_CHALLENGE_XP = 150;

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateKeyToUTC(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function shiftDateKey(key, days) {
  const utc = dateKeyToUTC(key);
  if (utc === null) return key;
  const date = new Date(utc + days * 86400000);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function deterministicIndex(seed, length) {
  if (!Number.isInteger(length) || length <= 0) return 0;
  let hash = 2166136261;
  for (const char of String(seed)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

export function getDailyChallenge(games, date = new Date()) {
  const dateKey = typeof date === 'string' ? date : localDateKey(date);
  const game = games[deterministicIndex(`brain-arena:${dateKey}`, games.length)] || null;
  return {
    dateKey,
    gameId: game?.id || null,
    rewardXp: DAILY_CHALLENGE_XP,
  };
}

export function getLevelInfo(totalXp = 0) {
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
  let level = 1;
  let floor = 0;
  let cost = 250;
  while (xp >= floor + cost && level < 99) {
    floor += cost;
    level += 1;
    cost = 250 + (level - 1) * 50;
  }
  const current = xp - floor;
  const needed = cost;
  return {
    level,
    totalXp: xp,
    currentXp: current,
    neededXp: needed,
    nextLevelXp: floor + cost,
    progress: Math.max(0, Math.min(100, (current / needed) * 100)),
    rank: rankForLevel(level),
  };
}

export function rankForLevel(level) {
  if (level >= 30) return { id: 'Juara Arena', en: 'Arena Champion' };
  if (level >= 20) return { id: 'Mastermind', en: 'Mastermind' };
  if (level >= 15) return { id: 'Ahli Strategi', en: 'Strategist' };
  if (level >= 10) return { id: 'Pemikir', en: 'Thinker' };
  if (level >= 5) return { id: 'Penjelajah', en: 'Explorer' };
  return { id: 'Pemula', en: 'Rookie' };
}

export function calculateDailyStreak(completedDateKeys = [], todayKey = localDateKey()) {
  const set = new Set((completedDateKeys || []).filter(key => dateKeyToUTC(key) !== null));
  let cursor = set.has(todayKey) ? todayKey : shiftDateKey(todayKey, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function bestDailyStreak(completedDateKeys = []) {
  const keys = [...new Set((completedDateKeys || []).filter(key => dateKeyToUTC(key) !== null))].sort();
  let best = 0;
  let run = 0;
  let previous = null;
  for (const key of keys) {
    if (previous && shiftDateKey(previous, 1) === key) run += 1;
    else run = 1;
    best = Math.max(best, run);
    previous = key;
  }
  return best;
}
