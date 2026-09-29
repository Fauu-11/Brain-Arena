import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import { getAudioContext, getAudioDestination } from '../utils/audio.js';
import { readText, writeText } from '../utils/storage.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import RulesModal from '../components/RulesModal';
import { useLanguage } from '../context/LanguageContext';
import { SetupCard, TipsButton, SoloEndCard } from '../components/GameShell';

// Digital numbers 0-9 in a 3x5 grid (15 boolean values)
const DIGIT_TEMPLATES = [
  [true, true, true,  true, false, true,  true, false, true,  true, false, true,  true, true, true],  // 0
  [false, false, true, false, false, true, false, false, true, false, false, true, false, false, true], // 1
  [true, true, true,  false, false, true, true, true, true,  true, false, false, true, true, true],  // 2
  [true, true, true,  false, false, true, true, true, true,  false, false, true, true, true, true],  // 3
  [true, false, true, true, false, true,  true, true, true,  false, false, true, false, false, true], // 4
  [true, true, true,  true, false, false, true, true, true,  false, false, true, true, true, true],  // 5
  [true, true, true,  true, false, false, true, true, true,  true, false, true,  true, true, true],  // 6
  [true, true, true,  false, false, true, false, false, true, false, false, true, false, false, true], // 7
  [true, true, true,  true, false, true,  true, true, true,  true, false, true,  true, true, true],  // 8
  [true, true, true,  true, false, true,  true, true, true,  false, false, true, true, true, true]   // 9
];

// Lightweight Web Audio API Synthesizer
const playSound = (type) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'deselect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(120, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(getAudioDestination());
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'solve') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.1, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(getAudioDestination());
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.22);
      });
    } else if (type === 'win') {
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
    // AudioContext ignored if blocked by browser policy
  }
};

