// One catalog for navigation, search, artwork and routes.
export const GAMES = [
  { id: '300', slug: 'aritmatika', category: 'math', icon: 'bolt', color: 'purple', mode: 'solo', title: { id: 'Blitz Aritmatika', en: 'Arithmetic Blitz' }, description: { id: 'Berpikir cepat, hitung tepat. Taklukkan hingga 300 soal matematika.', en: 'Think fast. Calculate faster. Take on up to 300 arithmetic problems.' } },
  { id: 'prime', slug: 'bilangan-prima', category: 'math', icon: 'hash', color: 'mint', mode: 'duel', title: { id: 'Perburuan Prima', en: 'Prime Hunter' }, description: { id: 'Temukan bilangan prima yang tersembunyi. Jadilah yang paling jeli.', en: 'Hunt down hidden prime numbers. Outsmart your opponent, one tile at a time.' } },
  { id: 'pixel', slug: 'warna-pixel', category: 'logic', icon: 'grid', color: 'peach', mode: 'solo', title: { id: 'Digit Piksel', en: 'Pixel Digits' }, description: { id: 'Satukan kepingan piksel menjadi angka. Setiap pola punya jawabannya.', en: 'Combine pixel fragments into digits. Every pattern has its perfect match.' } },
  { id: 'mnm', slug: 'mnm-grid', category: 'memory', icon: 'layers', color: 'blue', mode: 'duel', title: { id: 'Match & Mix', en: 'Match & Mix' }, description: { id: 'Ingat pasangannya, geser papannya. Uji memori sekaligus strategimu.', en: 'Remember the pairs. Shift the board. Put your memory and strategy to the test.' } },
  { id: 'cube', slug: 'kubus-3d', category: 'logic', icon: 'cube', color: 'yellow', mode: 'solo', title: { id: 'Hitung Kubus', en: 'Cube Count' }, description: { id: 'Lihat lebih dari satu sisi. Hitung semua kubus, termasuk yang tersembunyi.', en: 'See beyond the surface. Count every cube, including the ones you cannot see.' } },
  { id: 'rps', slug: 'suwit', category: 'strategy', icon: 'dice', color: 'pink', mode: 'duel', title: { id: 'Duel Dadu', en: 'Dice Duel' }, description: { id: 'Rencanakan langkah dan gulingkan dadu. Kuasai arena gunting, batu, kertas.', en: 'Plan your moves and roll the dice. Master a rock-paper-scissors battle board.' } },
  { id: 'sudoku', slug: 'sudoku', category: 'memory', icon: 'brain', color: 'lavender', mode: 'solo', title: { id: 'Sudoku Buta', en: 'Blind Sudoku' }, description: { id: 'Hafalkan angkanya sebelum menghilang. Selesaikan Sudoku dari ingatan.', en: 'Memorize the numbers before they disappear. Solve Sudoku from memory.' } },
  { id: 'minesweeper', slug: 'minesweeper', category: 'logic', icon: 'mine', color: 'mint', mode: 'solo', title: { id: 'Minesweeper', en: 'Minesweeper' }, description: { id: 'Baca petunjuk angka, tandai ranjau, dan bersihkan semua petak aman.', en: 'Read the number clues, flag the mines, and clear every safe cell.' } },
  { id: 'maze', slug: 'maze-escape', category: 'strategy', icon: 'maze', color: 'blue', mode: 'solo', title: { id: 'Maze Escape', en: 'Maze Escape' }, description: { id: 'Cari jalur keluar secepat mungkin. Setiap langkah menentukan jalanmu.', en: 'Find the exit as fast as you can. Every move shapes your route.' } },
  { id: 'matrix', slug: 'memory-matrix', category: 'memory', icon: 'matrix', color: 'lavender', mode: 'solo', title: { id: 'Memory Matrix', en: 'Memory Matrix' }, description: { id: 'Hafalkan pola cahaya, lalu bangun kembali matriksnya dari ingatan.', en: 'Memorize the lit pattern, then rebuild the matrix from memory.' } },
  { id: 'nonogram', slug: 'nonogram', category: 'logic', icon: 'grid', color: 'peach', mode: 'solo', title: { id: 'Nonogram', en: 'Nonogram' }, description: { id: 'Baca petunjuk baris dan kolom untuk mengungkap gambar tersembunyi.', en: 'Read row and column clues to reveal the hidden picture.' } },
  { id: 'game2048', slug: '2048', category: 'math', icon: 'hash', color: 'yellow', mode: 'solo', title: { id: '2048', en: '2048' }, description: { id: 'Geser dan gabungkan angka. Bangun rantai hingga mencapai target tertinggi.', en: 'Slide and merge numbers. Build a chain until you reach the target tile.' } },
  {"id": "codebreaker", "slug": "pecahkan-sandi", "category": "logic", "icon": "hash", "color": "mint", "mode": "solo", "title": {"id": "Pecahkan Sandi", "en": "Code Breaker"}, "description": {"id": "Tebak sandi angka melalui petunjuk posisi dan jumlah digit benar.", "en": "Crack a numeric code using exact-position and misplaced-digit feedback."}},
  {"id": "lightsout", "slug": "padamkan-lampu", "category": "logic", "icon": "grid", "color": "yellow", "mode": "solo", "title": {"id": "Padamkan Lampu", "en": "Lights Out"}, "description": {"id": "Balik keadaan lampu dan tetangganya hingga seluruh papan padam.", "en": "Toggle lights and their neighbors until the entire board is dark."}},
  {"id": "sequence", "slug": "jejak-ingatan", "category": "memory", "icon": "brain", "color": "lavender", "mode": "solo", "title": {"id": "Jejak Ingatan", "en": "Sequence Recall"}, "description": {"id": "Amati urutan tombol yang menyala lalu ulangi, satu langkah lebih panjang setiap ronde.", "en": "Watch a sequence of highlighted buttons and recall a growing sequence each round."}},
  {"id": "kakuro", "slug": "kakuro", "category": "math", "icon": "hash", "color": "peach", "mode": "solo", "title": {"id": "Silang Angka", "en": "Kakuro"}, "description": {"id": "Isi kelompok angka 1–9 agar jumlah mendatar dan menurun sesuai petunjuk.", "en": "Fill crossing groups with digits 1–9 to match their clue sums."}},
  {"id": "slitherlink", "slug": "slitherlink", "category": "logic", "icon": "maze", "color": "blue", "mode": "solo", "title": {"id": "Lingkar Logika", "en": "Slitherlink"}, "description": {"id": "Hubungkan titik menjadi satu lingkaran sesuai jumlah sisi pada setiap petunjuk.", "en": "Join dots into one loop matching each numbered cell’s edge count."}},
];
export const CATEGORIES = {
  all: { id: 'Semua kategori', en: 'All categories' },
  math: { id: 'Matematika', en: 'Mathematics' },
  logic: { id: 'Logika', en: 'Logic' },
  memory: { id: 'Memori', en: 'Memory' },
  strategy: { id: 'Strategi', en: 'Strategy' },
};
export const gameById = id => GAMES.find(game => game.id === id);
export function resolveRoute(hash = '') {
  let path;
  try { path = decodeURIComponent(hash.replace(/^#\/?/, '').split('?')[0]).replace(/\/+$/, ''); }
  catch { return 'not-found'; }
  if (!path || path === 'home') return 'home';
  const pages={games:'games',permainan:'games',guides:'guides',panduan:'guides',tips:'guides',settings:'settings',pengaturan:'settings'};
  if(Object.hasOwn(pages,path))return pages[path];
  if (path.startsWith('tips-')) {
    const game = GAMES.find(g => g.id === path.slice(5) || g.slug === path.slice(5));
    return game ? `tips-${game.id}` : 'not-found';
  }
  const normalized = path.replace(/^game-/, '');
  return GAMES.find(g => g.id === normalized || g.slug === normalized)?.id || 'home';
}
export function routeHash(view) {
  if (view === 'home') return '#/';
  return `#/${gameById(view)?.slug || view}`;
}
