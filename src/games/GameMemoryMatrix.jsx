import {useUniversityGameplay} from '../hooks/useUniversityGameplay.js';
import {transformMemoryPattern} from '../utils/universityGameplay.js';
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
import { memoryRoundTarget, sampleMemoryCells } from '../utils/memoryMatrix.js';

const random=()=>sessionRandom('matrix');

const BASE_LEVELS = {
  sd: { size: 3, startTargets: 3, rounds: 5, previewMs: 2600, growth: 1, lives: 3 },
  smp: { size: 4, startTargets: 4, rounds: 6, previewMs: 2350, growth: 1, lives: 3 },
  sma: { size: 5, startTargets: 5, rounds: 7, previewMs: 2100, growth: 1, lives: 3 },
  'sma-plus': { size: 6, startTargets: 7, rounds: 8, previewMs: 1800, growth: 1, lives: 3 },
};
const UNIVERSITY_LEVELS = {
  hard: { size: 6, startTargets: 7, rounds: 7, previewMs: 1900, growth: 1, lives: 3 },
  'very-hard': { size: 7, startTargets: 9, rounds: 8, previewMs: 1650, growth: 1, lives: 3 },
  impossible: { size: 8, startTargets: 12, rounds: 9, previewMs: 1400, growth: 2, lives: 3 },
};
const UNIVERSITY_LABELS = { impossible: 'Universitas' };

