import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import Dialog from './Dialog.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { gameById, resolveRoute } from '../data/games.js';

export function StatBadge({ label, value, color = 'var(--uw-primary)' }) {
  return <div className="play-stat"><span>{label}</span><strong style={{ color }}>{value}</strong></div>;
}

// Retained as a public component for older pages using GameShell.
export function GamePageHeader({ onBack, title, lang, right, subtitle, onRules, onOpenRules }) {
  return <header className="play-legacy-header"><button className="uw-btn uw-btn-neutral" onClick={onBack}><Icon name="back" size={16}/>{lang === 'en' ? 'Back' : 'Kembali'}</button><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><div>{right}{(onRules || onOpenRules) && <button className="uw-btn uw-btn-neutral" onClick={onRules || onOpenRules}><Icon name="book" size={16}/>{lang === 'en' ? 'Rules' : 'Aturan'}</button>}</div></header>;
}

export function LevelSelector({ value, onChange, lang, levels = null }) {
  const defaults = [
    { id: 'sd', en: 'SD', id_label: 'SD', desc: { id: 'Dasar', en: 'Primary' } },
    { id: 'smp', en: 'SMP', id_label: 'SMP', desc: { id: 'Menengah', en: 'Middle' } },
    { id: 'sma', en: 'SMA', id_label: 'SMA', desc: { id: 'Lanjutan', en: 'High school' } },
    { id: 'universitas', en: 'University', id_label: 'Universitas', desc: { id: 'Tantangan', en: 'Advanced' } },
  ];
  const activeLevels = Array.isArray(levels) && levels.length ? levels : defaults;
  return <div className="play-levels" role="group" aria-label={lang === 'en' ? 'Education level' : 'Jenjang pendidikan'}>
    {activeLevels.map((item, index) => <button type="button" key={item.id} aria-pressed={value === item.id} className={value === item.id ? 'selected' : ''} onClick={() => onChange(item.id)}>
      <span className="play-level-top"><span className="play-level-bars" aria-hidden="true">{[0, 1, 2, 3].map(n => <i key={n} className={n <= index ? 'filled' : ''} style={{ height: 5 + n * 3 }}/>)}</span><span className="play-level-check">{value === item.id && <Icon name="check" size={10}/>}</span></span>
      <strong>{lang === 'en' ? (item.en || item.id) : (item.id_label || item.id)}</strong>{item.desc && <small>{item.desc[lang]}</small>}
    </button>)}
  </div>;
}

export function TipsButton({ onClick, lang, label }) {
  return <button className="uw-btn uw-btn-neutral play-tips-button" onClick={onClick}><Icon name="spark" size={16}/>{label ?? (lang === 'en' ? 'Tips & tricks' : 'Tips & trik')}</button>;
}

export function UniversityDifficultySelector({ value, onChange, lang = 'id' }) {
  const levels = [
    { id:'hard', label:'Hard', note:{ id:'Sulit', en:'Hard' } },
    { id:'very-hard', label:'Very Hard', note:{ id:'Sangat sulit', en:'Very hard' } },
    { id:'impossible', label:'Impossible', note:{ id:'Mustahil', en:'Impossible' } },
  ];
  return <div className="play-university-block">
    <div className="play-university-heading"><span><Icon name="spark" size={15}/>{lang === 'en' ? 'University Arena Mode' : 'Mode Arena Universitas'}</span><small>{lang === 'en' ? 'Hard · Very Hard · Impossible' : 'Hard · Very Hard · Impossible'}</small></div>
    <div className="play-university-difficulty" role="group" aria-label={lang === 'en' ? 'University difficulty' : 'Tingkat kesulitan Universitas'}>
      {levels.map((item,index)=><button type="button" key={item.id} className={value===item.id?'selected':''} aria-pressed={value===item.id} onClick={()=>onChange(item.id)}><span>{item.label}</span><small>{item.note[lang]}</small><i aria-hidden="true" style={{ width:`${34 + index*22}%` }}/></button>)}
    </div>
  </div>;
}

