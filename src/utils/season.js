import { localDateKey } from './progression.js';

export const SEASON_COMPLETION_XP = 40;

export const CURRENT_SEASON = {
  id:'mind-explorer-2026',
  number:1,
  title:{ id:'Mind Explorer', en:'Mind Explorer' },
  subtitle:{ id:'Jelajahi 12 arena dan bangun kebiasaan latihan yang konsisten.', en:'Explore 12 arenas and build a consistent training habit.' },
  start:'2026-10-01',
  end:'2026-11-30',
  rewards:[
    { id:'s1-1', xp:250, rewardXp:75, label:{id:'Bekal Awal',en:'Starter Pack'} },
    { id:'s1-2', xp:600, rewardXp:100, label:{id:'Penjelajah Aktif',en:'Active Explorer'} },
    { id:'s1-3', xp:1100, rewardXp:150, label:{id:'Pikiran Tajam',en:'Sharp Mind'} },
    { id:'s1-4', xp:1800, rewardXp:200, label:{id:'Arena Specialist',en:'Arena Specialist'} },
    { id:'s1-5', xp:2700, rewardXp:300, label:{id:'Mind Explorer',en:'Mind Explorer'} },
    { id:'s1-6', xp:3800, rewardXp:450, label:{id:'Season Champion',en:'Season Champion'} },
  ],
};

export function seasonIsActive(dateKey = localDateKey(), season = CURRENT_SEASON) {
  return dateKey >= season.start && dateKey <= season.end;
}

export function getSeasonLevel(seasonXp = 0, season = CURRENT_SEASON) {
  const xp = Math.max(0,Math.floor(Number(seasonXp)||0));
  let level = 1;
  let floor = 0;
  let cost = 200;
  while (xp >= floor + cost && level < 30) {
    floor += cost;
    level += 1;
    cost = 200 + (level - 1) * 35;
  }
  return { level, xp, currentXp:xp-floor, neededXp:cost, progress:Math.max(0,Math.min(100,((xp-floor)/cost)*100)), nextLevelXp:floor+cost };
}

export function nextSeasonReward(seasonXp = 0, claimed = {}, season = CURRENT_SEASON) {
  return season.rewards.find(item => !claimed[item.id] && seasonXp < item.xp) || season.rewards.find(item => !claimed[item.id]) || null;
}
