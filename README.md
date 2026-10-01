# Brain Arena v1.14 - UX & Recovery Update

Brain Arena v1.14 melanjutkan v1.13.1 dengan fokus pada pengalaman pemain, recovery sesi, notifikasi, navigasi, PWA update, dan performa. Seluruh 12 game, mode Ranked/Practice, Arena Run, Seed Challenge, XP, Rank, Season, Mission, Achievement, Mastery, statistik, feedback, dan tema merah tetap dipertahankan.

## Fitur baru v1.14

- **Continue Playing / Autosave**: sesi aktif disimpan otomatis berkala beserta game, seed/challenge code, mode, jenjang, tingkat Universitas, waktu kompetitif, hint, dan action log.
- **Session Recovery**: Home dan setup game menampilkan recovery checkpoint. Continue mengembalikan challenge yang sama dan memulai kembali dengan seed/mode/difficulty yang tersimpan.
- **Smart Sidebar v2**: menu dikelompokkan menjadi Arena, Kompetitif, Progres, dan Lainnya; tiap grup bisa collapse; favorit tampil sebagai Pinned Games; mode full/compact tetap tersedia.
- **Notification Center**: Daily, mission siap klaim, season reward, achievement terbaru, dan session recovery masuk ke satu inbox.
- **Universal Command Palette** (`Ctrl/Cmd + K`): cari game sekaligus jalankan aksi seperti toggle sidebar, notifikasi, suara, bahasa, theme, settings, dan profile.
- **Post-Game Insights**: Result Screen v2 menampilkan insight berdasarkan PB, performance grade, Brain Coach, dan Ranked RP.
- **PWA Update Manager**: service worker baru menunggu persetujuan pemain sebelum reload ketika versi baru tersedia.
- **Lazy Loading & Performance**: Home juga dilazy-load; halaman/game tetap route-based lazy loading; beberapa halaman populer diprefetch saat browser idle.
- **Progress Data Migration**: schema lokal v14 memigrasikan preferensi lama secara idempotent tanpa mereset XP, rank, record, profil, achievement, atau data kompetitif.

### Catatan recovery
Checkpoint v1.14 memulihkan **challenge yang sama** (seed, mode, jenjang, difficulty, timer kompetitif, dan log aksi). State visual per-sel pada game yang sedang berlangsung tidak diserialisasi frame-by-frame; challenge diregenerasi deterministik dari seed saat dipulihkan.

---

## Riwayat dokumentasi sebelumnya

Brain Arena v1.13 melanjutkan seluruh fitur competitive v1.11 dan menambahkan kanal **Feedback & Saran** untuk pemain. Katalog tetap berisi 12 game, seluruh progression/competitive system tetap kompatibel, dan project tetap dapat di-host di GitHub Pages.

## Feedback & Saran v1.12

Route baru:

```text
#/feedback
#/saran
#/masukan
```

Menu **Feedback & Saran** tersedia di sidebar desktop serta navigation drawer mobile. Form mendukung:

- kategori saran fitur, bug, gameplay, UI/UX, konten/panduan, dan lainnya;
- pemilihan game/area yang terkait;
- rating pengalaman 1-5;
- subjek dan pesan sampai 3.000 karakter;
- nama pemain;
- email pemain opsional jika ingin dibalas;
- info teknis ringan yang bisa dimatikan pemain;
- status sending, success, dan error;
- receipt lokal untuk submission terbaru dari perangkat tersebut.

Alamat email developer **tidak dirender di UI**. Pada hosting statis, pengiriman menggunakan FormSubmit AJAX relay. Recipient di-obfuscate di bundle agar tidak muncul sebagai alamat telanjang pada tampilan/source sederhana, tetapi ini bukan mekanisme secret yang setara backend: pengguna teknis masih dapat menginspeksi request jaringan. Jika alamat harus benar-benar dirahasiakan, gunakan server/serverless proxy pada versi backend berikutnya.

FormSubmit membutuhkan konfirmasi penerima pada penggunaan pertama. Setelah form pertama dikirim, buka inbox developer dan selesaikan aktivasi dari email FormSubmit. Sesudah itu submission berikutnya akan diteruskan ke inbox developer.

Jangan gunakan form untuk password, token, data identitas, atau informasi sensitif.

