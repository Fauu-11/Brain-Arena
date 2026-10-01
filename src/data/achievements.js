import { GAMES } from './games.js';
import { bestDailyStreak, getLevelInfo } from '../utils/progression.js';

export const ACHIEVEMENTS = [
  { id:'first-finish', icon:'flag', color:'purple', rewardXp:50, title:{id:'Langkah Pertama',en:'First Finish'}, description:{id:'Selesaikan 1 sesi permainan.',en:'Complete your first game session.'}, target:1, metric:'completions' },
  { id:'five-finish', icon:'bolt', color:'blue', rewardXp:100, title:{id:'Pemanasan Selesai',en:'Warmed Up'}, description:{id:'Selesaikan 5 sesi permainan.',en:'Complete 5 game sessions.'}, target:5, metric:'completions' },
  { id:'twenty-five', icon:'trophy', color:'yellow', rewardXp:200, title:{id:'Veteran Arena',en:'Arena Veteran'}, description:{id:'Selesaikan 25 sesi permainan.',en:'Complete 25 game sessions.'}, target:25, metric:'completions' },
  { id:'level-five', icon:'spark', color:'lavender', rewardXp:150, title:{id:'Naik Kelas',en:'Leveling Up'}, description:{id:'Capai Level 5.',en:'Reach Level 5.'}, target:5, metric:'level' },
  { id:'xp-2500', icon:'star', color:'purple', rewardXp:250, title:{id:'Bank XP',en:'XP Vault'}, description:{id:'Kumpulkan 2.500 XP.',en:'Earn 2,500 XP.'}, target:2500, metric:'xp' },
  { id:'explorer', icon:'grid', color:'mint', rewardXp:250, title:{id:'Penjelajah Arena',en:'Arena Explorer'}, description:{id:'Selesaikan setidaknya 1 sesi di semua game.',en:'Complete at least 1 session in every game.'}, target:GAMES.length, metric:'games' },
  { id:'daily-three', icon:'clock', color:'peach', rewardXp:180, title:{id:'Tiga Hari Panas',en:'Three-Day Spark'}, description:{id:'Bangun Daily Streak 3 hari.',en:'Build a 3-day Daily Challenge streak.'}, target:3, metric:'streak' },
  { id:'daily-seven', icon:'trophy', color:'pink', rewardXp:350, title:{id:'Seminggu Tanpa Putus',en:'Perfect Week'}, description:{id:'Capai streak Daily Challenge 7 hari.',en:'Reach a 7-day Daily Challenge streak.'}, target:7, metric:'streak' },
  { id:'mine-ten', icon:'mine', color:'mint', rewardXp:200, title:{id:'Pemburu Ranjau',en:'Mine Hunter'}, description:{id:'Selesaikan Minesweeper 10 kali.',en:'Complete Minesweeper 10 times.'}, target:10, metric:'game', gameId:'minesweeper' },
  { id:'maze-ten', icon:'maze', color:'blue', rewardXp:200, title:{id:'Pelari Labirin',en:'Maze Runner'}, description:{id:'Selesaikan Maze Escape 10 kali.',en:'Complete Maze Escape 10 times.'}, target:10, metric:'game', gameId:'maze' },
  { id:'matrix-ten', icon:'matrix', color:'lavender', rewardXp:200, title:{id:'Master Memori',en:'Memory Master'}, description:{id:'Selesaikan Memory Matrix 10 kali.',en:'Complete Memory Matrix 10 times.'}, target:10, metric:'game', gameId:'matrix' },
  { id:'hundred-sessions', icon:'brain', color:'purple', rewardXp:500, title:{id:'Master Brain Arena',en:'Brain Arena Master'}, description:{id:'Selesaikan 100 sesi permainan.',en:'Complete 100 game sessions.'}, target:100, metric:'completions' },
];

export function achievementProgress(achievement, profile = {}, daily = {}) {
  const perGame = profile.perGame || {};
  const completedDaily = Object.keys(daily.completedByDate || {});
  let current = 0;
  if (achievement.metric === 'completions') current = Number(profile.completions) || 0;
  if (achievement.metric === 'level') current = getLevelInfo(profile.xp || 0).level;
  if (achievement.metric === 'xp') current = Number(profile.xp) || 0;
  if (achievement.metric === 'games') current = GAMES.filter(game => (Number(perGame[game.id]?.completions) || 0) > 0).length;
  if (achievement.metric === 'streak') current = bestDailyStreak(completedDaily);
  if (achievement.metric === 'game') current = Number(perGame[achievement.gameId]?.completions) || 0;
  return { current: Math.max(0, current), target:achievement.target, complete:current >= achievement.target, percent:Math.min(100, (current / achievement.target) * 100) };
}

export function newlyCompletedAchievements(profile, daily, unlocked = {}) {
  return ACHIEVEMENTS.filter(item => !unlocked[item.id] && achievementProgress(item, profile, daily).complete);
}

export function achievementById(id) { return ACHIEVEMENTS.find(item => item.id === id) || null; }
