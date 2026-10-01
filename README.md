# Brain Arena v1.18 — Stability Release

Brain Arena v1.18 adalah release stabilitas dari v1.17. Tidak ada game baru atau perubahan besar pada aturan 12 game. Fokus versi ini adalah **keamanan progress lokal, recovery saat error, migrasi schema, PWA/cache, performa, responsive layout, dan accessibility**.

## Fokus utama v1.18

- **Transactional Backup Import**: import backup sekarang memakai snapshot sebelum menulis. Jika browser/storage gagal di tengah proses, data sebelumnya dicoba dipulihkan otomatis.
- **Runtime Crash Guard**: error React, error global, dan unhandled promise rejection dicatat sebagai metadata teknis ringan untuk membantu diagnostics tanpa menyimpan password atau isi progress.
- **Safer Data Migration v18**: schema lokal naik ke v18, membuat rollback point sebelum migrasi, dan menambahkan stability marker tanpa mereset XP, Rank, record, profile, Mastery, Achievement, atau history.
- **Corrupt Data Quarantine**: Data Health menyimpan salinan raw JSON rusak ke quarantine sebelum key bermasalah dibersihkan.
- **PWA Cache Hardening**: core cache dan runtime cache dipisah, cache versi lama dibersihkan, navigation memakai network-first dengan fallback offline, dan asset statis memakai stale-while-revalidate.
- **Bounded Runtime Cache**: runtime cache dibatasi agar tidak terus bertambah tanpa kendali.
- **Diagnostics Upgrade**: System Diagnostics sekarang ikut melaporkan Data Health dan Runtime Health.
- **Error Recovery UI**: Error Boundary memberi pilihan kembali ke Beranda atau reload aplikasi, bukan hanya satu tombol reload.
- **Mobile / Tablet Polish**: safe-area, touch target, overflow handling, layout 390 px / 768 px, dan loading-state diperkuat.
- **Accessibility Hardening**: forced-colors/high-contrast compatibility dan reduced-motion behavior diperbaiki.

## Kompatibilitas

- 12 game tetap dipertahankan.
- Tema merah, sidebar full/compact, Arena Run, Arena Cup, Ranked, Replay v2, Brain Coach v2, Multi Local Profile, Save Slot, PWA, dan seluruh progression v1.17 tetap tersedia.
- Data lama v1.17 dimigrasikan ke **Schema v18**.
- Brain Arena tetap **local-first**; v1.18 belum menggunakan Supabase/backend online.

Lihat `RELEASE_NOTES_v1.18.md` dan `TEST_REPORT.md` untuk detail release dan QA.

---

# Brain Arena v1.17 - Player Experience & Release Hardening

Brain Arena v1.17 melanjutkan v1.16 dengan fokus pada **multi-player lokal, showcase, hasil yang bisa dibagikan, tournament bracket, practice drill, pengelolaan backup/storage, diagnostics, controller, dan release safety**. Seluruh 12 game, tema merah, sidebar full/compact, Ranked, Arena Run, Replay v2, Brain Coach v2, analytics, PWA, progression, challenge sharing, dan sistem local-first tetap dipertahankan.

## Fitur utama v1.17

- **Multi Local Profile**: maksimal 6 pemain lokal. Progress aktif disimpan ke slot terpisah saat berpindah profil dan disinkronkan saat halaman ditutup.
- **Player Showcase**: halaman showcase untuk rank, streak, mastery, badge, game unggulan, dan hasil pertandingan pilihan.
- **Shareable Result Card**: membuat kartu hasil 16:9 langsung di browser dan mengekspor PNG / Web Share tanpa backend.
- **Arena Cup / Tournament Bracket**: 7-stage bracket dari Quarterfinal ke Final dengan Challenge Code, Practice/Ranked, dan status Champion/Eliminated.
- **Practice Lab**: 12 drill fokus, satu untuk tiap game, selalu berjalan dalam Practice Mode sehingga tidak mengurangi Arena RP.
- **Save Slot & Backup Manager**: maksimal 10 checkpoint manual bernama dengan restore, overwrite, rename, delete, dan export JSON.
- **Storage Optimization Center**: mengukur ukuran data lokal dan membersihkan replay, history, backup, recovery session, atau cache PWA secara selektif.
- **System Diagnostics v3**: memeriksa app/schema version, local storage, service worker, PWA state, cache, viewport, last crash, dan release rollback; laporan bisa disalin.
- **Keyboard & Controller Support**: Gamepad D-Pad/stick dipetakan ke Arrow Keys dan tombol A ke Enter untuk game yang sudah mendukung keyboard.
- **Release Safety & Rollback**: sebelum migrasi schema besar, Brain Arena membuat restore snapshot; kegagalan migrasi mencoba rollback otomatis.
- **Data Schema v17** tanpa mereset XP, Rank, Match History, Mastery, Achievement, atau profile yang sudah ada.