Brain Arena v1.11 melanjutkan seluruh fitur v1.10 dan menambahkan lapisan kompetitif yang tetap **local-first** serta kompatibel dengan GitHub Pages. Katalog tetap berisi **12 game**, seluruh University Arena tetap menggunakan **Hard / Very Hard / Impossible**, dan puzzle/soal tetap diacak.

## Pembaruan utama v1.11

### 🎲 Seed & Challenge Code

Setiap game kini memiliki kode challenge seperti:

```text
BA-MAZE-QA11111
```

Kode yang sama pada game yang sama menghasilkan urutan random awal yang sama. Sistem memasang seeded PRNG sebelum generator game dijalankan, sehingga challenge dapat dibagikan untuk pertandingan yang lebih adil. Kode berbeda tetap menghasilkan sesi baru yang acak.

Pada setup setiap game tersedia:

- input Challenge Code;
- tombol salin;
- tombol membuat seed baru;
- indikator Personal Best/Ghost untuk konfigurasi level aktif.

### 🏟️ Arena Run / Tournament

Route:

```text
#/arena-run
```

Tersedia empat format:

| Format | Jumlah game |
| --- | ---: |
| Quick Run | 3 |
| Standard Run | 5 |
| Master Run | 8 |
| Ultimate Run | 12 |

Game dipilih tanpa duplikasi dan diacak setiap Arena Run. Setiap stage memperoleh Challenge Code sendiri. Hasil stage dirangkum menjadi waktu total, rata-rata performa, dan total Arena RP.

### ⚔️ Ranked vs Practice

Sebelum bermain, pemain dapat memilih:

```text
Practice
Ranked
```

**Practice** tetap memberi XP, Mastery, Season, Event, Match History, PB, dan completion tetapi tidak memberi/mengurangi Ranked RP.

**Ranked** memakai aturan kompetitif dan memengaruhi `rankedPoints`. Brain Coach dibatasi maksimal dua hint per sesi Ranked, dan penggunaan hint mengurangi RP yang bisa diperoleh.

### 🕘 Match History

Route:

```text
#/history
#/riwayat
```

Menyimpan hingga **300 sesi lokal** dan menampilkan:

- game;
- tanggal/waktu;
- jenjang dan Arena difficulty;
- Practice / Ranked;
- Challenge Code;
- durasi;
- Performance Score dan grade;
- Arena RP;
- Personal Best;
- Replay aksi.

History dapat difilter berdasarkan mode dan game.

### ▶️ Replay System

Route:

```text
#/replay
```

Replay v1.11 adalah **action replay**, bukan rekaman video layar. Recorder menyimpan timeline input penting selama sesi, termasuk:

- klik/tap kontrol;
- Arrow Keys / WASD dan tombol navigasi yang relevan;
- penggunaan Brain Coach.

Replay mempunyai Play/Pause, previous/next action, timeline, serta kecepatan 1× / 2× / 4×.

### 👻 Personal Best / Ghost

Personal Best disimpan per:

```text
game + jenjang + Arena difficulty
```

Jadi rekor Maze SMA tidak bercampur dengan Maze Universitas Impossible. Setup dan HUD dapat menampilkan Ghost PB, sedangkan Result Screen menunjukkan apakah sesi menghasilkan PB baru atau selisih waktunya terhadap rekor lama.

### 💡 Brain Coach / Smart Hint

Brain Coach tersedia langsung dari topbar/HUD saat game aktif. Hint bersifat strategis dan tidak dimaksudkan langsung membuka jawaban.

Semua **12 game** memiliki bank hint bilingual. Dalam Ranked, maksimal dua hint dapat digunakan dan setiap hint mengurangi potensi Arena RP.

### 📈 Performance Rating

Result Screen menilai sesi dengan skor **35–100** dan grade:

```text
S · A · B · C · D
```

Rating mempertimbangkan hasil sesi, durasi terhadap Personal Best sebelumnya, dan penggunaan Brain Coach. Ranked RP menggunakan grade tersebut sebagai salah satu input.

### 🏆 Game Completion

Route:

```text
#/completion
#/koleksi
```

Setiap game memiliki enam target completion:

```text
SD
SMP
SMA
Universitas Hard
Universitas Very Hard
Universitas Impossible
```

