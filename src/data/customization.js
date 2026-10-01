import { GAMES } from './games.js';
import { rankGroupAtLeast } from '../utils/rank.js';

export const AVATARS = [
  { id:'player', icon:'user', title:{id:'Pemain',en:'Player'}, unlock:{type:'always'} },
  { id:'mind', icon:'brain', title:{id:'Otak Tajam',en:'Sharp Mind'}, unlock:{type:'level',value:3} },
  { id:'cube', icon:'cube', title:{id:'Pemecah Ruang',en:'Space Solver'}, unlock:{type:'level',value:5} },
  { id:'gamepad', icon:'gamepad', title:{id:'Arena Gamer',en:'Arena Gamer'}, unlock:{type:'rank',value:'silver'} },
  { id:'trophy', icon:'trophy', title:{id:'Juara',en:'Champion'}, unlock:{type:'rank',value:'gold'} },
  { id:'bot', icon:'bot', title:{id:'Logic Bot',en:'Logic Bot'}, unlock:{type:'badges',value:5} },
  { id:'maze', icon:'maze', title:{id:'Maze Runner',en:'Maze Runner'}, unlock:{type:'game',gameId:'maze',value:5} },
  { id:'matrix', icon:'matrix', title:{id:'Memory Core',en:'Memory Core'}, unlock:{type:'game',gameId:'matrix',value:5} },
];

export const PROFILE_FRAMES = [
  { id:'classic', title:{id:'Classic',en:'Classic'}, unlock:{type:'always'} },
  { id:'violet', title:{id:'Violet Pulse',en:'Violet Pulse'}, unlock:{type:'level',value:5} },
  { id:'silver', title:{id:'Silver Circuit',en:'Silver Circuit'}, unlock:{type:'rank',value:'silver'} },
  { id:'gold', title:{id:'Golden Mind',en:'Golden Mind'}, unlock:{type:'rank',value:'gold'} },
  { id:'diamond', title:{id:'Diamond Focus',en:'Diamond Focus'}, unlock:{type:'rank',value:'diamond'} },
  { id:'master', title:{id:'Master Aura',en:'Master Aura'}, unlock:{type:'rank',value:'master'} },
];

export const PROFILE_TITLES = [
  { id:'rookie', title:{id:'Pendatang Arena',en:'Arena Rookie'}, unlock:{type:'always'} },
  { id:'explorer', title:{id:'Penjelajah Pikiran',en:'Mind Explorer'}, unlock:{type:'games',value:5} },
  { id:'daily', title:{id:'Penjaga Streak',en:'Streak Keeper'}, unlock:{type:'streak',value:7} },
  { id:'strategist', title:{id:'Ahli Strategi',en:'Strategist'}, unlock:{type:'rank',value:'gold'} },
  { id:'collector', title:{id:'Kolektor Badge',en:'Badge Collector'}, unlock:{type:'badges',value:8} },
  { id:'master', title:{id:'Master Brain Arena',en:'Brain Arena Master'}, unlock:{type:'completions',value:100} },
];

export const PROFILE_BANNERS = [
  { id:'classic', title:{id:'Classic Arena',en:'Classic Arena'}, unlock:{type:'always'} },
  { id:'focus', title:{id:'Focus Grid',en:'Focus Grid'}, unlock:{type:'level',value:8} },
  { id:'streak', title:{id:'Streak Wave',en:'Streak Wave'}, unlock:{type:'streak',value:5} },
  { id:'elite', title:{id:'Elite Circuit',en:'Elite Circuit'}, unlock:{type:'rank',value:'platinum'} },
];

export const DEFAULT_CUSTOMIZATION = { avatar:'player', frame:'classic', title:'rookie', banner:'classic' };

export function customizationById(list,id) { return list.find(item=>item.id===id) || list[0]; }

export function customizationUnlocked(item, { profile={}, levelInfo={}, rankInfo={}, achievements={}, daily={} } = {}) {
  const rule = item?.unlock || { type:'always' };
  if (rule.type === 'always') return true;
  if (rule.type === 'level') return (Number(levelInfo.level) || 1) >= rule.value;
  if (rule.type === 'rank') return rankGroupAtLeast(rankInfo,rule.value);
  if (rule.type === 'badges') return Object.keys(achievements.unlocked || {}).length >= rule.value;
  if (rule.type === 'completions') return (Number(profile.completions) || 0) >= rule.value;
  if (rule.type === 'game') return (Number(profile.perGame?.[rule.gameId]?.completions) || 0) >= rule.value;
  if (rule.type === 'games') return GAMES.filter(game=>(Number(profile.perGame?.[game.id]?.completions)||0)>0).length >= rule.value;
  if (rule.type === 'streak') {
    const keys = Object.keys(daily.completedByDate || {}).sort();
    let best=0,run=0,prev=null;
    const toDay = key => { const [y,m,d]=String(key).split('-').map(Number); return Date.UTC(y,m-1,d)/86400000; };
    for (const key of keys) { const day=toDay(key); run = prev!==null && day-prev===1 ? run+1 : 1; best=Math.max(best,run); prev=day; }
    return best >= rule.value;
  }
  return false;
}

export function unlockText(item, lang='id') {
  const r=item?.unlock || {type:'always'};
  if (r.type==='always') return lang==='id'?'Terbuka dari awal':'Unlocked from start';
  if (r.type==='level') return lang==='id'?`Capai Level ${r.value}`:`Reach Level ${r.value}`;
  if (r.type==='rank') return lang==='id'?`Capai rank ${String(r.value).toUpperCase()}`:`Reach ${String(r.value).toUpperCase()} rank`;
  if (r.type==='badges') return lang==='id'?`Buka ${r.value} badge`:`Unlock ${r.value} badges`;
  if (r.type==='completions') return lang==='id'?`Selesaikan ${r.value} sesi`:`Complete ${r.value} sessions`;
  if (r.type==='games') return lang==='id'?`Jelajahi ${r.value} game`:`Explore ${r.value} games`;
  if (r.type==='streak') return lang==='id'?`Capai Daily Streak ${r.value}`:`Reach a ${r.value}-day Daily Streak`;
  if (r.type==='game') { const game=GAMES.find(g=>g.id===r.gameId); return lang==='id'?`Selesaikan ${game?.title.id||'game'} ${r.value} kali`:`Complete ${game?.title.en||'game'} ${r.value} times`; }
  return '';
}
