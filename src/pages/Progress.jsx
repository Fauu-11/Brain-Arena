import React from 'react';
import Icon from '../components/Icon.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import '../hubs.css';

export default function Progress({ onNavigate }) {
  const { lang } = useLanguage();
  const { profile, levelInfo, currentStreak, missionCards, storageOk } = useArena();
  const copy = (id, en) => lang === 'en' ? en : id;
  const number = value => value.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID');
  const readyCount = missionCards.filter(item => item.complete && !item.claimed).length;
  const groups = [
    { id:'progress-review', title:copy('Aktivitas & performa', 'Activity & performance'), description:copy('Lihat apa yang sudah dimainkan dan hasil sesi yang tersimpan.', 'Review the games you have opened and your recorded session results.'), cards:[
      { route:'statistics', icon:'activity', title:copy('Statistik', 'Statistics'), description:copy('Rincian XP, sesi, dan performa dari data lokalmu.', 'XP, session, and performance details from your local data.') },
      { route:'activity', icon:'clock', title:copy('Aktivitas & rekor', 'Activity & records'), description:copy('Game yang pernah dibuka dan rekor pribadi.', 'Recently opened games and personal bests.') },
      { route:'history', icon:'book', title:copy('Riwayat pertandingan', 'Match history'), description:copy('Hasil sesi selesai, replay, dan kartu hasil untuk dibagikan.', 'Completed session results, replays, and result cards to share.') },
    ] },
    { id:'progress-rewards', title:copy('Pencapaian & perkembangan', 'Achievements & progression'), description:copy('Temukan hadiah dan pantau perkembangan di setiap arena.', 'Find rewards and track your progression in every arena.'), cards:[
      { route:'achievements', icon:'medal', title:copy('Pencapaian', 'Achievements'), description:copy('Lihat badge yang terbuka dan syarat pencapaian berikutnya.', 'View unlocked badges and requirements for your next achievement.') },
      { route:'missions', icon:'checklist', title:copy('Misi', 'Missions'), description:readyCount ? copy(`${readyCount} hadiah misi siap diklaim. Buka misi untuk mengambil XP.`, `${readyCount} mission rewards ready to claim. Open missions to collect XP.`) : copy('Belum ada hadiah siap diklaim. Lihat target misi harian dan mingguan.', 'No rewards ready to claim. Check daily and weekly mission goals.') },
      { route:'rank', icon:'shield', title:copy('Peringkat arena', 'Arena rank'), description:copy('Lihat Arena Rating dan jenjang peringkat lokalmu.', 'Check your Arena Rating and local rank tier.') },
      { route:'mastery', icon:'trophy', title:copy('Penguasaan game', 'Game mastery'), description:copy('Pantau perkembangan penguasaan untuk setiap game.', 'Track your mastery progression for each game.') },
      { route:'completion', icon:'grid', title:copy('Penyelesaian game', 'Game completion'), description:copy('Periksa game dan tingkat kesulitan yang sudah dituntaskan.', 'Review completed games and difficulty levels.') },
    ] },
    { id:'progress-plan', title:copy('Konsistensi & target', 'Consistency & goals'), description:copy('Lihat ritme latihan dan atur sasaranmu sendiri.', 'Review your training rhythm and set your own goals.'), cards:[
      { route:'activity-calendar', icon:'bolt', title:copy('Kalender aktivitas', 'Activity calendar'), description:copy('Lihat hari aktif, sesi, dan tantangan harian yang selesai.', 'Review active days, sessions, and completed daily challenges.') },
      { route:'goals', icon:'flag', title:copy('Target pribadi', 'Personal goals'), description:copy('Atur target latihan dan lihat progres yang tercatat.', 'Set practice goals and review your recorded progress.') },
    ] },
  ];

  return <div className="hub-page hub-progress">
    <header className="hub-heading">
      <p className="hub-eyebrow">{copy('JEJAK LATIHANMU', 'YOUR TRAINING JOURNEY')}</p>
      <h1>{copy('Progres', 'Progress')}</h1>
      <p>{copy('Ringkasan progresmu, dengan akses ke rincian aktivitas, pencapaian, dan target.', 'Your progress at a glance, with access to activity, achievements, and goals.')}</p>
      <p className="hub-local-note"><Icon name="shield" size={18}/>{copy('Progres lokal di perangkat ini. Tidak ada sinkronisasi cloud aktif.', 'Progress is local to this device. No live cloud sync.')}</p>
    </header>

    {!storageOk && <p className="hub-storage-warning" role="status"><Icon name="shield" size={20}/>{copy('Penyimpanan tidak tersedia. Progres hanya bertahan selama sesi tab ini; buka Pengaturan untuk alat data dan backup.', 'Storage is unavailable. Progress lasts only for this tab session; open Settings for data and backup tools.')}<button className="hub-button" onClick={() => onNavigate('settings')}>{copy('Pengaturan', 'Settings')}</button></p>}

    <section className="hub-section hub-summary" aria-labelledby="progress-summary-title">
      <h2 id="progress-summary-title">{copy('Ringkasanmu', 'Your summary')}</h2>
      <dl className="hub-stats">
        <div><dt><Icon name="spark" size={18}/>{copy('Total XP', 'Total XP')}</dt><dd>{number(profile.xp)} <span>XP</span></dd></div>
        <div><dt><Icon name="layers" size={18}/>{copy('Level', 'Level')}</dt><dd>{number(levelInfo.level)}</dd></div>
        <div><dt><Icon name="bolt" size={18}/>{copy('Streak harian', 'Daily streak')}</dt><dd>{number(currentStreak)} <span>{copy('hari', 'days')}</span></dd></div>
        <div><dt><Icon name="checklist" size={18}/>{copy('Hadiah misi siap', 'Mission rewards ready')}</dt><dd>{number(readyCount)}</dd></div>
      </dl>
      <div className="hub-level-progress">
        <label htmlFor="progress-level-xp">{levelInfo.level >= 99 ? copy('XP level saat ini', 'Current level XP') : copy('XP menuju level berikutnya', 'XP toward the next level')}<span>{number(levelInfo.currentXp)} / {number(levelInfo.neededXp)} XP</span></label>
        <progress id="progress-level-xp" max={levelInfo.neededXp} value={levelInfo.currentXp}/>
      </div>
      {readyCount > 0
        ? <button className="hub-button hub-button-primary" onClick={() => onNavigate('missions')}>{copy(`Lihat ${readyCount} hadiah misi siap diklaim`, `View ${readyCount} mission rewards ready to claim`)}<Icon name="arrow" size={18}/></button>
        : <p className="hub-secondary">{copy('Belum ada hadiah misi siap diklaim. Target tetap bisa dilihat di Misi.', 'No mission rewards ready to claim. You can still view your goals in Missions.')}</p>}
    </section>

    {profile.completions === 0 && <section className="hub-empty" aria-labelledby="progress-empty-title">
      <span className="hub-card-icon"><Icon name="gamepad" size={24}/></span>
      <div><h2 id="progress-empty-title">{copy('Belum ada sesi selesai.', 'No completed sessions yet.')}</h2><p>{copy('Selesaikan satu game untuk mulai mengisi riwayat dan rincian progres. Semua halaman di bawah tetap dapat dibuka.', 'Complete a game to start building your history and progress details. All pages below remain available.')}</p></div>
      <button className="hub-button" onClick={() => onNavigate('games')}>{copy('Pilih permainan', 'Choose a game')}<Icon name="arrow" size={18}/></button>
    </section>}

    {groups.map(group => <section key={group.id} className="hub-section" aria-labelledby={group.id}>
      <div className="hub-section-heading"><h2 id={group.id}>{group.title}</h2><p>{group.description}</p></div>
      <nav className={`hub-card-grid${group.cards.length === 2 ? ' hub-card-grid-two' : ''}`} aria-labelledby={group.id}>
        {group.cards.map(card => <button key={card.route} className="hub-card" onClick={() => onNavigate(card.route)}>
          <span className="hub-card-icon"><Icon name={card.icon} size={24}/></span>
          <span className="hub-card-copy"><strong>{card.title}</strong><span>{card.description}</span></span>
          <Icon name="chevron" size={18}/>
        </button>)}
      </nav>
    </section>)}
  </div>;
}
