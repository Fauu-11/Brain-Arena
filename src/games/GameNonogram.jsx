import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import RulesModal from '../components/RulesModal.jsx';
import { SetupCard, TipsButton, SoloEndCard, UniversityDifficultySelector } from '../components/GameShell.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatMinesweeperTime } from '../utils/minesweeper.js';
import { generateNonogram, nonogramSolved } from '../utils/nonogram.js';

const BASE={sd:{size:5,density:.40},smp:{size:8,density:.42},sma:{size:10,density:.44}};
const UNI={hard:{size:12,density:.44},'very-hard':{size:15,density:.45},impossible:{size:20,density:.46}};
const UL={hard:'Hard','very-hard':'Very Hard',impossible:'Impossible'};

export default function GameNonogram({onBack,onNavigate}) {
  const {lang}=useLanguage(); const copy=useCallback((id,en)=>lang==='en'?en:id,[lang]);
  const [showRules,setShowRules]=useState(false); const [state,setState]=useState('setup');
  const [level,setLevel]=useState('sd'); const [uni,setUni]=useState('hard'); const [puzzle,setPuzzle]=useState(null);
  const [marks,setMarks]=useState([]); const [mode,setMode]=useState('fill'); const [elapsed,setElapsed]=useState(0); const [moves,setMoves]=useState(0);
  const config=level==='universitas'?UNI[uni]:BASE[level];
  useEffect(()=>{ if(state!=='playing') return; const timer=setInterval(()=>setElapsed(v=>v+1),1000); return()=>clearInterval(timer); },[state]);
  const start=useCallback(()=>{ const next=generateNonogram(config.size,config.density); setPuzzle(next); setMarks(Array(next.cells.length).fill(0)); setElapsed(0); setMoves(0); setMode('fill'); setState('playing'); },[config.size,config.density]);
  const setCell=useCallback((index,nextMode=mode)=>{
    if(state!=='playing'||!puzzle) return;
    setMarks(previous=>{ const next=[...previous]; const target=nextMode==='cross'?2:1; next[index]=next[index]===target?0:target; setMoves(v=>v+1); if(nonogramSolved(puzzle.cells,next)) setTimeout(()=>setState('ended'),80); return next; });
  },[mode,puzzle,state]);
  const filled=marks.filter(v=>v===1).length; const target=puzzle?.cells.filter(Boolean).length||0;
  const grid=useMemo(()=>puzzle ? <div className="nonogram-wrap" data-size={puzzle.size}><div className="nonogram-corner"/><div className="nonogram-col-clues" style={{gridTemplateColumns:`repeat(${puzzle.size},1fr)`}}>{puzzle.cols.map((clue,i)=><div key={i}>{clue.map((n,j)=><span key={j}>{n}</span>)}</div>)}</div><div className="nonogram-row-clues" style={{gridTemplateRows:`repeat(${puzzle.size},1fr)`}}>{puzzle.rows.map((clue,i)=><div key={i}>{clue.map((n,j)=><span key={j}>{n}</span>)}</div>)}</div><div className="nonogram-grid" style={{gridTemplateColumns:`repeat(${puzzle.size},1fr)`,gridTemplateRows:`repeat(${puzzle.size},1fr)`}}>{marks.map((value,index)=><button type="button" key={index} className={value===1?'filled':value===2?'cross':''} aria-label={`${copy('Petak','Cell')} ${index+1}`} onClick={()=>setCell(index)} onContextMenu={e=>{e.preventDefault();setCell(index,'cross');}}>{value===2?'×':''}</button>)}</div></div> : null,[puzzle,marks,setCell,copy]);
  const descriptions={sd:copy('5×5 · Belajar membaca petunjuk baris dan kolom.','5×5 · Learn row and column clues.'),smp:copy('8×8 · Pola lebih rapat dengan kombinasi clue yang beragam.','8×8 · Denser patterns with varied clues.'),sma:copy('10×10 · Membutuhkan deduksi silang yang lebih teliti.','10×10 · Requires more careful cross-deduction.'),universitas:copy(`${config.size}×${config.size} · ${UL[uni]} · Puzzle besar untuk deduksi berlapis.`,`${config.size}×${config.size} · ${UL[uni]} · Large puzzle for layered deduction.`)};
  const rules=lang==='en'?[ 'Fill cells so every row and column matches its numeric clues.','Each clue gives the lengths of consecutive filled groups in order.','Use X marks for cells you have proven are empty.','The puzzle completes automatically when every filled cell matches the hidden solution.','Every new game generates a fresh randomized hidden pattern. University Arena Mode adds Hard, Very Hard, and Impossible boards.' ]:[ 'Isi petak hingga setiap baris dan kolom sesuai petunjuk angkanya.','Setiap angka menunjukkan panjang kelompok petak isi yang berurutan.','Gunakan tanda X untuk petak yang sudah pasti kosong.','Puzzle selesai otomatis ketika semua petak isi cocok dengan solusi.','Setiap game baru menghasilkan pola tersembunyi acak yang baru. Mode Arena Universitas memiliki Hard, Very Hard, dan Impossible.' ];
  const stats=state==='playing'?<><span><Icon name="clock" size={14}/>{formatMinesweeperTime(elapsed)}</span><span><Icon name="grid" size={14}/>{filled}/{target}</span></>:null;
  return <GameScreen gameId="nonogram" lang={lang} state={state} level={level} onBack={onBack} onNavigate={onNavigate} onRules={()=>setShowRules(true)} stats={stats}>
    {state==='setup'&&<SetupCard heading={copy('Pilih puzzle Nonogram','Choose your Nonogram')} schoolLevel={level} onLevelChange={setLevel} desc={descriptions[level]} lang={lang} badge={`${config.size}×${config.size}${level==='universitas'?` · ${UL[uni]}`:''}`}>
      {level==='universitas'&&<UniversityDifficultySelector value={uni} onChange={setUni} lang={lang}/>}<button className="uw-btn uw-btn-primary" onClick={start}><Icon name="play" size={16}/>{copy('Mulai puzzle','Start puzzle')}</button><TipsButton lang={lang} onClick={()=>onNavigate?.('tips-nonogram')}/>
    </SetupCard>}
    {state==='playing'&&<div className="nonogram-gameplay"><div className="nonogram-toolbar"><div><span className="play-kicker">NONOGRAM</span><strong>{config.size}×{config.size}{level==='universitas'?` · ${UL[uni]}`:''}</strong><small>{copy('Isi petak yang pasti, tandai X untuk yang kosong.','Fill proven cells and mark empty ones with X.')}</small></div><div className="nonogram-tools"><button className={mode==='fill'?'active':''} onClick={()=>setMode('fill')}><Icon name="grid" size={15}/>{copy('Isi','Fill')}</button><button className={mode==='cross'?'active':''} onClick={()=>setMode('cross')}>× {copy('Kosong','Empty')}</button><button onClick={start}><Icon name="refresh" size={15}/>{copy('Baru','New')}</button></div></div>{grid}<p className="nonogram-hint">{copy('Desktop: klik = mode aktif · klik kanan = X. Mobile: gunakan tombol Isi/Kosong.','Desktop: click = active mode · right-click = X. Mobile: use Fill/Empty mode.')}</p></div>}
    {state==='ended'&&<SoloEndCard heading={copy('Gambar tersembunyi terpecahkan!','Hidden picture solved!')} subtext={copy('Semua petunjuk baris dan kolom sudah konsisten.','Every row and column clue is now consistent.')} onBack={onBack} onPlayAgain={start} lang={lang} stats={[{label:copy('Waktu','Time'),value:formatMinesweeperTime(elapsed)},{label:copy('Langkah','Moves'),value:moves},{label:copy('Ukuran','Size'),value:`${config.size}×${config.size}`}]}><button type="button" className="ms-change-level" onClick={()=>setState('setup')}>{copy('Ganti tingkat kesulitan','Change difficulty')}</button></SoloEndCard>}
    <RulesModal isOpen={showRules} onClose={()=>setShowRules(false)} gameName="Nonogram" ruleList={rules}/>
  </GameScreen>;
}
