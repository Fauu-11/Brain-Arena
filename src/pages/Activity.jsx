import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { gameById } from '../data/games.js';
import { readText } from '../utils/storage.js';
import { formatMinesweeperTime } from '../utils/minesweeper.js';
import Icon from '../components/Icon.jsx';
import Dialog from '../components/Dialog.jsx';
export default function Activity({ onNavigate }) {
  const { lang } = useLanguage(); const { history, favorites, clearHistory } = useArena(); const [confirm, setConfirm] = useState(false);
  const copy = (id,en) => lang === 'id' ? id : en;
  const arenaDifficulties = ['hard','very-hard','impossible'];
  const arenaLabel = (difficulty) => `universitas ${difficulty.replace('-', ' ')}`;
  const readArenaRecord = (prefix, difficulty, { min = 0, legacyExtreme = true } = {}) => {
    let raw = readText(`${prefix}universitas_${difficulty}`);
    // v1.9 used the name `extreme`; keep old personal records readable after the v1.10 rename.
    if (raw === null && legacyExtreme && difficulty === 'impossible') raw = readText(`${prefix}universitas_extreme`);
    const value = Number(raw);
    return raw !== null && Number.isFinite(value) && value >= min ? value : null;
  };
  const records = [];
  const recordGames = [{ id:'pixel', prefix:'pixel_best_' },{ id:'sudoku', prefix:'blind_sudoku_best_' },{ id:'minesweeper', prefix:'minesweeper_best_' }];
  for (const game of recordGames) {
    for (const level of ['sd','smp','sma']) {
      const raw = readText(game.prefix + level); const value = Number(raw);
      if (raw !== null && Number.isFinite(value) && value >= 0) records.push({ id:game.id, level, value, type:'time' });
    }
    for (const difficulty of arenaDifficulties) {
      const value = readArenaRecord(game.prefix, difficulty);
      if (value !== null) records.push({ id:game.id, level:arenaLabel(difficulty), value, type:'time' });
    }
  }
  for (const level of ['sd','smp','sma']) { const raw=readText(`maze_best_${level}`); const value=Number(raw); if (raw!==null && Number.isFinite(value) && value>=0) records.push({id:'maze',level,value,type:'time'}); }
  for (const difficulty of arenaDifficulties) { const value=readArenaRecord('maze_best_',difficulty); if (value!==null) records.push({id:'maze',level:arenaLabel(difficulty),value,type:'time'}); }
  for (const level of ['sd','smp','sma']) { const raw=readText(`matrix_best_${level}`); const value=Number(raw); if (raw!==null && Number.isFinite(value) && value>0) records.push({id:'matrix',level,value,type:'score'}); }
  for (const difficulty of arenaDifficulties) { const value=readArenaRecord('matrix_best_',difficulty,{min:1}); if (value!==null) records.push({id:'matrix',level:arenaLabel(difficulty),value,type:'score'}); }
  return <section><div className="page-heading"><div><p className="eyebrow">{copy('SETIAP LANGKAH BERARTI','EVERY LITTLE STEP COUNTS')}</p><h1>{copy('Jejak tantanganmu.','Your arena activity.')}</h1><p className="page-intro">{copy('Lihat game yang pernah kamu buka dan rekor terbaikmu di sini.','Keep track of your recent games and personal bests, all in one place.')}</p></div><span className="local-label"><Icon name="shield" size={15}/>{copy('Hanya di browser ini','Only in this browser')}</span></div><div className="activity-stats">{[[history.length,copy('Game dibuka','Games opened'),'clock'],[new Set(history.map(g=>g.id)).size,copy('Game berbeda','Different games'),'grid'],[favorites.length,copy('Game favorit','Favorite games'),'star']].map(([value,label,icon])=><article key={label}><span className="stat-icon"><Icon name={icon}/></span><div><strong>{value}</strong><span>{label}</span></div></article>)}</div>
    <section className="activity-panel"><div className="section-heading"><div><h2>{copy('Terakhir dibuka','Recently opened')}</h2><p>{copy('Membuka game kembali akan memulai sesi baru. Maksimal 100 riwayat disimpan.','Reopening a game starts a new session. Up to 100 history entries are saved.')}</p></div>{history.length>0 && <button className="text-button danger-text" onClick={()=>setConfirm(true)}><Icon name="trash" size={15}/>{copy('Hapus riwayat','Clear history')}</button>}</div>{history.length ? <div className="history-list">{history.map((entry,i) => { const game=gameById(entry.id); return <div key={`${entry.time}-${i}`} className="history-row"><span className={`mini-game-icon color-${game.color}`}><Icon name={game.icon}/></span><div><strong>{game.title[lang]}</strong><time dateTime={new Date(entry.time).toISOString()}>{new Intl.DateTimeFormat(lang==='id'?'id-ID':'en-GB',{dateStyle:'medium',timeStyle:'short'}).format(entry.time)}</time></div><span className="opened-label">{copy('Dibuka','Opened')}</span><button className="text-button" onClick={()=>onNavigate(game.id)}>{copy('Main lagi','Play again')}<Icon name="arrow" size={16}/></button></div>; })}</div> : <div className="empty-state compact-empty"><span className="empty-icon"><Icon name="activity" size={27}/></span><h3>{copy('Petualanganmu baru dimulai.','Your journey starts here.')}</h3><p>{copy('Buka game pertamamu, lalu lihat riwayatnya di sini.','Open your first game and see your activity here.')}</p><button className="ba-button primary" onClick={()=>onNavigate('games')}>{copy('Mulai menjelajah','Explore games')}<Icon name="arrow" size={16}/></button></div>}</section>
    <section className="records-section"><div className="section-heading"><div><h2>{copy('Rekor pribadi','Personal bests')}</h2><p>{copy('Rekor Digit Piksel, Sudoku Buta, Minesweeper, Maze Escape, dan Memory Matrix dibaca dari penyimpanan lokal.','Pixel Digits, Blind Sudoku, Minesweeper, Maze Escape, and Memory Matrix records are read from local storage.')}</p></div><Icon name="trophy"/></div>{records.length ? <div className="records-grid">{records.map(record=><article className="record-card" key={record.id+record.level}><Icon name="trophy" size={24}/><div><h3>{gameById(record.id).title[lang]}</h3><p>{record.level.toUpperCase()}</p></div><strong>{record.type === 'score' ? record.value.toLocaleString(lang==='id'?'id-ID':'en-US') : (['minesweeper','maze'].includes(record.id) ? formatMinesweeperTime(record.value) : record.value)}{record.type === 'score' ? <small> {copy('poin','pts')}</small> : !['minesweeper','maze'].includes(record.id) && <small> {copy('detik','sec')}</small>}</strong></article>)}</div> : <p className="record-empty">{copy('Belum ada rekor. Selesaikan salah satu game yang mendukung rekor untuk mencatat pencapaian terbaikmu.','No records yet. Complete a record-enabled game to set your first personal best.')}</p>}</section>
    <Dialog open={confirm} onClose={()=>setConfirm(false)} title={copy('Hapus riwayat aktivitas?','Clear your activity history?')}><p className="dialog-description">{copy('Hanya daftar game yang dibuka akan dihapus. Favorit dan rekor terbaik tetap tersimpan. Tindakan ini tidak bisa dibatalkan.','Only the list of opened games will be removed. Favorites and best records will stay saved. This action cannot be undone.')}</p><div className="dialog-actions"><button className="ba-button outline" onClick={()=>setConfirm(false)}>{copy('Batal','Cancel')}</button><button className="ba-button danger" onClick={()=>{clearHistory();setConfirm(false);}}>{copy('Hapus riwayat','Clear history')}</button></div></Dialog>
  </section>;
}
