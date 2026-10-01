import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import { getAudioContext, getAudioDestination } from '../utils/audio.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import RulesModal from '../components/RulesModal';
import Scoreboard from '../components/Scoreboard';
import { useLanguage } from '../context/LanguageContext';
import { SetupCard, TipsButton, MultiEndCard, UniversityDifficultySelector } from '../components/GameShell';

// Synthesized Audio Engine (No external files needed)
const playSound = (type) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'prime') {
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
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.22);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'bonus') {
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.15, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(getAudioDestination());
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.35);
      });
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'fanfare') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(getAudioDestination());
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    }
  } catch (e) {
    // AudioContext ignored if blocked
  }
};

// Math helpers
const isPrime = (num) => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};

const getSmallestFactor = (num) => {
  if (num <= 1) return 1;
  if (num % 2 === 0) return 2;
  if (num % 3 === 0) return 3;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0) return i;
    if (num % (i + 2) === 0) return i + 2;
  }
  return num;
};


const UNIVERSITY_LEVELS = {
  hard: { min: 1501, max: 4000, seconds: 24, hitChance: 0.80, hiddenAccuracy: 0.82 },
  'very-hard': { min: 4001, max: 9000, seconds: 18, hitChance: 0.90, hiddenAccuracy: 0.90 },
  impossible: { min: 9001, max: 20000, seconds: 12, hitChance: 0.96, hiddenAccuracy: 0.97 },
};
const UNIVERSITY_LABELS = { hard: 'Hard', 'very-hard': 'Very Hard', impossible: 'Impossible' };

