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
const gradeValue={S:5,A:4,B:3,C:2,D:1};
const gradeFromAverage=value=>value>=4.7?'S':value>=3.8?'A':value>=2.8?'B':value>=1.8?'C':'D';

export default function ArenaRun({ onNavigate }) {
  const { lang }=useLanguage();
  const { arenaRun,startArenaRun,cancelArenaRun }=useArena();
  const copy=(id,en)=>lang==='id'?id:en;
  const [count,setCount]=useState(5); const [mode,setMode]=useState('ranked');
  const totals=useMemo(()=>{
    const results=arenaRun?.results||[];
    const performance=results.length?Math.round(results.reduce((s,r)=>s+(Number(r.performance)||0),0)/results.length):0;
    const avgGrade=results.length?gradeFromAverage(results.reduce((sum,item)=>sum+(gradeValue[item.grade]||1),0)/results.length):'—';
    const best=results.length?[...results].sort((a,b)=>(Number(b.performance)||0)-(Number(a.performance)||0))[0]:null;
    const perfect=results.filter(item=>item.grade==='S').length;
    const score=results.reduce((sum,item)=>sum+(Number(item.performance)||0)*100+Math.max(0,Number(item.rankedDelta)||0)*10,0);
    return {time:results.reduce((s,r)=>s+(Number(r.durationMs)||0),0),performance,rp:results.reduce((s,r)=>s+(Number(r.rankedDelta)||0),0),avgGrade,best,perfect,score};
  },[arenaRun]);
  const begin=()=>{ const run=startArenaRun(count,mode); onNavigate(run.stages[0].gameId); };
  const resume=()=>{ const stage=arenaRun?.stages?.[arenaRun.index]; if (stage) onNavigate(stage.gameId); };
  const fresh=()=>cancelArenaRun();
  return <div className="competitive-page arena-run-page arena-run-v2-page">
    <section className="competitive-hero"><div><span className="section-eyebrow"><Icon name="trophy" size={15}/>{copy('ARENA RUN v2','ARENA RUN v2')}</span><h1>{copy('Turnamen yang terasa seperti satu perjalanan.','A tournament that feels like one journey.')}</h1><p>{copy('Setiap stage tetap memiliki seed sendiri, tetapi v2 merangkum score, grade rata-rata, perfect stage, best stage, waktu, dan Arena RP dalam satu run.','Each stage still has its own seed, while v2 summarizes score, average grade, perfect stages, best stage, time, and Arena RP across the run.')}</p></div><div className="hero-stat"><span>{arenaRun?.status==='active'?copy('RUN AKTIF','ACTIVE RUN'):arenaRun?.status==='complete'?copy('RUN SELESAI','RUN COMPLETE'):copy('FORMAT','FORMAT')}</span><strong>{arenaRun?`${arenaRun.results?.length||0}/${arenaRun.stages?.length||0}`:'3 · 5 · 8 · 12'}</strong><small>{copy('stage','stages')}</small></div></section>
    {arenaRun ? <section className="run-summary-card run-summary-v2"><div className="run-summary-head"><div><span>{arenaRun.status==='complete'?copy('HASIL TURNAMEN','TOURNAMENT RESULT'):copy('ARENA RUN BERJALAN','ARENA RUN IN PROGRESS')}</span><h2>{arenaRun.preset==='custom'?copy('Custom Arena','Custom Arena'):`${arenaRun.count} Game`} · {arenaRun.mode==='ranked'?'Ranked':'Practice'}</h2></div><span className={`status-pill ${arenaRun.status}`}>{arenaRun.status==='complete'?copy('Selesai','Complete'):copy('Aktif','Active')}</span></div>
      <div className="run-v2-scoreboard"><div className="run-v2-grade"><small>{copy('RUN GRADE','RUN GRADE')}</small><strong>{totals.avgGrade}</strong><span>{totals.performance||0}/100 avg.</span></div><div><small>{copy('TOTAL SCORE','TOTAL SCORE')}</small><strong>{totals.score.toLocaleString()}</strong></div><div><small>{copy('WAKTU TOTAL','TOTAL TIME')}</small><strong>{formatDuration(totals.time)}</strong></div><div><small>{copy('PERFECT STAGE','PERFECT STAGES')}</small><strong>{totals.perfect}</strong></div><div><small>ARENA RP</small><strong>{totals.rp>=0?'+':''}{totals.rp}</strong></div></div>
      {totals.best&&<div className="run-best-stage"><span><Icon name="spark" size={17}/></span><div><small>{copy('BEST STAGE','BEST STAGE')}</small><strong>{gameById(totals.best.gameId)?.title?.[lang]} · {totals.best.grade} · {totals.best.performance}/100</strong></div><b>{formatDuration(totals.best.durationMs)}</b></div>}
      <div className="run-stage-list">{arenaRun.stages.map((stage,index)=>{ const result=arenaRun.results?.[index]; const game=gameById(stage.gameId); const current=arenaRun.status==='active'&&index===arenaRun.index; return <div key={`${stage.gameId}-${index}`} className={`run-stage ${result?'done':''} ${current?'current':''}`}><span className="run-stage-index">{result?<Icon name="check" size={15}/>:index+1}</span><div><strong>{game?.title?.[lang]}</strong><small>{stage.challengeCode}</small></div><div className="run-stage-result">{result?<><b>{result.grade}</b><span>{result.performance}/100 · {formatDuration(result.durationMs)}</span></>:current?<em>{copy('Berikutnya','Next')}</em>:<span>—</span>}</div></div>})}</div>
      <div className="run-actions">{arenaRun.status==='active'&&<button className="ba-button primary" onClick={resume}><Icon name="play" size={16}/>{copy('Lanjutkan Arena Run','Continue Arena Run')}</button>}<button className="ba-button outline" onClick={()=>onNavigate('arena-builder')}><Icon name="sliders" size={16}/>{copy('Buka Arena Builder','Open Arena Builder')}</button><button className="ba-button outline" onClick={fresh}><Icon name="refresh" size={16}/>{arenaRun.status==='complete'?copy('Buat run baru','New run'):copy('Batalkan & buat baru','Cancel & restart')}</button></div>
    </section> : <section className="run-builder"><div className="run-builder-main"><h2>{copy('Pilih format turnamen','Choose tournament format')}</h2><p>{copy('Gunakan preset cepat atau buka Arena Builder untuk menentukan sendiri urutan 3–12 game.','Use a quick preset or open Arena Builder to choose your own 3–12 game sequence.')}</p><div className="run-presets">{PRESETS.map(item=><button key={item.count} className={count===item.count?'selected':''} onClick={()=>setCount(item.count)}><span><Icon name="trophy" size={17}/></span><strong>{item.title[lang]}</strong><small>{item.desc[lang]}</small><b>{item.count}</b></button>)}</div><h3>{copy('Mode kompetisi','Competition mode')}</h3><div className="run-mode-choice"><button className={mode==='practice'?'selected':''} onClick={()=>setMode('practice')}><Icon name="gamepad" size={17}/><span><strong>Practice</strong><small>{copy('Tetap dapat XP & Mastery, tanpa RP.','Earn XP & Mastery without RP.')}</small></span></button><button className={mode==='ranked'?'selected':''} onClick={()=>setMode('ranked')}><Icon name="shield" size={17}/><span><strong>Ranked</strong><small>{copy('Setiap stage memengaruhi Arena RP.','Every stage affects Arena RP.')}</small></span></button></div><div className="run-builder-actions"><button className="ba-button primary run-start" onClick={begin}><Icon name="play" size={17}/>{copy(`Mulai ${count} Game`,`Start ${count}-Game Run`)}</button><button className="ba-button outline" onClick={()=>onNavigate('arena-builder')}><Icon name="sliders" size={16}/>{copy('Custom Arena','Custom Arena')}</button></div></div><aside className="run-rules"><span><Icon name="spark" size={16}/>{copy('v2 SCORECARD','v2 SCORECARD')}</span><ol><li>{copy('Setiap stage punya Challenge Code unik.','Every stage has a unique Challenge Code.')}</li><li>{copy('Score menggabungkan performa dan hasil Ranked.','Score combines performance and Ranked results.')}</li><li>{copy('Grade run dihitung dari seluruh stage yang selesai.','Run grade is calculated across completed stages.')}</li><li>{copy('Best Stage dan Perfect Stage disorot otomatis.','Best Stage and Perfect Stages are highlighted automatically.')}</li></ol></aside></section>}
  </div>;
}
