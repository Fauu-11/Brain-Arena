import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import { generateSudokuMatrix } from '../utils/sudoku.js';
import { getAudioContext, getAudioDestination } from '../utils/audio.js';
import { readText, writeText } from '../utils/storage.js';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import RulesModal from '../components/RulesModal';
import { useLanguage } from '../context/LanguageContext';
import { SetupCard, TipsButton, SoloEndCard } from '../components/GameShell';

// Synthesized Audio Engine (No external sound files required)
const playSound = (type) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'tap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'place') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'erase') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.06);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'peek') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'victory') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.15, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(getAudioDestination());
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    }
  } catch (e) {
    // AudioContext ignored if blocked
  }
};

// Configuration specs for each difficulty level
const LEVEL_CONFIG = {
  sd: { size: 4, boxRows: 2, boxCols: 2, hiddenMin: 4, hiddenMax: 6, maxPeeks: 3 },
  smp: { size: 6, boxRows: 2, boxCols: 3, hiddenMin: 10, hiddenMax: 14, maxPeeks: 2 },
  sma: { size: 9, boxRows: 3, boxCols: 3, hiddenMin: 22, hiddenMax: 26, maxPeeks: 2 },
  universitas: { size: 9, boxRows: 3, boxCols: 3, hiddenMin: 34, hiddenMax: 40, maxPeeks: 1 }
};

