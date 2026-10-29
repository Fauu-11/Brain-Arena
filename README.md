# Brain Arena

17 web game untuk berlatih hafalan, logika, strategi, dan hitung mental. Dibangun dengan React dan Vite, dengan antarmuka responsif untuk ponsel, tablet, dan desktop.

**v1.24.0 — Lima Game Baru**, 29 Oktober 2026.

## Lima game baru di v1.24

- **Pecahkan Sandi / Code Breaker:** deduksi kode angka dengan petunjuk tepat posisi dan salah posisi, termasuk digit berulang.
- **Padamkan Lampu / Lights Out:** membalik lampu dan tetangganya sampai seluruh papan padam.
- **Jejak Ingatan / Sequence Recall:** mengulangi urutan yang semakin panjang pada setiap ronde, dengan tiga nyawa.
- **Silang Angka / Kakuro:** memenuhi jumlah kelompok angka 1–9 tanpa pengulangan. Angka awal membantu memastikan solusi unik.
- **Lingkar Logika / Slitherlink:** menggambar satu lingkaran sesuai petunjuk 0–3. Garis/X awal terkunci dan beberapa petunjuk dapat dihilangkan pada tingkat lebih tinggi.

Semua game baru memakai **SD, SMP, SMA, SMA+, Universitas**, mendukung kontrol sentuh dan keyboard pada kontrol terkait, serta mempunyai ilustrasi katalog dan panduan Indonesia/Inggris.

| Game | Variasi Universitas 1 | Variasi 2 | Variasi 3 |
| --- | --- | --- | --- |
| Code Breaker | Maksimal tujuh tebakan | Hasil petunjuk hilang setelah lima detik | Enam digit wajib berbeda |
| Lights Out | Batas langkah berdasarkan solusi yang dijamin ada | Separuh tombol bergantian terkunci tiap 10 detik | Papan berputar 180° tiap 20 detik |
| Sequence Recall | Jawab urutan terbalik | Tambah satu pada angka; 10 kembali ke 1 | Posisi tombol diacak setelah preview |
| Kakuro | Isian permanen | Jumlah terlihat 12 detik awal, lalu 4 detik tiap 20 detik | Sel, panah, jumlah, dan isian berputar bersamaan |
| Slitherlink | Garis permanen | Petunjuk terlihat 12 detik awal, lalu 4 detik tiap 20 detik | Garis, X, angka, dan papan berputar bersamaan |

Generator Lights Out menyimpan jalur penekanan yang dapat membalik papan kembali padam. Generator Kakuro dan Slitherlink memakai solver dengan batas pencarian dan hanya menerima pengurangan petunjuk jika solusi tunggal terbukti. Kakuro terdiri dari wilayah silang yang dipisahkan petak gelap; givens ditambahkan jika diperlukan untuk keunikan. Solusi internal tidak ditampilkan di DOM saat bermain.

## Yang berubah

Aplikasi sekarang langsung berfokus pada permainan. Navigasi utama hanya **Permainan, Panduan, dan Pengaturan**. Profil, XP/EXP, daily challenge, misi, achievement, rank, leaderboard, progres, mastery, season/event, turnamen Arena Run/Cup, riwayat/replay, rekomendasi progres, dan sistem sinkronisasi profil telah dilepas dari alur dan kode aplikasi.

Skor, giliran, nyawa, dan waktu yang merupakan aturan sebuah game tetap ditampilkan selama sesi. Hasil tidak menghasilkan XP, rank, atau koleksi progres. Penyimpanan hanya dipakai untuk pilihan kesulitan, suara, bahasa, tampilan, serta laporan galat jika terjadi crash. Data profil lama tidak dibaca atau diperbarui, dan tidak dihapus otomatis. Memuat ulang halaman memulai permainan kembali; tidak ada autosave progres.

## Lima tingkat kesulitan

Semua game memakai pilihan yang sama, tanpa submenu kesulitan Universitas:

| Label di aplikasi | Tingkat |
| --- | --- |
| SD | Easy / mudah |
| SMP | Medium / sedang |
| SMA | Hard / sulit |
| SMA+ | Very hard / SMA tingkat lanjut |
| Universitas | Impossible / tantangan tertinggi |

Label ini menjelaskan tingkat tantangan game, bukan penilaian kemampuan akademik. SMA+ mempunyai konfigurasi tersendiri: papan atau angka lebih besar, target lebih tinggi, atau waktu yang lebih singkat daripada SMA. Panduan tiap game mencantumkan konfigurasi yang dipakai.

## Gameplay khusus Universitas

Setiap game mempunyai **tiga variasi gameplay**. Saat menekan mulai atau main lagi, satu variasi dipilih secara acak. Selama aplikasi masih terbuka, pemilihan menghindari pengulangan variasi yang baru dimainkan. Tingkat SD, SMP, SMA, dan SMA+ tetap memakai aturan dasarnya.

