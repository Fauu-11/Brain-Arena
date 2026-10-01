import { GAMES, gameById } from '../data/games.js';

const gradeScore={S:5,A:4,B:3,C:2,D:1};
const average=(values)=>values.length?values.reduce((sum,value)=>sum+(Number(value)||0),0)/values.length:0;

export function filterMatchesByRange(matches=[],range='30',now=Date.now()) {
  if(range==='all') return matches;
  const days=range==='7'?7:range==='season'?90:30;
  const cutoff=now-days*86400000;
  return matches.filter(item=>Number(item.time)>=cutoff);
}

export function buildPerformanceAnalytics(matches=[],range='30',now=Date.now()) {
  const list=filterMatchesByRange(Array.isArray(matches)?matches:[],range,now);
  const ranked=list.filter(item=>item.mode==='ranked');
  const success=list.filter(item=>['completed','win'].includes(item.outcome));
  const avgPerformance=Math.round(average(list.map(item=>item.performance)));
  const avgGradeValue=average(list.map(item=>gradeScore[item.grade]||1));
  const avgGrade=avgGradeValue>=4.7?'S':avgGradeValue>=3.8?'A':avgGradeValue>=2.8?'B':avgGradeValue>=1.8?'C':list.length?'D':'—';
  const pbImproved=list.filter(item=>item.isPersonalBest).length;
  const rp=ranked.reduce((sum,item)=>sum+(Number(item.rankedDelta)||0),0);
  const totalActions=list.reduce((sum,item)=>sum+(Array.isArray(item.replay)?item.replay.length:0),0);
  const hints=list.reduce((sum,item)=>sum+(Number(item.hintsUsed)||0),0);
  const perGame=GAMES.map(game=>{
    const rows=list.filter(item=>item.gameId===game.id);
    const wins=rows.filter(item=>['completed','win'].includes(item.outcome)).length;
    return {
      game,
      sessions:rows.length,
      avgPerformance:Math.round(average(rows.map(item=>item.performance))),
      avgDuration:Math.round(average(rows.map(item=>item.durationMs))),
      winRate:rows.length?Math.round((wins/rows.length)*100):0,
      pb:rows.filter(item=>item.isPersonalBest).length,
    };
  }).sort((a,b)=>b.sessions-a.sessions||b.avgPerformance-a.avgPerformance);
  const bestGame=perGame.find(item=>item.sessions>0)||null;
  const daily=new Map();
  for(const item of list){const key=item.dateKey||new Date(item.time).toISOString().slice(0,10);const row=daily.get(key)||{dateKey:key,sessions:0,performance:0,total:0};row.sessions+=1;row.total+=(Number(item.performance)||0);row.performance=Math.round(row.total/row.sessions);daily.set(key,row);}
  const trend=[...daily.values()].sort((a,b)=>a.dateKey.localeCompare(b.dateKey)).slice(-30);
  return {list,total:list.length,ranked:ranked.length,winRate:list.length?Math.round((success.length/list.length)*100):0,avgPerformance,avgGrade,pbImproved,rp,totalActions,hints,perGame,bestGame,trend};
}

export function analyticsGameTitle(gameId,lang='id'){return gameById(gameId)?.title?.[lang]||gameId;}
