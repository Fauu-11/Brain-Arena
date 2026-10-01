# Laporan pengujian Brain Arena v1.10.0

Tanggal: 1 Oktober 2026.

## Ringkasan

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit seluruh proyek | **88/88 lulus** | game logic, routes, guides, progression, Maze endpoint randomization, University Arena contract |
| University Arena | **Lulus** | 12/12 game memiliki Hard / Very Hard / Impossible |
| Impossible mobile smoke | **12/12 lulus** | seluruh game dimulai pada Impossible di 390 px tanpa uncaught JS error |
| Maze random endpoints | **Lulus** | START/EXIT acak, perimeter, berbeda, rute valid |
| Maze + Memory Matrix responsive | **6/6 lulus** | Impossible pada 1440, 390, 320 px |
| Browser University selector | **18/18 lulus** | 12 game desktop + 5 game mobile + Maze endpoint restart |
| Portable build | **Lulus** | **68 modules** |
| HTTP verification | **87 checks lulus** | 83 assets + 4 response/security checks |

## Mode Arena Universitas

Seluruh game diperiksa agar pilihan Universitas memakai kontrak yang sama:

```text
Hard
Very Hard
Impossible
```

Source-level QA memeriksa 12 komponen game dan memastikan setiap game menggunakan `UniversityDifficultySelector`. Browser QA kemudian membuka selector aktual pada seluruh 12 game di desktop 1440 px dan memastikan ketiga pilihan dapat dipilih. Maze Escape, Memory Matrix, Nonogram, 2048, dan Blitz Aritmatika juga diperiksa pada 390 px.

Nama `Extreme` tidak lagi digunakan sebagai label aktif. Utility kompatibilitas tetap menerima nilai legacy `extreme` dan menormalisasinya menjadi `impossible` sehingga data lama tidak langsung rusak.

## Audit randomisasi 12 game

| Game | Generator/randomisasi yang diverifikasi dari implementasi |
| --- | --- |
| Blitz Aritmatika | angka, operator, kategori soal, faktorial, eksponen, akar, basis |
| Perburuan Prima | angka pada papan dan mystery tile |
| Digit Piksel | target digit, fragment, distractor, urutan kartu |
| Match & Mix | pasangan dan distribusi chip |
| Hitung Kubus | tinggi kolom dan orientasi susunan |
| Duel Dadu | enam sisi dadu dan tile RPS arena |
| Sudoku Buta | solved grid dan hidden-cell mask |
| Minesweeper | posisi ranjau setelah first-click protection |
| Maze Escape | perfect-maze layout serta START/EXIT perimeter |
| Memory Matrix | target pattern per ronde |
| Nonogram | hidden bitmap dan row/column clues |
| 2048 | dua initial tile dan tile spawn setiap move valid |

Randomisasi tidak berarti setiap dua sesi *pasti* berbeda secara matematis; generator acak masih dapat menghasilkan konfigurasi identik secara kebetulan. Yang diverifikasi adalah bahwa sesi baru memanggil generator acak dan tidak membaca satu papan/soal statis yang sama.

## Maze Escape

Unit QA memverifikasi:

- maze 7×7, 10×10, 14×14, 18×18, 24×24, dan 32×32 tetap fully connected;
- wall antar-sel bersifat reciprocal;
- START dan EXIT hasil `chooseMazeEndpoints` selalu berbeda;
- kedua endpoint berada pada perimeter;
- jarak yang dilaporkan sama dengan shortest path aktual;
- 16 seed endpoint pada maze 18×18 menghasilkan minimal enam pasangan berbeda dan tidak dipatok pada `0 → lastCell`.

Browser QA Impossible 32×32 menjalankan enam kali **Labirin baru** dan pada skenario tersebut menghasilkan enam pasangan START/EXIT berbeda:

```text
12:1007
1001:3
992:2
127:864
351:320
831:416
```

Angka tersebut adalah indeks sel QA, bukan posisi yang di-hardcode.

## Impossible-mode mobile smoke

Seluruh 12 game dibuka pada viewport 390 px, Universitas dipilih, kemudian `Impossible` dipilih dan gameplay dimulai. Semua skenario lulus tanpa uncaught JavaScript error dan tanpa document-level horizontal overflow.

Ukuran yang ikut divalidasi:

- Perburuan Prima: 25 tile;
- Duel Dadu: 49 arena cells;
- Sudoku Buta: 81 memo cells;
- Minesweeper: **24×36 = 864 cells / 240 mines**;
- Maze Escape: **32×32 = 1.024 cells**;
- Memory Matrix: **8×8 = 64 cells**;
- Nonogram: **20×20 = 400 cells**;
- 2048: 16 cells, target Impossible 4096.

Game lain diverifikasi berhasil memasuki state permainan dengan konfigurasi Impossible yang aktif.

## Rekor dan kompatibilitas

Activity sekarang membaca record University per Arena difficulty untuk Digit Piksel, Sudoku, Minesweeper, Maze Escape, dan Memory Matrix. Untuk Maze/Memory Matrix, key lama yang menggunakan suffix `extreme` masih dapat dibaca sebagai fallback ketika record `impossible` belum ada.

Backup metadata diperbarui menjadi:

```text
appVersion: 1.10.0
```

PWA service-worker cache diperbarui menjadi:

```text
brain-arena-v1.10.0
```

## Perintah QA yang berhasil

```bash
npm test
npm run build:portable
python3 tests/browser/newgames.py
python3 tests/browser/v110.py
python3 tests/browser/v110_impossible.py
ARENA_TEST_URL=http://127.0.0.1:4174 python3 tests/http.test.py
```

Hasil akhir:

```text
88 unit tests passed
68 portable modules
87 HTTP checks passed
12/12 Impossible mobile game starts passed
0 uncaught JavaScript errors pada skenario v1.10
```

## Catatan build

`npm run build:portable` berhasil dan build tersebut digunakan untuk QA browser serta HTTP. Build Vite standar tetap disiapkan melalui workflow GitHub Actions (`npm ci` lalu `npm run build`) untuk deployment GitHub Pages.