Variasi diterapkan langsung pada permainan. Ujian hafalan/logika/hitung terpisah setelah permainan pada v1.22 telah diganti dengan mekanik ini. Aturan aktif ditampilkan di atas papan; tiga kemungkinan aturan juga dijelaskan sebelum mulai.

| Game | Variasi 1 | Variasi 2 | Variasi 3 |
| --- | --- | --- | --- |
| Maze Escape | Dinding fatal: mencoba menembus tembok langsung kalah | Dinding ingatan: terlihat 8 detik awal, lalu 5 detik tiap 60 detik | Labirin berubah setiap 20 detik; posisi dan pintu keluar tetap |
| 2048 | Setiap langkah valid memunculkan angka 4 | Nilai ubin tersembunyi; muncul 3 detik tiap 20 detik setelah preview 6 detik | Satu arah dikunci dan berganti tiap 20 detik |
| Nonogram | Tanda yang dibuat menjadi permanen | Petunjuk tersembunyi; muncul 4 detik tiap 20 detik setelah preview 10 detik | Papan, tanda, dan petunjuk berputar 180° tiap 20 detik |
| Memory Matrix | Jawab pola yang diputar 180° | Pilih petak yang tidak menyala | Pilih target berurutan dari kiri ke kanan, atas ke bawah |
| Sudoku Buta | Satu angka salah langsung kalah | Isian hanya tampak pada sel terpilih atau kilatan 3 detik tiap 20 detik | Solusi, clue, dan isian berputar 180° tiap 20 detik saat menjawab |
| Minesweeper | Bermain tanpa bendera | Angka petunjuk hanya muncul 4 detik tiap 20 detik setelah preview 8 detik | Bendera pada petak aman langsung kalah; buka petak awal dahulu |
| Perburuan Prima | Memilih komposit atau salah menebak kubus ? langsung kalah | Angka belum dipilih tersembunyi, muncul 5 detik tiap 20 detik setelah preview 8 detik | Angka yang belum dipilih berpindah tiap 20 detik pada jeda aman |
| Digit Piksel | Piksel bertumpuk langsung kalah | Target tersembunyi, muncul 4 detik tiap 20 detik setelah preview 8 detik | Kartu diacak tiap 20 detik setelah pilihan dikosongkan |
| Hitung Kubus | Jawaban salah atau timeout langsung kalah | Kubus disembunyikan setelah 6 detik pada tiap soal | Susunan diputar 90° tiap 5 detik; jumlah kubus tetap |
| Match & Mix | Tidak cocok atau timeout langsung kalah | Hafalan hanya 6 detik, lalu chip tertutup otomatis | Ubin tetangga otomatis bergeser ke ruang kosong tiap 20 detik pada jeda aman |
| Duel Dadu | Satu kekalahan atau timeout langsung memenangkan lawan | Jaring-jaring hanya terlihat 6 detik sebelum dilipat otomatis | Simbol papan diacak tiap 20 detik pada fase perencanaan |
| Blitz Aritmatika | Satu jawaban salah mengakhiri sesi | Hasil bersandi: tambahkan offset sebelum menjawab; soal basis mengubah angka sebelum konversi | Selesaikan jumlah soal terpilih dalam 180 detik waktu aktif |

Timer variasi berhenti saat tab disembunyikan, dialog dibuka, game dijeda, atau sesi berakhir. Fase yang tidak menerima input, seperti feedback dan animasi tertentu, dapat dikecualikan dari waktu aktif. Perubahan dinamis menunggu batas interaksi yang aman, sehingga pilihan kartu, target AI, atau animasi lempar tidak rusak di tengah aksi.

Maze yang berubah selalu dibangun kembali sebagai labirin terhubung, sehingga posisi pemain masih memiliki rute ke pintu keluar. Rotasi Sudoku/Nonogram memutar data dan isian bersamaan. Aturan duel presisi berlaku untuk kedua pemain dan AI; pada papan prima tersembunyi, AI menunggu angka muncul dan timer giliran juga berhenti selama angka tersembunyi.

## Permainan

