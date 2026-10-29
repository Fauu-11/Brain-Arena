import React, {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import Layout from './components/Layout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import {LanguageProvider,useLanguage} from './context/LanguageContext.jsx';
import {ArenaProvider,useArena} from './context/ArenaContext.jsx';
import {gameById,resolveRoute,routeHash} from './data/games.js';
const Home=lazy(()=>import('./pages/Home.jsx'));
const Settings=lazy(()=>import('./pages/Settings.jsx'));
const Guides=lazy(()=>import('./pages/Guides.jsx'));
const TipsPage=lazy(()=>import('./pages/TipsPage.jsx'));
const games={
  '300':lazy(()=>import('./games/Game300.jsx')),prime:lazy(()=>import('./games/GamePrime.jsx')),pixel:lazy(()=>import('./games/GamePixel.jsx')),mnm:lazy(()=>import('./games/GameMnM.jsx')),cube:lazy(()=>import('./games/GameCube.jsx')),rps:lazy(()=>import('./games/GameRPS.jsx')),sudoku:lazy(()=>import('./games/GameSudoku.jsx')),minesweeper:lazy(()=>import('./games/GameMinesweeper.jsx')),maze:lazy(()=>import('./games/GameMaze.jsx')),matrix:lazy(()=>import('./games/GameMemoryMatrix.jsx')),nonogram:lazy(()=>import('./games/GameNonogram.jsx')),game2048:lazy(()=>import('./games/Game2048.jsx')),
  codebreaker:lazy(()=>import('./games/ExtraGames.jsx').then(module=>({default:module.GameCodeBreaker}))),
  lightsout:lazy(()=>import('./games/ExtraGames.jsx').then(module=>({default:module.GameLightsOut}))),
  sequence:lazy(()=>import('./games/ExtraGames.jsx').then(module=>({default:module.GameSequenceRecall}))),
  kakuro:lazy(()=>import('./games/ExtraGames.jsx').then(module=>({default:module.GameKakuro}))),
  slitherlink:lazy(()=>import('./games/ExtraGames.jsx').then(module=>({default:module.GameSlitherlink}))),
};
function AppContent(){
  const {lang}=useLanguage();const {leaveGameSession}=useArena();
  const [gameAttempt,setGameAttempt]=useState(0);
  const [view,setView]=useState(()=>resolveRoute(window.location.hash));const previous=useRef(null);
  const navigate=useCallback(next=>{const hash=routeHash(next);if(window.location.hash===hash)setView(resolveRoute(hash));else window.location.hash=hash;},[]);
  useEffect(()=>{const sync=()=>setView(resolveRoute(window.location.hash));window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  useEffect(()=>{
    if(previous.current!==view){leaveGameSession();window.scrollTo({top:0,behavior:'instant'});previous.current=view;}
    document.title=`${gameById(view)?.title[lang]||(lang==='id'?'Game hafalan, logika & hitung':'Memory, logic & math games')} | Brain Arena`;
  },[view,lang,leaveGameSession]);
  useEffect(()=>{const retry=()=>{leaveGameSession();setGameAttempt(value=>value+1);};window.addEventListener('ba-retry-game',retry);return()=>window.removeEventListener('ba-retry-game',retry);},[leaveGameSession]);
  const Game=games[view];let content;
  if(Game)content=<Game key={`${view}-${gameAttempt}`} onBack={()=>navigate('games')} onNavigate={navigate}/>;
  else if(view==='settings')content=<Settings/>;
  else if(view==='guides')content=<Guides onNavigate={navigate}/>;
  else if(view.startsWith('tips-'))content=<TipsPage gameId={view.slice(5)} onBack={()=>navigate(view.slice(5))} onNavigate={navigate}/>;
  else content=<Home onSelectGame={navigate}/>;
  return <Layout currentView={view} onViewChange={navigate}><ErrorBoundary key={view} lang={lang}><Suspense fallback={<div className="loading-state" role="status">{lang==='id'?'Menyiapkan permainan…':'Loading game…'}</div>}>{content}</Suspense></ErrorBoundary></Layout>;
}
export default function App(){return <LanguageProvider><ArenaProvider><AppContent/></ArenaProvider></LanguageProvider>;}
