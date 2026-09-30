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
  const pages = { games: 'games', permainan: 'games', favorites: 'favorites', favorit: 'favorites', activity: 'activity', aktivitas: 'activity', guides: 'guides', panduan: 'guides', tips: 'guides' };
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
