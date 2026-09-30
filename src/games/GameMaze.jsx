import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import RulesModal from '../components/RulesModal.jsx';
import { SetupCard, TipsButton, SoloEndCard, UniversityDifficultySelector } from '../components/GameShell.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { readText, writeText } from '../utils/storage.js';
import { formatMinesweeperTime } from '../utils/minesweeper.js';
import { generateMaze, moveInMaze, shortestMazePathLength } from '../utils/maze.js';

const BASE_LEVELS = {
  sd: { rows: 7, cols: 7 },
  smp: { rows: 10, cols: 10 },
  sma: { rows: 14, cols: 14 },
};
const UNIVERSITY_LEVELS = {
  hard: { rows: 18, cols: 18 },
  'very-hard': { rows: 24, cols: 24 },
  extreme: { rows: 32, cols: 32 },
};
const UNIVERSITY_LABELS = { hard: 'Hard', 'very-hard': 'Very Hard', extreme: 'Extreme' };
const DIR_KEYS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowRight: 'right', d: 'right', D: 'right',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
};

function difficultyKey(level, universityDifficulty) {
  return level === 'universitas' ? `${level}_${universityDifficulty}` : level;
}

export default function GameMaze({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const copy = (id, en) => lang === 'en' ? en : id;
  const [showRules, setShowRules] = useState(false);
  const [gameState, setGameState] = useState('setup');
  const [schoolLevel, setSchoolLevel] = useState('sd');
  const [universityDifficulty, setUniversityDifficulty] = useState('hard');
  const [maze, setMaze] = useState([]);
  const [position, setPosition] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [optimalMoves, setOptimalMoves] = useState(0);
  const [bestTime, setBestTime] = useState(null);

  const config = schoolLevel === 'universitas' ? UNIVERSITY_LEVELS[universityDifficulty] : BASE_LEVELS[schoolLevel];
  const target = config.rows * config.cols - 1;
  const recordKey = `maze_best_${difficultyKey(schoolLevel, universityDifficulty)}`;

  useEffect(() => {
    const raw = readText(recordKey);
    const value = Number(raw);
    setBestTime(raw !== null && Number.isFinite(value) && value >= 0 ? value : null);
  }, [recordKey]);

  useEffect(() => {
    if (gameState !== 'playing' || paused) return undefined;
    const timer = setInterval(() => setElapsed(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, paused]);

  const finishGame = useCallback((finalMoves) => {
    setMoves(finalMoves);
    setPaused(false);
    setGameState('ended');
    const raw = readText(recordKey);
    const previous = raw === null ? null : Number(raw);
    if (previous === null || !Number.isFinite(previous) || elapsed < previous) {
      writeText(recordKey, elapsed);
      setBestTime(elapsed);
    }
  }, [elapsed, recordKey]);

  const move = useCallback((direction) => {
    if (gameState !== 'playing' || paused || !maze.length) return;
    const next = moveInMaze(maze, config.rows, config.cols, position, direction);
    if (next === position) return;
    const nextMoves = moves + 1;
    setPosition(next);
    setMoves(nextMoves);
    setVisited(previous => {
      const nextVisited = new Set(previous);
      nextVisited.add(next);
      return nextVisited;
    });
    if (next === target) finishGame(nextMoves);
  }, [gameState, paused, maze, config.rows, config.cols, position, moves, target, finishGame]);

  useEffect(() => {
    const handleKey = event => {
      const direction = DIR_KEYS[event.key];
      if (!direction) return;
      const element = event.target;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element?.tagName) || element?.isContentEditable) return;
      if (gameState === 'playing' && !paused) {
        event.preventDefault();
        move(direction);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, paused, move]);

  const startGame = useCallback(() => {
    const nextMaze = generateMaze(config.rows, config.cols);
    setMaze(nextMaze);
    setPosition(0);
    setVisited(new Set([0]));
    setMoves(0);
    setElapsed(0);
    setPaused(false);
    setOptimalMoves(shortestMazePathLength(nextMaze, config.rows, config.cols));
    setGameState('playing');
  }, [config.rows, config.cols]);

  const descriptions = {
    sd: copy('7×7 · Jalur pendek untuk belajar membaca belokan dan jalan buntu.', '7×7 · Short routes for learning turns and dead ends.'),
    smp: copy('10×10 · Lebih banyak cabang dengan jalur solusi yang lebih panjang.', '10×10 · More branches with a longer solution path.'),
    sma: copy('14×14 · Labirin padat yang menuntut orientasi dan keputusan cepat.', '14×14 · A denser maze that demands orientation and quick decisions.'),
    universitas: copy(`${config.rows}×${config.cols} · ${UNIVERSITY_LABELS[universityDifficulty]} · Labirin lanjutan untuk navigasi presisi.`, `${config.rows}×${config.cols} · ${UNIVERSITY_LABELS[universityDifficulty]} · Advanced maze navigation.`),
  };

  const rules = lang === 'en' ? [
    'Reach the exit in the bottom-right corner from the start in the top-left corner.',
    'Move with Arrow Keys or WASD on desktop. On touch devices, use the direction pad below the maze.',
    'Walls block movement. Valid steps are counted; bumping into a wall does not add a move.',
    'The maze is generated as a perfect maze, so every board is solvable and has one unique route between any two cells.',
    'University mode adds Hard, Very Hard, and Extreme sizes. Your fastest clear time is saved separately for each difficulty.',
  ] : [
    'Capai pintu keluar di pojok kanan bawah dari titik mulai di pojok kiri atas.',
    'Gunakan tombol panah atau WASD di desktop. Di layar sentuh, gunakan tombol arah di bawah labirin.',
    'Dinding menghalangi gerakan. Hanya langkah yang berhasil yang dihitung; menabrak dinding tidak menambah langkah.',
    'Labirin dibuat sebagai perfect maze, sehingga setiap papan pasti dapat diselesaikan dan memiliki satu jalur unik antara dua petak.',
    'Mode Universitas memiliki Hard, Very Hard, dan Extreme. Waktu tercepat disimpan terpisah untuk setiap tingkat.',
  ];

  const mazeCells = useMemo(() => maze.map((walls, index) => {
    const row = Math.floor(index / config.cols);
    const col = index % config.cols;
    const isPlayer = index === position;
    const isExit = index === target;
    const isVisited = visited.has(index);
    const style = {
      borderTop: walls & 1 ? '2px solid #75628a' : '2px solid transparent',
      borderLeft: walls & 8 ? '2px solid #75628a' : '2px solid transparent',
      borderRight: col === config.cols - 1 && (walls & 2) ? '2px solid #75628a' : '2px solid transparent',
      borderBottom: row === config.rows - 1 && (walls & 4) ? '2px solid #75628a' : '2px solid transparent',
    };
    return <div key={index} className={`maze-cell ${isVisited ? 'visited' : ''} ${isExit ? 'exit' : ''}`} style={style} aria-hidden="true">
      {index === 0 && !isPlayer && <span className="maze-start-dot"/>}
      {isExit && <Icon name="flag" size={Math.max(8, Math.min(16, 310 / config.cols))}/>} 
      {isPlayer && <span className="maze-player"><span/></span>}
    </div>;
  }), [maze, config.cols, config.rows, position, target, visited]);

  const efficiency = optimalMoves > 0 ? Math.max(1, Math.round((optimalMoves / Math.max(moves, 1)) * 100)) : 100;
  const boardWidth = Math.max(310, Math.min(720, config.cols * (schoolLevel === 'universitas' ? 22 : 34)));
  const stats = gameState === 'playing' ? <>
    <span><Icon name="clock" size={14}/>{formatMinesweeperTime(elapsed)}</span>
    <span><Icon name="maze" size={14}/>{moves} {copy('langkah', 'moves')}</span>
  </> : null;

  return <GameScreen gameId="maze" lang={lang} state={gameState} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)} stats={stats}>
    {gameState === 'setup' && <SetupCard
      heading={copy('Pilih labirin Maze Escape', 'Choose your Maze Escape')}
      schoolLevel={schoolLevel}
      onLevelChange={setSchoolLevel}
      desc={descriptions[schoolLevel]}
      lang={lang}
      badge={`${config.rows}×${config.cols}${schoolLevel === 'universitas' ? ` · ${UNIVERSITY_LABELS[universityDifficulty]}` : ''}`}
      bestRecord={bestTime === null ? null : formatMinesweeperTime(bestTime)}
    >
      {schoolLevel === 'universitas' && <UniversityDifficultySelector value={universityDifficulty} onChange={setUniversityDifficulty} lang={lang}/>} 
      <button className="uw-btn uw-btn-primary" onClick={startGame}><Icon name="play" size={16}/>{copy('Masuk labirin', 'Enter maze')}</button>
      <TipsButton lang={lang} onClick={() => onNavigate?.('tips-maze')}/>
    </SetupCard>}

    {gameState === 'playing' && <div className="maze-gameplay">
      <div className="maze-toolbar">
        <div><span className="play-kicker">{copy('CARI JALAN KELUAR', 'FIND THE EXIT')}</span><strong>{config.rows}×{config.cols}{schoolLevel === 'universitas' ? ` · ${UNIVERSITY_LABELS[universityDifficulty]}` : ''}</strong><small>{copy('Ungu = posisi kamu · bendera = pintu keluar.', 'Purple = your position · flag = the exit.')}</small></div>
        <div className="maze-toolbar-actions"><button type="button" onClick={() => setPaused(value => !value)}><Icon name={paused ? 'play' : 'clock'} size={15}/>{paused ? copy('Lanjut', 'Resume') : copy('Jeda', 'Pause')}</button><button type="button" onClick={startGame}><Icon name="refresh" size={15}/>{copy('Labirin baru', 'New maze')}</button></div>
      </div>
      <div className="maze-shell">
        <div className="maze-scroll" aria-label={copy('Labirin Maze Escape', 'Maze Escape maze')}>
          <div className={`maze-board ${paused ? 'is-paused' : ''}`} style={{ '--maze-cols': config.cols, '--maze-rows': config.rows, width: `${boardWidth}px` }}>
            {mazeCells}
            {paused && <div className="maze-pause"><Icon name="brain" size={28}/><strong>{copy('Labirin dijeda', 'Maze paused')}</strong><span>{copy('Lanjutkan saat siap.', 'Resume when you are ready.')}</span></div>}
          </div>
        </div>
      </div>
      <div className="maze-controls">
        <div className="maze-dpad" role="group" aria-label={copy('Kontrol arah', 'Direction controls')}>
          <button type="button" className="up" onClick={() => move('up')} aria-label={copy('Atas', 'Up')}>↑</button>
          <button type="button" className="left" onClick={() => move('left')} aria-label={copy('Kiri', 'Left')}>←</button>
          <span className="center"><Icon name="maze" size={18}/></span>
          <button type="button" className="right" onClick={() => move('right')} aria-label={copy('Kanan', 'Right')}>→</button>
          <button type="button" className="down" onClick={() => move('down')} aria-label={copy('Bawah', 'Down')}>↓</button>
        </div>
        <div className="maze-route-note"><strong>{moves}</strong><span>{copy('langkah valid', 'valid moves')}</span><small>{copy('Keyboard: panah / WASD', 'Keyboard: arrows / WASD')}</small></div>
      </div>
    </div>}

    {gameState === 'ended' && <SoloEndCard
      heading={copy('Kamu menemukan jalan keluar!', 'You found the exit!')}
      subtext={copy('Labirin selesai. Coba lagi untuk menemukan rute yang lebih efisien dan lebih cepat.', 'Maze cleared. Play again for a faster, more efficient run.')}
      onBack={onBack}
      onPlayAgain={startGame}
      lang={lang}
      stats={[
        { label: copy('Waktu', 'Time'), value: formatMinesweeperTime(elapsed) },
        { label: copy('Langkah', 'Moves'), value: moves },
        { label: copy('Efisiensi', 'Efficiency'), value: `${efficiency}%` },
        { label: copy('Rekor', 'Best'), value: bestTime === null ? '—' : formatMinesweeperTime(bestTime) },
      ]}
    >
      <button type="button" className="ms-change-level" onClick={() => setGameState('setup')}>{copy('Ganti tingkat kesulitan', 'Change difficulty')}</button>
    </SoloEndCard>}

    <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameName="Maze Escape" ruleList={rules}/>
  </GameScreen>;
}
