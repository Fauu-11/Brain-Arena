import {useUniversityGameplay,useUniversityEvent} from '../hooks/useUniversityGameplay.js';
import {revealWindow,rotate180} from '../utils/universityGameplay.js';
import BoardZoom from '../components/BoardZoom.jsx';
import { useBoardSizing } from '../hooks/useBoardSizing.js';
import { sessionRandom } from '../utils/competitive.js';
import { gameInterval as setInterval } from '../utils/sessionClock.js';
import { useGameCheckpoint } from '../hooks/useGameCheckpoint.js';
import { initialGameSetting } from '../utils/sessionRules.js';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import RulesModal from '../components/RulesModal.jsx';
import { SetupCard, TipsButton, SoloEndCard } from '../components/GameShell.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatMinesweeperTime } from '../utils/minesweeper.js';
import { generateNonogram,nonogramClues } from '../utils/nonogram.js';
import { initialNonogramSession, reduceNonogramSession } from '../utils/boardSessions.js';
import { useArena } from '../context/ArenaContext.jsx';

const random=()=>sessionRandom('nonogram');

const BASE={sd:{size:5,density:.40},smp:{size:8,density:.42},sma:{size:10,density:.44},'sma-plus':{size:15,density:.45}};
const UNI={hard:{size:12,density:.44},'very-hard':{size:15,density:.45},impossible:{size:20,density:.46}};
const UL={impossible:'Universitas'};

