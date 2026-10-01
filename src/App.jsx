import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Icon from './components/Icon.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import { ArenaProvider, useArena } from './context/ArenaContext.jsx';
import { gameById, resolveRoute, routeHash } from './data/games.js';
const Game300 = lazy(() => import('./games/Game300.jsx'));
const GamePrime = lazy(() => import('./games/GamePrime.jsx'));
const GamePixel = lazy(() => import('./games/GamePixel.jsx'));
const GameMnM = lazy(() => import('./games/GameMnM.jsx'));
const GameCube = lazy(() => import('./games/GameCube.jsx'));
const GameRPS = lazy(() => import('./games/GameRPS.jsx'));
const GameSudoku = lazy(() => import('./games/GameSudoku.jsx'));
const GameMinesweeper = lazy(() => import('./games/GameMinesweeper.jsx'));
const GameMaze = lazy(() => import('./games/GameMaze.jsx'));
const GameMemoryMatrix = lazy(() => import('./games/GameMemoryMatrix.jsx'));
const TipsPage = lazy(() => import('./pages/TipsPage.jsx'));
const Activity = lazy(() => import('./pages/Activity.jsx'));
const Guides = lazy(() => import('./pages/Guides.jsx'));
const DailyChallenge = lazy(() => import('./pages/DailyChallenge.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const GAME_COMPONENTS = { '300':Game300, prime:GamePrime, pixel:GamePixel, mnm:GameMnM, cube:GameCube, rps:GameRPS, sudoku:GameSudoku, minesweeper:GameMinesweeper, maze:GameMaze, matrix:GameMemoryMatrix };
function AppContent() {
  const { lang } = useLanguage(); const { recordVisit } = useArena();
  const [view, setView] = useState(() => resolveRoute(window.location.hash)); const previous = useRef(null);
  const navigate = useCallback(next => {
    const target = routeHash(next);
    if (window.location.hash === target) setView(resolveRoute(target));
    else window.location.hash = target;
  }, []);
  useEffect(() => { const sync=()=>setView(resolveRoute(window.location.hash)); window.addEventListener('hashchange',sync); return()=>window.removeEventListener('hashchange',sync); }, []);
  useEffect(() => {
    if (gameById(view) && previous.current !== view) recordVisit(view);
    if (previous.current !== view) {
      window.scrollTo({ top:0, behavior:'instant' });
      if (previous.current !== null) document.getElementById('main-content')?.focus({ preventScroll:true });
      previous.current = view;
    }
    const title = gameById(view)?.title[lang] || (view.startsWith('tips-') ? (lang==='id'?'Panduan bermain':'Game guide') : (lang==='id'?'Arena matematika, logika & strategi':'Math, logic & strategy arena'));
    document.title = `${title} | Brain Arena`;
  }, [view,lang,recordVisit]);
  const back=()=>navigate('home'); const Game=GAME_COMPONENTS[view];
  let content;
  if (Game) content=<Game onBack={back} onNavigate={navigate}/>;
  else if (['home','games','favorites'].includes(view)) content=<Home view={view} onSelectGame={navigate}/>;
  else if (view==='activity') content=<Activity onNavigate={navigate}/>;
  else if (view==='guides') content=<Guides onNavigate={navigate}/>;
  else if (view==='daily') content=<DailyChallenge onNavigate={navigate}/>;
  else if (view==='profile') content=<Profile onNavigate={navigate}/>;
  else if (view.startsWith('tips-')) content=<TipsPage gameId={view.slice(5)} onBack={()=>navigate(view.slice(5))} onNavigate={navigate}/>;
  else content=<div className="empty-state not-found"><span className="not-found-code">404</span><h1>{lang==='id'?'Arena tidak ditemukan.':'This arena is missing.'}</h1><p>{lang==='id'?'Tautan ini tidak tersedia. Tantangan lainnya menantimu di beranda.':'That page is unavailable. More challenges are waiting on the home page.'}</p><button className="ba-button primary" onClick={back}>{lang==='id'?'Kembali ke beranda':'Back to home'}<Icon name="arrow" size={17}/></button></div>;
  return <Layout currentView={view} onViewChange={navigate}><ErrorBoundary key={view} lang={lang}><Suspense fallback={<div className="loading-state" role="status"><span className="loading-spinner"/>{lang==='id'?'Menyiapkan arena...':'Preparing your arena...'}</div>}>{content}</Suspense></ErrorBoundary></Layout>;
}
export default function App() { return <LanguageProvider><ArenaProvider><AppContent/></ArenaProvider></LanguageProvider>; }