export function SetupCard({ heading, schoolLevel, onLevelChange, desc, lang, children, badge, bestRecord = null }) {
  const { adaptiveForGame } = useArena();
  const gameId = typeof window !== 'undefined' ? resolveRoute(window.location.hash) : null;
  const recommendation = gameById(gameId) ? adaptiveForGame(gameId) : null;
  const showRecommendation = recommendation && recommendation.level !== schoolLevel;
  return <div className="play-setup-card">
    <div className="play-setup-heading"><span className="play-kicker">{lang === 'en' ? 'YOUR CHALLENGE, YOUR PACE' : 'TANTANGANMU, RITMEMU'}</span>{badge && <span className="play-setup-badge">{badge}</span>}<h2>{heading}</h2><p>{lang === 'en' ? 'Choose the level that suits you. Start small, go further.' : 'Pilih jenjang yang sesuai. Mulai ringan, tingkatkan perlahan.'}</p></div>
    <label className="play-field-label">{lang === 'en' ? 'Education level' : 'Jenjang pendidikan'}<span>{lang === 'en' ? '4 levels available' : '4 jenjang tersedia'}</span></label>
    <LevelSelector value={schoolLevel} onChange={onLevelChange} lang={lang}/>
    {desc && <div className="play-level-description"><span><Icon name="layers" size={18}/></span><div><strong>{lang === 'en' ? 'Your challenge' : 'Tantangan yang kamu pilih'}</strong><p>{desc}</p></div></div>}
    {showRecommendation && <div className="adaptive-suggestion"><span><Icon name="brain" size={18}/></span><div><small>{lang==='en'?'ADAPTIVE SUGGESTION':'SARAN ADAPTIF'}</small><strong>{lang==='en'?`Try ${recommendation.label.en}`:`Coba ${recommendation.label.id}`}</strong><p>{recommendation.reason[lang]}</p></div><button type="button" onClick={()=>onLevelChange(recommendation.level)}>{lang==='en'?'Use':'Pilih'}</button></div>}
    {bestRecord !== null && <StatBadge label={lang === 'en' ? 'Best record' : 'Rekor terbaik'} value={bestRecord} color="var(--uw-secondary)"/>}
    {children && <div className="play-setup-actions">{children}</div>}
    <p className="play-setup-footnote"><Icon name="check" size={13}/>{lang === 'en' ? 'No sign-up. Ready when you are.' : 'Tanpa daftar. Mulai kapan saja.'}</p>
  </div>;
}

function useCompletionReward() {
  const { recordGameCompletion } = useArena();
  const [reward, setReward] = useState(null);
  useEffect(() => {
    const gameId = resolveRoute(window.location.hash);
    if (!gameById(gameId)) return;
    setReward(recordGameCompletion(gameId));
  }, [recordGameCompletion]);
  return reward;
}

function XpRewardPanel({ reward, lang }) {
  if (!reward) return null;
  const leveledUp = reward.levelAfter > reward.levelBefore;
  const masteryUp = reward.masteryLevelAfter > reward.masteryLevelBefore;
  const seasonUp = reward.seasonLevelAfter > reward.seasonLevelBefore;
  return <div className={`play-xp-reward result-v2 ${reward.dailyCompleted ? 'daily' : ''}`} aria-live="polite">
    <div className="result-v2-head"><span className="play-xp-icon"><Icon name={leveledUp ? 'trophy' : 'spark'} size={18}/></span><div className="play-xp-copy"><small>{reward.dailyCompleted ? (lang === 'en' ? 'DAILY CHALLENGE COMPLETE' : 'DAILY CHALLENGE SELESAI') : (lang === 'en' ? 'RESULT SCREEN v2' : 'RESULT SCREEN v2')}</small><strong>+{reward.amount} XP</strong><p>{lang === 'en' ? `Base +${reward.baseXp}${reward.firstBonus ? ` · First play +${reward.firstBonus}` : ''}${reward.dailyBonus ? ` · Daily +${reward.dailyBonus}` : ''}${reward.eventBonus ? ` · Event +${reward.eventBonus}` : ''}` : `Dasar +${reward.baseXp}${reward.firstBonus ? ` · Main pertama +${reward.firstBonus}` : ''}${reward.dailyBonus ? ` · Daily +${reward.dailyBonus}` : ''}${reward.eventBonus ? ` · Event +${reward.eventBonus}` : ''}`}</p></div>{leveledUp && <span className="play-level-up">{lang === 'en' ? 'LEVEL UP' : 'NAIK LEVEL'}<b>Lv. {reward.levelAfter}</b></span>}</div>
    <div className="result-v2-grid"><div><span><Icon name="trophy" size={15}/>{lang==='en'?'Mastery':'Mastery'}</span><strong>+{reward.masteryXp || 0} MXP</strong>{masteryUp&&<small>{lang==='en'?'Mastery level up!':'Mastery naik level!'}</small>}</div><div><span><Icon name="spark" size={15}/>{lang==='en'?'Season':'Season'}</span><strong>+{reward.seasonXp || 0} SXP</strong>{seasonUp&&<small>{lang==='en'?'Season level up!':'Season naik level!'}</small>}</div><div><span><Icon name="bolt" size={15}/>{lang==='en'?'Event':'Event'}</span><strong>{reward.eventBonus ? `+${reward.eventBonus} XP` : '—'}</strong><small>{reward.eventBonus ? reward.event?.title?.[lang] : (lang==='en'?'No bonus this run':'Tidak ada bonus')}</small></div></div>
  </div>;
}

