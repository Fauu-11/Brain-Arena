import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { GAMES, CATEGORIES, gameById } from '../data/games.js';
import Icon from './Icon.jsx';
import Dialog from './Dialog.jsx';
import PwaInstallButton from './PwaInstallButton.jsx';

function isNavActive(itemId, currentView) {
  return currentView === itemId || (itemId === 'guides' && currentView.startsWith('tips-')) || (itemId === 'profile' && currentView === 'customize');
}

function buildNav(copy, dailyCompleted, favoritesLength) {
  return [
    { id:'home', icon:'home', label:copy('Beranda','Overview') },
    { id:'daily', icon:'spark', label:copy('Daily Challenge','Daily Challenge'), count:dailyCompleted ? '✓' : null },
    { id:'games', icon:'grid', label:copy('Semua permainan','All games'), count:GAMES.length },
    { id:'favorites', icon:'star', label:copy('Favorit','Favorites'), count:favoritesLength || null },
    { id:'activity', icon:'activity', label:copy('Aktivitas saya','My activity') },
    { id:'guides', icon:'book', label:copy('Panduan bermain','Game guides') },
    { id:'achievements', icon:'medal', label:copy('Achievement & Badge','Achievements & Badges') },
    { id:'missions', icon:'checklist', label:copy('Mission / Quest','Missions / Quests') },
    { id:'leaderboard', icon:'trophy', label:copy('Leaderboard','Leaderboard') },
    { id:'rank', icon:'shield', label:copy('Arena Rank','Arena Rank') },
    { id:'season', icon:'spark', label:copy('Season','Season') },
    { id:'events', icon:'bolt', label:copy('Event','Events') },
    { id:'mastery', icon:'trophy', label:copy('Game Mastery','Game Mastery') },
    { id:'arena-run', icon:'gamepad', label:copy('Arena Run','Arena Run') },
    { id:'history', icon:'clock', label:copy('Match History','Match History') },
    { id:'completion', icon:'medal', label:copy('Game Completion','Game Completion') },
    { id:'statistics', icon:'activity', label:copy('Statistik','Statistics') },
    { id:'settings', icon:'sliders', label:copy('Pengaturan','Settings') },
    { id:'feedback', icon:'message', label:copy('Feedback & Saran','Feedback & Suggestions') },
    { id:'profile', icon:'user', label:copy('Profil pemain','Player profile') },
  ];
}

function Navigation({ currentView, onNavigate }) {
  const { lang } = useLanguage();
  const { favorites, profile, levelInfo, dailyCompleted, rankInfo, avatarOption, frameOption } = useArena();
  const copy = (id,en) => lang === 'id' ? id : en;
  const nav = useMemo(() => buildNav(copy, dailyCompleted, favorites.length), [lang, dailyCompleted, favorites.length]);
  return <>
    <button className="brand" onClick={() => onNavigate('home')} aria-label="Brain Arena - Home"><span className="brand-mark"><Icon name="cube" size={26}/></span><span><strong>brain<span>arena</span><i/></strong><small>PLAY WITH YOUR MIND</small></span></button>
    <nav aria-label={copy('Navigasi utama','Main navigation')} className="main-nav"><p className="nav-label">ARENA</p>{nav.map(item => <button className={`nav-item ${isNavActive(item.id, currentView) ? 'active' : ''}`} key={item.id} onClick={() => onNavigate(item.id)} aria-current={isNavActive(item.id, currentView) ? 'page' : undefined}><Icon name={item.icon} size={19}/><span>{item.label}</span>{item.count != null && <span className="nav-count">{item.count}</span>}</button>)}</nav>
    <nav aria-label={copy('Pintasan permainan','Game shortcuts')} className="game-nav"><p className="nav-label">{copy('LANGSUNG MAIN','JUMP INTO A GAME')}</p>{GAMES.map(game => <button key={game.id} onClick={() => onNavigate(game.id)} className={`game-nav-item ${currentView === game.id ? 'active' : ''}`} aria-current={currentView === game.id ? 'page' : undefined}><span className={`nav-game-icon color-${game.color}`}><Icon name={game.icon} size={15}/></span><span>{game.title[lang]}</span>{game.season > 1 && <span className="mini-tag">S{game.season}</span>}</button>)}</nav>
    <div className="sidebar-bottom"><div className="sidebar-pwa"><PwaInstallButton/></div><div className="sidebar-note"><span className="note-spark">+</span><h3>{copy('Sedikit latihan.','A little practice.')}<br/>{copy('Banyak kemajuan.','A lot of progress.')}</h3><p>{copy('Tantangan berikutnya menantimu.','Your next challenge is waiting.')}</p><button onClick={() => onNavigate(GAMES[Math.floor(Math.random()*GAMES.length)].id)}>{copy('Coba game acak','Try a random game')}<Icon name="shuffle" size={14}/></button></div><button className="local-profile" onClick={() => onNavigate('profile')}><span className={`profile-avatar frame-${frameOption.id}`}><Icon name={avatarOption.icon} size={18}/></span><span><strong>{profile.name || copy('Pemain lokal','Local player')}</strong><small>{rankInfo.tier.title[lang]} · Lv. {levelInfo.level}</small></span><span className="local-profile-level">{Math.round(levelInfo.progress)}%</span></button></div>
  </>;
}