export default function GameMemoryMatrix({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const copy = useCallback((id, en) => lang === 'en' ? en : id, [lang]);
  const [showRules, setShowRules] = useState(false);
  const [gameState, setGameState] = useState('setup');
  const [schoolLevel, setSchoolLevel] = useState(()=>initialGameSetting('matrix','schoolLevels','sd'));
  const [universityDifficulty, setUniversityDifficulty] = useState(()=>initialGameSetting('matrix','universityDifficulties','hard'));
  const [round, setRound] = useState(1);
  const [pattern, setPattern] = useState(() => new Set());
  const [selected, setSelected] = useState(() => new Set());
  const [wrongCells, setWrongCells] = useState(() => new Set());
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [previewRemaining, setPreviewRemaining] = useState(0);
  const [roundFeedback, setRoundFeedback] = useState('');
  const timeoutRef = useRef(null);

  const config = schoolLevel === 'universitas' ? UNIVERSITY_LEVELS[universityDifficulty] : BASE_LEVELS[schoolLevel];
  const challenge=useUniversityGameplay('matrix',schoolLevel,['start','playing'].includes(gameState)&&!roundFeedback);
  const totalCells = config.size * config.size;
  const targetCount = memoryRoundTarget(config.startTargets, round, totalCells, config.growth);


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

  const beginRound = useCallback((roundNumber) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const count = memoryRoundTarget(config.startTargets, roundNumber, totalCells, config.growth);
    setRound(roundNumber);
    setPattern(new Set(sampleMemoryCells(totalCells, count, random)));
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
    setRoundFeedback(result);
    setGameState('ended');
  }, []);

  const chooseCell = useCallback((index) => {
    if (gameState !== 'playing' || selected.has(index) || wrongCells.has(index)) return;
    const expected=transformMemoryPattern(pattern,totalCells,challenge.id);
    const nextOrdered=[...expected].sort((a,b)=>a-b).find(i=>!selected.has(i));
    if (expected.has(index)&&(challenge.id!=='ordered-recall'||index===nextOrdered)) {
      const nextSelected = new Set(selected);
      nextSelected.add(index);
      const nextScore = score + 100;
      setSelected(nextSelected);
      setScore(nextScore);
      if (nextSelected.size === expected.size) {
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
  }, [gameState, selected, wrongCells, pattern, score, round, config.rounds, lives, finish, beginRound, challenge.id, totalCells]);

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
    'Five levels: SD, SMP, SMA, SMA+, Universitas. Universitas randomly selects one of three gameplay rules on every start.',
  ] : [
    'Amati petak yang menyala pada fase menghafal. Setelah petak menghilang, bangun kembali polanya dari ingatan.',
    'Petak benar tetap terpilih dan memberi 100 poin. Petak salah mengurangi satu nyawa dan 50 poin.',
    'Kamu memiliki tiga nyawa untuk satu tantangan. Jika semua nyawa habis, permainan berakhir.',
    'Pilih semua petak target untuk lanjut. Setiap ronde menghasilkan pola acak baru yang semakin padat.',
    'Lima tingkat: SD, SMP, SMA, SMA+, Universitas. Universitas memilih satu dari tiga aturan gameplay secara acak setiap mulai.',
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
    <span><Icon name="brain" size={14}/>{selected.size}/{challenge.id==='inverse-recall'?totalCells-targetCount:targetCount}</span>
    <span><Icon name="shield" size={14}/>{'♥'.repeat(lives) || '0'}</span>
  </> : null;

  const outcomeWon = roundFeedback === 'won';
  useGameCheckpoint('matrix',{gameState,schoolLevel,universityDifficulty,round,pattern,selected,wrongCells,lives,score,previewRemaining,roundFeedback},saved=>{setGameState(saved.gameState);setSchoolLevel(saved.schoolLevel);setUniversityDifficulty(saved.universityDifficulty);setRound(saved.round);setPattern(saved.pattern);setSelected(saved.selected);setWrongCells(saved.wrongCells);setLives(saved.lives);setScore(saved.score);setPreviewRemaining(saved.previewRemaining);setRoundFeedback(saved.roundFeedback);},gameState==='playing'&&!roundFeedback&&wrongCells.size===0,gameState==='playing'&&!roundFeedback);

  return <GameScreen universityMode={challenge} gameId="matrix" lang={lang} state={gameState} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)} stats={stats}>
    {gameState === 'setup' && <SetupCard
      heading={copy('Pilih tantangan Memory Matrix', 'Choose your Memory Matrix challenge')}
      schoolLevel={schoolLevel}
      onLevelChange={setSchoolLevel}
      desc={descriptions[schoolLevel]}
      lang={lang}
      badge={`${config.size}×${config.size}${schoolLevel === 'universitas' ? ` · ${UNIVERSITY_LABELS[universityDifficulty]}` : ''}`}
    >
       
      <button className="uw-btn uw-btn-primary" onClick={startGame}><Icon name="play" size={16}/>{copy('Mulai menghafal', 'Start memorizing')}</button>
      <TipsButton lang={lang} onClick={() => onNavigate?.('tips-matrix')}/>
    </SetupCard>}

    {['start', 'playing'].includes(gameState) && <div className="memory-gameplay">
      <div className="memory-toolbar">
        <div><span className="play-kicker">{gameState === 'start' ? copy('FASE MENGHAFAL', 'MEMORIZE') : copy('BANGUN POLANYA', 'REBUILD THE PATTERN')}</span><strong>{copy('Ronde', 'Round')} {round} / {config.rounds}</strong><small>{gameState === 'start' ? copy(`Ingat ${targetCount} petak yang menyala.`, `Remember the ${targetCount} highlighted cells.`) : (challenge.id==='mirror-recall'?copy('Pilih pola setelah diputar 180°.','Select the pattern after a 180° rotation.'):challenge.id==='inverse-recall'?copy('Pilih petak yang TIDAK menyala.','Select cells that were NOT lit.'):challenge.id==='ordered-recall'?copy('Pilih target berurutan: kiri ke kanan, atas ke bawah.','Select targets in reading order.'):copy('Pilih semua petak yang tadi menyala.','Select every cell that was highlighted.'))}</small></div>
        <div className="memory-score"><span>{copy('Skor', 'Score')}</span><strong>{score.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</strong></div>
      </div>
      <div className={`memory-board-shell ${gameState === 'start' ? 'memorizing' : 'recalling'}`}>
        {gameState === 'start' && <div className="memory-countdown"><Icon name="brain" size={18}/><span>{copy('Hafalkan pola', 'Memorize the pattern')}</span><strong>{previewRemaining || 1}</strong></div>}
        <div className="memory-board" style={{ '--matrix-size': config.size }}>{cells}</div>
        {roundFeedback === 'round-win' && <div className="memory-round-success"><Icon name="check" size={22}/><strong>{copy('Ronde selesai!', 'Round complete!')}</strong></div>}
      </div>
      <div className="memory-footer"><span><Icon name="shield" size={15}/>{copy('Nyawa', 'Lives')}: <b>{'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, config.lives - lives))}</b></span><span><Icon name="matrix" size={15}/>{copy('Target jawaban', 'Recall target')}: <b>{challenge.id==='inverse-recall'?totalCells-targetCount:targetCount}</b></span><small>{copy('Petak yang benar tetap terkunci agar kamu tidak memilihnya dua kali.', 'Correct cells stay locked so you cannot select them twice.')}</small></div>
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
      ]}
    >
      <button type="button" className="ms-change-level" onClick={() => { setRoundFeedback(''); setGameState('setup'); }}>{copy('Ganti tingkat kesulitan', 'Change difficulty')}</button>
    </SoloEndCard>}

    <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameName="Memory Matrix" ruleList={rules}/>
  </GameScreen>;
}
