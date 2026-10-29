import {UNIVERSITY_GAMEPLAY} from '../utils/universityGameplay.js';
import React,{useEffect} from 'react';
import Icon from './Icon.jsx';
import Dialog from './Dialog.jsx';
import {useArena} from '../context/ArenaContext.jsx';
import {gameById,resolveRoute} from '../data/games.js';
import {DIFFICULTY_LEVELS} from '../data/difficulties.js';
import {GAME_LEVEL_NOTES} from '../data/gameLevelNotes.js';
export function StatBadge({label,value,color='var(--uw-primary)'}){return <div className="play-stat"><span>{label}</span><strong style={{color}}>{value}</strong></div>;}
export function LevelSelector({value,onChange,lang='id'}){
  return <div className="play-levels simple-levels" role="group" aria-label={lang==='en'?'Difficulty':'Tingkat kesulitan'}>{DIFFICULTY_LEVELS.map((item,index)=><button type="button" key={item.id} aria-pressed={value===item.id} className={value===item.id?'selected':''} onClick={()=>onChange(item.id)}><span className="play-level-top"><span className="play-level-bars" aria-hidden="true">{[0,1,2,3,4].map(n=><i key={n} className={n<=index?'filled':''} style={{height:5+n*3}}/>)}</span><span className="play-level-check">{value===item.id&&<Icon name="check" size={10}/>}</span></span><strong>{item.label}</strong><small>{item.description[lang]}</small></button>)}</div>;
}
export function TipsButton({onClick,lang,label}){return <button className="uw-btn uw-btn-neutral play-tips-button" onClick={onClick}><Icon name="book" size={16}/>{label??(lang==='en'?'Guide':'Panduan')}</button>;}
export function SetupCard({heading,schoolLevel,onLevelChange,desc,lang='id',children,badge}){
  const {setSessionSchoolLevel,beginGameSession}=useArena();
  const gameId=resolveRoute(window.location.hash);
  useEffect(()=>{setSessionSchoolLevel(gameId,schoolLevel);},[gameId,schoolLevel,setSessionSchoolLevel]);
  const note=GAME_LEVEL_NOTES[gameId]?.[schoolLevel]?.[lang]||desc;
  const capture=event=>{if(gameId!=='300'&&gameById(gameId)&&event.target.closest('button.uw-btn-primary,button.uw-btn-secondary'))beginGameSession(gameId);};
  return <div className="play-setup-card"><div className="play-setup-heading"><span className="play-kicker">{lang==='en'?'CHOOSE YOUR CHALLENGE':'PILIH TANTANGANMU'}</span>{badge&&<span className="play-setup-badge">{badge}</span>}<h2>{heading}</h2><p>{lang==='en'?'Choose one of five difficulty levels, then start playing.':'Pilih satu dari lima tingkat kesulitan, lalu mulai bermain.'}</p></div><div className="play-field-label">{lang==='en'?'Difficulty':'Tingkat kesulitan'}<span>5 {lang==='en'?'levels':'tingkat'}</span></div><LevelSelector value={schoolLevel} onChange={onLevelChange} lang={lang}/>{note&&<div className="play-level-description"><Icon name="layers" size={19}/><p>{note}</p></div>}{schoolLevel==='universitas'&&<div className="university-setup-note"><Icon name="brain" size={21}/><div><strong>{lang==='en'?'Universitas: a complete brain challenge':'Universitas: tantangan otak lengkap'}</strong><p>{lang==='en'?'One of three gameplay variations is drawn each time you start. Read the active rule before making your first move.':'Satu dari tiga variasi gameplay dipilih acak setiap mulai. Baca aturan aktif sebelum langkah pertama.'}</p><ul className="university-variant-list">{UNIVERSITY_GAMEPLAY[gameId]?.map(item=><li key={item.id}><strong>{item.name[lang]}</strong><span>{item.note[lang]}</span></li>)}</ul></div></div>}<div className="play-setup-actions" onClickCapture={capture}>{children}</div></div>;
}
function ResultActions({onBack,onPlayAgain,lang,label}){
  const {prepareFreshSession,currentSession}=useArena();const gameId=resolveRoute(window.location.hash);
  return <div className="play-result-actions"><button className="uw-btn uw-btn-neutral" onClick={onBack}><Icon name="home" size={16}/>{lang==='en'?'Back to games':'Ke permainan'}</button><button className="uw-btn uw-btn-primary" onClick={()=>{if(gameId!=='300'&&!currentSession?.failure)prepareFreshSession(gameId);onPlayAgain();}}><Icon name="refresh" size={16}/>{label??(lang==='en'?'Play again':'Main lagi')}</button></div>;
}
function useFinalResult(){const {recordGameCompletion}=useArena();useEffect(()=>{recordGameCompletion();},[recordGameCompletion]);}
export function SoloEndCard({heading,subtext,onBack,onPlayAgain,playAgainLabel,lang,stats=null,children,outcome='completed'}){
  useFinalResult();return <div className="play-result"><div className="play-result-icon"><Icon name={outcome==='loss'?'refresh':'check'} size={30}/></div><p className="play-kicker">{lang==='en'?'GAME RESULT':'HASIL PERMAINAN'}</p><h2>{heading}</h2>{subtext&&<p>{subtext}</p>}{Array.isArray(stats)&&<div className="play-result-scores">{stats.filter(stat=>!['Best','Rekor'].includes(stat.label)).map((stat,i)=><div key={i}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}</div>}{children}<ResultActions onBack={onBack} onPlayAgain={onPlayAgain} lang={lang} label={playAgainLabel}/></div>;
}
export function MultiEndCard({winner,score1,score2,p1Label,p2Label,onBack,onPlayAgain,lang}){
  useFinalResult();const draw=winner==='draw';const p1=p1Label||(lang==='en'?'Player 1':'Pemain 1');const p2=p2Label||(lang==='en'?'Player 2':'Pemain 2');
  return <div className="play-result"><div className="play-result-icon"><Icon name="trophy" size={30}/></div><p className="play-kicker">{lang==='en'?'DUEL RESULT':'HASIL DUEL'}</p><h2>{draw?(lang==='en'?'A draw!':'Hasil seri!'):`${winner===1?p1:p2} ${lang==='en'?'wins!':'menang!'}`}</h2><div className="play-result-scores">{[{name:p1,value:score1},{name:p2,value:score2}].map((item,i)=><div key={i}><span>{item.name}</span><strong>{item.value}</strong></div>)}</div><ResultActions onBack={onBack} onPlayAgain={onPlayAgain} lang={lang}/></div>;
}
export function ConfirmModal({isOpen,title,message,confirmText,cancelText,onConfirm,onCancel,lang,isDangerous=false}){return <Dialog open={isOpen} onClose={onCancel} title={title}><p className="dialog-description">{message}</p><div className="dialog-actions"><button className="ba-button outline" onClick={onCancel}>{cancelText??(lang==='en'?'Cancel':'Batal')}</button><button className={`ba-button ${isDangerous?'danger':'primary'}`} onClick={onConfirm}>{confirmText??(lang==='en'?'Confirm':'Konfirmasi')}</button></div></Dialog>;}
