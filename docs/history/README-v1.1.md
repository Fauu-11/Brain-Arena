# Brain Arena - Unified Games v1.1

Versi 1.1.0. Pembaruan lanjutan dari `UniversityWar-Upgraded.zip`, yang berasal dari proyek React dalam `UniversityWar.rar`.
Tujuh game asli tetap digunakan; ini bukan halaman mockup dengan tombol kosong.

## Baru di v1.1: tampilan semua game menyatu dengan beranda

Ketujuh game kini memakai kerangka visual yang sama: hero gelap, kartu putih,
aksen ungu, pemilihan jenjang, tombol, status permainan, panduan singkat,
papan skor/timer, dan panel hasil. Tampilan persiapan, fase menghafal, permainan
aktif, dan hasil mengikuti tema dashboard. Duel Dadu juga memakai arena terang.

Aturan, generator, skor, timer, dan pilihan mode dari versi sebelumnya dipertahankan.
Perubahan interaksi terbatas pada aksesibilitas: label dan aktivasi keyboard untuk
keping piksel serta sel Sudoku. Papan Sudoku 9x9 dan Match & Mix level terbesar
diperbaiki agar kontrolnya tetap berada di dalam kartu pada viewport 320 px.

Gunakan paket ini sebagai **proyek lengkap**, bukan patch yang perlu digabungkan
secara manual. Cadangkan proyek lama terlebih dahulu. Untuk melanjutkan edit,
lihat `src/components/GameScreen.jsx`, `src/components/GameShell.jsx`,
`src/components/Scoreboard.jsx`, dan `src/game-theme.css`.

## Coba langsung, tanpa mengunduh dependency

Paket ini sudah menyertakan folder `dist/` dan server preview Node tanpa dependency.
Ekstrak ZIP, buka terminal di folder proyek, lalu jalankan:

```bash
node scripts/serve.mjs
```

Buka `http://localhost:4173` di browser. Hentikan server dengan `Ctrl+C`.
Pada Windows, `JALANKAN-WINDOWS.bat` menjalankan perintah yang sama.
Node.js harus sudah terpasang. Jangan membuka `dist/index.html` melalui `file://`;
jalankan melalui server HTTP agar modul JavaScript dapat dimuat.

`npm run serve:dist` adalah alias untuk server preview yang sama dan tidak memerlukan
`npm install`. Server ini hanya mendengarkan localhost, bukan server produksi.

## Menjalankan source untuk development

Gunakan versi Node yang memenuhi `engines` di `package.json`
(`^20.19.0 || >=22.12.0`; runtime pengujian paket ini: Node 22.16.0).

```bash
npm ci
npm run dev
```

Buka alamat yang dicetak oleh Vite di terminal. Instalasi dependency membutuhkan
akses registry npm. Folder `node_modules` dari arsip lama tidak disertakan karena
berisi binary Windows; pasang ulang pada mesin tujuan, jangan menyalinnya antar OS.

Untuk membuat build Vite baru setelah mengedit source:

```bash
npm run build
npm run preview
```

Perintah build tersebut mengganti isi `dist/` dengan hasil Vite.

## Upload ke hosting

Unggah **isi folder `dist/`**, bukan seluruh source, ke document root hosting statis.
Paket terpisah `BrainArena-Hosting-v1.1.zip` berisi isi folder tersebut di root ZIP.
`index.html`, `assets/`, dan `favicon.svg` harus berada pada struktur yang sama.

Aplikasi menggunakan hash route, misalnya `#/sudoku` dan `#/tips-sudoku`.
Asset menggunakan path relatif dan konfigurasi Vite `base: './'`, sehingga paket
bisa ditempatkan pada root domain atau subfolder. Akses subfolder dengan akhiran `/`.
Server hosting perlu melayani `.js` sebagai JavaScript dan `.css` sebagai CSS.

Tidak diperlukan database atau PHP untuk fitur yang disertakan. Backend, akun,
login, cloud sync, leaderboard online, dan multiplayer melalui internet **tidak**
ditambahkan. Duel lokal berlangsung pada perangkat yang sama.

## Yang diperbarui

- Dashboard baru: sidebar, breadcrumb, hero, ilustrasi SVG tiap game, kartu permainan,
  filter musim/kategori, pencarian, pilihan game acak, serta empty state.
- Halaman favorit, aktivitas, indeks panduan, dan pencarian global dengan `Ctrl/Cmd+K`.
- Bahasa Indonesia/English, mode fokus, menu HP, bantuan keyboard, modal native
  dengan Escape/focus handling, notifikasi, dan halaman 404.
- Rute menu diperbaiki. Slug asli, ID game, `game-*`, dan tautan panduan tetap diterima.
- Game/panduan dimuat dengan lazy loading. Ikon, ilustrasi dan runtime pada build
  tersimpan lokal; tidak memerlukan Google Fonts atau CDN.
- Suara memakai AudioContext bersama dan master mute untuk suara aktif maupun baru.
- Penyimpanan browser dibungkus fallback memori; data rusak tidak membuat halaman gagal.
- Generator Sudoku diganti: solusi lengkap 4x4, 6x6, dan 9x9 selalu mengikuti pola
  baris, kolom, dan blok yang valid, lalu diacak dengan transformasi yang mempertahankan
  validitas. Generator lama dapat mengembalikan angka 0 setelah backtracking gagal.
  Sel Sudoku juga mendapat label dan aktivasi keyboard.

## Game yang tetap tersedia

