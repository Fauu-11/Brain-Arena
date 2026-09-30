# Laporan pengujian Brain Arena v1.3.0

Tanggal: 30 September 2026. Source hash build portable: `bf139b7932e8`.

## Hasil

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit seluruh proyek | 50/50 | Duel Dadu, route, Sudoku, dan Minesweeper |
| Unit Minesweeper | 5/5 | generator, first-click safe, angka tetangga, flood reveal, chord, waktu |
| Browser Minesweeper | 3/3 viewport | 1440, 390, 320 px; first click, flag mode, pause, overflow |
| Papan ahli mobile | Lulus | 30×16, 99 ranjau, 480 sel, scroll internal tanpa page overflow |
| Pemeriksaan HTTP build | 48/48 | 44 asset + 4 pemeriksaan response |
| Build portable | Lulus | 34 modul, TypeScript 5.8.3, React runtime 19.2.7 |

Tidak ada uncaught JavaScript exception pada tiga skenario browser Minesweeper akhir.

## Minesweeper yang diverifikasi

- klik pertama tidak pernah mengenai ranjau;
- area 3×3 sekitar klik pertama diproteksi jika kapasitas papan memungkinkan;
- jumlah ranjau sesuai konfigurasi jenjang;
- angka setiap petak sama dengan jumlah ranjau di delapan tetangganya;
- petak kosong membuka area aman terhubung;
- bendera mencegah petak dibuka;
- chord hanya berjalan ketika jumlah bendera tetangga sesuai angka;
- Mode Bendera dapat memasang bendera tanpa membuka petak;
- pause menutup papan dan menghentikan interaksi permainan;
- viewport 320, 390, dan 1440 px tidak menambah lebar dokumen;
- papan Universitas berisi 480 sel dan menggulir di dalam panel papan, bukan halaman.

## Perintah uji

```bash
npm test
npm run build:portable
python tests/browser/minesweeper.py
python tests/http.test.py
```

## Batas pengujian

Build yang disertakan adalah **portable ESM build**, bukan hasil `vite build` standar.
Source React berhasil ditranspilasi dan import lokal diverifikasi oleh builder offline.
Workflow GitHub Pages memakai `npm ci` dan `npm run build` pada GitHub Actions.

Belum diverifikasi secara menyeluruh: Safari/Firefox, HP fisik Android/iOS,
screen reader, audit dependency produksi, serta seluruh kemungkinan papan acak.
Browser QA menggunakan Chromium dan harness in-memory karena navigasi localhost
dibatasi pada lingkungan pengerjaan.