export default function GamePrime({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const [showRules, setShowRules] = useState(false);
  const [mode, setMode] = useState(null); // 'pvp' | 'pve'
  const [difficulty, setDifficulty] = useState('smp'); // 'sd', 'smp', 'sma', 'universitas'
  const [universityDifficulty, setUniversityDifficulty] = useState('hard');
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'ended'

  // Board & Game loop
  const [board, setBoard] = useState([]);
  const [activePlayer, setActivePlayer] = useState(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [turnTimer, setTurnTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [winner, setWinner] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiTargetIdx, setAiTargetIdx] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const universityConfig = UNIVERSITY_LEVELS[universityDifficulty];
  const turnSeconds = difficulty === 'universitas' ? universityConfig.seconds : 30;

  // Hidden Cube Modal
  const [hiddenGuessModal, setHiddenGuessModal] = useState(null);

  // Refs for race-condition prevention in AI timeouts
  const boardRef = useRef(board);
  boardRef.current = board;
  const activePlayerRef = useRef(activePlayer);
  activePlayerRef.current = activePlayer;
  const score1Ref = useRef(score1);
  score1Ref.current = score1;
  const score2Ref = useRef(score2);
  score2Ref.current = score2;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;
  const universityDifficultyRef = useRef(universityDifficulty);
  universityDifficultyRef.current = universityDifficulty;
  const turnSecondsRef = useRef(turnSeconds);
  turnSecondsRef.current = turnSeconds;

  const rules = lang === 'en' ? [
    "The board is filled with 25 unique number cubes. The goal is to identify Prime Numbers.",
    "Players take turns selecting one cube per move. University Arena Mode uses Hard, Very Hard, and Impossible timers and number ranges.",
    "Selecting a Prime Number scores +1 Point and lets you KEEP your turn for another guess!",
    "Selecting a Composite (Non-Prime) Number reveals its prime factor breakdown and passes the turn to your opponent immediately.",
    "One cube is hidden as '?'. If you choose it and correctly guess whether it is Prime or Not Prime, you earn +3 Points!",
    "First player to reach 6 points wins the match immediately. If the board runs out of primes, the highest score wins."
  ] : [
    "Papan diisi dengan 25 kubus angka unik. Tujuannya adalah menemukan Bilangan Prima.",
    "Pemain bergantian memilih satu kubus per giliran. Mode Arena Universitas memakai timer dan rentang angka Hard, Very Hard, dan Impossible.",
    "Memilih Bilangan Prima menghasilkan +1 Poin dan Anda MEMPERTAHANKAN giliran untuk menebak lagi!",
    "Memilih Bilangan Komposit (Bukan Prima) akan mengungkap faktor pembaginya dan langsung mengalihkan giliran ke lawan.",
    "Satu kubus disembunyikan sebagai '?'. Jika Anda menebak dengan benar apakah nilainya Prima atau Bukan, Anda mendapat +3 Poin!",
    "Pemain pertama yang mencapai 6 poin langsung menang. Jika angka prima habis, pemain dengan poin terbanyak menang."
  ];

  // Helper: Generate unique numbers
  const generateUniqueBoard = useCallback((level, arenaDifficulty = universityDifficulty) => {
    let min, max;
    if (level === 'sd') {
      min = 2; max = 99;
    } else if (level === 'smp') {
      min = 101; max = 500;
    } else if (level === 'sma') {
      min = 501; max = 1500;
    } else {
      const arena = UNIVERSITY_LEVELS[arenaDifficulty] || UNIVERSITY_LEVELS.hard;
      min = arena.min; max = arena.max;
    }

    const usedNumbers = new Set();
    const getRandomNum = (forcePrime) => {
      let attempts = 0;
      while (attempts < 2500) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!usedNumbers.has(num)) {
          const prime = isPrime(num);
          if (forcePrime && prime) {
            usedNumbers.add(num);
            return num;
          }
          if (!forcePrime && !prime) {
            usedNumbers.add(num);
            return num;
          }
        }
        attempts++;
      }
      // Safety fallback
      let fallback = min;
      while (usedNumbers.has(fallback) || (forcePrime ? !isPrime(fallback) : isPrime(fallback))) {
        fallback++;
      }
      usedNumbers.add(fallback);
      return fallback;
    };

    const cells = [];
    const primeCountTarget = 10; // Exactly 10 regular primes

    for (let i = 0; i < primeCountTarget; i++) {
      const val = getRandomNum(true);
      cells.push({
        value: val,
        isFound: false,
        isHidden: false,
        isPrime: true,
        factorHint: null
      });
    }

    for (let i = 0; i < 14; i++) {
      const val = getRandomNum(false);
      const f = getSmallestFactor(val);
      cells.push({
        value: val,
        isFound: false,
        isHidden: false,
        isPrime: false,
        factorHint: `${f} × ${val / f}`
      });
    }

    cells.sort(() => Math.random() - 0.5);

    // Place the hidden '?' cube
    const hiddenIndex = Math.floor(Math.random() * 25);
    const hiddenIsPrime = Math.random() < 0.5;
    const hiddenValue = getRandomNum(hiddenIsPrime);
    const hiddenFactor = hiddenIsPrime ? null : `${getSmallestFactor(hiddenValue)} × ${hiddenValue / getSmallestFactor(hiddenValue)}`;

    cells.splice(hiddenIndex, 0, {
      value: hiddenValue,
      isFound: false,
      isHidden: true,
      isPrime: hiddenIsPrime,
      factorHint: hiddenFactor
    });

    return cells;
  }, [universityDifficulty]);

  // Start game
  const startChallenge = (chosenMode) => {
    const newBoard = generateUniqueBoard(difficulty, universityDifficulty);
    setBoard(newBoard);
    setScore1(0);
    setScore2(0);
    setActivePlayer(1);
    setTurnTimer(turnSecondsRef.current);
    setIsTimerActive(true);
    setWinner(null);
    setAiThinking(false);
    setAiTargetIdx(null);
    setActionNotice(null);
    setMode(chosenMode);
    setGameState('playing');
  };

  // Turn management
  const handleTurnEnd = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    setTurnTimer(turnSecondsRef.current);
    if (modeRef.current === 'pvp') {
      setActivePlayer(prev => (prev === 1 ? 2 : 1));
      setIsTimerActive(true);
    } else {
      if (activePlayerRef.current === 1) {
        setActivePlayer(2);
        setIsTimerActive(false);
        scheduleAITurn();
      } else {
        setActivePlayer(1);
        setIsTimerActive(true);
      }
    }
  }, []);

  // Timer Ticker
  useEffect(() => {
    let timerId = null;
    if (isTimerActive && turnTimer > 0 && gameState === 'playing') {
      timerId = setInterval(() => {
        setTurnTimer(t => {
          if (t <= 4 && t > 1) playSound('tick');
          return t - 1;
        });
      }, 1000);
    } else if (turnTimer === 0 && gameState === 'playing') {
      playSound('wrong');
      setActionNotice({
        type: 'error',
        text: lang === 'en' ? 'Time out! Turn passed.' : 'Waktu habis! Giliran berpindah.'
      });
      handleTurnEnd();
    }
    return () => clearInterval(timerId);
  }, [isTimerActive, turnTimer, gameState, handleTurnEnd, lang]);

  // Check Game End criteria
  const checkGameConditions = (updatedBoard, s1, s2) => {
    if (s1 >= 6) {
      playSound('fanfare');
      setWinner(1);
      setGameState('ended');
      setIsTimerActive(false);
      return true;
    }
    if (s2 >= 6) {
      playSound('fanfare');
      setWinner(2);
      setGameState('ended');
      setIsTimerActive(false);
      return true;
    }

    // Check if any prime or hidden cube remains
    const remainingValuable = updatedBoard.some(c => !c.isFound && (c.isPrime || c.isHidden));
    if (!remainingValuable) {
      playSound('fanfare');
      setGameState('ended');
      setIsTimerActive(false);
      if (s1 > s2) setWinner(1);
      else if (s2 > s1) setWinner(2);
      else setWinner('draw');
      return true;
    }

    return false;
  };

  // AI Turn Implementation
  const scheduleAITurn = () => {
    setAiThinking(true);
    setTimeout(() => {
      if (gameStateRef.current !== 'playing') return;

      const currentBoard = boardRef.current;
      const unrevealedIdxs = [];
      currentBoard.forEach((cell, idx) => {
        if (!cell.isFound) unrevealedIdxs.push(idx);
      });

      if (unrevealedIdxs.length === 0) {
        checkGameConditions(currentBoard, score1Ref.current, score2Ref.current);
        return;
      }

      // Smarter AI choice based on difficulty
      const primesAvailable = unrevealedIdxs.filter(i => currentBoard[i].isPrime && !currentBoard[i].isHidden);
      const hiddenAvailable = unrevealedIdxs.filter(i => currentBoard[i].isHidden);
      const compositesAvailable = unrevealedIdxs.filter(i => !currentBoard[i].isPrime && !currentBoard[i].isHidden);

      let targetIdx;
      // University/SMA AI is sharper (80% / 65% chance of picking a prime if available)
      const activeDifficulty = difficultyRef.current;
      const activeArena = UNIVERSITY_LEVELS[universityDifficultyRef.current] || UNIVERSITY_LEVELS.hard;
      const hitChance = activeDifficulty === 'universitas' ? activeArena.hitChance : activeDifficulty === 'sma' ? 0.65 : 0.45;

      if (hiddenAvailable.length > 0 && Math.random() < 0.25) {
        targetIdx = hiddenAvailable[0];
      } else if (primesAvailable.length > 0 && Math.random() < hitChance) {
        targetIdx = primesAvailable[Math.floor(Math.random() * primesAvailable.length)];
      } else {
        targetIdx = compositesAvailable.length > 0
          ? compositesAvailable[Math.floor(Math.random() * compositesAvailable.length)]
          : unrevealedIdxs[Math.floor(Math.random() * unrevealedIdxs.length)];
      }

      setAiTargetIdx(targetIdx);

      setTimeout(() => {
        setAiThinking(false);
        setAiTargetIdx(null);
        executeAIMove(targetIdx);
      }, 700);
    }, 1200);
  };

  const executeAIMove = (targetIdx) => {
    const currentBoard = [...boardRef.current];
    const cell = currentBoard[targetIdx];
    cell.isFound = true;
    setBoard(currentBoard);

    if (cell.isHidden) {
      // AI guesses prime vs not-prime
      const activeDifficulty = difficultyRef.current;
      const activeArena = UNIVERSITY_LEVELS[universityDifficultyRef.current] || UNIVERSITY_LEVELS.hard;
      const aiAccuracy = activeDifficulty === 'universitas' ? activeArena.hiddenAccuracy : 0.6;
      const guessedPrime = Math.random() < aiAccuracy ? cell.isPrime : !cell.isPrime;
      const isCorrect = guessedPrime === cell.isPrime;

      if (isCorrect) {
        playSound('bonus');
        const newScore2 = score2Ref.current + 3;
        setScore2(newScore2);
        setActionNotice({
          type: 'success',
          text: lang === 'en' ? `AI guessed the hidden '?' (${cell.value}) correctly! +3 PTS` : `AI menebak kubus '?' (${cell.value}) dengan benar! +3 POIN`
        });

        if (!checkGameConditions(currentBoard, score1Ref.current, newScore2)) {
          setTurnTimer(turnSecondsRef.current);
          scheduleAITurn();
        }
      } else {
        playSound('wrong');
        setActionNotice({
          type: 'error',
          text: lang === 'en' ? `AI guessed the hidden '?' incorrectly!` : `AI salah menebak kubus '?'!`
        });
        handleTurnEnd();
      }
    } else {
      if (cell.isPrime) {
        playSound('prime');
        const newScore2 = score2Ref.current + 1;
        setScore2(newScore2);
        setActionNotice({
          type: 'success',
          text: lang === 'en' ? `AI found Prime ${cell.value}! +1 PT` : `AI menemukan Prima ${cell.value}! +1 POIN`
        });

        if (!checkGameConditions(currentBoard, score1Ref.current, newScore2)) {
          setTurnTimer(turnSecondsRef.current);
          scheduleAITurn();
        }
      } else {
        playSound('wrong');
        setActionNotice({
          type: 'info',
          text: lang === 'en' ? `AI picked ${cell.value} (${cell.factorHint}). Turn passes!` : `AI memilih ${cell.value} (${cell.factorHint}). Giliran Anda!`
        });
        handleTurnEnd();
      }
    }
  };

  // User click cell
  const handleCellClick = (idx) => {
    if (gameState !== 'playing' || board[idx].isFound || aiThinking || (mode === 'pve' && activePlayer === 2)) {
      return;
    }

    const cell = board[idx];
    if (cell.isHidden) {
      setHiddenGuessModal(idx);
      setIsTimerActive(false); // Pause timer during modal prompt
      return;
    }

    const newBoard = [...board];
    newBoard[idx].isFound = true;
    setBoard(newBoard);

    if (cell.isPrime) {
      playSound('prime');
      const nextScore = activePlayer === 1 ? score1 + 1 : score2 + 1;
      if (activePlayer === 1) setScore1(nextScore);
      else setScore2(nextScore);

      setActionNotice({
        type: 'success',
        text: lang === 'en' ? `🎯 ${cell.value} is Prime! +1 Point & Keep Turn!` : `🎯 ${cell.value} adalah Prima! +1 Poin & Lanjut Giliran!`
      });

      if (!checkGameConditions(newBoard, activePlayer === 1 ? nextScore : score1, activePlayer === 2 ? nextScore : score2)) {
        setTurnTimer(turnSecondsRef.current);
      }
    } else {
      playSound('wrong');
      setActionNotice({
        type: 'error',
        text: lang === 'en' ? `❌ ${cell.value} is Composite (${cell.factorHint})` : `❌ ${cell.value} Bukan Prima (${cell.factorHint})`
      });
      handleTurnEnd();
    }
  };

  // Hidden guess submission
  const submitHiddenGuess = (guessIsPrime) => {
    const idx = hiddenGuessModal;
    setHiddenGuessModal(null);
    setIsTimerActive(true);

    const newBoard = [...board];
    const cell = newBoard[idx];
    cell.isFound = true;
    setBoard(newBoard);

    const isCorrect = cell.isPrime === guessIsPrime;

    if (isCorrect) {
      playSound('bonus');
      const nextScore = activePlayer === 1 ? score1 + 3 : score2 + 3;
      if (activePlayer === 1) setScore1(nextScore);
      else setScore2(nextScore);

      setActionNotice({
        type: 'success',
        text: lang === 'en'
          ? `🌟 Bravo! '?' was ${cell.value} (${cell.isPrime ? 'Prime' : 'Composite'}). +3 Points!`
          : `🌟 Tepat Sekali! '?' adalah ${cell.value} (${cell.isPrime ? 'Prima' : 'Komposit'}). +3 Poin!`
      });

      if (!checkGameConditions(newBoard, activePlayer === 1 ? nextScore : score1, activePlayer === 2 ? nextScore : score2)) {
        setTurnTimer(turnSecondsRef.current);
      }
    } else {
      playSound('wrong');
      setActionNotice({
        type: 'error',
        text: lang === 'en'
          ? `❌ Wrong! '?' was ${cell.value} (${cell.isPrime ? 'Prime' : 'Composite'}). Turn passes!`
          : `❌ Salah! '?' adalah ${cell.value} (${cell.isPrime ? 'Prima' : 'Komposit'}). Giliran beralih!`
      });
      handleTurnEnd();
    }
  };

  const t = {
    title: lang === 'en' ? 'Check Your Prime Number' : 'Cek Angka Prima',
    sdDesc: lang === 'en' ? 'SD Level: Numbers 2 – 99 (Fundamentals)' : 'Level SD: Angka 2 – 99 (Dasar)',
    smpDesc: lang === 'en' ? 'SMP Level: Numbers 101 – 500 (Intermediate)' : 'Level SMP: Angka 101 – 500 (Menengah)',
    smaDesc: lang === 'en' ? 'SMA Level: Numbers 501 – 1500 (Advanced divisibility)' : 'Level SMA: Angka 501 – 1500 (Keterbagian lanjutan)',
    univDesc: lang === 'en' ? `University Arena · ${UNIVERSITY_LABELS[universityDifficulty]} · Numbers ${universityConfig.min}–${universityConfig.max} · ${turnSeconds}s turns · randomized board` : `Arena Universitas · ${UNIVERSITY_LABELS[universityDifficulty]} · Angka ${universityConfig.min}–${universityConfig.max} · ${turnSeconds} dtk/giliran · papan acak`,
    pvp: lang === 'en' ? 'Local 1v1 Hotseat' : 'Duel 1v1 Lokal',
    pve: lang === 'en' ? 'vs AI Bot' : 'Lawan AI Bot',
    passTurn: lang === 'en' ? 'Skip / Pass Turn' : 'Lewati Giliran',
    player1: lang === 'en' ? 'Player 1' : 'Pemain 1',
    player2: mode === 'pve' ? (lang === 'en' ? 'AI Bot' : 'Bot AI') : (lang === 'en' ? 'Player 2' : 'Pemain 2'),
    hiddenGuess: lang === 'en' ? '❓ Hidden Number Mystery' : '❓ Misteri Kubus Tersembunyi',
    hiddenDesc: lang === 'en'
      ? 'Can you deduce if the secret number concealed in this cube is Prime or Composite? A correct guess awards +3 Points!'
      : 'Dapatkah Anda menebak apakah angka rahasia di balik kubus ini adalah Bilangan Prima atau Komposit? Tebakan benar bernilai +3 Poin!',
    prime: lang === 'en' ? 'Is Prime (+3 Pts)' : 'Bilangan Prima (+3 Poin)',
    notPrime: lang === 'en' ? 'Not Prime (+3 Pts)' : 'Bukan Prima (+3 Poin)',
    aiThinking: lang === 'en' ? '🤖 AI is analyzing cubes...' : '🤖 AI sedang menghitung kubus...',
    firstTo6: lang === 'en' ? 'First to 6 points wins' : 'Pemain pertama yang mencapai 6 poin menang'
  };

  // Font scaling helper
  const getCellFontSize = (val) => {
    const len = String(val).length;
    if (len >= 4) return '0.95rem';
    if (len === 3) return '1.1rem';
    return '1.3rem';
  };

  return (
    <GameScreen gameId="prime" lang={lang} state={gameState} level={difficulty} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)}>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        ruleList={rules}
        gameName={t.title}
      />



      {gameState === 'setup' ? (
        <SetupCard
          heading={lang === 'en' ? 'Configure Match' : 'Atur Pertandingan'}
          schoolLevel={difficulty}
          onLevelChange={setDifficulty}
          desc={difficulty === 'sd' ? t.sdDesc : difficulty === 'smp' ? t.smpDesc : difficulty === 'sma' ? t.smaDesc : t.univDesc}
          lang={lang}
        >
          {difficulty === 'universitas' && <UniversityDifficultySelector value={universityDifficulty} onChange={setUniversityDifficulty} lang={lang}/>}
          <div style={{ display: 'flex', gap: 'var(--uw-space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="uw-btn uw-btn-primary"
              onClick={() => startChallenge('pve')}
              style={{ padding: '12px 28px', fontSize: '1.15rem', }}
            >
              <Icon name="bot" size={18}/>{t.pve}
            </button>
            <button
              className="uw-btn uw-btn-secondary"
              onClick={() => startChallenge('pvp')}
              style={{ padding: '12px 28px', fontSize: '1.15rem', }}
            >
              <Icon name="users" size={18}/>{t.pvp}
            </button>
            <button
              className="uw-btn uw-btn-neutral"
              onClick={() => setShowRules(true)}
              style={{ padding: '12px 20px' }}
            >
              <Icon name="book" size={16}/>{lang === 'en' ? 'Rules' : 'Aturan'}
            </button>
            <TipsButton onClick={() => onNavigate('tips-prime')} lang={lang} />
          </div>
        </SetupCard>
      ) : gameState === 'playing' ? (
        <div>
          {/* Header Scoreboard */}
          <Scoreboard
            activePlayer={activePlayer}
            score1={score1}
            score2={score2}
            timer={turnTimer}
            maxTime={turnSeconds}
            lang={lang}
            mode={mode}
          />

          {/* Goal & Status Subheader */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '520px',
            margin: '0 auto 12px auto',
            fontSize: '0.85rem',
            color: 'var(--uw-text-muted)'
          }}>
            <span>🎯 {t.firstTo6}</span>
            <span style={{
              fontWeight: 700,
              color: activePlayer === 1 ? 'var(--uw-primary)' : 'var(--uw-secondary)'
            }}>
              {mode === 'pve' && activePlayer === 2
                ? (aiThinking ? t.aiThinking : (lang === 'id' ? `Giliran ${t.player2}` : `${t.player2}'s Turn`))
                : (lang === 'id' ? `Giliran ${activePlayer === 1 ? t.player1 : t.player2}` : `${activePlayer === 1 ? t.player1 : t.player2}'s Turn`)}
            </span>
          </div>

          {/* Notice Banner */}
          {actionNotice && (
            <div style={{
              maxWidth: '520px',
              margin: '0 auto 12px auto',
              padding: '8px 14px',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: actionNotice.type === 'success' ? '#dcfce7' : actionNotice.type === 'error' ? '#fee2e2' : 'var(--uw-surface-alt)',
              color: actionNotice.type === 'success' ? '#15803d' : actionNotice.type === 'error' ? '#b91c1c' : 'var(--uw-text)',
              border: `1px solid ${actionNotice.type === 'success' ? '#86efac' : actionNotice.type === 'error' ? '#fca5a5' : 'var(--uw-border)'}`,
              transition: 'all 0.2s'
            }}>
              {actionNotice.text}
            </div>
          )}

          {/* 5x5 Grid Board */}
          <div className="prime-board" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            maxWidth: '520px',
            margin: '0 auto var(--uw-space-4) auto',
            userSelect: 'none'
          }}>
            {board.map((cell, idx) => {
              const isCellClickable = !cell.isFound && !(mode === 'pve' && activePlayer === 2) && !aiThinking;
              const isAiTarget = aiTargetIdx === idx;

              return (
                <button
                  key={idx}
                  aria-label={`${lang === "en" ? "Number" : "Angka"} ${cell.isHidden && !cell.isFound ? "?" : cell.value}`}
                  disabled={!isCellClickable}
                  onClick={() => handleCellClick(idx)}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '8px',
                    border: isAiTarget
                      ? '2.5px solid #ef4444'
                      : cell.isFound
                        ? (cell.isPrime ? '2px solid #22c55e' : '1px solid var(--uw-border)')
                        : '1.5px solid var(--uw-border)',
                    fontSize: getCellFontSize(cell.value),
                    fontWeight: 700,
                    backgroundColor: isAiTarget
                      ? '#fef08a'
                      : cell.isFound
                        ? (cell.isPrime ? '#22c55e' : 'var(--uw-surface-alt)')
                        : cell.isHidden
                          ? 'var(--play-dark)'
                          : 'var(--uw-surface-strong)',
                    color: cell.isFound
                      ? (cell.isPrime ? '#ffffff' : 'var(--uw-text-muted)')
                      : cell.isHidden
                        ? '#fbbf24'
                        : 'var(--uw-text)',
                    boxShadow: cell.isFound ? 'none' : 'var(--uw-shadow-sm)',
                    cursor: isCellClickable ? 'pointer' : 'default',
                    transition: 'all 120ms cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isAiTarget ? 'scale(1.08)' : cell.isFound ? 'scale(0.96)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    position: 'relative'
                  }}
                >
                  {cell.isFound ? (
                    <>
                      <span>{cell.value}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        marginTop: '2px',
                        color: cell.isPrime ? 'rgba(255,255,255,0.9)' : 'var(--uw-danger)'
                      }}>
                        {cell.isPrime ? '✓ PRIME' : cell.factorHint}
                      </span>
                    </>
                  ) : cell.isHidden ? (
                    <span style={{ fontSize: '1.6rem', color: '#fbbf24', fontWeight: 800 }}>?</span>
                  ) : (
                    cell.value
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              className="uw-btn uw-btn-neutral"
              onClick={handleTurnEnd}
              disabled={mode === 'pve' && activePlayer === 2}
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            >
              ⏭ {t.passTurn}
            </button>
          </div>
        </div>
      ) : (
        <MultiEndCard
          winner={winner}
          score1={score1}
          score2={score2}
          p1Label={t.player1}
          p2Label={t.player2}
          onBack={() => setGameState('setup')}
          onPlayAgain={() => startChallenge(mode)}
          lang={lang}
        />
      )}

      {/* Hidden Mystery Cube Guess Modal */}
      {hiddenGuessModal !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.82)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '16px',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: 'var(--uw-surface-strong)',
            border: '2px solid #fbbf24',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              margin: '0 auto 14px auto'
            }}>
              ?
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '8px', color: 'var(--uw-text)' }}>
              {t.hiddenGuess}
            </h3>

            <p style={{ color: 'var(--uw-text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '22px' }}>
              {t.hiddenDesc}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="uw-btn uw-btn-primary"
                onClick={() => submitHiddenGuess(true)}
                style={{ flex: 1, padding: '12px 8px', fontWeight: 700 }}
              >
                {t.prime}
              </button>
              <button
                className="uw-btn uw-btn-neutral"
                onClick={() => submitHiddenGuess(false)}
                style={{ flex: 1, padding: '12px 8px', fontWeight: 700, borderColor: 'var(--uw-border)' }}
              >
                {t.notPrime}
              </button>
            </div>
          </div>
        </div>
      )}
    </GameScreen>
  );
}