| Menu baru | Komponen asli | Hash utama |
| --- | --- | --- |
| Blitz Aritmatika | `Game300.jsx` | `#/aritmatika` |
| Perburuan Prima | `GamePrime.jsx` | `#/bilangan-prima` |
| Digit Piksel | `GamePixel.jsx` | `#/warna-pixel` |
| Match & Mix | `GameMnM.jsx` | `#/mnm-grid` |
| Hitung Kubus | `GameCube.jsx` | `#/kubus-3d` |
| Duel Dadu | `GameRPS.jsx` | `#/suwit` |
| Sudoku Buta | `GameSudoku.jsx` | `#/sudoku` |

Pilihan tingkat SD, SMP, SMA, dan Universitas tetap tersedia sebagaimana pada game asal.
Sudoku Buta meminta pemain mengingat solusi yang ditampilkan. Generator bukan pembuat
puzzle klasik dengan jaminan solusi tunggal setelah angka disembunyikan.

## Penyimpanan dan batas fitur

| Key browser | Isi |
| --- | --- |
| `uw_lang` | Bahasa; key lama dipertahankan |
| `ba_muted` | Preferensi suara; key lama dipertahankan |
| `ba_favorites_v2` | ID game favorit |
| `ba_recent_v2` | Maksimal 100 catatan game yang dibuka beserta waktunya |
| `pixel_best_<level>` | Rekor waktu Digit Piksel dari game asli |
| `blind_sudoku_best_<level>` | Rekor waktu Sudoku dari game asli |

Aktivitas menghitung **game yang dibuka**, bukan game yang diselesaikan.
Tombol "Main lagi" memulai sesi baru; posisi permainan berjalan tidak disimpan.
Menghapus riwayat tidak menghapus favorit atau rekor. Data hanya berada pada browser/origin
tersebut. Data dari localhost, port lain, subdomain lain, atau browser lain tidak otomatis
berpindah. Membersihkan data situs juga menghapus data lokal. Bila storage diblokir, UI
menampilkan peringatan dan perubahan hanya bertahan selama tab hidup.

## Struktur untuk pengembangan

```text
src/
  data/games.js             # Katalog, slug, alias rute, judul ID/EN
  context/                 # Bahasa, favorit, riwayat, suara
  components/              # Layout, dialog, kartu, ilustrasi, komponen game
  games/                   # Tujuh permainan asli yang dipertahankan
  pages/                   # Beranda, aktivitas, panduan dan TipsPage asli
  utils/                   # Storage aman, audio, generator Sudoku
  arena.css                # Desain dashboard dan responsive overrides
  game-theme.css           # Tema terpadu untuk tujuh game, termasuk mobile
  index.css                # Primitive/tampilan dasar game lama
scripts/serve.mjs           # Server preview Node tanpa dependency
scripts/build-portable.mjs # Builder ESM alternatif (memerlukan TypeScript)
vendor/                   # Runtime React untuk builder alternatif
tests/browser/            # Skrip QA Playwright dengan harness in-memory
tests/routes.test.mjs      # Tes route dan generator Sudoku; tanpa dependency
dist/                     # Build yang dapat langsung dicoba
```

`Cast.jsx`, `App.css`, serta beberapa asset lama dipertahankan di source sebagai referensi.
Halaman Cast tidak dihubungkan ke menu baru; pada App asli halaman itu juga tidak dirutekan.
Versi dependency dari proyek asal dipertahankan, bukan dinaikkan secara massal.

## Pengujian dan catatan build

```bash
npm run test:routes
```

Tes ini memakai `node:test`, tanpa dependency npm: route/alias, penolakan URL rusak,
serta 1.500 papan Sudoku (500 untuk setiap ukuran). Detail pengujian browser dan hasil
ada di `TEST_REPORT.md` serta `qa-results/`.

**Build dalam paket ini bukan hasil perintah `vite build` di lingkungan pengujian.**
Instalasi `npm ci` tidak selesai pada lingkungan pengerjaan ini. Sebagai alternatif,
source ditranspilasi menjadi ESM dengan TypeScript 5.8.3 yang tersedia, memakai
runtime React/ReactDOM production dari paket v1.0, import map lokal, dan CSS lokal.
Hasil tersebut berada di `dist/`; informasinya tercatat di `dist/BUILD_INFO.json`.

Builder alternatif disertakan untuk reproduksi:

```bash
node scripts/build-portable.mjs
```

Perintah ini memerlukan TypeScript yang terpasang lokal atau global. Jalur utama
pengembangan tetap `npm ci` lalu `npm run build` (Vite). Builder alternatif tidak
melakukan type-check menyeluruh atau optimasi bundler Vite.

Modul build telah dijalankan di Chromium melalui harness ESM in-memory. Server dan
asset HTTP diuji terpisah; navigasi browser ke localhost dibatasi lingkungan.
Fixture storage dipakai dalam pengujian UI: ini bukan pengujian persistensi native
lintas reload pada origin HTTP. Build Vite standar, instalasi npm yang selesai,
lint, browser selain Chromium, dan perangkat fisik belum diverifikasi. Jalankan
build standar di komputer development dan uji pada hosting tujuan sebelum rilis.

`tests/browser/` menyertakan skrip pengujian yang memuat kode build sebenarnya
melalui Blob URL/import map, bukan game engine pengganti. Skrip memerlukan Python,
Playwright, dan Chromium. Lihat perintah pada `TEST_REPORT.md`.

Build menyertakan lisensi React/ReactDOM/Scheduler di
`dist/THIRD-PARTY-NOTICES.txt`. Paket tidak menyertakan file font.
