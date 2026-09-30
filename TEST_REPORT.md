# Laporan pengujian Brain Arena v1.4.0

Tanggal: 30 September 2026. Source hash build portable: `d689ae06eaef`.

## Ringkasan

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit seluruh proyek | **58/58 lulus** | Duel Dadu, route, Sudoku, Minesweeper, Maze Escape, Memory Matrix |
| Unit Maze Escape | **3/3 lulus** | konektivitas, reciprocal walls, movement, input invalid |
| Unit Memory Matrix | **3/3 lulus** | sampling unik, pertumbuhan target ronde, input invalid |
| Browser game baru | **6/6 viewport lulus** | Maze + Matrix pada 1440, 390, 320 px |
| Maze Extreme | **Lulus** | 32×32 = 1.024 sel, movement, pause, no page overflow |
| Memory Extreme | **Lulus** | 8×8 = 64 sel, 12 target awal, ronde kedua menjadi 14 target |
| HTTP build portable | **52/52 lulus** | 48 asset + 4 pemeriksaan response |
| Build portable | **Lulus** | 38 modul, React runtime 19.2.7 |

Tidak ada uncaught JavaScript exception pada enam skenario browser baru.

## Maze Escape yang diverifikasi

- semua ukuran 7×7 sampai 32×32 menghasilkan maze yang terhubung;
- dinding antarsel selalu reciprocal;
- setiap papan memiliki jalur menuju exit;
- movement hanya berpindah melalui sisi yang terbuka;
- Arrow/WASD dan D-pad memakai fungsi movement yang sama;
- mode Universitas menampilkan Hard, Very Hard, Extreme;
- Extreme membuat 1.024 sel;
- pause menutup arena;
- viewport 320, 390, dan 1440 px tidak menambah lebar dokumen.

## Memory Matrix yang diverifikasi

- pola acak selalu berisi indeks unik dan valid;
- target ronde tumbuh sesuai konfigurasi dan tidak melebihi ukuran matriks;
- Universitas menampilkan Hard, Very Hard, Extreme;
- Extreme memakai 8×8, 12 target ronde pertama, growth +2 per ronde;
- setelah seluruh target ronde pertama dipilih dengan benar, ronde kedua dimulai;
- target ronde kedua Extreme menjadi 14;
- viewport 320, 390, dan 1440 px tidak menambah lebar dokumen.

## Regression smoke

Smoke test game lama dijalankan kembali pada desktop 1440 px dan mobile 390 px.
Skenario yang selesai sebelum batas waktu harness lulus tanpa JavaScript exception;
QA khusus dua game baru dijalankan sampai selesai pada ketiga viewport.

## Perintah uji

```bash
npm test
npm run build:portable
python tests/browser/newgames.py
node scripts/serve.mjs
python tests/http.test.py
```

## Batas pengujian

Build yang disertakan adalah **portable ESM build**. Source React berhasil
ditranspilasi dan import lokal diverifikasi oleh builder offline. Build Vite standar
belum diverifikasi di lingkungan pengerjaan karena instalasi dependency tidak selesai
pada runtime ini; workflow GitHub Pages tetap menggunakan `npm ci` dan `npm run build`.

Belum diverifikasi menyeluruh: Safari/Firefox, HP fisik Android/iOS, screen reader,
audit dependency produksi, dan seluruh variasi papan acak yang mungkin terbentuk.
