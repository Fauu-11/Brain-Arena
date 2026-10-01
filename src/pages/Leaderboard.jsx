import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { GAMES, gameById } from '../data/games.js';
import { deterministicIndex, localDateKey } from '../utils/progression.js';
import Icon from '../components/Icon.jsx';

const RIVALS = ['Nova','Orion','Luma','Kairo','Vega','Aster','Mira','Nox'];
function seededScore(seed,index,base) {
  const spread = Math.max(120,Math.round(base*.34));
  return Math.max(60, base + (deterministicIndex(`${seed}:${index}`,spread*2+1)-spread));
}

export default function Leaderboard() {
  const { lang } = useLanguage();
  const { profile,levelInfo,rankInfo,avatarOption,frameOption } = useArena();
  const copy = (id,en)=>lang==='id'?id:en;
  const [scope,setScope] = useState('overall');
  const selectedGame = scope==='overall'?null:gameById(scope);
  const yourScore = scope==='overall' ? profile.xp : Number(profile.perGame?.[scope]?.xp)||0;
  const board = useMemo(()=>{
    const baseline = scope==='overall' ? Math.max(900,profile.xp||0) : Math.max(500,Number(profile.perGame?.[scope]?.xp)||0);
    const seed = `${localDateKey()}:${scope}`;
    const rivals = RIVALS.slice(0,7).map((name,index)=>({ id:`bot-${index}`,name:`${name} ${copy('Rival','Rival')}`,score:seededScore(seed,index,baseline),simulated:true }));
    return [...rivals,{ id:'you',name:profile.name||copy('Pemain Lokal','Local Player'),score:yourScore,you:true }].sort((a,b)=>b.score-a.score).map((item,index)=>({...item,rank:index+1}));
  },[scope,profile.xp,profile.name,profile.perGame,lang]);
  const you = board.find(item=>item.you);
  return <div className="progression-page leaderboard-page">
    <section className="progression-hero leaderboard-hero"><div><span className="eyebrow"><Icon name="trophy" size={14}/>{copy('LEADERBOARD','LEADERBOARD')}</span><h1>{copy('Ukur progresmu melawan rival latihan.','See how your progress stacks up.')}</h1><p>{copy('Leaderboard ini bekerja offline. Nama rival adalah simulasi latihan, bukan akun pemain sungguhan. Skor kamu berasal dari progres lokal di perangkat ini.','This leaderboard works offline. Rival names are training simulations, not real player accounts. Your score comes from progress stored on this device.')}</p></div><div className="progression-hero-stat"><small>{copy('POSISIMU','YOUR POSITION')}</small><strong>#{you?.rank || board.length}</strong><span>{selectedGame?selectedGame.title[lang]:`${rankInfo.tier.title[lang]} · ${rankInfo.rating.toLocaleString()} AR`}</span><i><b style={{width:`${Math.max(8,100-((you?.rank||8)-1)*12)}%`}}/></i></div></section>
    <section className="leaderboard-panel"><div className="leaderboard-toolbar"><div><span className="eyebrow">{copy('PAPAN LATIHAN OFFLINE','OFFLINE PRACTICE BOARD')}</span><h2>{selectedGame?selectedGame.title[lang]:copy('Total XP','Total XP')}</h2></div><label><span className="sr-only">{copy('Pilih papan peringkat','Select leaderboard')}</span><select value={scope} onChange={e=>setScope(e.target.value)}><option value="overall">{copy('Keseluruhan · Total XP','Overall · Total XP')}</option>{GAMES.map(game=><option key={game.id} value={game.id}>{game.title[lang]} · XP</option>)}</select><Icon name="down" size={14}/></label></div>
      <div className="podium">{board.slice(0,3).map((item,index)=><article key={item.id} className={`${item.you?'you':''} place-${index+1}`}><span className="podium-rank">{index===0?'1':index===1?'2':'3'}</span><div className={`podium-avatar ${item.you?`frame-${frameOption.id}`:''}`}><Icon name={item.you?avatarOption.icon:'bot'} size={24}/></div><strong>{item.name}</strong><small>{item.score.toLocaleString()} XP</small>{item.you&&<em>{copy('Kamu','You')}</em>}</article>)}</div>
      <div className="leaderboard-table">{board.map(item=><div key={item.id} className={item.you?'you':''}><span className="rank-cell">#{item.rank}</span><span className={`leader-avatar ${item.you?`frame-${frameOption.id}`:''}`}><Icon name={item.you?avatarOption.icon:'bot'} size={16}/></span><span><strong>{item.name}</strong><small>{item.simulated?copy('Rival simulasi','Simulated rival'):copy('Profil lokalmu','Your local profile')}</small></span><b>{item.score.toLocaleString()} XP</b>{item.you&&<span className="you-pill">{copy('KAMU','YOU')}</span>}</div>)}</div>
      <div className="leaderboard-note"><Icon name="shield" size={18}/><p><strong>{copy('Mode offline & transparan','Offline and transparent')}</strong>{copy('Papan ini dibuat agar fitur leaderboard tetap berguna di GitHub Pages tanpa backend. Saat Brain Arena memakai akun/server, rival simulasi dapat diganti dengan ranking pemain nyata.','This board keeps leaderboards useful on GitHub Pages without a backend. Once Brain Arena gains accounts/server support, simulated rivals can be replaced with real player rankings.')}</p></div>
    </section>
  </div>;
}