export function MultiEndCard({ winner, score1, score2, p1Label, p2Label, onBack, onPlayAgain, lang }) {
  const reward = useCompletionReward();
  const draw = winner === 'draw';
  const p1 = p1Label || (lang === 'en' ? 'Player 1' : 'Pemain 1');
  const p2 = p2Label || (lang === 'en' ? 'Player 2' : 'Pemain 2');
  const title = draw ? (lang === 'en' ? 'A well-matched duel!' : 'Pertandingan berakhir seri!') : `${winner === 1 ? p1 : p2} ${lang === 'en' ? 'wins!' : 'menang!'}`;
  return <div className="play-result"><div className="play-result-icon"><Icon name="trophy" size={30}/></div><p className="play-kicker">{lang === 'en' ? 'FINAL RESULT' : 'HASIL AKHIR'}</p><h2>{title}</h2><p>{lang === 'en' ? 'Every round is another chance to improve.' : 'Setiap ronde adalah kesempatan untuk jadi lebih baik.'}</p>
    <div className="play-result-scores">{[{ name: p1, score: score1 }, { name: p2, score: score2 }].map((p, i) => <div key={i} className={winner === i + 1 ? 'winner' : ''}><span>{p.name}{winner === i + 1 && <Icon name="trophy" size={13}/>}</span><strong>{p.score}</strong><small>{lang === 'en' ? 'points' : 'poin'}</small></div>)}</div>
    <XpRewardPanel reward={reward} lang={lang}/>
    <ResultActions onBack={onBack} onPlayAgain={onPlayAgain} lang={lang}/>
  </div>;
}

function ResultActions({ onBack, onPlayAgain, lang, label }) {
  return <div className="play-result-actions"><button className="uw-btn uw-btn-neutral" onClick={onBack}><Icon name="home" size={16}/>{lang === 'en' ? 'Back to home' : 'Ke beranda'}</button><button className="uw-btn uw-btn-primary" onClick={onPlayAgain}><Icon name="refresh" size={16}/>{label ?? (lang === 'en' ? 'Play again' : 'Main lagi')}</button></div>;
}

export function SoloEndCard({ heading, subtext, onBack, onPlayAgain, playAgainLabel, lang, stats = null, children }) {
  const reward = useCompletionReward();
  return <div className="play-result"><div className="play-result-icon"><Icon name="trophy" size={30}/></div><p className="play-kicker">{lang === 'en' ? 'CHALLENGE COMPLETE' : 'TANTANGAN SELESAI'}</p><h2>{heading}</h2>{subtext && <p>{subtext}</p>}{Array.isArray(stats) && stats.length > 0 && <div className="play-result-scores">{stats.map((stat, i) => <div key={i}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}</div>}{children}<XpRewardPanel reward={reward} lang={lang}/><ResultActions onBack={onBack} onPlayAgain={onPlayAgain} label={playAgainLabel} lang={lang}/></div>;
}

export function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, lang, isDangerous = false }) {
  return <Dialog open={isOpen} onClose={onCancel} title={title}><p className="dialog-description">{message}</p><div className="dialog-actions"><button className="ba-button outline" onClick={onCancel}>{cancelText ?? (lang === 'en' ? 'Cancel' : 'Batal')}</button><button className={`ba-button ${isDangerous ? 'danger' : 'primary'}`} onClick={onConfirm}>{confirmText ?? (lang === 'en' ? 'Confirm' : 'Konfirmasi')}</button></div></Dialog>;
}
