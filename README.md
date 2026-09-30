# Brain Arena v1.4 — Maze Escape + Memory Matrix

Brain Arena v1.4 menambahkan **dua game sekaligus** tanpa mengganti identitas UI:
**Maze Escape** dan **Memory Matrix**. Total sekarang **10 game**. Keduanya tetap
menggunakan hero gelap, kartu putih, aksen ungu, sidebar, bahasa ID/EN, favorit,
riwayat lokal, panduan, mode fokus, dan kontrol responsif seperti game Brain Arena lain.

> Proyek ini menggunakan **React + Vite**. `vite.config.js` memakai
> `@vitejs/plugin-react`.

## Game yang tersedia

1. Blitz Aritmatika
2. Perburuan Prima
3. Digit Piksel
4. Match & Mix
5. Hitung Kubus
6. Duel Dadu
7. Sudoku Buta
8. Minesweeper
9. **Maze Escape**
10. **Memory Matrix**

Game baru ditempatkan pada **Musim 3**. Filter musim di beranda sekarang dibangun
otomatis dari katalog sehingga Musim 3 langsung muncul.

## Maze Escape

Route: `#/maze-escape`

| Jenjang | Ukuran |
| --- | ---: |
| SD | 7 × 7 |
| SMP | 10 × 10 |
| SMA | 14 × 14 |
| Universitas — Hard | 18 × 18 |
| Universitas — Very Hard | 24 × 24 |
| Universitas — Extreme | 32 × 32 |

Fitur:

- generator **perfect maze**: setiap papan pasti dapat diselesaikan;
- posisi mulai kiri atas dan pintu keluar kanan bawah;
- keyboard **Arrow Keys / WASD**;
- D-pad untuk layar sentuh;
- timer, jumlah langkah, pause, restart, dan efisiensi rute;
- rekor waktu terbaik per jenjang dan per sub-level Universitas;
- papan Very Hard/Extreme memakai scroll lokal sehingga halaman tidak melebar di HP.

## Memory Matrix

Route: `#/memory-matrix`

| Jenjang | Matriks | Ronde | Pola awal |
| --- | ---: | ---: | ---: |
| SD | 3 × 3 | 5 | 3 petak |
| SMP | 4 × 4 | 6 | 4 petak |
| SMA | 5 × 5 | 7 | 5 petak |
| Universitas — Hard | 6 × 6 | 7 | 7 petak |
| Universitas — Very Hard | 7 × 7 | 8 | 9 petak |
| Universitas — Extreme | 8 × 8 | 9 | 12 petak |

Fitur:

- fase **menghafal → mengingat kembali** pada setiap ronde;
- jumlah target bertambah seiring ronde;
- tiga nyawa untuk satu tantangan;
- petak benar +100 poin, kesalahan mengurangi nyawa dan 50 poin;
- mode Extreme menambah 2 target per ronde;
- skor tertinggi tersimpan per jenjang / sub-level Universitas;
- layout matriks responsif sampai viewport 320 px.

## Tingkat khusus Universitas

Kedua game baru memiliki selector tambahan saat **Universitas** dipilih:

```text
Hard
Very Hard
Extreme
```

Selector ini hanya muncul pada mode Universitas. SD, SMP, dan SMA tetap memakai
konfigurasi masing-masing tanpa sub-level tambahan.

## Menjalankan source

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

## Build portable yang disertakan

Build ESM portable sudah disertakan untuk preview lokal:

```bash
node scripts/serve.mjs
```

Buka salah satu:

```text
http://localhost:4173/#/maze-escape
http://localhost:4173/#/memory-matrix
```

Pada Windows dapat memakai `JALANKAN-WINDOWS.bat`.

## GitHub Pages

Workflow otomatis ada di:

```text
.github/workflows/deploy.yml
```

Workflow menjalankan `npm ci` dan `npm run build`, lalu menerbitkan folder `dist/`.
Pada repository GitHub pilih **Settings → Pages → Source → GitHub Actions**.

Setelah perubahan di Zed:

```bash
git add .
git commit -m "Add Maze Escape and Memory Matrix"
git push origin main
```

## Pengujian

```bash
npm test
npm run build:portable
python tests/browser/newgames.py
```

Untuk pemeriksaan HTTP, jalankan server preview terlebih dahulu lalu:

```bash
python tests/http.test.py
```

Rincian hasil ada di `TEST_REPORT.md`.

## Berkas utama game baru

| Berkas | Fungsi |
| --- | --- |
| `src/games/GameMaze.jsx` | Gameplay Maze Escape |
| `src/utils/maze.js` | Generator, movement, shortest path |
| `src/games/GameMemoryMatrix.jsx` | Fase hafalan, recall, score, nyawa, ronde |
| `src/utils/memoryMatrix.js` | Sampling pola dan target ronde |
| `src/components/GameShell.jsx` | Selector Hard / Very Hard / Extreme Universitas |
| `src/game-theme.css` | UI responsive kedua game |
| `tests/maze.test.mjs` | Unit test Maze Escape |
| `tests/memoryMatrix.test.mjs` | Unit test Memory Matrix |
| `tests/browser/newgames.py` | QA browser desktop/mobile kedua game |

Favorit, riwayat, rekor, bahasa, dan mute tetap disimpan di `localStorage`; belum
ada backend atau akun online.
