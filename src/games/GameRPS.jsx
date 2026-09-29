import React, { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import RPSHand from '../components/RPSHand.jsx';
import Dialog from '../components/Dialog.jsx';
import RulesModal from '../components/RulesModal.jsx';
import Scoreboard from '../components/Scoreboard.jsx';
import { SetupCard, TipsButton, MultiEndCard } from '../components/GameShell.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getAudioContext, getAudioDestination } from '../utils/audio.js';
import { DIRECTIONS, FACE_THEME, NET, LEVELS, WIN_SCORE, STEP_MS, STEP_PAUSE_MS, FOLD_MS,
  createGame, nextMoveCount, duelReducer, canPlan, isPlanning, projectPath, faceRotation } from '../utils/duelDice.js';

const ARROWS = { up: '\u2191', down: '\u2193', left: '\u2190', right: '\u2192' };
const LABELS = { up: ['Atas', 'Up'], down: ['Bawah', 'Down'], left: ['Kiri', 'Left'], right: ['Kanan', 'Right'] };
const ROTATION = { up: 'rotateX(90deg)', down: 'rotateX(-90deg)', left: 'rotateY(-90deg)', right: 'rotateY(90deg)' };
const sideTransform = (face, half) => ({
  top: `translateZ(${half}px)`, bottom: `rotateY(180deg) translateZ(${half}px)`,
  back: `rotateX(90deg) translateZ(${half}px)`, front: `rotateX(-90deg) translateZ(${half}px)`,
  left: `rotateY(-90deg) translateZ(${half}px)`, right: `rotateY(90deg) translateZ(${half}px)`,
}[face]);

function playSound(type) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const tones = type === 'win' ? [523, 659, 784] : type === 'lose' || type === 'timeout' ? [260, 180] : type === 'draw' ? [440] : [340];
    tones.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator(), gain = ctx.createGain(), time = ctx.currentTime + index * 0.1;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      oscillator.connect(gain); gain.connect(getAudioDestination());
      gain.gain.setValueAtTime(0.1, time); gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      oscillator.start(time); oscillator.stop(time + 0.13);
    });
  } catch { /* Audio is optional; browser autoplay policy must not stop a game. */ }
}

function Die({ faces, direction = null, size = 48, reduced = false }) {
  return <div className="rps-die" data-top={faces.top.shape} data-bottom={faces.bottom.shape}
    data-top-id={faces.top.id} data-top-rotation={faceRotation('top', faces.top)}
    style={{ width: size, height: size, transform: ROTATION[direction] || 'rotateX(0deg) rotateY(0deg)',
      transition: direction && !reduced ? `transform ${STEP_MS}ms cubic-bezier(.3,.1,.3,1)` : 'none' }}>
    {Object.entries(faces).map(([position, face]) => <div key={position} className="rps-die-face" data-face={position}
      style={{ background: FACE_THEME[face.shape].bg, transform: sideTransform(position, size / 2), borderRadius: Math.max(4, size * 0.13) }}>
      <RPSHand shape={face.shape} size={size * 0.65} rotation={faceRotation(position, face)}/>
    </div>)}
  </div>;
}

function FoldDie({ faces, reduced }) {
  const [folded, setFolded] = useState(false);
  useEffect(() => { const id = setTimeout(() => setFolded(true), 40); return () => clearTimeout(id); }, []);
  const size = 62;
  return <div className={`rps-fold-scene ${folded ? 'is-folded' : ''}`} aria-hidden="true">
    <div className="rps-fold-object" style={{ transitionDuration: reduced ? '0ms' : undefined }}>
      {NET.map(({ face: position, col, row }) => {
        const face = faces[position];
        return <div key={position} className="rps-die-face rps-fold-face" style={{
          width: size, height: size, background: FACE_THEME[face.shape].bg,
          transform: folded ? sideTransform(position, size / 2) : `translate3d(${(col - 2) * size}px, ${(row - 2) * size}px, 0px)`,
          transitionDuration: reduced ? '0ms' : undefined,
        }}><RPSHand shape={face.shape} size={42} rotation={folded ? faceRotation(position, face) : 0}/></div>;
      })}
    </div>
  </div>;
}

