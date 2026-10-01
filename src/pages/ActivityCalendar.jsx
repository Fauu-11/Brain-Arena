import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { localDateKey, shiftDateKey } from '../utils/progression.js';
import Icon from '../components/Icon.jsx';

function dayCountMap(events=[]){const map=new Map();for(const item of events){if(!item?.dateKey)continue;map.set(item.dateKey,(map.get(item.dateKey)||0)+1);}return map;}
function intensity(count){return count<=0?0:count<=2?1:count<=5?2:count<=8?3:4;}

export default function ActivityCalendar({onNavigate}){
  const {lang}=useLanguage(); const {profile,daily,currentStreak,bestStreak}=useArena(); const copy=(id,en)=>lang==='id'?id:en;
  const today=localDateKey();
  const data=useMemo(()=>{const counts=dayCountMap(profile.completionEvents||[]);const days=Array.from({length:91},(_,i)=>{const dateKey=shiftDateKey(today,i-90);return{dateKey,count:counts.get(dateKey)||0,daily:Boolean(daily.completedByDate?.[dateKey])};});const active=days.filter(x=>x.count>0).length;const total=days.reduce((s,x)=>s+x.count,0);return{days,active,total};},[profile.completionEvents,daily.completedByDate,today]);
  const monthFormatter=new Intl.DateTimeFormat(lang==='id'?'id-ID':'en-US',{month:'long',year:'numeric'});
  const currentMonth=monthFormatter.format(new Date(`${today}T12:00:00`));
  return <div className="meta-page activity-calendar-page"><section className="progression-hero activity-calendar-hero"><div><span className="eyebrow"><Icon name="activity" size={14}/>{copy('STREAK & ACTIVITY CALENDAR','STREAK & ACTIVITY CALENDAR')}</span><h1>{copy('Konsistensi terlihat dari hari ke hari.','Consistency shows up day by day.')}</h1><p>{copy('Heatmap 13 minggu menggabungkan seluruh sesi lokal. Daily Challenge ditandai terpisah agar ritme latihan mudah dibaca.','The 13-week heatmap combines all local sessions. Daily Challenges are marked separately so your practice rhythm is easy to read.')}</p></div><div className="progression-hero-stat"><small>{copy('CURRENT STREAK','CURRENT STREAK')}</small><strong>{currentStreak}</strong><span>{copy('hari berturut-turut','consecutive days')}</span><i><b style={{width:`${Math.min(100,currentStreak/Math.max(1,bestStreak)*100)}%`}}/></i></div></section>
    <section className="activity-calendar-kpis"><article><span><Icon name="bolt" size={18}/></span><div><small>{copy('CURRENT STREAK','CURRENT STREAK')}</small><strong>{currentStreak} {copy('hari','days')}</strong></div></article><article><span><Icon name="trophy" size={18}/></span><div><small>{copy('LONGEST STREAK','LONGEST STREAK')}</small><strong>{bestStreak} {copy('hari','days')}</strong></div></article><article><span><Icon name="clock" size={18}/></span><div><small>{copy('ACTIVE DAYS','ACTIVE DAYS')}</small><strong>{data.active}/91</strong></div></article><article><span><Icon name="gamepad" size={18}/></span><div><small>{copy('SESSIONS','SESSIONS')}</small><strong>{data.total}</strong></div></article></section>
    <section className="activity-calendar-panel"><header><div><span className="eyebrow">13 WEEKS</span><h2>{copy('Aktivitas 91 hari','91-day activity')}</h2></div><strong>{currentMonth}</strong></header><div className="calendar-heatmap-grid">{data.days.map(day=><button key={day.dateKey} className={`calendar-cell heat-${intensity(day.count)} ${day.daily?'daily-done':''}`} title={`${day.dateKey} · ${day.count} sessions${day.daily?' · Daily ✓':''}`} onClick={()=>onNavigate('daily-archive')}><span>{day.count||''}</span>{day.daily&&<i/>}</button>)}</div><div className="calendar-heatmap-legend"><span>{copy('Lebih sedikit','Less')}</span>{[0,1,2,3,4].map(v=><i key={v} className={`heat-${v}`}/>)}<span>{copy('Lebih banyak','More')}</span><b>• {copy('Daily selesai','Daily complete')}</b></div></section>
    <section className="calendar-actions"><button className="ba-button outline" onClick={()=>onNavigate('daily-archive')}><Icon name="clock" size={15}/>{copy('Buka Daily Archive','Open Daily Archive')}</button><button className="ba-button outline" onClick={()=>onNavigate('statistics')}><Icon name="activity" size={15}/>{copy('Advanced Analytics','Advanced Analytics')}</button></section>
  </div>;
}
