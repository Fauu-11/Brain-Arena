# Laporan pengujian Brain Arena v1.9.0

Tanggal: 1 Oktober 2026.

## Ringkasan

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit seluruh proyek | **83/83 lulus** | game logic, routes, guides, progression v1.6–v1.9, rank, customization, statistics |
| Season System | **Lulus** | active window, level progression, reward lookup |
| Event System | **Lulus** | deterministic weekly rotation, eligibility, +50% XP calculation |
| Game Mastery | **Lulus** | mastery XP, levels, tiers, profile lookup |
| Adaptive Difficulty | **Lulus** | SD/SMP/SMA/Universitas recommendation from progress |
| Backup | **Lulus** | allowlist export, validation, merge/replace import |
| Nonogram | **Lulus** | clue generation, puzzle generation, valid-solution detection |
| 2048 | **Lulus** | move/merge, score, random tile insertion, locked-board detection |
| Browser QA v1.9 | **Lulus** | Season, Events, Mastery, Settings, Nonogram, 2048 at 1440/390 px |
| Accessibility interaction | **Lulus** | reduced motion, high contrast, larger text, dark theme |
| Result Screen v2 | **Lulus** | account XP, MXP, SXP, Event XP after a completed game |
| Home/Profile regression | **Lulus** | desktop/mobile load, no page-level horizontal overflow |
| JavaScript runtime | **0 uncaught error** | v1.9 browser scenarios executed |
| Portable build | **Lulus** | **67 modules** transpiled |
| HTTP checks | **86 lulus** | 82 assets + 4 response/security checks |

## Season System

Diverifikasi:
- `2026-10-01` dan `2026-11-30` berada di Season 1 aktif;
- `2026-12-01` berada di luar season;
- Season Level naik dari Level 1 ke Level 2 pada ambang SXP awal;
- reward berikutnya dipilih dengan benar berdasarkan SXP dan status claim;
- browser QA halaman `#/season` lulus pada 1440×1000 dan 390×844 tanpa horizontal overflow.

## Event System

Diverifikasi:
- event yang sama selalu terpilih untuk tanggal yang sama;
- event mempunyai bonus 50%;
- game dengan kategori event menerima bonus dari XP dasar;
- game kategori lain mendapat bonus 0;
- halaman `#/events` merender daftar arena eligible di desktop/mobile.

Pada QA Result Screen tanggal pengujian, event aktif adalah **Logic Week**. Penyelesaian Hitung Kubus menghasilkan breakdown:

```text
Base        +60 XP
First Play  +25 XP
Event       +30 XP
Total       +115 XP
Mastery     +50 MXP
Season      +40 SXP
```

Daily Challenge bonus tidak aktif pada skenario tersebut sehingga tidak ditambahkan.

## Game Mastery & Adaptive Difficulty

Diverifikasi:
- mastery dimulai pada Novice Level 1;
- MXP yang meningkat menaikkan mastery level;
- profil dengan progress tinggi direkomendasikan menuju Universitas;
- rekomendasi Universitas menghitung Hard / Very Hard / Extreme;
- halaman `#/mastery` menampilkan seluruh **12 game** dan progress masing-masing.

Adaptive Difficulty tetap berupa rekomendasi sehingga pemain masih dapat memilih jenjang secara manual.

## Export / Import Progress

Unit QA memakai storage tiruan untuk memverifikasi:
- key `ba_*` dan key game yang diizinkan dapat diekspor;
- key tidak terkait Brain Arena tidak masuk backup;
- backup menyimpan `appVersion: 1.9.0`;
- import `replace=true` menghapus hanya key Brain Arena yang lama;
- key browser/aplikasi lain tetap dipertahankan;
- format backup salah ditolak.

## Accessibility

Diverifikasi melalui browser QA mobile 390 px:
- Reduce motion menambahkan class `ba-reduced-motion`;
- High contrast menambahkan class `ba-high-contrast`;
- Larger text menambahkan class `ba-large-text`;
- Dark theme mengubah `data-ba-theme="dark"`;
- halaman Settings tetap tanpa page-level horizontal overflow.

## Nonogram

Unit QA:
- clue `[true,true,false,true]` menjadi `[2,1]`;
- baris kosong menjadi `[0]`;
- generator 5×5 menghasilkan 25 sel serta clue baris/kolom lengkap;
- solved-state menerima susunan yang memenuhi clue baris dan kolom, bukan hanya satu bitmap internal.

Browser QA:
- Universitas Extreme menghasilkan papan **20×20 / 400 sel**;
- 20 clue baris dan 20 clue kolom tersedia;
- mode X/Kosong bekerja;
- desktop 1440 px dan mobile 390 px lulus;
- pada mobile, papan Extreme menggunakan horizontal scroll lokal agar sel tidak dipaksa terlalu kecil dan document tidak melebar.

## 2048

Unit QA:
- `[2,2,4,4]` ke kiri menjadi `[4,8,0,0]`;
- merge score dihitung benar;
- board checker mendeteksi posisi tanpa langkah;
- initial board menghasilkan dua tile;
- random insertion menambah satu tile.

Browser QA:
- Universitas Extreme memakai target **4096**;
- 16 tile board tampil;
- Arrow Key mengubah state papan;
- D-pad 4 arah tersedia;
- desktop 1440 px dan mobile 390 px lulus tanpa page-level overflow.

## Catalog, route, guide dan regresi

Catalog sekarang berisi **12 game** dengan ID dan slug unik. Route baru yang diverifikasi:

```text
#/season        #/musim
#/events        #/event
#/mastery       #/penguasaan
#/settings      #/pengaturan
#/nonogram
#/2048
```

Guide completeness test juga lulus untuk seluruh 12 game, termasuk konten bilingual Nonogram dan 2048.

Home dan Profile diverifikasi ulang pada 1440 px dan 390 px. Mobile Season tab diperbaiki setelah penambahan Musim 4 sehingga document width kembali sama dengan viewport.

## Build & HTTP

Perintah yang berhasil:

```bash
npm test
npm run build:portable
node scripts/serve.mjs
python tests/http.test.py
```

Hasil akhir:

```text
83 unit tests passed
67 portable modules
86 HTTP checks passed
```

HTTP checks mencakup byte equality asset build, MIME JavaScript/CSS, gzip, 404, method restriction, dan traversal protection.

`npm run build` standar tidak dapat dijalankan pada environment pengerjaan karena binary `vite` tidak tersedia di `node_modules`. Workflow GitHub Pages tetap menggunakan `npm ci` kemudian `npm run build` berdasarkan `package-lock.json`.

## Batas pengujian

Belum dilakukan verifikasi menyeluruh pada perangkat fisik Android/iOS, Safari/Firefox, install prompt PWA pada setiap OS, sinkronisasi lintas perangkat, atau leaderboard online. Progress, Season, Mastery, accessibility, backup source, dan sistem progression lain masih local-first. Menghapus site data akan menghapus progres yang belum diekspor.