function RailNavigation({ currentView, onNavigate }) {
  const { lang } = useLanguage();
  const { favorites, dailyCompleted } = useArena();
  const copy = (id,en) => lang === 'id' ? id : en;
  const nav = useMemo(() => buildNav(copy, dailyCompleted, favorites.length), [lang, dailyCompleted, favorites.length]);
  const railIds = ['home','favorites','games','achievements','leaderboard','rank','season','events','mastery','arena-run','settings','profile'];
  const railItems = nav.filter(item => railIds.includes(item.id));
  return <>
    <button className="brand brand-compact" onClick={() => onNavigate('home')} aria-label="Brain Arena - Home compact"><span className="brand-mark"><Icon name="cube" size={22}/></span></button>
    <div className="rail-separator"/>
    <nav className="rail-nav" aria-label={copy('Navigasi cepat','Quick navigation')}>{railItems.map(item => <button key={item.id} className={`rail-item ${isNavActive(item.id, currentView) ? 'active' : ''}`} onClick={() => onNavigate(item.id)} aria-label={item.label} title={item.label} aria-current={isNavActive(item.id, currentView) ? 'page' : undefined}><Icon name={item.icon} size={18}/>{item.count != null && <span className="rail-dot">{item.count === '✓' ? '•' : item.count}</span>}</button>)}</nav>
    <div className="rail-footer"><button className="rail-item rail-highlight" onClick={() => onNavigate(GAMES[0].id)} aria-label={GAMES[0].title[lang]} title={GAMES[0].title[lang]}><Icon name={GAMES[0].icon} size={18}/></button></div>
  </>;
}

