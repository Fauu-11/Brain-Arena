import { validCheckpoint } from '../utils/gameCheckpoint.js';
import React, { useMemo, useRef, useState } from 'react';
import { GAMES, CATEGORIES, gameById } from '../data/games.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import Icon from '../components/Icon.jsx';
import GameCard from '../components/GameCard.jsx';
import Dialog from '../components/Dialog.jsx';
import { HeroArtwork } from '../components/Artwork.jsx';
import { homeChoices, homePreview, homePrimaryAction, recoverySavedAt } from '../utils/homeDashboard.js';

function Dashboard({ onSelectGame }) {
  const { lang } = useLanguage();
  const { pinnedGames, history, profile, matches, todayChallenge, dailyCompleted, currentStreak, levelInfo, missionCards, recoverySession, resumeRecovery, discardRecovery, setChallengeCode } = useArena();
  const [category, setCategory] = useState('all');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const primaryButton = useRef(null);
  const copy = (id, en) => lang === 'id' ? id : en;
  const primary = homePrimaryAction({ profile, matches, recoverySession, dailyCompleted, dailyGameId: todayChallenge.gameId, pinnedGames, history });
  const choices = homeChoices(pinnedGames, history);
  const preview = homePreview(category, pinnedGames, history);
  const dailyGame = gameById(todayChallenge.gameId);
  const readyMissions = missionCards.filter(item => item.complete && !item.claimed).length;
  const savedAt = primary.kind === 'recovery' ? recoverySavedAt(recoverySession.lastSavedAt, lang) : null;
  const startDaily = () => {
    if (!dailyGame) return onSelectGame('daily');
    setChallengeCode(dailyGame.id, `BA-${dailyGame.id.toUpperCase()}-${todayChallenge.dateKey.replaceAll('-', '')}`);
    onSelectGame(dailyGame.id);
  };
  const startPrimary = () => {
    if (primary.kind === 'recovery') { const target = resumeRecovery(); if (target) onSelectGame(target); }
    else if (primary.kind === 'daily') startDaily();
    else onSelectGame(primary.game.id);
  };
  const hero = {
    first: {
      eyebrow: copy('MULAI DARI SATU TANTANGAN', 'ONE CHALLENGE IS ALL IT TAKES'),
      title: copy('Pikiran segar. Tantangan baru.', 'A fresh mind. A new challenge.'),
      description: copy('Mulai dengan Hitung Kubus. Pilih tingkatmu, pelajari aturannya, lalu coba tantangan pertamamu.', 'Start with Cube Count. Choose your level, learn the rules, and try your first challenge.'),
      action: copy('Coba Hitung Kubus', 'Try Cube Count'),
    },
    recovery: {
      eyebrow: copy('SESI TERSIMPAN', 'SAVED SESSION'),
      title: copy('Lanjutkan tantanganmu.', 'Pick up your challenge.'),
      description: copy(`Sesi ${primary.game.title[lang]} tersimpan. ${validCheckpoint(recoverySession?.boardCheckpoint,primary.game.id)?'Lanjutkan dari titik aman terakhir.':'Ulangi challenge dengan seed yang sama dari papan awal.'}`, `Your ${primary.game.title[lang]} challenge is saved. ${validCheckpoint(recoverySession?.boardCheckpoint,primary.game.id)?'Continue from the last safe checkpoint.':'Restart with the same seed from the opening board.'}`),
      action: copy(`${validCheckpoint(recoverySession?.boardCheckpoint,primary.game.id)?'Lanjutkan':'Ulangi'} ${primary.game.title[lang]}`, `${validCheckpoint(recoverySession?.boardCheckpoint,primary.game.id)?'Continue':'Restart'} ${primary.game.title[lang]}`),
    },
    daily: {
      eyebrow: copy('TANTANGAN HARI INI', 'TODAY’S CHALLENGE'),
      title: copy('Satu tantangan. Selangkah lebih tajam.', 'One challenge. A little sharper.'),
      description: copy(`Giliran ${primary.game.title[lang]} hari ini. Selesaikan satu sesi dan dapatkan bonus +${todayChallenge.rewardXp} XP.`, `It’s ${primary.game.title[lang]} today. Complete a session for a +${todayChallenge.rewardXp} XP bonus.`),
      action: copy('Mulai tantangan harian', 'Start daily challenge'),
    },
    next: {
      eyebrow: copy('LANJUT ASAH KEMAMPUANMU', 'KEEP YOUR MIND MOVING'),
      title: copy('Siap untuk langkah berikutnya?', 'Ready for your next move?'),
      description: copy(`Coba sesi baru ${primary.game.title[lang]}, atau temukan tantangan lain yang menarik perhatianmu.`, `Try a new ${primary.game.title[lang]} session, or discover another challenge that catches your eye.`),
      action: copy(`Mainkan ${primary.game.title[lang]}`, `Play ${primary.game.title[lang]}`),
    },
  }[primary.kind];

  return <div className="home-refresh" data-home-state={primary.kind}>
    <div className="dashboard-top">
      <section className="dashboard-hero" aria-labelledby="landing-title">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow"><Icon name={primary.kind === 'recovery' ? 'refresh' : 'spark'} size={16}/>{hero.eyebrow}</p>
          <h1 id="landing-title">{hero.title}</h1>
          <p className="dashboard-intro">{hero.description}</p>
          {primary.kind === 'recovery' && <p className="dashboard-saved"><Icon name="clock" size={16}/>{savedAt ? <>{copy('Disimpan', 'Saved')} <time dateTime={new Date(recoverySession.lastSavedAt).toISOString()}>{savedAt}</time></> : copy('Waktu penyimpanan tidak tersedia', 'Save time unavailable')}</p>}
          <div className="dashboard-actions">
            <button ref={primaryButton} className="dashboard-button dashboard-primary" onClick={startPrimary}>{hero.action}<Icon name="arrow" size={18}/></button>
            <button className="dashboard-link" onClick={() => onSelectGame('games')}>{copy('Jelajahi permainan', 'Explore games')}<Icon name="chevron" size={16}/></button>
          </div>
          {primary.kind === 'recovery' && <details className="dashboard-recovery-options"><summary>{copy('Opsi sesi tersimpan', 'Saved session options')}</summary><p>{copy('Mulai ulang tanpa sesi ini? Progres dan hasil permainan yang sudah selesai tidak ikut dihapus.', 'Want a fresh start? Discarding this session does not delete completed results or progress.')}</p><button className="dashboard-link" onClick={() => setConfirmDiscard(true)}>{copy('Buang sesi tersimpan…', 'Discard saved session…')}</button></details>}
          <p className="dashboard-local"><Icon name="shield" size={15}/>{copy('Gratis · Tanpa akun · Progres lokal di browser ini', 'Free · No account · Progress local to this browser')}</p>
        </div>
        <div className="dashboard-art" aria-hidden="true"><HeroArtwork/></div>
      </section>
      <aside className="dashboard-daily" aria-labelledby="dashboard-daily-title">
        <span className="dashboard-card-icon"><Icon name={dailyCompleted ? 'check' : 'flag'} size={22}/></span>
        <p className="dashboard-eyebrow">{copy('TANTANGAN HARIAN', 'DAILY CHALLENGE')}</p>
        <h2 id="dashboard-daily-title">{dailyCompleted ? copy('Harianmu sudah selesai!', 'Daily challenge complete!') : dailyGame?.title[lang]}</h2>
        <p>{dailyCompleted ? copy('Bonus hari ini sudah didapat. Coba arena lain atau lihat hasil latihanmu.', 'Today’s bonus is yours. Try another arena or review your progress.') : copy(`Selesaikan satu sesi hari ini untuk bonus +${todayChallenge.rewardXp} XP.`, `Complete one session today for a +${todayChallenge.rewardXp} XP bonus.`)}</p>
        <span className="dashboard-streak"><Icon name="bolt" size={16}/>{copy(`Streak harian: ${currentStreak} hari`, `Daily streak: ${currentStreak} days`)}</span>
        <button className="dashboard-button" onClick={() => onSelectGame('daily')}>{dailyCompleted ? copy('Lihat hasil harian', 'View daily progress') : copy('Lihat tantangan', 'View challenge')}<Icon name="arrow" size={16}/></button>
      </aside>
    </div>

    {recoverySession && primary.kind !== 'recovery' && <section className="dashboard-recovery-warning" role="status"><div><h2>{copy('Sesi tersimpan tidak dapat dilanjutkan', 'Saved session cannot be continued')}</h2><p>{copy('Kode tantangan tidak sesuai dengan game. Kamu bisa memilih permainan baru atau membuang sesi ini; hasil yang sudah selesai tetap aman.', 'The challenge code does not match the game. Choose a new game or discard this session; completed results are kept.')}</p></div><button className="dashboard-link" onClick={() => setConfirmDiscard(true)}>{copy('Buang sesi tersimpan…', 'Discard saved session…')}</button></section>}

    {choices.games.length > 0 && <section className="dashboard-section" aria-labelledby="choices-title">
      <div className="dashboard-section-heading"><div><h2 id="choices-title">{copy('Pilihanmu', 'Your picks')}</h2><p>{choices.source === 'pinned' ? copy('Game dipin, siap dibuka kembali.', 'Your pinned games, ready when you are.') : copy('Terakhir dibuka. Pilih untuk menyiapkan sesi baru.', 'Recently opened. Choose one to set up a new session.')}</p></div><button className="dashboard-link" onClick={() => onSelectGame(choices.source === 'pinned' ? 'games' : 'activity')}>{choices.source === 'pinned' ? copy('Kelola pin', 'Manage pins') : copy('Lihat aktivitas', 'View activity')}<Icon name="arrow" size={16}/></button></div>
      <div className="dashboard-choices">{choices.games.map(game => <button key={game.id} className="dashboard-choice" onClick={() => onSelectGame(game.id)}><span className="dashboard-card-icon"><Icon name={game.icon} size={22}/></span><span><strong>{game.title[lang]}</strong><small>{choices.source === 'pinned' ? copy('Dipin', 'Pinned') : copy('Buka sesi baru', 'Set up a new session')}</small></span><Icon name="arrow" size={17}/></button>)}</div>
    </section>}

    <section className="dashboard-section" aria-labelledby="dashboard-games-title">
      <div className="dashboard-section-heading"><div><h2 id="dashboard-games-title">{copy('Temukan arena berikutnya', 'Find your next arena')}</h2><p>{copy('Pilih keterampilan yang ingin kamu latih.', 'Choose the skill you want to sharpen.')}</p></div><button className="dashboard-link" onClick={() => onSelectGame('games')}>{copy(`Lihat semua ${GAMES.length} game`, `View all ${GAMES.length} games`)}<Icon name="arrow" size={16}/></button></div>
      <div className="dashboard-categories" role="group" aria-label={copy('Kategori permainan', 'Game category')}>{Object.entries(CATEGORIES).map(([id, name]) => <button key={id} aria-pressed={category === id} onClick={() => setCategory(id)}>{id === 'all' ? copy('Semua', 'All') : name[lang]}</button>)}</div>
      <p className="sr-only" role="status">{preview.length} {copy('game ditampilkan', 'games shown')}</p>
      <div className="game-grid dashboard-game-grid">{preview.map(game => <GameCard key={game.id} game={game} onSelectGame={onSelectGame}/>)}</div>
    </section>

    <section className="dashboard-section" aria-labelledby="dashboard-progress-title">
      <div className="dashboard-section-heading"><div><h2 id="dashboard-progress-title">{copy('Sedikit demi sedikit, makin tajam', 'Small steps. Sharper thinking.')}</h2><p>{profile.completions > 0 || matches.length > 0 ? copy('Jejak latihanmu di perangkat ini.', 'Your training journey on this device.') : copy('Selesaikan game pertamamu untuk mulai mencatat hasil.', 'Finish your first game to start recording results.')}</p></div><button className="dashboard-link" onClick={() => onSelectGame('progress')}>{copy('Semua progres', 'All progress')}<Icon name="arrow" size={16}/></button></div>
      <div className="dashboard-progress-grid">
        <button className="dashboard-stat" onClick={() => onSelectGame('progress')}><Icon name="spark" size={22}/><span><small>{copy('Level & XP', 'Level & XP')}</small><strong>Lv. {levelInfo.level} <span>· {profile.xp.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} XP</span></strong><span>{copy('Lihat perkembanganmu', 'Review your progression')}</span></span><Icon name="chevron" size={17}/></button>
        <button className="dashboard-stat" onClick={() => onSelectGame('daily')}><Icon name="bolt" size={22}/><span><small>{copy('Streak harian', 'Daily streak')}</small><strong>{currentStreak} {copy('hari', 'days')}</strong><span>{copy('Dari tantangan harian selesai', 'From completed daily challenges')}</span></span><Icon name="chevron" size={17}/></button>
        <button className="dashboard-stat" onClick={() => onSelectGame('missions')}><Icon name="checklist" size={22}/><span><small>{copy('Misi', 'Missions')}</small><strong>{readyMissions ? copy(`${readyMissions} hadiah siap`, `${readyMissions} rewards ready`) : copy('Lihat targetmu', 'View your goals')}</strong><span>{readyMissions ? copy('Buka untuk klaim XP', 'Open to claim XP') : copy('Belum ada hadiah siap diklaim', 'No rewards ready to claim')}</span></span><Icon name="chevron" size={17}/></button>
      </div>
    </section>
    <section className="dashboard-guide"><span className="dashboard-card-icon"><Icon name="book" size={24}/></span><div><h2>{copy('Belum yakin cara bermainnya?', 'Not sure how to play?')}</h2><p>{copy('Aturan dan strategi setiap game ada di panduan.', 'Find every game’s rules and strategies in the guides.')}</p></div><button className="dashboard-link" onClick={() => onSelectGame('guides')}>{copy('Buka panduan', 'Explore guides')}<Icon name="arrow" size={16}/></button></section>
    <Dialog open={confirmDiscard} onClose={() => setConfirmDiscard(false)} title={copy('Buang sesi tersimpan?', 'Discard saved session?')}><p className="dialog-description">{copy('Sesi yang belum selesai ini akan dihapus dan tidak bisa dilanjutkan lagi. XP, pin, dan hasil permainan yang sudah selesai tetap aman.', 'This unfinished session will be removed and cannot be resumed. Your XP, pins, and completed results are kept.')}</p><div className="dashboard-dialog-actions"><button className="ba-button outline" onClick={() => setConfirmDiscard(false)}>{copy('Simpan sesi', 'Keep session')}</button><button className="ba-button primary" onClick={() => { discardRecovery(); setConfirmDiscard(false); requestAnimationFrame(() => primaryButton.current?.focus()); }}>{copy('Ya, buang sesi', 'Yes, discard session')}</button></div></Dialog>
  </div>;
}

