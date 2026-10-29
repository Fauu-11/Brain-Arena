import { useViewportInsets } from '../hooks/useViewportInsets.js';
import { sessionDurationMs } from '../utils/sessionClock.js';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { GAMES, CATEGORIES, gameById } from '../data/games.js';
import { PRIMARY_NAVIGATION, FOOTER_NAVIGATION, NAVIGATION_DESTINATIONS, isNavActive } from '../data/navigation.js';
import Icon from './Icon.jsx';
import Dialog from './Dialog.jsx';
import PwaInstallButton from './PwaInstallButton.jsx';
import PwaUpdateManager from './PwaUpdateManager.jsx';
import OnboardingTour from './OnboardingTour.jsx';
import ControllerBridge from './ControllerBridge.jsx';

// Portaled tooltips stay outside the rail's scroll container. Names remain on buttons.
function Tooltip({label,children,placement='bottom'}) {
  const id=useId(), anchor=useRef(null), leaveTimer=useRef(null);
  const [hovered,setHovered]=useState(false), [focused,setFocused]=useState(false);
  const [dismissed,setDismissed]=useState(false), [position,setPosition]=useState(null);
  const open=(hovered||focused)&&!dismissed&&position;
  const locate=()=>{
    const rect=anchor.current?.getBoundingClientRect();
    if(!rect)return;
    setPosition({left:Math.max(8,Math.min(placement==='right'?rect.right+10:rect.left,window.innerWidth-280)),top:placement==='right'?rect.top+rect.height/2:rect.bottom+8});
    setDismissed(false);
  };
  const enter=()=>{clearTimeout(leaveTimer.current);setHovered(true);locate();};
  const leave=()=>{leaveTimer.current=setTimeout(()=>setHovered(false),120);};
  useEffect(()=>()=>clearTimeout(leaveTimer.current),[]);
  useEffect(()=>{
    if(!open)return;
    const dismiss=e=>{if(e.key==='Escape'){setDismissed(true);if(!document.querySelector('dialog[open]')){e.preventDefault();e.stopPropagation();}}};
    const reposition=()=>setDismissed(true);
    window.addEventListener('keydown',dismiss,true);
    window.addEventListener('resize',reposition);
    window.addEventListener('scroll',reposition,true);
    return()=>{window.removeEventListener('keydown',dismiss,true);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',reposition,true);};
  },[open]);
  return <span className="navigation-tooltip-trigger" ref={anchor} onMouseEnter={enter} onMouseLeave={leave} onFocus={()=>{setFocused(true);locate();}} onBlur={()=>setFocused(false)} onClick={()=>setDismissed(true)}>
    {React.cloneElement(children,{'aria-describedby':open?id:undefined})}
    {open&&createPortal(<span id={id} role="tooltip" className={`layout-refresh navigation-tooltip tooltip-${placement}`} style={position} onMouseEnter={enter} onMouseLeave={leave}>{label}</span>,document.body)}
  </span>;
}
function TooltipButton({label,placement,children,...props}) {
  return <Tooltip label={label} placement={placement}><button type="button" aria-label={label} {...props}>{children}</button></Tooltip>;
}

function readSidebarPreference() {
  try {
    const collapsed=localStorage.getItem('ba_sidebar_collapsed');
    if(collapsed==='1'||collapsed==='0')return collapsed==='1';
    const saved=JSON.parse(localStorage.getItem('ba_sidebar_layout_v2')||'null');
    if(saved?.mode==='compact')return true;
    // Older migrations generated "full" even without a manual choice.
    if(saved?.mode==='full'&&saved?.migratedAt)return null;
    if(saved?.mode==='full'||saved?.mode==='expanded')return false;
  } catch {}
  return null;
}

function Navigation({currentView,onNavigate,compact=false,onCollapse}) {
  const {lang}=useLanguage();
  const {pinnedGames,profile,levelInfo,avatarOption,frameOption,missionCards}=useArena();
  const copy=(id,en)=>lang==='id'?id:en;
  const readyCount=missionCards.filter(mission=>mission.complete&&!mission.claimed).length;
  const pinned=pinnedGames.map(gameById).filter(Boolean).slice(0,3);
  const renderItem=item=>{
    const count=item.id==='progress'?readyCount:0;
    const label=`${item.label[lang]}${item.id==='profile'?`, ${profile.name||copy('Pemain lokal','Local player')}`:''}${count?copy(`, ${count} hadiah misi siap diklaim`,`, ${count} mission rewards ready to claim`):''}`;
    const active=isNavActive(item.id,currentView);
    const content=<><span className={item.id==='profile'?`profile-avatar navigation-avatar frame-${frameOption.id}`:'navigation-icon'}><Icon name={item.id==='profile'?avatarOption.icon:item.icon} size={20}/></span>{!compact&&<span className="navigation-label">{item.id==='profile'?<><strong>{profile.name||copy('Pemain lokal','Local player')}</strong><small>{copy('Level','Level')} {levelInfo.level} · {copy('Lokal','Local')}</small></>:item.label[lang]}</span>}{count>0&&<span className="navigation-badge" aria-hidden="true">{count}</span>}</>;
    const props={className:`navigation-item ${active?'active':''}`,onClick:()=>onNavigate(item.id),'aria-current':active?'page':undefined};
    return compact?<TooltipButton key={item.id} label={label} placement="right" {...props}>{content}</TooltipButton>:<button type="button" key={item.id} aria-label={label} {...props}>{content}</button>;
  };
  const brand=<button type="button" className={`brand ${compact?'brand-compact':''}`} onClick={()=>onNavigate('home')} aria-label={copy('Brain Arena — Beranda','Brain Arena — Home')}><span className="brand-mark"><Icon name="cube" size={24}/></span>{!compact&&<span><strong>brain<span>arena</span><i/></strong></span>}</button>;
  return <div className={`navigation-shell ${compact?'navigation-compact':''}`}>
    <div className="navigation-header">{compact?<Tooltip label={copy('Brain Arena — Beranda','Brain Arena — Home')} placement="right">{brand}</Tooltip>:brand}{!compact&&onCollapse&&<TooltipButton className="icon-button navigation-collapse" label={copy('Ringkas sidebar','Collapse sidebar')} onClick={onCollapse}><Icon name="back" size={18}/></TooltipButton>}</div>
    <div className="navigation-scroll">
      <nav className="navigation-primary" aria-label={copy('Navigasi utama','Main navigation')}>{PRIMARY_NAVIGATION.map(renderItem)}</nav>
      {!compact&&pinned.length>0&&<section className="navigation-pins" aria-label={copy('Permainan dipin','Pinned games')}><div className="navigation-pins-heading"><h2>{copy('DIPIN','PINNED')}</h2><button type="button" onClick={()=>onNavigate('games')} aria-label={copy('Kelola pin di Permainan','Manage pins in Games')}>{copy('Kelola','Manage')}</button></div><nav aria-label={copy('Akses cepat permainan dipin','Pinned game shortcuts')}>{pinned.map(game=><button type="button" key={game.id} className={`navigation-item navigation-pin ${currentView===game.id?'is-current-game':''}`} onClick={()=>onNavigate(game.id)}><span className="navigation-icon"><Icon name={game.icon} size={19}/></span><span className="navigation-label">{game.title[lang]}</span></button>)}</nav></section>}
    </div>
    <nav className="navigation-footer" aria-label={copy('Pengaturan dan profil','Settings and profile')}>{FOOTER_NAVIGATION.map(renderItem)}</nav>
  </div>;
}

export default function Layout({children,currentView,onViewChange}){
  useViewportInsets();
  const {lang,toggleLang}=useLanguage();
  const {muted,toggleSound,storageOk,notice,profile,levelInfo,rankInfo,avatarOption,frameOption,accessibility,updateAccessibility,currentSession,requestCoachHint,arenaRun,arenaCup,notifications,unreadNotifications,markNotificationRead,markAllNotificationsRead,recoverySession,resumeRecovery,setSessionSchoolLevel,setSessionUniversityDifficulty}=useArena();
  const [toolsOpen,setToolsOpen]=useState(false);
  const [menu,setMenu]=useState(false),[search,setSearch]=useState(false),[help,setHelp]=useState(false),[notificationsOpen,setNotificationsOpen]=useState(false),[query,setQuery]=useState(''),[focus,setFocus]=useState(false),[coachOpen,setCoachOpen]=useState(false),[coachData,setCoachData]=useState(null),[,setSessionNow]=useState(Date.now());
  const sidebarToggleRef=useRef(null);
  const [manualCollapsed,setManualCollapsed]=useState(readSidebarPreference);
  const [wideViewport,setWideViewport]=useState(()=>window.matchMedia('(min-width:1200px)').matches);
  const sidebarCollapsed=manualCollapsed??!wideViewport;
  const copy=useCallback((id,en)=>lang==='id'?id:en,[lang]);
  const activeGame=gameById(currentView);
  const navigate=useCallback(view=>{setMenu(false);setSearch(false);setNotificationsOpen(false);setQuery('');onViewChange(view);},[onViewChange]);
  const toggleSidebar=useCallback(()=>{
    const next=!sidebarCollapsed;
    setManualCollapsed(next);
    try{localStorage.setItem('ba_sidebar_collapsed',next?'1':'0');}catch{}
    try{const old=JSON.parse(localStorage.getItem('ba_sidebar_layout_v2')||'{}');localStorage.setItem('ba_sidebar_layout_v2',JSON.stringify({...old,mode:next?'compact':'full'}));}catch{}
  },[sidebarCollapsed]);
  useEffect(()=>{
    const media=window.matchMedia('(min-width:1200px)');
    const update=()=>setWideViewport(media.matches);
    media.addEventListener('change',update);
    return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>{if(!activeGame)setFocus(false);},[activeGame]);
  useEffect(()=>{if(!activeGame||!currentSession?.active||currentSession.gameId!==activeGame.id)return;const timer=setInterval(()=>setSessionNow(Date.now()),1000);return()=>clearInterval(timer);},[activeGame,currentSession?.active,currentSession?.gameId]);
  useEffect(()=>{const handleKey=e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='s'){e.preventDefault();toggleSidebar();return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearch(v=>!v);return;}const el=e.target;if(['INPUT','TEXTAREA','SELECT'].includes(el?.tagName)||el?.isContentEditable)return;if(e.altKey&&e.key.toLowerCase()==='h'){e.preventDefault();navigate('home');}if(e.altKey&&e.key.toLowerCase()==='l'){e.preventDefault();toggleLang();}if(e.altKey&&e.key.toLowerCase()==='m'){e.preventDefault();toggleSound();}if(e.key==='?'&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();setHelp(true);}};window.addEventListener('keydown',handleKey);return()=>window.removeEventListener('keydown',handleKey);},[navigate,toggleLang,toggleSound,toggleSidebar]);
  const names=Object.fromEntries(NAVIGATION_DESTINATIONS.map(item=>[item.id,item.label[lang]]));
  const currentName=activeGame?.title[lang]||(currentView.startsWith('tips-')?`${copy('Panduan','Guide')} / ${gameById(currentView.slice(5))?.title[lang]||''}`:names[currentView]||copy('Halaman tidak ditemukan','Page not found'));
  const normalized=query.trim().toLocaleLowerCase();
  const searchDifficulty=normalized.includes('impossible')?'impossible':normalized.includes('very hard')||normalized.includes('very-hard')?'very-hard':/(^|\s)hard(\s|$)/.test(normalized)?'hard':null;
  const searchTerms=normalized.replace(/very[- ]hard|impossible|hard/g,' ').split(/\s+/).filter(Boolean);
  const gameResults=GAMES.filter(g=>{const hay=`${g.title.id} ${g.title.en} ${CATEGORIES[g.category][lang]} ${g.description[lang]}`.toLocaleLowerCase();return searchTerms.every(term=>hay.includes(term));});
  const openGameResult=g=>{if(searchDifficulty){setSessionSchoolLevel(g.id,'universitas');setSessionUniversityDifficulty(g.id,searchDifficulty);}navigate(g.id);};
  const commandItems=useMemo(()=>[
    ...NAVIGATION_DESTINATIONS.map(item=>({id:item.id,icon:item.icon,label:copy(`Buka ${item.label.id}`,`Open ${item.label.en}`),keywords:`${item.id} ${item.label.id} ${item.label.en} ${item.keywords||''}`,run:()=>navigate(item.id)})),
    ...GAMES.map(game=>({id:`tips-${game.id}`,icon:'book',label:copy(`Panduan ${game.title.id}`,`${game.title.en} guide`),keywords:`tips guide panduan ${game.title.id} ${game.title.en}`,run:()=>navigate(`tips-${game.id}`)})),
    {id:'random',icon:'shuffle',label:copy('Mainkan game acak','Play a random game'),keywords:'random acak',run:()=>navigate(GAMES[Math.floor(Math.random()*GAMES.length)].id)},
    {id:'help',icon:'help',label:copy('Buka bantuan','Open help'),keywords:'help bantuan shortcuts pintasan',run:()=>{setSearch(false);setHelp(true);}},
    {id:'sidebar',icon:'sidebar',label:copy('Ubah Sidebar','Toggle Sidebar'),keywords:'sidebar compact full',run:toggleSidebar},
    {id:'notifications',icon:'bell',label:copy('Buka Notifikasi','Open Notifications'),keywords:'notification notifikasi inbox',run:()=>{setSearch(false);setNotificationsOpen(true);}},
    {id:'sound',icon:muted?'muted':'sound',label:muted?copy('Aktifkan suara','Unmute sound'):copy('Bisukan suara','Mute sound'),keywords:'sound suara mute',run:toggleSound},
    {id:'language',icon:'globe',label:copy('Ganti bahasa','Switch language'),keywords:'language bahasa english indonesia',run:toggleLang},
    {id:'dark',icon:'moon',label:copy('Aktifkan Dark Mode','Enable Dark Mode'),keywords:'dark theme tema gelap',run:()=>updateAccessibility('theme','dark')},
    {id:'light',icon:'sun',label:copy('Aktifkan Light Mode','Enable Light Mode'),keywords:'light theme tema terang',run:()=>updateAccessibility('theme','light')},

  ],[copy,navigate,toggleSidebar,muted,toggleSound,toggleLang,updateAccessibility]);
  const commandResults=commandItems.filter(item=>!normalized||`${item.label} ${item.keywords}`.toLocaleLowerCase().includes(normalized));
  const activeSession=activeGame&&currentSession?.gameId===activeGame.id?currentSession:null;
  const sessionElapsed=activeSession?.active?sessionDurationMs():0;
  const fmt=ms=>{const sec=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;};
  const openCoach=()=>{if(!activeGame)return;setCoachData(requestCoachHint(activeGame.id,lang));setCoachOpen(true);};
  const openNotification=item=>{markNotificationRead(item.id);if(item.type==='recovery'&&recoverySession){const target=resumeRecovery();if(target)navigate(target);return;}if(item.route)navigate(item.route);};
  return <div className={`ba-app layout-refresh ${focus?'is-focus':''} ${activeGame?'has-game':''} ${activeSession?.active?'is-playing':''} ${sidebarCollapsed?'sidebar-collapsed':'sidebar-expanded'} theme-${accessibility.theme} ${accessibility.reducedMotion?'reduce-motion':''} ${accessibility.highContrast?'high-contrast':''} ${accessibility.largeText?'large-text':''}`}>
    <a href="#main-content" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>{copy('Lewati ke konten','Skip to content')}</a>
    <aside className="sidebar"><Navigation currentView={currentView} onNavigate={navigate} onCollapse={()=>{toggleSidebar();sidebarToggleRef.current?.focus();}}/></aside><aside className="sidebar-rail"><Navigation compact currentView={currentView} onNavigate={navigate}/></aside>
    <div className="app-body"><header className="topbar">
      <div className="topbar-left"><TooltipButton className="icon-button mobile-menu" onClick={()=>setMenu(true)} label={copy('Buka menu navigasi','Open navigation menu')} aria-haspopup="dialog" aria-expanded={menu}><Icon name="menu"/></TooltipButton><TooltipButton ref={sidebarToggleRef} className="icon-button sidebar-toggle" onClick={toggleSidebar} aria-pressed={sidebarCollapsed} aria-keyshortcuts="Control+Shift+S" label={`${sidebarCollapsed?copy('Perluas sidebar','Expand sidebar'):copy('Ringkas sidebar','Collapse sidebar')} · Ctrl+Shift+S`}><Icon name="sidebar" size={18}/></TooltipButton><div className="breadcrumb"><button onClick={()=>navigate('home')} aria-label={copy('Kembali ke Beranda','Return Home')}><Icon name="home" size={15}/><span>Arena</span></button><Icon name="chevron" size={12}/><span>{currentName}</span></div></div>
      <div className="topbar-actions"><button type="button" className="icon-button mobile-tools-button" onClick={()=>setToolsOpen(true)} aria-haspopup="dialog" aria-expanded={toolsOpen} aria-label={copy('Opsi permainan dan aplikasi','Game and app options')}><Icon name="sliders" size={19}/></button><TooltipButton className="global-search" onClick={()=>setSearch(true)} label={copy('Cari game atau aksi (Ctrl K)','Search games or actions (Ctrl K)')}><Icon name="search" size={16}/><span>{copy('Cari game atau aksi...','Search games or actions...')}</span><kbd>Ctrl K</kbd></TooltipButton><span className="toolbar-divider"/><TooltipButton className="language-button" onClick={toggleLang} label={copy('Ganti bahasa ke Inggris','Switch language to Indonesian')}><Icon name="globe" size={17}/>{lang.toUpperCase()}<Icon name="down" size={11}/></TooltipButton><TooltipButton className="icon-button sound-button" onClick={toggleSound} aria-pressed={muted} label={muted?copy('Aktifkan suara','Unmute sound'):copy('Bisukan suara','Mute sound')}><Icon name={muted?'muted':'sound'} size={18}/></TooltipButton>{activeGame&&<TooltipButton className="icon-button" onClick={()=>setFocus(!focus)} aria-pressed={focus} label={focus?copy('Keluar mode fokus','Exit focus mode'):copy('Mode fokus','Focus mode')}><Icon name={focus?'collapse':'expand'} size={18}/></TooltipButton>}{activeGame&&<TooltipButton className="icon-button coach-top-button" onClick={openCoach} label="Brain Coach"><Icon name="brain" size={18}/></TooltipButton>}<Tooltip label={copy('Pasang Brain Arena','Install Brain Arena')}><PwaInstallButton compact/></Tooltip><TooltipButton className="icon-button notification-button" onClick={()=>setNotificationsOpen(true)} label={copy(`Buka notifikasi${unreadNotifications?`, ${unreadNotifications} belum dibaca`:''}`,`Open notifications${unreadNotifications?`, ${unreadNotifications} unread`:''}`)}><Icon name="bell" size={18}/>{unreadNotifications>0&&<span aria-hidden="true">{Math.min(99,unreadNotifications)}</span>}</TooltipButton><TooltipButton className="topbar-profile" onClick={()=>navigate('profile')} label={copy('Buka profil pemain','Open player profile')}><span className={`frame-${frameOption.id}`}><Icon name={avatarOption.icon} size={15}/></span><span><strong>{profile.name||copy('Pemain Lokal','Local Player')}</strong><small>{rankInfo.tier.title[lang]} · Lv. {levelInfo.level}</small></span><i><b style={{width:`${levelInfo.progress}%`}}/></i></TooltipButton><TooltipButton className="icon-button help-button" onClick={()=>setHelp(true)} label={copy('Buka bantuan','Open help')}><Icon name="help" size={19}/></TooltipButton></div>
    </header>
      {!storageOk&&<div className="storage-banner" role="status">{copy('Penyimpanan browser tidak tersedia. Perubahan hanya tersimpan selama tab ini terbuka.','Browser storage is unavailable. Changes will only last while this tab stays open.')}</div>}
      {activeSession?.active&&<div className="competitive-hud"><span className={`hud-mode ${activeSession.mode}`}><Icon name={activeSession.mode==='ranked'?'shield':'gamepad'} size={13}/>{activeSession.mode==='ranked'?'Ranked':'Practice'}</span><span><Icon name="clock" size={13}/>{fmt(sessionElapsed)}</span>{activeSession.personalBestMs>0&&<span><Icon name="ghost" size={13}/>PB {fmt(activeSession.personalBestMs)}</span>}<code>{activeSession.challengeCode}</code>{arenaRun?.status==='active'&&activeSession.arenaRunId===arenaRun.id&&<span className="hud-run"><Icon name="trophy" size={13}/>{copy('Arena','Arena')} {arenaRun.index+1}/{arenaRun.stages.length}</span>}{arenaCup?.status==='active'&&activeSession.arenaCupId===arenaCup.id&&<span className="hud-run"><Icon name="trophy" size={13}/>Cup {arenaCup.index+1}/{arenaCup.stages.length}</span>}<button onClick={openCoach}><Icon name="brain" size={13}/>Brain Coach{activeSession.mode==='ranked'?` ${Math.max(0,2-(activeSession.hintsUsed||0))}/2`:''}</button></div>}
      <main id="main-content" tabIndex={-1} className={`main-content ${activeGame?'game-page':''}`}>{children}</main><footer className="site-footer"><span><strong>brainarena.</strong> {copy('Tempat pikiran bertumbuh.','Where sharp minds play.')}</span><span>{copy('Proyek penggemar independen','An independent fan project')}<i/>{copy('Dibuat untuk terus belajar','Built to keep you learning')}</span></footer>
    </div>
    <nav className="mobile-tabbar" aria-label={copy('Navigasi bawah','Bottom navigation')}>
      {[...PRIMARY_NAVIGATION.filter(item=>item.id!=='guides'),FOOTER_NAVIGATION.find(item=>item.id==='profile')].map(item=><button type="button" key={item.id} aria-current={isNavActive(item.id,currentView)?'page':undefined} onClick={()=>navigate(item.id)}><Icon name={item.icon} size={21}/><span>{item.label[lang]}</span></button>)}
    </nav>
    <Dialog open={toolsOpen} onClose={()=>setToolsOpen(false)} title={copy('Opsi cepat','Quick options')} className="mobile-tools-dialog">
      <div className="mobile-tool-grid">
        <button onClick={toggleSound} aria-pressed={muted}><Icon name={muted?'muted':'sound'}/>{muted?copy('Aktifkan suara','Unmute'):copy('Bisukan suara','Mute')}</button>
        <button onClick={toggleLang}><Icon name="globe"/>{copy('Bahasa: Indonesia','Language: English')}</button>
        <button onClick={()=>{setToolsOpen(false);setNotificationsOpen(true);}}><Icon name="bell"/>{copy('Notifikasi','Notifications')}{unreadNotifications>0&&<span>{unreadNotifications}</span>}</button>
        <button onClick={()=>{setToolsOpen(false);navigate('settings');}}><Icon name="sliders"/>{copy('Pengaturan','Settings')}</button>
        {activeGame&&<button onClick={()=>{setToolsOpen(false);openCoach();}}><Icon name="brain"/>Brain Coach</button>}
        {activeGame&&<button onClick={()=>{setFocus(!focus);setToolsOpen(false);}}><Icon name={focus?'collapse':'expand'}/>{focus?copy('Keluar fokus','Exit focus'):copy('Mode fokus','Focus mode')}</button>}
        <button onClick={()=>{setToolsOpen(false);setHelp(true);}}><Icon name="help"/>{copy('Bantuan','Help')}</button>
        <PwaInstallButton/>
      </div>
    </Dialog>
    <PwaUpdateManager/><OnboardingTour onNavigate={navigate}/><ControllerBridge/>
    <Dialog open={menu} onClose={()=>setMenu(false)} title={copy('Navigasi','Navigation')} className="mobile-menu-dialog layout-refresh"><Navigation currentView={currentView} onNavigate={navigate}/></Dialog>
    <Dialog open={search} onClose={()=>{setSearch(false);setQuery('');}} title={copy('Command Palette','Command Palette')} className="search-dialog command-dialog"><label className="command-input"><Icon name="search"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder={copy('Cari game, halaman, atau aksi...','Search games, pages, or actions...')}/></label><div className="command-section"><small>{copy('AKSI CEPAT','QUICK ACTIONS')}</small><div className="search-results command-results">{commandResults.map(item=><button key={item.id} onClick={()=>{item.run();setSearch(false);setQuery('');}}><span className="command-result-icon"><Icon name={item.icon} size={16}/></span><span><strong>{item.label}</strong><small>{copy('Aksi Brain Arena','Brain Arena action')}</small></span><Icon name="arrow" size={15}/></button>)}</div></div><div className="command-section"><small>{copy('PERMAINAN','GAMES')}</small><div className="search-results">{gameResults.length?gameResults.map(g=><button key={g.id} onClick={()=>openGameResult(g)}><span className={`mini-game-icon color-${g.color}`}><Icon name={g.icon}/></span><span><strong>{g.title[lang]}</strong><small>{searchDifficulty?`Universitas · ${searchDifficulty==='very-hard'?'Very Hard':searchDifficulty==='impossible'?'Impossible':'Hard'} · `:''}{CATEGORIES[g.category][lang]} · {copy('Musim','Season')} {g.season}</small></span><Icon name="arrow" size={17}/></button>):<p className="search-empty">{copy('Tidak ada game yang cocok.','No matching games.')}</p>}</div></div><p className="dialog-footnote"><kbd>Ctrl K</kbd> {copy('buka/tutup','open/close')} &nbsp; <kbd>Esc</kbd> {copy('tutup','close')}</p></Dialog>
    <Dialog open={notificationsOpen} onClose={()=>setNotificationsOpen(false)} title={copy('Notification Center','Notification Center')} className="notification-dialog"><div className="notification-toolbar"><p>{unreadNotifications?copy(`${unreadNotifications} belum dibaca`,`${unreadNotifications} unread`):copy('Semua sudah dibaca','All caught up')}</p>{notifications.length>0&&<button type="button" className="text-button" onClick={markAllNotificationsRead}>{copy('Tandai semua dibaca','Mark all read')}</button>}</div><div className="notification-list">{notifications.length?notifications.map(item=><button key={item.id} className={item.read?'is-read':''} onClick={()=>openNotification(item)}><span><Icon name={item.icon} size={17}/></span><div><strong>{item.title[lang]}</strong><p>{item.body[lang]}</p></div>{!item.read&&<i/>}</button>):<div className="notification-empty"><Icon name="bell" size={25}/><strong>{copy('Belum ada notifikasi','No notifications yet')}</strong><p>{copy('Daily, mission, season, achievement, dan recovery akan muncul di sini.','Daily, mission, season, achievement, and recovery updates will appear here.')}</p></div>}</div></Dialog>
    <Dialog open={help} onClose={()=>setHelp(false)} title={copy('Selamat datang di arena','Welcome to the arena')}><p className="dialog-description">{copy('Pilih game, tentukan tingkat pendidikan, lalu mulai tantangan. Gunakan panduan untuk mempelajari aturan dan strategi.','Choose a game, select your education level, and start a challenge. Check each guide for rules and strategies.')}</p><div className="shortcuts">{[['Ctrl + Shift + S',copy('Ubah sidebar','Toggle sidebar')],['Ctrl / Cmd + K',copy('Command Palette','Command Palette')],['Alt + H',copy('Kembali ke beranda','Return home')],['Alt + L',copy('Ganti bahasa','Switch language')],['Alt + M',copy('Aktifkan / bisukan suara','Toggle sound')],['?',copy('Buka bantuan','Open help')]].map(([key,label])=><div key={key}><span>{label}</span><kbd>{key}</kbd></div>)}</div><div className="privacy-note"><Icon name="shield"/><p>{copy('Progress, autosave, notifikasi, XP, rank, dan profil disimpan di browser ini. v1.21 memperkuat recovery, backup, migrasi data, PWA cache, dan pencatatan crash tanpa menghapus progress lama.','Progress, autosave, notifications, XP, rank, and profile stay in this browser. v1.21 hardens recovery, backups, data migration, PWA caching, and crash tracking without deleting older progress.')}</p></div><button className="ba-button primary full-width" onClick={()=>{setHelp(false);navigate('guides');}}>{copy('Lihat panduan bermain','Browse game guides')}<Icon name="arrow" size={16}/></button></Dialog>
    <Dialog open={coachOpen} onClose={()=>setCoachOpen(false)} title="Brain Coach" className="coach-dialog"><div className="coach-content"><span className="coach-orb"><Icon name="brain" size={24}/></span><div><small>{activeSession?.mode==='ranked'?copy('RANKED HINT','RANKED HINT'):copy('SMART HINT','SMART HINT')}</small><p>{coachData?.text||copy('Mulai permainan lalu gunakan Brain Coach untuk mendapatkan petunjuk strategis tanpa membuka jawaban langsung.','Start the game, then use Brain Coach for strategic guidance without revealing the answer directly.')}</p>{coachData?.limited&&<strong>{copy('Batas hint Ranked sudah tercapai.','Ranked hint limit reached.')}</strong>}</div></div>{activeGame&&<button className="ba-button primary full-width" disabled={coachData?.limited} onClick={()=>setCoachData(requestCoachHint(activeGame.id,lang))}><Icon name="spark" size={15}/>{copy('Hint berikutnya','Next hint')}</button>}</Dialog>
    <div className={`toast ${notice?'visible':''}`} role="status" aria-live="polite">{notice&&<><Icon name="check" size={17}/>{notice}</>}</div>
  </div>;
}
