import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { GAMES } from '../data/games.js';
import { COMPETITIVE_LEVEL_KEYS } from '../utils/competitive.js';
import Icon from '../components/Icon.jsx';

const LABELS={sd:'SD',smp:'SMP',sma:'SMA','uni-hard':'Hard','uni-very-hard':'Very Hard','uni-impossible':'Impossible'};
export default function GameCompletion({ onNavigate }) {
  const {lang}=useLanguage(); const {completionMap}=useArena(); const copy=(id,en)=>lang==='id'?id:en;
  const total=GAMES.length*COMPETITIVE_LEVEL_KEYS.length;
  const done=GAMES.reduce((sum,g)=>sum+COMPETITIVE_LEVEL_KEYS.filter(key=>completionMap[g.id]?.[key]).length,0);
  const percent=Math.round((done/total)*100);
  return <div className="competitive-page completion-page"><section className="competitive-hero"><div><span className="section-eyebrow"><Icon name="medal" size={15}/>{copy('GAME COMPLETION','GAME COMPLETION')}</span><h1>{copy('Kuasai seluruh Brain Arena','Master the entire Brain Arena')}</h1><p>{copy('Selesaikan setiap game di SD, SMP, SMA, lalu taklukkan Arena Universitas Hard, Very Hard, dan Impossible.','Complete every game at Primary, Middle, High School, then conquer University Arena Hard, Very Hard, and Impossible.')}</p></div><div className="hero-stat"><span>{copy('TOTAL COMPLETION','TOTAL COMPLETION')}</span><strong>{percent}%</strong><small>{done}/{total} {copy('target','targets')}</small></div></section>
    <div className="completion-overview"><div><span>{copy('Progress keseluruhan','Overall progress')}</span><strong>{done} / {total}</strong></div><div className="completion-bar"><i style={{width:`${percent}%`}}/></div></div>
    <div className="completion-grid">{GAMES.map(game=>{ const gameDone=COMPETITIVE_LEVEL_KEYS.filter(key=>completionMap[game.id]?.[key]).length; const complete=gameDone===COMPETITIVE_LEVEL_KEYS.length; return <article key={game.id} className={`completion-card ${complete?'complete':''}`}><div className="completion-card-head"><span className={`mini-game-icon color-${game.color}`}><Icon name={game.icon} size={18}/></span><div><strong>{game.title[lang]}</strong><small>{gameDone}/6 · {Math.round((gameDone/6)*100)}%</small></div>{complete&&<span className="master-stamp"><Icon name="trophy" size={14}/>{copy('MASTER','MASTER')}</span>}</div><div className="completion-levels">{COMPETITIVE_LEVEL_KEYS.map(key=><span key={key} className={completionMap[game.id]?.[key]?'done':''}>{completionMap[game.id]?.[key]?<Icon name="check" size={12}/>:<i/>}{LABELS[key]}</span>)}</div><button onClick={()=>onNavigate(game.id)}>{complete?copy('Main lagi','Play again'):copy('Lanjutkan progres','Continue progress')}<Icon name="arrow" size={14}/></button></article>})}</div>
  </div>;
}
