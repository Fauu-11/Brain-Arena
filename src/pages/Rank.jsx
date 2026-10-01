import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { RANK_TIERS } from '../utils/rank.js';
import Icon from '../components/Icon.jsx';

export default function Rank() {
  const { lang } = useLanguage();
  const { rankInfo, profile } = useArena();
  const copy=(id,en)=>lang==='id'?id:en;
  const contributions=[
    ['XP',rankInfo.parts.xp,copy('1 poin rating per 5 XP','1 rating point per 5 XP')],
    [copy('Sesi','Sessions'),rankInfo.parts.completions,copy('10 poin per sesi selesai','10 points per completed session')],
    [copy('Badge','Badges'),rankInfo.parts.badges,copy('45 poin per badge terbuka','45 points per unlocked badge')],
    [copy('Streak','Streak'),rankInfo.parts.streak,copy('20 poin per hari best streak','20 points per best-streak day')],
    [copy('Eksplorasi','Exploration'),rankInfo.parts.explored,copy('30 poin per game yang dijelajahi','30 points per explored game')],
    ['Ranked RP',rankInfo.parts.ranked||0,copy('Diperoleh dari hasil Ranked dan performance grade','Earned from Ranked results and performance grades')],
  ];
  return <div className="progression-page rank-page">
    <section className={`progression-hero rank-hero rank-${rankInfo.tier.group}`}>
      <div><span className="eyebrow"><Icon name="shield" size={14}/>{copy('RANK SYSTEM','RANK SYSTEM')}</span><h1>{copy('Naik rank lewat progres nyata.','Climb ranks through real progress.')}</h1><p>{copy('Arena Rating menggabungkan XP, jumlah sesi, badge, streak, eksplorasi game, dan Ranked RP. Rank berbeda dari Level: Level hanya mengikuti XP, sedangkan Rank menilai progresmu secara lebih menyeluruh.','Arena Rating combines XP, completed sessions, badges, streaks, game exploration, and Ranked RP. Rank is separate from Level: Level follows XP only, while Rank reflects broader progress.')}</p></div>
      <div className="rank-current-card"><span className={`rank-emblem rank-${rankInfo.tier.group}`}><Icon name="shield" size={31}/></span><small>ARENA RATING</small><strong>{rankInfo.rating.toLocaleString()}</strong><b>{rankInfo.tier.title[lang]}</b>{rankInfo.next?<><i><span style={{width:`${rankInfo.progress}%`}}/></i><em>{copy(`${rankInfo.remaining} AR lagi ke ${rankInfo.next.title[lang]}`,`${rankInfo.remaining} AR to ${rankInfo.next.title[lang]}`)}</em></>:<em>{copy('Rank tertinggi tercapai','Highest rank reached')}</em>}</div>
    </section>

    <section className="rank-overview-grid">
      <article className="rank-breakdown-panel"><header><div><span className="eyebrow">ARENA RATING</span><h2>{copy('Dari mana rating-mu berasal?','Where does your rating come from?')}</h2></div><strong>{rankInfo.rating.toLocaleString()} AR</strong></header><div className="rank-breakdown-list">{contributions.map(([label,value,note])=><div key={label}><span>{label}<small>{note}</small></span><b>+{value.toLocaleString()}</b></div>)}</div><div className="rank-transparency"><Icon name="shield" size={18}/><p><strong>{copy('Sistem lokal & transparan','Local and transparent')}</strong>{copy('Rank dihitung langsung dari progres yang tersimpan di browser ini. Tidak ada matchmaking atau lawan online pada versi ini.','Rank is calculated directly from progress stored in this browser. There is no matchmaking or online opponent system in this version.')}</p></div></article>
      <article className="rank-next-panel"><span className={`rank-emblem large rank-${rankInfo.tier.group}`}><Icon name="trophy" size={34}/></span><small>{copy('RANK SAAT INI','CURRENT RANK')}</small><h2>{rankInfo.tier.title[lang]}</h2><p>{rankInfo.maxed?copy('Kamu sudah mencapai puncak Arena Rank. Pertahankan konsistensimu dan terus pecahkan rekor pribadi.','You have reached the top Arena Rank. Keep your consistency and continue breaking personal records.'):copy(`Target berikutnya adalah ${rankInfo.next.title[lang]} pada ${rankInfo.next.min.toLocaleString()} Arena Rating.`,`Your next target is ${rankInfo.next.title[lang]} at ${rankInfo.next.min.toLocaleString()} Arena Rating.`)}</p><div className="rank-next-stats"><span><small>XP</small><b>{profile.xp.toLocaleString()}</b></span><span><small>{copy('SESI','SESSIONS')}</small><b>{profile.completions}</b></span><span><small>{copy('BADGE','BADGES')}</small><b>{rankInfo.badges}</b></span></div></article>
    </section>

    <section className="rank-ladder-panel"><div className="section-heading"><div><h2>{copy('Jalur Arena Rank','Arena Rank ladder')}</h2><p>{copy('Semua tier dari Bronze sampai Grandmaster.','Every tier from Bronze to Grandmaster.')}</p></div><span className="rank-ladder-count">{rankInfo.tierIndex+1}/{RANK_TIERS.length}</span></div><div className="rank-ladder">{RANK_TIERS.map((tier,index)=>{const active=tier.id===rankInfo.tier.id; const passed=index<rankInfo.tierIndex; return <article key={tier.id} className={`${active?'active':''} ${passed?'passed':''}`}><span className={`rank-emblem rank-${tier.group}`}><Icon name={passed?'check':'shield'} size={19}/></span><div><small>{tier.min.toLocaleString()} AR</small><strong>{tier.title[lang]}</strong></div>{active&&<em>{copy('RANK-MU','YOUR RANK')}</em>}</article>;})}</div></section>
  </div>;
}
