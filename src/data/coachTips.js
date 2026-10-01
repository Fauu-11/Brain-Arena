export const COACH_TIPS = {
  '300': [
    {id:'Pisahkan operasi menjadi langkah kecil. Kerjakan bagian yang paling pasti lebih dulu.',en:'Break the expression into smaller steps. Solve the most certain part first.'},
    {id:'Periksa tanda negatif, akar, dan pangkat sebelum menghitung hasil akhir.',en:'Check negative signs, roots, and exponents before calculating the final result.'},
    {id:'Jika waktumu habis di satu soal, sederhanakan bentuknya daripada menebak.',en:'If one problem is consuming time, simplify its structure instead of guessing.'},
  ],
  prime: [
    {id:'Uji pembagi kecil 2, 3, 5, dan 7 sebelum memutuskan sebuah angka prima.',en:'Test small divisors 2, 3, 5, and 7 before deciding whether a number is prime.'},
    {id:'Bilangan genap di atas 2 tidak pernah prima; gunakan itu untuk menyaring cepat.',en:'Even numbers above 2 are never prime; use that to filter quickly.'},
    {id:'Untuk angka besar, cukup uji pembagi sampai akar kuadratnya.',en:'For large numbers, only test divisors up to its square root.'},
  ],
  pixel: [
    {id:'Mulai dari bentuk yang punya garis atau sudut paling khas.',en:'Start with fragments that have the most distinctive lines or corners.'},
    {id:'Bayangkan kepingan sebagai bagian dari satu digit, bukan gambar terpisah.',en:'Visualize the fragments as parts of one digit, not separate pictures.'},
    {id:'Eliminasi digit yang membutuhkan piksel yang tidak tersedia.',en:'Eliminate digits that require pixels not present in your pieces.'},
  ],
  mnm: [
    {id:'Ingat posisi sebagai kelompok: kiri atas, tengah, kanan bawah.',en:'Remember positions in groups: upper-left, center, lower-right.'},
    {id:'Saat menemukan pasangan, simpan juga posisi tetangganya sebagai jangkar memori.',en:'When you find a pair, also remember nearby positions as memory anchors.'},
    {id:'Jangan membuka petak acak terus-menerus; kembali ke lokasi yang sudah pernah terlihat.',en:'Avoid endless random reveals; revisit locations you have already seen.'},
  ],
  cube: [
    {id:'Hitung per kolom dari lapisan bawah ke atas, bukan hanya kubus yang terlihat.',en:'Count each column from bottom to top, not only visible cubes.'},
    {id:'Puncak yang tinggi menyiratkan semua kubus di bawahnya juga ada.',en:'A tall stack implies every cube beneath its top is also present.'},
    {id:'Bagi struktur menjadi baris atau zona kecil lalu jumlahkan.',en:'Split the structure into rows or small zones, then add them.'},
  ],
  rps: [
    {id:'Sebelum bergerak, ingat simbol pada sisi bawah dadu setelah setiap guliran.',en:'Before moving, track which symbol will be on the die bottom after each roll.'},
    {id:'Rencanakan tujuan akhir, lalu mundur untuk memilih urutan arah.',en:'Plan the final target first, then work backward to choose the direction sequence.'},
    {id:'Hindari rute yang memaksa pembalikan arah jika masih ada jalur alternatif.',en:'Avoid routes that force a reverse move when an alternative path exists.'},
  ],
  sudoku: [
    {id:'Cari baris, kolom, atau kotak yang hanya memiliki satu kandidat tersisa.',en:'Look for a row, column, or box with only one candidate remaining.'},
    {id:'Gunakan eliminasi: angka yang sudah ada tidak boleh muncul lagi pada unit yang sama.',en:'Use elimination: an existing number cannot appear again in the same unit.'},
    {id:'Pada mode memori, hafalkan pola per blok 3×3, bukan seluruh papan sekaligus.',en:'In memory mode, memorize patterns by 3×3 block instead of the entire board at once.'},
  ],
  minesweeper: [
    {id:'Jika jumlah bendera di sekitar angka sudah sama dengan angkanya, petak tertutup lain aman.',en:'If flags around a number already equal that number, the other covered neighbors are safe.'},
    {id:'Jika jumlah petak tertutup sama dengan ranjau yang masih dibutuhkan, semuanya adalah ranjau.',en:'If covered neighbors equal the mines still required, all of them are mines.'},
    {id:'Bandingkan dua angka berdekatan untuk menemukan petak yang pasti aman atau pasti ranjau.',en:'Compare adjacent clues to identify cells that must be safe or must be mines.'},
  ],
  maze: [
    {id:'Tandai percabangan secara mental dan hindari masuk kembali ke lorong yang sudah buntu.',en:'Mentally mark junctions and avoid re-entering corridors you already proved dead ends.'},
    {id:'Jika tersesat, kembali ke percabangan terakhir, bukan ke START.',en:'If you get stuck, return to the last junction rather than all the way to START.'},
    {id:'Untuk maze besar, gunakan aturan tangan kanan atau kiri secara konsisten sebagai baseline.',en:'For large mazes, consistently following one wall can provide a reliable baseline route.'},
  ],
  matrix: [
    {id:'Kelompokkan petak menyala menjadi bentuk kecil seperti garis, L, atau kotak.',en:'Group lit cells into small shapes such as lines, L-shapes, or blocks.'},
    {id:'Hafalkan per kuadran, bukan satu petak demi satu petak.',en:'Memorize by quadrant instead of cell by cell.'},
    {id:'Rekonstruksi bentuk besar dulu, lalu isi detail yang tersisa.',en:'Rebuild the large shape first, then fill in the remaining details.'},
  ],
  nonogram: [
    {id:'Mulai dari clue terbesar; biasanya overlap-nya langsung menghasilkan petak pasti terisi.',en:'Start with the largest clues; their overlap often reveals guaranteed filled cells.'},
    {id:'Setelah sebuah rangkaian selesai, beri tanda X di kedua sisinya.',en:'Once a run is complete, mark X on both sides of it.'},
    {id:'Silangkan informasi baris dan kolom; jangan menyelesaikan satu arah secara terpisah.',en:'Cross-check row and column information instead of solving one direction in isolation.'},
  ],
  game2048: [
    {id:'Pertahankan tile terbesar di satu sudut dan bangun angka secara berurutan di dekatnya.',en:'Keep your largest tile in one corner and build values in order around it.'},
    {id:'Hindari gerakan yang menarik tile terbesar keluar dari sudut.',en:'Avoid moves that pull your largest tile away from its corner.'},
    {id:'Sisakan ruang kosong; papan yang terlalu penuh mengurangi pilihan merge.',en:'Preserve empty cells; an overcrowded board reduces your merge options.'},
  ],
};

export function coachTip(gameId,index=0,lang='id') {
  const list=COACH_TIPS[gameId] || [{id:'Amati informasi yang pasti sebelum mengambil keputusan berikutnya.',en:'Use the information you know for certain before making the next move.'}];
  return list[Math.max(0,index)%list.length]?.[lang] || list[0].id;
}
