import React,{useMemo,useState} from 'react';
import Icon from '../components/Icon.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { gameById } from '../data/games.js';
import { challengeCodeGameId, normalizeChallengeCode } from '../utils/competitive.js';
import { challengeCodeFromHash, challengeLink, qrImageUrl } from '../utils/challengeShare.js';

export default function ChallengeShare({onNavigate}){
 const {lang}=useLanguage();const copy=(id,en)=>lang==='id'?id:en;const {setChallengeCode,setNotice}=useArena();
 const initial=challengeCodeFromHash(window.location.hash);const [code,setCode]=useState(initial);const normalized=normalizeChallengeCode(code);const gameId=challengeCodeGameId(normalized);const game=gameById(gameId);const link=useMemo(()=>challengeLink(normalized,window.location.href),[normalized]);
 const accept=()=>{if(!game)return;setChallengeCode(game.id,normalized);setNotice(copy('Challenge siap dimainkan','Challenge ready'));onNavigate(game.id);};
 const copyLink=async()=>{try{await navigator.clipboard.writeText(link);setNotice(copy('Link challenge disalin','Challenge link copied'));}catch{setNotice(copy('Tidak dapat menyalin otomatis','Could not copy automatically'));}};
 return <div className="meta-page challenge-share-page"><div className="page-heading"><div><span className="eyebrow">CHALLENGE LINK</span><h1>{copy('Bagikan arena yang sama.','Share the exact same arena.')}</h1><p className="page-intro">{copy('Challenge Code tetap menjadi sumber seed. Link dan QR hanya membuat kode itu lebih mudah dibagikan.','The Challenge Code remains the seed source. Link and QR simply make it easier to share.')}</p></div></div>
 <section className="share-challenge-card"><div className="share-challenge-main"><label><span>{copy('Challenge Code','Challenge Code')}</span><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="BA-MAZE-XXXXXXX"/></label>{game?<div className={`share-game color-${game.color}`}><span className="mini-game-icon"><Icon name={game.icon}/></span><div><small>{copy('GAME TERDETEKSI','DETECTED GAME')}</small><strong>{game.title[lang]}</strong></div></div>:<p className="settings-error">{copy('Masukkan Challenge Code Brain Arena yang valid.','Enter a valid Brain Arena Challenge Code.')}</p>}
 {game&&<><div className="share-link-box"><code>{link}</code><button className="ba-button outline" onClick={copyLink}><Icon name="copy" size={15}/>{copy('Salin Link','Copy Link')}</button></div><button className="ba-button primary" onClick={accept}>{copy('Terima Tantangan','Accept Challenge')}<Icon name="arrow" size={15}/></button></>}</div>
 {game&&<aside className="share-qr"><img src={qrImageUrl(link)} alt={copy('QR Challenge Brain Arena','Brain Arena Challenge QR')}/><strong>{copy('Scan untuk membuka challenge','Scan to open challenge')}</strong><small>{copy('QR dibuat dari link challenge publik.','QR is generated from the public challenge link.')}</small></aside>}</section></div>;
}
