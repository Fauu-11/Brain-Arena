import React from 'react';
import Icon from '../components/Icon.jsx';
import { GAMES, CATEGORIES } from '../data/games.js';
import { useArena } from '../context/ArenaContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Mastery({onNavigate}) {
  const {lang}=useLanguage(); const copy=(id,en)=>lang==='en'?en:id; const {masteryForGame}=useArena();
  const sorted=[...GAMES].map(game=>({game,mastery:masteryForGame(game.id)})).sort((a,b)=>b.mastery.xp-a.mastery.xp);
  const total=sorted.reduce((sum,item)=>sum+item.mastery.xp,0);
  return <div className="meta-page mastery-page"><div className="page-heading"><div><span className="eyebrow">GAME MASTERY</span><h1>{copy('Kuasai setiap arena.','Master every arena.')}</h1><p className="page-intro">{copy('Setiap sesi selesai memberi Mastery XP khusus untuk game tersebut.','Every completed session earns Mastery XP for that specific game.')}</p></div><span className="mastery-total"><Icon name="trophy" size={18}/>{total.toLocaleString()} MXP</span></div>
    <div className="mastery-grid">{sorted.map(({game,mastery})=><article key={game.id} className={`mastery-card color-${game.color}`}><div className="mastery-card-head"><span className="mini-game-icon"><Icon name={game.icon} size={20}/></span><div><small>{CATEGORIES[game.category][lang]}</small><h2>{game.title[lang]}</h2></div><span className="mastery-level">Lv. {mastery.level}</span></div><div className="mastery-rank"><strong>{mastery.tier[lang]}</strong><span>{mastery.xp.toLocaleString()} MXP</span></div><div className="mastery-progress"><span><b style={{width:`${mastery.progress}%`}}/></span><small>{mastery.currentXp}/{mastery.neededXp}</small></div><button onClick={()=>onNavigate(game.id)}>{copy('Latih mastery','Train mastery')}<Icon name="arrow" size={15}/></button></article>)}</div>
  </div>;
}
