import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import RulesModal from '../components/RulesModal.jsx';
import { SetupCard, TipsButton, SoloEndCard, UniversityDifficultySelector } from '../components/GameShell.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { readText, writeText } from '../utils/storage.js';
import { memoryRoundTarget, sampleMemoryCells } from '../utils/memoryMatrix.js';

const BASE_LEVELS = {
  sd: { size: 3, startTargets: 3, rounds: 5, previewMs: 2600, growth: 1, lives: 3 },
  smp: { size: 4, startTargets: 4, rounds: 6, previewMs: 2350, growth: 1, lives: 3 },
  sma: { size: 5, startTargets: 5, rounds: 7, previewMs: 2100, growth: 1, lives: 3 },
};
const UNIVERSITY_LEVELS = {
  hard: { size: 6, startTargets: 7, rounds: 7, previewMs: 1900, growth: 1, lives: 3 },
  'very-hard': { size: 7, startTargets: 9, rounds: 8, previewMs: 1650, growth: 1, lives: 3 },
  impossible: { size: 8, startTargets: 12, rounds: 9, previewMs: 1400, growth: 2, lives: 3 },
};
const UNIVERSITY_LABELS = { hard: 'Hard', 'very-hard': 'Very Hard', impossible: 'Impossible' };

function difficultyKey(level, universityDifficulty) {
  return level === 'universitas' ? `${level}_${universityDifficulty}` : level;
}

