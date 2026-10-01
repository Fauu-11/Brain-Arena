import { CATEGORIES, GAMES } from '../data/games.js';
import { localDateKey, shiftDateKey } from './progression.js';

const sum = values => values.reduce((total,value)=>total+(Number(value)||0),0);

export function buildAdvancedStatistics(profile = {}, daily = {}, todayKey = localDateKey()) {
  const completionEvents = Array.isArray(profile.completionEvents) ? profile.completionEvents : [];
  const xpEvents = Array.isArray(profile.xpEvents) ? profile.xpEvents : [];
  const perGame = profile.perGame || {};
  const last7 = Array.from({length:7},(_,index)=>shiftDateKey(todayKey,index-6)).map(dateKey=>({
    dateKey,
    sessions:completionEvents.filter(event=>event.dateKey===dateKey).length,
    xp:sum(xpEvents.filter(event=>event.dateKey===dateKey).map(event=>event.amount)),
  }));
  const last28 = Array.from({length:28},(_,index)=>shiftDateKey(todayKey,index-27)).map(dateKey=>({ dateKey, sessions:completionEvents.filter(event=>event.dateKey===dateKey).length }));
  const gameStats = GAMES.map(game=>({
    game,
    completions:Number(perGame[game.id]?.completions)||0,
    xp:Number(perGame[game.id]?.xp)||0,
    lastPlayedAt:Number(perGame[game.id]?.lastPlayedAt)||null,
  })).sort((a,b)=>b.completions-a.completions || b.xp-a.xp);
  const categoryStats = Object.keys(CATEGORIES).filter(key=>key!=='all').map(category=>{
    const games=GAMES.filter(game=>game.category===category);
    const completions=sum(games.map(game=>perGame[game.id]?.completions));
    const xp=sum(games.map(game=>perGame[game.id]?.xp));
    return { category, completions, xp };
  });
  const activeGames=gameStats.filter(item=>item.completions>0).length;
  const activeDates=[...new Set(completionEvents.map(event=>event.dateKey).filter(Boolean))];
  const totalSessions=Number(profile.completions)||0;
  const totalXp=Number(profile.xp)||0;
  const dailyDone=Object.keys(daily.completedByDate||{}).length;
  const sessionDays=[...activeDates].sort();
  let activityBest=0,run=0,prev=null;
  const toDay=key=>{ const [y,m,d]=String(key).split('-').map(Number); return Date.UTC(y,m-1,d)/86400000; };
  for (const key of sessionDays) { const day=toDay(key); run=prev!==null&&day-prev===1?run+1:1; activityBest=Math.max(activityBest,run); prev=day; }
  const mostPlayed=gameStats[0]?.completions ? gameStats[0] : null;
  const leastPlayed=[...gameStats].filter(item=>item.completions>0).sort((a,b)=>a.completions-b.completions)[0] || null;
  return {
    totalSessions,totalXp,activeGames,activeDays:activeDates.length,dailyDone,activityBest,mostPlayed,leastPlayed,
    avgXpPerSession:totalSessions?Math.round(totalXp/totalSessions):0,
    avgSessionsPerActiveDay:activeDates.length?Number((totalSessions/activeDates.length).toFixed(1)):0,
    diversityPercent:Math.round((activeGames/GAMES.length)*100),
    last7,last28,gameStats,categoryStats,
    weekSessions:sum(last7.map(day=>day.sessions)),
    weekXp:sum(last7.map(day=>day.xp)),
  };
}
