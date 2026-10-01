// One catalog for navigation, search, artwork and routes.
export const GAMES = [
  { id: '300', slug: 'aritmatika', season: 1, category: 'math', difficulty: 'medium', icon: 'bolt', color: 'purple', mode: 'solo', title: { id: 'Blitz Aritmatika', en: 'Arithmetic Blitz' }, description: { id: 'Berpikir cepat, hitung tepat. Taklukkan hingga 300 soal matematika.', en: 'Think fast. Calculate faster. Take on up to 300 arithmetic problems.' } },
  { id: 'prime', slug: 'bilangan-prima', season: 1, category: 'math', difficulty: 'hard', icon: 'hash', color: 'mint', mode: 'duel', title: { id: 'Perburuan Prima', en: 'Prime Hunter' }, description: { id: 'Temukan bilangan prima yang tersembunyi. Jadilah yang paling jeli.', en: 'Hunt down hidden prime numbers. Outsmart your opponent, one tile at a time.' } },
  { id: 'pixel', slug: 'warna-pixel', season: 1, category: 'logic', difficulty: 'hard', icon: 'grid', color: 'peach', mode: 'solo', title: { id: 'Digit Piksel', en: 'Pixel Digits' }, description: { id: 'Satukan kepingan piksel menjadi angka. Setiap pola punya jawabannya.', en: 'Combine pixel fragments into digits. Every pattern has its perfect match.' } },
  { id: 'mnm', slug: 'mnm-grid', season: 1, category: 'memory', difficulty: 'expert', icon: 'layers', color: 'blue', mode: 'duel', title: { id: 'Match & Mix', en: 'Match & Mix' }, description: { id: 'Ingat pasangannya, geser papannya. Uji memori sekaligus strategimu.', en: 'Remember the pairs. Shift the board. Put your memory and strategy to the test.' } },
  { id: 'cube', slug: 'kubus-3d', season: 1, category: 'logic', difficulty: 'medium', icon: 'cube', color: 'yellow', mode: 'solo', title: { id: 'Hitung Kubus', en: 'Cube Count' }, description: { id: 'Lihat lebih dari satu sisi. Hitung semua kubus, termasuk yang tersembunyi.', en: 'See beyond the surface. Count every cube, including the ones you cannot see.' } },
  { id: 'rps', slug: 'suwit', season: 1, category: 'strategy', difficulty: 'hard', icon: 'dice', color: 'pink', mode: 'duel', title: { id: 'Duel Dadu', en: 'Dice Duel' }, description: { id: 'Rencanakan langkah dan gulingkan dadu. Kuasai arena gunting, batu, kertas.', en: 'Plan your moves and roll the dice. Master a rock-paper-scissors battle board.' } },
  { id: 'sudoku', slug: 'sudoku', season: 2, category: 'memory', difficulty: 'expert', icon: 'brain', color: 'lavender', mode: 'solo', title: { id: 'Sudoku Buta', en: 'Blind Sudoku' }, description: { id: 'Hafalkan angkanya sebelum menghilang. Selesaikan Sudoku dari ingatan.', en: 'Memorize the numbers before they disappear. Solve Sudoku from memory.' } },
  { id: 'minesweeper', slug: 'minesweeper', season: 2, category: 'logic', difficulty: 'hard', icon: 'mine', color: 'mint', mode: 'solo', title: { id: 'Minesweeper', en: 'Minesweeper' }, description: { id: 'Baca petunjuk angka, tandai ranjau, dan bersihkan semua petak aman.', en: 'Read the number clues, flag the mines, and clear every safe cell.' } },
  { id: 'maze', slug: 'maze-escape', season: 3, category: 'strategy', difficulty: 'hard', icon: 'maze', color: 'blue', mode: 'solo', title: { id: 'Maze Escape', en: 'Maze Escape' }, description: { id: 'Cari jalur keluar secepat mungkin. Setiap langkah menentukan jalanmu.', en: 'Find the exit as fast as you can. Every move shapes your route.' } },
  { id: 'matrix', slug: 'memory-matrix', season: 3, category: 'memory', difficulty: 'expert', icon: 'matrix', color: 'lavender', mode: 'solo', title: { id: 'Memory Matrix', en: 'Memory Matrix' }, description: { id: 'Hafalkan pola cahaya, lalu bangun kembali matriksnya dari ingatan.', en: 'Memorize the lit pattern, then rebuild the matrix from memory.' } },
  { id: 'nonogram', slug: 'nonogram', season: 4, category: 'logic', difficulty: 'expert', icon: 'grid', color: 'peach', mode: 'solo', title: { id: 'Nonogram', en: 'Nonogram' }, description: { id: 'Baca petunjuk baris dan kolom untuk mengungkap gambar tersembunyi.', en: 'Read row and column clues to reveal the hidden picture.' } },
  { id: 'game2048', slug: '2048', season: 4, category: 'math', difficulty: 'expert', icon: 'hash', color: 'yellow', mode: 'solo', title: { id: '2048', en: '2048' }, description: { id: 'Geser dan gabungkan angka. Bangun rantai hingga mencapai target tertinggi.', en: 'Slide and merge numbers. Build a chain until you reach the target tile.' } },
];
export const CATEGORIES = {
  all: { id: 'Semua kategori', en: 'All categories' },
  math: { id: 'Matematika', en: 'Mathematics' },
  logic: { id: 'Logika', en: 'Logic' },
  memory: { id: 'Memori', en: 'Memory' },
  strategy: { id: 'Strategi', en: 'Strategy' },
};
export const DIFFICULTIES = { medium: { id: 'Sedang', en: 'Medium' }, hard: { id: 'Sulit', en: 'Hard' }, expert: { id: 'Ahli', en: 'Expert' } };
export const gameById = id => GAMES.find(game => game.id === id);
export function resolveRoute(hash = '') {
  let path;
  try { path = decodeURIComponent(hash.replace(/^#\/?/, '').split('?')[0]).replace(/\/+$/, ''); }
  catch { return 'not-found'; }
  if (!path || path === 'home') return 'home';
  if (path.startsWith('challenge/')) return 'challenge';
  const pages = { games:'games', permainan:'games', favorites:'favorites', favorit:'favorites', activity:'activity', aktivitas:'activity', guides:'guides', panduan:'guides', tips:'guides', daily:'daily', harian:'daily', 'daily-archive':'daily-archive', arsip:'daily-archive', profile:'profile', profil:'profile', achievements:'achievements', pencapaian:'achievements', badges:'achievements', missions:'missions', misi:'missions', quests:'missions', leaderboard:'leaderboard', peringkat:'leaderboard', rank:'rank', ranking:'rank', customize:'customize', kustomisasi:'customize', statistics:'statistics', statistik:'statistics', 'activity-calendar':'activity-calendar', calendar:'activity-calendar', kalender:'activity-calendar', season:'season', musim:'season', events:'events', event:'events', mastery:'mastery', penguasaan:'mastery', settings:'settings', pengaturan:'settings', feedback:'feedback', saran:'feedback', masukan:'feedback', 'arena-run':'arena-run', tournament:'arena-run', turnamen:'arena-run', 'arena-builder':'arena-builder', builder:'arena-builder', history:'history', riwayat:'history', replay:'replay', completion:'completion', koleksi:'completion', 'data-health':'data-health', health:'data-health', offline:'offline', goals:'goals', target:'goals', profiles:'profiles', pemain:'profiles', showcase:'showcase', 'share-result':'share-result', share:'share-result', 'arena-cup':'arena-cup', cup:'arena-cup', 'practice-lab':'practice-lab', lab:'practice-lab', 'save-slots':'save-slots', saves:'save-slots', 'storage-center':'storage-center', storage:'storage-center', diagnostics:'diagnostics', diagnostic:'diagnostics', controls:'controls', controller:'controls', challenge:'challenge' };
  if (Object.hasOwn(pages, path)) return pages[path];
  if (path.startsWith('tips-')) {
    const game = GAMES.find(g => g.id === path.slice(5) || g.slug === path.slice(5));
    return game ? `tips-${game.id}` : 'not-found';
  }
  const normalized = path.replace(/^game-/, '');
  return GAMES.find(g => g.id === normalized || g.slug === normalized)?.id || 'not-found';
}
export function routeHash(view) {
  if (view === 'home') return '#/';
  return `#/${gameById(view)?.slug || view}`;
}