export default function GameMemoryMatrix({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const copy = (id, en) => lang === 'en' ? en : id;
  const [showRules, setShowRules] = useState(false);
  const [gameState, setGameState] = useState('setup');
  const [schoolLevel, setSchoolLevel] = useState('sd');
  const [universityDifficulty, setUniversityDifficulty] = useState('hard');
  const [round, setRound] = useState(1);
  const [pattern, setPattern] = useState(() => new Set());
  const [selected, setSelected] = useState(() => new Set());
  const [wrongCells, setWrongCells] = useState(() => new Set());
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [previewRemaining, setPreviewRemaining] = useState(0);
  const [roundFeedback, setRoundFeedback] = useState('');
  const timeoutRef = useRef(null);

  const config = schoolLevel === 'universitas' ? UNIVERSITY_LEVELS[universityDifficulty] : BASE_LEVELS[schoolLevel];
  const totalCells = config.size * config.size;
  const targetCount = memoryRoundTarget(config.startTargets, round, totalCells, config.growth);
  const recordKey = `matrix_best_${difficultyKey(schoolLevel, universityDifficulty)}`;

  useEffect(() => {
    const raw = readText(recordKey);
    const value = Number(raw);
    setBestScore(raw !== null && Number.isFinite(value) && value >= 0 ? value : 0);
  }, [recordKey]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (gameState !== 'start') return undefined;
    setPreviewRemaining(Math.ceil(config.previewMs / 1000));
    const interval = setInterval(() => setPreviewRemaining(value => Math.max(1, value - 1)), 1000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPreviewRemaining(0);
      setGameState('playing');
    }, config.previewMs);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [gameState, config.previewMs, round, pattern]);

  const saveBest = useCallback((value) => {
    const raw = readText(recordKey);
    const previous = raw === null ? 0 : Number(raw);
    if (!Number.isFinite(previous) || value > previous) {
      writeText(recordKey, value);
      setBestScore(value);
    }
  }, [recordKey]);

  const beginRound = useCallback((roundNumber) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const count = memoryRoundTarget(config.startTargets, roundNumber, totalCells, config.growth);
    setRound(roundNumber);
    setPattern(new Set(sampleMemoryCells(totalCells, count)));
    setSelected(new Set());
    setWrongCells(new Set());
    setRoundFeedback('');
    setGameState('start');
  }, [config.startTargets, config.growth, totalCells]);

  const startGame = useCallback(() => {
    setLives(config.lives);
    setScore(0);
    beginRound(1);
  }, [config.lives, beginRound]);

  const finish = useCallback((result, finalScore) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setScore(finalScore);
    saveBest(finalScore);
    setRoundFeedback(result);
    setGameState('ended');
  }, [saveBest]);

  const chooseCell = useCallback((index) => {
    if (gameState !== 'playing' || selected.has(index) || wrongCells.has(index)) return;
    if (pattern.has(index)) {
      const nextSelected = new Set(selected);
      nextSelected.add(index);
      const nextScore = score + 100;
      setSelected(nextSelected);
      setScore(nextScore);
      if (nextSelected.size === pattern.size) {
        const roundBonus = round * 50;
        const completedScore = nextScore + roundBonus;
        setScore(completedScore);
        setRoundFeedback('round-win');
        if (round >= config.rounds) {
          timeoutRef.current = setTimeout(() => finish('won', completedScore + lives * 100), 650);
        } else {
          timeoutRef.current = setTimeout(() => beginRound(round + 1), 650);
        }
      }
      return;
    }
    const nextWrong = new Set(wrongCells);
    nextWrong.add(index);
    setWrongCells(nextWrong);
    const nextLives = lives - 1;
    const nextScore = Math.max(0, score - 50);
    setLives(nextLives);
    setScore(nextScore);
    if (nextLives <= 0) setRoundFeedback('lost-pending');
    timeoutRef.current = setTimeout(() => {
      setWrongCells(previous => {
        const next = new Set(previous);
        next.delete(index);
        return next;
      });
      if (nextLives <= 0) finish('lost', nextScore);
    }, 430);
  }, [gameState, selected, wrongCells, pattern, score, round, config.rounds, lives, finish, beginRound]);

  const descriptions = {
    sd: copy('3×3 · 5 ronde · Pola kecil dengan waktu hafalan paling longgar.', '3×3 · 5 rounds · Small patterns with the most generous preview time.'),
    smp: copy('4×4 · 6 ronde · Pola bertambah satu petak setiap ronde.', '4×4 · 6 rounds · The pattern grows by one cell each round.'),
    sma: copy('5×5 · 7 ronde · Area lebih luas dengan waktu hafalan lebih singkat.', '5×5 · 7 rounds · A larger field with shorter preview time.'),
    universitas: copy(`${config.size}×${config.size} · ${UNIVERSITY_LABELS[universityDifficulty]} · ${config.rounds} ronde dengan pola semakin padat.`, `${config.size}×${config.size} · ${UNIVERSITY_LABELS[universityDifficulty]} · ${config.rounds} rounds with increasingly dense patterns.`),
  };

  const rules = lang === 'en' ? [
    'Watch the highlighted cells during the memorize phase. When they disappear, rebuild the pattern from memory.',
    'Correct cells stay selected and award 100 points. A wrong cell costs one life and 50 points.',
    'You have three lives for the entire challenge. Lose all lives and the run ends.',
    'Complete every target cell to advance. Every round generates a new random pattern that becomes denser over time.',
    'University Arena Mode adds Hard, Very Hard, and Impossible with larger matrices, shorter previews, and denser patterns.',
    'Your highest score is saved locally for every level and University difficulty.',
  ] : [
    'Amati petak yang menyala pada fase menghafal. Setelah petak menghilang, bangun kembali polanya dari ingatan.',
    'Petak benar tetap terpilih dan memberi 100 poin. Petak salah mengurangi satu nyawa dan 50 poin.',
    'Kamu memiliki tiga nyawa untuk satu tantangan. Jika semua nyawa habis, permainan berakhir.',
    'Pilih semua petak target untuk lanjut. Setiap ronde menghasilkan pola acak baru yang semakin padat.',
    'Mode Arena Universitas memiliki Hard, Very Hard, dan Impossible dengan matriks lebih besar, waktu hafalan lebih singkat, dan pola lebih padat.',
    'Skor tertinggi disimpan lokal untuk setiap jenjang dan tingkat Universitas.',
  ];

  const cells = useMemo(() => Array.from({ length: totalCells }, (_, index) => {
    const reveal = gameState === 'start' && pattern.has(index);
    const chosen = selected.has(index);
    const wrong = wrongCells.has(index);
    return <button
      type="button"
      key={index}
      data-matrix-cell="true"
      className={`memory-cell ${reveal ? 'memory-on' : ''} ${chosen ? 'chosen' : ''} ${wrong ? 'wrong' : ''}`}
      onClick={() => chooseCell(index)}
      disabled={gameState !== 'playing' || Boolean(roundFeedback)}
      aria-label={copy(`Petak ${index + 1}`, `Cell ${index + 1}`)}
      aria-pressed={chosen}
    ><span/></button>;
  }), [totalCells, gameState, pattern, selected, wrongCells, roundFeedback, chooseCell, copy]);

  const stats = ['start', 'playing'].includes(gameState) ? <>
    <span><Icon name="matrix" size={14}/>{copy('Ronde', 'Round')} {round}/{config.rounds}</span>
    <span><Icon name="brain" size={14}/>{selected.size}/{targetCount}</span>
    <span><Icon name="shield" size={14}/>{'♥'.repeat(lives) || '0'}</span>
  </> : null;

  const outcomeWon = roundFeedback === 'won';
  return <GameScreen gameId="matrix" lang={lang} state={gameState} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)} stats={stats}>
    {gameState === 'setup' && <SetupCard
      heading={copy('Pilih tantangan Memory Matrix', 'Choose your Memory Matrix challenge')}
      schoolLevel={schoolLevel}
      onLevelChange={setSchoolLevel}
      desc={descriptions[schoolLevel]}
      lang={lang}
      badge={`${config.size}×${config.size}${schoolLevel === 'universitas' ? ` · ${UNIVERSITY_LABELS[universityDifficulty]}` : ''}`}
      bestRecord={bestScore > 0 ? `${bestScore.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} ${copy('poin', 'pts')}` : null}
    >
      {schoolLevel === 'universitas' && <UniversityDifficultySelector value={universityDifficulty} onChange={setUniversityDifficulty} lang={lang}/>} 
      <button className="uw-btn uw-btn-primary" onClick={startGame}><Icon name="play" size={16}/>{copy('Mulai menghafal', 'Start memorizing')}</button>
      <TipsButton lang={lang} onClick={() => onNavigate?.('tips-matrix')}/>
    </SetupCard>}

    {['start', 'playing'].includes(gameState) && <div className="memory-gameplay">
      <div className="memory-toolbar">
        <div><span className="play-kicker">{gameState === 'start' ? copy('FASE MENGHAFAL', 'MEMORIZE') : copy('BANGUN POLANYA', 'REBUILD THE PATTERN')}</span><strong>{copy('Ronde', 'Round')} {round} / {config.rounds}</strong><small>{gameState === 'start' ? copy(`Ingat ${targetCount} petak yang menyala.`, `Remember the ${targetCount} highlighted cells.`) : copy('Pilih semua petak yang tadi menyala.', 'Select every cell that was highlighted.')}</small></div>
        <div className="memory-score"><span>{copy('Skor', 'Score')}</span><strong>{score.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</strong></div>
      </div>
      <div className={`memory-board-shell ${gameState === 'start' ? 'memorizing' : 'recalling'}`}>
        {gameState === 'start' && <div className="memory-countdown"><Icon name="brain" size={18}/><span>{copy('Hafalkan pola', 'Memorize the pattern')}</span><strong>{previewRemaining || 1}</strong></div>}
        <div className="memory-board" style={{ '--matrix-size': config.size }}>{cells}</div>
        {roundFeedback === 'round-win' && <div className="memory-round-success"><Icon name="check" size={22}/><strong>{copy('Ronde selesai!', 'Round complete!')}</strong></div>}
      </div>
      <div className="memory-footer"><span><Icon name="shield" size={15}/>{copy('Nyawa', 'Lives')}: <b>{'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, config.lives - lives))}</b></span><span><Icon name="matrix" size={15}/>{copy('Target ronde', 'Round target')}: <b>{targetCount}</b></span><small>{copy('Petak yang benar tetap terkunci agar kamu tidak memilihnya dua kali.', 'Correct cells stay locked so you cannot select them twice.')}</small></div>
    </div>}

    {gameState === 'ended' && <SoloEndCard
      heading={outcomeWon ? copy('Ingatanmu menaklukkan semua ronde!', 'You cleared every memory round!') : copy('Nyawamu habis.', 'You ran out of lives.')}
      subtext={outcomeWon ? copy('Pola berhasil kamu bangun sampai ronde terakhir.', 'You rebuilt every pattern through the final round.') : copy('Coba lagi dan pecah pola menjadi kelompok-kelompok kecil saat menghafal.', 'Try again and chunk the pattern into smaller groups while memorizing.')}
      onBack={onBack}
      onPlayAgain={startGame}
      lang={lang}
      outcome={outcomeWon ? 'completed' : 'loss'}
      stats={[
        { label: copy('Skor', 'Score'), value: score.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US') },
        { label: copy('Ronde', 'Round'), value: `${Math.min(round, config.rounds)}/${config.rounds}` },
        { label: copy('Sisa nyawa', 'Lives left'), value: lives },
        { label: copy('Rekor', 'Best'), value: Math.max(bestScore, score).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US') },
      ]}
    >
      <button type="button" className="ms-change-level" onClick={() => { setRoundFeedback(''); setGameState('setup'); }}>{copy('Ganti tingkat kesulitan', 'Change difficulty')}</button>
    </SoloEndCard>}

    <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameName="Memory Matrix" ruleList={rules}/>
  </GameScreen>;
}
