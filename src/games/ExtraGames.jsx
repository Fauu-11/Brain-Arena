import React,{useCallback,useEffect,useRef,useState} from 'react';
import GameScreen from '../components/GameScreen.jsx';
import RulesModal from '../components/RulesModal.jsx';
import {SetupCard,SoloEndCard,TipsButton} from '../components/GameShell.jsx';
import {useLanguage} from '../context/LanguageContext.jsx';
import {useArena} from '../context/ArenaContext.jsx';
import {useGameCheckpoint} from '../hooks/useGameCheckpoint.js';
import {useUniversityGameplay,useUniversityEvent} from '../hooks/useUniversityGameplay.js';
import {useBoardSizing} from '../hooks/useBoardSizing.js';
import {initialGameSetting} from '../utils/sessionRules.js';
import {sessionRandom} from '../utils/competitive.js';
import {gameInterval,gameTimeout} from '../utils/sessionClock.js';
import {currentUniversityVariant,revealWindow,rotate180,shuffleValues} from '../utils/universityGameplay.js';
import {NEW_GAME_PRESETS,makeCode,codeFeedback,makeLights,lightsMove,extendSequence,sequenceAnswer} from '../utils/newGameRules.js';
import {makeKakuro,kakuroValid,rotateKakuro} from '../utils/kakuro.js';
import {makeSlitherlink,slitherValid,rotateSlitherlink} from '../utils/slitherlink.js';
import {EXTRA_CONTENT} from '../data/newGameContent.js';
const initial=()=>({phase:'setup',elapsed:0,message:'',outcome:null});
function useExtra(id){
 const {lang}=useLanguage(),arena=useArena();const [level,setLevel]=useState(()=>initialGameSetting(id,'schoolLevels','sd'));
 const [data,setData]=useState(initial);const [rules,setRules]=useState(false);
 const challenge=useUniversityGameplay(id,level,['playing','preview'].includes(data.phase));
 const random=useCallback(()=>sessionRandom(id),[id]);
 useEffect(()=>{if(data.phase!=='playing')return;const timer=gameInterval(()=>setData(old=>({...old,elapsed:old.elapsed+1})),1000);return()=>clearInterval(timer);},[data.phase]);
 useGameCheckpoint(id,{level,data},saved=>{setLevel(saved.level);setData(saved.data);},['playing','preview'].includes(data.phase),data.phase==='playing');
 return {id,lang,arena,level,setLevel,data,setData,rules,setRules,challenge,random,config:NEW_GAME_PRESETS[id][level],copy:(id,en)=>lang==='en'?en:id};
}
function ExtraFrame({game,start,onBack,onNavigate,children,stats=[]}){
 const {id,level,setLevel,data,setData,lang,rules,setRules,challenge,copy}=game;const content=EXTRA_CONTENT[id];
 const restart=()=>{game.arena.prepareFreshSession(id);start();};
 return <GameScreen gameId={id} lang={lang} state={data.phase==='preview'?'start':data.phase} level={level} onBack={onBack} onNavigate={onNavigate} onRules={()=>setRules(true)} universityMode={challenge} stats={data.phase==='playing'?<><span>{copy('Waktu','Time')}: {data.elapsed}s</span>{stats.slice(0,2).map((stat,i)=><span key={i}>{stat.label}: {stat.value}</span>)}</>:null}>
  {data.phase==='setup'?<SetupCard heading={content.title[lang]} schoolLevel={level} onLevelChange={setLevel} lang={lang}><button type="button" className="uw-btn uw-btn-primary" onClick={start}>{copy('Mulai permainan','Start game')}</button><TipsButton lang={lang} onClick={()=>onNavigate?.(`tips-${id}`)}/></SetupCard>:data.phase==='ended'?<SoloEndCard heading={data.outcome==='loss'?copy('Tantangan berakhir.','Challenge ended.'):copy('Tantangan selesai!','Challenge complete!')} subtext={data.message} onBack={onBack} onPlayAgain={start} lang={lang} outcome={data.outcome||'completed'} stats={[{label:copy('Waktu','Time'),value:`${data.elapsed}s`},...stats]}><button className="ms-change-level" onClick={()=>setData(initial())}>{copy('Ganti tingkat','Change level')}</button></SoloEndCard>:<div className={`extra-game extra-${id}`}><div className="extra-toolbar"><strong>{content.title[lang]}</strong><button type="button" className="ba-button outline" onClick={restart}>{copy('Ulang dari awal','Restart')}</button></div>{children}</div>}
  <RulesModal isOpen={rules} onClose={()=>setRules(false)} gameName={content.title[lang]} ruleList={content.rules[lang]}/>
 </GameScreen>;
}
const finish=(data,outcome,message)=>({...data,phase:'ended',outcome,message});
export function GameCodeBreaker(props){
 const g=useExtra('codebreaker'),{config,data,setData,challenge,copy,random}=g;
 const start=()=>{const unique=config.unique||currentUniversityVariant('codebreaker')==='unique-code';setData({...initial(),phase:'playing',secret:makeCode(config,random,unique),guess:'',history:[],unique,attempts:currentUniversityVariant('codebreaker')==='limited-guesses'?7:config.attempts});};
 const submit=event=>{event.preventDefault();if(data.phase!=='playing'||data.guess.length!==config.length)return;
  if(data.unique&&new Set(data.guess).size!==config.length){setData({...data,message:copy('Gunakan angka berbeda pada setiap posisi.','Use different digits in every position.')});return;}
  const feedback=codeFeedback(data.secret,data.guess),history=[...data.history,{guess:data.guess,...feedback,time:challenge.seconds}];const next={...data,history,guess:'',message:''};
  setData(feedback.exact===config.length?finish(next,'completed',copy('Sandi berhasil dipecahkan.','The code was cracked.')):history.length>=data.attempts?finish(next,'loss',copy(`Kesempatan habis. Sandi: ${data.secret}`,`No attempts left. Code: ${data.secret}`)):next);
 };
 const input=value=>setData(old=>({...old,guess:value.replace(/\D/g,'').split('').filter(c=>Number(c)<config.symbols).join('').slice(0,config.length),message:''}));
 return <ExtraFrame game={g} start={start} {...props} stats={data.history?[{label:copy('Percobaan','Attempts'),value:`${data.history.length}/${data.attempts}`}]:[]}>
  <p className="extra-instruction">{copy(`Pecahkan ${config.length} digit menggunakan angka 0–${config.symbols-1}.`, `Crack ${config.length} digits using 0–${config.symbols-1}.`)} {data.unique&&copy('Semua digit berbeda.','Every digit is different.')}</p>
  <form className="code-form" onSubmit={submit}><label htmlFor="code-guess">{copy('Tebakan sandi','Code guess')}</label><input id="code-guess" inputMode="numeric" autoComplete="off" maxLength={config.length} value={data.guess||''} onChange={e=>input(e.target.value)} placeholder={'·'.repeat(config.length)}/><div className="extra-keypad" style={{'--keys':5}}>{Array.from({length:config.symbols},(_,i)=><button type="button" key={i} onClick={()=>input((data.guess||'')+i)}>{i}</button>)}<button type="button" onClick={()=>input((data.guess||'').slice(0,-1))} aria-label={copy('Hapus digit terakhir','Erase last digit')}>⌫</button></div><button className="ba-button primary" disabled={data.guess?.length!==config.length}>{copy('Periksa sandi','Check code')}</button></form>
  {data.message&&<p role="alert">{data.message}</p>}<ol className="code-history" aria-label={copy('Riwayat tebakan sesi ini','Guesses this session')}>{data.history?.map((row,i)=><li key={i}><span>#{i+1}</span><b>{row.guess}</b><p>{challenge.id==='fading-feedback'&&challenge.seconds-row.time>=5?copy('Petunjuk disembunyikan','Feedback hidden'):copy(`${row.exact} tepat posisi · ${row.misplaced} salah posisi`,`${row.exact} exact · ${row.misplaced} misplaced`)}</p></li>)}</ol>
 </ExtraFrame>;
}
export function GameLightsOut(props){
 const g=useExtra('lightsout'),{config,data,setData,challenge,copy,random}=g;
 const start=()=>{const puzzle=makeLights(config,random);setData({...initial(),phase:'playing',...puzzle,moves:0,budget:puzzle.solution.length+4});};
 useUniversityEvent(challenge,'rotating-lights',20,data.phase==='playing',()=>setData(old=>({...old,board:rotate180(old.board),solution:old.solution.map(i=>old.board.length-1-i)})));
 const locked=index=>challenge.id==='alternating-lights'&&(Math.floor(index/config.size)+index%config.size)%2!==Math.floor(challenge.seconds/10)%2;
 const press=index=>{if(data.phase!=='playing'||locked(index))return;const board=lightsMove(data.board,config.size,index),next={...data,board,moves:data.moves+1};setData(!board.some(Boolean)?finish(next,'completed',copy('Semua lampu berhasil dipadamkan.','All lights are out.')):challenge.id==='limited-lights'&&next.moves>=data.budget?finish(next,'loss',copy('Batas langkah tercapai.','Move limit reached.')):next);};
 return <ExtraFrame game={g} start={start} {...props} stats={data.board?[{label:copy('Langkah','Moves'),value:challenge.id==='limited-lights'?`${data.moves}/${data.budget}`:data.moves},{label:copy('Menyala','Lit'),value:data.board.filter(Boolean).length}]:[]}>
  <p className="extra-instruction">{copy('Ketuk petak untuk membalik lampu itu dan tetangga atas, bawah, kiri, kanan. Padamkan semuanya.','Tap a cell to toggle it and its up, down, left and right neighbors. Turn every light off.')}</p><div className="lights-board" role="group" aria-label={copy('Papan lampu','Light board')} style={{'--size':config.size}}>{data.board?.map((lit,i)=><button type="button" data-light={i} key={i} className={lit?'lit':''} disabled={locked(i)} aria-pressed={lit} aria-label={copy(`Lampu ${i+1}, ${lit?'menyala':'padam'}`,`Light ${i+1}, ${lit?'on':'off'}`)} onClick={()=>press(i)}><span aria-hidden="true">{locked(i)?'🔒':lit?'●':'○'}</span></button>)}</div>
 </ExtraFrame>;
}
export function GameSequenceRecall(props){
 const g=useExtra('sequence'),{config,data,setData,challenge,copy,random}=g;const inputRef=useRef(null);
 const start=()=>{let sequence=[];for(let i=0;i<config.start;i++)sequence=extendSequence(sequence,config.symbols,random);setData({...initial(),phase:'preview',sequence,previewStep:-1,progress:0,round:1,lives:3,order:Array.from({length:config.symbols},(_,i)=>i+1)});};
 useEffect(()=>{if(data.phase!=='preview')return;const timer=gameTimeout(()=>setData(old=>{if(old.previewStep+1<old.sequence.length)return {...old,previewStep:old.previewStep+1};return {...old,phase:'playing',progress:0,order:currentUniversityVariant('sequence')==='shuffled-sequence'?shuffleValues(old.order,random):old.order};}),config.beat);return()=>clearTimeout(timer);},[data.phase,data.previewStep,config.beat,random,setData]);
 useEffect(()=>{if(data.phase!=='feedback')return;const timer=gameTimeout(()=>setData(old=>({...old,phase:'preview',previewStep:-1,progress:0,message:'',round:old.correct?old.round+1:old.round,sequence:old.correct?extendSequence(old.sequence,config.symbols,random):old.sequence})),750);return()=>clearTimeout(timer);},[data.phase,config.symbols,random,setData]);
 useEffect(()=>{if(data.phase==='playing')inputRef.current?.focus();},[data.phase]);
 const press=number=>{if(data.phase!=='playing')return;const expected=sequenceAnswer(data.sequence,config.symbols,challenge.id);
  if(number!==expected[data.progress]){const next={...data,lives:data.lives-1,message:copy('Urutan belum tepat. Amati kembali.','Incorrect sequence. Watch again.'),correct:false};setData(next.lives===0?finish(next,'loss',copy('Tiga nyawa terpakai.','All three lives used.')):{...next,phase:'feedback'});return;}
  const next={...data,progress:data.progress+1};setData(next.progress===expected.length?(data.round===config.rounds?finish(next,'completed',copy('Semua urutan berhasil diingat.','Every sequence was recalled.')):{...next,phase:'feedback',correct:true,message:copy('Ronde selesai!','Round complete!')}):next);
 };
 return <ExtraFrame game={g} start={start} {...props} stats={data.sequence?[{label:copy('Ronde','Round'),value:`${data.round}/${config.rounds}`},{label:copy('Nyawa','Lives'),value:data.lives}]:[]}>
  <p className="extra-instruction" role="status">{data.phase==='preview'?copy('Amati urutan tombol yang menyala.','Watch the sequence of highlighted buttons.'):data.phase==='feedback'?data.message:copy(`Ulangi urutan: ${data.progress||0}/${data.sequence?.length||0}.`,`Repeat the sequence: ${data.progress||0}/${data.sequence?.length||0}.`)}</p><div ref={inputRef} tabIndex={0} className="sequence-board" style={{'--keys':config.symbols>6?4:3}} role="group" aria-label={copy('Tombol urutan','Sequence buttons')} onKeyDown={e=>{const value=e.key==='0'?10:Number(e.key);if(Number.isInteger(value)&&value>0&&value<=config.symbols){e.preventDefault();press(value);}}}>{data.order?.map(number=><button type="button" key={number} data-sequence-number={number} data-highlighted={data.phase==='preview'&&data.sequence[data.previewStep]===number} disabled={data.phase!=='playing'} aria-label={String(number)} onClick={()=>press(number)}><span>{number}</span>{data.phase==='preview'&&data.sequence[data.previewStep]===number&&<small>{copy('INGAT','REMEMBER')}</small>}</button>)}</div>
 </ExtraFrame>;
}
function NumberKeypad({value,onChange,disabled,copy}){return <div className="extra-keypad" style={{'--keys':5}}>{Array.from({length:9},(_,i)=><button type="button" key={i} disabled={disabled} aria-pressed={Number(value)===i+1} onClick={()=>onChange(i+1)}>{i+1}</button>)}<button type="button" disabled={disabled} onClick={()=>onChange(0)} aria-label={copy('Hapus angka','Erase number')}>⌫</button></div>;}
export function GameKakuro(props){
 const g=useExtra('kakuro'),{config,data,setData,challenge,copy,random}=g;
 const start=()=>{const puzzle=makeKakuro(config,random);setData({...initial(),phase:'playing',puzzle,values:puzzle.cells.map(cell=>cell.given||0),selected:null});};
 const size=data.puzzle?.size||3,sizing=useBoardSizing(size,{min:40,max:60});const cluesVisible=challenge.id!=='fading-sums'||revealWindow(challenge.seconds,12,20,4);
 useUniversityEvent(challenge,'rotating-sums',20,data.phase==='playing',()=>setData(old=>({...old,puzzle:rotateKakuro(old.puzzle),values:rotate180(old.values),selected:old.selected===null?null:old.values.length-1-old.selected})));
 const enter=value=>{const index=data.selected;if(data.phase!=='playing'||index===null||data.puzzle.cells[index].given||challenge.id==='permanent-sums'&&data.values[index])return;setData({...data,values:data.values.map((old,i)=>i===index?value:old),message:''});};
 const check=()=>{if(kakuroValid(data.puzzle,data.values))setData(finish(data,'completed',copy('Semua jumlah dan kelompok angka cocok.','Every sum and digit group is correct.')));else setData({...data,message:copy('Belum cocok. Isi semua petak, periksa jumlah dan angka berulang dalam kelompok.','Not solved. Fill all cells and check sums and repeated digits in each group.')});};
 const arrows={right:'→',down:'↓',left:'←',up:'↑'};
 return <ExtraFrame game={g} start={start} {...props} stats={data.puzzle?[{label:copy('Terisi','Filled'),value:`${data.values.filter(Boolean).length}/${data.puzzle.cells.filter(c=>c.white).length}`}]:[]}>
  <p className="extra-instruction">{copy('Isi 1–9 sesuai jumlah pada arah panah. Angka tidak boleh berulang di satu kelompok. Angka awal terkunci.','Fill 1–9 to match each arrow sum. Digits cannot repeat within a group. Initial digits are locked.')}</p><div ref={sizing.ref} className="extra-board-scroll" role="region" tabIndex={0} aria-label={copy('Papan Kakuro, geser jika diperlukan','Kakuro board, scroll as needed')} onKeyDown={e=>{if(/^[1-9]$/.test(e.key)){e.preventDefault();enter(Number(e.key));}else if(['Backspace','Delete'].includes(e.key)){e.preventDefault();enter(0);}}}><div className="kakuro-board" style={{'--size':size,'--cell':`${sizing.cell}px`}}>{data.puzzle?.cells.map((cell,i)=>cell.white?<button type="button" key={i} data-kakuro-cell={i} className={`${cell.given?'given':''} ${data.selected===i?'selected':''}`} disabled={Boolean(cell.given)} aria-label={copy(`Petak ${i+1}: ${data.values[i]||'kosong'}`,`Cell ${i+1}: ${data.values[i]||'empty'}`)} aria-pressed={data.selected===i} onClick={()=>setData({...data,selected:i})}>{data.values[i]||''}</button>:<div key={i} className="kakuro-clue">{cell.clues.map((clue,j)=><span key={j}>{arrows[clue.dir]} {cluesVisible?clue.sum:'?'}</span>)}</div>)}</div></div><NumberKeypad value={data.values?.[data.selected]} onChange={enter} disabled={data.selected===null} copy={copy}/><button className="ba-button primary" onClick={check}>{copy('Periksa papan','Check board')}</button>{data.message&&<p role="alert">{data.message}</p>}
 </ExtraFrame>;
}
export function GameSlitherlink(props){
 const g=useExtra('slitherlink'),{config,data,setData,challenge,copy,random}=g;
 const start=()=>{const puzzle=makeSlitherlink(config,random);setData({...initial(),phase:'playing',puzzle,marks:puzzle.fixed.map(v=>v===1?1:v===0?2:0),ink:'line',moves:0});};
 const sizing=useBoardSizing(config.size,{min:44,max:64,gutter:32});const cell=sizing.cell,margin=16,width=config.size*cell+margin*2,visible=challenge.id!=='fading-loop-clues'||revealWindow(challenge.seconds,12,20,4);
 useUniversityEvent(challenge,'rotating-loop',20,data.phase==='playing',()=>setData(old=>({...old,...rotateSlitherlink(old.puzzle,old.marks)})));
 const mark=(index,ink=data.ink)=>{if(data.phase!=='playing'||data.puzzle.fixed[index]>=0||challenge.id==='permanent-loop'&&data.marks[index]===1)return;const value=ink==='line'?1:2;setData({...data,marks:data.marks.map((old,i)=>i===index?(old===value?0:value):old),moves:data.moves+1,message:''});};
 const check=()=>setData(slitherValid(data.puzzle,data.marks)?finish(data,'completed',copy('Satu lingkaran utuh sesuai seluruh petunjuk.','One complete loop matches every clue.')):{...data,message:copy('Belum cocok. Periksa petunjuk, cabang, dan lingkaran yang terpisah.','Not solved. Check clues, branches and disconnected loops.')});
 const position=vertex=>[margin+(vertex%(config.size+1))*cell,margin+Math.floor(vertex/(config.size+1))*cell];
 return <ExtraFrame game={g} start={start} {...props} stats={data.marks?[{label:copy('Garis','Lines'),value:data.marks.filter(v=>v===1).length},{label:copy('Langkah','Moves'),value:data.moves}]:[]}>
  <p className="extra-instruction">{copy('Buat satu lingkaran tanpa cabang. Angka menunjukkan banyak sisi bergaris pada petak. Garis tebal/tanda X abu-abu adalah petunjuk awal yang terkunci.','Make one loop without branches. Numbers count the drawn sides of each cell. Thick lines/gray X marks are locked starting clues.')}</p><div className="loop-tools" role="group" aria-label={copy('Mode garis','Edge mode')}>{['line','cross'].map(ink=><button type="button" key={ink} className="ba-button outline" aria-pressed={data.ink===ink} onClick={()=>setData({...data,ink})}>{ink==='line'?copy('Garis','Line'):'×'}</button>)}<button type="button" className="ba-button primary" onClick={check}>{copy('Periksa','Check')}</button></div>
  <div ref={sizing.ref} className="extra-board-scroll slither-scroll" role="region" tabIndex={0} aria-label={copy('Papan Slitherlink, geser jika diperlukan','Slitherlink board, scroll as needed')}><svg width={width} height={width} viewBox={`0 0 ${width} ${width}`} className="slither-board" aria-label="Slitherlink">{data.puzzle?.clues.map((clue,i)=><text key={`c${i}`} x={margin+(i%config.size+.5)*cell} y={margin+(Math.floor(i/config.size)+.5)*cell} dominantBaseline="central" textAnchor="middle" className="slither-clue">{clue===null?'':visible?clue:'?'}</text>)}{data.puzzle?.topology.vertices.map((_,i)=>{const [cx,cy]=position(i);return <circle key={`v${i}`} cx={cx} cy={cy} r="2.8" className="slither-dot"/>;})}{data.puzzle?.topology.edges.map(([a,b],i)=>{const [x1,y1]=position(a),[x2,y2]=position(b),fixed=data.puzzle.fixed[i]>=0;return <g key={i} data-loop-edge={i} role="button" tabIndex={fixed?-1:0} aria-disabled={fixed} aria-label={copy(`Sisi ${i+1}: ${data.marks[i]===1?'garis':data.marks[i]===2?'X':'kosong'}${fixed?', terkunci':''}`,`Edge ${i+1}: ${data.marks[i]===1?'line':data.marks[i]===2?'X':'empty'}${fixed?', locked':''}`)} onClick={()=>mark(i)} onContextMenu={e=>{e.preventDefault();mark(i,'cross');}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();mark(i);}}}><line x1={x1} y1={y1} x2={x2} y2={y2} className="slither-hit"/>{data.marks[i]===1&&<line x1={x1} y1={y1} x2={x2} y2={y2} className={`slither-line ${fixed?'fixed':''}`}/ >}{data.marks[i]===2&&<text x={(x1+x2)/2} y={(y1+y2)/2} dominantBaseline="central" textAnchor="middle" className={fixed?'slither-cross fixed':'slither-cross'}>×</text>}</g>;})}</svg></div>{data.message&&<p role="alert">{data.message}</p>}
 </ExtraFrame>;
}
