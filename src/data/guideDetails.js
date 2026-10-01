const bi = (id, en) => ({ id, en });
const fact = (labelId, labelEn, valueId, valueEn = valueId) => ({ label: bi(labelId, labelEn), value: bi(valueId, valueEn) });
const item = (titleId, titleEn, textId, textEn, noteId = '', noteEn = '') => ({
  title: bi(titleId, titleEn), text: bi(textId, textEn), ...(noteId || noteEn ? { note: bi(noteId, noteEn) } : {})
});
const level = (name, detailId, detailEn = detailId) => ({ name, detail: bi(detailId, detailEn) });

export const GUIDE_DETAILS = {
  '300': {
    objective: bi('Jawab soal hitung dengan cepat dan akurat. Mode Latihan fokus pada satu soal, sedangkan Mode Arena menuntut satu halaman berisi 30 jawaban sempurna sebelum lanjut.', 'Solve arithmetic quickly and accurately. Practice focuses on one question at a time, while Arena requires a perfect 30-answer page before you can advance.'),
    victory: bi('Mode Arena selesai setelah semua halaman berhasil dikirim 100% benar. Jawaban salah membuat input terkunci 10 detik.', 'Arena ends after every page is submitted 100% correct. Any wrong answer triggers a 10-second input lock.'),
    facts: [fact('Mode', 'Modes', 'Latihan & Arena', 'Practice & Arena'), fact('Arena', 'Arena', '30–300 soal', '30–300 questions'), fact('Penalti', 'Penalty', '10 detik', '10 seconds')],
    controls: [bi('Klik/ketuk kolom jawaban lalu ketik angka.', 'Click/tap an answer field and type the number.'), bi('Enter atau tombol panah mempercepat perpindahan antar-input.', 'Enter or Arrow keys speed up navigation between inputs.'), bi('Kirim halaman hanya setelah semua jawaban sudah diperiksa.', 'Submit a page only after checking every answer.')],
    tutorial: [
      item('Pilih jenjang dan mode', 'Choose level and mode', 'Pilih SD, SMP, SMA, atau Universitas, lalu tentukan Latihan untuk belajar atau Arena untuk mengejar waktu.', 'Choose SD, SMP, SMA, or University, then select Practice to learn or Arena to race the clock.'),
      item('Pilih materi', 'Choose topics', 'Aktifkan kategori yang ingin dilatih. Untuk pemanasan, gunakan sedikit kategori; untuk simulasi, aktifkan semuanya.', 'Enable the topics you want. Use fewer categories to warm up, or all of them for a full simulation.'),
      item('Kerjakan yang paling mudah dulu', 'Clear easy questions first', 'Di Arena, semua soal pada halaman harus benar. Isi soal yang langsung terlihat jawabannya, lalu kembali ke soal panjang.', 'In Arena every answer must be correct. Clear obvious questions first, then return to longer ones.'),
      item('Periksa sebelum kirim', 'Verify before submitting', 'Lakukan sweep cepat: tanda negatif, urutan operasi, pecahan, dan digit terakhir. Tiga detik mengecek lebih murah daripada penalti 10 detik.', 'Do a fast sweep for negative signs, operation order, fractions, and final digits. Three seconds of checking is cheaper than a 10-second penalty.'),
      item('Kirim dan lanjut', 'Submit and continue', 'Jika halaman sempurna, lanjut ke halaman berikutnya. Jika ada salah, gunakan masa penalti untuk mengingat soal yang paling meragukan.', 'A perfect page advances. If there is an error, use the penalty time to identify the answer you were least sure about.')
    ],
    solve: {
      title: bi('Metode 3 lintasan', 'The 3-pass method'),
      intro: bi('Gunakan urutan yang sama pada setiap halaman supaya otak tidak membuang waktu memilih soal.', 'Use the same order on every page so your brain does not waste time deciding what to solve next.'),
      steps: [
        item('Lintasan 1 — instan', 'Pass 1 — instant', 'Jawab operasi satu langkah, nilai tempat, akar/pangkat yang sudah familiar, dan persentase acuan.', 'Answer one-step operations, place values, familiar roots/powers, and benchmark percentages.'),
        item('Lintasan 2 — pola', 'Pass 2 — patterns', 'Gunakan rumus pendek: a²−b²=(a+b)(a−b), jumlah 1..n=n(n+1)/2, FPB/KPK, atau perbandingan.', 'Use compact identities: a²−b²=(a+b)(a−b), 1..n=n(n+1)/2, GCD/LCM, or proportions.'),
        item('Lintasan 3 — verifikasi', 'Pass 3 — verify', 'Periksa soal yang paling rawan salah dan pastikan semua kolom terisi sebelum menekan Kirim.', 'Recheck the most error-prone questions and make sure every field is filled before Submit.')
      ],
      example: bi('Contoh: 53² − 47² tidak perlu dihitung satu-satu. Gunakan (53+47)(53−47)=100×6=600.', 'Example: do not square 53 and 47 separately. Use (53+47)(53−47)=100×6=600.')
    },
    mistakes: [bi('Mengirim halaman ketika masih ada jawaban yang hanya ditebak.', 'Submitting while some answers are still guesses.'), bi('Menghitung kuadrat atau faktorial besar secara mentah padahal bisa disederhanakan.', 'Brute-forcing large squares or factorials instead of simplifying.'), bi('Melupakan prioritas ×/÷ sebelum +/−.', 'Forgetting multiplication/division precedence over addition/subtraction.')],
    levels: [level('SD', 'Operasi dasar, FPB/KPK, pecahan, persen, skala.'), level('SMP', 'Bilangan negatif, akar/pangkat, pola, barisan, perbandingan.'), level('SMA', 'Logaritma, deret, sigma, geometri tak hingga, finansial.'), level('Univ · Hard', 'Soal Universitas acak dengan bilangan dan operasi lebih besar.'), level('Univ · Very Hard', 'Variasi acak lebih padat: faktorial, eksponen, akar, basis, dan operasi campuran.'), level('Univ · Impossible', 'Rentang angka tertinggi dan kombinasi acak paling agresif; setiap sesi menghasilkan set soal baru.') ]
  },
  prime: {
    objective: bi('Temukan bilangan prima di antara 25 kubus angka. Prima memberi poin dan mempertahankan giliran; komposit menyerahkan giliran.', 'Find primes among 25 number cubes. A prime scores and keeps your turn; a composite passes the turn.'),
    victory: bi('Prima = +1 dan lanjut giliran. Kubus “?” yang ditebak benar = +3. Pemain pertama mencapai 6 poin menang; jika prima habis, skor tertinggi menang.', 'Prime = +1 and keep the turn. Correctly guessing the “?” cube = +3. First to 6 points wins; if primes run out, highest score wins.'),
    facts: [fact('Papan', 'Board', '5×5 · 25 angka', '5×5 · 25 numbers'), fact('Giliran', 'Turn', '30 detik', '30 seconds'), fact('Target', 'Goal', '6 poin', '6 points')],
    controls: [bi('Klik satu kubus untuk memilih angka.', 'Click one cube to choose a number.'), bi('Pada kubus “?”, pilih Prima atau Bukan Prima.', 'On the “?” cube, choose Prime or Not Prime.'), bi('Mode PvP bergantian pada perangkat yang sama; PvE melawan komputer.', 'PvP alternates on the same device; PvE plays against the computer.')],
    tutorial: [
      item('Buang kandidat mudah', 'Eliminate easy composites', 'Coret mental angka genap >2, kelipatan 5 >5, dan angka dengan jumlah digit kelipatan 3.', 'Mentally eliminate even numbers >2, multiples of 5 >5, and numbers whose digit sum is divisible by 3.'),
      item('Uji kandidat tersisa', 'Test remaining candidates', 'Untuk angka n, cukup cek pembagi prima sampai √n. Jika tidak ada yang membagi habis, n prima.', 'For n, only test prime divisors up to √n. If none divide evenly, n is prime.'),
      item('Manfaatkan giliran beruntun', 'Exploit streaks', 'Saat menemukan prima, giliran tetap milikmu. Prioritaskan kandidat yang paling yakin untuk membangun rangkaian poin.', 'A prime keeps your turn. Prioritize the candidates you are most certain about to build a scoring streak.'),
      item('Kelola kubus misteri', 'Manage the mystery cube', 'Nilai “?” tiga kali lebih besar, tetapi jangan berjudi tanpa dasar. Gunakan informasi angka yang sudah terbuka dan kebutuhan skor.', 'The “?” cube is worth triple, but do not gamble blindly. Use revealed information and the current score situation.')
    ],
    solve: {
      title: bi('Tes prima cepat', 'Fast primality test'),
      intro: bi('Gunakan filter murah dulu, baru pembagian yang lebih berat.', 'Use cheap filters first, then do more expensive divisibility checks.'),
      steps: [
        item('Langkah 1', 'Step 1', 'Jika n < 2: bukan prima. Jika n adalah 2 atau 3: prima.', 'If n < 2: not prime. If n is 2 or 3: prime.'),
        item('Langkah 2', 'Step 2', 'Jika genap atau jumlah digit habis dibagi 3: komposit.', 'If even or digit sum is divisible by 3: composite.'),
        item('Langkah 3', 'Step 3', 'Cek faktor 5, 7, 11, 13, dst. hanya sampai faktor tersebut melebihi √n.', 'Check 5, 7, 11, 13, etc. only until the divisor exceeds √n.'),
        item('Langkah 4', 'Step 4', 'Jika tidak ada faktor, angka itu prima.', 'If no divisor works, the number is prime.')
      ],
      example: bi('Contoh 221: √221 ≈ 14,9. Cek 2,3,5,7,11,13. 221 ÷ 13 = 17, jadi 221 komposit.', 'Example 221: √221 ≈ 14.9. Test 2,3,5,7,11,13. 221 ÷ 13 = 17, so 221 is composite.')
    },
    mistakes: [bi('Menganggap semua bilangan berbentuk 6k±1 pasti prima; bentuk itu hanya filter kandidat.', 'Assuming every 6k±1 number is prime; it is only a candidate filter.'), bi('Menghabiskan waktu mencoba pembagi lebih besar dari √n.', 'Testing divisors larger than √n.'), bi('Menekan kandidat meragukan saat masih ada angka yang jelas-jelas prima.', 'Choosing uncertain candidates while obvious primes remain.')],
    levels: [level('SD', 'Angka 2–99.'), level('SMP', 'Angka 101–500.'), level('SMA', 'Angka 501–1500.'), level('Univ · Hard', 'Papan acak angka 1501–4000.'), level('Univ · Very Hard', 'Papan acak angka 4001–9000 dengan waktu lebih singkat.'), level('Univ · Impossible', 'Papan acak angka 9001–20000 dan tekanan waktu tertinggi.')]
  },
  pixel: {
    objective: bi('Gabungkan potongan kartu piksel menjadi digit target 3×5 tanpa ada piksel yang tumpang tindih.', 'Combine pixel-card fragments into 3×5 target digits without any overlapping pixels.'),
    victory: bi('Selesaikan seluruh digit target. Waktu tercepat disimpan sebagai rekor untuk setiap jenjang.', 'Reconstruct every target digit. Your fastest time is saved for each level.'),
    facts: [fact('Grid digit', 'Digit grid', '3×5'), fact('Target', 'Targets', '1–3 digit', '1–3 digits'), fact('Kartu', 'Cards', '6–15 potongan', '6–15 fragments')],
    controls: [bi('Klik kartu untuk menambah/menghapusnya dari pratinjau.', 'Click cards to add/remove them from the live preview.'), bi('Gunakan Hapus Pilihan untuk mulai kombinasi baru.', 'Use Clear Selection to start a new combination.'), bi('Spasi/Enter atau tombol Periksa Terpilih untuk memvalidasi bentuk.', 'Space/Enter or Check Selection validates the shape.')],
    tutorial: [
      item('Baca siluet target', 'Read the target silhouette', 'Amati kolom, baris, dan lubang khas digit target sebelum memilih kartu.', 'Study columns, rows, and distinctive gaps in the target before selecting cards.'),
      item('Cari potongan jangkar', 'Find an anchor fragment', 'Mulai dari potongan yang memiliki ciri unik: garis vertikal penuh, garis atas, atau sudut.', 'Start with a fragment that has a distinctive feature: full vertical line, top bar, or corner.'),
      item('Tumpuk tanpa overlap', 'Stack without overlap', 'Tambahkan kartu satu per satu. Piksel merah berarti dua kartu mengisi koordinat yang sama—kombinasi pasti salah.', 'Add cards one at a time. Red pixels mean two cards occupy the same coordinate—the combination is invalid.'),
      item('Cocokkan keseluruhan', 'Match the whole shape', 'Jumlah piksel saja tidak cukup; susunan 3×5 harus sama persis dengan salah satu target yang belum selesai.', 'Pixel count alone is not enough; the 3×5 arrangement must exactly match an unsolved target.'),
      item('Kunci target lalu ulangi', 'Claim and repeat', 'Kartu yang benar akan terpakai. Gunakan kartu tersisa untuk menyusun target berikutnya.', 'Correct cards are consumed. Use the remaining cards for the next target.')
    ],
    solve: {
      title: bi('Metode “fitur unik → pelengkap”', 'Unique-feature → complement method'),
      intro: bi('Jangan mencoba kombinasi acak. Tentukan bagian target yang hanya bisa dipenuhi oleh sedikit kartu.', 'Do not brute-force random combinations. Identify target regions that only a few cards can satisfy.'),
      steps: [
        item('Petakan target', 'Map the target', 'Tandai mental piksel wajib pada tepi kiri/kanan, baris atas/tengah/bawah.', 'Mentally mark required pixels on left/right edges and top/middle/bottom rows.'),
        item('Pilih jangkar', 'Pick an anchor', 'Ambil kartu yang menutup fitur paling langka.', 'Choose the card covering the rarest feature.'),
        item('Isi kekosongan', 'Fill the gaps', 'Cari kartu yang mengisi piksel kosong tanpa menyentuh piksel yang sudah aktif.', 'Find cards that fill missing pixels without touching active ones.'),
        item('Validasi', 'Validate', 'Begitu pratinjau identik dan tidak ada merah, periksa pilihan.', 'Once the preview is identical and has no red cells, validate it.')
      ],
      example: bi('Untuk digit 1, fokus pada kolom kanan/kolom ke-3. Potongan yang menyalakan sisi kiri biasanya bisa dieliminasi lebih awal.', 'For digit 1, focus on the rightmost/third column. Fragments lighting the left side can usually be eliminated early.')
    },
    mistakes: [bi('Memilih kartu hanya karena jumlah pikselnya cocok.', 'Choosing cards only because their pixel counts match.'), bi('Membiarkan overlap merah lalu tetap menambah kartu.', 'Continuing to add cards while red overlaps are present.'), bi('Tidak memanfaatkan kartu yang sudah terpakai untuk mempersempit target berikutnya.', 'Failing to use consumed cards to narrow the remaining targets.')],
    levels: [level('SD', '1 target · 6 kartu.'), level('SMP', '2 target · 10 kartu.'), level('SMA', '3 target · 12 kartu.'), level('Univ · Hard', '3 digit target acak · sekitar 15 kartu.'), level('Univ · Very Hard', '4 digit target acak · sekitar 20 kartu.'), level('Univ · Impossible', '5 digit target acak · sekitar 26 kartu dan fragmen paling halus.')]
  },
  sudoku: {
    objective: bi('Hafalkan solusi yang ditampilkan, lalu isi sel yang disembunyikan dengan gabungan ingatan dan aturan Sudoku.', 'Memorize the revealed solution, then restore hidden cells using memory plus standard Sudoku logic.'),
    victory: bi('Semua sel harus cocok dengan solusi. Intip Kilat terbatas dan menambah penalti waktu; rekor dihitung dari waktu penyelesaian.', 'Every cell must match the solution. Quick Peek is limited and adds a time penalty; completion time determines your record.'),
    facts: [fact('Grid', 'Grid', '4×4 sampai 9×9', '4×4 to 9×9'), fact('Intip', 'Peeks', '1–3 kali', '1–3 uses'), fact('Aturan', 'Rule', 'Unik per baris, kolom & blok', 'Unique per row, column & box')],
    controls: [bi('Ketuk sel kosong lalu pilih angka di keypad.', 'Tap an empty cell then choose a number on the keypad.'), bi('Keyboard: angka 1–9, panah untuk pindah, Backspace untuk menghapus.', 'Keyboard: 1–9, arrows to move, Backspace to erase.'), bi('Intip Kilat menampilkan papan asli selama 2 detik.', 'Quick Peek shows the original board for 2 seconds.')],
    tutorial: [
      item('Hafalkan per blok', 'Memorize by box', 'Jangan menghafal 81 angka sekaligus. Pecah papan menjadi blok 2×2, 2×3, atau 3×3.', 'Do not memorize 81 digits individually. Chunk the board into 2×2, 2×3, or 3×3 boxes.'),
      item('Cari sel dengan satu kandidat', 'Find single-candidate cells', 'Untuk sel kosong, lihat angka yang sudah ada di baris, kolom, dan bloknya.', 'For an empty cell, inspect numbers already used in its row, column, and box.'),
      item('Isi yang paling pasti', 'Fill certainties first', 'Jika hanya satu angka yang mungkin, isi. Setiap jawaban pasti akan membuka kandidat baru untuk sel lain.', 'If only one number is possible, enter it. Each certainty unlocks more deductions.'),
      item('Gunakan ingatan sebagai tie-breaker', 'Use memory as a tie-breaker', 'Jika dua kandidat masih mungkin, ingat posisi dari fase hafalan sebelum memakai Intip.', 'If two candidates remain, recall the memorization phase before spending a Peek.'),
      item('Periksa papan', 'Check the board', 'Pastikan tidak ada duplikasi lokal, lalu kirim papan ketika semua sel terisi.', 'Ensure there are no local duplicates, then submit once every cell is filled.')
    ],
    solve: {
      title: bi('Eliminasi silang', 'Cross-elimination'),
      intro: bi('Setiap sel adalah irisan tiga aturan: baris, kolom, dan blok.', 'Every cell is the intersection of three constraints: row, column, and box.'),
      steps: [
        item('Daftar angka yang mungkin', 'List candidates', 'Mulai dari himpunan 1..N sesuai ukuran papan.', 'Start with 1..N for the current grid size.'),
        item('Hapus angka baris', 'Remove row digits', 'Coret semua angka yang sudah muncul di baris tersebut.', 'Remove all digits already present in the row.'),
        item('Hapus angka kolom & blok', 'Remove column & box digits', 'Coret angka dari kolom dan sub-blok.', 'Remove digits already present in the column and sub-box.'),
        item('Isi kandidat tunggal', 'Fill the single', 'Jika tersisa satu angka, itulah nilai sel.', 'If one candidate remains, that is the cell value.')
      ],
      example: bi('Contoh 4×4: kandidat {1,2,3,4}; baris sudah punya 1 dan 4, kolom punya 2 → hanya 3 yang tersisa.', '4×4 example: candidates {1,2,3,4}; row has 1 and 4, column has 2 → only 3 remains.')
    },
    mistakes: [bi('Mengandalkan hafalan saja dan mengabaikan aturan Sudoku.', 'Relying only on memory and ignoring Sudoku constraints.'), bi('Memakai Intip terlalu dini untuk sel yang bisa dideduksi.', 'Using Quick Peek too early on a logically solvable cell.'), bi('Mengisi banyak tebakan sekaligus sehingga sulit melacak sumber kesalahan.', 'Entering several guesses at once and losing track of the source of an error.')],
    levels: [level('SD', '4×4 · blok 2×2 · 4–6 sel tersembunyi · 3 Intip.'), level('SMP', '6×6 · blok 2×3 · 10–14 sel tersembunyi · 2 Intip.'), level('SMA', '9×9 · 22–26 sel tersembunyi · 2 Intip.'), level('Univ · Hard', '9×9 acak · 34–40 sel tersembunyi · 1 Intip.'), level('Univ · Very Hard', '9×9 acak · 44–50 sel tersembunyi · 1 Intip.'), level('Univ · Impossible', '9×9 acak · 52–58 sel tersembunyi · tanpa Intip.')]
  },
  mnm: {
    objective: bi('Hafalkan pasangan chip, cocokkan dua angka yang sama, lalu gunakan pergeseran ubin untuk mengubah posisi chip dan mengacaukan lawan.', 'Memorize chip pairs, match equal numbers, then use tile sliding to relocate chips and disrupt your opponent.'),
    victory: bi('Pasangan benar = +1 dan tetap giliran. Salah atau waktu habis memaksa fase Mix. Pemain pertama mencapai target skor atau skor tertinggi saat pasangan habis menang.', 'A correct pair = +1 and keep the turn. A mismatch or timeout forces Mix. First to target score, or highest score when pairs are gone, wins.'),
    facts: [fact('Giliran cocok', 'Match turn', '10 detik', '10 seconds'), fact('Mode', 'Modes', 'PvP / PvE'), fact('Inti', 'Core loop', 'Hafal → Cocok → Geser', 'Memorize → Match → Slide')],
    controls: [bi('Klik dua chip untuk membuka pasangan.', 'Click two chips to reveal a pair.'), bi('Pada fase Mix, klik ubin yang bersebelahan dengan slot kosong.', 'During Mix, click a tile adjacent to the empty slot.'), bi('Geseran terakhir tidak boleh langsung dibalik.', 'The last slide cannot be immediately reversed.')],
    tutorial: [
      item('Hafalkan sebagai pasangan lokasi', 'Memorize location pairs', 'Jangan hanya ingat angka; ingat “7 = kiri atas + tengah bawah”, misalnya.', 'Do not remember only the number; remember a location pair such as “7 = top-left + lower-middle”.'),
      item('Ambil pasangan paling yakin', 'Take your surest pair', 'Mulai giliran dari pasangan yang 100% kamu ingat agar dapat poin dan mempertahankan giliran.', 'Start with a pair you are 100% sure about to score and keep the turn.'),
      item('Saat gagal, pikirkan fase Mix', 'Plan the Mix after a miss', 'Kegagalan bukan hanya kehilangan giliran; kamu wajib menggeser. Pilih geseran yang mudah kamu lacak tetapi sulit bagi lawan.', 'A miss is not just a lost turn; you must slide. Choose a move you can track but your opponent may not.'),
      item('Perbarui peta mental', 'Update your mental map', 'Setelah ubin bergeser, pindahkan semua chip di ubin itu dalam ingatan sebagai satu kelompok.', 'After a tile slides, move every chip on that tile in your memory as one group.')
    ],
    solve: {
      title: bi('Teknik “anchor tile”', 'Anchor-tile technique'),
      intro: bi('Pilih satu atau dua ubin sebagai jangkar visual lalu lacak pergeseran relatif terhadapnya.', 'Choose one or two tiles as visual anchors and track slides relative to them.'),
      steps: [
        item('Buat peta awal', 'Build the initial map', 'Kelompokkan pasangan per ubin, bukan per chip individual.', 'Group pairs by tile instead of individual chip.'),
        item('Catat slot kosong', 'Track the empty slot', 'Semua pergeseran selalu menuju slot kosong; ini membatasi kemungkinan perubahan.', 'Every slide moves into the empty slot, which constrains how the board can change.'),
        item('Geser satu kelompok', 'Move one group', 'Saat ubin A bergeser, semua chip A ikut berpindah bersama—jangan remap seluruh papan.', 'When tile A slides, all chips on A move together—do not remap the whole board.'),
        item('Prioritaskan pasangan stabil', 'Prioritize stable pairs', 'Cocokkan pasangan yang lokasinya belum terganggu sebelum lawan sempat menggesernya.', 'Match pairs whose locations have not moved before your opponent can disrupt them.')
      ],
      example: bi('Jika pasangan 5 berada di dua ubin yang tidak pernah bergeser, ambil pasangan itu dulu. Jangan mengejar pasangan yang baru saja ikut berpindah jika kamu belum yakin posisinya.', 'If pair 5 sits on two tiles that never moved, claim it first. Avoid chasing a pair that just moved unless you are certain of its new positions.')
    },
    mistakes: [bi('Menghafal nomor tanpa mengikatnya ke posisi/ubin.', 'Memorizing numbers without binding them to positions/tiles.'), bi('Menggeser ubin secara acak setelah mismatch.', 'Sliding randomly after a mismatch.'), bi('Mencoba langsung membalik geseran terakhir.', 'Trying to immediately reverse the previous slide.')],
    levels: [level('SD', '6 pasangan · target 4 poin.'), level('SMP', '12 pasangan · target 7 poin.'), level('SMA', '16 pasangan · target 9 poin.'), level('Univ · Hard', '20 pasangan acak · target 11 · 8 dtk/giliran.'), level('Univ · Very Hard', '30 pasangan acak · target 16 · 7 dtk/giliran.'), level('Univ · Impossible', '45 pasangan acak · target 23 · 5 dtk/giliran.')]
  },
  cube: {
    objective: bi('Hitung seluruh kubus pada tumpukan isometrik, termasuk kubus yang tersembunyi di bawah kubus lain.', 'Count every cube in the isometric stack, including cubes hidden underneath visible cubes.'),
    victory: bi('Ada 5 level. Setiap jawaban benar bernilai 1 poin dan setiap level memiliki waktu 40 detik.', 'There are 5 levels. Each correct answer is worth 1 point and each level has a 40-second timer.'),
    facts: [fact('Ronde', 'Rounds', '5 level'), fact('Waktu', 'Time', '40 detik/level', '40 sec/level'), fact('Skor', 'Score', '1 poin/jawaban benar', '1 point/correct answer')],
    controls: [bi('Amati tumpukan, ketik total kubus, lalu kirim.', 'Inspect the stack, type the total, then submit.'), bi('Kubus tidak pernah melayang: setiap kubus atas pasti ditopang kubus di bawah.', 'Cubes never float: every upper cube is supported from below.'), bi('Jika salah atau waktu habis, jawaban benar ditampilkan sebelum level berikutnya.', 'If wrong or time expires, the correct count appears before the next level.')],
    tutorial: [
      item('Lupakan “kubus terlihat”', 'Ignore “visible cubes”', 'Yang dihitung adalah tinggi setiap kolom. Satu kubus di tingkat 4 berarti ada empat kubus pada kolom itu.', 'Count column height, not visible faces. A cube at height 4 means four cubes exist in that column.'),
      item('Bagi per kolom atau lapisan', 'Split by columns or layers', 'Pilih metode yang paling mudah: jumlah tinggi semua kolom, atau hitung jumlah kubus pada tiap lapisan horizontal.', 'Choose one method: sum every column height, or count cubes layer by layer.'),
      item('Cari area tertutup', 'Check occluded areas', 'Kolom rendah dapat tersembunyi di belakang kolom tinggi. Gunakan pola grid lantai untuk memastikan tidak ada posisi yang terlewat.', 'Short columns may hide behind tall ones. Use the floor grid to ensure no position is skipped.'),
      item('Jumlahkan sekali lagi', 'Sum once more', 'Sebelum kirim, kelompokkan subtotal agar penjumlahan akhir mudah dicek.', 'Before submitting, use subtotals so the final addition is easy to verify.')
    ],
    solve: {
      title: bi('Metode lapisan horizontal', 'Horizontal-layer method'),
      intro: bi('Metode ini aman karena kubus tersembunyi tetap dihitung otomatis.', 'This method is robust because hidden cubes are counted automatically.'),
      steps: [
        item('Lapisan 1', 'Layer 1', 'Hitung semua posisi yang memiliki tinggi minimal 1.', 'Count every position with height at least 1.'),
        item('Lapisan 2', 'Layer 2', 'Hitung posisi dengan tinggi minimal 2.', 'Count positions with height at least 2.'),
        item('Ulangi', 'Repeat', 'Lanjutkan sampai tinggi maksimum.', 'Continue through the maximum height.'),
        item('Jumlahkan', 'Add', 'Total = L1 + L2 + L3 + ...', 'Total = L1 + L2 + L3 + ...')
      ],
      example: bi('Jika tinggi empat kolom adalah [3,1,2,0], lapisan berisi 3 + 2 + 1 kubus = 6 total.', 'If four columns have heights [3,1,2,0], the layers contain 3 + 2 + 1 cubes = 6 total.')
    },
    mistakes: [bi('Menghitung hanya sisi/kubus yang terlihat.', 'Counting only visible cubes/faces.'), bi('Menganggap kubus puncak berdiri sendiri tanpa penopang di bawah.', 'Treating a top cube as standalone without its supporting cubes.'), bi('Menghitung kolom yang sama dua kali saat mengikuti perspektif isometrik.', 'Double-counting a column while following the isometric perspective.')],
    levels: [level('SD', 'Grid 3×3, tinggi maksimum 2.'), level('SMP', 'Grid 4×4, tinggi maksimum 3.'), level('SMA', 'Grid 5×5, tinggi maksimum 4.'), level('Univ · Hard', 'Grid 5×5 acak · tinggi maksimum 5.'), level('Univ · Very Hard', 'Grid 6×6 acak · tinggi maksimum 6.'), level('Univ · Impossible', 'Grid 7×7 acak · tinggi maksimum 7 dan timer paling ketat.')]
  },
  rps: {
    objective: bi('Hafalkan jaring-jaring dadu, rencanakan rute, lalu prediksi sisi bawah setelah dadu berguling. Sisi bawah terakhir bertarung dengan simbol petak tujuan.', 'Memorize the die net, plan a route, and predict the bottom face after rolling. The final bottom face battles the destination tile.'),
    victory: bi('Batu > gunting, gunting > kertas, kertas > batu. Menang +1, kalah −1, seri 0. Pemain pertama mencapai 4 poin menang.', 'Rock > scissors, scissors > paper, paper > rock. Win +1, lose −1, draw 0. First to 4 points wins.'),
    facts: [fact('Arena', 'Arena', '7×7'), fact('Target', 'Goal', '4 poin', '4 points'), fact('Skor', 'Scoring', '+1 / 0 / −1')],
    controls: [bi('Isi semua slot arah sebelum menekan PUTAR.', 'Fill every direction slot before pressing ROLL.'), bi('Langkah pertama dari START wajib ke bawah.', 'The first move from START must be Down.'), bi('Undo/Clear untuk memperbaiki rute. Rute tidak boleh keluar papan atau langsung berbalik arah.', 'Undo/Clear edits the route. A route cannot leave the board or immediately reverse direction.')],
    tutorial: [
      item('Hafalkan enam sisi', 'Memorize all six faces', 'Kotak tengah pada jaring menjadi sisi atas. Catat juga pasangan sisi yang berlawanan.', 'The center square becomes the top face. Also remember opposite face pairs.'),
      item('Baca petak tujuan', 'Read the target tile', 'Sebelum merencanakan arah, tentukan simbol apa yang harus berada di bawah agar menang.', 'Before planning, determine which symbol must end up on the bottom to win.'),
      item('Simulasikan rotasi', 'Simulate rotations', 'Setiap guling menukar Top/Bottom dengan Front/Back atau Left/Right. Lacak enam sisi, bukan hanya sisi atas.', 'Each roll cycles Top/Bottom with Front/Back or Left/Right. Track all six faces, not just the top.'),
      item('Isi rute valid', 'Fill a valid route', 'Gunakan jumlah langkah wajib sesuai jenjang. Hindari jalan yang keluar papan atau kembali ke START.', 'Use the required move count for the level. Avoid leaving the board or returning to START.'),
      item('Lanjutkan orientasi', 'Carry orientation forward', 'Setelah duel, pemain berikutnya memakai posisi dan orientasi dadu terakhir yang sama.', 'After a duel, the next player continues from the same position and die orientation.')
    ],
    solve: {
      title: bi('Cara menghitung sisi bawah', 'How to track the bottom face'),
      intro: bi('Gunakan enam label: Atas (T), Bawah (B), Depan (F), Belakang (Bk), Kiri (L), Kanan (R).', 'Track six labels: Top (T), Bottom (B), Front (F), Back (Bk), Left (L), Right (R).'),
      steps: [
        item('Guling kanan', 'Roll right', 'T←L, R←T, B←R, L←B. Depan/Belakang tetap.', 'T←L, R←T, B←R, L←B. Front/Back stay unchanged.'),
        item('Guling kiri', 'Roll left', 'T←R, L←T, B←L, R←B. Depan/Belakang tetap.', 'T←R, L←T, B←L, R←B. Front/Back stay unchanged.'),
        item('Guling atas/bawah', 'Roll up/down', 'Rotasikan T, F, B, Bk; sisi kiri/kanan tidak berubah.', 'Cycle T, F, B, Bk; left/right stay unchanged.'),
        item('Bandingkan simbol akhir', 'Compare the final symbol', 'Setelah langkah terakhir, lihat simbol pada Bawah dan gunakan aturan suwit untuk menentukan hasil.', 'After the last move, inspect Bottom and apply rock-paper-scissors rules.')
      ],
      example: bi('Jika petak tujuan adalah gunting, target ideal untuk sisi bawah adalah batu. Rencanakan rotasi sampai batu berada di Bawah pada langkah terakhir.', 'If the destination tile is scissors, you want rock on the bottom. Plan rotations until rock reaches Bottom on the final move.')
    },
    mistakes: [bi('Hanya melacak sisi atas dan lupa sisi bawah.', 'Tracking only the top face and forgetting the bottom.'), bi('Menganggap orientasi reset saat giliran berganti.', 'Assuming orientation resets between turns.'), bi('Merencanakan rute dulu tanpa melihat simbol target.', 'Planning a route before checking the destination symbol.')],
    levels: [level('SD', '3 langkah · 25 detik.'), level('SMP', '3–4 langkah · 22 detik.'), level('SMA', '3–5 langkah · 20 detik.'), level('Univ · Hard', '4–5 langkah · 16 detik · sisi dadu dan papan acak.'), level('Univ · Very Hard', '5–6 langkah · 12 detik · konfigurasi acak baru.'), level('Univ · Impossible', '6–7 langkah · 9 detik · tekanan perencanaan tertinggi.')]
  },
  minesweeper: {
    objective: bi('Buka semua petak aman tanpa menyentuh ranjau. Angka pada petak menunjukkan jumlah ranjau di delapan tetangganya.', 'Reveal every safe cell without triggering a mine. Each number tells how many mines are in its eight neighboring cells.'),
    victory: bi('Menang ketika seluruh petak non-ranjau sudah terbuka. Bendera membantu deduksi tetapi tidak wajib dipasang pada semua ranjau.', 'You win when every non-mine cell is revealed. Flags help deduction but do not need to cover every mine.'),
    facts: [fact('Klik pertama', 'First click', 'Selalu aman', 'Always safe'), fact('Bendera', 'Flags', 'Klik kanan / tekan lama', 'Right-click / long-press'), fact('Rekor', 'Record', 'Waktu tercepat', 'Fastest clear')],
    controls: [bi('Klik/ketuk = buka petak.', 'Click/tap = reveal a cell.'), bi('Klik kanan, tekan lama, atau Mode Bendera = pasang/lepas bendera.', 'Right-click, long-press, or Flag Mode = toggle a flag.'), bi('Ketuk angka yang sudah memiliki jumlah bendera tepat untuk chord membuka tetangga lain.', 'Tap a revealed number with the correct adjacent flag count to chord-open its other neighbors.')],
    tutorial: [
      item('Mulai dan buka ruang', 'Start and create space', 'Klik pertama aman. Jika membuka 0, area kosong akan melebar dan memberi banyak petunjuk angka.', 'The first click is safe. A 0 expands into a blank region and exposes many useful clues.'),
      item('Cari pola pasti ranjau', 'Find forced mines', 'Jika angka 1 hanya menyentuh satu petak tertutup, petak itu pasti ranjau. Pasang bendera.', 'If a 1 touches only one hidden cell, that cell must be a mine. Flag it.'),
      item('Cari pola pasti aman', 'Find forced safe cells', 'Jika angka 2 sudah memiliki dua bendera di tetangganya, semua tetangga tertutup lain aman.', 'If a 2 already has two adjacent flags, every other hidden neighbor is safe.'),
      item('Bandingkan kelompok', 'Compare overlapping groups', 'Gunakan selisih antara dua angka berdekatan untuk memutuskan petak mana yang aman/ranjau.', 'Use set differences between adjacent clues to identify forced safe cells or mines.'),
      item('Bersihkan frontier', 'Clear one frontier', 'Selesaikan satu batas angka-tutup sampai tidak ada deduksi lagi sebelum pindah ke area lain.', 'Finish one number/hidden frontier until no deduction remains before moving elsewhere.')
    ],
    solve: {
      title: bi('Dua aturan dasar Minesweeper', 'The two fundamental rules'),
      intro: bi('Hampir semua deduksi lokal berasal dari dua aturan ini.', 'Most local deductions come from these two rules.'),
      steps: [
        item('Aturan ranjau', 'Mine rule', 'Jika clue − bendera = jumlah petak tertutup yang tersisa, semua petak tertutup itu ranjau.', 'If clue − flags equals the number of remaining hidden neighbors, all of them are mines.'),
        item('Aturan aman', 'Safe rule', 'Jika jumlah bendera sudah sama dengan clue, semua tetangga tertutup lainnya aman.', 'If adjacent flags already equal the clue, every other hidden neighbor is safe.'),
        item('Subset', 'Subset', 'Jika himpunan petak sekitar clue A merupakan bagian dari clue B, selisih clue menentukan isi petak tambahan.', 'If clue A’s hidden-neighbor set is a subset of clue B’s, the clue difference constrains the extra cells.'),
        item('Chord', 'Chord', 'Setelah bendera pasti terpasang, ketuk clue untuk membuka tetangga aman sekaligus.', 'Once certain flags are placed, tap the clue to open safe neighbors at once.')
      ],
      example: bi('Pola 1–2: jika angka 1 berbagi dua petak tertutup dengan angka 2 dan angka 2 punya satu petak tambahan, petak tambahan itu harus ranjau.', 'Pattern 1–2: if the 1 shares two hidden cells with the 2 and the 2 has one extra hidden cell, that extra cell must be a mine.')
    },
    mistakes: [bi('Memasang bendera karena “terasa” ranjau, bukan karena deduksi.', 'Flagging because a cell “feels” dangerous instead of proving it.'), bi('Menganggap jumlah bendera salah tetap aman untuk chord.', 'Chording with incorrect flags.'), bi('Melompat ke banyak frontier dan lupa asumsi sebelumnya.', 'Jumping across many frontiers and losing track of assumptions.')],
    levels: [level('SD', '9×9 · 10 ranjau.'), level('SMP', '12×12 · 20 ranjau.'), level('SMA', '16×16 · 40 ranjau.'), level('Univ · Hard', '16×30 · 99 ranjau acak.'), level('Univ · Very Hard', '20×30 · 150 ranjau acak.'), level('Univ · Impossible', '24×36 · 240 ranjau acak; first click tetap aman.')]
  },
  maze: {
    objective: bi('Bawa pemain dari START acak di tepi arena menuju EXIT acak yang jauh melalui perfect maze yang selalu memiliki solusi.', 'Move from a randomized START on the perimeter to a distant randomized EXIT through a perfect maze that is always solvable.'),
    victory: bi('Capai EXIT secepat mungkin. Hanya langkah valid yang dihitung; efisiensi membandingkan langkahmu dengan jalur terpendek.', 'Reach EXIT as fast as possible. Only valid moves count; efficiency compares your route with the shortest path.'),
    facts: [fact('Maze', 'Maze type', 'Perfect maze'), fact('Rute', 'Route', 'Unik antar dua petak', 'Unique between any two cells'), fact('Kontrol', 'Controls', 'WASD / Panah / D-pad', 'WASD / Arrows / D-pad')],
    controls: [bi('Desktop: panah atau WASD.', 'Desktop: Arrow keys or WASD.'), bi('Mobile: gunakan D-pad di bawah papan.', 'Mobile: use the D-pad below the board.'), bi('Menabrak dinding tidak menambah hitungan langkah.', 'Bumping into a wall does not increase the move count.')],
    tutorial: [
      item('Cari koridor utama', 'Read the corridor', 'Sebelum bergerak cepat, lihat satu atau dua percabangan ke depan.', 'Before moving quickly, scan one or two junctions ahead.'),
      item('Tandai percabangan', 'Mark junctions mentally', 'Saat memilih cabang, ingat percabangan terakhir sebagai titik kembali jika ternyata buntu.', 'When choosing a branch, remember the last junction as your return point if it dead-ends.'),
      item('Jangan ulangi dead end', 'Do not repeat dead ends', 'Jejak kunjungan membantu. Setelah kembali dari jalan buntu, pilih cabang yang belum dicoba.', 'Visited cells help. After returning from a dead end, choose an unexplored branch.'),
      item('Gunakan dinding sebagai recovery', 'Use wall-following as recovery', 'Jika kehilangan orientasi, ikuti dinding kiri atau kanan secara konsisten sampai kembali memahami struktur.', 'If disoriented, consistently follow one wall until you regain your mental map.'),
      item('Optimalkan setelah tahu rute', 'Optimize after learning the route', 'Untuk mengejar rekor, minimalkan backtracking dan jeda di percabangan.', 'For a record, minimize backtracking and hesitation at junctions.')
    ],
    solve: {
      title: bi('DFS manual: percabangan → coba → mundur', 'Manual DFS: junction → try → backtrack'),
      intro: bi('Perfect maze tidak punya loop. Itu berarti setiap jalan buntu yang sudah diperiksa tidak perlu dikunjungi lagi.', 'A perfect maze has no loops. Once a dead end is explored, it never needs to be revisited.'),
      steps: [
        item('Simpan percabangan', 'Remember the junction', 'Saat ada beberapa arah, pilih satu dan simpan lokasi percabangan.', 'At a junction, choose one direction and remember the junction.'),
        item('Ikuti sampai keputusan berikut', 'Follow to the next decision', 'Teruskan sepanjang koridor sampai EXIT, buntu, atau percabangan baru.', 'Continue down the corridor until EXIT, a dead end, or another junction.'),
        item('Backtrack jika buntu', 'Backtrack on dead end', 'Kembali ke percabangan terakhir dan pilih cabang lain.', 'Return to the last junction and try a different branch.'),
        item('Jangan buka cabang lama', 'Do not retry old branches', 'Karena tidak ada loop, cabang gagal tetap gagal.', 'Because there are no loops, a failed branch stays failed.')
      ],
      example: bi('Di persimpangan T, jika kanan berakhir buntu, kembali ke T lalu ambil kiri. Tidak ada alasan mencoba kanan lagi.', 'At a T-junction, if right is a dead end, return to the T and take left. There is no reason to try right again.')
    },
    mistakes: [bi('Bergerak terlalu cepat dan lupa percabangan terakhir.', 'Moving too quickly and forgetting the last junction.'), bi('Mengikuti dinding sebagai strategi tercepat; itu aman, tetapi sering bukan rute optimal.', 'Using wall-following as the fastest strategy; it is reliable but rarely optimal.'), bi('Pada papan besar, mencoba mengingat setiap sel alih-alih zona/koridor.', 'On large boards, trying to memorize every cell instead of zones/corridors.')],
    levels: [level('SD', '7×7 · layout dan START/EXIT diacak.'), level('SMP', '10×10 · layout dan START/EXIT diacak.'), level('SMA', '14×14 · layout dan START/EXIT diacak.'), level('Univ · Hard', '18×18 · Arena acak.'), level('Univ · Very Hard', '24×24 · Arena acak.'), level('Univ · Impossible', '32×32 · 1.024 sel · layout serta START/EXIT acak; gunakan chunking per zona.')]
  },
  matrix: {
    objective: bi('Hafalkan petak yang menyala, lalu pilih kembali semua petak tersebut setelah pola disembunyikan.', 'Memorize the highlighted cells, then select all of them after the pattern disappears.'),
    victory: bi('Petak benar = +100. Salah = −50 dan −1 nyawa. Selesaikan seluruh ronde dengan tiga nyawa yang sama untuk satu run.', 'Correct cell = +100. Wrong cell = −50 and −1 life. Clear every round using the same three lives for the whole run.'),
    facts: [fact('Nyawa', 'Lives', '3 per run'), fact('Skor benar', 'Correct score', '+100'), fact('Salah', 'Wrong pick', '−50 & −1 nyawa', '−50 & −1 life')],
    controls: [bi('Saat fase hafal, hanya amati pola.', 'During memorize, just observe the pattern.'), bi('Saat fase pilih, ketuk semua petak yang tadi menyala.', 'During rebuild, tap every cell that was highlighted.'), bi('Petak benar terkunci agar tidak bisa dipilih dua kali.', 'Correct cells lock so they cannot be selected twice.')],
    tutorial: [
      item('Buat koordinat mental', 'Create a mental coordinate system', 'Bagi matriks menjadi baris, kolom, sudut, tepi, dan pusat.', 'Divide the matrix into rows, columns, corners, edges, and center.'),
      item('Chunk pola', 'Chunk the pattern', 'Kelompokkan petak menjadi bentuk: garis, L, kotak 2×2, diagonal, atau pasangan.', 'Group cells into shapes: lines, L-shapes, 2×2 blocks, diagonals, or pairs.'),
      item('Pindai dengan urutan tetap', 'Scan in a fixed order', 'Gunakan urutan kiri-atas → kanan-bawah setiap ronde agar tidak ada area terlewat.', 'Use the same top-left → bottom-right scan every round so no region is skipped.'),
      item('Rekonstruksi jangkar dulu', 'Rebuild anchors first', 'Pilih sudut/tepi yang paling mudah diingat, lalu isi kelompok interior.', 'Select memorable corner/edge anchors first, then fill interior clusters.'),
      item('Hindari klik coba-coba', 'Avoid exploratory clicks', 'Tiga nyawa dipakai untuk seluruh run. Jika ragu, berhenti sejenak dan visualisasikan pola lagi.', 'Three lives cover the entire run. If unsure, pause and reconstruct the image mentally before clicking.')
    ],
    solve: {
      title: bi('Metode “baris + bentuk”', 'Row + shape encoding'),
      intro: bi('Simpan dua representasi sekaligus: jumlah petak per baris dan bentuk global.', 'Store two representations at once: cell count per row and the overall shape.'),
      steps: [
        item('Hitung per baris', 'Count per row', 'Contoh: 2–1–3–0 berarti baris 1 punya 2 target, baris 2 punya 1, dst.', 'Example: 2–1–3–0 means row 1 has 2 targets, row 2 has 1, etc.'),
        item('Beri nama bentuk', 'Name the shape', 'Misalnya “L di kiri + dua titik kanan”. Label verbal membantu memori visual.', 'For example “left L + two right dots”. Verbal labels reinforce visual memory.'),
        item('Pasang jangkar', 'Place anchors', 'Pilih sel sudut/tepi yang paling jelas dulu.', 'Select the clearest corner/edge cells first.'),
        item('Cek jumlah baris', 'Verify row counts', 'Sebelum memilih petak terakhir, cocokkan jumlah pilihan per baris dengan kode yang diingat.', 'Before the final cells, compare selected counts per row with your remembered code.')
      ],
      example: bi('Jika pola 5×5 terlihat seperti L: tiga petak vertikal di kolom 1 dan tiga petak horizontal di baris 3 dengan satu titik bertumpuk, ingat “L lima petak”, bukan lima koordinat terpisah.', 'If a 5×5 pattern forms an L with three vertical and three horizontal cells sharing one corner, remember “five-cell L” rather than five separate coordinates.')
    },
    mistakes: [bi('Menghafal sel satu per satu tanpa chunking.', 'Memorizing isolated cells without chunking.'), bi('Mengubah arah scanning setiap ronde.', 'Changing your scan direction every round.'), bi('Klik cepat saat ragu karena penalti salah berlaku untuk seluruh run.', 'Clicking while uncertain even though mistakes cost lives for the entire run.')],
    levels: [level('SD', '3×3 · 5 ronde · mulai 3 target · preview 2,6 dtk.'), level('SMP', '4×4 · 6 ronde · mulai 4 target · preview 2,35 dtk.'), level('SMA', '5×5 · 7 ronde · mulai 5 target · preview 2,1 dtk.'), level('Univ · Hard', '6×6 · 7 ronde · mulai 7 target · preview 1,9 dtk.'), level('Univ · Very Hard', '7×7 · 8 ronde · mulai 9 target · preview 1,65 dtk.'), level('Univ · Impossible', '8×8 · 9 ronde · mulai 12 target · +2 target/ronde · preview 1,4 dtk.')]
  },
  nonogram: {
    objective: bi('Isi petak berdasarkan petunjuk angka pada baris dan kolom sampai gambar tersembunyi terbentuk.', 'Fill cells from row and column number clues until the hidden picture is revealed.'),
    victory: bi('Semua petak yang seharusnya terisi harus tepat, tanpa petak ekstra. Tanda X boleh digunakan untuk menandai petak yang sudah pasti kosong.', 'Every required filled cell must be correct with no extra filled cells. X marks can identify cells proven empty.'),
    facts: [fact('Papan', 'Board', '5×5 hingga 20×20', '5×5 to 20×20'), fact('Clue', 'Clues', 'Kelompok berurutan', 'Consecutive groups'), fact('Mode Univ', 'University', 'Hard / Very Hard / Impossible')],
    controls: [bi('Klik/ketuk sesuai mode aktif untuk mengisi atau memberi X.', 'Click/tap using the active mode to fill or mark X.'), bi('Klik kanan di desktop untuk memasang atau melepas X.', 'Right-click on desktop to toggle an X.'), bi('Gunakan tombol Isi/Kosong di mobile sebelum mengetuk petak.', 'Use Fill/Empty mode buttons on mobile before tapping cells.')],
    tutorial: [
      item('Baca semua clue', 'Read every clue', 'Angka menunjukkan panjang kelompok petak terisi dari kiri ke kanan atau atas ke bawah.', 'Numbers show the lengths of filled groups from left to right or top to bottom.'),
      item('Mulai dari clue besar', 'Start with large clues', 'Baris yang hampir penuh biasanya langsung memberi petak pasti.', 'Nearly full lines usually reveal forced cells immediately.'),
      item('Tandai petak kosong', 'Mark empty cells', 'Setelah sebuah kelompok selesai, beri X di sisi yang tidak boleh terisi.', 'Once a group is complete, mark the cells beside it that cannot be filled.'),
      item('Silangkan baris dan kolom', 'Cross-check rows and columns', 'Setiap petak yang pasti di satu arah menjadi informasi baru untuk arah lainnya.', 'Every forced cell in one direction becomes new information for the other.'),
      item('Ulangi sampai konsisten', 'Repeat until consistent', 'Kerjakan garis dengan informasi terbanyak, lalu kembali ke garis yang sebelumnya belum pasti.', 'Work the most constrained lines, then revisit lines that were previously uncertain.')
    ],
    solve: {
      title: bi('Metode overlap dan sisa ruang', 'Overlap and remaining-space method'),
      intro: bi('Bandingkan panjang clue dengan panjang baris untuk menemukan petak yang pasti terisi tanpa menebak.', 'Compare clue lengths with line length to find guaranteed filled cells without guessing.'),
      steps: [
        item('Hitung kebutuhan minimum', 'Calculate minimum space', 'Jumlahkan semua clue lalu tambahkan minimal satu spasi antar-kelompok.', 'Add all clues plus at least one gap between groups.'),
        item('Cari overlap', 'Find overlap', 'Bayangkan kelompok ditempatkan paling kiri lalu paling kanan. Bagian yang selalu tumpang tindih pasti terisi.', 'Place a group as far left and as far right as possible. Cells that overlap in both placements are forced.'),
        item('Tutup kelompok selesai', 'Close completed groups', 'Jika panjang kelompok sudah cocok dengan clue, tandai petak di kedua sisinya sebagai kosong.', 'When a group matches its clue length, mark the cells immediately beside it empty.'),
        item('Propagasi silang', 'Propagate across', 'Gunakan setiap petak baru untuk mempersempit baris atau kolom yang berpotongan.', 'Use every new certainty to constrain intersecting rows or columns.')
      ],
      example: bi('Pada baris 5 petak dengan clue 4, penempatan 11110 dan 01111 selalu bertumpuk di tiga petak tengah. Tiga petak itu pasti terisi.', 'In a 5-cell line with clue 4, placements 11110 and 01111 always overlap in the middle three cells. Those three are guaranteed filled.')
    },
    mistakes: [bi('Menganggap semua clue harus menempel tanpa jarak.', 'Assuming all clue groups touch with no gaps.'), bi('Mengisi berdasarkan bentuk gambar yang dibayangkan, bukan berdasarkan clue.', 'Filling based on an imagined picture instead of the clues.'), bi('Tidak memberi X pada petak kosong yang sudah pasti sehingga informasi silang terbuang.', 'Failing to mark proven empty cells and losing useful cross-information.')],
    levels: [level('SD', '5×5 · dasar overlap.'), level('SMP', '8×8 · beberapa kelompok per garis.'), level('SMA', '10×10 · deduksi silang lebih panjang.'), level('Univ · Hard', '12×12.'), level('Univ · Very Hard', '15×15.'), level('Univ · Impossible', '20×20 · perlu disiplin propagasi dan pencatatan X.')]
  },
  game2048: {
    objective: bi('Gabungkan ubin bernilai sama untuk membangun ubin target tanpa memenuhi papan.', 'Merge equal tiles to build the target tile without filling the board.'),
    victory: bi('Capai target sesuai tingkat: 128, 256, 512, 1024, 2048, atau 4096.', 'Reach the target for your level: 128, 256, 512, 1024, 2048, or 4096.'),
    facts: [fact('Papan', 'Board', '4×4'), fact('Spawn', 'Spawn', '2 atau 4', '2 or 4'), fact('Universitas', 'University', '1024 / 2048 / 4096')],
    controls: [bi('Gunakan panah atau WASD di desktop.', 'Use Arrow keys or WASD on desktop.'), bi('Swipe pada papan di perangkat sentuh.', 'Swipe the board on touch devices.'), bi('D-pad di bawah papan menjadi alternatif tanpa gesture.', 'The D-pad below the board is a non-gesture alternative.')],
    tutorial: [
      item('Pilih sudut utama', 'Choose a main corner', 'Pertahankan ubin terbesar di satu sudut, misalnya kanan bawah.', 'Keep the largest tile in one corner, such as bottom-right.'),
      item('Bangun rantai menurun', 'Build a descending chain', 'Susun nilai besar ke kecil sepanjang tepi dekat sudut utama.', 'Arrange large-to-small values along the edge beside your main corner.'),
      item('Batasi arah berbahaya', 'Avoid dangerous directions', 'Jangan sering memakai arah yang menarik ubin terbesar keluar dari sudut.', 'Avoid directions that pull the largest tile away from its anchor corner.'),
      item('Gabung dari nilai kecil', 'Merge small values first', 'Sediakan ruang dengan menggabungkan 2 dan 4 sebelum papan terlalu padat.', 'Create room by merging 2s and 4s before the board gets crowded.'),
      item('Rencanakan spawn', 'Plan around spawns', 'Setiap gerak valid memunculkan ubin baru, jadi sisakan jalur untuk menyerapnya.', 'Every valid move spawns a new tile, so preserve a lane to absorb it.')
    ],
    solve: {
      title: bi('Strategi sudut dan snake chain', 'Corner and snake-chain strategy'),
      intro: bi('Tujuannya bukan mengejar gabungan tercepat, tetapi mempertahankan urutan nilai agar papan tetap terkendali.', 'The goal is not the fastest merge; it is preserving value order so the board stays controllable.'),
      steps: [
        item('Kunci nilai terbesar', 'Anchor the largest tile', 'Pilih sudut dan jangan pindahkan ubin terbesar dari sana.', 'Pick a corner and keep the largest tile anchored there.'),
        item('Buat rantai', 'Build a chain', 'Susun ubin berikutnya secara menurun di sepanjang tepi lalu berbelok seperti ular.', 'Arrange the next values in descending order along the edge, then turn like a snake.'),
        item('Isi dari sisi jauh', 'Feed from the far side', 'Gabungkan ubin kecil di sisi berlawanan dan dorong hasilnya menuju rantai besar.', 'Merge small tiles on the far side and feed the results toward the large chain.'),
        item('Hindari papan checkerboard', 'Avoid checkerboards', 'Pola nilai selang-seling tanpa pasangan cepat membuat papan macet.', 'Alternating values with no adjacent matches quickly create a locked board.')
      ],
      example: bi('Jika sudut kanan bawah menyimpan 512, usahakan 256 berada di sebelahnya, lalu 128, 64, dan seterusnya. Rantai ini membuat merger besar lebih terprediksi.', 'If bottom-right holds 512, keep 256 beside it, then 128, 64, and so on. This chain makes large merges more predictable.')
    },
    mistakes: [bi('Menggerakkan semua arah secara acak.', 'Swiping randomly in every direction.'), bi('Mengejar satu merger besar tetapi membiarkan banyak ubin kecil terisolasi.', 'Chasing one big merge while leaving many isolated small tiles.'), bi('Memindahkan ubin terbesar dari sudut utama tanpa jalur untuk mengembalikannya.', 'Pulling the largest tile out of the anchor corner without a way to restore it.')],
    levels: [level('SD', 'Target 128.'), level('SMP', 'Target 256.'), level('SMA', 'Target 512.'), level('Univ · Hard', 'Target 1024.'), level('Univ · Very Hard', 'Target 2048.'), level('Univ · Impossible', 'Target 4096.')]
  }

};

export function pickGuideText(value, lang = 'id') {
  if (typeof value === 'string') return value;
  return value?.[lang] ?? value?.id ?? value?.en ?? '';
}
