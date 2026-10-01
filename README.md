# Brain Arena v1.6 — Daily Challenge & Player Progression

Brain Arena v1.6 menambahkan **Daily Challenge**, **XP**, **Level**, dan **Profil Pemain** di atas fondasi 10 game serta panduan lengkap v1.5. Progres tetap lokal sehingga project dapat berjalan penuh di GitHub Pages tanpa backend.

## Isi panduan baru

Setiap game sekarang mempunyai empat bagian utama:

1. **Ringkasan** — tujuan permainan, cara menang, kontrol, fakta cepat, dan perubahan tiap tingkat.
2. **Tutorial langkah** — tutorial dari awal sampai siap bermain dengan checklist interaktif.
3. **Cara memecahkan** — metode keputusan langkah demi langkah, contoh pemecahan, dan kesalahan umum.
4. **Strategi & trik** — strategi lanjutan, rumus/pola, filter SD–Universitas, dan pencarian tips.

Panduan tersedia dalam **Bahasa Indonesia dan English** mengikuti pengaturan bahasa
Brain Arena.

## Game yang memiliki panduan lengkap

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

Panduan Maze Escape dan Memory Matrix juga menjelaskan sub-level Universitas
**Hard, Very Hard, dan Extreme**.

## Tampilan Panduan

Halaman `#/panduan` sekarang memiliki Learning Hub baru dengan:

- learning path empat tahap;
- indikator kategori dan musim;
- penanda bahwa tiap panduan berisi Tutorial, Pemecahan, dan Strategi;
- kartu responsive yang tetap mengikuti UI Brain Arena.

Halaman detail, contoh:

```text
#/tips-minesweeper
#/tips-maze
#/tips-matrix
#/tips-rps
```

memiliki selector 10 game, tab panduan, checklist tutorial, worked example, daftar
kesalahan, pencarian strategi, dan tombol langsung kembali bermain.

## Menjalankan source

Gunakan Node.js sesuai `engines` di `package.json`.

```bash
npm ci
npm run dev
```

Build produksi standar:

```bash
npm run build
npm run preview
```

## Build portable yang disertakan

Versi ZIP menyertakan build ESM portable untuk preview lokal:

```bash
node scripts/serve.mjs
```

Lalu buka:

```text
http://localhost:4173/#/panduan
```

Pada Windows dapat memakai `JALANKAN-WINDOWS.bat`.

## GitHub Pages

Workflow otomatis tetap berada di:

```text
.github/workflows/deploy.yml
```

Di GitHub pilih **Settings → Pages → Source → GitHub Actions**.

Untuk mengunggah pembaruan dari Zed:

```bash
git add .
git commit -m "Upgrade complete game guides"
git push origin main
```

## Berkas utama pembaruan v1.5

| Berkas | Fungsi |
| --- | --- |
| `src/pages/Guides.jsx` | Learning Hub / daftar seluruh panduan |
| `src/pages/TipsPage.jsx` | UI detail panduan, tab, checklist, pencarian strategi |
| `src/data/guideDetails.js` | Tutorial lengkap, metode pemecahan, kontrol, tingkat, kesalahan |
| `src/arena.css` | Tampilan responsive panduan baru |
| `tests/guides.test.mjs` | Validasi kelengkapan panduan untuk semua game |

## Pengujian

```bash
npm test
npm run build:portable
```

QA browser juga memeriksa halaman panduan pada 1440 px dan 390 px, interaksi tab,
checklist tutorial, perpindahan antar-game, dan halaman Learning Hub.

Detail ada di `TEST_REPORT.md`.

Favorit, riwayat, rekor, bahasa, dan mute tetap tersimpan di browser (`localStorage`).
Belum ada backend atau akun online.

## Daily Challenge, XP, Level, and Player Profile (v1.6)
Brain Arena now includes local progression without requiring a backend:
- Every completed game session grants **60 XP**.
- The first completed session each day grants an extra **25 XP**.
- A deterministic **Daily Challenge** selects one game per local calendar day; finishing that game once grants an extra **150 XP** and extends the daily streak.
- The **Player Profile** shows level, rank, XP progress, sessions completed, games explored, daily streaks, per-game completion stats, and recent XP rewards.
- The player display name can be edited locally.

Progress is stored in browser `localStorage`. Clearing site data or using another browser/device starts a separate local profile.
