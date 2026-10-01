import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GAMES, CATEGORIES, gameById } from '../data/games.js';
import { GUIDE_DETAILS, pickGuideText } from '../data/guideDetails.js';
import Icon from '../components/Icon.jsx';

export default function TipsPage({ gameId = '300', onBack, onNavigate }) {
  const { lang } = useLanguage();

  // Normalize gameId (removes "tips-" prefix if routed as "tips-prime", "tips-pixel", etc.)
  const normalizedInitialId = (gameId || '300').replace(/^tips-/, '');
  const [selectedGame, setSelectedGame] = useState(normalizedInitialId);
  const [levelFilter, setLevelFilter] = useState('all'); // 'all', 'sd', 'smp', 'sma', 'univ'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [completedSteps, setCompletedSteps] = useState({});

  const GAME_LIST = GAMES;

  const TIPS_DATABASE = {
    '300': {
      titleEn: 'Arithmetic Blitz (Math 300)',
      titleId: 'Blitz Aritmatika (Math 300)',
      sections: [
        {
          tier: 'all',
          headingEn: 'General Speedrunning Strategy',
          headingId: 'Strategi Umum Kecepatan (Speedrun)',
          tips: [
            {
              titleEn: 'Scan and Sweep First',
              titleId: 'Pindai dan Sikat Soal Mudah Terlebih Dahulu',
              textEn: 'All questions on a page give the exact same score. Instantly answer place values, single-digit additions, and obvious powers before touching multi-step fractions.',
              textId: 'Semua soal dalam satu halaman bernilai poin yang sama. Jawab langsung soal nilai tempat, penjumlahan sederhana, dan perpangkatan mudah sebelum menyentuh pecahan bertingkat.',
              formula: 'Easy 1s questions = Hard 15s questions (1 PT)'
            },
            {
              titleEn: 'Zero-Penalty Verification',
              titleId: 'Verifikasi Bebas Penalti',
              textEn: 'Submitting with 1 mistake triggers a 10-second penalty lockout. If unsure about the last question, do a 3-second sweep of your other 29 answers before submitting.',
              textId: 'Mengirim halaman dengan 1 kesalahan memicu penguncian penalti 10 detik. Jika ragu pada soal terakhir, luangkan 3 detik untuk mengecek 29 jawaban lainnya sebelum menekan submit.'
            }
          ]
        },
        {
          tier: 'sd',
          headingEn: 'SD Level Shortcuts (Elementary)',
          headingId: 'Trik Cepat Level SD (Sekolah Dasar)',
          tips: [
            {
              titleEn: 'GCD / FPB Difference Shortcut',
              titleId: 'Trik Selisih FPB',
              textEn: 'The GCD of two numbers is always a factor of their difference. For 48 and 64, difference = 16. Since both divide by 16, GCD is 16!',
              textId: 'FPB dari dua bilangan selalu merupakan faktor dari selisih keduanya. Contoh: 48 dan 64 memiliki selisih 16. Karena keduanya habis dibagi 16, FPB-nya pasti 16!',
              formula: 'GCD(A, B) divides |A - B|'
            },
            {
              titleEn: 'LCM / KPK Multiple Leap',
              titleId: 'Lompatan Kelipatan KPK',
              textEn: 'Take the larger number and check its multiples (×1, ×2, ×3...) until divisible by the smaller number. For 12 and 18: 18 (no), 36 (divisible by 12) → LCM = 36.',
              textId: 'Ambil angka terbesar dan periksa kelipatannya (×1, ×2, ×3...) hingga habis dibagi angka yang lebih kecil. Contoh 12 dan 18: 18 (tidak), 36 (habis dibagi 12) → KPK = 36.'
            },
            {
              titleEn: 'Benchmark Percentage Equivalents',
              titleId: 'Hafalan Persentase & Desimal Acuan',
              textEn: '1/8 = 12.5% (0.125), 1/4 = 25%, 3/8 = 37.5%, 1/2 = 50%, 5/8 = 62.5%, 3/4 = 75%, 7/8 = 87.5%, 1/5 = 20%, 4/5 = 80%.',
              textId: '1/8 = 12.5% (0.125), 1/4 = 25%, 3/8 = 37.5%, 1/2 = 50%, 5/8 = 62.5%, 3/4 = 75%, 7/8 = 87.5%, 1/5 = 20%, 4/5 = 80%.'
            }
          ]
        },
        {
          tier: 'smp',
          headingEn: 'SMP Level Shortcuts (Junior High)',
          headingId: 'Trik Cepat Level SMP (Menengah Pertama)',
          tips: [
            {
              titleEn: 'Inverse Proportion Workload Rule',
              titleId: 'Aturan Beban Kerja (Perbandingan Berbalik Nilai)',
              textEn: 'Total person-days remains constant: Workers₁ × Days₁ = Workers₂ × Days₂. If 6 workers take 10 days (60), 15 workers take 60 / 15 = 4 days.',
              textId: 'Total hari-pekerja selalu konstan: Pekerja₁ × Hari₁ = Pekerja₂ × Hari₂. Jika 6 pekerja butuh 10 hari (total 60), maka 15 pekerja butuh 60 / 15 = 4 hari.',
              formula: 'W₁ × D₁ = W₂ × D₂'
            },
            {
              titleEn: 'Difference of Two Squares',
              titleId: 'Selisih Dua Kuadrat',
              textEn: 'Never compute large squares directly if they follow a² - b². E.g. 53² - 47² = (53 + 47)(53 - 47) = 100 × 6 = 600.',
              textId: 'Jangan pernah menghitung kuadrat besar secara manual jika berbentuk a² - b². Contoh: 53² - 47² = (53 + 47)(53 - 47) = 100 × 6 = 600.',
              formula: 'a² - b² = (a + b)(a - b)'
            }
          ]
        },
        {
          tier: 'sma',
          headingEn: 'SMA Level Shortcuts (Senior High)',
          headingId: 'Trik Cepat Level SMA (Menengah Atas)',
          tips: [
            {
              titleEn: 'Infinite Geometric Series',
              titleId: 'Deret Geometri Tak Hingga',
              textEn: 'For series 18 + 6 + 2 + ...: first term a = 18, common ratio r = 1/3. S_inf = 18 / (1 - 1/3) = 18 / (2/3) = 27.',
              textId: 'Untuk deret 18 + 6 + 2 + ...: suku pertama a = 18, rasio r = 1/3. S_inf = 18 / (1 - 1/3) = 18 / (2/3) = 27.',
              formula: 'S_∞ = a / (1 - r)'
            },
            {
              titleEn: 'First N Odd Numbers Sum',
              titleId: 'Jumlah N Bilangan Ganjil Pertama',
              textEn: 'The sum of the first N consecutive odd numbers is simply N². E.g., 1 + 3 + 5 + ... + 29 (15 terms) = 15² = 225.',
              textId: 'Jumlah dari N bilangan ganjil berurutan pertama selalu sama dengan N². Contoh: 1 + 3 + 5 + ... + 29 (ada 15 suku) = 15² = 225.',
              formula: '1 + 3 + 5 + ... + (2N - 1) = N²'
            }
          ]
        },
        {
          tier: 'univ',
          headingEn: 'Universitas Level Shortcuts (Higher Math)',
          headingId: 'Trik Cepat Level Universitas',
          tips: [
            {
              titleEn: 'Modular Fast Exponentiation',
              titleId: 'Eksponensiasi Modular Cepat',
              textEn: 'To find the last digit of 7^106: powers of 7 end in cycles of 4 (7, 9, 3, 1). 106 mod 4 = 2, so the last digit is the 2nd in cycle: 9.',
              textId: 'Mencari digit satuan dari 7^106: siklus satuan 7 berulang tiap 4 periode (7, 9, 3, 1). 106 mod 4 = 2, maka digit terakhirnya adalah urutan ke-2: 9.'
            },
            {
              titleEn: 'Factorial Telescoping Cancellation',
              titleId: 'Penyederhanaan Faktorial Bertingkat',
              textEn: 'Factor out the lowest term: (8! - 7!) / 6! = 7! × (8 - 1) / 6! = (7 × 6! × 7) / 6! = 49.',
              textId: 'Faktorkan suku terendah: (8! - 7!) / 6! = 7! × (8 - 1) / 6! = (7 × 6! × 7) / 6! = 49.',
              formula: 'n! - (n - 1)! = (n - 1)! × (n - 1)'
            }
          ]
        }
      ]
    },
    'prime': {
      titleEn: 'Prime Hunter',
      titleId: 'Perburuan Prima',
      sections: [
        {
          tier: 'all',
          headingEn: 'Core Divisibility Rules',
          headingId: 'Aturan Keterbagian Inti',
          tips: [
            {
              titleEn: 'Rule of 3 and 9 (Digital Root)',
              titleId: 'Aturan Kelipatan 3 dan 9 (Jumlah Digit)',
              textEn: 'Add all digits. If the sum is divisible by 3, the number is composite. E.g. 561 → 5 + 6 + 1 = 12 (divisible by 3) → Not Prime.',
              textId: 'Jumlahkan semua digit. Jika jumlahnya habis dibagi 3, angka tersebut komposit (bukan prima). Contoh: 561 → 5+6+1 = 12 (kelipatan 3) → Bukan Prima.',
              formula: 'Sum(digits) mod 3 === 0'
            },
            {
              titleEn: 'The 6k ± 1 Prime Filter',
              titleId: 'Filter Prima 6k ± 1',
              textEn: 'All prime numbers greater than 3 must be directly adjacent to a multiple of 6. If adding or subtracting 1 does not produce a multiple of 6, it CANNOT be prime!',
              textId: 'Semua bilangan prima di atas 3 selalu bersebelahan dengan kelipatan 6. Jika ditambah 1 atau dikurang 1 tidak menghasilkan kelipatan 6, angka itu PASTI BUKAN prima!',
              formula: 'P > 3 ⟹ P = 6k - 1 or 6k + 1'
            },
            {
              titleEn: 'High-Reward "?" Mystery Cube Strategy',
              titleId: 'Strategi Kubus Misteri "?" (+3 Poin)',
              textEn: 'The hidden cube gives 3 points. Since primes and composites have equal generation odds, apply elimination based on visible primes on the board before guessing.',
              textId: 'Kubus "?" bernilai 3 poin. Karena peluang kemunculan prima dan komposit seimbang, hitung sisa prima yang sudah terbuka di papan untuk memperkirakan probabilitas tebakan.'
            }
          ]
        },
        {
          tier: 'smp',
          headingEn: 'SMP & SMA Traps (Numbers up to 1500)',
          headingId: 'Jebakan Angka SMP & SMA (Hingga 1500)',
          tips: [
            {
              titleEn: 'Beware the Infamous 7, 11, 13 Pseudo-Primes',
              titleId: 'Waspadai Bilangan Samaran 7, 11, 13',
              textEn: 'These numbers LOOK prime but are composite traps: 91 (7×13), 119 (7×17), 133 (7×19), 143 (11×13), 161 (7×23), 217 (7×31), 221 (13×17), 247 (13×19), 323 (17×19).',
              textId: 'Angka-angka ini TERLIHAT prima padahal komposit: 91 (7×13), 119 (7×17), 133 (7×19), 143 (11×13), 161 (7×23), 217 (7×31), 221 (13×17), 247 (13×19), 323 (17×19).'
            }
          ]
        },
        {
          tier: 'univ',
          headingEn: 'Universitas Testing (Numbers 1500 - 4000)',
          headingId: 'Pengujian Level Universitas (1500 - 4000)',
          tips: [
            {
              titleEn: 'Square Root Bound Cap',
              titleId: 'Batas Uji Akar Kuadrat (√N)',
              textEn: 'For numbers under 4000, √4000 ≈ 63. You only need to test divisibility against primes up to 61: (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61).',
              textId: 'Untuk angka hingga 4000, √4000 ≈ 63. Anda HANYA perlu menguji pembagian dengan prima hingga 61: (7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61).'
            }
          ]
        }
      ]
    },
    'pixel': {
      titleEn: 'Pixel Digits',
      titleId: 'Digit Piksel',
      sections: [
        {
          tier: 'all',
          headingEn: 'Pixel Math & Detection Logic',
          headingId: 'Matematika Piksel & Logika Deteksi',
          tips: [
            {
              titleEn: 'Target Pixel Count Table',
              titleId: 'Tabel Jumlah Piksel Digit Standar 3×5',
              textEn: 'Memorize the exact pixel count of each digital target to instantly discard card combinations that sum to the wrong total: 1 (5px), 7 (7px), 4 (9px), 2 (11px), 3 (11px), 5 (11px), 0 (12px), 6 (12px), 9 (12px), 8 (13px).',
              textId: 'Hafalkan jumlah piksel tiap digit target digital untuk langsung mengabaikan kombinasi kartu yang jumlahnya tidak cocok: 1 (5px), 7 (7px), 4 (9px), 2 (11px), 3 (11px), 5 (11px), 0 (12px), 6 (12px), 9 (12px), 8 (13px).',
              formula: 'Target 1 = 5px | Target 7 = 7px | Target 8 = 13px'
            },
            {
              titleEn: 'Use the Synthesizer Overlap Glow',
              titleId: 'Manfaatkan Sinar Merah Pratinjau Tumpukan',
              textEn: 'Look at the live stacking display workbench. If any pixel pulses in red, two of your selected cards share the same grid slot (disjoint violation). Deselect one immediately!',
              textId: 'Perhatikan area sintesis tumpukan langsung. Jika ada sel yang menyala merah, berarti ada kartu yang bertumpukan di koordinat yang sama. Batalkan salah satu kartu!'
            },
            {
              titleEn: 'Build from Outer Edges Inward',
              titleId: 'Susun dari Batas Luar ke Dalam',
              textEn: 'Anchor cards containing the left column or right column boundaries first. Digit 1 is exclusively the 3rd column. Digits 0 and 8 require both 1st and 3rd columns.',
              textId: 'Kunci kartu yang membentuk kolom batas paling kiri atau kanan terlebih dahulu. Digit 1 hanya memakai kolom ke-3. Digit 0 dan 8 wajib memiliki kolom ke-1 dan ke-3 penuh.'
            }
          ]
        }
      ]
    },
    'sudoku': {
      titleEn: 'Blind Sudoku',
      titleId: 'Sudoku Buta',
      sections: [
        {
          tier: 'all',
          headingEn: 'Visual Memory & Grid Logic',
          headingId: 'Memori Visual & Logika Grid',
          tips: [
            {
              titleEn: 'Chunking Strategy in Memo Phase',
              titleId: 'Strategi Chunking pada Fase Hafalan',
              textEn: 'Do not try to memorize 36 or 81 numbers individually! Memorize diagonal sub-blocks (top-left, middle, bottom-right) or symmetrical triplets.',
              textId: 'Jangan mencoba menghafal 36 atau 81 angka satu per satu! Hafalkan sub-blok diagonal (kiri-atas, tengah, kanan-bawah) atau pola angka kembar simetris.'
            },
            {
              titleEn: 'Cross-Elimination (Naked Singles)',
              titleId: 'Eliminasi Silang (Naked Singles)',
              textEn: 'If your memory fades on a cell, do not panic! Check the Row, Column, and Sub-box intersecting that cell. The missing digit is often the only possible candidate remaining.',
              textId: 'Jika Anda lupa angka pada suatu sel, jangan panik! Periksa Baris, Kolom, dan Sub-blok yang memotong sel tersebut. Angka yang hilang seringkali merupakan satu-satunya kandidat tersisa.'
            },
            {
              titleEn: 'Smart Quick-Peek Economy',
              titleId: 'Penghematan Fitur Intip Kilat (2s)',
              textEn: 'Each peek incurs a 4-second time penalty and has limited charges. Use it only when you have 1 or 2 high-confidence cells to verify an entire quadrant.',
              textId: 'Setiap intip menambah penalti 4 detik dan jumlahnya terbatas. Gunakan hanya saat Anda perlu memverifikasi sel kunci untuk membuka sisa angka di kuadran tersebut.'
            }
          ]
        },
        {
          tier: 'sma',
          headingEn: '6×6 & 9×9 Block Coordinates',
          headingId: 'Koordinat Blok 6×6 dan 9×9',
          tips: [
            {
              titleEn: '6×6 Uses 2×3 Blocks (Numbers 1–6)',
              titleId: 'Grid 6×6 Menggunakan Blok 2×3 (Angka 1–6)',
              textEn: 'Remember that blocks are 2 rows tall and 3 columns wide. Each block must contain digits 1 through 6 without repetition.',
              textId: 'Ingat bahwa sub-blok berukuran tinggi 2 baris dan lebar 3 kolom. Setiap sub-blok wajib berisi angka 1 sampai 6 tanpa duplikat.'
            },
            {
              titleEn: '9×9 Uses 3×3 Blocks (Numbers 1–9)',
              titleId: 'Grid 9×9 Menggunakan Blok 3×3 (Angka 1–9)',
              textEn: 'In 9×9 Master mode, use the on-screen keypad or physical keyboard arrow keys for rapid entry without zooming viewport.',
              textId: 'Pada mode 9×9 Master, gunakan keypad virtual atau tombol panah keyboard fisik untuk input super cepat tanpa menggeser layar HP.'
            }
          ]
        }
      ]
    },
    'mnm': {
      titleEn: 'Match & Mix',
      titleId: 'Match & Mix',
      sections: [
        {
          tier: 'all',
          headingEn: 'Tactical Memory & Tile Maneuvering',
          headingId: 'Memori Taktis & Manuver Ubin',
          tips: [
            {
              titleEn: 'Spatial Geometric Mapping',
              titleId: 'Pemetaan Pola Spasial',
              textEn: 'During the reveal phase, visualize geometric lines between matching pairs: e.g. "Pair 7 forms a diagonal", "Pair 12 is in opposite corners". Shapes stick in memory much better than numbers.',
              textId: 'Pada fase hafalan, visualisasikan garis hubung antar pasangan: contohnya "Pasangan 7 membentuk garis miring", "Pasangan 12 ada di pojok berlawanan". Pola bentuk jauh lebih mudah diingat.'
            },
            {
              titleEn: 'The Mix Slide Disruptor',
              titleId: 'Taktik Geser Pengacau (Mix Phase)',
              textEn: 'When you miss a match, you MUST slide an adjacent tile. Slide a tile containing a number your opponent was eyeing to completely distort their spatial orientation!',
              textId: 'Saat tebakan meleset, Anda WAJIB menggeser ubin terdekat. Geser ubin yang menyimpan angka incaran lawan untuk merusak orientasi memori spasial mereka!'
            },
            {
              titleEn: 'No Immediate Reverse Rule',
              titleId: 'Aturan Anti-Pembalik Langsung',
              textEn: 'You cannot immediately slide the exact tile back to where it just came from on consecutive moves. Always calculate your secondary slide option.',
              textId: 'Anda tidak dapat langsung menggeser ubin yang baru saja digerakkan kembali ke posisi semula. Selalu siapkan rute ubin alternatif.'
            }
          ]
        }
      ]
    },
    'cube': {
      titleEn: 'Cube Count',
      titleId: 'Hitung Kubus',
      sections: [
        {
          tier: 'all',
          headingEn: 'Isometric 3D Spatial Calculation',
          headingId: 'Perhitungan Spasial Isometrik 3D',
          tips: [
            {
              titleEn: 'Horizontal Layer Slicing Method',
              titleId: 'Metode Irisan Lapisan Horisontal',
              textEn: 'Never count pillar-by-pillar; hidden gaps will deceive your eyes. Count total cubes on Floor 1 (Base), Floor 2, Floor 3, etc., then sum the totals.',
              textId: 'Jangan menghitung tiang demi tiang; ruang kosong tersembunyi akan menipu pandangan Anda. Hitung total kubus di Lantai 1 (Dasar), Lantai 2, Lantai 3, dst., lalu jumlahkan.',
              formula: 'Total = ∑(Cubes on Layer k)'
            },
            {
              titleEn: 'Deducing Occluded Towers (SMA & Univ)',
              titleId: 'Mendeteksi Menara Tertutup (SMA & Universitas)',
              textEn: 'If tower (X, Y) has height 4 and is directly in front of tower (X, Y-1) which has height 2, the rear tower is 100% invisible from the front perspective, but its 2 cubes MUST still be tallied!',
              textId: 'Jika menara di depan bertinggi 4 dan menara di belakangnya bertinggi 2, menara belakang tidak terlihat dari depan, namun 2 kubusnya TETAP WAJIB dihitung ke total!'
            }
          ]
        }
      ]
    },
    'minesweeper': {
      titleEn: 'Minesweeper',
      titleId: 'Minesweeper',
      sections: [
        {
          tier: 'all',
          headingEn: 'Safe deduction before guessing',
          headingId: 'Utamakan deduksi sebelum menebak',
          tips: [
            {
              titleEn: 'Read number groups, not single cells',
              titleId: 'Baca kelompok angka, bukan satu petak',
              textEn: 'A number tells you exactly how many mines touch its eight neighboring cells. Compare overlapping groups of neighboring cells to identify forced safe cells and forced mines.',
              textId: 'Setiap angka menunjukkan tepat berapa ranjau yang menyentuh delapan petak di sekelilingnya. Bandingkan kelompok petak yang saling bertumpuk untuk menemukan petak yang pasti aman dan ranjau yang pasti.'
            },
            {
              titleEn: 'Use flags as working memory',
              titleId: 'Gunakan bendera sebagai memori kerja',
              textEn: 'Flag cells only when the clue is certain. Once a revealed number already has the required adjacent flags, opening the other neighboring cells becomes safe.',
              textId: 'Pasang bendera hanya saat petunjuknya pasti. Jika sebuah angka sudah memiliki jumlah bendera yang sesuai, petak tetangga lainnya dapat dibuka dengan aman.'
            },
            {
              titleEn: 'Open blank regions early',
              titleId: 'Buka area kosong lebih awal',
              textEn: 'Blank cells reveal connected empty regions automatically. Large openings create more number clues and reduce the amount of guessing later.',
              textId: 'Petak kosong membuka area kosong yang saling terhubung secara otomatis. Bukaan besar memberi lebih banyak petunjuk angka dan mengurangi kebutuhan menebak.'
            }
          ]
        },
        {
          tier: 'univ',
          headingEn: 'Expert-board discipline',
          headingId: 'Disiplin papan ahli',
          tips: [
            {
              titleEn: 'Work one frontier at a time',
              titleId: 'Selesaikan satu garis batas per giliran',
              textEn: 'On the 30×16 board, avoid jumping between distant clue clusters. Finish one active frontier before scrolling to the next so your flag assumptions stay consistent.',
              textId: 'Pada papan 30×16, hindari berpindah-pindah antar kelompok petunjuk yang jauh. Selesaikan satu garis batas aktif sebelum menggulir ke area berikutnya agar asumsi bendera tetap konsisten.'
            }
          ]
        }
      ]
    },
    'maze': {
      titleEn: 'Maze Escape',
      titleId: 'Maze Escape',
      sections: [
        {
          tier: 'all',
          headingEn: 'Navigate without repeating dead ends',
          headingId: 'Navigasi tanpa mengulang jalan buntu',
          tips: [
            {
              titleEn: 'Remember the last junction',
              titleId: 'Ingat percabangan terakhir',
              textEn: 'When a branch ends in a dead end, mentally mark the last junction and return there. This prevents you from exploring the same failed branch twice.',
              textId: 'Saat sebuah cabang berakhir buntu, tandai dalam ingatan percabangan terakhir dan kembali ke sana. Cara ini mencegah kamu menjelajahi cabang gagal yang sama dua kali.'
            },
            {
              titleEn: 'Use wall-following only as a fallback',
              titleId: 'Gunakan teknik mengikuti dinding sebagai cadangan',
              textEn: 'Following one wall can eventually solve many perfect mazes, but it is rarely the fastest route. Use it when you lose orientation, then switch back to direct route planning.',
              textId: 'Mengikuti satu sisi dinding dapat menyelesaikan banyak perfect maze, tetapi jarang menjadi rute tercepat. Gunakan saat kehilangan orientasi, lalu kembali ke perencanaan jalur langsung.'
            }
          ]
        },
        {
          tier: 'univ',
          headingEn: 'University: large-maze discipline',
          headingId: 'Universitas: disiplin labirin besar',
          tips: [
            {
              titleEn: 'Chunk the maze into zones',
              titleId: 'Bagi labirin menjadi beberapa zona',
              textEn: 'Hard, Very Hard, and Impossible boards are easier to track if you remember progress by regions rather than by individual cells.',
              textId: 'Papan Hard, Very Hard, dan Impossible lebih mudah diikuti jika kamu mengingat progres per wilayah, bukan per petak satu per satu.'
            }
          ]
        }
      ]
    },
    'matrix': {
      titleEn: 'Memory Matrix',
      titleId: 'Memory Matrix',
      sections: [
        {
          tier: 'all',
          headingEn: 'Turn cells into memorable shapes',
          headingId: 'Ubah petak menjadi bentuk yang mudah diingat',
          tips: [
            {
              titleEn: 'Chunk the pattern',
              titleId: 'Kelompokkan pola',
              textEn: 'Do not memorize isolated cells one by one. Group nearby highlights into lines, corners, L-shapes, blocks, or diagonals.',
              textId: 'Jangan menghafal petak satu per satu. Kelompokkan sorotan yang berdekatan menjadi garis, sudut, bentuk L, blok, atau diagonal.'
            },
            {
              titleEn: 'Scan in a fixed order',
              titleId: 'Pindai dengan urutan tetap',
              textEn: 'Use the same scan order every round, such as top-left to bottom-right. A stable routine reduces missed cells when the preview gets shorter.',
              textId: 'Gunakan urutan pindai yang sama setiap ronde, misalnya kiri atas ke kanan bawah. Rutinitas tetap mengurangi petak yang terlewat saat waktu tampil semakin singkat.'
            }
          ]
        },
        {
          tier: 'univ',
          headingEn: 'University: high-density recall',
          headingId: 'Universitas: mengingat pola padat',
          tips: [
            {
              titleEn: 'Anchor the extremes first',
              titleId: 'Jadikan sisi terluar sebagai jangkar',
              textEn: 'On 6×6 to 8×8 matrices, remember corner and edge cells first, then fill the interior clusters. Impossible mode rewards spatial chunking more than raw repetition.',
              textId: 'Pada matriks 6×6 hingga 8×8, ingat petak sudut dan tepi terlebih dahulu, lalu isi kelompok bagian dalam. Mode Impossible lebih mengandalkan pengelompokan spasial daripada pengulangan mentah.'
            }
          ]
        }
      ]
    },
    'nonogram': {
      titleEn: 'Nonogram',
      titleId: 'Nonogram',
      sections: [
        { tier:'all', headingEn:'Core deduction patterns', headingId:'Pola deduksi inti', tips:[
          { titleEn:'Minimum-space rule', titleId:'Aturan ruang minimum', textEn:'Add all clue groups plus one mandatory gap between groups. The smaller the leftover space, the more overlap you can prove.', textId:'Jumlahkan semua kelompok clue lalu tambahkan satu jarak wajib di antara kelompok. Semakin kecil sisa ruang, semakin besar overlap yang bisa dipastikan.', formula:'minimum = sum(clues) + groups - 1' },
          { titleEn:'Complete-group border', titleId:'Batas kelompok selesai', textEn:'Once a run exactly matches a clue, mark the cells immediately before and after it with X. That turns one solved group into new information for crossing lines.', textId:'Saat sebuah kelompok tepat sama dengan clue, tandai petak tepat sebelum dan sesudahnya dengan X. Kelompok selesai langsung menjadi informasi baru untuk garis silang.' },
          { titleEn:'Overlap from both extremes', titleId:'Overlap dari dua ujung', textEn:'Place a large run as far left and as far right as possible. Any cells covered in both placements must be filled.', textId:'Bayangkan kelompok besar ditempatkan sejauh mungkin ke kiri lalu ke kanan. Petak yang tertutup pada kedua posisi pasti terisi.' }
        ]},
        { tier:'univ', headingEn:'University board discipline', headingId:'Disiplin papan Universitas', tips:[
          { titleEn:'Work the frontier, not the whole board', titleId:'Kerjakan frontier, bukan seluruh papan', textEn:'On 15×15 and 20×20 boards, focus on a few lines that intersect known cells. Finish that local frontier before scanning the whole puzzle again.', textId:'Pada papan 15×15 dan 20×20, fokus pada beberapa garis yang berpotongan dengan petak pasti. Selesaikan frontier lokal itu sebelum memindai seluruh papan lagi.' }
        ]}
      ]
    },
    'game2048': {
      titleEn: '2048',
      titleId: '2048',
      sections: [
        { tier:'all', headingEn:'Corner control', headingId:'Kontrol sudut', tips:[
          { titleEn:'Pick one anchor corner', titleId:'Pilih satu sudut jangkar', textEn:'Keep the largest tile in one corner and build the next-largest tiles beside it in descending order.', textId:'Pertahankan ubin terbesar di satu sudut dan susun ubin berikutnya secara menurun di sebelahnya.' },
          { titleEn:'Three-direction discipline', titleId:'Disiplin tiga arah', textEn:'Try to play with three directions and avoid the direction that pulls your anchor row or column apart unless recovery is guaranteed.', textId:'Usahakan bermain dengan tiga arah dan hindari arah yang membongkar baris atau kolom jangkar kecuali jalur pemulihannya jelas.' },
          { titleEn:'Merge from the small end', titleId:'Gabung dari ujung kecil', textEn:'Create space by combining low tiles on the far side, then feed those values toward the large chain.', textId:'Buat ruang dengan menggabungkan ubin kecil di sisi jauh, lalu dorong nilainya menuju rantai besar.' }
        ]},
        { tier:'univ', headingEn:'University targets', headingId:'Target Universitas', tips:[
          { titleEn:'Preserve monotonic order', titleId:'Pertahankan urutan monoton', textEn:'For 2048 and 4096 targets, keep each row or snake segment roughly descending. Random high-value pockets are difficult to merge later.', textId:'Untuk target 2048 dan 4096, jaga tiap baris atau segmen ular tetap menurun. Kantong nilai besar yang acak akan sulit digabung di tahap akhir.' }
        ]}
      ]
    },
    'rps': {
      titleEn: 'Dice Duel 3D',
      titleId: 'Duel Dadu 3D',
      sections: [
        {
          tier: 'all',
          headingEn: 'Remember the net and continue the route',
          headingId: 'Ingat jaring-jaring dan lanjutkan jalurnya',
          tips: [
            {
              titleEn: 'The center is the top',
              titleId: 'Kotak tengah adalah sisi atas',
              textEn: 'When the net folds, the central square becomes TOP. The far end becomes BOTTOM. The icon rotates together with its physical face; do not assume it always points upwards.',
              textId: 'Saat jaring-jaring dilipat, kotak tengah menjadi ATAS dan kotak paling ujung menjadi BAWAH. Ikon ikut berputar bersama sisi fisiknya; jangan menganggap arah ikon selalu tegak.'
            },
            {
              titleEn: 'One shared die, two players',
              titleId: 'Satu dadu, dua pemain',
              textEn: 'After confirming a battle, the next player continues from the same position and orientation. Only the final bottom face duels the tile. Win +1, draw 0, lose -1; scores can be negative.',
              textId: 'Setelah hasil dikonfirmasi, pemain berikutnya melanjutkan posisi dan orientasi dadu yang sama. Hanya sisi bawah di petak terakhir yang berduel. Menang +1, seri 0, kalah -1; skor bisa negatif.'
            }
          ]
        },
        {
          tier: 'all',
          headingEn: '3D Cube Spatial Roll Vectors',
          headingId: 'Vektor Guling Kubus 3D',
          tips: [
            {
              titleEn: 'The Invariable Face Axes',
              titleId: 'Sumbu Sisi yang Tidak Berubah',
              textEn: 'Rolling UP or DOWN never changes the LEFT and RIGHT faces. Rolling LEFT or RIGHT never changes the FRONT and BACK faces.',
              textId: 'Guling ATAS atau BAWAH tidak pernah mengubah sisi KIRI dan KANAN. Guling KIRI atau KANAN tidak pernah mengubah sisi DEPAN dan BELAKANG.',
              formula: 'Roll(Y-axis) leaves X-faces invariant'
            },
            {
              titleEn: 'Opposite Faces Cycle',
              titleId: 'Siklus Pasangan Sisi Berlawanan',
              textEn: 'Every 2 identical rolls (e.g. Roll UP twice), the Top face swaps with the Bottom face. After 4 rolls in the same direction, the die returns to its original orientation.',
              textId: 'Tiap 2 gulingan yang sama (contoh: Guling Atas 2 kali), sisi Atas bertukar dengan sisi Bawah. Setelah 4 gulingan ke arah yang sama, dadu kembali ke posisi awal.'
            }
          ]
        }
      ]
    }
  };

  const activeData = TIPS_DATABASE[selectedGame] || TIPS_DATABASE['300'];

  // Filter sections by selected difficulty tier and search query
  const filteredSections = useMemo(() => {
    return activeData.sections
      .map(sec => {
        if (levelFilter !== 'all' && sec.tier !== 'all' && sec.tier !== levelFilter) {
          return null;
        }

        const matchingTips = sec.tips.filter(tip => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          const tEn = (tip.titleEn + ' ' + tip.textEn + ' ' + (tip.formula || '')).toLowerCase();
          const tId = (tip.titleId + ' ' + tip.textId + ' ' + (tip.formula || '')).toLowerCase();
          return tEn.includes(q) || tId.includes(q);
        });

        if (matchingTips.length === 0) return null;

        return {
          ...sec,
          tips: matchingTips
        };
      })
      .filter(Boolean);
  }, [activeData, levelFilter, searchQuery]);

  const game = gameById(selectedGame) || GAMES[0];
  const detail = GUIDE_DETAILS[selectedGame] || GUIDE_DETAILS['300'];
  const text = (value) => pickGuideText(value, lang);
  const copy = (id, en) => lang === 'en' ? en : id;
  const tabs = [
    { id: 'overview', icon: 'book', label: copy('Ringkasan', 'Overview') },
    { id: 'tutorial', icon: 'play', label: copy('Tutorial langkah', 'Step tutorial') },
    { id: 'solve', icon: 'brain', label: copy('Cara memecahkan', 'How to solve') },
    { id: 'strategy', icon: 'trophy', label: copy('Strategi & trik', 'Strategy & tips') },
  ];
  const doneCount = detail.tutorial.reduce((count, _, index) => count + (completedSteps[`${selectedGame}-${index}`] ? 1 : 0), 0);
  const toggleStep = (index) => setCompletedSteps((prev) => ({ ...prev, [`${selectedGame}-${index}`]: !prev[`${selectedGame}-${index}`] }));

  return (
    <section className={`manual-page color-${game.color}`}>
      <div className="manual-page-actions">
        <button className="manual-back" onClick={() => onNavigate?.('guides')}><Icon name="chevron" size={14}/>{copy('Semua panduan', 'All guides')}</button>
        <span>{copy('PUSAT BELAJAR BRAIN ARENA', 'BRAIN ARENA LEARNING HUB')}</span>
        <button className="ba-button primary manual-play" onClick={() => onNavigate ? onNavigate(selectedGame) : onBack?.()}><Icon name="play" size={15}/>{copy('Mainkan sekarang', 'Play now')}</button>
      </div>

      <header className="manual-hero">
        <div className="manual-hero-icon"><Icon name={game.icon} size={38}/></div>
        <div className="manual-hero-copy">
          <div className="manual-eyebrow"><span>{copy('PANDUAN LENGKAP', 'COMPLETE GUIDE')}</span><i/>{CATEGORIES[game.category][lang]}</div>
          <h1>{game.title[lang]}</h1>
          <p>{text(detail.objective)}</p>
          <div className="manual-facts-inline">{detail.facts.map((entry, index) => <span key={index}><small>{text(entry.label)}</small><strong>{text(entry.value)}</strong></span>)}</div>
        </div>
        <div className="manual-hero-note"><Icon name="trophy" size={21}/><span><small>{copy('CARA MENANG', 'HOW TO WIN')}</small>{text(detail.victory)}</span></div>
      </header>

      <div className="manual-game-picker" aria-label={copy('Pilih panduan permainan', 'Choose a game guide')}>
        {GAME_LIST.map((entry) => <button key={entry.id} className={selectedGame === entry.id ? 'active' : ''} onClick={() => { setSelectedGame(entry.id); setSearchQuery(''); setLevelFilter('all'); setActiveTab('overview'); }} aria-pressed={selectedGame === entry.id}>
          <span className={`mini-game-icon color-${entry.color}`}><Icon name={entry.icon} size={16}/></span><span>{entry.title[lang]}</span>
        </button>)}
      </div>

      <nav className="manual-tabs" aria-label={copy('Bagian panduan', 'Guide sections')}>
        {tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined}><Icon name={tab.icon} size={16}/><span>{tab.label}</span>{tab.id === 'tutorial' && <small>{doneCount}/{detail.tutorial.length}</small>}</button>)}
      </nav>

      {activeTab === 'overview' && <div className="manual-section manual-overview">
        <div className="manual-section-heading"><span>01</span><div><p className="eyebrow">{copy('MULAI DI SINI', 'START HERE')}</p><h2>{copy('Pahami permainan dalam 2 menit', 'Understand the game in 2 minutes')}</h2><p>{copy('Tujuan, kontrol, tingkat kesulitan, dan hal penting sebelum menekan tombol mulai.', 'Goal, controls, difficulty levels, and the essentials before you press start.')}</p></div></div>
        <div className="manual-overview-grid">
          <article className="manual-card manual-controls"><div className="manual-card-title"><Icon name="gamepad" size={19}/><div><small>{copy('KONTROL', 'CONTROLS')}</small><h3>{copy('Cara berinteraksi', 'How to interact')}</h3></div></div><ol>{detail.controls.map((control, index) => <li key={index}><span>{index + 1}</span><p>{text(control)}</p></li>)}</ol></article>
          <article className="manual-card manual-level-card"><div className="manual-card-title"><Icon name="layers" size={19}/><div><small>{copy('TINGKAT KESULITAN', 'DIFFICULTY')}</small><h3>{copy('Apa yang berubah?', 'What changes?')}</h3></div></div><div className="manual-level-list">{detail.levels.map((entry, index) => <div key={`${entry.name}-${index}`}><strong>{entry.name}</strong><p>{text(entry.detail)}</p></div>)}</div></article>
        </div>
        <article className="manual-callout"><span className="manual-callout-icon"><Icon name="brain" size={22}/></span><div><small>{copy('PRINSIP UTAMA', 'CORE PRINCIPLE')}</small><strong>{text(detail.solve.title)}</strong><p>{text(detail.solve.intro)}</p></div><button onClick={() => setActiveTab('solve')}>{copy('Pelajari metode', 'Learn the method')}<Icon name="arrow" size={15}/></button></article>
      </div>}

      {activeTab === 'tutorial' && <div className="manual-section">
        <div className="manual-section-heading"><span>02</span><div><p className="eyebrow">{copy('TUTORIAL LENGKAP', 'COMPLETE TUTORIAL')}</p><h2>{copy('Ikuti dari langkah pertama sampai siap bermain', 'Follow it from the first step until you are ready to play')}</h2><p>{copy('Centang langkah yang sudah dipahami. Status checklist hanya berlaku selama halaman ini terbuka.', 'Check off steps you understand. Checklist state lasts only while this page is open.')}</p></div><div className="manual-progress"><strong>{Math.round((doneCount / detail.tutorial.length) * 100)}%</strong><span><i style={{ width: `${(doneCount / detail.tutorial.length) * 100}%` }}/></span></div></div>
        <div className="manual-tutorial-list">{detail.tutorial.map((step, index) => {
          const checked = Boolean(completedSteps[`${selectedGame}-${index}`]);
          return <article className={`manual-tutorial-step ${checked ? 'done' : ''}`} key={index}><button className="manual-step-check" onClick={() => toggleStep(index)} aria-pressed={checked} aria-label={`${copy('Tandai langkah', 'Mark step')} ${index + 1}`}><span>{checked ? <Icon name="check" size={16}/> : String(index + 1).padStart(2, '0')}</span></button><div><small>{copy('LANGKAH', 'STEP')} {String(index + 1).padStart(2, '0')}</small><h3>{text(step.title)}</h3><p>{text(step.text)}</p>{step.note && <div className="manual-step-note"><Icon name="help" size={14}/>{text(step.note)}</div>}</div></article>;
        })}</div>
        <div className="manual-next"><div><strong>{doneCount === detail.tutorial.length ? copy('Tutorial selesai.', 'Tutorial complete.') : copy('Sudah paham alurnya?', 'Understand the flow?')}</strong><p>{copy('Lanjut ke cara memecahkan untuk mempelajari pola keputusan yang bisa dipakai saat benar-benar terjebak.', 'Continue to How to Solve for a decision process you can use when you are actually stuck.')}</p></div><button className="ba-button primary" onClick={() => setActiveTab('solve')}>{copy('Cara memecahkan', 'How to solve')}<Icon name="arrow" size={15}/></button></div>
      </div>}

      {activeTab === 'solve' && <div className="manual-section">
        <div className="manual-section-heading"><span>03</span><div><p className="eyebrow">{copy('CARA MEMECAHKAN', 'HOW TO SOLVE')}</p><h2>{text(detail.solve.title)}</h2><p>{text(detail.solve.intro)}</p></div></div>
        <div className="manual-solve-flow">{detail.solve.steps.map((step, index) => <React.Fragment key={index}><article><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{text(step.title)}</h3><p>{text(step.text)}</p></div></article>{index < detail.solve.steps.length - 1 && <Icon className="manual-flow-arrow" name="arrow" size={18}/>}</React.Fragment>)}</div>
        <article className="manual-example"><div className="manual-example-label"><Icon name="bolt" size={18}/><span>{copy('CONTOH PEMECAHAN', 'WORKED EXAMPLE')}</span></div><p>{text(detail.solve.example)}</p></article>
        <div className="manual-mistakes"><div><p className="eyebrow">{copy('HINDARI INI', 'AVOID THESE')}</p><h3>{copy('Kesalahan yang paling sering membuang waktu', 'Common mistakes that waste time')}</h3></div><div>{detail.mistakes.map((mistake, index) => <article key={index}><span>!</span><p>{text(mistake)}</p></article>)}</div></div>
      </div>}

      {activeTab === 'strategy' && <div className="manual-section">
        <div className="manual-section-heading"><span>04</span><div><p className="eyebrow">{copy('STRATEGI LANJUTAN', 'ADVANCED STRATEGY')}</p><h2>{copy('Trik, pola, dan rumus yang bisa langsung dipakai', 'Practical tricks, patterns, and formulas')}</h2><p>{copy('Gunakan filter tingkat dan pencarian untuk menemukan teknik yang kamu butuhkan.', 'Use the level filter and search to find the technique you need.')}</p></div></div>
        <div className="manual-filterbar">
          <div className="manual-tier-filter"><span>{copy('TINGKAT', 'LEVEL')}</span>{[{id:'all',label:copy('Semua','All')},{id:'sd',label:'SD'},{id:'smp',label:'SMP'},{id:'sma',label:'SMA'},{id:'univ',label:copy('Universitas','University')}].map((tier) => <button key={tier.id} className={levelFilter === tier.id ? 'active' : ''} onClick={() => setLevelFilter(tier.id)}>{tier.label}</button>)}</div>
          <label className="manual-search"><Icon name="search" size={15}/><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={copy('Cari pola, rumus, strategi...', 'Search patterns, formulas, strategies...')}/></label>
        </div>
        {filteredSections.length === 0 ? <div className="manual-empty"><Icon name="search" size={28}/><strong>{copy('Tidak ada strategi yang cocok.', 'No matching strategy found.')}</strong><p>{copy('Coba hapus kata pencarian atau pilih tingkat lain.', 'Clear the search or choose another level.')}</p></div> : <div className="manual-strategy-sections">{filteredSections.map((sec, sectionIndex) => <section key={sectionIndex}><header><div><span>{sec.tier === 'all' ? copy('SEMUA TINGKAT', 'ALL LEVELS') : sec.tier.toUpperCase()}</span><h3>{lang === 'en' ? sec.headingEn : sec.headingId}</h3></div><strong>{sec.tips.length} {copy('teknik', 'tips')}</strong></header><div className="manual-strategy-grid">{sec.tips.map((tip, tipIndex) => <article key={tipIndex}><span className="manual-strategy-number">{String(tipIndex + 1).padStart(2, '0')}</span><div><h4>{lang === 'en' ? tip.titleEn : tip.titleId}</h4><p>{lang === 'en' ? tip.textEn : tip.textId}</p>{tip.formula && <code>{tip.formula}</code>}</div></article>)}</div></section>)}</div>}
      </div>}

      <footer className="manual-footer-cta"><div><span className={`mini-game-icon color-${game.color}`}><Icon name={game.icon} size={20}/></span><div><small>{copy('SIAP MENCOBA?', 'READY TO TRY?')}</small><strong>{game.title[lang]}</strong></div></div><p>{copy('Mulai dari tingkat yang nyaman, lalu naikkan kesulitan setelah strateginya terasa otomatis.', 'Start at a comfortable level, then raise the difficulty once the strategy feels automatic.')}</p><button className="ba-button primary" onClick={() => onNavigate ? onNavigate(selectedGame) : onBack?.()}>{copy('Mainkan game', 'Play game')}<Icon name="arrow" size={15}/></button></footer>
    </section>
  );
}