export default function GamePixel({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const [showRules, setShowRules] = useState(false);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'ended'
  const [schoolLevel, setSchoolLevel] = useState('universitas');

  // Game states
  const [targets, setTargets] = useState([]);
  const [solvedTargets, setSolvedTargets] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedCardIdxs, setSelectedCardIdxs] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'error', 'success', 'warning'
  const [elapsedTime, setElapsedTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [hintActive, setHintActive] = useState(false);
  const [shakePreview, setShakePreview] = useState(false);

  // Load best time on level change
  useEffect(() => {
    const saved = readText(`pixel_best_${schoolLevel}`);
    setBestTime(saved !== null && Number.isFinite(Number(saved)) && Number(saved) >= 0 ? Number(saved) : null);
  }, [schoolLevel]);

  const rules = lang === 'en' ? [
    "Pixel Number is a visual logic puzzle where you combine fragmented cards without overlaps to reconstruct digital numbers.",
    "At the top, you have Target Digits (0–9) rendered on standard 3×5 digital matrices.",
    "Each target digit is decomposed into 2 to 4 disjoint cards. Overlapping pixels on the same grid coordinate are invalid.",
    "Click cards on the board to stack them into the Live Preview area.",
    "Look at the Live Preview: if any pixels clash, they will glow red with an overlap alert.",
    "When you have assembled the exact shape of an unsolved target, press 'Check Selection' (or Space/Enter) to claim it!",
    "Clear all target digits in the fastest time to record a high score!"
  ] : [
    "Piksel Angka adalah teka-teki logika visual di mana Anda menggabungkan pecahan kartu tanpa tumpang tindih untuk merekonstruksi angka digital.",
    "Di bagian atas terdapat Digit Target (0–9) dalam format matriks 3×5.",
    "Setiap digit target dipecah menjadi 2 hingga 4 kartu yang saling lepas (disjoint). Piksel tidak boleh bertumpukan pada posisi yang sama.",
    "Klik kartu di papan untuk menumpuknya ke area Pratinjau Langsung.",
    "Perhatikan Pratinjau: jika ada piksel yang bentrok, piksel tersebut akan menyala merah sebagai peringatan overlap.",
    "Setelah bentuknya cocok persis dengan salah satu target yang belum selesai, tekan 'Periksa Terpilih' (atau Spasi/Enter)!",
    "Selesaikan semua angka target secepat mungkin untuk mencatatkan rekor waktu terbaik!"
  ];

  // Bitwise/matrix helpers
  const getCellCounts = (grids) => {
    const counts = Array(15).fill(0);
    grids.forEach(grid => {
      grid.forEach((val, i) => {
        if (val) counts[i]++;
      });
    });
    return counts;
  };

  const gridsEqual = (g1, g2) => g1.every((val, idx) => val === g2[idx]);

  // Guaranteed robust board generator
  const initGame = useCallback((level = schoolLevel) => {
    const targetsCount = level === 'sd' ? 1 : level === 'smp' ? 2 : 3;
    const totalCardsCount = level === 'sd' ? 6 : level === 'smp' ? 10 : level === 'sma' ? 12 : 15;

    // Pick random unique digits
    const digitsPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    const chosenTargets = digitsPool.slice(0, targetsCount);

    setTargets(chosenTargets);
    setSolvedTargets(Array(targetsCount).fill(false));

    const generatedCards = [];

    // Deconstruct each target into fair, non-trivial pieces
    chosenTargets.forEach((targetDigit, targetIdx) => {
      const template = DIGIT_TEMPLATES[targetDigit];
      const activeIndices = [];
      template.forEach((val, idx) => {
        if (val) activeIndices.push(idx);
      });

      // Determine split count based on difficulty and number of pixels available
      let splitsCount = 2;
      if (activeIndices.length >= 10) {
        if (level === 'smp' || level === 'sma') splitsCount = Math.random() < 0.5 ? 2 : 3;
        else if (level === 'universitas') splitsCount = Math.random() < 0.6 ? 3 : 4;
      } else if (activeIndices.length >= 7 && (level === 'sma' || level === 'universitas')) {
        splitsCount = Math.random() < 0.5 ? 2 : 3;
      }

      // Shuffle active pixel coordinates
      const shuffledPixels = [...activeIndices].sort(() => Math.random() - 0.5);
      const pieceGrids = Array.from({ length: splitsCount }, () => Array(15).fill(false));

      // Distribute evenly so each piece has at least 2 pixels
      shuffledPixels.forEach((pixelIdx, i) => {
        pieceGrids[i % splitsCount][pixelIdx] = true;
      });

      // Validate & append pieces
      pieceGrids.forEach(grid => {
        if (grid.some(Boolean)) {
          generatedCards.push({
            id: Math.random().toString(36).substring(2, 9),
            grid,
            targetRef: targetIdx,
            pixelCount: grid.filter(Boolean).length,
            isRemoved: false
          });
        }
      });
    });

    // Generate balanced distractor cards
    const neededDistractors = totalCardsCount - generatedCards.length;
    for (let d = 0; d < neededDistractors; d++) {
      const distGrid = Array(15).fill(false);
      const activeCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 pixels
      const pool = Array.from({ length: 15 }, (_, i) => i).sort(() => Math.random() - 0.5);

      for (let p = 0; p < activeCount; p++) {
        distGrid[pool[p]] = true;
      }

      generatedCards.push({
        id: Math.random().toString(36).substring(2, 9),
        grid: distGrid,
        targetRef: -1,
        pixelCount: activeCount,
        isRemoved: false
      });
    }

    // Shuffle cards
    generatedCards.sort(() => Math.random() - 0.5);
    setCards(generatedCards);
    setSelectedCardIdxs([]);
    setMessage(lang === 'en' ? 'Select cards to combine and match a target digit.' : 'Pilih kartu untuk ditumpuk dan cocokkan dengan digit target.');
    setMessageType('info');
    setElapsedTime(0);
    setAttempts(0);
    setHintActive(false);
    setGameState('playing');
  }, [schoolLevel, lang]);

  // Timer
  useEffect(() => {
    let interval = null;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setElapsedTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Card click handler
  const handleCardClick = (idx) => {
    if (cards[idx].isRemoved || gameState !== 'playing') return;

    setSelectedCardIdxs(prev => {
      const exists = prev.includes(idx);
      playSound(exists ? 'deselect' : 'select');
      return exists ? prev.filter(i => i !== idx) : [...prev, idx];
    });
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        checkSelection();
      } else if (e.key === 'Escape') {
        setSelectedCardIdxs([]);
        playSound('deselect');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedCardIdxs, cards, targets, solvedTargets]);

  // Current stacked composite calculation
  const selectedGrids = selectedCardIdxs.map(i => cards[i]?.grid).filter(Boolean);
  const cellCounts = getCellCounts(selectedGrids);
  const hasOverlap = cellCounts.some(c => c > 1);
  const compositeGrid = cellCounts.map(c => c > 0);

  // Check if live preview matches any unsolved target
  const previewMatchIdx = targets.findIndex((t, idx) => {
    if (solvedTargets[idx]) return false;
    return !hasOverlap && selectedCardIdxs.length >= 2 && gridsEqual(compositeGrid, DIGIT_TEMPLATES[t]);
  });

  // Verify and claim target
  const checkSelection = () => {
    setAttempts(a => a + 1);

    if (selectedCardIdxs.length < 2) {
      triggerError(lang === 'en' ? 'Select at least 2 cards to form a digit!' : 'Pilih setidaknya 2 kartu untuk membentuk angka!');
      return;
    }

    if (hasOverlap) {
      triggerError(lang === 'en' ? 'Overlapping pixels detected! Cards must be disjoint.' : 'Ada piksel yang tumpang tindih! Kartu harus saling lepas.');
      return;
    }

    if (previewMatchIdx !== -1) {
      // SUCCESS!
      const targetDigit = targets[previewMatchIdx];
      playSound('solve');

      const nextSolved = [...solvedTargets];
      nextSolved[previewMatchIdx] = true;
      setSolvedTargets(nextSolved);

      // Remove used cards
      const nextCards = [...cards];
      selectedCardIdxs.forEach(idx => {
        nextCards[idx].isRemoved = true;
      });
      setCards(nextCards);
      setSelectedCardIdxs([]);

      setMessage(lang === 'en' ? `🎉 Perfect! You reconstructed Digit ${targetDigit}!` : `🎉 Hebat! Anda berhasil menyusun Digit ${targetDigit}!`);
      setMessageType('success');

      // Check win condition
      if (nextSolved.every(Boolean)) {
        playSound('win');
        const finalTime = elapsedTime;
        if (bestTime === null || finalTime < bestTime) {
          writeText(`pixel_best_${schoolLevel}`, finalTime.toString());
          setBestTime(finalTime);
        }
        setTimeout(() => {
          setGameState('ended');
        }, 900);
      }
    } else {
      triggerError(lang === 'en' ? 'Does not match any unsolved target digit.' : 'Belum cocok dengan digit target yang tersisa.');
    }
  };

  const triggerError = (msg) => {
    playSound('error');
    setShakePreview(true);
    setMessage(msg);
    setMessageType('error');
    setTimeout(() => setShakePreview(false), 500);
  };

  // Hint feature: highlight one card of an unsolved target
  const handleHint = () => {
    const unsolvedTargetIdx = solvedTargets.findIndex(s => !s);
    if (unsolvedTargetIdx === -1) return;

    setHintActive(true);
    setMessage(
      lang === 'en'
        ? `Hint: Glowing cards belong to target "${targets[unsolvedTargetIdx]}".`
        : `Petunjuk: Kartu yang bersinar adalah bagian dari target "${targets[unsolvedTargetIdx]}".`
    );
    setMessageType('info');
    setTimeout(() => setHintActive(false), 3500);
  };

  // Mini 3x5 Pixel Component
  const MatrixDisplay = ({
    grid,
    cellCounts = null,
    width = 44,
    isLivePreview = false,
    activeColor = 'var(--uw-primary)',
    overlapColor = '#ef4444'
  }) => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isLivePreview ? '3px' : '2px',
        width: `${width}px`,
        aspectRatio: '3 / 5',
        backgroundColor: 'var(--play-dark)',
        padding: isLivePreview ? '5px' : '3px',
        borderRadius: '6px',
        boxShadow: isLivePreview ? 'inset 0 2px 5px rgba(0,0,0,0.5), 0 0 12px rgba(15,23,42,0.2)' : 'inset 0 1px 3px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {grid.map((active, idx) => {
          const count = cellCounts ? cellCounts[idx] : 0;
          const isOverlapping = count > 1;

          let cellBg = 'rgba(255, 255, 255, 0.05)';
          if (isOverlapping) {
            cellBg = overlapColor;
          } else if (active) {
            cellBg = activeColor;
          }

          return (
            <div
              key={idx}
              style={{
                backgroundColor: cellBg,
                borderRadius: '2px',
                boxShadow: isOverlapping
                  ? '0 0 8px #ef4444'
                  : active
                    ? `0 0 ${isLivePreview ? '6px' : '2px'} ${activeColor}`
                    : 'none',
                transition: 'all 120ms ease-out',
                animation: isOverlapping ? 'pulse 0.6s infinite alternate' : 'none'
              }}
            />
          );
        })}
      </div>
    );
  };

  const t = {
    title: lang === 'en' ? 'Pixel Number Puzzle' : 'Teka-Teki Angka Piksel',
    sdDesc: lang === 'en' ? 'SD Level: 1 Target Number, 6 cards pool' : 'Level SD: 1 Digit Target, pool 6 kartu',
    smpDesc: lang === 'en' ? 'SMP Level: 2 Target Numbers, 10 cards pool' : 'Level SMP: 2 Digit Target, pool 10 kartu',
    smaDesc: lang === 'en' ? 'SMA Level: 3 Target Numbers, 12 cards pool' : 'Level SMA: 3 Digit Target, pool 12 kartu',
    univDesc: lang === 'en' ? 'Universitas Level: 3 Target Numbers, 15 cards pool (Complex splits)' : 'Level Universitas: 3 Digit Target, pool 15 kartu (Pecahan kompleks)',
    startPuzzle: lang === 'en' ? 'Start Puzzle' : 'Mulai Teka-Teki',
    targetDigits: lang === 'en' ? 'TARGET DIGITS' : 'DIGIT TARGET',
    stackArea: lang === 'en' ? 'STACKING SYNTHESIZER' : 'SINTESIS TUMPUKAN',
    activeCards: lang === 'en' ? 'Cards Selected' : 'Kartu Terpilih',
    overlapAlert: lang === 'en' ? 'OVERLAP CONFLICT!' : 'KONFLIK TUMPANG TINDIH!',
    readyToSubmit: lang === 'en' ? 'MATCH DETECTED!' : 'BENTUK COCOK!',
    pixelsActive: lang === 'en' ? 'Active Pixels' : 'Piksel Aktif',
    clear: lang === 'en' ? 'Clear' : 'Hapus Pilihan',
    hint: lang === 'en' ? 'Hint' : 'Petunjuk',
    check: lang === 'en' ? 'Check Selection' : 'Periksa Terpilih',
    resetBoard: lang === 'en' ? 'New Deal' : 'Bagi Ulang',
    puzzleSolved: lang === 'en' ? 'PUZZLE COMPLETED!' : 'TEKA-TEKI SELESAI!',
    solvedDesc: lang === 'en'
      ? `Reconstructed all target digits in ${elapsedTime}s with ${attempts} verification checks.`
      : `Berhasil merekonstruksi semua digit target dalam ${elapsedTime} detik dengan ${attempts} kali uji coba.`,
    best: lang === 'en' ? 'Best' : 'Rekor'
  };

  return (
    <GameScreen gameId="pixel" lang={lang} state={gameState} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)} stats={<><span><Icon name="clock" size={14}/>{elapsedTime}s</span>{bestTime !== null && <span><Icon name="trophy" size={14}/>{bestTime}s</span>}</>}>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        ruleList={rules}
        gameName={lang === 'en' ? 'Pixel Number' : 'Angka Piksel'}
      />



      {gameState === 'setup' ? (
        <SetupCard
          heading={lang === 'en' ? 'Choose Difficulty' : 'Pilih Tingkat Kesulitan'}
          schoolLevel={schoolLevel}
          onLevelChange={setSchoolLevel}
          desc={schoolLevel === 'sd' ? t.sdDesc : schoolLevel === 'smp' ? t.smpDesc : schoolLevel === 'sma' ? t.smaDesc : t.univDesc}
          lang={lang}
        >
          <div style={{ display: 'flex', gap: 'var(--uw-space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="uw-btn uw-btn-primary"
              onClick={() => initGame(schoolLevel)}
              style={{ padding: '12px 36px', fontSize: '1.2rem', }}
            >
              {t.startPuzzle}
            </button>
            <button
              className="uw-btn uw-btn-neutral"
              onClick={() => setShowRules(true)}
              style={{ padding: '12px 24px' }}
            >
              <Icon name="book" size={16}/>{lang === 'en' ? 'Rules' : 'Aturan'}
            </button>
            <TipsButton onClick={() => onNavigate('tips-pixel')} lang={lang} />
          </div>
        </SetupCard>
      ) : gameState === 'playing' ? (
        <div>
          {/* Targets Bar */}
          <div className="pixel-targets" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--uw-space-3)',
            backgroundColor: 'var(--play-dark)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--uw-radius-md)',
            marginBottom: 'var(--uw-space-4)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                {t.targetDigits}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {targets.map((target, idx) => {
                const isSolved = solvedTargets[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: isSolved ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${isSolved ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                      padding: '6px 14px',
                      borderRadius: '8px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <span style={{
                      fontSize: '1.7rem',
                      fontWeight: 800,
                      color: isSolved ? '#22c55e' : '#f8fafc'
                    }}>
                      {target}
                    </span>
                    <MatrixDisplay
                      grid={DIGIT_TEMPLATES[target]}
                      width={28}
                      activeColor={isSolved ? '#22c55e' : '#cbb5ff'}
                    />
                    {isSolved && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#22c55e',
                        }}>
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Stacking Synthesizer (Overlay Workbench) */}
          <div className="pixel-workbench" style={{
            backgroundColor: 'var(--uw-surface-strong)',
            border: `1.5px solid ${hasOverlap ? '#ef4444' : previewMatchIdx !== -1 ? '#22c55e' : 'var(--uw-border)'}`,
            borderRadius: 'var(--uw-radius-md)',
            padding: '14px 18px',
            marginBottom: 'var(--uw-space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: hasOverlap ? '0 0 16px rgba(239, 68, 68, 0.25)' : previewMatchIdx !== -1 ? '0 0 16px rgba(34, 197, 94, 0.25)' : 'var(--uw-shadow-sm)',
            transform: shakePreview ? 'translateX(-4px)' : 'none',
            transition: 'transform 80ms ease, border-color 0.2s, box-shadow 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <MatrixDisplay
                grid={compositeGrid}
                cellCounts={cellCounts}
                width={54}
                isLivePreview={true}
                activeColor={previewMatchIdx !== -1 ? '#22c55e' : 'var(--uw-primary)'}
                overlapColor="#ef4444"
              />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--uw-text-muted)', }}>
                  {t.stackArea}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>
                  {hasOverlap ? (
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⚠️ {t.overlapAlert}
                    </span>
                  ) : previewMatchIdx !== -1 ? (
                    <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ✨ {t.readyToSubmit} ({targets[previewMatchIdx]})
                    </span>
                  ) : (
                    <span>
                      {selectedCardIdxs.length} {t.activeCards} ({compositeGrid.filter(Boolean).length} px)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--uw-text-muted)', marginTop: '2px' }}>
                  {lang === 'en' ? 'Click cards below to add/remove from composite' : 'Klik kartu di bawah untuk menyusun atau membatalkan'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="uw-btn uw-btn-neutral"
                onClick={() => {
                  setSelectedCardIdxs([]);
                  playSound('deselect');
                }}
                disabled={selectedCardIdxs.length === 0}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                ✕ {t.clear}
              </button>
              <button
                className="uw-btn uw-btn-neutral"
                onClick={handleHint}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                💡 {t.hint}
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {message && (
            <div style={{
              padding: '10px 16px',
              borderRadius: 'var(--uw-radius-sm)',
              backgroundColor: messageType === 'success' ? '#dcfce7' : messageType === 'error' ? '#fee2e2' : 'var(--uw-surface-alt)',
              color: messageType === 'success' ? '#15803d' : messageType === 'error' ? '#b91c1c' : 'var(--uw-text)',
              border: `1px solid ${messageType === 'success' ? '#86efac' : messageType === 'error' ? '#fca5a5' : 'var(--uw-border)'}`,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: 'var(--uw-space-4)'
            }}>
              {message}
            </div>
          )}

          {/* Card Board */}
          <div className="pixel-board" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
            gap: '12px',
            backgroundColor: 'var(--uw-bg-strong)',
            padding: '16px',
            borderRadius: 'var(--uw-radius-md)',
            border: '1px solid var(--uw-border)',
            marginBottom: 'var(--uw-space-4)',
            userSelect: 'none'
          }}>
            {cards.map((card, idx) => {
              if (card.isRemoved) {
                return (
                  <div
                    key={card.id}
                    style={{
                      aspectRatio: '0.8',
                      borderRadius: '8px',
                      border: '1px dashed var(--uw-border)',
                      opacity: 0.25
                    }}
                  />
                );
              }

              const isSelected = selectedCardIdxs.includes(idx);
              const isTargetHinted = hintActive && card.targetRef !== -1 && !solvedTargets[card.targetRef];

              return (
                <div
                  key={card.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${lang === 'en' ? 'Card' : 'Kartu'} ${idx + 1}, ${card.pixelCount} ${lang === 'en' ? 'pixels' : 'piksel'}`}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault(); event.stopPropagation(); handleCardClick(idx);
                    }
                  }}
                  onClick={() => handleCardClick(idx)}
                  style={{
                    aspectRatio: '0.8',
                    backgroundColor: isSelected ? 'var(--uw-surface-strong)' : 'var(--uw-surface)',
                    border: isSelected
                      ? '2.5px solid var(--uw-primary)'
                      : isTargetHinted
                        ? '2px solid #eab308'
                        : '1px solid var(--uw-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: isSelected
                      ? '0 0 10px rgba(var(--uw-primary-rgb, 14, 165, 233), 0.35)'
                      : isTargetHinted
                        ? '0 0 12px rgba(234, 179, 8, 0.4)'
                        : 'var(--uw-shadow-sm)',
                    transition: 'all 0.12s ease-in-out',
                    transform: isSelected ? 'scale(1.04) translateY(-2px)' : 'none'
                  }}
                >
                  <MatrixDisplay
                    grid={card.grid}
                    width={46}
                    activeColor={isSelected ? '#d1b7ff' : '#aa94cd'}
                  />

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '80%',
                    marginTop: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--uw-primary)' : 'var(--uw-text-muted)'
                  }}>
                    <span>#{idx + 1}</span>
                    <span>{card.pixelCount}p</span>
                  </div>

                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: 'var(--uw-primary)',
                      color: 'white',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              className="uw-btn uw-btn-neutral"
              onClick={() => initGame(schoolLevel)}
            >
              ↻ {t.resetBoard}
            </button>

            <button
              className="uw-btn uw-btn-primary"
              onClick={checkSelection}
              disabled={selectedCardIdxs.length < 2 || hasOverlap}
              style={{
                padding: '12px 32px',
                fontSize: '1.25rem',
                opacity: (selectedCardIdxs.length < 2 || hasOverlap) ? 0.5 : 1
              }}
            >
              {t.check} ({selectedCardIdxs.length}) ↵
            </button>
          </div>
        </div>
      ) : (
        <SoloEndCard
          heading={t.puzzleSolved}
          subtext={t.solvedDesc}
          onBack={onBack}
          onPlayAgain={() => initGame(schoolLevel)}
          lang={lang}
        />
      )}
    </GameScreen>
  );
}
