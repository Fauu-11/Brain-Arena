export const PRACTICE_DRILLS={
  '300':[{id:'speed-30',title:{id:'Sprint 30',en:'30 Sprint'},desc:{id:'Fokus ke ritme hitung dan akurasi.',en:'Focus on calculation rhythm and accuracy.'},level:'sma',difficulty:'hard'}],
  prime:[{id:'prime-scan',title:{id:'Prime Scan',en:'Prime Scan'},desc:{id:'Latih identifikasi bilangan prima dengan cepat.',en:'Train fast prime-number recognition.'},level:'universitas',difficulty:'hard'}],
  pixel:[{id:'pixel-pattern',title:{id:'Pattern Read',en:'Pattern Read'},desc:{id:'Latih membaca pecahan bentuk angka.',en:'Practice reading fragmented digit patterns.'},level:'sma',difficulty:'hard'}],
  mnm:[{id:'memory-pairs',title:{id:'Pair Recall',en:'Pair Recall'},desc:{id:'Fokus pada chunking dan recall pasangan.',en:'Focus on chunking and pair recall.'},level:'universitas',difficulty:'hard'}],
  cube:[{id:'cube-depth',title:{id:'Depth Count',en:'Depth Count'},desc:{id:'Latih menghitung kubus tersembunyi.',en:'Practice counting hidden cubes.'},level:'sma',difficulty:'hard'}],
  rps:[{id:'rps-plan',title:{id:'Plan 3 Langkah',en:'Plan 3 Moves'},desc:{id:'Fokus membaca konsekuensi beberapa langkah.',en:'Focus on multi-move consequences.'},level:'universitas',difficulty:'hard'}],
  sudoku:[{id:'sudoku-single',title:{id:'Single Candidate',en:'Single Candidate'},desc:{id:'Fokus pada kandidat tunggal sebelum teknik lain.',en:'Focus on single candidates before advanced techniques.'},level:'universitas',difficulty:'hard'}],
  minesweeper:[{id:'mine-edge',title:{id:'Edge Logic',en:'Edge Logic'},desc:{id:'Latih deduksi dari angka di tepi cluster.',en:'Practice deductions around cluster edges.'},level:'universitas',difficulty:'hard'}],
  maze:[{id:'maze-efficiency',title:{id:'Path Efficiency',en:'Path Efficiency'},desc:{id:'Kurangi backtracking dan baca persimpangan.',en:'Reduce backtracking and read intersections.'},level:'universitas',difficulty:'hard'}],
  matrix:[{id:'matrix-chunk',title:{id:'Chunking Pattern',en:'Pattern Chunking'},desc:{id:'Kelompokkan pola menjadi blok kecil.',en:'Group patterns into smaller chunks.'},level:'universitas',difficulty:'hard'}],
  nonogram:[{id:'nonogram-lines',title:{id:'Line Certainty',en:'Line Certainty'},desc:{id:'Mulai dari baris dengan informasi paling pasti.',en:'Start with the most constrained rows.'},level:'universitas',difficulty:'hard'}],
  game2048:[{id:'2048-corner',title:{id:'Corner Discipline',en:'Corner Discipline'},desc:{id:'Latih menjaga tile terbesar tetap di sudut.',en:'Practice keeping the largest tile anchored in a corner.'},level:'universitas',difficulty:'hard'}],
};
export function drillFor(gameId,drillId){return PRACTICE_DRILLS[gameId]?.find(item=>item.id===drillId)||PRACTICE_DRILLS[gameId]?.[0]||null;}
