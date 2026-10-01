# Laporan pengujian Brain Arena v1.6.0

Tanggal: 30 September 2026.

## Ringkasan

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit seluruh proyek | **66/66 lulus** | Duel Dadu, routes, Sudoku, Minesweeper, Maze, Matrix, guide data, progression |
| Daily Challenge | **Lulus** | pemilihan harian deterministik, bonus +150 XP, completion per tanggal, streak |
| XP & Level | **Lulus** | +60 sesi, +25 first play, progressive level, rank, anti-double-award |
| Profil pemain | **Lulus** | ubah nama, total XP, session count, per-game stats, riwayat XP |
| Browser desktop | **Lulus** | Home, Daily Challenge, Profile, result XP pada 1440 px |
| Browser mobile | **Lulus** | Home, Daily Challenge, Profile pada 390 px tanpa page overflow |
| JavaScript runtime | **0 uncaught error** | seluruh skenario progression QA |
| Build portable | **Lulus** | 42 module source ditranspilasi dan import lokal diverifikasi |

## Daily Challenge yang diverifikasi

- challenge harian dipilih deterministik dari 10 game berdasarkan tanggal lokal;
- challenge tanggal yang sama selalu memilih game yang sama;
- variasi 60 tanggal mencakup sedikitnya 7 game berbeda;
- penyelesaian game challenge memberi +60 XP sesi +25 XP main pertama +150 XP Daily = **+235 XP** pada skenario bersih;
- status completion disimpan pada `ba_daily_v1` dengan game dan tanggal yang benar;
- daily bonus hanya diberikan satu kali per tanggal;
- streak mempertahankan hari sebelumnya selama hari berjalan dan putus setelah melewatkan satu hari penuh.

## XP & Level yang diverifikasi

- profile baru mulai pada Level 1 / 0 XP;
- Level 2 dimulai pada 250 XP dan requirement berikutnya meningkat progresif;
- penyelesaian sesi non-daily pertama hari itu menghasilkan **+85 XP** (+60 dasar +25 first play);
- rerender result screen / pergantian bahasa tidak menggandakan XP;
- result screen menampilkan breakdown XP dan status level-up jika threshold dilewati;
- per-game completion dan XP diperbarui pada profil.

## Profil & responsive QA

- nama pemain dapat diubah dan tersimpan lokal;
- halaman Profile menampilkan level, rank, total XP, sesi selesai, game dijelajahi, streak, per-game progress, Daily status, dan XP history;
- halaman Home menampilkan Daily Challenge serta ringkasan level pemain;
- route `#/daily`, `#/harian`, `#/profile`, dan `#/profil` tervalidasi;
- desktop 1440 px dan mobile 390 px tidak menghasilkan horizontal page overflow.

## Unit test

Perintah:

```bash
npm test
```

Hasil: **66 test lulus, 0 gagal**.

## Build

Build portable:

```bash
npm run build:portable
```

berhasil dan menghasilkan build ESM portable v1.6.0.

Build Vite standar belum diverifikasi di runtime pengerjaan karena `npm ci` mengalami timeout jaringan pada environment ini. Workflow GitHub Pages tetap menggunakan `npm ci` dan `npm run build`, dan source memakai dependency React/Vite yang sudah tercatat di `package-lock.json`.

## Batas pengujian

Belum diverifikasi menyeluruh pada Safari/Firefox, perangkat fisik Android/iOS, screen reader, serta sinkronisasi lintas perangkat. XP/profil bersifat local-first: menghapus site data atau memakai browser/perangkat lain akan membuat progres lokal terpisah.