## Catatan implementasi

Brain Arena tetap aplikasi **local-first**. Multi Local Profile tidak membuat akun online dan tidak menyinkronkan antarperangkat. Arena Cup adalah bracket lokal single-player, bukan multiplayer real-time. Controller bridge mengikuti kontrol keyboard yang tersedia pada masing-masing game.

Lihat `RELEASE_NOTES_v1.17.md` untuk detail dan `TEST_REPORT.md` untuk hasil QA.

---

# Brain Arena v1.16 - Competitive Polish & Reliability

Brain Arena v1.16 melanjutkan v1.15.1 dengan **Automatic Backup & Restore Point, Replay v2, Arena Run v2, Brain Coach v2, Advanced Performance Analytics, Streak & Activity Calendar, Pinned Games v2, Search / Filter v2, Ranked Session Integrity, serta UI/UX polish**. Seluruh 12 game, tema merah, Smart Sidebar, Challenge Link, Arena Builder, Goals, Accessibility 2.0, PWA, XP, Rank, Season, Mission, Achievement, dan Mastery tetap dipertahankan.

## Fitur utama v1.16

- Automatic Backup: 5 restore point lokal, auto snapshot berkala, restore/delete dari Settings.
- Replay v2: timeline scrubber, skip 5 detik, 0.5x/1x/2x/4x, marker event.
- Arena Run v2: total score, run grade, perfect stage, best stage, average performance.
- Brain Coach v2: post-game review dan fokus latihan per game.
- Advanced Analytics: 7/30/Season/All Time dan per-game competitive metrics.
- Activity Calendar: heatmap 91 hari, streak dan Daily marker.
- Pinned Games v2: pin terpisah dari favorite, reorder, sinkron dengan sidebar.
- Search/Filter v2: difficulty/status filter dan command query University Hard/Very Hard/Impossible.
- Ranked Integrity: recovery/focus markers pada History dan Replay.
- UI polish: micro interaction konsisten dan responsive refinement.

Lihat `RELEASE_NOTES_v1.16.md` untuk detail lengkap.

## Fitur baru v1.15

- **Challenge Link & QR**: Challenge Code dapat dibuka melalui `#/challenge/<code>`, disalin sebagai link, dan ditampilkan sebagai QR untuk membagikan seed yang sama.
- **Custom Arena Builder**: pilih 3-12 game, Practice/Ranked, jenjang, University Arena difficulty, serta urutan random/manual.
- **First-Time Onboarding**: tur 5 langkah untuk pemain baru; selesai onboarding memberi +25 XP satu kali.
- **Data Health & Repair**: scan seluruh key `ba_*`, buat restore point, deteksi JSON rusak, repair, dan restore snapshot tanpa menyentuh data browser lain.
- **Daily Challenge Archive**: 30 hari challenge terakhir dapat dibuka ulang; replay arsip tidak menambah Daily Streak.
- **Accessibility 2.0**: color-vision presets, enhanced focus ring, screen-reader hints, dan reduced timer pressure ditambahkan ke pengaturan lama.
- **Offline Content Manager**: pemain dapat memilih game yang akan diprefetch/lazy-load agar modulnya tersedia melalui cache browser/service worker setelah pernah dipersiapkan.
- **Diagnostics / Feedback v2**: opsi diagnostics sekarang menyertakan versi, route, game, mode, difficulty, seed, PWA state, viewport, UA, dan maksimal 20 aksi terakhir tanpa membaca isi localStorage.
- **Personal Goal System**: target sesi, XP, Ranked match, atau Daily Challenge dengan scope semua game / satu game.
- **Progress Data Migration v15**: schema lokal naik ke v15 dan menambahkan default aman untuk accessibility v2, goals, dan offline selection.

### Catatan QR
QR challenge memakai layanan image QR publik (`api.qrserver.com`) hanya untuk mengubah link challenge publik menjadi gambar QR. Challenge Code tidak berisi password/token. Link challenge tetap bisa disalin tanpa QR.

### Catatan offline
Offline Manager mem-prefetch modul game yang dipilih. Keberhasilan offline tetap bergantung pada service worker/browser cache dan aset yang sudah pernah dimuat pada origin GitHub Pages/PWA.

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