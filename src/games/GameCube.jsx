import {useUniversityGameplay,useUniversityEvent} from '../hooks/useUniversityGameplay.js';
import {rotateSquare90} from '../utils/universityGameplay.js';
import { sessionRandom } from '../utils/competitive.js';
import { gameTimeout as setTimeout } from '../utils/sessionClock.js';
import { gameInterval as setInterval } from '../utils/sessionClock.js';
import { useGameCheckpoint } from '../hooks/useGameCheckpoint.js';
import { cubeResult, initialGameSetting } from '../utils/sessionRules.js';
import { SetupCard, TipsButton, SoloEndCard } from '../components/GameShell.jsx';
import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import RulesModal from '../components/RulesModal';
import { useLanguage } from '../context/LanguageContext';

// ─── Grid & Level Configuration ──────────────────────────────
const random=()=>sessionRandom('cube');

const GRID_CONFIG = {
  sd:  { size: 3, maxH: 2, minCubes: 4,  seconds: 40, label: 'SD' },
  smp: { size: 4, maxH: 3, minCubes: 8,  seconds: 40, label: 'SMP' },
  sma: { size: 5, maxH: 4, minCubes: 12, seconds: 38, label: 'SMA' },
  'sma-plus': { size: 5, maxH: 5, minCubes: 20, seconds: 30, label: 'SMA+' },
};
const UNIVERSITY_CONFIG = {
  hard: { size: 5, maxH: 5, minCubes: 16, seconds: 34 },
  'very-hard': { size: 6, maxH: 6, minCubes: 28, seconds: 28 },
  impossible: { size: 7, maxH: 7, minCubes: 42, seconds: 22 },
};
const UNIVERSITY_LABELS = { impossible: 'Universitas' };

// SVG isometric config per grid size
const SVG_CONFIG = {
  3: { S: 46, yStep: 26.5, H: 53.0, baseY: 280, cx: 250 },
  4: { S: 37, yStep: 21.3, H: 42.6, baseY: 275, cx: 250 },
  5: { S: 30, yStep: 17.3, H: 34.6, baseY: 265, cx: 250 },
  6: { S: 25, yStep: 14.4, H: 28.8, baseY: 250, cx: 250 },
  7: { S: 21, yStep: 12.1, H: 24.2, baseY: 242, cx: 250 },
};

// ─── Generator Ketinggian yang Logis & Menantang ───────────────
// Menjamin tumpukan valid secara fisik (berdiri di lantai), tidak mengambang,
// serta tidak menghasilkan tumpukan kosong atau terlalu sedikit kubus.
function generateHeights(level, size, maxH, minTarget) {
  let grid = new Array(size * size).fill(0);
  let attempts = 0;

  // Level 1: Lebih teratur & sedikit kubus
  // Level 5: Sangat padat dengan kontur bertingkat
  const densityFactors = [0.45, 0.58, 0.70, 0.82, 0.94];
  const factor = densityFactors[level - 1] ?? 0.65;

  while (attempts < 50) {
    grid.fill(0);
    // Tentukan titik puncak (bisa di sudut (0,0) atau menyebar di baris/kolom belakang)
    const peakR = random() < 0.75 ? 0 : Math.min(size - 2, 1);
    const peakC = random() < 0.75 ? 0 : Math.min(size - 2, 1);
    grid[peakR * size + peakC] = maxH;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (r === peakR && c === peakC) continue;

        // Mendukung aturan psikotes TPA: kubus belakang lebih tinggi / sama,
        // sehingga seluruh tumpukan terhitung logis dan tidak ada ruang hampa gaib.
        const leftH  = c > 0 ? grid[r * size + (c - 1)] : maxH;
        const aboveH = r > 0 ? grid[(r - 1) * size + c] : maxH;
        const cap = Math.min(leftH, aboveH);

        if (cap === 0) {
          grid[r * size + c] = 0;
          continue;
        }

        const drop = random() > factor ? Math.floor(random() * 2) + 1 : 0;
        grid[r * size + c] = Math.max(0, cap - drop);
      }
    }

    const total = grid.reduce((a, b) => a + b, 0);
    if (total >= minTarget) break;
    attempts++;
  }

  return grid;
}

