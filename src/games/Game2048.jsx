import {useUniversityGameplay} from '../hooks/useUniversityGameplay.js';
import {revealWindow} from '../utils/universityGameplay.js';
import { sessionRandom } from '../utils/competitive.js';
import { useGameCheckpoint } from '../hooks/useGameCheckpoint.js';
import { initialGameSetting } from '../utils/sessionRules.js';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import RulesModal from '../components/RulesModal.jsx';
import { SetupCard, TipsButton, SoloEndCard } from '../components/GameShell.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { create2048 } from '../utils/game2048.js';
import { initial2048Session, reduce2048Session } from '../utils/boardSessions.js';
import { useArena } from '../context/ArenaContext.jsx';

const random=()=>sessionRandom('game2048');

const TARGETS={sd:128,smp:256,sma:512,'sma-plus':1024}; const UNI={hard:1024,'very-hard':2048,impossible:4096}; const UL={impossible:'Universitas'};
const KEY={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
export default function Game2048({onBack,onNavigate}) {
  const {lang}=useLanguage(); const copy=(id,en)=>lang==='en'?en:id;
  const [showRules,setShowRules]=useState(false); const [{state,board,score,moves},dispatch]=useReducer(reduce2048Session,initial2048Session); const {restartGameSession}=useArena(); const [level,setLevel]=useState(()=>initialGameSetting('game2048','schoolLevels','sd')); const [uni,setUni]=useState(()=>initialGameSetting('game2048','universityDifficulties','hard'));
  const challenge=useUniversityGameplay('game2048',level,state==='playing');
  const valuesVisible=challenge.id!=='hidden-values'||revealWindow(challenge.seconds,6,20,3);
  const lockedDirection=challenge.id==='locked-direction'?['up','right','down','left'][Math.floor(challenge.seconds/20)%4]:null;
  const touch=useRef(null);
  const target=level==='universitas'?UNI[uni]:TARGETS[level];
  const start=useCallback(()=>{touch.current=null;dispatch({type:'start',board:create2048(random)});},[]);
  const restart=()=>{restartGameSession('game2048');start();};
  const move=useCallback(direction=>{if(state!=='playing'||direction===lockedDirection)return;dispatch({type:'move',direction,target,randomValues:[random(),challenge.id==='heavy-spawn'?.99:random()]});},[state,target,lockedDirection,challenge.id]);
  useEffect(()=>{const handler=e=>{const dir=KEY[e.key];if(!dir||state!=='playing'||document.querySelector('dialog[open]'))return;const el=e.target;if(['INPUT','TEXTAREA','SELECT'].includes(el?.tagName)||el?.isContentEditable)return;e.preventDefault();move(dir);};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[move,state]);
  const won=Math.max(...board)>=target;
  const descriptions={sd:copy('Target 128 · Kenali cara menggabungkan ubin tanpa memenuhi papan.','Target 128 · Learn merging without filling the board.'),smp:copy('Target 256 · Mulai bangun sudut utama dan rantai angka.','Target 256 · Build a main corner and number chain.'),sma:copy('Target 512 · Perlu disiplin arah dan perencanaan beberapa langkah.','Target 512 · Requires directional discipline and multi-move planning.'),universitas:copy(`Target ${target} · ${UL[uni]} · Jaga ubin terbesar tetap terkunci di sudut.`,`Target ${target} · ${UL[uni]} · Keep your largest tile anchored in a corner.`)};
  const rules=lang==='en'?['Use Arrow Keys/WASD, swipe, or the D-pad to slide every tile.','Equal tiles merge when they collide. Each merged value is added to your score.','The opening tiles and every new 2 or 4 use randomized empty positions after valid moves.','Reach the target tile to complete the challenge.','Targets: SD 128, SMP 256, SMA 512, SMA+ 1024, Universitas 4096 with a random gameplay rule.' ]:[ 'Gunakan panah/WASD, swipe, atau D-pad untuk menggeser semua ubin.','Ubin bernilai sama bergabung saat bertabrakan. Nilai gabungan menambah skor.','Posisi dua ubin awal dan setiap angka 2 atau 4 baru selalu dipilih secara acak dari petak kosong.','Capai ubin target untuk menyelesaikan tantangan.','Target: SD 128, SMP 256, SMA 512, SMA+ 1024, Universitas 4096 dengan aturan acak.' ];
  const tileClass=value=>value>=2048?'t-super':value>=512?'t-512':value>=128?'t-128':value>=32?'t-32':value>=8?'t-8':value?'t-base':'empty';
  const swipeStart=e=>{const p=e.touches?.[0];if(p)touch.current={x:p.clientX,y:p.clientY};}; const swipeEnd=e=>{if(!touch.current)return;const p=e.changedTouches?.[0];if(!p)return;const dx=p.clientX-touch.current.x,dy=p.clientY-touch.current.y;touch.current=null;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));};
  const stats=state==='playing'?<><span><Icon name="hash" size={14}/>{score.toLocaleString()}</span><span><Icon name="grid" size={14}/>{copy('Target','Target')} {target}</span></>:null;
  useGameCheckpoint('game2048',{level,uni,session:{state,board,score,moves}},saved=>{setLevel(saved.level);setUni(saved.uni);dispatch({type:'restore',session:saved.session});},state==='playing',state==='playing');

  return <GameScreen universityMode={challenge} gameId="game2048" lang={lang} state={state} level={level} onBack={onBack} onNavigate={onNavigate} onRules={()=>setShowRules(true)} stats={stats}>
    {state==='setup'&&<SetupCard heading={copy('Pilih target 2048','Choose your 2048 target')} schoolLevel={level} onLevelChange={setLevel} desc={descriptions[level]} lang={lang} badge={`${copy('Target','Target')} ${target}`}>
      <button className="uw-btn uw-btn-primary" onClick={start}><Icon name="play" size={16}/>{copy('Mulai 2048','Start 2048')}</button><TipsButton lang={lang} onClick={()=>onNavigate?.('tips-game2048')}/>
    </SetupCard>}
    {state==='playing'&&<div className="g2048-gameplay"><div className="g2048-toolbar"><div><span className="play-kicker">2048</span><strong>{copy('Target','Target')} {target}</strong><small>{copy('Gabungkan angka yang sama tanpa memutus rantai terbesar.','Merge equal numbers without breaking your largest chain.')}</small></div><button onClick={restart}><Icon name="refresh" size={15}/>{copy('Ulang','Restart')}</button></div>{lockedDirection&&<p className="university-local-rule" role="status">{copy('Arah terkunci','Locked direction')}: {({up:copy('Atas','Up'),right:copy('Kanan','Right'),down:copy('Bawah','Down'),left:copy('Kiri','Left')})[lockedDirection]}</p>}<div className="g2048-board" onTouchStart={swipeStart} onTouchEnd={swipeEnd} onTouchCancel={()=>{touch.current=null;}}>{board.map((value,index)=><div key={index} className={`g2048-tile ${tileClass(value)}`}>{value?(valuesVisible?value:'?'):''}</div>)}</div><div className="g2048-dpad" role="group" aria-label={copy('Kontrol arah','Direction controls')}><button aria-label={copy('Atas','Up')} disabled={lockedDirection==='up'} onClick={()=>move('up')}>↑</button><button aria-label={copy('Kiri','Left')} disabled={lockedDirection==='left'} onClick={()=>move('left')}>←</button><button aria-label={copy('Bawah','Down')} disabled={lockedDirection==='down'} onClick={()=>move('down')}>↓</button><button aria-label={copy('Kanan','Right')} disabled={lockedDirection==='right'} onClick={()=>move('right')}>→</button></div><p className="nonogram-hint">{copy('Desktop: panah / WASD · Mobile: swipe atau tombol arah.','Desktop: arrows / WASD · Mobile: swipe or direction buttons.')}</p></div>}
    {state==='ended'&&<SoloEndCard heading={won?copy(`Ubin ${target} tercapai!`,`You reached ${target}!`):copy('Papan terkunci.','No moves left.')} subtext={won?copy('Strategi sudutmu berhasil. Coba target berikutnya atau kejar skor lebih tinggi.','Your corner strategy worked. Try the next target or chase a higher score.'):copy('Tidak ada langkah valid tersisa. Susun rantai lebih rapat pada percobaan berikutnya.','No valid moves remain. Build a tighter chain next run.')} onBack={onBack} onPlayAgain={start} lang={lang} outcome={won?'completed':'loss'} stats={[{label:copy('Skor','Score'),value:score.toLocaleString()},{label:copy('Langkah','Moves'),value:moves},{label:copy('Ubin terbesar','Largest tile'),value:Math.max(...board)}]}><button type="button" className="ms-change-level" onClick={()=>dispatch({type:'setup'})}>{copy('Ganti target','Change target')}</button></SoloEndCard>}
    <RulesModal isOpen={showRules} onClose={()=>setShowRules(false)} gameName="2048" ruleList={rules}/>
  </GameScreen>;
}
