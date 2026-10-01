import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { achievementProgress } from '../data/achievements.js';
import Icon from '../components/Icon.jsx';

export default function Achievements() {
  const { lang } = useLanguage();
  const { profile,daily,achievementList,achievements,selectedBadge,selectBadge } = useArena();
  const copy = (id,en) => lang === 'id' ? id : en;
  const cards = useMemo(() => achievementList.map(item => ({ item, progress:achievementProgress(item,profile,daily), unlocked:Boolean(achievements.unlocked[item.id]) })), [achievementList,profile,daily,achievements.unlocked]);
  const unlockedCount = cards.filter(card => card.unlocked).length;
  const earnedXp = cards.filter(card => card.unlocked).reduce((sum,card)=>sum+card.item.rewardXp,0);
  return <div className="progression-page achievement-page">
    <section className="progression-hero">
      <div><span className="eyebrow"><Icon name="trophy" size={14}/>{copy('ACHIEVEMENT & BADGE','ACHIEVEMENTS & BADGES')}</span><h1>{copy('Buktikan perkembanganmu.','Turn progress into milestones.')}</h1><p>{copy('Achievement terbuka otomatis saat syaratnya terpenuhi. Setiap badge memberi bonus XP dan dapat dipasang di profil pemain.','Achievements unlock automatically when you meet their requirements. Every badge grants bonus XP and can be equipped on your player profile.')}</p></div>
      <div className="progression-hero-stat"><small>{copy('TERBUKA','UNLOCKED')}</small><strong>{unlockedCount}/{cards.length}</strong><span>{copy(`${earnedXp.toLocaleString()} XP hadiah`,`${earnedXp.toLocaleString()} reward XP`)}</span><i><b style={{width:`${(unlockedCount/cards.length)*100}%`}}/></i></div>
    </section>
    {selectedBadge && <section className="equipped-badge"><span className={`badge-emblem color-${selectedBadge.color}`}><Icon name={selectedBadge.icon} size={26}/></span><div><small>{copy('BADGE AKTIF','EQUIPPED BADGE')}</small><strong>{selectedBadge.title[lang]}</strong><p>{selectedBadge.description[lang]}</p></div><button className="ba-button outline" onClick={()=>selectBadge(null)}>{copy('Lepas badge','Unequip')}</button></section>}
    <section className="achievement-grid">{cards.map(({item,progress,unlocked}) => <article key={item.id} className={`achievement-card ${unlocked?'unlocked':'locked'} ${selectedBadge?.id===item.id?'equipped':''}`}>
      <div className="achievement-card-top"><span className={`badge-emblem color-${item.color}`}><Icon name={item.icon} size={24}/></span><span className={`achievement-state ${unlocked?'done':''}`}><Icon name={unlocked?'check':'shield'} size={12}/>{unlocked?copy('Terbuka','Unlocked'):copy('Terkunci','Locked')}</span></div>
      <span className="eyebrow">+{item.rewardXp} XP</span><h2>{item.title[lang]}</h2><p>{item.description[lang]}</p>
      <div className="achievement-progress"><div><span>{copy('Progres','Progress')}</span><b>{Math.min(progress.current,progress.target)} / {progress.target}</b></div><i><b style={{width:`${progress.percent}%`}}/></i></div>
      {unlocked ? <button className={`ba-button ${selectedBadge?.id===item.id?'outline':'primary'} full-width`} onClick={()=>selectBadge(selectedBadge?.id===item.id?null:item.id)}>{selectedBadge?.id===item.id?copy('Badge sedang dipakai','Badge equipped'):copy('Pakai di profil','Equip on profile')}</button> : <div className="locked-note"><Icon name="shield" size={14}/>{copy('Lanjutkan bermain untuk membuka badge ini.','Keep playing to unlock this badge.')}</div>}
    </article>)}</section>
  </div>;
}
