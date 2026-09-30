# Brain Arena v1.3 — Minesweeper

Brain Arena v1.3 menambahkan **Minesweeper** sebagai game ke-8 tanpa mengubah
identitas UI yang sudah dipakai game lain. Proyek tetap menggunakan **React + Vite**,
sidebar Brain Arena, kartu putih, hero gelap, aksen ungu, bahasa ID/EN, favorit,
riwayat lokal, panduan, mode fokus, dan suara global.

> Catatan penting: proyek ini React, bukan Vue. `vite.config.js` yang benar memakai
> `@vitejs/plugin-react`.

## Game yang tersedia

1. Blitz Aritmatika
2. Perburuan Prima
3. Digit Piksel
4. Match & Mix
5. Hitung Kubus
6. Duel Dadu
7. Sudoku Buta
8. **Minesweeper**

## Minesweeper

Route: `#/minesweeper`

| Jenjang | Papan | Ranjau |
| --- | ---: | ---: |
| SD | 9 × 9 | 10 |
| SMP | 12 × 12 | 20 |
| SMA | 16 × 16 | 40 |
| Universitas | 30 × 16 | 99 |

Fitur utama:

- klik/tap untuk membuka petak;
- klik kanan untuk bendera di desktop;
- tekan lama untuk bendera di layar sentuh;
- tombol **Mode Bendera** sebagai kontrol mobile alternatif;
- klik pertama selalu aman dan area 3×3 di sekitarnya diprioritaskan aman;
- pembukaan otomatis area kosong;
- chord: ketuk angka terbuka lagi jika jumlah bendera tetangganya sudah tepat;
- jeda, mulai ulang, aturan, dan panduan;
- waktu permainan dan rekor terbaik per jenjang tersimpan di browser;
- papan Universitas memakai scroll internal sehingga halaman tidak melebar di HP.

## Menjalankan source untuk development

Gunakan Node.js yang memenuhi `engines` di `package.json`.

```bash
npm ci
npm run dev
```

Build produksi standar:

```bash
npm run build
npm run preview
```

Hasil build Vite berada di folder `dist/`.

## Menjalankan build portable yang disertakan

Paket ini juga menyertakan build ESM portable. Tidak perlu `npm install` untuk
sekadar mencoba build tersebut:

```bash
node scripts/serve.mjs
```

Buka:

```text
http://localhost:4173/#/minesweeper
```

Pada Windows Anda juga dapat menjalankan `JALANKAN-WINDOWS.bat`.

## GitHub Pages

Workflow otomatis sudah disertakan di:

```text
.github/workflows/deploy.yml
```

Workflow akan menjalankan:

```text
npm ci
npm run build
```

lalu mengunggah `dist/` ke GitHub Pages setiap ada push ke branch `main`.

Untuk repository `Fauu-11/Brain-Arena`:

1. Push project ke branch `main`.
2. Buka **Settings → Pages**.
3. Pada **Source**, pilih **GitHub Actions**.
4. Buka tab **Actions** dan tunggu workflow `Deploy Brain Arena to GitHub Pages`
   selesai hijau.
5. Site tersedia di `https://fauu-11.github.io/Brain-Arena/`.

`vite.config.js` memakai `base: './'`, sehingga asset hasil build tetap relatif dan
aman ketika Brain Arena dipasang di subfolder GitHub Pages.

## Update project ke GitHub

Setelah Anda mengubah source di Zed:

```bash
git add .
git commit -m "Update Brain Arena"
git push origin main
```

GitHub Actions akan membangun dan menerbitkan versi terbaru secara otomatis.

## Pengujian

Uji logika:

```bash
npm test
```

Uji Minesweeper browser dengan harness QA:

```bash
python tests/browser/minesweeper.py
```

Uji HTTP build portable:

```bash
node scripts/serve.mjs
python tests/http.test.py
```

Rincian pengujian ada di `TEST_REPORT.md`.

## Berkas Minesweeper utama

| Berkas | Fungsi |
| --- | --- |
| `src/games/GameMinesweeper.jsx` | Gameplay, timer, input, bendera, pause, hasil |
| `src/utils/minesweeper.js` | Generator ranjau, angka tetangga, flood reveal, chord |
| `src/game-theme.css` | Tampilan responsif Minesweeper |
| `src/components/Artwork.jsx` | Ilustrasi kartu/hero Minesweeper |
| `src/components/Icon.jsx` | Ikon SVG ranjau dan bendera |
| `src/data/games.js` | Katalog, route, kategori, metadata game |
| `tests/minesweeper.test.mjs` | Unit test logika Minesweeper |
| `tests/browser/minesweeper.py` | Smoke/interaksi desktop dan mobile |

## Penyimpanan lokal

Favorit, riwayat, mute, dan rekor tersimpan di `localStorage`. Rekor Minesweeper
menggunakan key:

```text
minesweeper_best_sd
minesweeper_best_smp
minesweeper_best_sma
minesweeper_best_universitas
```

Tidak ada backend, database, akun, atau multiplayer online pada versi ini.
