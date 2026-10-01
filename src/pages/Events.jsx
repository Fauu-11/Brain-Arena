import React from 'react';
import Icon from '../components/Icon.jsx';
import { GAMES, CATEGORIES } from '../data/games.js';
import { useArena } from '../context/ArenaContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Events({onNavigate}) {
  const {lang}=useLanguage(); const copy=(id,en)=>lang==='en'?en:id; const {activeEvent}=useArena();
  const games=GAMES.filter(game=>game.category===activeEvent.category);
  return <div className="meta-page events-page"><div className="page-heading"><div><span className="eyebrow">LIVE EVENT</span><h1>{activeEvent.title[lang]}</h1><p className="page-intro">{activeEvent.description[lang]}</p></div><span className="event-bonus">+{activeEvent.bonusPercent}% XP</span></div>
    <section className="event-hero"><div><span className="event-live"><i/> {copy('AKTIF MINGGU INI','LIVE THIS WEEK')}</span><h2>{CATEGORIES[activeEvent.category][lang]}</h2><p>{copy(`Selesaikan game kategori ${CATEGORIES[activeEvent.category].id} selama event untuk mendapatkan bonus XP otomatis.`,`Complete ${CATEGORIES[activeEvent.category].en} games during the event to earn automatic bonus XP.`)}</p><small>{activeEvent.start} — {activeEvent.end}</small></div><span className="event-symbol"><Icon name={activeEvent.category==='math'?'hash':activeEvent.category==='logic'?'cube':activeEvent.category==='memory'?'brain':'dice'} size={48}/></span></section>
    <div className="event-game-grid">{games.map(game=><button key={game.id} onClick={()=>onNavigate(game.id)} className={`event-game color-${game.color}`}><span className="mini-game-icon"><Icon name={game.icon} size={19}/></span><div><strong>{game.title[lang]}</strong><small>{copy('Bonus event aktif','Event bonus active')} · +{activeEvent.bonusPercent}%</small></div><Icon name="arrow" size={16}/></button>)}</div>
    <section className="meta-callout"><Icon name="spark" size={24}/><div><h3>{copy('Bonus dihitung otomatis di Result Screen v2.','Bonus is calculated automatically in Result Screen v2.')}</h3><p>{copy('Tidak perlu klaim manual. Bonus hanya berlaku untuk XP dasar sesi agar progres tetap seimbang.','No manual claim needed. The multiplier applies to base session XP only to keep progression balanced.')}</p></div></section>
  </div>;
}