function randomizeHeightOrientation(values, size) {
  let grid = [...values];
  const rotate = source => Array.from({ length: size * size }, (_, index) => {
    const r = Math.floor(index / size), c = index % size;
    return source[(size - 1 - c) * size + r];
  });
  const turns = Math.floor(random() * 4);
  for (let i = 0; i < turns; i += 1) grid = rotate(grid);
  if (random() < 0.5) {
    grid = Array.from({ length: size * size }, (_, index) => {
      const r = Math.floor(index / size), c = index % size;
      return grid[r * size + (size - 1 - c)];
    });
  }
  return grid;
}

// ─── Painter's Algorithm: Urutan Render Belakang -> Depan ──────
function buildCubeList(heights, size) {
  const cubes = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const h = heights[r * size + c] || 0;
      for (let layer = 1; layer <= h; layer++) {
        cubes.push({ row: r, col: c, h: layer });
      }
    }
  }

  // Sort dari koordinat terkecil (paling jauh) ke terbesar (paling dekat dengan kamera)
  // Layer bawah (h=1) digambar lebih dulu dibanding layer atas
  cubes.sort((a, b) => {
    const depthDiff = (a.row + a.col) - (b.row + b.col);
    if (depthDiff !== 0) return depthDiff;
    return a.h - b.h;
  });

  return cubes;
}

