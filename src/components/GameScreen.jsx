import React from 'react';
import Icon from './Icon.jsx';
import Artwork from './Artwork.jsx';
import { gameById, CATEGORIES } from '../data/games.js';
import { useArena } from '../context/ArenaContext.jsx';

// Presentation only: game state, timers, scoring and generators stay in each game.
const GUIDES = {
  '300': {
    steps: {
      id: ['Pilih jenjang dan mode latihan atau arena.', 'Tentukan materi dan tingkat tantangan.', 'Ketik jawaban dengan teliti, lalu kirim.'],
      en: ['Choose your level and practice or arena mode.', 'Select topics and the challenge difficulty.', 'Type your answer carefully, then submit.'],
    },
    tip: { id: 'Akurasi dulu, kecepatan menyusul. Mulai dari materi yang paling kamu kuasai.', en: 'Accuracy first, speed second. Start with the topics you know best.' },
    input: { id: 'Keyboard untuk jawaban; Enter untuk mengirim atau pindah soal.', en: 'Use your keyboard; Enter submits or moves to the next question.' },
  },
  prime: {
    steps: {
      id: ['Pilih tingkat kesulitan dan lawan bermain.', 'Cari bilangan prima di antara angka pada papan.', 'Pilih angka yang tepat dan kumpulkan poin.'],
      en: ['Choose a difficulty and an opponent.', 'Find prime numbers among the tiles.', 'Select the right numbers and earn points.'],
    },
    tip: { id: 'Selain 2, semua bilangan prima ganjil. Tapi tidak semua bilangan ganjil itu prima.', en: 'Every prime except 2 is odd. But not every odd number is prime.' },
    input: { id: 'Klik atau ketuk angka pada papan. Dua pemain bergantian di satu perangkat.', en: 'Click or tap a number. Two players take turns on one device.' },
  },
  pixel: {
    steps: {
      id: ['Perhatikan angka target yang harus disusun.', 'Pilih kepingan piksel yang saling melengkapi.', 'Cocokkan hasil gabungan dengan angka target.'],
      en: ['Look at the target digits.', 'Choose pixel fragments that complement each other.', 'Match the combined pattern to a target digit.'],
    },
    tip: { id: 'Mulai dari bentuk yang paling khas. Perhatikan garis di bagian atas dan bawah angka.', en: 'Start with a distinctive shape. Check the top and bottom strokes of each digit.' },
    input: { id: 'Klik atau ketuk kepingan; gunakan tombol pada panel untuk memeriksa gabungan.', en: 'Click or tap fragments, then use the panel buttons to check the combination.' },
  },
  mnm: {
    steps: {
      id: ['Hafalkan posisi pasangan sebelum waktu habis.', 'Buka dua keping yang memiliki angka sama.', 'Geser ubin saat fase Mix, lalu ingat posisi barunya.'],
      en: ['Memorize the matching pairs before time runs out.', 'Reveal two chips with matching numbers.', 'Slide a tile during Mix and remember its new position.'],
    },
    tip: { id: 'Ingat pasangan berdasarkan posisi ubinnya, bukan hanya angka. Posisi bisa berubah setelah digeser.', en: 'Remember each pair by its tile position as well as its number. Sliding changes the layout.' },
    input: { id: 'Klik atau ketuk keping. Saat Mix, pilih ubin yang bisa digeser.', en: 'Click or tap chips. During Mix, choose a tile that can slide.' },
  },
  cube: {
    steps: {
      id: ['Amati susunan kubus dari tampilan isometrik.', 'Hitung seluruh kubus, termasuk penyangga tersembunyi.', 'Kirim jawaban sebelum waktu setiap level habis.'],
      en: ['Inspect the isometric cube stack.', 'Count every cube, including hidden supports.', 'Submit before the timer for each level runs out.'],
    },
    tip: { id: 'Hitung lapis demi lapis dari bawah. Kubus yang terlihat di atas juga memerlukan penyangga.', en: 'Count one layer at a time from the bottom. Higher cubes also need support below.' },
    input: { id: 'Ketik jumlah kubus, lalu tekan Enter atau tombol Kirim.', en: 'Type the total, then press Enter or select Submit.' },
  },
  rps: {
    steps: {
      id: ['Hafalkan jaring-jaring; kotak tengah adalah sisi atas.', 'Rencanakan arah gerak sesuai jumlah langkah.', 'Putar dadu dan adukan sisi bawahnya dengan ubin arena.'],
      en: ['Memorize the die net; its center is the top face.', 'Plan directions for the required number of steps.', 'Roll and match the bottom face against the arena tile.'],
    },
    tip: { id: 'Bayangkan orientasi dadu setelah setiap langkah. Sisi bawah terakhir menentukan hasil. Skor kalah berkurang satu dan bisa negatif.', en: 'Track the die orientation after every step. The final bottom face decides the duel. A loss costs one point; scores can be negative.' },
    input: { id: 'Tombol arah atau WASD; Enter untuk putar; Backspace untuk batalkan satu langkah.', en: 'Arrow keys or WASD; Enter to roll; Backspace to undo one move.' },
  },
  sudoku: {
    steps: {
      id: ['Hafalkan angka pada papan yang ditampilkan.', 'Mulai bermain untuk menyembunyikan sebagian angka.', 'Isi sel kosong dan periksa jawabanmu.'],
      en: ['Memorize the numbers on the revealed board.', 'Start playing to hide some of the numbers.', 'Fill the empty cells and check your answers.'],
    },
    tip: { id: 'Bagi papan menjadi blok kecil saat menghafal. Angka yang tetap terlihat bisa menjadi petunjuk.', en: 'Memorize the board in small blocks. The remaining clues help you reconstruct it.' },
    input: { id: 'Pilih sel, lalu ketik angka atau gunakan keypad. Backspace untuk menghapus.', en: 'Select a cell, then type a number or use the keypad. Backspace clears it.' },
  },
  minesweeper: {
    steps: {
      id: ['Pilih ukuran papan dan jumlah ranjau sesuai jenjang.', 'Buka petak aman dan baca angka petunjuk di sekitarnya.', 'Tandai dugaan ranjau lalu bersihkan semua petak aman.'],
      en: ['Choose a board size and mine count for your level.', 'Open safe cells and read the surrounding number clues.', 'Flag suspected mines, then clear every safe cell.'],
    },
    tip: { id: 'Mulai dari petak kosong yang membuka area besar. Jangan menebak jika pola angka masih bisa disimpulkan.', en: 'Start from blank regions that reveal more of the board. Avoid guessing while the clues still allow deduction.' },
    input: { id: 'Klik/ketuk untuk membuka. Klik kanan atau tekan lama untuk bendera; Mode Bendera tersedia di mobile.', en: 'Click/tap to open. Right-click or long-press to flag; Flag Mode is available on mobile.' },
  },
};

