# Brain Arena v1.10 — Random Arena & Impossible Mode

Brain Arena v1.10 melanjutkan seluruh fitur v1.9. Pembaruan ini menstandarkan **Mode Arena Universitas** dan memastikan konten permainan berubah pada sesi baru, sehingga pemain tidak menghafal satu papan atau satu set soal yang sama.

## Pembaruan v1.10 — Random Arena

Semua **12 game** sekarang menampilkan Mode Arena Universitas dengan tiga tingkat yang sama:

```text
Hard
Very Hard
Impossible
```

Nama lama **Extreme** dimigrasikan menjadi **Impossible**. Record Maze/Memory Matrix versi lama tetap dapat dibaca sebagai kompatibilitas legacy.

Randomisasi per game:

| Game | Yang diacak pada sesi baru |
| --- | --- |
| Blitz Aritmatika | angka, operator, kategori aktif, variasi faktorial/eksponen/akar/basis |
| Perburuan Prima | 25 angka papan dan kubus misteri |
| Digit Piksel | digit target, pecahan kartu, distractor, urutan kartu |
| Match & Mix | pasangan angka dan posisi chip |
| Hitung Kubus | tinggi tumpukan dan orientasi susunan |
| Duel Dadu | simbol sisi dadu dan isi arena gunting-batu-kertas |
| Sudoku Buta | solusi Sudoku dan mask sel tersembunyi |
| Minesweeper | posisi ranjau setelah klik pertama aman |
| Maze Escape | struktur labirin **serta posisi START dan EXIT di perimeter** |
| Memory Matrix | pola target baru pada setiap ronde |
| Nonogram | pola tersembunyi dan clue yang dihasilkan |
| 2048 | posisi dua ubin awal dan spawn 2/4 setelah gerakan valid |

Maze tidak lagi selalu dimulai di kiri atas dan selesai di kanan bawah. Generator memilih START acak di tepi arena, lalu memilih EXIT jauh yang juga berada di tepi, sambil mempertahankan jaminan maze dapat diselesaikan.

### Mode Arena Universitas

Hard, Very Hard, dan Impossible bukan hanya label. Setiap game menaikkan satu atau beberapa parameter seperti ukuran papan, rentang angka, jumlah target, kepadatan pola, jumlah langkah, bantuan, atau timer. Detail lengkap tersedia di Panduan Game.

## Fitur v1.9 yang tetap tersedia

Fokus v1.9:

1. **Season System**
2. **Event System**
3. **Game Mastery**
4. **Adaptive Difficulty**
5. **Export / Import Progress**
6. **Accessibility Settings**
7. **Result Screen v2**
8. **Nonogram + 2048** sehingga katalog menjadi **12 game**

Semua sistem tetap local-first dan kompatibel dengan GitHub Pages tanpa backend.

## Season System

Halaman:

```text
#/season
#/musim
```

Season pertama adalah **Mind Explorer**, aktif 1 Oktober–30 November 2026. Setiap sesi game yang selesai selama season memberi **+40 Season XP (SXP)**. Season XP memiliki level tersendiri dan terpisah dari XP akun, Arena Rating, serta Game Mastery.

Reward Track memiliki enam milestone. Saat syarat SXP tercapai, pemain dapat mengklaim hadiah XP akun satu kali.

## Event System

Halaman:

```text
#/events
#/event
```

Event berotasi mingguan antara kategori:

```text
Logic Week
Memory Focus
Math Sprint
Strategy Week
```

Game yang sesuai kategori event mendapat bonus **+50% dari XP dasar sesi**. Bonus otomatis dihitung pada Result Screen v2 dan tidak membutuhkan klaim manual.

## Game Mastery

Halaman:

```text
#/mastery
#/penguasaan
```

Setiap game sekarang memiliki progres mastery sendiri. Satu sesi yang selesai memberi **+50 Mastery XP (MXP)** kepada game tersebut.

Tier mastery:

```text
Novice → Apprentice → Skilled → Expert → Master → Grandmaster
```

Mastery tidak menggantikan Level atau Arena Rank; ketiganya mengukur progres yang berbeda.

## Adaptive Difficulty

Setup setiap game dapat menampilkan rekomendasi jenjang berdasarkan jumlah sesi dan mastery pemain. Rekomendasi bergerak dari SD → SMP → SMA → Universitas dan tetap bersifat saran; pemain bebas memilih tingkat apa pun.

Untuk pemain berprogres tinggi, sistem juga menghitung rekomendasi Universitas Hard / Very Hard / Impossible. Pilihan advanced tetap ditentukan pemain pada selector Universitas masing-masing game.

## Export / Import Progress

Halaman:

```text
#/settings
#/pengaturan
```

Menu Settings & Data menyediakan:

- **Export progress** menjadi file `brain-arena-backup-YYYY-MM-DD.json`;
- **Import backup** dari file JSON Brain Arena;
- pilihan merge atau replace data lokal saat import;
- validasi format, jumlah key, key yang diizinkan, dan batas ukuran nilai.

Backup hanya mengekspor key localStorage Brain Arena yang diizinkan, bukan seluruh localStorage browser.

