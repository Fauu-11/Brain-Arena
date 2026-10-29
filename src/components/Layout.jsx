import React,{useEffect} from 'react';
import Icon from './Icon.jsx';
import PwaInstallButton from './PwaInstallButton.jsx';
import PwaUpdateManager from './PwaUpdateManager.jsx';
import ControllerBridge from './ControllerBridge.jsx';
import {useArena} from '../context/ArenaContext.jsx';
import {useLanguage} from '../context/LanguageContext.jsx';
import {gameById} from '../data/games.js';
import {useViewportInsets} from '../hooks/useViewportInsets.js';
export default function Layout({children,currentView,onViewChange}){
  useViewportInsets();
  const {lang,toggleLang}=useLanguage();const {muted,toggleSound,notice,storageOk,currentSession}=useArena();
  const copy=(id,en)=>lang==='en'?en:id;
  const active=Boolean(gameById(currentView));const playing=currentSession?.active&&active;
  const tabs=[['games','gamepad',copy('Permainan','Games')],['guides','book',copy('Panduan','Guides')],['settings','sliders',copy('Pengaturan','Settings')]];
  useEffect(()=>{const handler=event=>{if((event.ctrlKey||event.metaKey)&&event.key==='k'){event.preventDefault();onViewChange('games');setTimeout(()=>document.getElementById('catalog-search')?.focus(),100);}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[onViewChange]);
  return <div className={`simple-app ${active?'has-game':''} ${playing?'is-playing':''}`}>
    <a className="skip-link" href="#main-content">{copy('Lewati ke konten','Skip to content')}</a>
    <header className="simple-topbar"><button className="simple-brand" onClick={()=>onViewChange('games')} aria-label="Brain Arena"><span><Icon name="brain" size={22}/></span><strong>brain<span>arena</span></strong></button>
      <nav aria-label={copy('Navigasi utama','Main navigation')}>{tabs.map(([id,icon,label])=><button key={id} aria-current={(currentView===id||(id==='games'&&['home','games'].includes(currentView)))?'page':undefined} onClick={()=>onViewChange(id)}><Icon name={icon} size={17}/>{label}</button>)}</nav>
      <div className="simple-tools"><button className="icon-button" onClick={toggleSound} aria-pressed={muted} aria-label={muted?copy('Aktifkan suara','Unmute'):copy('Bisukan suara','Mute')}><Icon name={muted?'muted':'sound'} size={19}/></button><button className="language-button" onClick={toggleLang} aria-label={copy('Ganti bahasa','Change language')}>{lang.toUpperCase()}</button><PwaInstallButton compact/></div>
    </header>
    {!storageOk&&<p className="simple-storage-warning" role="status">{copy('Pengaturan tidak dapat disimpan di browser ini. Permainan tetap bisa dimainkan.','Settings cannot be saved in this browser. You can still play.')}</p>}
    <main id="main-content" className="simple-main" tabIndex={-1}>{children}</main>
    {!playing&&<nav className="simple-mobile-tabs" aria-label={copy('Navigasi mobile','Mobile navigation')}>{tabs.map(([id,icon,label])=><button key={id} aria-current={(currentView===id||(id==='games'&&['home','games'].includes(currentView)))?'page':undefined} onClick={()=>onViewChange(id)}><Icon name={icon} size={21}/><span>{label}</span></button>)}</nav>}
    <PwaUpdateManager/><ControllerBridge/>{notice&&<div className="simple-toast" role="status">{notice}</div>}
  </div>;
}
