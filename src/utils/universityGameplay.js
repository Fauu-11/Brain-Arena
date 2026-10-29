import { hashSeed, mulberry32 } from './competitive.js';
const bi=(id,en)=>({id,en});
const variant=(id,name,note,period=0)=>({id,name:bi(...name),note:bi(...note),period});
export const UNIVERSITY_GAMEPLAY={
 maze:[
  variant('fatal-wall',['Dinding fatal','Fatal walls'],['Mencoba bergerak menembus dinding langsung mengakhiri permainan. Gunakan panah, WASD, atau D-pad.','Trying to move through a wall ends the game. Use arrows, WASD or the D-pad.']),
  variant('vanishing-walls',['Dinding ingatan','Memory walls'],['Dinding terlihat 8 detik pertama, lalu hanya muncul 5 detik setiap 60 detik. Dinding tetap menghalangi gerak saat tak terlihat.','Walls show for the first 8 seconds, then for 5 seconds every 60 seconds. Invisible walls still block movement.'],60),
  variant('shifting-maze',['Labirin berubah','Shifting maze'],['Dinding diacak ulang setiap 20 detik. Posisi pemain dan pintu keluar tetap; selalu ada rute menuju keluar.','Walls regenerate every 20 seconds. Your position and exit stay fixed; a path to the exit always exists.'],20),
 ],
 game2048:[
  variant('heavy-spawn',['Ubin berat','Heavy tiles'],['Setiap langkah valid memunculkan angka 4. Dua ubin awal mengikuti aturan biasa.','Every valid move spawns a 4. The two opening tiles use the usual rules.']),
  variant('hidden-values',['Angka tersembunyi','Hidden values'],['Nilai ubin terlihat 6 detik pertama, lalu hanya 3 detik setiap 20 detik. Hafalkan posisi dan gabungannya.','Values show for the first 6 seconds, then for 3 seconds every 20 seconds. Remember positions and merges.'],20),
  variant('locked-direction',['Arah terkunci','Locked direction'],['Satu arah tidak boleh dipakai selama 20 detik; arah terkunci berputar Atas → Kanan → Bawah → Kiri.','One direction is unavailable for 20 seconds; the lock rotates Up → Right → Down → Left.'],20),
 ],
 nonogram:[
  variant('permanent-ink',['Tinta permanen','Permanent ink'],['Petak yang sudah ditandai tidak dapat diubah. Rencanakan deduksi sebelum mengisi atau menandai X.','Marked cells cannot be changed. Deduce carefully before filling a cell or marking X.']),
  variant('hidden-clues',['Petunjuk ingatan','Memory clues'],['Petunjuk terlihat 10 detik pertama, lalu hanya 4 detik setiap 20 detik. Tanda di papan tetap terlihat.','Clues show for the first 10 seconds, then for 4 seconds every 20 seconds. Board markings remain visible.'],20),
  variant('rotating-picture',['Gambar berputar','Rotating picture'],['Papan berputar 180° setiap 20 detik, termasuk tanda dan petunjuk. Solusi tetap konsisten.','The board rotates 180° every 20 seconds, including markings and clues. The solution stays consistent.'],20),
 ],
 matrix:[
  variant('mirror-recall',['Ingatan cermin','Mirrored recall'],['Hafalkan pola, lalu pilih posisi hasil putaran 180°. Sudut kiri atas menjadi kanan bawah.','Memorize the pattern, then select its 180° rotation. Top left becomes bottom right.']),
  variant('inverse-recall',['Pola kebalikan','Inverse pattern'],['Setelah hafalan, pilih semua petak yang TIDAK menyala. Petak yang menyala adalah pengalih perhatian.','After memorizing, select every cell that was NOT lit. Lit cells are distractors.']),
  variant('ordered-recall',['Urutan presisi','Ordered recall'],['Pilih petak target berurutan dari kiri ke kanan, baris atas ke bawah. Salah urutan mengurangi nyawa.','Select target cells in reading order, left to right and top to bottom. A wrong order costs a life.']),
 ],
 sudoku:[
  variant('perfect-entry',['Satu angka salah','One wrong digit'],['Memasukkan angka yang tidak cocok dengan papan hafalan langsung kalah. Menghapus angka masih diizinkan.','Entering a digit that differs from the memorized board ends the game. Erasing is still allowed.']),
  variant('fading-entries',['Isian menghilang','Fading entries'],['Saat menjawab, angka isianmu hanya terlihat pada petak terpilih atau selama kilatan 3 detik tiap 20 detik.','During recall, your entries show only in the selected cell or during a 3-second flash every 20 seconds.'],20),
  variant('rotating-sudoku',['Sudoku berputar','Rotating Sudoku'],['Saat menjawab, papan dan isian berputar 180° setiap 20 detik. Aturan baris, kolom, dan kotak tetap valid.','During recall, the board and entries rotate 180° every 20 seconds. Rows, columns and boxes stay valid.'],20),
 ],
 minesweeper:[
  variant('no-flags',['Tanpa bendera','No flags'],['Bersihkan papan tanpa bendera. Mode bendera, klik kanan, dan tekan lama tidak memasang tanda.','Clear the board without flags. Flag mode, right-click and long-press cannot place flags.']),
  variant('fading-numbers',['Angka berkedip','Blinking clues'],['Angka petunjuk terlihat 8 detik pertama, lalu hanya 4 detik setiap 20 detik. Petak yang terbuka tetap terlihat.','Clue numbers show for the first 8 seconds, then for 4 seconds every 20 seconds. Open cells remain visible.'],20),
  variant('precise-flags',['Bendera presisi','Precise flags'],['Buka petak pertama dahulu. Setelah itu, memasang bendera pada petak aman langsung kalah.','Open the first cell first. After that, flagging a safe cell ends the game.']),
 ],
 prime:[
  variant('prime-or-lose',['Prima atau kalah','Prime or lose'],['Memilih bilangan komposit atau salah menebak kubus ? langsung mengalahkan pemain yang memilihnya. Berlaku juga untuk AI.','Choosing a composite or misjudging the ? cube immediately loses the choosing player the duel. Also applies to AI.']),
  variant('hidden-numbers',['Papan hafalan','Memory board'],['Angka yang belum dipilih terlihat 8 detik pertama, lalu 5 detik setiap 20 detik. Saat tersembunyi, AI juga tidak memilih.','Unpicked numbers show for the first 8 seconds, then for 5 seconds every 20 seconds. The AI also waits while they are hidden.'],20),
  variant('shuffled-numbers',['Angka berpindah','Moving numbers'],['Posisi angka yang belum dipilih diacak setiap 20 detik, setelah aksi yang sedang berjalan selesai.','Unpicked numbers shuffle every 20 seconds, after any action in progress finishes.'],20),
 ],
 pixel:[
  variant('fatal-overlap',['Piksel tanpa tabrakan','No pixel collisions'],['Jika pilihan kartu membuat piksel tumpang tindih, permainan langsung berakhir.','If selected cards create overlapping pixels, the game ends immediately.']),
  variant('hidden-targets',['Target hafalan','Memory targets'],['Target yang belum selesai terlihat 8 detik pertama, lalu hanya 4 detik setiap 20 detik.','Unsolved targets show for the first 8 seconds, then for 4 seconds every 20 seconds.'],20),
  variant('shuffled-cards',['Kartu berpindah','Moving cards'],['Kartu diacak setiap 20 detik. Jika ada kartu terpilih, pengacakan menunggu hingga pilihan dikosongkan.','Cards shuffle every 20 seconds. If cards are selected, shuffling waits until the selection clears.'],20),
 ],
 cube:[
  variant('perfect-count',['Hitungan sempurna','Perfect count'],['Jawaban salah atau waktu habis langsung mengakhiri permainan. Tuntaskan kelima susunan.','A wrong answer or timeout ends the game. Clear all five stacks.']),
  variant('memory-stack',['Kubus hafalan','Memory stack'],['Susunan kubus hanya terlihat 6 detik pertama pada setiap soal. Setelah itu hitung dari ingatan.','Each stack is visible only for its first 6 seconds. Then count from memory.']),
  variant('turning-stack',['Sudut berubah','Changing view'],['Susunan diputar 90° setiap 5 detik. Jumlah kubus tetap sama; hindari menghitung dua kali.','The stack rotates 90° every 5 seconds. Its cube count stays the same; avoid counting twice.'],5),
 ],
 mnm:[
  variant('perfect-pairs',['Pasangan sempurna','Perfect pairs'],['Dua chip yang tidak cocok atau timer habis langsung mengalahkan pemain aktif. Aturan sama untuk AI.','A mismatch or timeout immediately loses the active player the duel. The AI follows the same rule.']),
  variant('brief-memory',['Hafalan singkat','Brief memory'],['Fase menghafal berakhir otomatis setelah 6 detik. Setelah itu chip ditutup dan giliran pertama dimulai.','Memorization ends automatically after 6 seconds. Chips then hide and the first turn starts.']),
  variant('moving-tiles',['Ubin bergerak','Moving tiles'],['Setiap 20 detik, satu ubin tetangga bergeser ke ruang kosong pada jeda aman. Pasangan chip tetap utuh.','Every 20 seconds, one neighboring tile slides into the blank at a safe moment. Chip pairs remain intact.'],20),
 ],
 rps:[
  variant('sudden-duel',['Duel sekali kalah','Sudden duel'],['Satu kekalahan saat mendarat atau waktu perencanaan habis langsung memenangkan lawan. Seri tetap lanjut.','One losing landing or planning timeout immediately wins the opponent the duel. Draws continue.']),
  variant('brief-net',['Jaring-jaring singkat','Brief net'],['Hafalkan jaring-jaring dalam 6 detik. Dadu kemudian dilipat otomatis dan permainan dimulai.','Memorize the net in 6 seconds. The die then folds automatically and play begins.']),
  variant('shifting-symbols',['Simbol berubah','Shifting symbols'],['Simbol papan diacak setiap 20 detik pada fase perencanaan. Animasi lempar yang berjalan tidak diubah.','Board symbols shuffle every 20 seconds during planning. An ongoing roll animation is preserved.'],20),
 ],
 '300':[
  variant('perfect-arithmetic',['Hitung tanpa salah','Flawless arithmetic'],['Satu jawaban salah mengakhiri sesi. Pada Paket Soal, semua jawaban harus benar saat dikirim.','One wrong answer ends the session. In Question Set, every answer must be correct when submitted.']),
  variant('offset-arithmetic',['Hasil bersandi','Encoded result'],['Setiap soal memiliki tambahan angka sandi. Hitung jawaban soal, lalu tambahkan sandi yang tertera sebelum mengirim.','Each question has a code offset. Calculate the original answer, then add its displayed offset before submitting.']),
  variant('arithmetic-deadline',['Balap 180 detik','180-second sprint'],['Selesaikan jumlah soal yang dipilih dalam 180 detik waktu aktif. Sesi berakhir jika waktu habis.','Complete your chosen number of questions within 180 active seconds. The session ends on timeout.']),
 ],
 codebreaker:[
  variant("limited-guesses",["Sandi tujuh kesempatan", "Seven attempts"],["Pecahkan sandi dalam tujuh tebakan lengkap.", "Crack the code in seven complete guesses."],0),
  variant("fading-feedback",["Petunjuk menghilang", "Fading feedback"],["Hasil tepat/salah posisi disembunyikan lima detik setelah tiap tebakan.", "Exact/misplaced feedback hides five seconds after each guess."],0),
  variant("unique-code",["Sandi tanpa pengulangan", "Distinct digits"],["Seluruh enam digit sandi berbeda. Tebakan juga harus memakai digit berbeda.", "All six code digits differ. Guesses must also use distinct digits."],0),
 ],
 lightsout:[
  variant("limited-lights",["Langkah terbatas", "Limited moves"],["Padamkan papan dalam batas langkah yang ditampilkan. Batas dibuat dari solusi yang dijamin ada.", "Clear within the shown move budget, derived from a guaranteed solution."],0),
  variant("alternating-lights",["Tombol bergantian", "Alternating buttons"],["Separuh tombol terkunci bergantian tiap 10 detik. Semua posisi tetap mendapat giliran dibuka.", "Half the buttons alternate being locked every 10 seconds. Every position gets an unlocked turn."],10),
  variant("rotating-lights",["Lampu berputar", "Rotating lights"],["Papan berputar 180° setiap 20 detik. Pola tetap dapat dipadamkan.", "The board rotates 180° every 20 seconds and remains solvable."],20),
 ],
 sequence:[
  variant("reverse-sequence",["Urutan balik", "Reverse order"],["Jawab seluruh urutan dari angka terakhir ke pertama.", "Recall the entire sequence from last to first."],0),
  variant("offset-sequence",["Urutan tambah satu", "Plus-one recall"],["Tambahkan satu pada setiap angka yang diingat; angka 10 kembali menjadi 1.", "Add one to each remembered number; 10 wraps to 1."],0),
  variant("shuffled-sequence",["Posisi tombol acak", "Shuffled buttons"],["Posisi tombol diacak setelah tiap preview. Hafalkan angka, bukan posisi.", "Buttons shuffle after every preview. Remember numbers rather than positions."],0),
 ],
 kakuro:[
  variant("permanent-sums",["Angka permanen", "Permanent entries"],["Angka yang sudah diisi tidak dapat diganti atau dihapus. Angka awal tetap terkunci.", "Entered digits cannot be changed or erased. Initial givens stay locked."],0),
  variant("fading-sums",["Jumlah berkedip", "Blinking sums"],["Petunjuk jumlah terlihat 12 detik awal, lalu 4 detik tiap 20 detik.", "Sum clues show for the first 12 seconds, then four seconds every 20 seconds."],20),
  variant("rotating-sums",["Silang berputar", "Rotating sums"],["Papan, panah, petunjuk, dan isian berputar 180° tiap 20 detik.", "Board, arrows, clues and entries rotate 180° every 20 seconds."],20),
 ],
 slitherlink:[
  variant("permanent-loop",["Garis permanen", "Permanent lines"],["Garis yang sudah digambar tidak dapat dihapus. Tanda X masih bisa diubah.", "Drawn lines cannot be erased. X marks can still be changed."],0),
  variant("fading-loop-clues",["Petunjuk lingkar berkedip", "Blinking loop clues"],["Angka petunjuk terlihat 12 detik awal, lalu 4 detik tiap 20 detik.", "Clue numbers show for the first 12 seconds, then four seconds every 20 seconds."],20),
  variant("rotating-loop",["Lingkar berputar", "Rotating loop"],["Papan, garis, tanda X, dan petunjuk berputar 180° tiap 20 detik.", "Board, lines, X marks and clues rotate 180° every 20 seconds."],20),
 ],
};
let active=null;
export function chooseUniversityVariant(gameId,seed,previous=null){
 const choices=UNIVERSITY_GAMEPLAY[gameId]||[];const pool=choices.filter(item=>item.id!==previous);const candidates=pool.length?pool:choices;
 return candidates.length?candidates[Math.floor(mulberry32(hashSeed(`${seed}:gameplay`))()*candidates.length)].id:null;
}
export function setUniversityVariant(gameId,id){active=id?{gameId,id}:null;}
export function currentUniversityVariant(gameId){return active?.gameId===gameId?active.id:null;}
export function variantFor(gameId,id){return UNIVERSITY_GAMEPLAY[gameId]?.find(item=>item.id===id)||null;}
export function revealWindow(seconds,initial,period,visible){return seconds<initial||seconds%period<visible;}
export function rotate180(values){return [...values].reverse();}
export function rotateSquare90(values,size){return values.map((_,i)=>values[(size-1-(i%size))*size+Math.floor(i/size)]);}
export function shuffleValues(values,random){const next=[...values];for(let i=next.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[next[i],next[j]]=[next[j],next[i]];}return next;}
export function transformMemoryPattern(pattern,total,variant){if(variant==='mirror-recall')return new Set([...pattern].map(i=>total-1-i));if(variant==='inverse-recall')return new Set(Array.from({length:total},(_,i)=>i).filter(i=>!pattern.has(i)));return new Set(pattern);}
export function slideRandomTile(tiles,cols,random){
 const empty=tiles.indexOf(cols*cols-1);if(empty<0)return [...tiles];
 const row=Math.floor(empty/cols),col=empty%cols;
 const slots=[[row-1,col],[row+1,col],[row,col-1],[row,col+1]].filter(([r,c])=>r>=0&&r<cols&&c>=0&&c<cols).map(([r,c])=>r*cols+c);
 const chosen=slots[Math.floor(random()*slots.length)];const next=[...tiles];[next[empty],next[chosen]]=[next[chosen],next[empty]];return next;
}
export function encodeArithmeticQuestion(question,offset){
 const arrow=/^(\d+) → (.+)$/.exec(question.equation);
 if(arrow){const base=/hex|heksa/.test(arrow[2])?16:/oct|oktal/.test(arrow[2])?8:2;return {...question,equation:`(${arrow[1]} + ${offset}) → ${arrow[2]}`,answer:(Number(arrow[1])+offset).toString(base).toUpperCase(),offset};}
 const answer=Number(question.answer);
 if(!Number.isFinite(answer))return question;
 return {...question,equation:`${question.equation} [hasil/result + ${offset}]`,answer:String(Math.round((answer+offset)*1e9)/1e9),offset};
}