function ArenaBoard({ game, lang, reduced }) {
  const wrapperRef = useRef(null);
  const [metrics, setMetrics] = useState(null);
  const route = useMemo(() => projectPath(game.origin || game.position, game.planned), [game.origin, game.position, game.planned]);
  const target = route.at(-1);
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;
    const measure = () => {
      const root = wrapper.getBoundingClientRect();
      const slots = [...wrapper.querySelectorAll('[data-rps-slot]')].map(node => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left - root.left, top: rect.top - root.top, size: rect.width };
      });
      setMetrics(slots);
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(wrapper); window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  const index = game.position.row === 0 ? 0 : 1 + (game.position.row - 1) * 7 + game.position.col;
  const slot = metrics?.[index];
  const dieSize = slot ? Math.floor(slot.size * 0.86) : 40;
  return <div className="rps-board-wrap" ref={wrapperRef}>
    <div className="rps-start-row"><div className="rps-start-tile" data-rps-slot="start">START</div></div>
    <div className="rps-arena" role="img" aria-label={lang === 'en' ? 'Seven by seven rock, paper, scissors arena' : 'Arena gunting, batu, kertas tujuh kali tujuh'}>
      {game.board.map((shape, i) => {
        const col = i % 7, row = Math.floor(i / 7) + 1;
        const isTarget = target?.col === col && target?.row === row;
        const projected = route.some(p => p.col === col && p.row === row);
        const visited = game.trail.some(p => p.col === col && p.row === row);
        return <div key={i} data-rps-slot={i} data-tile={shape}
          className={`rps-cell ${isTarget ? 'target' : projected ? 'projected' : ''} ${visited ? 'visited' : ''}`}
          title={`${lang === 'en' ? 'Row' : 'Baris'} ${row}, ${lang === 'en' ? 'column' : 'kolom'} ${col + 1}: ${FACE_THEME[shape][lang]}`}>
          <RPSHand shape={shape} size="64%"/>
          {isTarget && <span className="rps-target-dot" aria-hidden="true"/>}
        </div>;
      })}
    </div>
    {slot && <div className="rps-die-position" data-position={`${game.position.col},${game.position.row}`}
      style={{ width: slot.size, height: slot.size, transform: `translate3d(${slot.left}px, ${slot.top}px, 0)`,
        transition: game.status === 'rolling' && !reduced ? `transform ${STEP_MS}ms cubic-bezier(.3,.1,.3,1)` : 'none' }}>
      <Die faces={game.faces} direction={game.rollDir} size={dieSize} reduced={reduced}/>
    </div>}
    <span className="sr-only" aria-live="polite">{game.status !== 'rolling' && (game.position.row === 0
      ? (lang === 'en' ? 'Die at START.' : 'Dadu di START.')
      : `${lang === 'en' ? 'Die at row' : 'Dadu di baris'} ${game.position.row}, ${lang === 'en' ? 'column' : 'kolom'} ${game.position.col + 1}.`)}</span>
  </div>;
}

