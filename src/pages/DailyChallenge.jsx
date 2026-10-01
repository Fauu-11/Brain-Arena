import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { gameById } from '../data/games.js';
import Icon from '../components/Icon.jsx';
import Artwork from '../components/Artwork.jsx';
import { shiftDateKey } from '../utils/progression.js';

export default function DailyChallenge({ onNavigate }) {
  const { lang } = useLanguage();
  const { todayChallenge, dailyCompleted, currentStreak, bestStreak, daily, profile, levelInfo, setChallengeCode } = useArena();
  const copy = (id, en) => lang === 'id' ? id : en;
  const game = gameById(todayChallenge.gameId);
  const date = new Date(`${todayChallenge.dateKey}T12:00:00`);
  const dateLabel = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(date);
  const lastSeven = Array.from({ length:7 }, (_, i) => shiftDateKey(todayChallenge.dateKey, i - 6));
  const completedMap = daily.completedByDate || {};
  const dayFormatter = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { weekday:'short' });

  return <div className="daily-page">
    <section className={`daily-hero ${dailyCompleted ? 'is-complete' : ''}`}>
      <div className="daily-hero-copy">
        <span className="eyebrow"><Icon name="spark" size={14}/>{copy('TANTANGAN HARIAN', 'DAILY CHALLENGE')}</span>
        <h1>{dailyCompleted ? copy('Tantangan hari ini selesai.', 'Today’s challenge is complete.') : copy('Satu tantangan. Satu hari. Bonus besar.', 'One challenge. One day. One big bonus.')}</h1>
        <p>{copy('Selesaikan arena pilihan hari ini pada tingkat apa pun untuk mendapatkan bonus XP. Tantangan berganti setiap tengah malam di perangkatmu.', 'Complete today’s featured arena on any difficulty to earn bonus XP. The challenge changes at midnight on your device.')}</p>
        <div className="daily-date"><Icon name="clock" size={15}/>{dateLabel}</div>
      </div>
      <div className="daily-hero-level"><span>{copy('LEVEL KAMU', 'YOUR LEVEL')}</span><strong>Lv. {levelInfo.level}</strong><small>{levelInfo.rank[lang]}</small><div><i style={{ width:`${levelInfo.progress}%` }}/></div><em>{levelInfo.currentXp} / {levelInfo.neededXp} XP</em></div>
    </section>

    <section className="daily-grid">
      <article className={`daily-main-card color-${game?.color || 'purple'}`}>
        <div className="daily-card-art"><Artwork id={game?.id}/></div>
        <div className="daily-card-content">
          <span className="daily-status-pill"><Icon name={dailyCompleted ? 'check' : 'flag'} size={14}/>{dailyCompleted ? copy('Sudah diselesaikan', 'Completed') : copy('Belum diselesaikan', 'Not completed')}</span>
          <span className="eyebrow">{copy('ARENA PILIHAN HARI INI', 'TODAY’S FEATURED ARENA')}</span>
          <h2>{game?.title[lang]}</h2>
          <p>{game?.description[lang]}</p>
          <div className="daily-goal"><span><Icon name="trophy" size={18}/></span><div><small>{copy('TARGET', 'GOAL')}</small><strong>{copy('Selesaikan 1 sesi', 'Complete 1 session')}</strong><p>{copy('Jenjang dan tingkat kesulitan bebas.', 'Any education level and difficulty counts.')}</p></div></div>
          <button className={`ba-button ${dailyCompleted ? 'outline' : 'primary'}`} onClick={() => { setChallengeCode(game.id,`BA-${game.id.toUpperCase()}-${todayChallenge.dateKey.replaceAll('-','')}`); onNavigate(game.id); }}>{dailyCompleted ? copy('Main lagi', 'Play again') : copy('Mulai tantangan', 'Start challenge')}<Icon name="arrow" size={16}/></button>
        </div>
      </article>

      <aside className="daily-side">
        <article className="daily-reward-card"><span className="daily-card-icon"><Icon name="spark" size={20}/></span><div><small>{copy('BONUS HARI INI', 'TODAY’S BONUS')}</small><strong>+{todayChallenge.rewardXp} XP</strong><p>{copy('Ditambahkan otomatis saat sesi selesai.', 'Added automatically when the session ends.')}</p></div></article>
        <article className="daily-reward-card"><span className="daily-card-icon"><Icon name="bolt" size={20}/></span><div><small>{copy('XP SESI', 'SESSION XP')}</small><strong>+60 XP</strong><p>{copy('Setiap game yang diselesaikan tetap memberi XP dasar.', 'Every completed game still awards base XP.')}</p></div></article>
        <article className="daily-reward-card"><span className="daily-card-icon"><Icon name="trophy" size={20}/></span><div><small>{copy('MAIN PERTAMA HARI INI', 'FIRST PLAY TODAY')}</small><strong>+25 XP</strong><p>{copy('Bonus sekali setiap hari untuk sesi pertama.', 'A once-daily bonus for your first completed session.')}</p></div></article>
      </aside>
    </section>

    <section className="daily-streak-card">
      <div className="daily-streak-heading"><div><span className="eyebrow">{copy('KONSISTENSI', 'CONSISTENCY')}</span><h2>{copy('Jaga streak harianmu.', 'Keep your daily streak alive.')}</h2><p>{copy('Selesaikan Daily Challenge setiap hari berturut-turut untuk memperpanjang streak.', 'Complete the Daily Challenge on consecutive days to extend your streak.')}</p></div><div className="streak-big"><Icon name="bolt" size={19}/><strong>{currentStreak}</strong><span>{copy('hari', 'days')}</span></div></div>
      <div className="daily-week">{lastSeven.map(key => { const complete = Boolean(completedMap[key]); const d = new Date(`${key}T12:00:00`); const isToday = key === todayChallenge.dateKey; return <div key={key} className={`${complete ? 'complete' : ''} ${isToday ? 'today' : ''}`}><small>{dayFormatter.format(d)}</small><span>{complete ? <Icon name="check" size={14}/> : d.getDate()}</span><em>{isToday ? copy('Hari ini', 'Today') : ''}</em></div>; })}</div>
      <div className="daily-streak-meta"><span><Icon name="activity" size={15}/>{copy('Streak saat ini', 'Current streak')} <strong>{currentStreak}</strong></span><span><Icon name="trophy" size={15}/>{copy('Streak terbaik', 'Best streak')} <strong>{bestStreak}</strong></span><span><Icon name="gamepad" size={15}/>{copy('Total sesi selesai', 'Sessions completed')} <strong>{profile.completions}</strong></span></div>
    </section>

    <section className="daily-how"><div className="section-heading"><div><h2>{copy('Cara kerja Daily Challenge', 'How Daily Challenge works')}</h2><p>{copy('Sederhana, otomatis, dan tidak membutuhkan akun.', 'Simple, automatic, and no account required.')}</p></div></div><div className="daily-how-grid">{[
      ['01','flag',copy('Buka tantangan hari ini','Open today’s challenge'),copy('Setiap hari Brain Arena memilih satu game dari koleksi yang tersedia.','Each day Brain Arena picks one game from the available collection.')],
      ['02','gamepad',copy('Selesaikan satu sesi','Complete one session'),copy('Mainkan pada jenjang apa pun. Sesi harus mencapai layar hasil.','Play on any level. The session must reach its result screen.')],
      ['03','spark',copy('XP masuk otomatis','XP is awarded automatically'),copy(`Dapatkan +${todayChallenge.rewardXp} XP bonus sekali untuk hari ini.`,`Earn a +${todayChallenge.rewardXp} XP bonus once for today.`)],
    ].map(([n,icon,title,desc]) => <article key={n}><span>{n}</span><Icon name={icon} size={20}/><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
  </div>;
}
