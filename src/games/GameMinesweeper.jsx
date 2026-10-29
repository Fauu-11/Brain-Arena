import {useUniversityGameplay} from '../hooks/useUniversityGameplay.js';
import {revealWindow} from '../utils/universityGameplay.js';
import BoardZoom from '../components/BoardZoom.jsx';
import { useBoardSizing } from '../hooks/useBoardSizing.js';
import { challengeOpeningIndex } from '../utils/minesweeper.js';
import { mulberry32, challengeSeed } from '../utils/competitive.js';
import { sessionRandom } from '../utils/competitive.js';
import { gameTimeout as setTimeout } from '../utils/sessionClock.js';
import { gameInterval as setInterval } from '../utils/sessionClock.js';
import { useGameCheckpoint } from '../hooks/useGameCheckpoint.js';
import { initialGameSetting } from '../utils/sessionRules.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import RulesModal from '../components/RulesModal.jsx';
import { SetupCard, TipsButton, SoloEndCard } from '../components/GameShell.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { chordReveal, createMinefield, formatMinesweeperTime, revealArea } from '../utils/minesweeper.js';

const random=()=>sessionRandom('minesweeper');

const BASE_LEVELS = {
  sd: { rows: 9, cols: 9, mines: 10, cell: 38 },
  smp: { rows: 12, cols: 12, mines: 20, cell: 34 },
  sma: { rows: 16, cols: 16, mines: 40, cell: 30 },
  'sma-plus': { rows: 16, cols: 30, mines: 99, cell: 26 },
};
const UNIVERSITY_LEVELS = {
  hard: { rows: 16, cols: 30, mines: 99, cell: 26 },
  'very-hard': { rows: 20, cols: 30, mines: 150, cell: 24 },
  impossible: { rows: 24, cols: 36, mines: 240, cell: 22 },
};
const UNIVERSITY_LABELS = { impossible: 'Universitas' };

const NUMBER_CLASS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

