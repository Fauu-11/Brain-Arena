import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { gameById } from '../data/games.js';
import { formatDuration } from '../utils/competitive.js';
import Icon from '../components/Icon.jsx';

const PRESETS=[
  {count:3,id:'quick',title:{id:'Quick Run',en:'Quick Run'},desc:{id:'3 game untuk sesi cepat.',en:'3 games for a quick session.'}},
  {count:5,id:'standard',title:{id:'Standard Run',en:'Standard Run'},desc:{id:'5 game dengan ritme seimbang.',en:'5 games with a balanced pace.'}},
  {count:8,id:'master',title:{id:'Master Run',en:'Master Run'},desc:{id:'8 game untuk tantangan panjang.',en:'8 games for a longer challenge.'}},
  {count:12,id:'ultimate',title:{id:'Ultimate Run',en:'Ultimate Run'},desc:{id:'Seluruh 12 game dalam satu run.',en:'All 12 games in one run.'}},
];

export default function ArenaRun({ onNavigate }) {
  const { lang }=useLanguage();
  const { arenaRun,startArenaRun,cancelArenaRun }=useArena();
  const copy=(id,en)=>lang==='id'?id:en;
  const [count,setCount]=useState(5);
  const [mode,setMode]=useState('ranked');
  const totals=useMemo(()=>{
    const results=arenaRun?.results||[];
    return {time:results.reduce((s,r)=>s+(Number(r.durationMs)||0),0),performance:results.length?Math.round(results.reduce((s,r)=>s+(Number(r.performance)||0),0)/results.length):0,rp:results.reduce((s,r)=>s+(Number(r.rankedDelta)||0),0)};
  },[arenaRun]);
  const begin=()=>{ const run=startArenaRun(count,mode); onNavigate(run.stages[0].gameId); };
  const resume=()=>{ const stage=arenaRun?.stages?.[arenaRun.index]; if (stage) onNavigate(stage.gameId); };
  const fresh=()=>{ cancelArenaRun(); };
  return <div className="competitive-page arena-run-page">
    <section className="competitive-hero"><div><span className="section-eyebrow"><Icon name="trophy" size={15}/>{copy('MODE TURNAMEN','TOURNAMENT MODE')}</span><h1>{copy('Arena Run','Arena Run')}</h1><p>{copy('Rangkaikan beberapa game menjadi satu sesi kompetitif. Setiap stage memakai challenge seed sendiri dan hasilnya tercatat sebagai satu run.','Chain multiple games into one competitive session. Each stage has its own challenge seed and every result is grouped into one run.')}</p></div><div className="hero-stat"><span>{arenaRun?.status==='active'?copy('RUN AKTIF','ACTIVE RUN'):arenaRun?.status==='complete'?copy('RUN SELESAI','RUN COMPLETE'):copy('FORMAT','FORMAT')}</span><strong>{arenaRun?`${arenaRun.results?.length||0}/${arenaRun.stages?.length||0}`:'3 · 5 · 8 · 12'}</strong><small>{copy('stage','stages')}</small></div></section>
    {arenaRun ? <>
      <section className="run-summary-card"><div className="run-summary-head"><div><span>{arenaRun.status==='complete'?copy('HASIL TURNAMEN','TOURNAMENT RESULT'):copy('ARENA RUN BERJALAN','ARENA RUN IN PROGRESS')}</span><h2>{arenaRun.count} Game · {arenaRun.mode==='ranked'?'Ranked':'Practice'}</h2></div><span className={`status-pill ${arenaRun.status}`}>{arenaRun.status==='complete'?copy('Selesai','Complete'):copy('Aktif','Active')}</span></div>
        <div className="run-kpis"><div><span>{copy('Stage selesai','Stages done')}</span><strong>{arenaRun.results?.length||0}/{arenaRun.stages?.length||0}</strong></div><div><span>{copy('Waktu total','Total time')}</span><strong>{formatDuration(totals.time)}</strong></div><div><span>{copy('Rata-rata performa','Avg. performance')}</span><strong>{totals.performance||'—'}</strong></div><div><span>Arena RP</span><strong>{totals.rp>=0?'+':''}{totals.rp}</strong></div></div>
        <div className="run-stage-list">{arenaRun.stages.map((stage,index)=>{ const result=arenaRun.results?.[index]; const game=gameById(stage.gameId); const current=arenaRun.status==='active'&&index===arenaRun.index; return <div key={`${stage.gameId}-${index}`} className={`run-stage ${result?'done':''} ${current?'current':''}`}><span className="run-stage-index">{result?<Icon name="check" size={15}/>:index+1}</span><div><strong>{game?.title?.[lang]}</strong><small>{stage.challengeCode}</small></div><div className="run-stage-result">{result?<><b>{result.grade}</b><span>{formatDuration(result.durationMs)}</span></>:current?<em>{copy('Berikutnya','Next')}</em>:<span>—</span>}</div></div>})}</div>
        <div className="run-actions">{arenaRun.status==='active'&&<button className="ba-button primary" onClick={resume}><Icon name="play" size={16}/>{copy('Lanjutkan Arena Run','Continue Arena Run')}</button>}<button className="ba-button outline" onClick={fresh}><Icon name="refresh" size={16}/>{arenaRun.status==='complete'?copy('Buat run baru','New run'):copy('Batalkan & buat baru','Cancel & restart')}</button></div>
      </section>
    </> : <section className="run-builder"><div className="run-builder-main"><h2>{copy('Pilih format turnamen','Choose tournament format')}</h2><p>{copy('Urutan game diacak setiap run. Kamu akan menyelesaikannya satu per satu.','Game order is randomized for every run. Complete each stage one by one.')}</p><div className="run-presets">{PRESETS.map(item=><button key={item.count} className={count===item.count?'selected':''} onClick={()=>setCount(item.count)}><span><Icon name="trophy" size={17}/></span><strong>{item.title[lang]}</strong><small>{item.desc[lang]}</small><b>{item.count}</b></button>)}</div><h3>{copy('Mode kompetisi','Competition mode')}</h3><div className="run-mode-choice"><button className={mode==='practice'?'selected':''} onClick={()=>setMode('practice')}><Icon name="gamepad" size={17}/><span><strong>Practice</strong><small>{copy('Tetap dapat XP & Mastery, tanpa RP.','Earn XP & Mastery without RP.')}</small></span></button><button className={mode==='ranked'?'selected':''} onClick={()=>setMode('ranked')}><Icon name="shield" size={17}/><span><strong>Ranked</strong><small>{copy('Setiap stage memengaruhi Arena RP.','Every stage affects Arena RP.')}</small></span></button></div><button className="ba-button primary run-start" onClick={begin}><Icon name="play" size={17}/>{copy(`Mulai ${count} Game`,`Start ${count}-Game Run`)}</button></div><aside className="run-rules"><span><Icon name="spark" size={16}/>{copy('CARA KERJA','HOW IT WORKS')}</span><ol><li>{copy('Brain Arena memilih game secara acak tanpa duplikasi.','Brain Arena picks unique games at random.')}</li><li>{copy('Setiap stage mendapat Challenge Code tersendiri.','Each stage receives its own Challenge Code.')}</li><li>{copy('Hasil stage masuk Match History dan Replay.','Stage results go into Match History and Replay.')}</li><li>{copy('Setelah stage terakhir, statistik run dirangkum.','After the last stage, the run is summarized.')}</li></ol></aside></section>}
  </div>;
}