Total keseluruhan:

```text
12 game × 6 target = 72 completion target
```

Game yang sudah 6/6 mendapat status **MASTER**.

## Seed dan randomisasi

v1.10 memastikan generator seluruh game memakai konten acak. v1.11 menambahkan cara untuk **mengulang random sequence yang sama** melalui Challenge Code. Artinya:

- kode baru → sesi acak baru;
- kode yang sama → challenge awal yang dapat direproduksi;
- dua pemain dapat memakai kode yang sama untuk membandingkan performa pada puzzle yang setara.

Browser QA memverifikasi Challenge Code Maze yang identik menghasilkan endpoint START/EXIT yang identik pada desktop dan mobile.

## Result Screen kompetitif

Result Screen v2 sekarang juga merangkum:

```text
Performance Grade / Score
Run Time
Practice / Ranked
Arena RP
Personal Best / Ghost delta
Brain Coach hints
Challenge Code
Account XP
Mastery XP
Season XP
Event bonus
```

Tombol hasil juga dapat membuka Replay dan, bila sedang Arena Run, melanjutkan ke stage berikutnya.

## Fitur lama yang tetap tersedia

v1.11 tetap mempertahankan:

- Daily Challenge;
- XP, Level, dan Profil Pemain;
- Achievement & Badge;
- Daily / Weekly Mission;
- Leaderboard lokal;
- Arena Rank;
- Profile Customization;
- Advanced Statistics;
- Season System;
- Event System;
- Game Mastery;
- Adaptive Difficulty;
- Export / Import Progress;
- Accessibility Settings;
- PWA / Installable App;
- Random Arena Hard / Very Hard / Impossible;
- panduan lengkap 12 game.

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

## Penyimpanan

v1.11 masih menggunakan `localStorage`, sehingga tidak memerlukan backend untuk GitHub Pages. Data kompetitif baru juga ikut tercakup oleh mekanisme backup karena menggunakan prefix `ba_`.

Data baru mencakup antara lain:

```text
ba_competition_setup_v1
ba_match_history_v1
ba_personal_bests_v1
ba_game_completion_v1
ba_arena_run_v1
ba_selected_replay_v1
```

## Menjalankan source

```bash
npm ci
npm run dev
```

Build produksi standar:

```bash
npm run build
npm run preview
```

Portable ESM preview yang disertakan:

```bash
node scripts/serve.mjs
```

Lalu buka:

```text
http://localhost:4173
```

Pada Windows tersedia `JALANKAN-WINDOWS.bat`.

## GitHub Pages

Workflow tetap tersedia di:

```text
.github/workflows/deploy.yml
```

Pastikan:

```text
Settings → Pages → Source → GitHub Actions
```

Untuk update repository:

```bash
git add .
git commit -m "Upgrade Brain Arena to v1.11 Competitive Arena"
git push origin main
```

## PWA

Cache service worker v1.11:

```text
brain-arena-v1.11.0
```

Manifest kini memberi shortcut ke Arena Run, Match History, Game Completion, dan Statistics.

## Pengujian v1.11

- **97/97 unit test lulus**.
- Portable build: **74 module source**.
- HTTP verification: **93 checks lulus**.
- Challenge Code valid diuji untuk seluruh 12 game.
- Deterministic seeded PRNG diuji: seed sama menghasilkan urutan sama; seed berbeda menghasilkan urutan berbeda.
- Browser QA memverifikasi Maze dengan Challenge Code yang sama menghasilkan endpoint yang sama pada 1440 px dan 390 px.
- Arena Run, Match History, Replay, dan Game Completion diuji secara responsive.
- Completion grid memuat **12 game × 6 level = 72 target**.
- Tidak ditemukan uncaught JavaScript error atau page-level horizontal overflow pada skenario browser v1.11.

Lihat `TEST_REPORT.md` untuk detail.

## Catatan build

`npm run build:portable` berhasil dan digunakan untuk QA browser/HTTP. Pada environment pengerjaan ini binary `vite` tidak tersedia di `node_modules`, sehingga `npm run build` standar tidak dapat diverifikasi lokal. Workflow GitHub Pages tetap melakukan `npm ci` lalu `npm run build` menggunakan dependency pada `package-lock.json`.