export default function GameRPS({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const text = (id, en) => lang === 'en' ? en : id;
  const [game, dispatch] = useReducer(duelReducer, undefined, () => createGame());
  const [showRules, setShowRules] = useState(false);
  const resultButtonRef = useRef(null);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const config = LEVELS[game.level];

  // Pause while a native dialog (including global search) is open or the tab is
  // hidden. Never consume a player's turn while they are reading the rules.
  useEffect(() => {
    const updatePause = () => dispatch({ type: 'PAUSE', value: document.hidden || !!document.querySelector('dialog[open]') });
    const observer = new MutationObserver(updatePause);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
    document.addEventListener('visibilitychange', updatePause); updatePause();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', updatePause); };
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change); return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (game.phase !== 'folding') return undefined;
    const id = setTimeout(() => dispatch({ type: 'START' }), reduced ? 200 : FOLD_MS);
    return () => clearTimeout(id);
  }, [game.phase, reduced]);

  const clockRunning = isPlanning(game);
  useEffect(() => {
    if (!clockRunning) return undefined;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'TICK', elapsed: now - last, turn: game.turn });
      last = now;
    }, 100);
    return () => clearInterval(id);
  }, [clockRunning, game.turn]);
  useEffect(() => {
    if (game.phase !== 'playing' || game.status !== 'rolling' || game.paused) return undefined;
    const animating = game.rollStage === 'animate';
    const id = setTimeout(() => dispatch({ type: animating ? 'ANIMATION_END' : 'NEXT_STEP', index: game.rollIndex, turn: game.turn }),
      reduced ? (animating ? 90 : 35) : (animating ? STEP_MS : STEP_PAUSE_MS));
    return () => clearTimeout(id);
  }, [game.phase, game.status, game.rollStage, game.rollIndex, game.turn, game.paused, reduced]);
  useEffect(() => {
    if (game.status === 'rolling' && game.rollStage === 'animate') playSound('step');
  }, [game.status, game.rollStage, game.rollIndex]);
  useEffect(() => { if (game.battle) playSound(game.battle.outcome); }, [game.battle]);
  // Native showModal runs after React's autoFocus. Focus the primary action on
  // the next frame, so keyboard users can immediately confirm with Enter.
  useEffect(() => {
    if (!game.battle) return undefined;
    const frame = requestAnimationFrame(() => resultButtonRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [game.battle]);

  const acknowledge = useCallback(() => dispatch({ type: 'ACK', nextMoves: nextMoveCount(game.level), turn: game.turn }), [game.level, game.turn]);
  useEffect(() => {
    const onKey = event => {
      if (!isPlanning(game) || event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]')) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const key = event.key.toLowerCase();
      const direction = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' }[key];
      if (direction) { event.preventDefault(); dispatch({ type: 'PLAN', direction }); }
      else if (key === 'backspace') { event.preventDefault(); dispatch({ type: 'UNDO' }); }
      else if (key === 'delete') { event.preventDefault(); dispatch({ type: 'CLEAR' }); }
      else if ((key === 'enter' || key === ' ') && !event.repeat && !event.target.closest?.('button, a')) {
        event.preventDefault(); dispatch({ type: 'ROLL' });
      }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [game]);

  const rules = lang === 'en' ? [
    'Memorize the six-square net. The CENTER square becomes the top of the die; the last square folds underneath.',
    'Two players share one die on a 7 by 7 board. From START, the first step must be Down.',
    `Fill every direction slot before rolling. Your level allows ${config.minMoves}-${config.maxMoves} steps and ${config.seconds} seconds per turn.`,
    'You cannot immediately reverse the last planned step, leave the board, or return to START. Undo or Clear edits the route.',
    'The die rolls one square at a time. ONLY the final bottom face battles the tile: rock beats scissors, scissors beat paper, and paper beats rock.',
    'Win: +1 point. Lose: -1 point. Draw: no change. Scores can go below zero. A timeout costs 1 point and does not move the die.',
    `Confirm the result to switch players. Keep the last position AND orientation. First to ${WIN_SCORE} points wins.`,
    'The timer pauses during folding, rolling, results, open dialogs, and while this tab is hidden.',
  ] : [
    'Hafalkan enam sisi pada jaring-jaring. Kotak TENGAH menjadi sisi ATAS dadu; kotak paling ujung terlipat ke BAWAH.',
    'Dua pemain memakai satu dadu di papan 7 x 7. Langkah pertama dari START wajib ke Bawah.',
    `Isi seluruh slot arah sebelum menggulirkan dadu. Jenjang ini memakai ${config.minMoves}-${config.maxMoves} langkah dan ${config.seconds} detik per giliran.`,
    'Tidak boleh langsung membalik arah langkah terakhir, keluar papan, atau kembali ke START. Gunakan Undo atau Clear untuk mengubah rencana.',
    'Dadu berguling per petak. HANYA sisi bawah di petak terakhir yang berduel: batu mengalahkan gunting, gunting mengalahkan kertas, kertas mengalahkan batu.',
    'Menang: +1 poin. Kalah: -1 poin. Seri: tidak berubah. Skor boleh negatif. Waktu habis mengurangi 1 poin tanpa memindahkan dadu.',
    `Konfirmasi hasil untuk berganti pemain. Posisi DAN orientasi dadu tetap berlanjut. Pemain pertama mencapai ${WIN_SCORE} poin menang.`,
    'Timer berhenti saat pelipatan, gerakan dadu, layar hasil, dialog terbuka, dan saat tab tidak terlihat.',
  ];
  const outcomeText = {
    win: text('Menang!', 'You win!'), lose: text('Kalah!', 'You lose!'),
    draw: text('Seri!', 'Draw!'), timeout: text('Waktu habis!', "Time's up!"),
  };
  const planning = isPlanning(game);
  const paused = game.paused && game.status === 'planning';
  const timer = Math.ceil(game.remainingMs / 1000);
  const reset = (level = game.level, phase = 'setup') => dispatch({ type: 'RESET', state: { ...createGame(level), phase } });

  return <GameScreen gameId="rps" lang={lang} state={game.phase} level={game.level} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)}>
    <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} ruleList={rules} gameName={text('Duel Dadu', 'Dice Duel')}/>

    {game.phase === 'setup' && <SetupCard heading={text('Pilih Mode Arena', 'Select Arena Mode')} schoolLevel={game.level} onLevelChange={level => reset(level)} lang={lang}
      desc={text(`Arena 7\u00d77 \u00b7 ${config.minMoves}-${config.maxMoves} langkah/giliran \u00b7 ${config.seconds} detik \u00b7 Target ${WIN_SCORE} poin`,
        `7\u00d77 Arena \u00b7 ${config.minMoves}-${config.maxMoves} steps/turn \u00b7 ${config.seconds} seconds \u00b7 First to ${WIN_SCORE} points`)}>
      <button className="uw-btn uw-btn-primary" onClick={() => dispatch({ type: 'NET' })}><Icon name="play" size={16}/>{text('Masuk arena', 'Enter arena')}</button>
      <TipsButton onClick={() => onNavigate?.('tips-rps')} lang={lang}/>
    </SetupCard>}

    {game.phase === 'planar' && <div className="rps-planar rps-v12-planar">
      <h2>{text('JARING-JARING DADU', 'DIE PLANAR NET')}</h2>
      <p>{text('Hafalkan setiap sisi. Kotak tengah akan menjadi sisi atas dadu.', 'Memorize each face. The center square becomes the top of the die.')}</p>
      <div className="rps-net-grid">{NET.map(({ face: position, col, row, id, en }) => {
        const face = game.initialFaces[position];
        return <div key={position} className={`rps-net-face ${position === 'top' ? 'is-top' : ''}`} data-net-face={position} data-shape={face.shape}
          style={{ gridColumn: col, gridRow: row, background: FACE_THEME[face.shape].bg }}>
          <RPSHand shape={face.shape} size={34} label={FACE_THEME[face.shape][lang]}/>
          <span>{lang === 'en' ? en : id}</span>
        </div>;
      })}</div>
      <button className="uw-btn uw-btn-primary rps-start-button" onClick={() => dispatch({ type: 'FOLD' })}><Icon name="play" size={16}/>{text('Mulai permainan', 'Start game')}</button>
      <small className="rps-memory-note">{text('Timer baru berjalan setelah dadu selesai dilipat.', 'The timer starts only after the die has folded.')}</small>
    </div>}

    {game.phase === 'folding' && <div className="rps-planar rps-folding" role="status">
      <h2>{text('DADU SIAP BERAKSI', 'READY TO ROLL')}</h2>
      <p>{text('Melipat jaring-jaring. Ingat posisi sisi bawahnya!', 'Folding the net. Remember which face is underneath!')}</p>
      <FoldDie faces={game.initialFaces} reduced={reduced}/>
      <small>{text('Pemain 1 memulai dari START', 'Player 1 begins at START')}</small>
    </div>}

    {game.phase === 'playing' && <div className="rps-gameplay" data-turn={game.turn} data-status={game.status} data-paused={game.paused}>
      <Scoreboard activePlayer={game.activePlayer} score1={game.scores[0]} score2={game.scores[1]} timer={timer} maxTime={config.seconds} winScore={WIN_SCORE}/>
      <div className="rps-controls">
        <div className="rps-plan-block"><div className="rps-control-label">{text('Rencana gerak', 'Planned steps')} ({game.planned.length}/{game.movesRequired})</div>
          <div className="rps-move-slots" role="list" aria-label={text('Urutan langkah', 'Move sequence')}>
            {Array.from({ length: game.movesRequired }, (_, i) => <span role="listitem" key={i}
              className={`rps-move-slot ${game.planned[i] ? 'filled' : ''} ${game.status === 'rolling' && i === game.rollIndex ? 'executing' : ''}`}
              aria-label={`${i + 1}: ${game.planned[i] ? LABELS[game.planned[i]][lang === 'en' ? 1 : 0] : text('kosong', 'empty')}`}>
              {game.planned[i] ? ARROWS[game.planned[i]] : <span className="rps-slot-plus">+</span>}
            </span>)}
          </div>
        </div>
        <div className="rps-control-actions">
          <div className="rps-dpad" role="group" aria-label={text('Arah gerak', 'Move direction')}>
            {DIRECTIONS.map(direction => <button key={direction} data-direction={direction} className="rps-direction"
              style={{ gridArea: direction }} disabled={!canPlan(game, direction)}
              aria-label={text(`Gerak ${LABELS[direction][0]}`, `Move ${LABELS[direction][1]}`)} title={`Move ${LABELS[direction][1]}`}
              onClick={() => dispatch({ type: 'PLAN', direction })}>{ARROWS[direction]}</button>)}
          </div>
          <div className="rps-execution"><button className="rps-roll-button" data-action="roll" disabled={!planning || game.planned.length !== game.movesRequired}
            onClick={() => dispatch({ type: 'ROLL' })}>{game.status === 'rolling' ? text('BERGULIR', 'ROLLING') : text('PUTAR', 'ROLL')}</button>
            <div className="rps-edit-buttons"><button disabled={!planning || game.planned.length === 0} data-action="undo" title="Undo (Backspace)" onClick={() => dispatch({ type: 'UNDO' })}>UNDO</button>
              <button disabled={!planning || game.planned.length === 0} data-action="clear" title="Clear (Delete)" onClick={() => dispatch({ type: 'CLEAR' })}>CLEAR</button></div>
          </div>
        </div>
      </div>
      <div className="rps-turn-hint" role="status"><i/>{game.status === 'rolling'
        ? text(`Langkah ${game.rollIndex + 1} dari ${game.movesRequired}. Timer dijeda.`, `Step ${game.rollIndex + 1} of ${game.movesRequired}. Timer paused.`)
        : game.status === 'feedback' ? text('Konfirmasi hasil untuk melanjutkan.', 'Confirm the result to continue.')
        : paused ? text('Permainan dijeda.', 'Game paused.')
        : text(`Giliran Pemain ${game.activePlayer}. ${game.position.row === 0 ? 'Mulai dengan arah Bawah.' : 'Lanjut dari posisi dadu terakhir.'}`, `Player ${game.activePlayer}'s turn. ${game.position.row === 0 ? 'Start with Down.' : 'Continue from the last position.'}`)}</div>
      <ArenaBoard game={game} lang={lang} reduced={reduced}/>
      <div className="rps-symbol-legend" aria-label={text('Aturan simbol', 'Symbol rules')}>
        {['rock', 'scissors', 'paper'].map((shape, index) => <React.Fragment key={shape}><span><RPSHand shape={shape} size={18}/>{FACE_THEME[shape][lang]}</span><b aria-hidden="true">{index === 2 ? '\u21bb' : '\u2192'}</b></React.Fragment>)}
        <small>{text('mengalahkan', 'beats')}</small>
      </div>
      <p className="rps-score-note">{text('Menang +1 \u00b7 Seri 0 \u00b7 Kalah -1 \u00b7 Skor bisa negatif', 'Win +1 \u00b7 Draw 0 \u00b7 Lose -1 \u00b7 Negative scores allowed')}</p>
    </div>}

    <Dialog open={!!game.battle} onClose={acknowledge} title={text('Hasil pertarungan', 'Battle result')} className="rps-result-dialog">
      {game.battle && <div className="rps-result-content" data-outcome={game.battle.outcome} onKeyDown={event => {
        if (event.key === 'Enter' && !event.target.closest('button')) { event.preventDefault(); acknowledge(); }
      }}>
        <p className="rps-result-player">{text(`Pemain ${game.battle.player}`, `Player ${game.battle.player}`)}</p>
        {game.battle.face ? <div className="rps-showdown">
          <div><small>{text('SISI BAWAH DADU', 'DIE BOTTOM')}</small><div className="rps-result-face" style={{ background: FACE_THEME[game.battle.face.shape].bg }}><RPSHand shape={game.battle.face.shape} size={48}/></div><span>{FACE_THEME[game.battle.face.shape][lang]}</span></div>
          <b>VS</b>
          <div><small>{text('UBIN ARENA', 'ARENA TILE')}</small><div className="rps-result-tile"><RPSHand shape={game.battle.tile} size={48}/></div><span>{FACE_THEME[game.battle.tile][lang]}</span></div>
        </div> : <div className="rps-timeout-icon"><Icon name="clock" size={38}/></div>}
        <h3 className={`rps-outcome ${game.battle.outcome}`}>{outcomeText[game.battle.outcome]}</h3>
        <div className="rps-score-change">{game.battle.delta > 0 ? '+' : ''}{game.battle.delta} {text('poin', 'point')}
          <span>{game.scores[game.activePlayer - 1]} {'\u2192'} {game.scores[game.activePlayer - 1] + game.battle.delta}</span></div>
        <p className="rps-result-note">{game.battle.outcome === 'timeout'
          ? text('Dadu tetap di tempat. Giliran diteruskan ke pemain berikutnya.', 'The die stays in place. The next player takes over.')
          : text('Posisi dan orientasi dadu berlanjut ke giliran berikutnya.', 'The die keeps its position and orientation for the next turn.')}</p>
        <button className="ba-button primary full-width" ref={resultButtonRef} autoFocus data-action="acknowledge" onClick={acknowledge}>{text('OK, lanjut', 'OK, continue')}<Icon name="arrow" size={16}/></button>
      </div>}
    </Dialog>

    {game.phase === 'ended' && <MultiEndCard winner={game.winner} score1={game.scores[0]} score2={game.scores[1]} lang={lang}
      onBack={onBack} onPlayAgain={() => reset(game.level, 'planar')}/>}
  </GameScreen>;
}