function Catalog({ onSelectGame, favoriteView }) {
  const { lang } = useLanguage();
  const { favorites, pinnedGames, togglePinnedGame, movePinnedGame, profile, completionMap, personalBests } = useArena();
  const [season, setSeason] = useState('all');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const copy = (id, en) => lang === 'id' ? id : en;
  const baseGames = useMemo(() => favoriteView ? GAMES.filter(game => favorites.includes(game.id)) : GAMES, [favoriteView, favorites]);
  const filtered = useMemo(() => baseGames.filter(game => {
    const statusOk = statusFilter === 'all' || (statusFilter === 'favorite' && favorites.includes(game.id)) || (statusFilter === 'pinned' && pinnedGames.includes(game.id)) || (statusFilter === 'unplayed' && !(profile.perGame?.[game.id]?.completions > 0)) || (statusFilter === 'completed' && Boolean(Object.keys(completionMap?.[game.id] || {}).length)) || (statusFilter === 'pb' && Object.keys(personalBests || {}).some(key => key.startsWith(`${game.id}:`)));
    return (season === 'all' || game.season === Number(season)) && (category === 'all' || game.category === category) && (difficultyFilter === 'all' || game.difficulty === difficultyFilter) && statusOk && `${game.title.id} ${game.title.en} ${game.description[lang]} ${CATEGORIES[game.category][lang]}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }), [baseGames, season, category, query, lang, statusFilter, difficultyFilter, favorites, pinnedGames, profile.perGame, completionMap, personalBests]);
  const reset = () => { setQuery(''); setCategory('all'); setSeason('all'); setStatusFilter('all'); setDifficultyFilter('all'); };

  return <div className="home-page catalog-refresh">
    <header className="dashboard-section-heading"><div><p className="dashboard-eyebrow">{copy('RUANG BERMAIN, RUANG BERTUMBUH', 'A LITTLE PLAY. A LOT OF POSSIBILITIES.')}</p><h1>{favoriteView ? copy('Game favoritmu', 'Your favorites') : copy('Temukan tantanganmu', 'Find your next challenge')}</h1><p>{copy('Semua game dan filter, dalam satu tempat.', 'All your games and filters, in one place.')}</p></div><button className="dashboard-button" onClick={() => { reset(); onSelectGame(favoriteView ? 'games' : 'favorites'); }}><Icon name={favoriteView ? 'grid' : 'star'} size={17}/>{favoriteView ? copy('Semua permainan', 'All games') : copy('Game favorit', 'Favorite games')}</button></header>
    {pinnedGames.length > 0 && <section className="pinned-v2-section" aria-labelledby="pinned-title"><div className="section-heading"><div><h2 id="pinned-title">{copy('Kelola game dipin', 'Manage pinned games')}<span className="count-badge">{pinnedGames.length}</span></h2><p>{copy('Tiga pin teratas muncul di sidebar dan beranda. Ubah urutannya di sini.', 'Your top three pins appear in the sidebar and home. Change their order here.')}</p></div></div><div className="pinned-v2-grid">{pinnedGames.map((id, index) => { const game = gameById(id); if (!game) return null; return <article key={id}><button className="pinned-v2-main" onClick={() => onSelectGame(id)}><span className={`mini-game-icon color-${game.color}`}><Icon name={game.icon} size={18}/></span><span><strong>{game.title[lang]}</strong><small>{CATEGORIES[game.category][lang]}</small></span></button><div><button disabled={index === 0} onClick={() => movePinnedGame(id, -1)} aria-label={copy(`Naikkan ${game.title[lang]}`, `Move ${game.title[lang]} up`)}><Icon name="up" size={16}/></button><button disabled={index === pinnedGames.length - 1} onClick={() => movePinnedGame(id, 1)} aria-label={copy(`Turunkan ${game.title[lang]}`, `Move ${game.title[lang]} down`)}><Icon name="down" size={16}/></button><button onClick={() => togglePinnedGame(id)} aria-label={copy(`Lepas pin ${game.title[lang]}`, `Unpin ${game.title[lang]}`)}><Icon name="close" size={16}/></button></div></article>; })}</div></section>}
    <section className="catalog-section" id="game-catalog" aria-labelledby="catalog-title">
      <div className="section-heading"><div><h2 id="catalog-title">{favoriteView ? copy('Koleksi favorit', 'Your collection') : copy('Pilih arena bermainmu', 'Choose your arena')}<span className="count-badge">{filtered.length}</span></h2><p>{copy('Tantangan berbeda. Satu tujuan: jadi lebih tajam.', 'Different challenges. One goal: a sharper you.')}</p></div><button className="text-button random-button" disabled={!filtered.length} onClick={() => onSelectGame(filtered[Math.floor(Math.random() * filtered.length)].id)}><Icon name="shuffle" size={16}/>{copy('Pilihkan untukku', 'Surprise me')}</button></div>
      <div className="catalog-toolbar"><div className="season-tabs" role="group" aria-label={copy('Filter musim', 'Filter by season')}>{['all', ...[...new Set(GAMES.map(game => String(game.season)))].sort((a, b) => Number(a) - Number(b))].map(value => <button key={value} className={season === value ? 'active' : ''} aria-pressed={season === value} onClick={() => setSeason(value)}>{value === 'all' ? copy('Semua game', 'All games') : `${copy('Musim', 'Season')} ${value}`}<span>{value === 'all' ? baseGames.length : baseGames.filter(game => game.season === Number(value)).length}</span></button>)}</div><div className="catalog-controls">
        <label className="catalog-search"><Icon name="search" size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder={copy('Cari game...', 'Find a game...')} aria-label={copy('Cari dalam katalog game', 'Search game catalog')}/>{query && <button onClick={() => setQuery('')} aria-label={copy('Hapus pencarian', 'Clear search')}><Icon name="close" size={16}/></button>}</label>
        <label className="category-select"><select value={category} onChange={event => setCategory(event.target.value)} aria-label={copy('Kategori permainan', 'Game category')}>{Object.entries(CATEGORIES).map(([id, name]) => <option value={id} key={id}>{name[lang]}</option>)}</select><Icon name="down" size={14}/></label>
        <label className="category-select filter-v2-select"><select value={difficultyFilter} onChange={event => setDifficultyFilter(event.target.value)} aria-label={copy('Filter kesulitan', 'Difficulty filter')}><option value="all">{copy('Semua kesulitan', 'All difficulties')}</option><option value="medium">{copy('Sedang', 'Medium')}</option><option value="hard">{copy('Sulit', 'Hard')}</option><option value="expert">{copy('Ahli', 'Expert')}</option></select><Icon name="down" size={14}/></label>
        <label className="category-select filter-v2-select"><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label={copy('Filter status', 'Status filter')}><option value="all">{copy('Semua status', 'All status')}</option><option value="favorite">{copy('Favorit', 'Favorites')}</option><option value="pinned">{copy('Dipin', 'Pinned')}</option><option value="unplayed">{copy('Belum selesai dimainkan', 'No completed sessions')}</option><option value="completed">{copy('Sudah selesai', 'Completed')}</option><option value="pb">Personal Best</option></select><Icon name="down" size={14}/></label>
      </div></div>
      <p className="sr-only" role="status">{filtered.length} {copy('permainan ditemukan', 'games found')}</p>
      {filtered.length ? <div className="game-grid">{filtered.map(game => <GameCard key={game.id} game={game} onSelectGame={onSelectGame}/>)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name={favoriteView && !favorites.length ? 'star' : 'search'} size={30}/></span><h3>{favoriteView && !favorites.length ? copy('Favoritmu menunggu di sini.', 'Your favorites belong here.') : copy('Belum ada yang cocok.', 'No matches just yet.')}</h3><p>{favoriteView && !favorites.length ? copy('Buka Simpan pada game yang kamu suka, lalu tambahkan ke favorit.', 'Open Save on a game you like, then add it to favorites.') : copy('Coba kata kunci lain atau hapus filter yang aktif.', 'Try another search or clear your active filters.')}</p><button className="ba-button primary" onClick={() => { reset(); if (favoriteView && !favorites.length) onSelectGame('games'); }}>{favoriteView && !favorites.length ? copy('Temukan game', 'Discover games') : copy('Reset filter', 'Reset filters')}<Icon name="arrow" size={16}/></button></div>}
    </section>
  </div>;
}

export default function Home({ onSelectGame, view = 'home' }) {
  return view === 'home' ? <Dashboard onSelectGame={onSelectGame}/> : <Catalog key={view} onSelectGame={onSelectGame} favoriteView={view === 'favorites'}/>;
}
