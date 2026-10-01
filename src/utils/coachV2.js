const opposite = new Map([
  ['ArrowUp','ArrowDown'],['ArrowDown','ArrowUp'],['ArrowLeft','ArrowRight'],['ArrowRight','ArrowLeft'],
  ['w','s'],['s','w'],['a','d'],['d','a'],['W','S'],['S','W'],['A','D'],['D','A'],
]);

export function brainCoachFocus(gameId, lang) {
  const en = lang === 'en';
  const tips = {
    maze: en ? 'Scan junctions before moving and avoid returning to the previous corridor unless the route is blocked.' : 'Baca persimpangan sebelum bergerak dan hindari kembali ke lorong sebelumnya kecuali jalurnya buntu.',
    sudoku: en ? 'Prioritize single candidates before trying speculative placements.' : 'Prioritaskan kandidat tunggal sebelum mencoba penempatan yang masih spekulatif.',
    minesweeper: en ? 'Convert number clues into guaranteed safe cells or guaranteed mines before guessing.' : 'Ubah petunjuk angka menjadi petak aman atau ranjau yang pasti sebelum menebak.',
    matrix: en ? 'Chunk the pattern into small regions instead of memorizing individual cells.' : 'Kelompokkan pola menjadi beberapa wilayah kecil, bukan menghafal tiap petak satu per satu.',
    game2048: en ? 'Keep your highest tile anchored to one corner and protect that edge.' : 'Pertahankan tile tertinggi di satu sudut dan lindungi sisi tersebut.',
    nonogram: en ? 'Start with rows or columns whose clues nearly fill the available length.' : 'Mulai dari baris atau kolom yang petunjuknya hampir memenuhi seluruh panjang.',
    prime: en ? 'Check divisibility by small primes first to eliminate composites quickly.' : 'Periksa pembagian dengan bilangan prima kecil terlebih dahulu untuk menyingkirkan komposit dengan cepat.',
    pixel: en ? 'Compare the most distinctive segment first before checking the smaller differences.' : 'Bandingkan segmen paling khas terlebih dahulu sebelum memeriksa perbedaan kecil.',
    mnm: en ? 'Use stable landmarks and mentally group nearby pairs before shifting the board.' : 'Gunakan penanda posisi yang stabil dan kelompokkan pasangan yang berdekatan sebelum menggeser papan.',
    cube: en ? 'Count by layers and separate visible cubes from hidden support cubes.' : 'Hitung per lapisan dan pisahkan kubus yang terlihat dari kubus penyangga yang tersembunyi.',
    rps: en ? 'Plan two moves ahead and preserve flexible dice faces for contested tiles.' : 'Rencanakan dua langkah ke depan dan simpan sisi dadu yang fleksibel untuk petak penting.',
    '300': en ? 'Protect accuracy on easy operations so speed gains do not create avoidable mistakes.' : 'Jaga akurasi pada operasi mudah agar mengejar kecepatan tidak menciptakan kesalahan yang seharusnya bisa dihindari.',
  };
  return tips[gameId] || (en ? 'Review the replay and look for repeated actions that did not improve the position.' : 'Tinjau replay dan cari aksi berulang yang tidak memperbaiki posisi.');
}

export function brainCoachReview(match, recentMatches = [], lang = 'id') {
  if (!match) return null;
  const en = lang === 'en';
  const actions = Array.isArray(match.replay) ? match.replay : [];
  const keys = actions.filter(item => item.type === 'key').map(item => item.label);
  let backtracks = 0;
  for (let i = 1; i < keys.length; i += 1) if (opposite.get(keys[i - 1]) === keys[i]) backtracks += 1;
  const sameGame = recentMatches.filter(item => item.gameId === match.gameId && item.id !== match.id).slice(0, 5);
  const avgPerformance = sameGame.length ? Math.round(sameGame.reduce((sum,item)=>sum+(Number(item.performance)||0),0)/sameGame.length) : 0;
  const performanceDelta = avgPerformance ? Number(match.performance || 0) - avgPerformance : 0;
  const hintCount = Number(match.hintsUsed) || 0;
  const notes = [];
  if (avgPerformance) notes.push(performanceDelta >= 0
    ? (en ? `This run scored ${Math.abs(performanceDelta)} points above your recent ${match.gameId} average.` : `Run ini ${Math.abs(performanceDelta)} poin di atas rata-rata ${match.gameId} terbaru kamu.`)
    : (en ? `This run scored ${Math.abs(performanceDelta)} points below your recent ${match.gameId} average.` : `Run ini ${Math.abs(performanceDelta)} poin di bawah rata-rata ${match.gameId} terbaru kamu.`));
  if (backtracks >= 3) notes.push(en ? `${backtracks} immediate direction reversals were detected. Cleaner routing can reduce wasted actions.` : `Terdeteksi ${backtracks} pembalikan arah langsung. Jalur yang lebih bersih dapat mengurangi aksi terbuang.`);
  if (hintCount > 0) notes.push(en ? `You used ${hintCount} Brain Coach hint${hintCount > 1 ? 's' : ''}. Replay the same seed once without help to reinforce the pattern.` : `Kamu memakai ${hintCount} hint Brain Coach. Coba ulangi seed yang sama tanpa bantuan untuk menguatkan pola.`);
  if (!hintCount && Number(match.performance) >= 88) notes.push(en ? 'Strong independent run: keep the same decision process before pushing for more speed.' : 'Run mandiri yang kuat: pertahankan proses pengambilan keputusan sebelum mengejar kecepatan lebih tinggi.');
  return {
    focus: brainCoachFocus(match.gameId, lang),
    notes: notes.slice(0, 3),
    backtracks,
    avgPerformance,
    performanceDelta,
  };
}
