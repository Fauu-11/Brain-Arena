# Laporan pengujian - Brain Arena 1.1.0

Tanggal pengerjaan: 29 September 2026. Source hash build: `ae1cd334c2fe`.
Hasil berikut berasal dari pengujian rilis ini. Hasil v1.0 tidak dihitung ulang
sebagai bukti v1.1. Tidak ada klaim cakupan menyeluruh atas semua mode dan level.

## Ringkasan hasil

| Kelompok | Hasil | Lingkup |
| --- | --- | --- |
| Setup dan mulai bermain | 21/21 lulus | 7 game x lebar 1440, 390, dan 320 px |
| Interaksi lanjutan | 20/20 lulus | Alur permainan, level besar, favorit, bahasa; rincian di bawah |
| Regresi beranda | 2/2 lulus | 1440 dan 390 px; katalog, masuk/keluar tujuh game, pencarian |
| Node | 14/14 lulus | Rute/alias dan validitas 1.500 papan Sudoku |
| Asset HTTP | 40/40 lulus | Byte file sesuai dist; MIME JavaScript dan CSS sesuai |
| Respons HTTP tambahan | 4/4 lulus | Gzip index, 404, penolakan POST 405, traversal terenkode 403 |

Tidak ada uncaught JavaScript exception pada skenario browser yang diuji.
Viewport adalah emulasi ukuran layar di Chromium, bukan perangkat HP fisik.
Pemeriksaan overflow dokumen dilengkapi pemeriksaan posisi kontrol terhadap kartu
untuk papan terbesar Sudoku, Match & Mix, Duel Dadu, Digit Piksel, dan Prima pada
lebar 320 px. Ilustrasi hero dekoratif yang sengaja terpotong tidak dihitung sebagai
kontrol permainan yang keluar dari layar.

## Isi 21 skenario setup / start

Masing-masing kombinasi game dan viewport memeriksa halaman persiapan, empat
pilihan jenjang dan status aria-pressed, pembukaan dialog aturan, penutupan dialog
dengan Escape, mulai permainan level SD, dan lebar dokumen sebelum/sesudah mulai.
Untuk game memori, tes melanjutkan melewati fase menghafal.

## Isi 20 skenario interaksi lanjutan

1. Sudoku SD: menghafal papan 4x4, mengisi seluruh jawaban lewat keyboard,
   memeriksa hasil, dan memulai ulang ke fase menghafal.
2. Hitung Kubus SD: menghitung elemen kubus yang dirender, menjawab lima ronde,
   mencapai hasil 5/5 dan menampilkan rincian hasil per level.
3. Digit Piksel SD: mencari kombinasi dari pola yang tampak, memilih via keyboard,
   memeriksa kombinasi, dan mencapai panel hasil.
4. Prima duel lokal: memilih bilangan prima dan memastikan skor pemain pertama bertambah.
5. Match & Mix duel lokal: mengingat pasangan, membuka dua keping, dan memastikan poin bertambah.
6. Duel Dadu: merencanakan tiga langkah, memutar, menampilkan hasil duel, lalu melanjutkan.
7-11. Level terbesar di 320 px untuk Sudoku, MnM, RPS, Pixel, dan Prima;
   kontrol tetap di dalam batas kartu. Sudoku memuat 81 sel; RPS 49 petak.
12. Aritmatika arena: 30 input tampil; jawaban salah memicu penguncian input yang sudah ada.
13. Favorit game dan pergantian bahasa Indonesia/English langsung.
14-20. Halaman pengaturan ketujuh game dalam bahasa Inggris.

Tes ini tidak menyelesaikan pertandingan penuh Prima, MnM, atau Duel Dadu.
Tidak semua kombinasi tingkat, mode, giliran AI, kondisi timeout, dan hasil seri
tercakup. Suara tidak dinilai secara auditori pada rilis ini.

## Perbaikan yang ditemukan saat QA

Papan Sudoku 9x9 sebelumnya bisa melebar karena ukuran minimum konten track CSS
Grid. Track sekarang menggunakan minmax(0, 1fr), baris persegi, dan ukuran teks
responsif. Keping Match & Mix juga menyesuaikan ukuran sel pada level terbesar.

Tes Kubus memakai penanda elemen kubus, bukan menghitung semua polygon SVG,
karena SVG juga berisi polygon lantai. Ini perbaikan lokator pengujian, bukan
perubahan aturan atau jawaban permainan.

## Build dan batas pengujian

Build: portable-esm-production, TypeScript 5.8.3,
React/ReactDOM runtime 19.2.7 yang dibawa dari paket v1.0; 30 modul aplikasi.
Ini bukan hasil Vite build. `npm ci` tidak selesai pada lingkungan pengerjaan ini;
`npm run build` Vite dan lint tidak dinyatakan lulus.

Chromium di lingkungan ini tidak mengizinkan navigasi localhost. Pengujian UI
menggunakan source build yang sama lewat Blob URL dan import map in-memory.
`localStorage` memakai fixture memori. Tes HTTP menggunakan klien terpisah terhadap
server Node lokal: ini bukan uji browser end-to-end dari URL hosting.

Belum diverifikasi: persistensi native lintas reload pada origin HTTP, reload
langsung hash route melalui browser HTTP, sinkronisasi tab nyata, Safari/Firefox,
perangkat Android/iOS fisik, performa produksi, audit dependency/keamanan lengkap,
dan seluruh alur game. Uji ulang di komputer/hosting tujuan sebelum rilis.

## Menjalankan ulang

Tes Node tidak memerlukan npm install:

```bash
npm run test:routes
```

Untuk QA UI, pasang Python Playwright dan Chromium pada lingkungan pengujian:

```bash
python -m pip install playwright
python -m playwright install chromium
python tests/browser/smoke.py
python tests/browser/functional.py
```

`CHROMIUM_EXECUTABLE` dapat menunjuk instalasi Chromium sendiri. Skrip menulis
JSON dan screenshot ke `qa-results/browser/`, serta keluar dengan status gagal
bila ada skenario yang tidak lulus. Jangan menyalin fixture QA ke aplikasi produksi.

Tes HTTP: jalankan `node scripts/serve.mjs` di terminal pertama, lalu:

```bash
python tests/http.test.py
```

Gunakan `ARENA_TEST_URL` untuk port lain pada server preview yang sama.

Hasil mentah rilis ini berada di `qa-results/` (JSON dan TAP). Screenshot terpilih
ada di `previews/`. Catatan ini menjelaskan yang diuji, bukan jaminan bebas bug.
