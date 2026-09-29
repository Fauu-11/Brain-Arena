import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import { getAudioContext, getAudioDestination } from '../utils/audio.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import RulesModal from '../components/RulesModal';
import Scoreboard from '../components/Scoreboard';
import { useLanguage } from '../context/LanguageContext';
import { SetupCard, TipsButton, MultiEndCard } from '../components/GameShell';

// Synthesized Web Audio API Engine
const playSound = (type) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'match') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(getAudioDestination());
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } else if (type === 'mismatch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'slide') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'victory') {
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(getAudioDestination());
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    }
  } catch (e) {
    // AudioContext ignored if blocked
  }
};

const LEVEL_SPECS = {
  sd: { cols: 2, chipsPerTile: 4, matchPairs: 6, winScore: 4 },
  smp: { cols: 3, chipsPerTile: 3, matchPairs: 12, winScore: 7 },
  sma: { cols: 3, chipsPerTile: 4, matchPairs: 16, winScore: 9 },
  universitas: { cols: 3, chipsPerTile: 5, matchPairs: 20, winScore: 11 }
};

export default function GameMnM({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const [showRules, setShowRules] = useState(false);
  const [phase, setPhase] = useState('setup'); // 'setup', 'start' (memo), 'match', 'mix', 'ended'
  const [schoolLevel, setSchoolLevel] = useState('smp');
  const [mode, setMode] = useState('pve'); // 'pve' or 'pvp'

  // Board state
  const [chips, setChips] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [lastMovedTile, setLastMovedTile] = useState(null);

  // Player Turn State
  const [activePlayer, setActivePlayer] = useState(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [timer, setTimer] = useState(10);
  const [memoTimer, setMemoTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  // Selected chip indexes in current match turn
  const [selectedChipIndexes, setSelectedChipIndexes] = useState([]);

  // AI Memory Map: number -> chip index
  const aiMemory = useRef({});

  // Active configuration
  const config = LEVEL_SPECS[schoolLevel] || LEVEL_SPECS.smp;
  const { cols, chipsPerTile, matchPairs, winScore } = config;

  // Refs for timer and timeout synchronization
  const chipsRef = useRef(chips);
  chipsRef.current = chips;
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;
  const selectedRef = useRef(selectedChipIndexes);
  selectedRef.current = selectedChipIndexes;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const activePlayerRef = useRef(activePlayer);
  activePlayerRef.current = activePlayer;

  const rules = lang === 'en' ? [
    "Match & Mix is a tactical turn-based memory game played on a sliding tile puzzle!",
    "Memorization Phase: Review all numbers printed on the chips. Click 'Start Game' when you are ready to conceal them.",
    "Match Phase: On your turn, you have 10 seconds to flip 2 chips. If they match, you earn 1 point and keep your turn!",
    "Mix Phase: If you mismatch or run out of time, your turn ends and you MUST slide one adjacent tile into the empty slot.",
    "Tactical Sliding: Swapping a tile relocates all chips on it, disrupting your opponent's memory! You cannot immediately reverse the move just made.",
    "Winning: The first player to reach the target score (or with the most points when all pairs are found) wins!"
  ] : [
    "Match & Mix adalah permainan memori taktis berbasis giliran di atas teka-teki ubin geser!",
    "Fase Memorisasi: Amati dan hafalkan semua angka pada chip. Tekan 'Mulai Game' saat siap menutupnya.",
    "Fase Mencocokkan: Dalam 10 detik, buka 2 chip. Jika angkanya cocok, Anda mendapat 1 poin dan mempertahankan giliran!",
    "Fase Menggeser: Jika tidak cocok atau waktu habis, giliran berakhir dan Anda WAJIB menggeser satu ubin terdekat ke slot kosong.",
    "Taktik Geser: Menggeser ubin akan memindahkan semua chip di atasnya untuk mengecoh ingatan lawan! Anda tidak boleh langsung membalikkan geseran yang baru saja terjadi.",
    "Kemenangan: Pemain pertama yang mencapai target poin (atau poin terbanyak saat semua chip habis) menang!"
  ];

  // Initialize Board
  const initBoard = useCallback((level = schoolLevel, chosenMode = mode) => {
    const currentConf = LEVEL_SPECS[level] || LEVEL_SPECS.smp;
    const { cols: cCount, chipsPerTile: cpt, matchPairs: pairs } = currentConf;

    // Generate pairs 1..N
    const numberPool = [];
    for (let i = 1; i <= pairs; i++) {
      numberPool.push(i, i);
    }
    numberPool.sort(() => Math.random() - 0.5);

    // Build chips
    const initChips = numberPool.map((num, idx) => ({
      number: num,
      isFlipped: true, // visible initially for memorization
      isFound: false,
      index: idx
    }));

    // Add empty fillers for empty tile
    for (let i = 0; i < cpt; i++) {
      initChips.push({
        number: 0,
        isFlipped: true,
        isFound: false,
        index: (pairs * 2) + i
      });
    }

    const totalTiles = cCount * cCount;
    const initTiles = Array.from({ length: totalTiles }, (_, i) => i);

    setChips(initChips);
    setTiles(initTiles);
    setLastMovedTile(null);
    setActivePlayer(1);
    setScore1(0);
    setScore2(0);
    setTimer(10);
    setMemoTimer(0);
    setIsTimerActive(false);
    setIsLocked(false);
    setPhase('start');
    setWinner(null);
    setSelectedChipIndexes([]);
    setMode(chosenMode);
    aiMemory.current = {};
  }, [schoolLevel, mode]);

  // Timers
  useEffect(() => {
    let timerId = null;
    if (phase === 'start') {
      timerId = setInterval(() => setMemoTimer(t => t + 1), 1000);
    } else if (isTimerActive && timer > 0 && phase === 'match') {
      timerId = setInterval(() => {
        setTimer(t => {
          if (t <= 3 && t > 1) playSound('tick');
          return t - 1;
        });
      }, 1000);
    } else if (timer === 0 && phase === 'match') {
      handleTimeoutMismatch();
    }
    return () => clearInterval(timerId);
  }, [isTimerActive, timer, phase]);

  // Check Game End
  const checkWinCondition = (s1, s2, updatedChips) => {
    const remainingUnfound = updatedChips.filter(c => c.number !== 0 && !c.isFound).length;

    if (s1 >= winScore) {
      playSound('victory');
      setWinner(1);
      setPhase('ended');
      setIsTimerActive(false);
      return true;
    }
    if (s2 >= winScore) {
      playSound('victory');
      setWinner(2);
      setPhase('ended');
      setIsTimerActive(false);
      return true;
    }

    if (remainingUnfound === 0) {
      playSound('victory');
      setPhase('ended');
      setIsTimerActive(false);
      if (s1 > s2) setWinner(1);
      else if (s2 > s1) setWinner(2);
      else setWinner('draw');
      return true;
    }

    return false;
  };

  // Start Playing from Memorization
  const handleStartGame = () => {
    playSound('flip');
    setChips(prev => prev.map(c => ({ ...c, isFlipped: false })));
    setPhase('match');
    setTimer(10);
    setIsTimerActive(true);
  };

  // Handle Timeout Mismatch
  const handleTimeoutMismatch = () => {
    playSound('mismatch');
    setIsLocked(true);
    setIsTimerActive(false);

    const currentSelected = selectedRef.current;
    setTimeout(() => {
      setChips(prev => prev.map((c, idx) => {
        if (currentSelected.includes(idx)) return { ...c, isFlipped: false };
        return c;
      }));
      setSelectedChipIndexes([]);
      setIsLocked(false);
      setPhase('mix');
    }, 600);
  };

  // Turn Switch after Tile Slide
  const switchTurnAfterSlide = () => {
    const nextPlayer = activePlayerRef.current === 1 ? 2 : 1;
    setActivePlayer(nextPlayer);
    setSelectedChipIndexes([]);
    setPhase('match');
    setTimer(10);
    setIsTimerActive(true);

    if (mode === 'pve' && nextPlayer === 2) {
      runAITurn();
    }
  };

  // User Chip Flip
  const handleChipClick = (chipIdx) => {
    if (phase !== 'match' || isLocked || (mode === 'pve' && activePlayer === 2)) return;
    const chip = chips[chipIdx];
    if (chip.isFlipped || chip.isFound || chip.number === 0 || selectedChipIndexes.length >= 2) return;

    processChipFlip(chipIdx);
  };

  // Process Chip Flip for both Player & AI
  const processChipFlip = (chipIdx) => {
    playSound('flip');

    // Register in AI memory
    const chip = chipsRef.current[chipIdx];
    aiMemory.current[chipIdx] = chip.number;

    const nextChips = [...chipsRef.current];
    nextChips[chipIdx] = { ...nextChips[chipIdx], isFlipped: true };
    setChips(nextChips);

    const newSelected = [...selectedRef.current, chipIdx];
    setSelectedChipIndexes(newSelected);

    if (newSelected.length === 2) {
      setIsLocked(true);
      setIsTimerActive(false);

      const firstChip = nextChips[newSelected[0]];
      const secondChip = nextChips[newSelected[1]];

      if (firstChip.number === secondChip.number) {
        // MATCH!
        setTimeout(() => {
          playSound('match');
          const foundChips = [...nextChips];
          foundChips[newSelected[0]] = { ...foundChips[newSelected[0]], isFound: true };
          foundChips[newSelected[1]] = { ...foundChips[newSelected[1]], isFound: true };
          setChips(foundChips);

          const curPlayer = activePlayerRef.current;
          const nextS1 = curPlayer === 1 ? score1 + 1 : score1;
          const nextS2 = curPlayer === 2 ? score2 + 1 : score2;
          if (curPlayer === 1) setScore1(nextS1);
          else setScore2(nextS2);

          setSelectedChipIndexes([]);
          setIsLocked(false);

          const isOver = checkWinCondition(nextS1, nextS2, foundChips);
          if (!isOver) {
            setTimer(10);
            setIsTimerActive(true);
            if (mode === 'pve' && curPlayer === 2) {
              setTimeout(() => runAITurn(), 800);
            }
          }
        }, 500);
      } else {
        // MISMATCH!
        setTimeout(() => {
          playSound('mismatch');
          const unFlipped = [...nextChips];
          unFlipped[newSelected[0]] = { ...unFlipped[newSelected[0]], isFlipped: false };
          unFlipped[newSelected[1]] = { ...unFlipped[newSelected[1]], isFlipped: false };
          setChips(unFlipped);

          setSelectedChipIndexes([]);
          setIsLocked(false);
          setPhase('mix');

          if (mode === 'pve' && activePlayerRef.current === 2) {
            setTimeout(() => runAIMixSlide(), 900);
          }
        }, 800);
      }
    }
  };

  // AI Turn Logic
  const runAITurn = () => {
    if (phaseRef.current !== 'match' || activePlayerRef.current !== 2) return;

    setTimeout(() => {
      const currentChips = chipsRef.current;
      const unfoundIndices = currentChips
        .map((c, i) => (!c.isFound && c.number !== 0 ? i : -1))
        .filter(i => i !== -1);

      if (unfoundIndices.length < 2) return;

      // Check if AI remembers any matching pair
      const mem = aiMemory.current;
      let pairFound = null;

      const memIndices = Object.keys(mem).map(Number).filter(idx => !currentChips[idx].isFound);
      for (let i = 0; i < memIndices.length; i++) {
        for (let j = i + 1; j < memIndices.length; j++) {
          const idxA = memIndices[i];
          const idxB = memIndices[j];
          if (mem[idxA] === mem[idxB] && idxA !== idxB) {
            pairFound = [idxA, idxB];
            break;
          }
        }
        if (pairFound) break;
      }

      let firstPick, secondPick;
      if (pairFound && Math.random() < 0.85) {
        // AI executes remembered pair
        firstPick = pairFound[0];
        secondPick = pairFound[1];
      } else {
        // Pick random unfound
        const shuffled = [...unfoundIndices].sort(() => Math.random() - 0.5);
        firstPick = shuffled[0];
        secondPick = shuffled[1];
      }

      // Flip first
      processChipFlip(firstPick);

      // Flip second after natural delay
      setTimeout(() => {
        if (phaseRef.current === 'match') {
          processChipFlip(secondPick);
        }
      }, 700);
    }, 800);
  };

  // AI Mix Phase Sliding Logic
  const runAIMixSlide = () => {
    const currentTiles = tilesRef.current;
    const emptyTileVal = cols * cols - 1;
    const emptySlotIdx = currentTiles.indexOf(emptyTileVal);
    const validMoves = getAdjacentSlots(emptySlotIdx);

    // Filter out last moved tile if possible
    const candidates = validMoves.filter(slot => currentTiles[slot] !== lastMovedTile);
    const chosenSlot = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : validMoves[Math.floor(Math.random() * validMoves.length)];

    performTileSlide(chosenSlot);
  };

  // Slot Adjacency Calculation
  const getAdjacentSlots = (emptySlotIdx) => {
    const rowEmpty = Math.floor(emptySlotIdx / cols);
    const colEmpty = emptySlotIdx % cols;
    const adj = [];

    [[rowEmpty - 1, colEmpty], [rowEmpty + 1, colEmpty], [rowEmpty, colEmpty - 1], [rowEmpty, colEmpty + 1]].forEach(([r, c]) => {
      if (r >= 0 && r < cols && c >= 0 && c < cols) {
        adj.push(r * cols + c);
      }
    });
    return adj;
  };

  // Perform Slide
  const performTileSlide = (slotIdx) => {
    const currentTiles = [...tilesRef.current];
    const emptyTileVal = cols * cols - 1;
    const emptySlotIdx = currentTiles.indexOf(emptyTileVal);

    const validMoves = getAdjacentSlots(emptySlotIdx);
    if (!validMoves.includes(slotIdx)) return;

    const movingTileVal = currentTiles[slotIdx];
    if (movingTileVal === lastMovedTile && validMoves.length > 1) {
      // Prevent immediate reversible move if other choices exist
      return;
    }

    playSound('slide');

    // Swap
    currentTiles[emptySlotIdx] = movingTileVal;
    currentTiles[slotIdx] = emptyTileVal;

    setTiles(currentTiles);
    setLastMovedTile(movingTileVal);

    // Switch turn
    switchTurnAfterSlide();
  };

  // Tile Component
  const Tile = ({ tileIdx, slotIdx }) => {
    const isEmpty = tileIdx === cols * cols - 1;
    const tileChips = chips.slice(tileIdx * chipsPerTile, tileIdx * chipsPerTile + chipsPerTile);

    const emptySlotIdx = tiles.indexOf(cols * cols - 1);
    const validMoves = getAdjacentSlots(emptySlotIdx);
    const isSlidable = phase === 'mix' && validMoves.includes(slotIdx) && !(tileIdx === lastMovedTile && validMoves.length > 1);

    if (isEmpty) {
      return (
        <div style={{
          aspectRatio: '1',
          border: '2px dashed rgba(255,255,255,0.15)',
          borderRadius: '12px',
          backgroundColor: 'rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--uw-text-muted)',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          {phase === 'mix' && <span style={{ opacity: 0.6 }}>EMPTY</span>}
        </div>
      );
    }

    // Positions inside 3x3 subgrid
    const getPosition = (cIdx) => {
      if (chipsPerTile === 3) {
        return [
          { gridColumn: 1, gridRow: 1 },
          { gridColumn: 2, gridRow: 2 },
          { gridColumn: 3, gridRow: 3 }
        ][cIdx];
      }
      if (chipsPerTile === 4) {
        return [
          { gridColumn: 1, gridRow: 1 },
          { gridColumn: 3, gridRow: 1 },
          { gridColumn: 1, gridRow: 3 },
          { gridColumn: 3, gridRow: 3 }
        ][cIdx];
      }
      return [
        { gridColumn: 1, gridRow: 1 },
        { gridColumn: 3, gridRow: 1 },
        { gridColumn: 2, gridRow: 2 },
        { gridColumn: 1, gridRow: 3 },
        { gridColumn: 3, gridRow: 3 }
      ][cIdx];
    };

    return (
      <div
        onClick={() => {
          if (phase === 'mix' && isSlidable && !(mode === 'pve' && activePlayer === 2)) {
            performTileSlide(slotIdx);
          }
        }}
        style={{
          aspectRatio: '1',
          borderRadius: '12px',
          backgroundColor: isSlidable ? 'rgba(234, 179, 8, 0.08)' : 'var(--uw-surface-strong)',
          border: isSlidable ? '2.5px solid #eab308' : '1px solid var(--uw-border)',
          boxShadow: isSlidable ? '0 0 14px rgba(234, 179, 8, 0.35)' : 'var(--uw-shadow-sm)',
          padding: '6px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          alignItems: 'center',
          justifyItems: 'center',
          cursor: isSlidable ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          transform: isSlidable ? 'scale(1.02)' : 'none',
          position: 'relative'
        }}
      >
        {isSlidable && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '6px',
            fontSize: '0.65rem',
            fontWeight: 800,
            color: '#eab308',
            }}>
            SLIDE ➔
          </div>
        )}

        {tileChips.map((chip, idx) => {
          const isFlipped = chip.isFlipped;
          const isFound = chip.isFound;
          const isSelectable = phase === 'match' && !isFlipped && !isFound && !isLocked && !(mode === 'pve' && activePlayer === 2);

          return (
            <button
              key={chip.index}
              aria-label={`${lang === 'en' ? 'Chip' : 'Keping'} ${chip.index + 1}: ${isFlipped || isFound ? chip.number : (lang === 'en' ? 'hidden' : 'tertutup')}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isSelectable) handleChipClick(chip.index);
              }}
              disabled={!isSelectable}
              style={{
                ...getPosition(idx),
                width: 'clamp(28px, 7vw, 42px)',
                height: 'clamp(28px, 7vw, 42px)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)',
                cursor: isSelectable ? 'pointer' : 'default',
                backgroundColor: isFound
                  ? '#22c55e'
                  : isFlipped
                    ? '#ffffff'
                    : 'var(--uw-primary)',
                color: isFound
                  ? '#ffffff'
                  : isFlipped
                    ? 'var(--uw-primary)'
                    : '#ffffff',
                border: isFlipped ? '2px solid var(--uw-primary)' : '1px solid rgba(255,255,255,0.2)',
                boxShadow: isSelectable ? 'none' : 'none',
                transition: 'transform 0.12s, background-color 0.2s',
                transform: isFlipped ? 'scale(1.05)' : 'none'
              }}
            >
              {isFlipped || isFound ? chip.number : ''}
            </button>
          );
        })}
      </div>
    );
  };

  const t = {
    title: lang === 'en' ? 'Match and Mix' : 'Match and Mix',
    sdDesc: lang === 'en' ? 'SD: 2×2 Grid (3 Tiles), 4 chips/tile (1–6, 6 pairs). Target: 4 pts.' : 'Level SD: Grid 2×2 (3 Ubin), 4 chip/ubin (1–6, 6 pasang). Target: 4 poin.',
    smpDesc: lang === 'en' ? 'SMP: 3×3 Grid (8 Tiles), 3 chips/tile (1–12, 12 pairs). Target: 7 pts.' : 'Level SMP: Grid 3×3 (8 Ubin), 3 chip/ubin (1–12, 12 pasang). Target: 7 poin.',
    smaDesc: lang === 'en' ? 'SMA: 3×3 Grid (8 Tiles), 4 chips/tile (1–16, 16 pairs). Target: 9 pts.' : 'Level SMA: Grid 3×3 (8 Ubin), 4 chip/ubin (1–16, 16 pasang). Target: 9 poin.',
    univDesc: lang === 'en' ? 'Universitas: 3×3 Grid (8 Tiles), 5 chips/tile (1–20, 20 pairs). Target: 11 pts.' : 'Level Universitas: Grid 3×3 (8 Ubin), 5 chip/ubin (1–20, 20 pasang). Target: 11 poin.',
    startChallenge: lang === 'en' ? 'Start Challenge' : 'Mulai Tantangan',
    memoPhase: lang === 'en' ? 'Memorization Phase' : 'Fase Memorisasi',
    memoDesc: lang === 'en'
      ? "Take your time studying the numbers on every chip. When ready, click 'Start Game' to conceal them and begin the match!"
      : "Pelajari dan hafalkan posisi angka pada semua chip. Jika sudah siap, tekan 'Mulai Game' untuk menutupnya dan memulai duel!",
    startGame: lang === 'en' ? 'Ready! Conceal & Play' : 'Siap! Tutup & Mainkan',
    player1: lang === 'en' ? 'Player 1' : 'Pemain 1',
    player2: mode === 'pve' ? (lang === 'en' ? 'AI Bot' : 'Bot AI') : (lang === 'en' ? 'Player 2' : 'Pemain 2'),
    findPairs: lang === 'en' ? 'FLIP 2 CHIPS TO MATCH' : 'BUKA 2 CHIP UNTUK MENCOCOKKAN',
    slideTile: lang === 'en' ? 'SLIDE 1 ADJACENT TILE INTO EMPTY SLOT' : 'GESER 1 UBIN TERDEKAT KE SLOT KOSONG',
    resetMatch: lang === 'en' ? 'Restart Match' : 'Mulai Ulang'
  };

  return (
    <GameScreen gameId="mnm" lang={lang} state={phase} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)}>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        ruleList={rules}
        gameName={t.title}
      />



      {phase === 'setup' ? (
        <SetupCard
          heading={lang === 'en' ? 'Game Mode & Difficulty' : 'Mode & Tingkat Kesulitan'}
          schoolLevel={schoolLevel}
          onLevelChange={setSchoolLevel}
          desc={
            schoolLevel === 'sd'
              ? t.sdDesc
              : schoolLevel === 'smp'
              ? t.smpDesc
              : schoolLevel === 'sma'
              ? t.smaDesc
              : t.univDesc
          }
          lang={lang}
        >
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="uw-btn uw-btn-primary"
              onClick={() => initBoard(schoolLevel, 'pve')}
              style={{ padding: '12px 28px', fontSize: '1.15rem', }}
            >
              <Icon name="bot" size={18}/>{lang === "en" ? "Play against AI" : "Lawan AI Bot"}
            </button>
            <button
              className="uw-btn uw-btn-secondary"
              onClick={() => initBoard(schoolLevel, 'pvp')}
              style={{ padding: '12px 28px', fontSize: '1.15rem', }}
            >
              <Icon name="users" size={18}/>{lang === "en" ? "2 players, one device" : "2 pemain lokal"}
            </button>
            <button
              className="uw-btn uw-btn-neutral"
              onClick={() => setShowRules(true)}
              style={{ padding: '12px 20px' }}
            >
              <Icon name="book" size={16}/>{lang === 'en' ? 'Rules' : 'Aturan'}
            </button>
            <TipsButton onClick={() => onNavigate('tips-mnm')} lang={lang} />
          </div>
        </SetupCard>
      ) : phase === 'start' ? (
        // Memorization Phase
        <div className="memory-phase" style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--uw-surface-alt)',
            color: 'var(--uw-primary)',
            padding: '6px 18px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.9rem',
            marginBottom: '12px'
          }}>
            🧠 {t.memoPhase} • ({memoTimer}s)
          </div>

          <p style={{ color: 'var(--uw-text-muted)', maxWidth: '540px', margin: '0 auto 16px auto', fontSize: '0.95rem' }}>
            {t.memoDesc}
          </p>

          <button
            className="uw-btn uw-btn-secondary"
            onClick={handleStartGame}
            style={{
              padding: '12px 36px',
              fontSize: '1.15rem',
              marginBottom: '20px'
            }}
          >
            🚀 {t.startGame}
          </button>

          {/* Memorization Board Display */}
          <div className="mnm-board" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '12px',
            maxWidth: cols === 2 ? '360px' : '480px',
            margin: '0 auto',
            backgroundColor: 'var(--uw-bg-strong)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid var(--uw-border)'
          }}>
            {tiles.map((tileVal, slotIdx) => (
              <Tile key={slotIdx} tileIdx={tileVal} slotIdx={slotIdx} />
            ))}
          </div>
        </div>
      ) : phase === 'ended' ? (
        <MultiEndCard
          winner={winner}
          score1={score1}
          score2={score2}
          p1Label={t.player1}
          p2Label={t.player2}
          onBack={onBack}
          onPlayAgain={() => initBoard(schoolLevel, mode)}
          lang={lang}
        />
      ) : (
        // Active Game Screen
        <div>
          <Scoreboard
            activePlayer={activePlayer}
            score1={score1}
            score2={score2}
            timer={phase === 'match' ? timer : null}
            maxTime={10}
            winScore={winScore}
            lang={lang}
            mode={mode}
          />

          {/* Dynamic Phase Action Banner */}
          <div className="mnm-phase-notice" style={{
            textAlign: 'center',
            padding: '10px 16px',
            borderRadius: '8px',
            backgroundColor: phase === 'mix' ? '#eab308' : 'var(--uw-primary)',
            color: phase === 'mix' ? '#0f172a' : '#ffffff',
            fontWeight: 800,
            fontSize: '1.15rem',
            marginBottom: '16px',
            boxShadow: 'var(--uw-shadow-sm)',
            transition: 'background-color 0.2s'
          }}>
            {mode === 'pve' && activePlayer === 2
              ? (phase === 'match' ? '🤖 AI IS FLIPPING CHIPS...' : '🤖 AI IS SLIDING A TILE...')
              : (phase === 'match' ? `⏱ ${t.findPairs} (${timer}s)` : `⚠️ ${t.slideTile}`)}
          </div>

          {/* Sliding Grid Board */}
          <div className="mnm-board" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '12px',
            maxWidth: cols === 2 ? '360px' : '480px',
            margin: '0 auto 20px auto',
            backgroundColor: 'var(--uw-bg-strong)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid var(--uw-border)',
            userSelect: 'none'
          }}>
            {tiles.map((tileVal, slotIdx) => (
              <Tile key={slotIdx} tileIdx={tileVal} slotIdx={slotIdx} />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              className="uw-btn uw-btn-neutral"
              onClick={() => initBoard(schoolLevel, mode)}
              style={{ padding: '8px 22px', fontSize: '0.9rem' }}
            >
              ↻ {t.resetMatch}
            </button>
          </div>
        </div>
      )}
    </GameScreen>
  );
}