// ─── Komponen Kubus Isometrik dengan Shading & Highlight ─────
function IsoCube({ row, col, h, S, yStep, H, cx, baseY }) {
  const tx = cx + (col - row) * S;
  const ty = baseY + (col + row) * yStep - (h - 1) * H; // h-1 agar lantai berada tepat di baseY
  const d2y = 2 * yStep;

  // Poligon 3 Sisi Kubus Isometrik
  const top   = `0,${-H} ${S},${yStep - H} 0,${d2y - H} ${-S},${yStep - H}`;
  const left  = `${-S},${yStep - H} 0,${d2y - H} 0,${d2y} ${-S},${yStep}`;
  const right = `0,${d2y - H} ${S},${yStep - H} ${S},${yStep} 0,${d2y}`;

  return (
    <g data-cube-voxel="true" transform={`translate(${tx},${ty})`} style={{ pointerEvents: 'none' }}>
      {/* Sisi Kiri (Shadow sedang) */}
      <polygon
        points={left}
        fill="#ac8fe9"
        stroke="#715293"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Sisi Kanan (Shadow gelap) */}
      <polygon
        points={right}
        fill="#7954c0"
        stroke="#715293"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Sisi Atas (Paling terang) */}
      <polygon
        points={top}
        fill="#e2d5ff"
        stroke="#715293"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Inner highlight pada sisi atas untuk efek 3D realistis */}
      <polyline
        points={`${-S + 3},${yStep - H} 0,${-H + 2} ${S - 3},${yStep - H}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </g>
  );
}

// ─── Lantai Dasar Kisi-kisi Isometrik (Grid Plate) ──────────
function IsoGroundGrid({ size, S, yStep, cx, baseY }) {
  const tiles = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const tx = cx + (c - r) * S;
      const ty = baseY + (c + r) * yStep;
      const d2y = 2 * yStep;
      const pts = `0,0 ${S},${yStep} 0,${d2y} ${-S},${yStep}`;
      tiles.push(
        <polygon
          key={`tile_${r}_${c}`}
          points={pts}
          transform={`translate(${tx},${ty})`}
          fill="rgba(0, 0, 0, 0.08)"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="0.8"
        />
      );
    }
  }
  return <g>{tiles}</g>;
}

export default function GameCube({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const [showRules, setShowRules] = useState(false);
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'ended'
  const [schoolLevel, setSchoolLevel] = useState(()=>initialGameSetting('cube','schoolLevels','sma'));
  const [universityDifficulty, setUniversityDifficulty] = useState(()=>initialGameSetting('cube','universityDifficulties','hard'));

  const [level, setLevel] = useState(1);
  const [heights, setHeights] = useState([]);
  const [gridSize, setGridSize] = useState(5);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timer, setTimer] = useState(40);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [history, setHistory] = useState([]); // Ringkasan per level

  const challenge=useUniversityGameplay('cube',schoolLevel,gameState==='playing'&&feedback===null&&isTimerActive);
  const stackVisible=challenge.id!=='memory-stack'||timer>16||feedback!==null;
  useUniversityEvent(challenge,'turning-stack',5,gameState==='playing'&&feedback===null,()=>setHeights(old=>rotateSquare90(old,gridSize)));
  const inputRef = useRef(null);
  const actionTimeoutRef = useRef(null);

  const totalCubes = heights.reduce((s, h) => s + h, 0);

  const rules = lang === 'en' ? [
    'A 3D stack of cubes is displayed on an isometric grid.',
    'Hidden cubes exist underneath visible ones to support them (no cubes float).',
    'Calculate the total count of cubes and enter your answer.',
    'Five levels: SD, SMP, SMA, SMA+, Universitas. Universitas randomly selects one of three gameplay rules on every start.',
    'If wrong or time expires, the correct answer is revealed before moving to the next level.',
    'Complete all 5 levels to see your final spatial reasoning score.',
  ] : [
    'Tumpukan kubus 3D ditampilkan di atas bidang isometris.',
    'Semua kubus bertumpu di lantai atau di atas kubus lain (tidak ada kubus melayang).',
    'Hitung total seluruh kubus (termasuk yang tertutup di bawahnya) dan kirim jawabanmu.',
    'Lima tingkat: SD, SMP, SMA, SMA+, Universitas. Universitas memilih satu dari tiga aturan gameplay secara acak setiap mulai.',
    'Jika salah atau waktu habis, kunci jawaban akan ditampilkan sebelum lanjut.',
    'Selesaikan 5 level tantangan untuk melihat hasil evaluasi spasialmu.',
  ];

  // Membersihkan timer timeout jika unmount
  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    };
  }, []);

  const loadLevel = useCallback((lvl, schLvl, arenaDifficulty = universityDifficulty) => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    const cfg = schLvl === 'universitas' ? UNIVERSITY_CONFIG[arenaDifficulty] : GRID_CONFIG[schLvl];
    const minTarget = cfg.minCubes + (lvl - 1) * (schLvl === 'universitas' ? 3 : 2);
    const newHeights = randomizeHeightOrientation(generateHeights(lvl, cfg.size, cfg.maxH, minTarget), cfg.size);

    setHeights(newHeights);
    setGridSize(cfg.size);
    setAnswerInput('');
    setFeedback(null);
    setRevealedAnswer(null);
    setTimer(cfg.seconds);
    setIsTimerActive(true);

    // Auto-focus input pada setiap level baru
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [universityDifficulty]);

  // Interval Countdown
  useEffect(() => {
    if (!isTimerActive || gameState !== 'playing') return;
    if (timer <= 0) return;

    const intervalId = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerActive, timer, gameState]);

  const advance = useCallback((wasCorrect, currentTotal) => {
    if(!wasCorrect&&challenge.id==='perfect-count'){challenge.fail({id:'Jawaban salah atau waktu habis pada variasi Hitungan Sempurna.',en:'A wrong answer or timeout ended Perfect Count.'});return;}
    setHistory(prev => [...prev, { level, total: currentTotal, isCorrect: wasCorrect }]);
    if (wasCorrect) setCorrectAnswers(c => c + 1);

    const next = level + 1;
    if (next > 5) {
      setIsTimerActive(false);
      setGameState('ended');
    } else {
      setLevel(next);
      loadLevel(next, schoolLevel, universityDifficulty);
    }
  }, [level, schoolLevel, universityDifficulty, loadLevel,challenge]);

  // Timeout handler jika waktu habis
  useEffect(() => {
    if (timer === 0 && isTimerActive && gameState === 'playing') {
      setIsTimerActive(false);
      if(challenge.id==='perfect-count'){challenge.fail({id:'Waktu menghitung kubus habis.',en:'The counting timer expired.'});return;}
      setFeedback('wrong');
      setRevealedAnswer(totalCubes);
      actionTimeoutRef.current = setTimeout(() => {
        advance(false, totalCubes);
      }, 2000);
    }
  }, [timer, isTimerActive, gameState, totalCubes, advance,challenge]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (feedback !== null || answerInput.trim() === '') return;

    setIsTimerActive(false);
    const guess = parseInt(answerInput, 10);
    const isCorrect = guess === totalCubes;

    if (isCorrect) {
      setFeedback('correct');
      actionTimeoutRef.current = setTimeout(() => {
        advance(true, totalCubes);
      }, 1200);
    } else {
      if(challenge.id==='perfect-count'){challenge.fail({id:'Hitungan kubus belum tepat.',en:'The cube count was incorrect.'});return;}
      setFeedback('wrong');
      setRevealedAnswer(totalCubes);
      actionTimeoutRef.current = setTimeout(() => {
        advance(false, totalCubes);
      }, 2200);
    }
  };

  const startGame = () => {
    setLevel(1);
    setCorrectAnswers(0);
    setHistory([]);
    setGameState('playing');
    loadLevel(1, schoolLevel, universityDifficulty);
  };

  const cfg = SVG_CONFIG[gridSize] || SVG_CONFIG[5];
  const cubes = heights.length > 0 ? buildCubeList(heights, gridSize) : [];

  const SCHOOL_DESCS = {
    sd:          lang === 'en' ? 'Grid 3×3 · Height 1–2 · Foundational spatial' : 'Grid 3×3 · Tinggi 1–2 · Pemahaman dasar spasial',
    smp:         lang === 'en' ? 'Grid 4×4 · Height 1–3 · Moderate occlusion' : 'Grid 4×4 · Tinggi 1–3 · Penumpukan sedang',
    sma:         lang === 'en' ? 'Grid 5×5 · Height 1–4 · Competitive TPA standard' : 'Grid 5×5 · Tinggi 1–4 · Standar tes TPA/BUMN',
    universitas: lang === 'en' ? `Universitas · ${UNIVERSITY_LABELS[universityDifficulty]} · Grid ${UNIVERSITY_CONFIG[universityDifficulty].size}×${UNIVERSITY_CONFIG[universityDifficulty].size} · Height 1–${UNIVERSITY_CONFIG[universityDifficulty].maxH}` : `Universitas · ${UNIVERSITY_LABELS[universityDifficulty]} · Grid ${UNIVERSITY_CONFIG[universityDifficulty].size}×${UNIVERSITY_CONFIG[universityDifficulty].size} · Tinggi 1–${UNIVERSITY_CONFIG[universityDifficulty].maxH}`, 
  };

  const scoreLabel = (n) => {
    if (n === 5) return lang === 'en' ? 'Master of Spatial Perception!' : 'Penguasaan Spasial Sempurna!';
    if (n >= 4) return lang === 'en' ? 'Excellent Visualisation' : 'Daya Spasial Sangat Baik';
    if (n >= 3) return lang === 'en' ? 'Solid Capability' : 'Cukup Baik & Teliti';
    if (n >= 2) return lang === 'en' ? 'Need More Practice' : 'Perlu Latihan Ketelitian';
    return lang === 'en' ? 'Keep Training!' : 'Jangan Menyerah, Coba Lagi!';
  };

  useGameCheckpoint('cube',{gameState,schoolLevel,universityDifficulty,level,heights,gridSize,answerInput,feedback,revealedAnswer,correctAnswers,timer,isTimerActive,history},saved=>{setGameState(saved.gameState);setSchoolLevel(saved.schoolLevel);setUniversityDifficulty(saved.universityDifficulty);setLevel(saved.level);setHeights(saved.heights);setGridSize(saved.gridSize);setAnswerInput(saved.answerInput);setFeedback(saved.feedback);setRevealedAnswer(saved.revealedAnswer);setCorrectAnswers(saved.correctAnswers);setTimer(saved.timer);setIsTimerActive(saved.isTimerActive);setHistory(saved.history);},gameState==='playing'&&feedback===null&&timer>0,gameState==='playing'&&isTimerActive&&feedback===null&&timer>0);

  return (
    <GameScreen universityMode={challenge} gameId="cube" lang={lang} state={gameState} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)}>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        ruleList={rules}
        gameName={lang === 'en' ? 'Cube Count Test' : 'Tes Hitung Kubus'}
      />

      {gameState === 'setup' && (
        <SetupCard
          heading={lang === 'en' ? 'Set your perspective' : 'Siap melihat lebih jeli?'}
          schoolLevel={schoolLevel}
          onLevelChange={setSchoolLevel}
          desc={`${SCHOOL_DESCS[schoolLevel]} · ${lang==='en'?'Pass: at least 3/5 correct':'Lulus: minimal 3/5 benar'}`}
          lang={lang}
        >
          
          <button className="uw-btn uw-btn-primary" onClick={startGame}><Icon name="play" size={17}/>{lang === 'en' ? 'Start challenge' : 'Mulai Tes'}</button>
          {onNavigate && <TipsButton onClick={() => onNavigate('tips-cube')} lang={lang}/>}
        </SetupCard>
      )}

      {gameState === 'playing' && (
        <div className="cube-play-panel" style={{
          backgroundColor: 'var(--uw-surface-strong)',
          border: '1px solid var(--uw-border)',
          borderRadius: 'var(--uw-radius-md)',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
        }}>
          {/* Top Bar Info */}
          <div className="cube-status-bar" style={{
            backgroundColor: 'var(--uw-primary)',
            padding: '12px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            {/* Indikator Level Dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{
                  width: '9px', height: '9px', borderRadius: '50%',
                  backgroundColor: n < level
                    ? '#34d399'
                    : n === level ? '#ffffff' : 'rgba(255,255,255,0.2)',
                  transition: 'background-color 300ms',
                }} />
              ))}
            </div>

            <span style={{
              fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)',
              }}>
              {lang === 'en' ? `LEVEL ${level} OF 5` : `LEVEL ${level} DARI 5`}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.75)', }}>
                {lang === 'en' ? 'SCORE' : 'SKOR'} {correctAnswers}/5
              </span>
              <span style={{
                fontSize: '1.3rem', color: timer <= 10 ? '#fca5a5' : '#ffffff',
                transition: 'color 0.2s', minWidth: '38px', textAlign: 'right',
              }}>
                {timer}s
              </span>
            </div>
          </div>

          {/* Bar Countdown Timer */}
          <div style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <div style={{
              height: '100%',
              width: `${(timer / 40) * 100}%`,
              backgroundColor: timer <= 10 ? '#ef4444' : 'var(--uw-secondary, #10b981)',
              transition: 'width 1s linear, background-color 0.3s ease',
            }} />
          </div>

          {/* Banner Feedback Benar / Salah */}
          {feedback && (
            <div style={{
              padding: '12px 20px',
              backgroundColor: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
              borderBottom: `2px solid ${feedback === 'correct' ? '#16a34a' : '#dc2626'}`,
              textAlign: 'center',
              fontSize: '1.2rem', color: feedback === 'correct' ? '#15803d' : '#b91c1c',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              {feedback === 'correct'
                ? (lang === 'en' ? '✓ CORRECT! (+1 POINT)' : '✓ JAWABAN BENAR! (+1 POIN)')
                : (lang === 'en'
                  ? `✕ WRONG! THE CORRECT ANSWER WAS ${revealedAnswer}`
                  : `✕ KURANG TEPAT! JUMLAH SEBENARNYA ADALAH ${revealedAnswer}`)}
            </div>
          )}

          {/* Area Render 3D SVG Isometrik */}
          <div style={{
            background: 'radial-gradient(ellipse at 50% 55%, var(--uw-surface, #ffffff) 20%, var(--uw-bg, #f1f5f9) 100%)',
            padding: '10px 0',
            position: 'relative',
            userSelect: 'none'
          }}>
            {!stackVisible&&<p className="university-hidden-panel">{lang==='id'?'Susunan disembunyikan. Jawab dari ingatan.':'Stack hidden. Answer from memory.'}</p>}
            <svg
              aria-hidden={!stackVisible}
              viewBox="0 0 500 450"
              style={{
                width: '100%',
                maxHeight: '420px',
                display: stackVisible?'block':'none',
                filter: 'drop-shadow(0 14px 18px rgba(0, 0, 0, 0.12))'
              }}
            >
              {/* Lantai Kisi-kisi Isometrik */}
              <IsoGroundGrid
                size={gridSize}
                S={cfg.S}
                yStep={cfg.yStep}
                cx={cfg.cx}
                baseY={cfg.baseY}
              />

              {/* Tumpukan Kubus */}
              {(stackVisible?cubes:[]).map(cube => (
                <IsoCube
                  key={`c_${cube.row}_${cube.col}_${cube.h}`}
                  row={cube.row}
                  col={cube.col}
                  h={cube.h}
                  S={cfg.S}
                  yStep={cfg.yStep}
                  H={cfg.H}
                  cx={cfg.cx}
                  baseY={cfg.baseY}
                />
              ))}
            </svg>
          </div>

          {/* Form Input Jawaban */}
          <form
            className="cube-answer-form"
            onSubmit={handleSubmit}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 20px',
              borderTop: '1px solid var(--uw-border)',
              backgroundColor: 'var(--uw-surface-strong)'
            }}
          >
            <input
              ref={inputRef}
              type="number"
              min="1"
              max="200"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={lang === 'en' ? 'Enter total cubes...' : 'Masukkan jumlah kubus...'}
              value={answerInput}
              onChange={e => setAnswerInput(e.target.value.replace(/[^0-9]/g, ''))}
              disabled={feedback !== null}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '1.3rem',
                textAlign: 'center',
                border: '2px solid var(--uw-border)',
                borderRadius: 'var(--uw-radius-sm)',
                backgroundColor: feedback !== null ? 'var(--uw-bg)' : '#ffffff',
                outline: 'none',
                color: 'var(--uw-text)',
                transition: 'border-color 0.2s',
              }}
            />
            <button
              type="submit"
              className="uw-btn uw-btn-primary"
              disabled={feedback !== null || answerInput === ''}
              style={{
                padding: '12px 32px',
                fontSize: '1.15rem', opacity: (feedback !== null || answerInput === '') ? 0.5 : 1,
                cursor: (feedback !== null || answerInput === '') ? 'not-allowed' : 'pointer'
              }}
            >
              {lang === 'en' ? 'Submit' : 'Kirim'}
            </button>
          </form>
        </div>
      )}

      {/* ══════════════ ENDED ══════════════ */}
      {gameState === 'ended' && (
        <SoloEndCard heading={scoreLabel(correctAnswers)} outcome={cubeResult(correctAnswers).outcome} result={cubeResult(correctAnswers)}
          subtext={lang === 'en' ? 'Five levels finished. At least 3 of 5 correct answers are required to pass. Review your results below.' : 'Lima level selesai. Minimal 3 dari 5 jawaban benar untuk lulus. Lihat hasilmu di bawah.'}
          stats={[{ label: lang === 'en' ? 'Correct answers' : 'Jawaban benar', value: `${correctAnswers}/5` }]}
          lang={lang} onBack={onBack} onPlayAgain={startGame}>
          <div className="cube-result-breakdown">{history.map((item, index) => <div key={index} className={item.isCorrect ? 'correct' : 'incorrect'}><small>{lang === 'en' ? 'Level' : 'Level'} {item.level}</small><Icon name={item.isCorrect ? 'check' : 'close'} size={18}/><span>{item.total} {lang === 'en' ? 'cubes' : 'kubus'}</span></div>)}</div>
        </SoloEndCard>
      )}

    </GameScreen>
  );
}