| Permainan | Fokus | Contoh SMA+ / Universitas |
| --- | --- | --- |
| Blitz Aritmatika | Hitung cepat dan akurat | Materi SMA dengan angka lebih besar / faktorial, akar, eksponen, basis |
| Perburuan Prima | Prima dan faktor bilangan | 1501–4000, 20 dtk / 9001–20000, 12 dtk |
| Digit Piksel | Menggabungkan pecahan tanpa tumpang tindih | 4 target / 5 target dengan pecahan lebih kecil |
| Match & Mix | Hafalan pasangan dan perpindahan ubin | 20 pasangan / 45 pasangan |
| Hitung Kubus | Penalaran spasial | Grid 5×5, tinggi hingga 5 / 7×7, tinggi hingga 7 |
| Duel Dadu | Orientasi dadu dan strategi | 4–5 langkah, 15 dtk / 6–7 langkah, 9 dtk |
| Sudoku Buta | Mengingat dan melengkapi papan asli | 38–44 angka tersembunyi, 1 intip / 52–58, tanpa intip |
| Minesweeper | Deduksi ranjau | 16×30, 99 ranjau / 24×36, 240 ranjau |
| Maze Escape | Navigasi dan perencanaan jalur | 20×20 / 32×32 |
| Memory Matrix | Hafalan posisi | 6×6, 8 ronde / 8×8, 9 ronde |
| Nonogram | Deduksi baris dan kolom | 15×15 / 20×20 |
| 2048 | Rantai penggabungan angka | Target 1024 / target 4096 |

Universitas pada seluruh game memakai satu aturan acak dari tabel di atas. Beberapa game mempunyai duel lokal pada perangkat yang sama; tidak ada multiplayer online.

## Menjalankan

Gunakan **Node.js 24** dan npm. Dukungan versi Node lainnya tercantum pada `engines` di `package.json`.

### Mencoba build dalam paket

Ekstrak seluruh paket. Jalankan `JALANKAN-WINDOWS.bat` di Windows, atau gunakan:

```bash
node scripts/serve.mjs
```

Buka `http://localhost:4173`. Hentikan server dengan `Ctrl+C`. Build harus dilayani melalui server HTTP, bukan dibuka sebagai file HTML langsung.

### Development

```bash
npm ci
npm run dev
```

### Pemeriksaan dan build produksi

```bash
npm run ci:verify
```

Perintah ini memeriksa konsistensi rilis, menjalankan tes, lint, dan membuat build Vite. Hasil produksi berada di `dist/`.

```bash
npm run serve:dist
```

Build ESM portabel lama tetap tersedia sebagai opsi `npm run build:portable` dan membutuhkan TypeScript yang terpasang. Build Vite adalah jalur utama untuk GitHub Pages.

## Memperbarui repo GitHub

Gunakan folder repo yang sudah di-clone, bukan folder ZIP hasil ekstrak. Buat branch pembaruan, lalu ganti **seluruh folder `src` dan `tests`** dengan versi dalam paket supaya halaman dan tes fitur yang dihapus tidak tertinggal. Salin pula `public`, `scripts`, `.github`, file konfigurasi, `package.json`, `package-lock.json`, dan README utama. Pertahankan folder `.git` repo. Jangan commit `node_modules`, `dist`, atau file ZIP.

```bash
git switch main
git pull --ff-only origin main
git switch -c five-new-games-v1.24
# Salin isi paket pembaruan, lalu jalankan:
npm ci
npm run ci:verify
git add -A
git commit -m "Add Code Breaker, Lights Out, Sequence Recall, Kakuro and Slitherlink"
git push -u origin five-new-games-v1.24
```

Buat pull request ke `main`. Pilih **GitHub Actions** pada Settings → Pages → Source. Workflow `.github/workflows/deploy.yml` melakukan build dan deployment setelah perubahan masuk ke `main`. `git pull` menyinkronkan komputer; deployment situs dijalankan GitHub Actions.

## Pengujian dan batasan

Pemeriksaan rilis: **120 tes lulus**, lint bersih, dan build Vite berhasil. Gunakan `npm run ci:verify` untuk mengulang pemeriksaan.

Tes otomatis mencakup aturan papan, Sudoku, RNG terisolasi, rute, pilihan tingkat, filter katalog, pengaturan suara/tema, pemilihan variasi acak, timer yang berhenti dengan benar, serta kondisi kalah dan perubahan papan pada 51 variasi Universitas. Tes komponen menjalankan 17 game × 5 tingkat dan seluruh 51 variasi Universitas, termasuk variasi mode Paket Soal dan duel lokal. Ukuran viewport dalam fixture mencakup ponsel hingga desktop; fixture ini tidak mengukur layout CSS pada browser sungguhan.

Papan besar mempertahankan petak yang terbaca melalui zoom dan area geser lokal. Layout mobile, safe area, keyboard layar, D-pad, dan keypad tetap tersedia. Tampilan visual serta interaksi pada Android/iPhone fisik belum diverifikasi pada rilis ini.

Nonogram menerima solusi dengan petunjuk baris/kolom setara. Minesweeper menjamin pembukaan aman tetapi belum menjamin seluruh papan selesai tanpa menebak. Sudoku Buta meminta rekonstruksi papan yang dihafalkan, bukan teka-teki clue dengan solusi unik.
