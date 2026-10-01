import React from 'react';
import Icon from '../components/Icon.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { seasonIsActive } from '../utils/season.js';

export default function Season({onNavigate}) {
  const {lang}=useLanguage(); const copy=(id,en)=>lang==='en'?en:id;
  const {currentSeason,season,seasonLevel,claimSeasonReward}=useArena();
  const active=seasonIsActive(); const claimed=season.claimed||{};
  return <div className="meta-page season-page">
    <div className="page-heading"><div><span className="eyebrow">SEASON {String(currentSeason.number).padStart(2,'0')}</span><h1>{currentSeason.title[lang]}</h1><p className="page-intro">{currentSeason.subtitle[lang]}</p></div><span className={`season-live ${active?'active':''}`}><i/>{active?copy('Sedang berlangsung','Live now'):copy('Arsip season','Season archive')}</span></div>
    <section className="season-hero"><div><small>{currentSeason.start} — {currentSeason.end}</small><h2>{copy(`Season Level ${seasonLevel.level}`,`Season Level ${seasonLevel.level}`)}</h2><p>{copy('Mainkan game untuk mendapatkan Season XP. Progress season terpisah dari XP akun dan Arena Rank.','Complete games to earn Season XP. Season progress is separate from account XP and Arena Rank.')}</p><div className="season-progress"><span><b style={{width:`${seasonLevel.progress}%`}}/></span><strong>{seasonLevel.currentXp.toLocaleString()} / {seasonLevel.neededXp.toLocaleString()} SXP</strong></div></div><span className="season-emblem"><Icon name="spark" size={42}/><b>S{currentSeason.number}</b></span></section>
    <section className="season-rewards"><div className="section-heading"><div><h2>{copy('Season Reward Track','Season Reward Track')}</h2><p>{copy('Capai milestone SXP lalu klaim hadiah XP akun.','Reach SXP milestones, then claim account XP rewards.')}</p></div></div><div className="season-track">{currentSeason.rewards.map((reward,index)=>{const ready=season.xp>=reward.xp;const done=Boolean(claimed[reward.id]);return <article className={`season-reward ${ready?'ready':''} ${done?'claimed':''}`} key={reward.id}><span className="season-reward-step">{String(index+1).padStart(2,'0')}</span><div><small>{reward.xp.toLocaleString()} SXP</small><h3>{reward.label[lang]}</h3><p>+{reward.rewardXp} XP</p></div><button disabled={!ready||done} onClick={()=>claimSeasonReward(reward)}>{done?copy('Diklaim','Claimed'):ready?copy('Klaim','Claim'):copy('Terkunci','Locked')}</button></article>})}</div></section>
    <section className="meta-callout"><Icon name="grid" size={24}/><div><h3>{copy('Season XP didapat dari semua arena.','Every arena earns Season XP.')}</h3><p>{copy('Setiap sesi selesai memberi +40 SXP selama season aktif. Pilih game apa pun yang paling kamu sukai.','Every completed session awards +40 SXP while the season is active. Play whichever arena you enjoy.')}</p></div><button className="ba-button primary" onClick={()=>onNavigate('games')}>{copy('Pilih game','Choose game')}<Icon name="arrow" size={15}/></button></section>
  </div>;
}
