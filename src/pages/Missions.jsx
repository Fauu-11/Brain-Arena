import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import Icon from '../components/Icon.jsx';

function MissionCard({ mission, lang, claimMission }) {
  const copy = (id,en) => lang === 'id' ? id : en;
  const ready = mission.complete && !mission.claimed;
  return <article className={`mission-card ${mission.claimed?'claimed':ready?'ready':''}`}>
    <div className="mission-icon"><Icon name={mission.icon} size={21}/></div>
    <div className="mission-copy"><div className="mission-heading"><div><span className="eyebrow">{mission.scope==='daily'?copy('MISI HARIAN','DAILY QUEST'):copy('MISI MINGGUAN','WEEKLY QUEST')}</span><h3>{mission.title[lang]}</h3></div><span className="mission-xp">+{mission.rewardXp} XP</span></div><p>{mission.description[lang]}</p><div className="mission-progress"><div><span>{Math.min(mission.rawCurrent,mission.target)} / {mission.target}</span><b>{Math.round(mission.percent)}%</b></div><i><b style={{width:`${mission.percent}%`}}/></i></div></div>
    <button className={`ba-button ${ready?'primary':'outline'}`} disabled={!ready} onClick={()=>claimMission(mission)}>{mission.claimed?copy('Diklaim','Claimed'):ready?copy('Klaim XP','Claim XP'):copy('Belum selesai','In progress')}{mission.claimed&&<Icon name="check" size={14}/>}</button>
  </article>;
}

export default function Missions() {
  const { lang } = useLanguage();
  const { missionCards,claimMission } = useArena();
  const copy = (id,en) => lang === 'id' ? id : en;
  const daily = missionCards.filter(item=>item.scope==='daily');
  const weekly = missionCards.filter(item=>item.scope==='weekly');
  const readyCount = missionCards.filter(item=>item.complete&&!item.claimed).length;
  const claimedCount = missionCards.filter(item=>item.claimed).length;
  return <div className="progression-page mission-page">
    <section className="progression-hero mission-hero"><div><span className="eyebrow"><Icon name="flag" size={14}/>{copy('MISSION / QUEST','MISSIONS / QUESTS')}</span><h1>{copy('Target kecil, progres besar.','Small goals. Bigger progress.')}</h1><p>{copy('Quest harian direset setiap hari, sedangkan quest mingguan berjalan Senin sampai Minggu. Selesaikan target lalu klaim bonus XP.','Daily quests reset every day, while weekly quests run Monday through Sunday. Finish a goal, then claim its XP reward.')}</p></div><div className="progression-hero-stat"><small>{copy('SIAP DIKLAIM','READY TO CLAIM')}</small><strong>{readyCount}</strong><span>{copy(`${claimedCount} quest sudah diklaim`,` ${claimedCount} quests claimed`)}</span><i><b style={{width:`${(claimedCount/missionCards.length)*100}%`}}/></i></div></section>
    <section className="mission-section"><div className="section-heading"><div><h2>{copy('Misi hari ini','Today’s quests')}</h2><p>{copy('Tiga target singkat yang berubah setiap hari.','Three quick goals that refresh every day.')}</p></div><span className="quest-reset"><Icon name="clock" size={14}/>{copy('Reset harian','Daily reset')}</span></div><div className="mission-list">{daily.map(m=><MissionCard key={m.claimKey} mission={m} lang={lang} claimMission={claimMission}/>)}</div></section>
    <section className="mission-section"><div className="section-heading"><div><h2>{copy('Misi minggu ini','This week’s quests')}</h2><p>{copy('Target lebih panjang dengan hadiah XP yang lebih besar.','Longer objectives with larger XP rewards.')}</p></div><span className="quest-reset"><Icon name="trophy" size={14}/>{copy('Senin – Minggu','Monday – Sunday')}</span></div><div className="mission-list">{weekly.map(m=><MissionCard key={m.claimKey} mission={m} lang={lang} claimMission={claimMission}/>)}</div></section>
  </div>;
}