export default function Layout({ children, currentView, onViewChange }) {
  const { lang, toggleLang } = useLanguage(); const { muted, toggleSound, storageOk, notice, profile, levelInfo, rankInfo, avatarOption, frameOption, accessibility, currentSession, requestCoachHint, arenaRun } = useArena();
  const [menu, setMenu] = useState(false); const [search, setSearch] = useState(false); const [help, setHelp] = useState(false); const [query, setQuery] = useState(''); const [focus, setFocus] = useState(false); const [coachOpen,setCoachOpen]=useState(false); const [coachData,setCoachData]=useState(null); const [sessionNow,setSessionNow]=useState(Date.now());
  const copy = (id,en) => lang === 'id' ? id : en;
  const activeGame = gameById(currentView);
  const navigate = useCallback(view => { setMenu(false); setSearch(false); setQuery(''); onViewChange(view); }, [onViewChange]);
  useEffect(() => { if (!activeGame) setFocus(false); }, [activeGame]);
  useEffect(()=>{ if (!activeGame || !currentSession?.active || currentSession.gameId!==activeGame.id) return; const timer=setInterval(()=>setSessionNow(Date.now()),1000); return()=>clearInterval(timer); },[activeGame,currentSession?.active,currentSession?.gameId]);
  useEffect(() => {
    const handleKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(value => !value); return; }
      const el = e.target;
      if (['INPUT','TEXTAREA','SELECT'].includes(el?.tagName) || el?.isContentEditable) return;
      if (e.altKey && e.key.toLowerCase() === 'h') { e.preventDefault(); navigate('home'); }
      if (e.altKey && e.key.toLowerCase() === 'l') { e.preventDefault(); toggleLang(); }
      if (e.altKey && e.key.toLowerCase() === 'm') { e.preventDefault(); toggleSound(); }
      if (e.key === '?' && !e.altKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setHelp(true); }
    };
    window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
  }, [navigate, toggleLang, toggleSound]);
  const names = { home:copy('Beranda','Overview'), daily:copy('Daily Challenge','Daily Challenge'), games:copy('Semua permainan','All games'), favorites:copy('Favorit','Favorites'), activity:copy('Aktivitas saya','My activity'), guides:copy('Panduan bermain','Game guides'), achievements:copy('Achievement & Badge','Achievements & Badges'), missions:copy('Mission / Quest','Missions / Quests'), leaderboard:copy('Leaderboard','Leaderboard'), rank:copy('Arena Rank','Arena Rank'), customize:copy('Kustomisasi profil','Profile customization'), statistics:copy('Statistik lanjutan','Advanced statistics'), season:copy('Season','Season'), events:copy('Event','Events'), mastery:copy('Game Mastery','Game Mastery'), 'arena-run':copy('Arena Run','Arena Run'), history:copy('Match History','Match History'), replay:copy('Replay','Replay'), completion:copy('Game Completion','Game Completion'), settings:copy('Pengaturan & Data','Settings & Data'), feedback:copy('Feedback & Saran','Feedback & Suggestions'), profile:copy('Profil pemain','Player profile') };
  const currentName = activeGame?.title[lang] || (currentView.startsWith('tips-') ? `${copy('Panduan','Guide')} / ${gameById(currentView.slice(5))?.title[lang] || ''}` : names[currentView] || copy('Halaman tidak ditemukan','Page not found'));
  const results = GAMES.filter(g => `${g.title.id} ${g.title.en} ${CATEGORIES[g.category][lang]}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const activeSession=activeGame&&currentSession?.gameId===activeGame.id?currentSession:null;
  const sessionElapsed=activeSession?.startedAt?Math.max(0,sessionNow-activeSession.startedAt):0;
  const fmt=ms=>{const sec=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;};
  const openCoach=()=>{ if(!activeGame)return; setCoachData(requestCoachHint(activeGame.id,lang)); setCoachOpen(true); };
  return <div className={`ba-app ${focus ? 'is-focus' : ''} theme-${accessibility.theme} ${accessibility.reducedMotion?'reduce-motion':''} ${accessibility.highContrast?'high-contrast':''} ${accessibility.largeText?'large-text':''}`}>
    <a href="#main-content" className="skip-link" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>{copy('Lewati ke konten','Skip to content')}</a>
    <aside className="sidebar"><Navigation currentView={currentView} onNavigate={navigate}/></aside>
    <aside className="sidebar-rail"><RailNavigation currentView={currentView} onNavigate={navigate}/></aside>
    <div className="app-body"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMenu(true)} aria-label={copy('Buka menu navigasi','Open navigation menu')} aria-haspopup="dialog"><Icon name="menu"/></button><div className="breadcrumb"><button onClick={() => navigate('home')}><Icon name="home" size={15}/><span>Arena</span></button><Icon name="chevron" size={12}/><span>{currentName}</span></div></div><div className="topbar-actions"><button className="global-search" onClick={() => setSearch(true)} aria-label={copy('Cari permainan (Ctrl K)','Search games (Ctrl K)')} aria-haspopup="dialog"><Icon name="search" size={16}/><span>{copy('Cari permainan...','Search games...')}</span><kbd>Ctrl K</kbd></button><span className="toolbar-divider"/><button className="language-button" onClick={toggleLang} aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'} title={copy('Ganti bahasa (Alt L)','Switch language (Alt L)')}><Icon name="globe" size={17}/>{lang.toUpperCase()}<Icon name="down" size={11}/></button><button className="icon-button sound-button" onClick={toggleSound} aria-pressed={muted} aria-label={muted ? copy('Aktifkan suara','Unmute sound') : copy('Bisukan suara','Mute sound')} title={copy('Suara (Alt M)','Sound (Alt M)')}><Icon name={muted ? 'muted' : 'sound'} size={18}/></button>{activeGame && <button className="icon-button" onClick={() => setFocus(!focus)} aria-pressed={focus} aria-label={focus ? copy('Keluar mode fokus','Exit focus mode') : copy('Mode fokus','Focus mode')} title={copy('Mode fokus','Focus mode')}><Icon name={focus ? 'collapse' : 'expand'} size={18}/></button>}{activeGame && <button className="icon-button coach-top-button" onClick={openCoach} aria-label="Brain Coach" title="Brain Coach"><Icon name="brain" size={18}/></button>}<PwaInstallButton compact/><button className="topbar-profile" onClick={() => navigate('profile')} aria-label={copy('Buka profil pemain','Open player profile')}><span className={`frame-${frameOption.id}`}><Icon name={avatarOption.icon} size={15}/></span><span><strong>{profile.name || copy('Pemain Lokal','Local Player')}</strong><small>{rankInfo.tier.title[lang]} · Lv. {levelInfo.level}</small></span><i><b style={{ width:`${levelInfo.progress}%` }}/></i></button><button className="icon-button help-button" onClick={() => setHelp(true)} aria-label={copy('Bantuan dan pintasan','Help and shortcuts')}><Icon name="help" size={19}/></button></div></header>
      {!storageOk && <div className="storage-banner" role="status">{copy('Penyimpanan browser tidak tersedia. Perubahan hanya tersimpan selama tab ini terbuka.','Browser storage is unavailable. Changes will only last while this tab stays open.')}</div>}
      {activeSession?.active&&<div className="competitive-hud"><span className={`hud-mode ${activeSession.mode}`}><Icon name={activeSession.mode==='ranked'?'shield':'gamepad'} size={13}/>{activeSession.mode==='ranked'?'Ranked':'Practice'}</span><span><Icon name="clock" size={13}/>{fmt(sessionElapsed)}</span>{activeSession.personalBestMs>0&&<span><Icon name="ghost" size={13}/>PB {fmt(activeSession.personalBestMs)}</span>}<code>{activeSession.challengeCode}</code>{arenaRun?.status==='active'&&activeSession.arenaRunId===arenaRun.id&&<span className="hud-run"><Icon name="trophy" size={13}/>{copy('Arena','Arena')} {arenaRun.index+1}/{arenaRun.stages.length}</span>}<button onClick={openCoach}><Icon name="brain" size={13}/>Brain Coach{activeSession.mode==='ranked'?` ${Math.max(0,2-(activeSession.hintsUsed||0))}/2`:''}</button></div>}
      <main id="main-content" tabIndex={-1} className={`main-content ${activeGame ? 'game-page' : ''}`}>{children}</main>
      <footer className="site-footer"><span><strong>brainarena.</strong> {copy('Tempat pikiran bertumbuh.','Where sharp minds play.')}</span><span>{copy('Proyek penggemar independen','An independent fan project')}<i/>{copy('Dibuat untuk terus belajar','Built to keep you learning')}</span></footer>
    </div>
    <Dialog open={menu} onClose={() => setMenu(false)} title={copy('Navigasi','Navigation')} className="mobile-menu-dialog"><Navigation currentView={currentView} onNavigate={navigate}/></Dialog>
    <Dialog open={search} onClose={() => { setSearch(false); setQuery(''); }} title={copy('Temukan tantanganmu','Find your next challenge')} className="search-dialog"><label className="command-input"><Icon name="search"/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder={copy('Cari nama game atau kategori...','Search for a game or category...')} aria-label={copy('Cari permainan','Search games')}/></label><div className="search-results">{results.length ? results.map(g => <button key={g.id} onClick={() => navigate(g.id)}><span className={`mini-game-icon color-${g.color}`}><Icon name={g.icon}/></span><span><strong>{g.title[lang]}</strong><small>{CATEGORIES[g.category][lang]} &middot; {copy('Musim','Season')} {g.season}</small></span><Icon name="arrow" size={17}/></button>) : <p className="search-empty">{copy('Tidak ada game yang cocok. Coba kata kunci lain.','No games found. Try another search.')}</p>}</div><p className="dialog-footnote"><kbd>Tab</kbd> {copy('untuk berpindah','to navigate')} &nbsp; <kbd>Esc</kbd> {copy('untuk menutup','to close')}</p></Dialog>
    <Dialog open={help} onClose={() => setHelp(false)} title={copy('Selamat datang di arena','Welcome to the arena')}><p className="dialog-description">{copy('Pilih game, tentukan tingkat pendidikan, lalu mulai tantangan. Gunakan panduan untuk mempelajari aturan dan strategi.','Choose a game, select your education level, and start a challenge. Check each guide for rules and strategies.')}</p><div className="shortcuts">{[['Ctrl / Cmd + K',copy('Cari permainan','Search games')],['Alt + H',copy('Kembali ke beranda','Return home')],['Alt + L',copy('Ganti bahasa','Switch language')],['Alt + M',copy('Aktifkan / bisukan suara','Toggle sound')],['?',copy('Buka bantuan','Open help')]].map(([key,label]) => <div key={key}><span>{label}</span><kbd>{key}</kbd></div>)}</div><div className="privacy-note"><Icon name="shield"/><p>{copy('Favorit, riwayat, rekor, XP, level, rank, badge, misi, season, mastery, kustomisasi, statistik, dan profil disimpan di browser ini, bukan di server. Riwayat mencatat game yang dibuka, bukan sesi yang dilanjutkan.','Favorites, history, records, XP, levels, ranks, badges, missions, seasons, mastery, customization, statistics, and your profile are saved in this browser, not on a server. History records games you opened; it does not resume sessions.')}</p></div><button className="ba-button primary full-width" onClick={() => { setHelp(false); navigate('guides'); }}>{copy('Lihat panduan bermain','Browse game guides')}<Icon name="arrow" size={16}/></button></Dialog>
    <Dialog open={coachOpen} onClose={()=>setCoachOpen(false)} title="Brain Coach" className="coach-dialog"><div className="coach-content"><span className="coach-orb"><Icon name="brain" size={24}/></span><div><small>{activeSession?.mode==='ranked'?copy('RANKED HINT','RANKED HINT'):copy('SMART HINT','SMART HINT')}</small><p>{coachData?.text||copy('Mulai permainan lalu gunakan Brain Coach untuk mendapatkan petunjuk strategis tanpa membuka jawaban langsung.','Start the game, then use Brain Coach for strategic guidance without revealing the answer directly.')}</p>{coachData?.limited&&<strong>{copy('Batas hint Ranked sudah tercapai.','Ranked hint limit reached.')}</strong>}</div></div>{activeGame&&<button className="ba-button primary full-width" disabled={coachData?.limited} onClick={()=>setCoachData(requestCoachHint(activeGame.id,lang))}><Icon name="spark" size={15}/>{copy('Hint berikutnya','Next hint')}</button>}</Dialog>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice && <><Icon name="check" size={17}/>{notice}</>}</div>
  </div>;
}
