# Brain Arena - Duel Dadu v1.2

Versi 1.2.0, lanjutan dari `UniversityWar-Unified-Games-v1.1.zip`.
Paket ini adalah proyek React lengkap beserta build siap dicoba. Tidak perlu
menggabungkan berkas dengan versi lama. Cadangkan proyek Anda sebelum mengganti.

## Perubahan khusus Duel Dadu

Gameplay dan ikon mengikuti referensi video `20260929-1344-39.9469434.mp4` yang
Anda berikan. UI tetap memakai Brain Arena v1.1: sidebar, header, hero gelap,
layout kartu putih, arena terang, tombol ungu, serta posisi panel skor dan kontrol.
Warna sisi dadu juga tetap memakai warna versi sebelumnya, bukan palet video.
Enam game lainnya tidak diubah implementasinya.

1. Hafalkan jaring-jaring enam sisi. **Kotak tengah adalah sisi atas**, sedangkan
   kotak paling ujung terlipat menjadi sisi bawah. Ini memperbaiki pemetaan lama.
2. Jaring-jaring dilipat menjadi dadu 3D, kemudian permainan dimulai di START.
3. Isi slot arah sesuai jumlah langkah giliran. Langkah pertama dari START wajib
   ke Bawah. Tidak boleh langsung membalik arah, keluar papan, atau kembali ke START.
4. Tekan PUTAR. Dadu berguling per petak; posisi sisi dan arah ikon ikut berotasi.
   **Hanya sisi bawah pada petak terakhir** yang melawan simbol ubin.
5. Menang +1, seri 0, kalah -1. **Skor boleh negatif**, seperti pada video.
6. Konfirmasi hasil, lalu pemain berikutnya melanjutkan **posisi dan orientasi
   dadu terakhir**, bukan kembali ke START.

Ikon batu, kertas, dan gunting kini berupa SVG outline tangan, bukan emoji.
Gaya garisnya digambar ulang mengikuti referensi; hasilnya tidak bergantung pada
font emoji perangkat. Ikon digunakan pada jaring-jaring, dadu, papan, legenda,
dan hasil duel. Bentuk digambar ulang, bukan ekstraksi pixel-identik dari video.

### Pengaturan yang dipertahankan / tidak ditunjukkan lengkap oleh video

Target kemenangan tetap **4 poin** dari versi sebelumnya. Video berhenti setelah
hasil seri dan tidak memperlihatkan akhir pertandingan. Penalti waktu habis -1
juga dipertahankan dari implementasi lama; saat timeout dadu tidak berpindah.

| Jenjang | Langkah per giliran | Waktu |
| --- | --- | --- |
| SD | 3 | 25 detik |
| SMP | 3-4 | 22 detik |
| SMA | 3-5 | 20 detik |
| Universitas | 4-5 | 16 detik |

SMA memakai 20 detik agar mendekati penghitung waktu yang terlihat pada video;
jenjang lain tetap menggunakan batas sebelumnya. Jumlah langkah diacak termasuk
pada giliran pertama. Papan dan simbol sisi tetap diacak per pertandingan,
bukan selalu mengulang papan yang ada di video.

Timer tidak berjalan saat menghafal, melipat, bergulir, hasil duel, dialog terbuka,
atau tab disembunyikan. Ini perilaku tambahan untuk kenyamanan, bukan klaim bahwa
seluruhnya teramati di video. Rencana jalur yang disorot, Undo, pilihan jenjang,
bahasa Indonesia/English, favorit, suara, dan layout responsif tetap tersedia.

## Jalankan langsung

Paket sudah menyertakan `dist/`. Node.js diperlukan, tetapi perintah berikut
**tidak memerlukan npm install**:

```bash
node scripts/serve.mjs
```

Buka `http://localhost:4173/#/suwit`. Pada Windows, klik dua kali
`JALANKAN-WINDOWS.bat`. Hentikan server dengan Ctrl+C.

Jangan membuka `dist/index.html` lewat `file://`, karena pemuatan modul memerlukan
server HTTP. Server bawaan hanya untuk preview lokal, bukan layanan produksi.