export default function GameMinesweeper({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const { restartGameSession, currentSession, setNotice } = useArena();
  const copy = useCallback((id, en) => lang === 'en' ? en : id, [lang]);
  const [showRules, setShowRules] = useState(false);
  const [gameState, setGameState] = useState('setup');
  const [schoolLevel, setSchoolLevel] = useState(()=>initialGameSetting('minesweeper','schoolLevels','sd'));
  const [universityDifficulty, setUniversityDifficulty] = useState(()=>initialGameSetting('minesweeper','universityDifficulties','hard'));
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState(() => new Set());
  const [flags, setFlags] = useState(() => new Set());
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(null);

  const config = schoolLevel === 'universitas' ? UNIVERSITY_LEVELS[universityDifficulty] : (BASE_LEVELS[schoolLevel] || BASE_LEVELS.sd);
  const challenge=useUniversityGameplay('minesweeper',schoolLevel,gameState==='playing'&&hasStarted&&!paused);
  const numbersVisible=challenge.id!=='fading-numbers'||revealWindow(challenge.seconds,8,20,4);
  const boardSizing=useBoardSizing(config.cols,{gap:2,gutter:14,min:24,max:44});
  const totalCells = config.rows * config.cols;
  const fixedOpening=challengeOpeningIndex(config.rows,config.cols,currentSession?.challengeCode||'');
  useEffect(()=>{
    const node=boardSizing.element;if(!node||hasStarted||fixedOpening===null)return;
    node.scrollTo({left:Math.max(0,(fixedOpening%config.cols+.5)*(boardSizing.cell+2)-node.clientWidth/2),top:Math.max(0,(Math.floor(fixedOpening/config.cols)+.5)*(boardSizing.cell+2)-node.clientHeight/2),behavior:'instant'});
  },[boardSizing.element,boardSizing.cell,fixedOpening,config.cols,hasStarted]);
  const safeCells = totalCells - config.mines;
  const revealedSafeCount = useMemo(() => board.length ? [...revealed].filter(index => !board[index]?.mine).length : 0, [board, revealed]);


  useEffect(() => {
    if (gameState !== 'playing' || !hasStarted || paused) return undefined;
    const timer = setInterval(() => setElapsed(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, hasStarted, paused]);

  useEffect(() => () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const rules = lang === 'en' ? [
    'Open every safe cell without triggering a mine. Numbers show how many mines touch that cell.',
    'Your first opened cell is always safe. Its surrounding cells are also protected whenever the board density allows it.',
    'Click or tap to open a cell. Right-click on desktop, long-press on touch screens, or use Flag Mode to place a flag.',
    'Opening a blank cell automatically reveals the connected safe area around it.',
    'If a revealed number has exactly the same number of adjacent flags, tap it again to open the remaining neighboring cells.',
    'Five levels: SD, SMP, SMA, SMA+, Universitas. Universitas randomly selects one of three gameplay rules on every start.',
  ] : [
    'Buka semua petak aman tanpa mengenai ranjau. Angka menunjukkan jumlah ranjau yang bersentuhan dengan petak tersebut.',
    'Petak pertama yang dibuka selalu aman. Area di sekitarnya juga diamankan selama kepadatan papan memungkinkan.',
    'Klik atau ketuk untuk membuka petak. Klik kanan di desktop, tekan lama di layar sentuh, atau gunakan Mode Bendera untuk memasang bendera.',
    'Membuka petak kosong akan otomatis membuka area aman yang saling terhubung.',
    'Jika angka yang sudah terbuka memiliki jumlah bendera di sekeliling yang tepat, ketuk angka itu lagi untuk membuka tetangganya.',
    'Lima tingkat: SD, SMP, SMA, SMA+, Universitas. Universitas memilih satu dari tiga aturan gameplay secara acak setiap mulai.',
  ];

  const descriptions = {
    sd: copy('9×9 · 10 ranjau · Cocok untuk mengenal pola angka dan area aman.', '9×9 · 10 mines · Learn the number patterns and safe-area logic.'),
    smp: copy('12×12 · 20 ranjau · Papan lebih luas dengan keputusan bendera yang lebih penting.', '12×12 · 20 mines · A wider board where flag decisions matter more.'),
    sma: copy('16×16 · 40 ranjau · Butuh pembacaan pola dan manajemen risiko yang konsisten.', '16×16 · 40 mines · Requires consistent pattern reading and risk management.'),
    universitas: copy(`${config.rows}×${config.cols} · ${config.mines} ranjau · ${UNIVERSITY_LABELS[universityDifficulty]} · Papan Universitas diacak setiap sesi.`, `${config.rows}×${config.cols} · ${config.mines} mines · ${UNIVERSITY_LABELS[universityDifficulty]} · Universitas board is randomized every run.`),
  };

  const startGame = useCallback(() => {
    setBoard([]);
    setRevealed(new Set());
    setFlags(new Set());
    setHasStarted(false);
    setElapsed(0);
    setPaused(false);
    setFlagMode(false);
    setOutcome(null);
    setGameState('playing');
  }, []);

  const finishGame = useCallback((result, nextRevealed) => {
    setRevealed(nextRevealed);
    setOutcome(result);
    setPaused(false);
    setGameState('ended');
  }, []);

  const evaluateReveal = useCallback((activeBoard, nextRevealed) => {
    const exploded = [...nextRevealed].some(index => activeBoard[index]?.mine);
    if (exploded) {
      finishGame('lost', nextRevealed);
      return;
    }
    if (nextRevealed.size >= safeCells) finishGame('won', nextRevealed);
    else setRevealed(nextRevealed);
  }, [finishGame, safeCells]);

  const openCell = useCallback((index) => {
    if (gameState !== 'playing' || paused || flags.has(index)) return;
    let activeBoard = board;
    if (!hasStarted) {
      if(fixedOpening!==null && index!==fixedOpening){setNotice(copy('Mulai dari petak bertanda untuk challenge yang sama.','Start from the marked cell for this challenge.'));return;}
      activeBoard = createMinefield(config.rows, config.cols, config.mines, index, fixedOpening===null?random:mulberry32(challengeSeed(currentSession.challengeCode)));
      setBoard(activeBoard);
      setHasStarted(true);
    }
    if (!activeBoard[index]) return;
    if (revealed.has(index)) {
      const chorded = chordReveal(activeBoard, config.rows, config.cols, index, revealed, flags);
      evaluateReveal(activeBoard, chorded);
      return;
    }
    const next = revealArea(activeBoard, config.rows, config.cols, index, revealed, flags);
    evaluateReveal(activeBoard, next);
  }, [gameState, paused, flags, board, hasStarted, config, revealed, evaluateReveal, fixedOpening, setNotice, currentSession, copy]);

  const toggleFlag = useCallback((index) => {
    if(gameState!=='playing'||paused||revealed.has(index))return;
    if(challenge.id==='no-flags')return;
    if(challenge.id==='precise-flags'){
      if(!hasStarted){setNotice(copy('Buka petak pertama sebelum memasang bendera.','Open the first cell before flagging.'));return;}
      if(!revealed.has(index)&&!flags.has(index)&&board[index]&&!board[index].mine){challenge.fail({id:'Bendera dipasang pada petak aman.',en:'A flag was placed on a safe cell.'});return;}
    }
    if (gameState !== 'playing' || paused || revealed.has(index) || (!hasStarted && index===fixedOpening)) return;
    setFlags(previous => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else if (next.size < config.mines) next.add(index);
      return next;
    });
  }, [gameState, paused, revealed, config.mines, hasStarted, fixedOpening,challenge,flags,board,setNotice,copy]);

  const handlePrimary = useCallback((index) => {
    if (longPressTriggered.current === index) {
      longPressTriggered.current = null;
      return;
    }
    if (flagMode) toggleFlag(index);
    else openCell(index);
  }, [flagMode, toggleFlag, openCell]);

  const onPointerDown = useCallback((event, index) => {
    if (event.pointerType === 'mouse') return;
    longPressTriggered.current = null;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = index;
      toggleFlag(index);
    }, 520);
  }, [toggleFlag]);

  const stopLongPress = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }, []);

  const boardCells = useMemo(() => Array.from({ length: totalCells }, (_, index) => {
    const cell = board[index] || { mine: false, adjacent: 0 };
    const isOpen = revealed.has(index);
    const isFlagged = flags.has(index);
    const row = Math.floor(index / config.cols) + 1;
    const col = index % config.cols + 1;
    let aria = copy(`Baris ${row}, kolom ${col}, tertutup`, `Row ${row}, column ${col}, covered`);
    if (isFlagged) aria = copy(`Baris ${row}, kolom ${col}, berbendera`, `Row ${row}, column ${col}, flagged`);
    if (isOpen && cell.mine) aria = copy(`Baris ${row}, kolom ${col}, ranjau`, `Row ${row}, column ${col}, mine`);
    else if (isOpen) aria = copy(`Baris ${row}, kolom ${col}, ${numbersVisible?(cell.adjacent||'kosong'):'angka disembunyikan'}`, `Row ${row}, column ${col}, ${numbersVisible?(cell.adjacent||'empty'):'number hidden'}`);
    return <button
      type="button"
      key={index}
      data-ms-cell="true"
      className={`ms-cell ${!hasStarted&&index===fixedOpening?'ms-challenge-start':''} ${isOpen ? 'open' : ''} ${isFlagged ? 'flagged' : ''} ${isOpen && cell.mine ? 'mine-hit' : ''} ${isOpen && cell.adjacent ? `n-${NUMBER_CLASS[cell.adjacent]}` : ''}`}
      aria-label={!hasStarted&&index===fixedOpening?`${aria}, ${copy('Mulai di sini','Start here')}`:aria}
      aria-pressed={isFlagged}
      onClick={() => handlePrimary(index)}
      onContextMenu={event => { event.preventDefault(); toggleFlag(index); }}
      onPointerDown={event => onPointerDown(event, index)}
      onPointerUp={stopLongPress}
      onPointerCancel={stopLongPress}
      onPointerLeave={stopLongPress}
    >
      {!hasStarted&&index===fixedOpening?<span aria-hidden="true">◎</span>:null}
      {isFlagged ? <Icon name="flag" size={Math.max(13, config.cell * 0.46)}/> : isOpen && cell.mine ? <Icon name="mine" size={Math.max(14, config.cell * 0.5)}/> : isOpen && cell.adjacent > 0 ? <span>{numbersVisible?cell.adjacent:'·'}</span> : null}
    </button>;
  }), [totalCells, board, revealed, flags, config, copy, handlePrimary, toggleFlag, onPointerDown, stopLongPress, hasStarted, fixedOpening,numbersVisible]);

  const stats = gameState === 'playing' ? <>
    <span><Icon name="clock" size={14}/>{formatMinesweeperTime(elapsed)}</span>
    <span><Icon name="mine" size={14}/>{Math.max(0, config.mines - flags.size)}</span>
    <span><Icon name="flag" size={14}/>{flags.size}</span>
  </> : null;

  useGameCheckpoint('minesweeper',{gameState,schoolLevel,universityDifficulty,board,revealed,flags,hasStarted,elapsed,paused,flagMode,outcome},saved=>{setGameState(saved.gameState);setSchoolLevel(saved.schoolLevel);setUniversityDifficulty(saved.universityDifficulty);setBoard(saved.board);setRevealed(saved.revealed);setFlags(saved.flags);setHasStarted(saved.hasStarted);setElapsed(saved.elapsed);setPaused(saved.paused);setFlagMode(saved.flagMode);setOutcome(saved.outcome);},gameState==='playing',gameState==='playing'&&hasStarted&&!paused);

  return <GameScreen universityMode={challenge} gameId="minesweeper" lang={lang} state={gameState} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)} stats={stats}>
    {gameState === 'setup' && <SetupCard
      heading={copy('Pilih papan Minesweeper', 'Choose your Minesweeper board')}
      schoolLevel={schoolLevel}
      onLevelChange={setSchoolLevel}
      desc={descriptions[schoolLevel]}
      lang={lang}
      badge={`${config.rows}×${config.cols} · ${config.mines} ${copy('ranjau', 'mines')}${schoolLevel === 'universitas' ? ` · ${UNIVERSITY_LABELS[universityDifficulty]}` : ''}`}
    >
      
      <button className="uw-btn uw-btn-primary" onClick={startGame}><Icon name="play" size={16}/>{copy('Mulai menyapu', 'Start sweeping')}</button>
      <TipsButton lang={lang} onClick={() => onNavigate?.('tips-minesweeper')}/>
    </SetupCard>}

    {gameState === 'playing' && <div className="ms-gameplay">
      <div className="ms-toolbar">
        <div className="ms-toolbar-copy">
          <span className="play-kicker">{copy('PAPAN AKTIF', 'LIVE BOARD')}</span>
          <strong>{config.rows}×{config.cols} · {config.mines} {copy('ranjau', 'mines')}{schoolLevel === 'universitas' ? ` · ${UNIVERSITY_LABELS[universityDifficulty]}` : ''}</strong>
          <small>{hasStarted ? copy('Cari petak aman dari angka di sekitarnya.', 'Use the number clues to find the safe cells.') : copy('Petak pertama dijamin aman. Pilih titik awalmu.', 'Your first cell is guaranteed safe. Pick a starting point.')}</small>
        </div>
        <div className="ms-toolbar-actions">
          <button type="button" className={`ms-flag-mode ${flagMode ? 'active' : ''}`} aria-pressed={flagMode} disabled={challenge.id==='no-flags'} onClick={() => setFlagMode(value => !value)}><Icon name="flag" size={16}/>{flagMode ? copy('Mode Bendera ON', 'Flag Mode ON') : copy('Mode Bendera', 'Flag Mode')}</button>
          <button type="button" className="ms-small-button" onClick={() => setPaused(value => !value)}><Icon name={paused ? 'play' : 'clock'} size={15}/>{paused ? copy('Lanjut', 'Resume') : copy('Jeda', 'Pause')}</button>
          <button type="button" className="ms-small-button" onClick={()=>{restartGameSession('minesweeper');startGame();}}><Icon name="refresh" size={15}/>{copy('Ulang', 'Reset')}</button>
        </div>
      </div>

      <BoardZoom value={boardSizing.zoom} onChange={boardSizing.setZoom} lang={lang}/><p className="board-pan-hint">{copy('Gunakan +/− untuk zoom. Geser papan untuk melihat area lainnya.','Use +/− to zoom. Scroll the board to explore more cells.')}</p><div className="ms-board-shell">
        <div ref={boardSizing.ref} tabIndex={0} role="region" className="ms-board-scroll" aria-label={copy('Papan Minesweeper', 'Minesweeper board')}>
          <div className={`ms-board ${paused ? 'is-paused' : ''}`} style={{ '--ms-cols': config.cols, '--ms-cell': `${boardSizing.cell}px` }}>
            {boardCells}
            {paused && <div className="ms-pause-cover"><Icon name="brain" size={28}/><strong>{copy('Permainan dijeda', 'Game paused')}</strong><span>{copy('Tekan Lanjut saat siap.', 'Resume when you are ready.')}</span></div>}
          </div>
        </div>
      </div>

      <div className="ms-legend">
        <span><span className="ms-legend-cell covered"/>{copy('Belum dibuka', 'Covered')}</span>
        <span><Icon name="flag" size={15}/>{copy('Diduga ranjau', 'Suspected mine')}</span>
        <span><span className="ms-legend-number">2</span>{copy('Ranjau di sekitar', 'Nearby mines')}</span>
        <small>{copy('Desktop: klik kanan untuk bendera · Mobile: tekan lama atau aktifkan Mode Bendera.', 'Desktop: right-click to flag · Mobile: long-press or enable Flag Mode.')}</small>
      </div>
    </div>}

    {gameState === 'ended' && <SoloEndCard
      heading={outcome === 'won' ? copy('Papan berhasil dibersihkan!', 'Board cleared!') : copy('Ranjau ditemukan.', 'Mine triggered.')}
      subtext={outcome === 'won' ? copy('Semua petak aman sudah terbuka. Coba kalahkan waktumu sendiri.', 'Every safe cell is open. Try to beat your own time.') : copy('Pola berikutnya mungkin lebih jelas. Coba lagi dari papan baru.', 'The next pattern may be clearer. Try again on a fresh board.')}
      onBack={onBack}
      onPlayAgain={startGame}
      playAgainLabel={copy('Main lagi', 'Play again')}
      lang={lang}
      outcome={outcome === 'won' ? 'completed' : 'loss'}
      stats={[
        { label: copy('Waktu', 'Time'), value: formatMinesweeperTime(elapsed) },
        { label: copy('Petak aman', 'Safe cells'), value: `${revealedSafeCount}/${safeCells}` },
      ]}
    >
      <button type="button" className="ms-change-level" onClick={() => setGameState('setup')}>{copy('Ganti tingkat kesulitan', 'Change difficulty')}</button>
    </SoloEndCard>}

    <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameName={copy('Minesweeper', 'Minesweeper')} ruleList={rules}/>
  </GameScreen>;
}
