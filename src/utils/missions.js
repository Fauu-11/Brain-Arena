import { CATEGORIES, GAMES, gameById } from '../data/games.js';
import { deterministicIndex, localDateKey, shiftDateKey } from './progression.js';

function dateKeyToUTC(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function weekStartKey(dateKey = localDateKey()) {
  const utc = dateKeyToUTC(dateKey);
  if (utc === null) return dateKey;
  const date = new Date(utc);
  const day = date.getUTCDay() || 7;
  return shiftDateKey(dateKey, 1 - day);
}

export function weekKey(dateKey = localDateKey()) { return `week:${weekStartKey(dateKey)}`; }

export function missionSets(dateKey = localDateKey()) {
  const categories = ['math','logic','memory','strategy'];
  const category = categories[deterministicIndex(`mission-category:${dateKey}`, categories.length)];
  const daily = [
    { id:'daily-sessions', scope:'daily', icon:'gamepad', rewardXp:80, target:2, title:{id:'Pemanasan Harian',en:'Daily Warm-up'}, description:{id:'Selesaikan 2 sesi permainan hari ini.',en:'Complete 2 game sessions today.'}, type:'sessions' },
    { id:'daily-variety', scope:'daily', icon:'grid', rewardXp:70, target:2, title:{id:'Ganti Arena',en:'Switch It Up'}, description:{id:'Selesaikan 2 game yang berbeda hari ini.',en:'Complete 2 different games today.'}, type:'distinct-games' },
    { id:`daily-${category}`, scope:'daily', icon:category === 'math' ? 'bolt' : category === 'logic' ? 'cube' : category === 'memory' ? 'brain' : 'dice', rewardXp:90, target:1, category, title:{id:`Fokus ${CATEGORIES[category].id}`,en:`${CATEGORIES[category].en} Focus`}, description:{id:`Selesaikan 1 game kategori ${CATEGORIES[category].id}.`,en:`Complete 1 ${CATEGORIES[category].en.toLowerCase()} game.`}, type:'category' },
  ];
  const weekly = [
    { id:'weekly-sessions', scope:'weekly', icon:'trophy', rewardXp:300, target:10, title:{id:'Maraton Mingguan',en:'Weekly Marathon'}, description:{id:'Selesaikan 10 sesi dalam minggu ini.',en:'Complete 10 sessions this week.'}, type:'sessions' },
    { id:'weekly-variety', scope:'weekly', icon:'grid', rewardXp:250, target:5, title:{id:'Penjelajah Mingguan',en:'Weekly Explorer'}, description:{id:'Selesaikan 5 game berbeda minggu ini.',en:'Complete 5 different games this week.'}, type:'distinct-games' },
    { id:'weekly-daily', scope:'weekly', icon:'spark', rewardXp:350, target:3, title:{id:'Konsisten Harian',en:'Daily Discipline'}, description:{id:'Selesaikan Daily Challenge pada 3 hari berbeda minggu ini.',en:'Complete Daily Challenge on 3 different days this week.'}, type:'daily-challenges' },
  ];
  return { daily, weekly, category };
}

function inRange(key, start, end) { return key >= start && key <= end; }

export function missionProgress(mission, profile = {}, daily = {}, dateKey = localDateKey()) {
  const start = mission.scope === 'daily' ? dateKey : weekStartKey(dateKey);
  const end = mission.scope === 'daily' ? dateKey : shiftDateKey(start, 6);
  const events = (profile.completionEvents || []).filter(event => event && inRange(event.dateKey, start, end) && gameById(event.gameId));
  let current = 0;
  if (mission.type === 'sessions') current = events.length;
  if (mission.type === 'distinct-games') current = new Set(events.map(event => event.gameId)).size;
  if (mission.type === 'category') current = events.filter(event => gameById(event.gameId)?.category === mission.category).length;
  if (mission.type === 'daily-challenges') current = Object.keys(daily.completedByDate || {}).filter(key => inRange(key, start, end)).length;
  return { current:Math.min(current, mission.target), rawCurrent:current, target:mission.target, complete:current >= mission.target, percent:Math.min(100, (current / mission.target) * 100), start, end };
}

export function missionClaimKey(mission, dateKey = localDateKey()) {
  return `${mission.scope}:${mission.scope === 'daily' ? dateKey : weekStartKey(dateKey)}:${mission.id}`;
}

export function allMissionCards(profile, daily, claims = {}, dateKey = localDateKey()) {
  const sets = missionSets(dateKey);
  return [...sets.daily, ...sets.weekly].map(mission => {
    const progress = missionProgress(mission, profile, daily, dateKey);
    const claimKey = missionClaimKey(mission, dateKey);
    return { ...mission, ...progress, claimKey, claimed:Boolean(claims[claimKey]) };
  });
}

export function missionGameLabel(mission, lang = 'id') {
  if (mission.category) return CATEGORIES[mission.category]?.[lang] || mission.category;
  const game = mission.gameId ? gameById(mission.gameId) : null;
  return game?.title?.[lang] || '';
}
