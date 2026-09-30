import React from 'react';
import { GAMES, CATEGORIES } from '../data/games.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Icon from '../components/Icon.jsx';

export default function Guides({ onNavigate }) {
  const { lang } = useLanguage();
  const copy = (id, en) => lang === 'id' ? id : en;
  const learning = [
    [copy('Pahami tujuan', 'Know the objective'), copy('Mulai dari aturan, cara menang, kontrol, dan apa yang berubah di tiap tingkat.', 'Start with the rules, win condition, controls, and what changes by level.'), 'book'],
    [copy('Ikuti tutorial', 'Follow the tutorial'), copy('Pelajari alur permainan langkah demi langkah sebelum masuk ke arena.', 'Learn the complete flow step by step before entering the arena.'), 'play'],
    [copy('Pelajari cara memecahkan', 'Learn how to solve'), copy('Gunakan metode keputusan, contoh pemecahan, dan pola inti saat kamu terjebak.', 'Use decision methods, worked examples, and core patterns when you get stuck.'), 'brain'],
    [copy('Kuasai strategi', 'Master the strategy'), copy('Naikkan level dengan trik lanjutan, rumus, serta daftar kesalahan yang harus dihindari.', 'Level up with advanced tips, formulas, and common mistakes to avoid.'), 'trophy'],
  ];
  return <section className="guides-page guides-v15">
    <div className="guide-library-hero">
      <div>
        <p className="eyebrow">{copy('BRAIN ARENA LEARNING HUB', 'BRAIN ARENA LEARNING HUB')}</p>
        <h1>{copy('Bukan sekadar aturan. Pelajari cara menang.', 'More than rules. Learn how to solve.')}</h1>
        <p>{copy(`Panduan lengkap untuk ${GAMES.length} permainan: tutorial langkah demi langkah, contoh pemecahan, strategi per tingkat, dan kesalahan yang perlu dihindari.`, `Complete guides for ${GAMES.length} games: step-by-step tutorials, worked examples, level-specific strategy, and mistakes to avoid.`)}</p>
        <div className="guide-library-stats"><span><strong>{GAMES.length}</strong>{copy('game', 'games')}</span><span><strong>4</strong>{copy('bagian belajar', 'learning sections')}</span><span><strong>SD–Univ</strong>{copy('tingkat', 'levels')}</span></div>
      </div>
      <span className="guide-library-icon"><Icon name="book" size={42}/></span>
    </div>

    <div className="guide-learning-path">{learning.map(([title,text,icon],index)=><article key={title}><span className="guide-path-icon"><Icon name={icon} size={18}/></span><div><small>0{index+1}</small><h2>{title}</h2><p>{text}</p></div></article>)}</div>

    <div className="section-heading guide-library-heading"><div><h2>{copy('Pilih permainan yang ingin dikuasai','Choose a game to master')}</h2><p>{copy('Setiap panduan bisa langsung dipakai sebagai tutorial sebelum bermain.','Each guide works as a practical tutorial before you play.')}</p></div><span className="muted-text">{GAMES.length} {copy('panduan lengkap','complete guides')}</span></div>
    <div className="guides-grid">{GAMES.map(game => <article className={`guide-card guide-card-v15 color-${game.color}`} key={game.id}>
      <div className="guide-card-top"><span className="mini-game-icon"><Icon name={game.icon} size={24}/></span><span className="guide-card-season">S{game.season}</span></div>
      <span className="eyebrow">{CATEGORIES[game.category][lang]}</span>
      <h2>{game.title[lang]}</h2>
      <p>{game.description[lang]}</p>
      <div className="guide-card-features"><span><Icon name="play" size={12}/>{copy('Tutorial','Tutorial')}</span><span><Icon name="brain" size={12}/>{copy('Pemecahan','Solving')}</span><span><Icon name="trophy" size={12}/>{copy('Strategi','Strategy')}</span></div>
      <div className="guide-card-actions"><button className="text-button" onClick={() => onNavigate(`tips-${game.id}`)}>{copy('Buka panduan lengkap','Open complete guide')}<Icon name="arrow" size={16}/></button><button className="icon-button" onClick={() => onNavigate(game.id)} aria-label={`${copy('Mainkan','Play')} ${game.title[lang]}`}><Icon name="play" size={17}/></button></div>
    </article>)}</div>
    <div className="privacy-note guide-learning-note"><Icon name="brain"/><p>{copy('Saran: buka tab “Tutorial langkah” sebelum pertama kali bermain, lalu gunakan “Cara memecahkan” saat sudah memahami kontrol tetapi masih kesulitan mengambil keputusan.','Tip: open “Step tutorial” before your first game, then use “How to solve” once you know the controls but still struggle with decisions.')}</p></div>
  </section>;
}