export default function GameSudoku({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const [showRules, setShowRules] = useState(false);
  const [phase, setPhase] = useState('setup'); // 'setup', 'start' (memo), 'playing', 'ended'
  const [schoolLevel, setSchoolLevel] = useState('smp');

  // Sudoku Board Data
  const [solution, setSolution] = useState([]);
  const [cluesMask, setCluesMask] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', msg: string }
  const [elapsedTime, setElapsedTime] = useState(0);
  const [memoTime, setMemoTime] = useState(0);
  const [peeksLeft, setPeeksLeft] = useState(2);
  const [isPeeking, setIsPeeking] = useState(false);
  const [bestTime, setBestTime] = useState(null);

  const activeConfig = LEVEL_CONFIG[schoolLevel] || LEVEL_CONFIG.smp;
  const { size, boxRows, boxCols } = activeConfig;

  // Load best time from localStorage
  useEffect(() => {
    const saved = readText(`blind_sudoku_best_${schoolLevel}`);
    setBestTime(saved !== null && Number.isFinite(Number(saved)) && Number(saved) >= 0 ? Number(saved) : null);
  }, [schoolLevel]);

  const rules = lang === 'en' ? [
    "Blind Sudoku tests your visual memory and logical deduction combined!",
    "Format Levels: SD (4×4 Mini), SMP (6×6 Midi), SMA (9×9 Classic), Universitas (9×9 Master).",
    "Memorization Phase: A completed solution grid is revealed. Take your time to study and memorize the layout.",
    "Active Play Phase: Hidden cells are masked. Rely on your memory and standard Sudoku rules (no duplicate numbers in any row, column, or block).",
    "Controls: Tap any editable cell, then use the on-screen keypad (or physical keyboard 1–9, Arrow Keys, Backspace) to enter digits.",
    "Peek Assistance: Stuck? Use 'Quick Peek' to glimpse the original board for 2 seconds (limited charges).",
    "Submit your board once filled to claim victory and set a new personal record!"
  ] : [
    "Sudoku Buta memadukan daya ingat visual dengan logika deduktif angka!",
    "Format Grid: SD (4×4 Mini), SMP (6×6 Midi), SMA (9×9 Klasik), Universitas (9×9 Master).",
    "Fase Memorisasi: Papan solusi penuh ditampilkan. Gunakan waktu Anda untuk menghafal pola angka di dalamnya.",
    "Fase Bermain: Sel rahasia ditutup. Isi sel kosong dari ingatan dan logika Sudoku (tidak boleh ada angka kembar dalam baris, kolom, atau blok).",
    "Kontrol: Ketuk sel kosong, lalu gunakan keypad angka di layar (atau keyboard fisik 1–9, tombol panah, Backspace).",
    "Bantuan Intip: Terjebak? Gunakan 'Intip Kilat' untuk melihat papan asli selama 2 detik (jumlah penggunaan terbatas).",
    "Tekan 'Periksa Papan' saat selesai untuk mencetak rekor waktu terbaik!"
  ];

  // Initialize Puzzle
  const startNewSudoku = useCallback((lvl = schoolLevel) => {
    const conf = LEVEL_CONFIG[lvl] || LEVEL_CONFIG.smp;
    const fullGrid = generateSudokuMatrix(conf.size, conf.boxRows, conf.boxCols);
    const totalCells = conf.size * conf.size;

    // Create masked cells
    const mask = Array(totalCells).fill(true); // true = given clue, false = hidden
    const hiddenCount = Math.floor(
      Math.random() * (conf.hiddenMax - conf.hiddenMin + 1)
    ) + conf.hiddenMin;

    let placed = 0;
    while (placed < hiddenCount) {
      const randIdx = Math.floor(Math.random() * totalCells);
      if (mask[randIdx]) {
        mask[randIdx] = false;
        placed++;
      }
    }

    setSolution(fullGrid);
    setCluesMask(mask);
    setUserAnswers(fullGrid.map((val, idx) => (mask[idx] ? val.toString() : '')));
    setSelectedCell(null);
    setFeedback(null);
    setPeeksLeft(conf.maxPeeks);
    setIsPeeking(false);
    setElapsedTime(0);
    setMemoTime(0);
    setPhase('start');
  }, [schoolLevel]);

  // Timers
  useEffect(() => {
    let timer = null;
    if (phase === 'start') {
      timer = setInterval(() => setMemoTime(t => t + 1), 1000);
    } else if (phase === 'playing') {
      timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase !== 'playing' || selectedCell === null) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= size) {
        e.preventDefault();
        enterValueAtCell(selectedCell, num.toString());
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        enterValueAtCell(selectedCell, '');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCell(prev => (prev - size >= 0 ? prev - size : prev));
        playSound('tap');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCell(prev => (prev + size < size * size ? prev + size : prev));
        playSound('tap');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCell(prev => (prev % size !== 0 ? prev - 1 : prev));
        playSound('tap');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedCell(prev => ((prev + 1) % size !== 0 ? prev + 1 : prev));
        playSound('tap');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, selectedCell, size]);

  const enterValueAtCell = (cellIdx, val) => {
    if (cellIdx === null || cluesMask[cellIdx]) return;
    if (val === '') {
      playSound('erase');
    } else {
      playSound('place');
    }

    setUserAnswers(prev => {
      const next = [...prev];
      next[cellIdx] = val;
      return next;
    });
  };

  // Peek Solution helper
  const handleQuickPeek = () => {
    if (peeksLeft <= 0 || isPeeking || phase !== 'playing') return;
    playSound('peek');
    setIsPeeking(true);
    setPeeksLeft(p => p - 1);
    setElapsedTime(t => t + 4); // 4 seconds penalty

    setTimeout(() => {
      setIsPeeking(false);
    }, 2000);
  };

  // Check Solution
  const checkSudoku = () => {
    const totalCells = size * size;
    let isComplete = true;
    let hasMistake = false;

    for (let i = 0; i < totalCells; i++) {
      const val = parseInt(userAnswers[i], 10);
      if (isNaN(val)) {
        isComplete = false;
      } else if (val !== solution[i]) {
        hasMistake = true;
      }
    }

    if (!isComplete) {
      playSound('error');
      setFeedback({
        type: 'wrong',
        msg: lang === 'en' ? 'Incomplete! Fill all empty cells before checking.' : 'Belum lengkap! Isi semua sel kosong terlebih dahulu.'
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (!hasMistake) {
      playSound('victory');
      setFeedback({
        type: 'correct',
        msg: lang === 'en' ? '🎉 Brilliant! Board perfectly solved!' : '🎉 Luar Biasa! Semua angka tepat!'
      });

      // Update best time
      const finalTime = elapsedTime;
      if (bestTime === null || finalTime < bestTime) {
        writeText(`blind_sudoku_best_${schoolLevel}`, finalTime.toString());
        setBestTime(finalTime);
      }

      setTimeout(() => {
        setPhase('ended');
      }, 1200);
    } else {
      playSound('error');
      setFeedback({
        type: 'wrong',
        msg: lang === 'en' ? '❌ Some numbers are incorrect. Check again!' : '❌ Ada angka yang keliru. Cek dan teliti lagi!'
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const t = {
    title: lang === 'en' ? 'Blind Sudoku' : 'Sudoku Buta',
    sdDesc: lang === 'en' ? 'SD: 4×4 Mini Grid (Quick memory intro)' : 'Level SD: Grid 4×4 Mini (Pengenalan memori)',
    smpDesc: lang === 'en' ? 'SMP: 6×6 Midi Grid (Moderate logic & recall)' : 'Level SMP: Grid 6×6 Midi (Logika & ingatan seimbang)',
    smaDesc: lang === 'en' ? 'SMA: 9×9 Classic Grid (Challenging full Sudoku)' : 'Level SMA: Grid 9×9 Klasik (Sudoku standar menantang)',
    univDesc: lang === 'en' ? 'Universitas: 9×9 Master Grid (Extreme blind challenge)' : 'Level Universitas: Grid 9×9 Master (Tantangan hafalan ekstrem)',
    startSetup: lang === 'en' ? 'Generate Puzzle' : 'Buat Teka-Teki',
    memoPhase: lang === 'en' ? 'Memorization Phase' : 'Fase Memorisasi',
    memoDesc: lang === 'en'
      ? "Study the full solved grid below. Memorize the digits and their positions, then click 'Start Game' when you are ready!"
      : "Pelajari dan hafalkan posisi angka pada papan di bawah ini. Jika sudah siap, tekan 'Mulai Game' untuk menutup sel!",
    startGame: lang === 'en' ? 'I Am Ready! Start Game' : 'Saya Siap! Mulai Game',
    completed: lang === 'en' ? 'PUZZLE COMPLETED!' : 'TEKA-TEKI SELESAI!',
    solvedDesc: lang === 'en'
      ? `You conquered the ${size}×${size} Blind Sudoku in ${elapsedTime}s (Memorized in ${memoTime}s)!`
      : `Anda menaklukkan Sudoku Buta ${size}×${size} dalam ${elapsedTime} detik (Waktu hafalan: ${memoTime} detik)!`,
    best: lang === 'en' ? 'Best' : 'Rekor',
    peek: lang === 'en' ? 'Quick Peek (2s)' : 'Intip Kilat (2s)',
    checkBoard: lang === 'en' ? 'Check Board' : 'Periksa Papan',
    newPuzzle: lang === 'en' ? 'New Game' : 'Game Baru',
    clearCell: lang === 'en' ? 'Erase' : 'Hapus'
  };

  // Visual helper: check if cell is in the same row, col, or box as selectedCell
  const getHighlightStatus = (idx) => {
    if (selectedCell === null) return { isSelected: false, isRelated: false, isSameVal: false };
    const isSelected = idx === selectedCell;
    const r = Math.floor(idx / size);
    const c = idx % size;
    const selR = Math.floor(selectedCell / size);
    const selC = selectedCell % size;

    const inSameRow = r === selR;
    const inSameCol = c === selC;
    const inSameBox =
      Math.floor(r / boxRows) === Math.floor(selR / boxRows) &&
      Math.floor(c / boxCols) === Math.floor(selC / boxCols);

    const selVal = isPeeking ? solution[selectedCell] : userAnswers[selectedCell];
    const thisVal = isPeeking ? solution[idx] : userAnswers[idx];
    const isSameVal = Boolean(selVal && thisVal && selVal.toString() === thisVal.toString());

    return {
      isSelected,
      isRelated: inSameRow || inSameCol || inSameBox,
      isSameVal
    };
  };

  return (
    <GameScreen gameId="sudoku" lang={lang} state={phase} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)} stats={<><span><Icon name="clock" size={14}/>{phase === "start" ? `${memoTime}s` : `${elapsedTime}s`}</span>{bestTime !== null && <span><Icon name="trophy" size={14}/>{bestTime}s</span>}</>}>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        ruleList={rules}
        gameName={t.title}
      />



      {phase === 'setup' ? (
        <SetupCard
          heading={lang === 'en' ? 'Select Grid Difficulty' : 'Pilih Tingkat Grid'}
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
              onClick={() => startNewSudoku(schoolLevel)}
              style={{ padding: '12px 36px', fontSize: '1.2rem', }}
            >
              {t.startSetup}
            </button>
            <button
              className="uw-btn uw-btn-neutral"
              onClick={() => setShowRules(true)}
              style={{ padding: '12px 20px' }}
            >
              <Icon name="book" size={16}/>{lang === 'en' ? 'Rules' : 'Aturan'}
            </button>
            <TipsButton onClick={() => onNavigate('tips-sudoku')} lang={lang} />
          </div>
        </SetupCard>
      ) : phase === 'start' ? (
        // Memorization Phase Screen
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
            🧠 {t.memoPhase} • {size}×{size} ({size === 4 ? 'Mini' : size === 6 ? 'Midi' : 'Classic'})
          </div>

          <p style={{ color: 'var(--uw-text-muted)', maxWidth: '540px', margin: '0 auto 16px auto', fontSize: '0.95rem' }}>
            {t.memoDesc}
          </p>

          <button
            className="uw-btn uw-btn-secondary"
            onClick={() => {
              playSound('tap');
              setPhase('playing');
              setElapsedTime(0);
            }}
            style={{
              padding: '12px 36px',
              fontSize: '1.15rem',
              marginBottom: '20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}
          >
            🚀 {t.startGame}
          </button>

          {/* Full Solution Memorization Display */}
          <div className="sudoku-memory-board" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
            width: '100%',
            aspectRatio: '1 / 1',
            gap: size === 9 ? '1px' : '2px',
            maxWidth: size === 9 ? '440px' : size === 6 ? '380px' : '300px',
            margin: '0 auto',
            backgroundColor: 'var(--uw-surface-alt)',
            padding: size === 9 ? '4px' : '6px',
            borderRadius: '12px',
            boxShadow: 'none',
            border: '2px solid var(--uw-primary)'
          }}>
            {solution.map((val, idx) => {
              const r = Math.floor(idx / size);
              const c = idx % size;
              const inBoxRight = (c + 1) % boxCols === 0 && c !== size - 1;
              const inBoxBottom = (r + 1) % boxRows === 0 && r !== size - 1;

              return (
                <div
                  key={idx}
                  data-sudoku-memo={idx}
                  style={{
                    aspectRatio: '1 / 1',
                    backgroundColor: 'var(--uw-surface-strong)',
                    borderRight: inBoxRight ? '3px solid var(--uw-primary)' : '1px solid rgba(255,255,255,0.06)',
                    borderBottom: inBoxBottom ? '3px solid var(--uw-primary)' : '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: size === 9 ? '1.25rem' : size === 6 ? '1.5rem' : '1.8rem',
                    fontWeight: 800,
                    color: 'var(--uw-primary)',
                    }}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>
      ) : phase === 'ended' ? (
        <SoloEndCard
          heading={t.completed}
          subtext={t.solvedDesc}
          onBack={onBack}
          onPlayAgain={() => startNewSudoku(schoolLevel)}
          lang={lang}
        />
      ) : (
        // Active Play Screen
        <div>
          {/* Top Bar: Grid Badge + Peek Feature */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: size === 9 ? '460px' : size === 6 ? '400px' : '320px',
            margin: '0 auto 12px auto'
          }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--uw-text-muted)',
              backgroundColor: 'var(--uw-surface-alt)',
              padding: '4px 10px',
              borderRadius: '6px'
            }}>
              Grid: {size}×{size}
            </span>

            <button
              className="uw-btn uw-btn-neutral"
              onClick={handleQuickPeek}
              disabled={peeksLeft <= 0 || isPeeking}
              style={{
                fontSize: '0.82rem',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: peeksLeft <= 0 ? 0.4 : 1
              }}
            >
              👁️ {t.peek} ({peeksLeft})
            </button>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div style={{
              maxWidth: size === 9 ? '460px' : size === 6 ? '400px' : '320px',
              margin: '0 auto 10px auto',
              padding: '8px 14px',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              backgroundColor: feedback.type === 'correct' ? '#dcfce7' : '#fee2e2',
              color: feedback.type === 'correct' ? '#15803d' : '#b91c1c',
              border: `1px solid ${feedback.type === 'correct' ? '#86efac' : '#fca5a5'}`
            }}>
              {feedback.msg}
            </div>
          )}

          {/* Interactive Sudoku Grid */}
          <div className="sudoku-board" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
            width: '100%',
            aspectRatio: '1 / 1',
            gap: size === 9 ? '1px' : '2px',
            maxWidth: size === 9 ? '460px' : size === 6 ? '400px' : '320px',
            margin: '0 auto 16px auto',
            backgroundColor: 'var(--uw-surface-alt)',
            padding: size === 9 ? '4px' : '6px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: isPeeking ? '2.5px solid #a382cc' : '2px solid var(--uw-primary)',
            userSelect: 'none'
          }}>
            {userAnswers.map((val, idx) => {
              const isClue = cluesMask[idx];
              const r = Math.floor(idx / size);
              const c = idx % size;
              const inBoxRight = (c + 1) % boxCols === 0 && c !== size - 1;
              const inBoxBottom = (r + 1) % boxRows === 0 && r !== size - 1;

              const { isSelected, isRelated, isSameVal } = getHighlightStatus(idx);
              const displayVal = isPeeking ? solution[idx] : val;

              let cellBg = isClue ? 'var(--uw-surface)' : 'var(--uw-surface-strong)';
              if (isSelected) cellBg = 'rgba(113, 80, 201, 0.24)';
              else if (isSameVal && displayVal) cellBg = 'rgba(113, 80, 201, 0.12)';
              else if (isRelated) cellBg = 'var(--uw-surface-alt)';

              return (
                <div
                  key={idx}
                  data-sudoku-cell={idx}
                  role="button"
                  tabIndex={isClue || isPeeking ? -1 : 0}
                  aria-label={`${lang === 'id' ? 'Baris' : 'Row'} ${r + 1}, ${lang === 'id' ? 'kolom' : 'column'} ${c + 1}: ${displayVal || (lang === 'id' ? 'kosong' : 'empty')}`}
                  aria-disabled={isClue || isPeeking}
                  aria-pressed={isSelected}
                  onKeyDown={event => {
                    if ((event.key === 'Enter' || event.key === ' ') && !isClue && !isPeeking) {
                      event.preventDefault();
                      event.stopPropagation();
                      playSound('tap');
                      setSelectedCell(idx);
                    }
                  }}
                  onClick={() => {
                    if (!isPeeking) {
                      playSound('tap');
                      setSelectedCell(idx);
                    }
                  }}
                  style={{
                    aspectRatio: '1 / 1',
                    backgroundColor: cellBg,
                    borderRight: inBoxRight ? '3px solid var(--uw-primary)' : '1px solid var(--uw-border)',
                    borderBottom: inBoxBottom ? '3px solid var(--uw-primary)' : '1px solid var(--uw-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isClue ? 'default' : 'pointer',
                    outline: isSelected ? '2px solid var(--uw-primary)' : 'none',
                    outlineOffset: '-2px',
                    position: 'relative',
                    transition: 'background-color 100ms'
                  }}
                >
                  <span style={{
                    fontSize: size === 9 ? '1.25rem' : size === 6 ? '1.5rem' : '1.8rem',
                    fontWeight: isClue ? 800 : 700,
                    color: isPeeking
                      ? 'var(--uw-primary)'
                      : isClue
                        ? 'var(--uw-text-muted-strong, #64748b)'
                        : 'var(--uw-secondary)'
                  }}>
                    {displayVal}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dedicated Virtual Keypad for Mobile & Touch Devices */}
          <div className="sudoku-keypad" style={{
            maxWidth: size === 9 ? '460px' : size === 6 ? '400px' : '320px',
            margin: '0 auto 16px auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '6px'
          }}>
            {Array.from({ length: size }, (_, i) => i + 1).map((digit) => (
              <button
                key={digit}
                onClick={() => enterValueAtCell(selectedCell, digit.toString())}
                disabled={selectedCell === null || cluesMask[selectedCell]}
                style={{
                  flex: '1 1 0',
                  minWidth: size === 9 ? '38px' : '48px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--uw-border)',
                  backgroundColor: 'var(--uw-surface-strong)',
                  color: 'var(--uw-primary)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  cursor: (selectedCell !== null && !cluesMask[selectedCell]) ? 'pointer' : 'not-allowed',
                  opacity: (selectedCell !== null && !cluesMask[selectedCell]) ? 1 : 0.45,
                  boxShadow: 'var(--uw-shadow-sm)',
                  transition: 'transform 80ms'
                }}
              >
                {digit}
              </button>
            ))}

            <button
              onClick={() => enterValueAtCell(selectedCell, '')}
              disabled={selectedCell === null || cluesMask[selectedCell]}
              style={{
                flex: '1.2 1 0',
                minWidth: '54px',
                height: '44px',
                borderRadius: '8px',
                border: '1px solid var(--uw-border)',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: (selectedCell !== null && !cluesMask[selectedCell]) ? 'pointer' : 'not-allowed',
                opacity: (selectedCell !== null && !cluesMask[selectedCell]) ? 1 : 0.45
              }}
            >
              ⌫ {t.clearCell}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="sudoku-actions" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            maxWidth: size === 9 ? '460px' : size === 6 ? '400px' : '320px',
            margin: '0 auto'
          }}>
            <button
              className="uw-btn uw-btn-neutral"
              onClick={() => startNewSudoku(schoolLevel)}
              style={{ padding: '10px 20px' }}
            >
              ↻ {t.newPuzzle}
            </button>
            <button
              className="uw-btn uw-btn-primary"
              onClick={checkSudoku}
              style={{
                padding: '10px 28px',
                fontSize: '1.2rem',
                }}
            >
              ✓ {t.checkBoard}
            </button>
          </div>
        </div>
      )}
    </GameScreen>
  );
}