export default function GameNonogram({onBack,onNavigate}) {
  const {lang}=useLanguage(); const copy=useCallback((id,en)=>lang==='en'?en:id,[lang]);
  const [showRules,setShowRules]=useState(false); const [{state,puzzle,marks,moves},dispatch]=useReducer(reduceNonogramSession,initialNonogramSession); const {restartGameSession}=useArena();
  const [level,setLevel]=useState(()=>initialGameSetting('nonogram','schoolLevels','sd')); const [uni,setUni]=useState(()=>initialGameSetting('nonogram','universityDifficulties','hard'));
  const [mode,setMode]=useState('fill'); const [elapsed,setElapsed]=useState(0);
  const config=level==='universitas'?UNI[uni]:BASE[level];
  const challenge=useUniversityGameplay('nonogram',level,state==='playing');
  const cluesVisible=challenge.id!=='hidden-clues'||revealWindow(challenge.seconds,10,20,4);
  useUniversityEvent(challenge,'rotating-picture',20,Boolean(puzzle)&&state==='playing',()=>{
    const cells=rotate180(puzzle.cells),size=puzzle.size;
    const rows=Array.from({length:size},(_,r)=>nonogramClues(cells.slice(r*size,(r+1)*size)));
    const cols=Array.from({length:size},(_,c)=>nonogramClues(Array.from({length:size},(_,r)=>cells[r*size+c])));
    dispatch({type:'restore',session:{state,puzzle:{...puzzle,cells,rows,cols},marks:rotate180(marks),moves}});
  });
  const boardSizing=useBoardSizing(config.size,{gutter:config.size>=20?140:config.size>=15?110:config.size>=12?90:70,min:24,max:52});
  useEffect(()=>{ if(state!=='playing') return; const timer=setInterval(()=>setElapsed(v=>v+1),1000); return()=>clearInterval(timer); },[state]);
  const start=useCallback(()=>{ const next=generateNonogram(config.size,config.density,random); dispatch({type:'start',puzzle:next}); setElapsed(0); setMode('fill'); },[config.size,config.density]);
  const setCell=useCallback((index,nextMode=mode)=>{
    if(state!=='playing'||!puzzle||(challenge.id==='permanent-ink'&&marks[index]!==0)) return;
    dispatch({type:'mark',index,mode:nextMode});
  },[mode,puzzle,state,challenge.id,marks]);
  const restart=()=>{restartGameSession('nonogram');start();};
  const filled=marks.filter(v=>v===1).length; const target=puzzle?.cells.filter(Boolean).length||0;
  const grid=useMemo(()=>puzzle ? <div className="nonogram-wrap" data-size={puzzle.size} style={{'--ng-size':puzzle.size,'--ng-cell':`${boardSizing.cell}px`}}><div className="nonogram-corner"/><div className="nonogram-col-clues" style={{gridTemplateColumns:`repeat(${puzzle.size},1fr)`}}>{puzzle.cols.map((clue,i)=><div key={i} style={{fontSize:puzzle.size>=15?10:undefined}}>{clue.map((n,j)=><span key={j}>{cluesVisible?n:'·'}</span>)}</div>)}</div><div className="nonogram-row-clues" style={{gridTemplateRows:`repeat(${puzzle.size},1fr)`}}>{puzzle.rows.map((clue,i)=><div key={i} style={{fontSize:puzzle.size>=15?10:undefined}}>{clue.map((n,j)=><span key={j}>{cluesVisible?n:'·'}</span>)}</div>)}</div><div className="nonogram-grid" style={{gridTemplateColumns:`repeat(${puzzle.size},1fr)`,gridTemplateRows:`repeat(${puzzle.size},1fr)`}}>{marks.map((value,index)=><button type="button" key={index} className={value===1?'filled':value===2?'cross':''} aria-label={`${copy('Petak','Cell')} ${index+1}`} onClick={()=>setCell(index)} onContextMenu={e=>{e.preventDefault();setCell(index,'cross');}}>{value===2?'×':''}</button>)}</div></div> : null,[puzzle,marks,setCell,copy,boardSizing.cell,cluesVisible]);
  const descriptions={sd:copy('5×5 · Belajar membaca petunjuk baris dan kolom.','5×5 · Learn row and column clues.'),smp:copy('8×8 · Pola lebih rapat dengan kombinasi clue yang beragam.','8×8 · Denser patterns with varied clues.'),sma:copy('10×10 · Membutuhkan deduksi silang yang lebih teliti.','10×10 · Requires more careful cross-deduction.'),universitas:copy(`${config.size}×${config.size} · ${UL[uni]} · Puzzle besar untuk deduksi berlapis.`,`${config.size}×${config.size} · ${UL[uni]} · Large puzzle for layered deduction.`)};
  const rules=lang==='en'?[ 'Fill cells so every row and column matches its numeric clues.','Each clue gives the lengths of consecutive filled groups in order.','Use X marks for cells you have proven are empty.','The puzzle completes automatically when every row and column matches its clues; equivalent solutions are accepted.','Every new game generates a fresh randomized hidden pattern. Choose SD, SMP, SMA, SMA+, or Universitas; Universitas adds a random gameplay rule.' ]:[ 'Isi petak hingga setiap baris dan kolom sesuai petunjuk angkanya.','Setiap angka menunjukkan panjang kelompok petak isi yang berurutan.','Gunakan tanda X untuk petak yang sudah pasti kosong.','Puzzle selesai otomatis ketika seluruh baris dan kolom sesuai clue; solusi setara juga diterima.','Setiap game baru menghasilkan pola tersembunyi acak yang baru. Tersedia lima tingkat: SD, SMP, SMA, SMA+, Universitas.' ];
  const stats=state==='playing'?<><span><Icon name="clock" size={14}/>{formatMinesweeperTime(elapsed)}</span><span><Icon name="grid" size={14}/>{filled}/{target}</span></>:null;
  useGameCheckpoint('nonogram',{level,uni,mode,elapsed,session:{state,puzzle,marks,moves}},saved=>{setLevel(saved.level);setUni(saved.uni);setMode(saved.mode);setElapsed(saved.elapsed);dispatch({type:'restore',session:saved.session});},state==='playing',state==='playing');

  return <GameScreen universityMode={challenge} gameId="nonogram" lang={lang} state={state} level={level} onBack={onBack} onNavigate={onNavigate} onRules={()=>setShowRules(true)} stats={stats}>
    {state==='setup'&&<SetupCard heading={copy('Pilih puzzle Nonogram','Choose your Nonogram')} schoolLevel={level} onLevelChange={setLevel} desc={descriptions[level]} lang={lang} badge={`${config.size}×${config.size}${level==='universitas'?` · ${UL[uni]}`:''}`}>
      <button className="uw-btn uw-btn-primary" onClick={start}><Icon name="play" size={16}/>{copy('Mulai puzzle','Start puzzle')}</button><TipsButton lang={lang} onClick={()=>onNavigate?.('tips-nonogram')}/>
    </SetupCard>}
    {state==='playing'&&<div className="nonogram-gameplay"><div className="nonogram-toolbar"><div><span className="play-kicker">NONOGRAM</span><strong>{config.size}×{config.size}{level==='universitas'?` · ${UL[uni]}`:''}</strong><small>{copy('Isi petak yang pasti, tandai X untuk yang kosong.','Fill proven cells and mark empty ones with X.')}</small></div><div className="nonogram-tools"><button className={mode==='fill'?'active':''} onClick={()=>setMode('fill')}><Icon name="grid" size={15}/>{copy('Isi','Fill')}</button><button className={mode==='cross'?'active':''} onClick={()=>setMode('cross')}>× {copy('Kosong','Empty')}</button><button onClick={restart}><Icon name="refresh" size={15}/>{copy('Baru','New')}</button></div></div><BoardZoom value={boardSizing.zoom} onChange={boardSizing.setZoom} lang={lang}/><div ref={boardSizing.ref} className="nonogram-scroll" tabIndex={0} role="region" aria-label={copy('Papan Nonogram, geser untuk melihat seluruh petak','Nonogram board, scroll to see all cells')}>{grid}</div><p className="nonogram-hint">{copy('Desktop: klik = mode aktif · klik kanan = X. Mobile: gunakan tombol Isi/Kosong.','Desktop: click = active mode · right-click = X. Mobile: use Fill/Empty mode.')}</p></div>}
    {state==='ended'&&<SoloEndCard heading={copy('Gambar tersembunyi terpecahkan!','Hidden picture solved!')} subtext={copy('Semua petunjuk baris dan kolom sudah konsisten.','Every row and column clue is now consistent.')} onBack={onBack} onPlayAgain={start} lang={lang} stats={[{label:copy('Waktu','Time'),value:formatMinesweeperTime(elapsed)},{label:copy('Langkah','Moves'),value:moves},{label:copy('Ukuran','Size'),value:`${config.size}×${config.size}`}]}><button type="button" className="ms-change-level" onClick={()=>dispatch({type:'setup'})}>{copy('Ganti tingkat kesulitan','Change difficulty')}</button></SoloEndCard>}
    <RulesModal isOpen={showRules} onClose={()=>setShowRules(false)} gameName="Nonogram" ruleList={rules}/>
  </GameScreen>;
}
