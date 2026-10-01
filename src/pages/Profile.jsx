import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { GAMES, gameById } from '../data/games.js';
import Icon from '../components/Icon.jsx';

export default function Profile({ onNavigate }) {
  const { lang } = useLanguage();
  const { profile, levelInfo, updatePlayerName, currentStreak, bestStreak, dailyCompleted, todayChallenge } = useArena();
  const copy = (id, en) => lang === 'id' ? id : en;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.name || '');
  const displayName = profile.name || copy('Pemain Lokal', 'Local Player');
  const stats = useMemo(() => GAMES.map(game => ({ game, ...(profile.perGame?.[game.id] || { completions:0, xp:0, lastPlayedAt:null }) })).sort((a,b) => (b.completions || 0) - (a.completions || 0)), [profile.perGame]);
  const activeGames = stats.filter(item => item.completions > 0).length;
  const topGame = stats[0]?.completions ? stats[0] : null;
  const saveName = e => { e?.preventDefault(); updatePlayerName(draft); setEditing(false); };

  return <div className="profile-page">
    <section className="profile-hero">
      <div className="profile-avatar-large"><Icon name="user" size={34}/><span>Lv. {levelInfo.level}</span></div>
      <div className="profile-identity"><span className="eyebrow">{copy('PROFIL PEMAIN', 'PLAYER PROFILE')}</span>{editing ? <form className="profile-name-form" onSubmit={saveName}><input autoFocus maxLength={24} value={draft} onChange={e => setDraft(e.target.value)} aria-label={copy('Nama pemain', 'Player name')}/><button className="ba-button primary" type="submit">{copy('Simpan', 'Save')}</button><button className="ba-button outline" type="button" onClick={() => { setDraft(profile.name || ''); setEditing(false); }}>{copy('Batal', 'Cancel')}</button></form> : <div className="profile-name-row"><h1>{displayName}</h1><button className="profile-edit" onClick={() => setEditing(true)}><Icon name="sliders" size={14}/>{copy('Ubah nama', 'Edit name')}</button></div>}<p>{copy('Semua progres tersimpan di browser perangkat ini. Terus main untuk menaikkan level dan membangun streak.', 'All progress is stored in this browser. Keep playing to level up and build your streak.')}</p></div>
      <div className="profile-level-card"><div><small>{copy('LEVEL', 'LEVEL')}</small><strong>{levelInfo.level}</strong><span>{levelInfo.rank[lang]}</span></div><p>{levelInfo.currentXp} / {levelInfo.neededXp} XP</p><div className="profile-xp-bar"><i style={{ width:`${levelInfo.progress}%` }}/></div><em>{copy(`${levelInfo.neededXp - levelInfo.currentXp} XP lagi ke level berikutnya`, `${levelInfo.neededXp - levelInfo.currentXp} XP to next level`)}</em></div>
    </section>

    <section className="profile-stat-grid">
      <article><span><Icon name="spark" size={20}/></span><small>{copy('TOTAL XP', 'TOTAL XP')}</small><strong>{profile.xp.toLocaleString()}</strong><p>{copy('XP terkumpul', 'XP earned')}</p></article>
      <article><span><Icon name="gamepad" size={20}/></span><small>{copy('SESI SELESAI', 'SESSIONS')}</small><strong>{profile.completions}</strong><p>{copy('Permainan dituntaskan', 'Games completed')}</p></article>
      <article><span><Icon name="bolt" size={20}/></span><small>{copy('DAILY STREAK', 'DAILY STREAK')}</small><strong>{currentStreak}</strong><p>{copy(`Terbaik ${bestStreak} hari`, `Best ${bestStreak} days`)}</p></article>
      <article><span><Icon name="grid" size={20}/></span><small>{copy('GAME DIJELAJAHI', 'GAMES EXPLORED')}</small><strong>{activeGames}/{GAMES.length}</strong><p>{topGame ? `${copy('Teraktif', 'Most played')}: ${topGame.game.title[lang]}` : copy('Mulai game pertamamu', 'Start your first game')}</p></article>
    </section>

    <section className="profile-columns">
      <article className="profile-panel">
        <header><div><span className="eyebrow">{copy('PROGRES GAME', 'GAME PROGRESS')}</span><h2>{copy('Arena yang paling sering dimainkan', 'Your most-played arenas')}</h2></div><button className="text-button" onClick={() => onNavigate('games')}>{copy('Semua game', 'All games')}<Icon name="arrow" size={14}/></button></header>
        <div className="profile-game-list">{stats.slice(0,6).map(({ game, completions, xp }) => <button key={game.id} onClick={() => onNavigate(game.id)}><span className={`mini-game-icon color-${game.color}`}><Icon name={game.icon} size={17}/></span><span className="profile-game-copy"><strong>{game.title[lang]}</strong><small>{completions ? copy(`${completions} sesi selesai`, `${completions} completed sessions`) : copy('Belum dimainkan sampai selesai', 'No completed session yet')}</small></span><span className="profile-game-xp">{xp || 0}<small>XP</small></span><Icon name="chevron" size={14}/></button>)}</div>
      </article>

      <article className="profile-panel daily-mini-panel">
        <header><div><span className="eyebrow">{copy('HARI INI', 'TODAY')}</span><h2>{copy('Daily Challenge', 'Daily Challenge')}</h2></div><span className={`profile-daily-state ${dailyCompleted ? 'done' : ''}`}><Icon name={dailyCompleted ? 'check' : 'clock'} size={13}/>{dailyCompleted ? copy('Selesai', 'Done') : copy('Aktif', 'Active')}</span></header>
        <div className="profile-daily-game">{(() => { const game=gameById(todayChallenge.gameId); return <><span className={`mini-game-icon color-${game.color}`}><Icon name={game.icon} size={20}/></span><div><strong>{game.title[lang]}</strong><p>{copy(`Selesaikan 1 sesi dan raih +${todayChallenge.rewardXp} XP bonus.`, `Complete 1 session and earn +${todayChallenge.rewardXp} bonus XP.`)}</p></div></>; })()}</div>
        <button className="ba-button primary full-width" onClick={() => onNavigate('daily')}>{dailyCompleted ? copy('Lihat progres harian', 'View daily progress') : copy('Buka Daily Challenge', 'Open Daily Challenge')}<Icon name="arrow" size={15}/></button>
      </article>
    </section>

    <section className="profile-panel profile-xp-history">
      <header><div><span className="eyebrow">{copy('RIWAYAT XP', 'XP HISTORY')}</span><h2>{copy('XP terbaru yang kamu dapatkan', 'Your latest XP rewards')}</h2></div></header>
      {profile.xpEvents.length ? <div className="xp-event-list">{profile.xpEvents.slice(0,8).map(event => { const game=gameById(event.gameId); const time = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }).format(new Date(event.time)); return <div key={event.id}><span className={`mini-game-icon color-${game?.color || 'purple'}`}><Icon name={game?.icon || 'grid'} size={15}/></span><span><strong>{game?.title[lang] || event.gameId}</strong><small>{time}{event.dailyBonus ? ` · ${copy('Daily Challenge', 'Daily Challenge')}` : ''}</small></span><b>+{event.amount} XP</b></div>; })}</div> : <div className="profile-empty"><Icon name="spark" size={24}/><strong>{copy('Belum ada XP.', 'No XP yet.')}</strong><p>{copy('Selesaikan game untuk memulai progresmu.', 'Complete a game to start your progression.')}</p><button className="ba-button primary" onClick={() => onNavigate('games')}>{copy('Pilih game', 'Choose a game')}<Icon name="arrow" size={15}/></button></div>}
    </section>
  </div>;
}