export default function GameScreen({ gameId, lang = 'id', state = 'setup', level, onBack, onNavigate, onRules, stats, children }) {
  const game = gameById(gameId);
  const { favorites, toggleFavorite } = useArena();
  const copy = (id, en) => lang === 'en' ? en : id;
  const setup = !state || state.includes('setup');
  const memo = state === 'start' || state === 'planar' || state === 'folding';
  const ended = state === 'ended';
  const phase = setup ? 'setup' : memo ? 'memory' : ended ? 'result' : 'play';
  const phaseText = setup ? copy('Persiapan', 'Setup') : memo ? copy('Fase menghafal', 'Memorize') : ended ? copy('Selesai', 'Complete') : copy('Sedang bermain', 'In progress');
  const guide = GUIDES[gameId];
  const favorite = favorites.includes(gameId);
  const levelLabel = level === 'universitas' ? copy('Universitas', 'University') : level?.toUpperCase();
  const modeLabel = gameId === 'rps' ? copy('Duel lokal', 'Local duel') : game.mode === 'solo' ? copy('Pemain tunggal', 'Single player') : copy('Solo / duel lokal', 'Solo / local duel');

  return <section className={`arena-game color-${game.color} phase-${phase}`} data-game={gameId} data-state={state || 'setup'} aria-labelledby={`game-title-${gameId}`}>
    <div className="play-page-nav">
      <button className="play-back" onClick={onBack}><Icon name="back" size={17}/>{copy('Kembali ke beranda', 'Back to home')}</button>
      <div className="play-page-tools">
        <span className={`play-status ${phase}`}><i/>{phaseText}</span>
        <button className={`play-tool ${favorite ? 'selected' : ''}`} aria-pressed={favorite} aria-label={favorite ? copy('Hapus dari favorit', 'Remove from favorites') : copy('Tambah ke favorit', 'Add to favorites')} onClick={() => toggleFavorite(gameId)}><Icon name="star" size={17} filled={favorite}/></button>
      </div>
    </div>

    <header className="play-hero">
      <div className="play-hero-copy">
        <div className="play-eyebrow"><span>{copy('MUSIM', 'SEASON')} {String(game.season).padStart(2, '0')}</span><b/>{CATEGORIES[game.category][lang]}</div>
        <h1 id={`game-title-${gameId}`}>{game.title[lang]}<span>.</span></h1>
        <p>{game.description[lang]}</p>
        <div className="play-meta"><span><Icon name={game.mode === 'solo' ? 'user' : 'users'} size={14}/>{modeLabel}</span><span><Icon name="layers" size={14}/>{levelLabel || copy('4 jenjang', '4 levels')}</span><span className="play-local"><i/>{copy('Langsung main, tanpa akun', 'No account needed')}</span></div>
      </div>
      <div className="play-hero-art"><Artwork id={gameId}/></div>
    </header>

    <div className="play-layout">
      <div className="play-stage">
        <div className="play-stage-top"><span><Icon name={setup ? 'sliders' : memo ? 'brain' : ended ? 'trophy' : 'play'} size={17}/>{setup ? copy('Pengaturan permainan', 'Game settings') : memo ? copy('Amati. Ingat. Siap?', 'Look. Remember. Ready?') : ended ? copy('Hasil permainan', 'Your results') : copy('Arena bermain', 'The playing field')}</span>{stats ? <div className="play-live-stats">{stats}</div> : <span className="play-stage-label">{levelLabel || 'BRAIN ARENA'}</span>}</div>
        <div className="play-stage-body">{children}</div>
        <div className="play-stage-bottom"><Icon name="shield" size={14}/><span>{copy('Satu tantangan, satu langkah lebih baik.', 'One challenge. One step forward.')}</span>{onRules && <button onClick={onRules}><Icon name="book" size={14}/>{copy('Aturan', 'Rules')}</button>}</div>
      </div>

      <aside className="play-aside" aria-label={copy('Panduan singkat', 'Quick guide')}>
        <div className="play-guide-card"><div className="play-aside-heading"><span className="play-guide-icon"><Icon name="book" size={19}/></span><div><small>{copy('SEBELUM MULAI', 'GET STARTED')}</small><h2>{copy('Cara bermain', 'How to play')}</h2></div></div>
          <ol className="play-steps">{guide.steps[lang].map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
          {onRules && <button className="play-rules-link" onClick={onRules}>{copy('Baca aturan lengkap', 'Read the full rules')}<Icon name="arrow" size={15}/></button>}
        </div>
        <div className="play-tip-card"><span><Icon name="spark" size={18}/>{copy('Sedikit strategi', 'A little strategy')}</span><p>{guide.tip[lang]}</p>{onNavigate && setup && <button onClick={() => onNavigate(`tips-${gameId}`)}>{copy('Lihat tips & trik', 'More tips & tricks')}<Icon name="arrow" size={14}/></button>}</div>
        <div className="play-input-hint"><Icon name="keyboard" size={19}/><div><strong>{copy('Kontrol permainan', 'Game controls')}</strong><p>{guide.input[lang]}</p></div></div>
      </aside>
    </div>
  </section>;
}
