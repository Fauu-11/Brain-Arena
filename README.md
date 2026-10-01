# Brain Arena v1.7 — Achievements, Missions, Leaderboard & PWA

Brain Arena v1.7 melanjutkan 10 game, panduan lengkap, Daily Challenge, XP, Level, dan Profil Pemain dengan empat sistem baru: **Achievement & Badge**, **Mission / Quest**, **Leaderboard**, dan **PWA / Installable App**.

Semua progres masih local-first sehingga project tetap dapat berjalan di GitHub Pages tanpa backend.

## Fitur v1.7

### Achievement & Badge
- 12 achievement otomatis dengan progres yang terlihat.
- Badge untuk milestone sesi, level, XP, seluruh game, Daily Streak, Minesweeper, Maze Escape, dan Memory Matrix.
- Reward XP diberikan satu kali saat achievement terbuka.
- Badge yang sudah terbuka dapat dipasang atau dilepas dari profil pemain.
- Halaman: `#/achievements` atau `#/pencapaian`.

### Mission / Quest
- 3 misi harian dan 3 misi mingguan.
- Daily quest direset per tanggal lokal; weekly quest memakai minggu Senin–Minggu.
- Progress berdasarkan sesi selesai, variasi game, kategori, dan Daily Challenge.
- XP hanya dapat diklaim sekali untuk setiap periode quest.
- Halaman: `#/missions` atau `#/misi`.

### Leaderboard
- Ranking Total XP dan XP per game.
- Bekerja sepenuhnya offline untuk GitHub Pages.
- Rival diberi label **simulasi latihan**, bukan pemain sungguhan.
- Skor pemain berasal dari progres lokal pada browser.
- Halaman: `#/leaderboard` atau `#/peringkat`.

### PWA / Installable App
- `manifest.webmanifest` dengan icon 192 dan 512 px.
- Service worker untuk cache shell dan asset yang sudah dibuka.
- Offline fallback untuk navigasi Brain Arena setelah asset tersimpan.
- Tombol **Install aplikasi** di sidebar / toolbar saat browser mendukung instalasi.
- Shortcut PWA menuju Daily Challenge, Missions, dan Achievements.

## Game

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

Maze Escape dan Memory Matrix tetap memiliki mode Universitas **Hard, Very Hard, dan Extreme**.

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

ZIP menyertakan build ESM portable:

```bash
node scripts/serve.mjs
```

Lalu buka:

```text
http://localhost:4173
```

Pada Windows juga tersedia `JALANKAN-WINDOWS.bat`.

## GitHub Pages

Workflow berada di:

```text
.github/workflows/deploy.yml
```

Pada GitHub pilih **Settings → Pages → Source → GitHub Actions**.

Kemudian update dari Zed:

```bash
git add .
git commit -m "Add achievements missions leaderboard and PWA"
git push origin main
```

GitHub Actions menjalankan `npm ci` dan `npm run build`, lalu mengirim folder `dist` ke GitHub Pages.

## Penyimpanan lokal

Data berikut tersimpan di browser:
- favorit dan riwayat;
- record game;
- XP, level, profil, dan Daily Challenge;
- achievement, badge aktif, dan claim misi;
- completion events yang dipakai untuk menghitung quest.

Karena belum ada backend, progres tidak otomatis tersinkron ke browser/perangkat lain. Leaderboard v1.7 adalah **papan latihan offline** dengan rival simulasi yang diberi label secara eksplisit.

## Pengujian

- 70 unit test lulus.
- Browser QA: Achievements, Missions, Leaderboard, dan Profile pada 1440 px dan 390 px.
- Tidak ada horizontal overflow pada skenario QA tersebut.
- Portable build berhasil: 48 module source.
- HTTP asset check: 67 check lulus.

Lihat `TEST_REPORT.md` untuk detail.