## Accessibility Settings

Settings juga menyediakan:

- Theme: **System / Light / Dark**;
- **Reduce motion**;
- **High contrast**;
- **Larger text**.

Pengaturan disimpan lokal dan diterapkan melalui kelas/data attribute pada root document.

## Result Screen v2

Layar hasil game sekarang merangkum progres dari beberapa sistem sekaligus:

```text
Account XP
- Base XP
- First Play bonus
- Daily Challenge bonus
- Event bonus

Game Mastery
+ MXP dan mastery level-up

Season
+ SXP dan season level-up

Event
Nama event dan bonus XP jika eligible
```

Feedback Level Up tetap dipertahankan.

## Game baru: Nonogram

Route:

```text
#/nonogram
```

Tingkat:

| Jenjang | Papan |
| --- | ---: |
| SD | 5×5 |
| SMP | 8×8 |
| SMA | 10×10 |
| Universitas Hard | 12×12 |
| Universitas Very Hard | 15×15 |
| Universitas Impossible | 20×20 |

Fitur:
- clue baris dan kolom;
- mode Isi dan X/Kosong;
- klik kanan untuk X di desktop;
- kontrol mode khusus mobile;
- timer dan penghitung langkah;
- solusi diterima berdasarkan konsistensi clue, bukan hanya satu pola internal;
- papan besar memakai scroll lokal pada mobile agar halaman tidak melebar.

## Game baru: 2048

Route:

```text
#/2048
```

Target:

| Jenjang | Target |
| --- | ---: |
| SD | 128 |
| SMP | 256 |
| SMA | 512 |
| Universitas Hard | 1024 |
| Universitas Very Hard | 2048 |
| Universitas Impossible | 4096 |

Kontrol:
- Arrow Keys / WASD;
- swipe pada perangkat sentuh;
- D-pad 4 arah;
- skor, langkah, dan ubin terbesar;
- merge dan spawn 2/4 mengikuti mekanik 2048.

## Total 12 game

1. Blitz Aritmatika
2. Perburuan Prima
3. Digit Piksel
4. Match & Mix
5. Hitung Kubus
6. Duel Dadu
7. Sudoku Buta
8. Minesweeper
9. Maze Escape
10. Memory Matrix
11. Nonogram
12. 2048

Panduan lengkap dan tips juga sudah ditambahkan untuk Nonogram dan 2048.

## Kompatibilitas progres v1.8

Key progression v1.8 tetap digunakan. v1.9 menambahkan data Season dan Accessibility serta field `masteryXp` pada statistik per-game. Profile lama dinormalisasi saat dibaca, sehingga data lama tidak perlu di-reset.

## Menjalankan source

Gunakan Node.js sesuai `engines` pada `package.json`.

```bash
npm ci
npm run dev
```

Build produksi standar:

```bash
npm run build
npm run preview
```

## Preview portable yang disertakan

Project menyertakan portable ESM build:

```bash
node scripts/serve.mjs
```

Buka:

```text
http://localhost:4173
```

Pada Windows tersedia `JALANKAN-WINDOWS.bat`.

## GitHub Pages

Workflow tetap tersedia di:

```text
.github/workflows/deploy.yml
```

Pada GitHub:

```text
Settings → Pages → Source → GitHub Actions
```

Untuk update repository:

```bash
git add .
git commit -m "Upgrade Brain Arena to v1.10 Random Arena"
git push origin main
```

## PWA

PWA dari v1.7 tetap dipertahankan. Cache service worker sekarang:

```text
brain-arena-v1.10.0
```

Shortcut manifest diperbarui untuk Season, Live Events, Game Mastery, dan Player Statistics.

## Pengujian v1.10

- **88/88 unit test lulus**.
- Portable build: **68 module source**.
- HTTP verification: **87 checks lulus**.
- Semua **12 game** diverifikasi menampilkan selector Arena Universitas **Hard / Very Hard / Impossible**.
- Impossible-mode smoke test lulus untuk 12/12 game pada mobile 390 px tanpa uncaught JavaScript error atau page-level horizontal overflow.
- Maze diuji dengan enam restart berurutan; enam pasangan START/EXIT berbeda dihasilkan pada skenario QA tersebut.
- Unit test Maze memverifikasi START/EXIT selalu berbeda, berada di perimeter, terhubung oleh jalur valid, dan tidak dipatok pada sudut yang sama.
- Maze Escape dan Memory Matrix Impossible juga diverifikasi pada 1440, 390, dan 320 px.
- Record legacy `extreme` tetap dapat dibaca oleh halaman Activity saat nama aktif berubah menjadi `Impossible`.

Lihat `TEST_REPORT.md` untuk detail dan batas pengujian.

## Catatan build

Pada environment pengerjaan ini binary `vite` tidak tersedia di `node_modules`, sehingga `npm run build` standar tidak dapat diverifikasi di sini. `npm run build:portable` berhasil dan digunakan untuk QA browser/HTTP. GitHub Actions tetap menggunakan `npm ci` lalu `npm run build` dari dependency pada `package-lock.json`.
