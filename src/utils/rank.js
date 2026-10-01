import { GAMES } from '../data/games.js';
import { bestDailyStreak } from './progression.js';

export const RANK_TIERS = [
  { id:'bronze-1', group:'bronze', division:'III', min:0, title:{id:'Bronze III',en:'Bronze III'} },
  { id:'bronze-2', group:'bronze', division:'II', min:200, title:{id:'Bronze II',en:'Bronze II'} },
  { id:'bronze-3', group:'bronze', division:'I', min:400, title:{id:'Bronze I',en:'Bronze I'} },
  { id:'silver-1', group:'silver', division:'III', min:700, title:{id:'Silver III',en:'Silver III'} },
  { id:'silver-2', group:'silver', division:'II', min:1000, title:{id:'Silver II',en:'Silver II'} },
  { id:'silver-3', group:'silver', division:'I', min:1350, title:{id:'Silver I',en:'Silver I'} },
  { id:'gold-1', group:'gold', division:'III', min:1750, title:{id:'Gold III',en:'Gold III'} },
  { id:'gold-2', group:'gold', division:'II', min:2200, title:{id:'Gold II',en:'Gold II'} },
  { id:'gold-3', group:'gold', division:'I', min:2700, title:{id:'Gold I',en:'Gold I'} },
  { id:'platinum-1', group:'platinum', division:'III', min:3300, title:{id:'Platinum III',en:'Platinum III'} },
  { id:'platinum-2', group:'platinum', division:'II', min:4000, title:{id:'Platinum II',en:'Platinum II'} },
  { id:'platinum-3', group:'platinum', division:'I', min:4800, title:{id:'Platinum I',en:'Platinum I'} },
  { id:'diamond-1', group:'diamond', division:'III', min:5700, title:{id:'Diamond III',en:'Diamond III'} },
  { id:'diamond-2', group:'diamond', division:'II', min:6700, title:{id:'Diamond II',en:'Diamond II'} },
  { id:'diamond-3', group:'diamond', division:'I', min:7800, title:{id:'Diamond I',en:'Diamond I'} },
  { id:'master', group:'master', division:'', min:9200, title:{id:'Master',en:'Master'} },
  { id:'grandmaster', group:'grandmaster', division:'', min:11000, title:{id:'Grandmaster',en:'Grandmaster'} },
];

export function calculateArenaRating(profile = {}, daily = {}, achievements = {}) {
  const xp = Math.max(0, Number(profile.xp) || 0);
  const completions = Math.max(0, Number(profile.completions) || 0);
  const badges = Object.keys(achievements.unlocked || {}).length;
  const explored = GAMES.filter(game => (Number(profile.perGame?.[game.id]?.completions) || 0) > 0).length;
  const streak = bestDailyStreak(Object.keys(daily.completedByDate || {}));
  const ranked = Math.max(0, Number(profile.rankedPoints) || 0);
  const parts = {
    xp:Math.floor(xp / 5),
    completions:completions * 10,
    badges:badges * 45,
    streak:streak * 20,
    explored:explored * 30,
    ranked,
  };
  return { rating:Object.values(parts).reduce((sum,value)=>sum+value,0), parts, badges, explored, streak };
}

export function getRankInfo(profile = {}, daily = {}, achievements = {}) {
  const ratingData = calculateArenaRating(profile,daily,achievements);
  const rating = ratingData.rating;
  let index = 0;
  for (let i=0;i<RANK_TIERS.length;i+=1) if (rating >= RANK_TIERS[i].min) index = i;
  const tier = RANK_TIERS[index];
  const next = RANK_TIERS[index + 1] || null;
  const span = next ? next.min - tier.min : 1;
  const current = Math.max(0,rating-tier.min);
  const progress = next ? Math.min(100,(current/span)*100) : 100;
  return {
    ...ratingData,
    tier,
    next,
    current,
    needed:next ? span : 0,
    remaining:next ? Math.max(0,next.min-rating) : 0,
    progress,
    tierIndex:index,
    maxed:!next,
  };
}

export function rankGroupAtLeast(rankInfo, group) {
  const order = ['bronze','silver','gold','platinum','diamond','master','grandmaster'];
  return order.indexOf(rankInfo?.tier?.group || 'bronze') >= order.indexOf(group);
}
