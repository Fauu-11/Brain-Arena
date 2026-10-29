export const EXTRA_CONTENT={
  "codebreaker": {
    "title": {
      "id": "Pecahkan Sandi",
      "en": "Code Breaker"
    },
    "summary": {
      "id": "Tebak sandi angka melalui petunjuk posisi dan jumlah digit benar.",
      "en": "Crack a numeric code using exact-position and misplaced-digit feedback."
    },
    "rules": {
      "id": [
        "Ketik kode lengkap, termasuk nol di awal jika diperlukan.",
        "Tepat posisi menghitung digit yang benar pada posisi benar.",
        "Salah posisi menghitung digit benar yang posisinya berbeda; setiap digit hanya dihitung sekali.",
        "Gunakan semua hasil tebakan untuk mempersempit kemungkinan sebelum kesempatan habis."
      ],
      "en": [
        "Enter a full code, retaining leading zeros when needed.",
        "Exact counts correct digits in the correct positions.",
        "Misplaced counts correct digits in other positions; each digit is counted once.",
        "Use all previous results to narrow possibilities before attempts run out."
      ]
    },
    "tips": [
      {
        "id": "Uji digit berbeda dahulu untuk mengetahui anggota sandi.",
        "en": "Test different digits first to discover which digits occur."
      },
      {
        "id": "Ubah sedikit posisi setiap percobaan agar petunjuk bisa dibandingkan.",
        "en": "Change a few positions at a time so feedback is comparable."
      },
      {
        "id": "Perhatikan digit berulang; jumlah kemunculannya memengaruhi petunjuk.",
        "en": "Repeated digits matter: their frequency affects feedback."
      }
    ],
    "example": {
      "id": "Sandi 1123, tebakan 1214: satu tepat posisi dan dua salah posisi.",
      "en": "Code 1123, guess 1214: one exact and two misplaced."
    }
  },
  "lightsout": {
    "title": {
      "id": "Padamkan Lampu",
      "en": "Lights Out"
    },
    "summary": {
      "id": "Balik keadaan lampu dan tetangganya hingga seluruh papan padam.",
      "en": "Toggle lights and their neighbors until the entire board is dark."
    },
    "rules": {
      "id": [
        "Ketuk satu petak untuk membaliknya bersama tetangga atas, bawah, kiri, kanan.",
        "Lampu menyala maupun padam sama-sama boleh ditekan.",
        "Menekan petak yang sama dua kali membatalkan dampaknya.",
        "Urutan penekanan tidak mengubah hasil akhir jika petak yang ditekan sama."
      ],
      "en": [
        "Tap a cell to toggle it and its up, down, left and right neighbors.",
        "Both lit and unlit cells may be pressed.",
        "Pressing the same cell twice cancels its effect.",
        "Press order does not change the final result for the same set of cells."
      ]
    },
    "tips": [
      {
        "id": "Periksa dampak pada baris atas sebelum pindah ke baris berikutnya.",
        "en": "Inspect the top-row effect before moving to the next row."
      },
      {
        "id": "Catat langkah secara mental; hindari menekan petak yang sama tanpa tujuan.",
        "en": "Track presses mentally; avoid aimless repeated presses."
      },
      {
        "id": "Tombol yang terkunci pada variasi Universitas akan terbuka pada siklus berikutnya.",
        "en": "Locked Universitas buttons become available in the next cycle."
      }
    ],
    "example": {
      "id": "Pada papan 3×3, menekan tengah membalik lima lampu; menekan sudut membalik tiga.",
      "en": "On a 3×3 board, the center toggles five lights; a corner toggles three."
    }
  },
  "sequence": {
    "title": {
      "id": "Jejak Ingatan",
      "en": "Sequence Recall"
    },
    "summary": {
      "id": "Amati urutan tombol yang menyala lalu ulangi, satu langkah lebih panjang setiap ronde.",
      "en": "Watch a sequence of highlighted buttons and recall a growing sequence each round."
    },
    "rules": {
      "id": [
        "Selama preview, amati angka yang diberi sorotan dan label INGAT.",
        "Setelah preview selesai, ketuk angka sesuai urutan yang diminta.",
        "Kesalahan mengurangi satu nyawa dan mengulang preview ronde yang sama.",
        "Selesaikan seluruh ronde sebelum tiga nyawa habis. Keyboard 0 mewakili angka 10."
      ],
      "en": [
        "During preview, watch the highlighted number marked REMEMBER.",
        "After preview ends, tap numbers in the required order.",
        "An error costs a life and replays the same round preview.",
        "Clear all rounds before losing three lives. Keyboard 0 represents 10."
      ]
    },
    "tips": [
      {
        "id": "Kelompokkan urutan menjadi bagian dua atau tiga angka.",
        "en": "Chunk the sequence into groups of two or three numbers."
      },
      {
        "id": "Perhatikan aturan aktif: urutan balik atau tambah satu mengubah jawaban.",
        "en": "Read the active rule: reverse or plus-one changes the required answer."
      },
      {
        "id": "Pada mode tombol diacak, hafalkan angka, bukan hanya posisinya.",
        "en": "With shuffled buttons, remember the numbers rather than just their positions."
      }
    ],
    "example": {
      "id": "Urutan 2, 4, 1 pada mode balik dijawab 1, 4, 2. Pada mode +1 dengan 4 tombol, jawab 3, 1, 2.",
      "en": "Sequence 2, 4, 1 is answered 1, 4, 2 in reverse mode; with +1 and four symbols, answer 3, 1, 2."
    }
  },
  "kakuro": {
    "title": {
      "id": "Silang Angka",
      "en": "Kakuro"
    },
    "summary": {
      "id": "Isi kelompok angka 1–9 agar jumlah mendatar dan menurun sesuai petunjuk.",
      "en": "Fill crossing groups with digits 1–9 to match their clue sums."
    },
    "rules": {
      "id": [
        "Panah menunjukkan arah kelompok yang harus memenuhi jumlahnya.",
        "Isi angka 1–9; nol digunakan hanya untuk menghapus isian.",
        "Angka tidak boleh berulang dalam satu kelompok mendatar atau menurun.",
        "Angka awal terkunci. Gunakan persilangan kelompok untuk menemukan jawaban unik."
      ],
      "en": [
        "An arrow points toward the group that must match its sum.",
        "Enter 1–9; zero is only used for erasing.",
        "Digits cannot repeat within a horizontal or vertical group.",
        "Initial digits are locked. Use crossing groups to find the unique solution."
      ]
    },
    "tips": [
      {
        "id": "Jumlah 3 untuk dua petak hanya bisa memakai 1 dan 2.",
        "en": "Two cells summing to 3 must contain 1 and 2."
      },
      {
        "id": "Silangkan kandidat mendatar dan menurun sebelum mengisi angka.",
        "en": "Intersect horizontal and vertical candidates before entering a digit."
      },
      {
        "id": "Saat papan berputar, ikuti arah panah yang baru; jumlah dan isian tetap konsisten.",
        "en": "After rotation, follow the new arrow directions; sums and entries remain consistent."
      }
    ],
    "example": {
      "id": "Dua petak berjumlah 4 memakai {1,3}. Jika kelompok silang melarang 3 di petak pertama, petak itu harus 1.",
      "en": "Two cells summing to 4 use {1,3}. If a crossing group excludes 3 in the first cell, it must be 1."
    }
  },
  "slitherlink": {
    "title": {
      "id": "Lingkar Logika",
      "en": "Slitherlink"
    },
    "summary": {
      "id": "Hubungkan titik menjadi satu lingkaran sesuai jumlah sisi pada setiap petunjuk.",
      "en": "Join dots into one loop matching each numbered cell’s edge count."
    },
    "rules": {
      "id": [
        "Ketuk sisi antara dua titik untuk menggambar garis; mode X menandai sisi kosong.",
        "Angka 0–3 menunjukkan banyak sisi bergaris di sekitar petaknya.",
        "Garis harus membentuk satu lingkaran, tanpa cabang atau persilangan.",
        "Garis tebal dan X abu-abu adalah petunjuk awal yang terkunci. Petak tanpa angka tidak membatasi jumlah sisi."
      ],
      "en": [
        "Tap an edge between dots to draw a line; X mode marks an unused edge.",
        "Numbers 0–3 count the drawn edges surrounding each cell.",
        "Lines must form one loop without branches or crossings.",
        "Thick lines and gray X marks are locked initial clues. Blank cells impose no edge-count constraint."
      ]
    },
    "tips": [
      {
        "id": "Mulai dari angka 0: seluruh sisi di sekitarnya kosong.",
        "en": "Start with 0: every surrounding edge is unused."
      },
      {
        "id": "Setiap titik yang dilewati lingkaran memiliki tepat dua garis.",
        "en": "Every vertex used by the loop has exactly two lines."
      },
      {
        "id": "Jangan menutup lingkaran kecil jika masih ada garis lain yang harus disambungkan.",
        "en": "Do not close a small loop while other lines still need connecting."
      }
    ],
    "example": {
      "id": "Petak bernomor 3 memerlukan tiga sisi bergaris. Jika satu sisi sudah bertanda X, tiga sisi lain pasti bergaris.",
      "en": "A cell marked 3 needs three drawn edges. If one edge is X, the other three must be lines."
    }
  }
};