## Development dan build standar

Gunakan versi Node yang memenuhi `engines` di `package.json`.
Lingkungan pengujian ini menggunakan Node 22.16.0.

```bash
npm ci
npm run dev
```

Untuk menghasilkan build Vite pada komputer Anda:

```bash
npm run build
npm run preview
```

Dependency dan lockfile dari v1.1 dipertahankan; hanya versi proyek berubah.
Instalasi ulang diperlukan pada mesin tujuan. Jangan menyalin `node_modules`
Windows dari arsip lama ke sistem operasi lain.

**Build yang disertakan adalah portable ESM**, dikompilasi dari source dengan
TypeScript dan runtime React produksi bawaan paket sebelumnya. Build ini bukan
hasil Vite yang sudah diverifikasi. Lihat `dist/BUILD_INFO.json` untuk source hash.
Build standar `npm ci && npm run build` dan audit dependency belum diverifikasi
pada lingkungan ini. Skrip offline opsional `npm run build:portable` memerlukan
TypeScript lokal/global; ini bukan pengganti pemeriksaan dependency produksi.

## Hosting

Unggah **isi folder `dist/`** atau ekstrak `BrainArena-Hosting-v1.2.zip` ke document
root hosting statis. Pastikan `index.html`, `assets/`, `icons.svg`, dan
`favicon.svg` tetap memiliki struktur yang sama. Source React tidak perlu diunggah.

Hash route Duel Dadu adalah `#/suwit`; alias `#/rps` tetap bekerja.
Asset menggunakan path relatif, sehingga dapat dipasang di root atau subfolder.
Buka subfolder dengan akhiran `/`. File `.js` harus dilayani sebagai JavaScript.
Backend, database, login, cloud sync, dan multiplayer internet tidak ditambahkan.
Dua pemain bergantian pada **satu perangkat**. Favorit/riwayat memakai penyimpanan
browser; menyegarkan halaman tidak melanjutkan posisi pertandingan yang sedang aktif.

## Berkas utama

| Berkas | Fungsi |
| --- | --- |
| `src/games/GameRPS.jsx` | Alur permainan, kontrol, papan, pelipatan, animasi, timer, hasil |
| `src/utils/duelDice.js` | Aturan murni, rotasi fisik termasuk orientasi ikon, state reducer |
| `src/components/RPSHand.jsx` | Ikon SVG tangan |
| `src/game-theme.css` | Style khusus Duel Dadu; tema game lainnya tetap |
| `src/components/GameScreen.jsx` | Panduan singkat Duel Dadu dan label fase pelipatan |
| `src/pages/TipsPage.jsx` | Penjelasan strategi dan orientasi dadu |
| `tests/duelDice.test.mjs` | Uji aturan termasuk tiga giliran dari video |
| `tests/browser/duel.py` | Uji UI Duel Dadu dengan harness Chromium |

## Pengujian

```bash
npm test
npm run test:duel
```

Pengujian Node tidak memerlukan npm install. Untuk skrip browser, siapkan Python
Playwright dan Chromium, lalu jalankan:

```bash
python tests/browser/duel.py
python tests/browser/smoke.py
python tests/browser/functional.py
```

`CHROMIUM_EXECUTABLE` dapat menunjuk executable Chromium. Skrip memakai harness
Blob/import-map karena browser lingkungan pengerjaan tidak mengizinkan localhost.
Storage pada harness adalah fixture memori, bukan pengujian persistensi native.
Uji HTTP terpisah: jalankan server preview lalu `python tests/http.test.py`.
Detail hasil, batas pengujian, dan perbedaan dari referensi ada di `TEST_REPORT.md`.

## Game lainnya

Blitz Aritmatika, Perburuan Prima, Digit Piksel, Match & Mix, Hitung Kubus, dan
Sudoku Buta tetap tersedia. Source keenam komponen game tersebut tidak berubah.
Dokumentasi rilis sebelumnya ada di `docs/history/`.
