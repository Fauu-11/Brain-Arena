import React from 'react';
import Icon from '../components/Icon.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { gameById } from '../data/games.js';
import '../hubs.css';

export default function Challenges({ onNavigate }) {
  const { lang } = useLanguage();
  const { todayChallenge, dailyCompleted, arenaRun, storageOk } = useArena();
  const copy = (id, en) => lang === 'en' ? en : id;
  const dailyGame = gameById(todayChallenge.gameId);
  const activeRun = arenaRun?.status === 'active';
  const nextGame = activeRun ? gameById(arenaRun.stages[arenaRun.index]?.gameId) : null;
  const cards = [
    { route:'daily', icon:'flag', title:copy('Tantangan harian', 'Daily challenge'), description:copy('Buka tantangan hari ini, lihat bonus, atau jelajahi arsip harian.', 'Open today’s challenge, check its bonus, or explore the daily archive.') },
    { route:'arena-run', icon:'trophy', title:'Arena Run', description:copy('Susun atau lanjutkan perjalanan beberapa game dengan seed setiap tahap.', 'Set up or continue a multi-game run with a seed for each stage.') },
    { route:'arena-cup', icon:'medal', title:'Arena Cup', description:copy('Buka turnamen lintas game dan lihat progres tahapmu.', 'Open a multi-game tournament and check your stage progress.') },
    { route:'events', icon:'bolt', title:copy('Event latihan', 'Training events'), description:copy('Lihat kategori pilihan dan aturan bonus XP event lokal.', 'See the featured category and local event XP bonus rules.') },
    { route:'season', icon:'spark', title:copy('Musim & hadiah', 'Season & rewards'), description:copy('Lihat XP musim, milestone, dan hadiah yang dapat diklaim.', 'Check season XP, milestones, and claimable rewards.') },
    { route:'leaderboard', icon:'activity', title:copy('Papan XP lokal', 'Local XP board'), description:copy('Bandingkan XP lokal dengan rival simulasi latihan, bukan pemain online.', 'Compare local XP with simulated training rivals, not online players.') },
  ];
  const advanced = [
    { route:'arena-builder', icon:'sliders', title:'Arena Builder', description:copy('Atur sendiri urutan game dan format Arena Run.', 'Choose your own game sequence and Arena Run format.') },
    { route:'practice-lab', icon:'brain', title:'Practice Lab', description:copy('Pilih latihan terarah untuk mengasah keterampilan game.', 'Choose focused drills to develop your game skills.') },
  ];

  return <div className="hub-page hub-challenges">
    <header className="hub-heading">
      <p className="hub-eyebrow">{copy('ARENA LATIHAN', 'TRAINING ARENA')}</p>
      <h1>{copy('Tantangan', 'Challenges')}</h1>
      <p>{copy('Pilih tantangan harian, lanjutkan run, atau tentukan sasaran latihan berikutnya.', 'Pick a daily challenge, continue a run, or choose your next training goal.')}</p>
      <p className="hub-local-note"><Icon name="shield" size={18}/>{copy('Progres lokal di perangkat ini. Tidak ada sinkronisasi cloud aktif.', 'Progress is local to this device. No live cloud sync.')}</p>
    </header>

    {!storageOk && <p className="hub-storage-warning" role="status"><Icon name="shield" size={20}/>{copy('Penyimpanan tidak tersedia. Progres hanya bertahan selama sesi tab ini; buka Pengaturan untuk alat data dan backup.', 'Storage is unavailable. Progress lasts only for this tab session; open Settings for data and backup tools.')}<button className="hub-button" onClick={() => onNavigate('settings')}>{copy('Pengaturan', 'Settings')}</button></p>}

    <section className="hub-section" aria-labelledby="challenges-overview-title">
      <h2 id="challenges-overview-title">{copy('Langkah berikutnya', 'Your next step')}</h2>
      <div className="hub-overview-grid">
        <article className="hub-overview-card hub-overview-accent">
          <span className="hub-state"><Icon name={dailyCompleted ? 'check' : 'flag'} size={18}/>{dailyCompleted ? copy('Harian selesai', 'Daily complete') : copy('Harian belum selesai', 'Daily not completed')}</span>
          <h3>{dailyGame?.title[lang] || copy('Tantangan harian', 'Daily challenge')}</h3>
          <p>{dailyCompleted
            ? copy(`Bonus +${todayChallenge.rewardXp} XP hari ini sudah diberikan. Kamu tetap bisa melihat progres atau bermain lagi.`, `Today’s +${todayChallenge.rewardXp} XP bonus has been awarded. You can still view progress or play again.`)
            : copy(`Selesaikan satu sesi tantangan hari ini untuk bonus +${todayChallenge.rewardXp} XP.`, `Complete one session of today’s challenge for a +${todayChallenge.rewardXp} XP bonus.`)}</p>
          <button className="hub-button hub-button-primary" onClick={() => onNavigate('daily')}>{dailyCompleted ? copy('Lihat harian', 'View daily challenge') : copy('Buka tantangan harian', 'Open daily challenge')}<Icon name="arrow" size={18}/></button>
        </article>
        <article className="hub-overview-card">
          <span className="hub-state"><Icon name={activeRun ? 'play' : arenaRun?.status === 'complete' ? 'check' : 'trophy'} size={18}/>{activeRun ? copy('Arena Run aktif', 'Active Arena Run') : arenaRun?.status === 'complete' ? copy('Arena Run selesai', 'Arena Run complete') : copy('Belum ada Arena Run', 'No Arena Run yet')}</span>
          <h3>{activeRun ? copy('Perjalananmu masih berjalan.', 'Your run is in progress.') : arenaRun?.status === 'complete' ? copy('Lihat hasil run terakhir.', 'Review your last run.') : copy('Siap mencoba rangkaian game?', 'Ready for a multi-game run?')}</h3>
          <p>{arenaRun
            ? copy(`${arenaRun.results?.length || 0} dari ${arenaRun.stages.length} tahap selesai.`, `${arenaRun.results?.length || 0} of ${arenaRun.stages.length} stages completed.`)
            : copy('Pilih format di Arena Run. Tidak ada run yang dimulai sebelum kamu memilihnya.', 'Choose a format in Arena Run. No run starts until you choose one.')}</p>
          {nextGame && <p className="hub-secondary">{copy('Berikutnya', 'Next')}: {nextGame.title[lang]}</p>}
          <button className="hub-button" onClick={() => onNavigate('arena-run')}>{activeRun ? copy('Lanjutkan di Arena Run', 'Continue in Arena Run') : arenaRun?.status === 'complete' ? copy('Lihat hasil Arena Run', 'View Arena Run results') : copy('Siapkan Arena Run', 'Set up Arena Run')}<Icon name="arrow" size={18}/></button>
        </article>
      </div>
    </section>

    <section className="hub-section" aria-labelledby="challenges-browse-title">
      <div className="hub-section-heading"><h2 id="challenges-browse-title">{copy('Jelajahi tantangan', 'Explore challenges')}</h2><p>{copy('Semua format latihan, tanpa perlu akun online.', 'All training formats, with no online account required.')}</p></div>
      <nav className="hub-card-grid" aria-labelledby="challenges-browse-title">
        {cards.map(card => <div className="hub-card-group" key={card.route}>
          <button className="hub-card" onClick={() => onNavigate(card.route)}>
            <span className="hub-card-icon"><Icon name={card.icon} size={24}/></span>
            <span className="hub-card-copy"><strong>{card.title}</strong><span>{card.description}</span></span>
            <Icon name="chevron" size={18}/>
          </button>
          {card.route === 'daily' && <button className="hub-card-secondary" onClick={() => onNavigate('daily-archive')}><Icon name="clock" size={18}/>{copy('Arsip tantangan harian', 'Daily challenge archive')}<Icon name="arrow" size={18}/></button>}
        </div>)}
      </nav>
    </section>

    <details className="hub-advanced">
      <summary><span>{copy('Latihan lanjutan', 'Advanced training')}</span><Icon name="down" size={20}/></summary>
      <div className="hub-advanced-content">
        <p>{copy('Sesuaikan format atau fokuskan latihanmu. Pengaturan game tetap dibuka di halaman masing-masing.', 'Customize a format or focus your practice. Game setup stays on its own page.')}</p>
        <nav className="hub-card-grid hub-card-grid-two" aria-label={copy('Alat latihan lanjutan', 'Advanced training tools')}>
          {advanced.map(card => <button key={card.route} className="hub-card" onClick={() => onNavigate(card.route)}><span className="hub-card-icon"><Icon name={card.icon} size={24}/></span><span className="hub-card-copy"><strong>{card.title}</strong><span>{card.description}</span></span><Icon name="chevron" size={18}/></button>)}
        </nav>
      </div>
    </details>
  </div>;
}
