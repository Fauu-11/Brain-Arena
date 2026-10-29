# Brain Arena

Web game matematika, logika, memori, dan strategi dengan 12 permainan. Dibangun menggunakan React dan Vite. Progress disimpan di browser perangkat yang digunakan.

Versi **1.21.0 — Mobile & Responsive**, diperbarui pada **29 Oktober 2026**.

## Menjalankan

Gunakan **Node.js 24** dan npm. Versi lain yang didukung tercantum pada `engines` di `package.json`.

### Mencoba build yang disertakan

Ekstrak seluruh paket, buka terminal di folder proyek, lalu jalankan:

```bash
node scripts/serve.mjs
```

Buka **http://localhost:4173**. Di Windows, jalankan `JALANKAN-WINDOWS.bat` untuk membuka server yang sama. Hentikan server dengan `Ctrl+C`.

### Development

```bash
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite. `node_modules` dipasang melalui `npm ci` agar dependensi sesuai sistem operasi.

### Build produksi

```bash
npm run build
npm run serve:dist
```

Hasil build berada di `dist/`. Unggah isi folder tersebut ke hosting statis. Konfigurasi `base: './'` mendukung penggunaan subfolder. Workflow GitHub Pages tersedia di `.github/workflows/`.

## Permainan

| Permainan | Fokus |
| --- | --- |
| Blitz Aritmatika | Ketepatan dan kecepatan berhitung |
| Perburuan Prima | Identifikasi bilangan prima |
| Digit Piksel | Menyusun kepingan pola angka |
| Match & Mix | Memori pasangan dan perpindahan ubin |
| Hitung Kubus | Penalaran spasial dan kubus tersembunyi |
| Duel Dadu | Orientasi dadu dan strategi gunting-batu-kertas |
| Sudoku Buta | Mengingat dan melengkapi papan asli |
| Minesweeper | Deduksi posisi ranjau |
| Maze Escape | Navigasi labirin |
| Memory Matrix | Mengingat pola petak |
| Nonogram | Deduksi berdasarkan petunjuk baris dan kolom |
| 2048 | Menggabungkan ubin hingga target |

Jenjang tersedia dari SD sampai Universitas. Universitas memiliki pilihan Hard, Very Hard, dan Impossible. Practice memberi progress tanpa perubahan RP; Ranked memengaruhi peringkat lokal. Arena Run dan Arena Cup menyusun beberapa game menjadi rangkaian tantangan.

## Pembaruan v1.21.0

- **Navigasi mobile:** lima tab bawah untuk Beranda, Permainan, Tantangan, Progres, dan Profil. Tab disembunyikan selama sesi aktif agar ruang layar dipakai untuk bermain.
- **Header ringkas:** judul halaman/game, pencarian, dan menu opsi cepat. Suara, bahasa, notifikasi, pengaturan, Brain Coach, dan mode fokus tetap tersedia melalui menu opsi.
- **Layar permainan:** dekorasi dipadatkan; papan, skor, dan kontrol menjadi fokus. Panduan dapat dilipat pada mobile dan terbuka secara default di desktop.
- **Setup lebih singkat:** pengaturan Challenge Code berada dalam panel yang dapat dibuka. Pilihan jenjang, mode dan kesulitan tetap dapat dijangkau.
- **Zoom papan:** Nonogram, Minesweeper dan Maze menyediakan tombol −/+, reset 100%, serta ukuran dasar yang mengikuti lebar container. Papan besar tetap memakai area geser khusus.
- **Petunjuk tetap terlihat:** clue Nonogram menempel pada sisi atas/kiri area papan. Maze mengikuti posisi pemain; pembuka Minesweeper BA2 dibawa ke area terlihat.
- **Kontrol sentuh:** keypad Sudoku lima kolom, D-pad lebih ringkas, papan 2048 mendukung swipe, dan ukuran tombol utama disesuaikan untuk ponsel.
- **Landscape:** Duel Dadu dan 2048 memakai susunan papan/kontrol berdampingan pada layar mendatar yang cukup lebar.
- **Halaman fitur:** kartu, formulir, statistik, leaderboard, riwayat, profil, turnamen, pengaturan dan panduan menyesuaikan lebar layar. Statistik berubah menjadi kartu berlabel pada ponsel.
- **Dialog dan keyboard:** tinggi dialog mengikuti area layar yang tersedia; safe area perangkat diperhitungkan dan tab bawah disembunyikan saat keyboard layar terdeteksi.

Fondasi sesi v1.20 tetap dipertahankan:

- **Checkpoint untuk 12 game:** papan, isian, posisi, ronde, nyawa/skor, dan state generator acak dapat dipulihkan dari titik aman terakhir. Penyimpanan berjalan setiap 0,8 detik dan saat halaman ditinggalkan.
- **Clock sesi aktif:** durasi hasil/PB/Ranked mengabaikan tab tersembunyi, dialog, jeda, dan fase non-interaktif. Hafalan dan animasi tidak dihitung sebagai waktu menjawab. Waktu giliran AI pada mode PvE juga dipisahkan.
- **Penalti eksplisit:** intip Sudoku menambah 4 detik dan jawaban salah Aritmatika menambah 10 detik pada clock hasil, sejalan dengan aturan game.
- **Generator acak sesi:** pemulihan melanjutkan urutan acak tersimpan; game tidak mengganti `Math.random` global.
- **Challenge BA2:** kode berbagi membawa seed, jenjang, difficulty, versi aturan, serta opsi tambahan game. Materi/jumlah soal Aritmatika dan pilihan PvP/PvE ikut dibawa. Kode BA lama tetap diterima dengan pengaturan manual.
- **Reset Ranked:** reset papan aktif pada 2048, Nonogram, Maze, Minesweeper, Sudoku, Match & Mix, dan Digit Piksel menyelesaikan sesi lama sebagai kekalahan sebelum membuat sesi baru. Menyerah di Aritmatika juga dicatat kalah. Kembali ke Beranda menyimpan sesi untuk dilanjutkan.
- **Keamanan hasil:** reward tetap ditautkan ke ID sesi; hasil yang sama tidak memberi reward dua kali. Hitung Kubus mensyaratkan minimal 3/5 benar untuk lulus.
- **Fondasi sebelumnya dipertahankan:** pengaman backup, isolasi Arena/Practice, shuffle Fisher–Yates, serta layout mobile yang lebih ringkas.

## Data dan batas fitur

Progress, profil lokal, rekor, dan backup berada di browser. Pergantian browser/perangkat tidak memindahkan progress secara otomatis. Ekspor backup melalui Pengaturan sebelum membersihkan data browser.

- Profil dan leaderboard masih lokal; fitur akun, sinkronisasi Supabase, dan multiplayer online belum aktif.
- **Lanjutkan permainan tersimpan** memulihkan checkpoint yang valid. Saat keluar di tengah animasi, penilaian jawaban, atau giliran AI, pemulihan kembali ke titik aman terakhir. Waktu selama aplikasi ditutup tidak ditambahkan. Simpanan lama tanpa checkpoint masih menawarkan **Ulang challenge tersimpan**. Checkpoint dari awal preview Memory Matrix belum tersedia sampai fase menjawab pertama.
- Replay saat ini menampilkan timeline aksi, bukan rekonstruksi visual papan.
- Nonogram menerima semua jawaban yang sesuai clue. Generator belum menjamin solusi unik atau penyelesaian tanpa menebak.
- Klik pertama Minesweeper aman; susunan ranjau dipengaruhi petak awal. Mode tanpa menebak belum dijamin.
- Challenge BA2 memuat konfigurasi dan versi aturan. Pada Minesweeper BA2, petak pembuka ditetapkan dan ditandai agar susunan ranjau konsisten. Minesweeper dengan kode lama masih mengamankan petak pertama yang dipilih pemain. Kode lama tidak membawa seluruh konfigurasi.
- Durasi hasil menggunakan clock aktif yang sama lintas sesi. Countdown giliran dan timer preview tetap mengikuti aturan masing-masing game; tampilan detik dibulatkan sehingga dapat berbeda sedikit dari waktu internal milidetik.
- Jika backup terlalu besar, kurangi riwayat/replay melalui pengelolaan storage, lalu coba ekspor kembali. Rollback tetap bergantung pada browser yang mengizinkan penulisan data.

## Struktur proyek

```text
src/games/          Komponen 12 game
src/components/     Komponen UI bersama
src/context/        State aplikasi dan sesi
src/utils/          Aturan game, penyimpanan, dan utilitas
src/data/           Katalog, navigasi, dan data lokal
public/             Aset PWA dan service worker
scripts/            Server preview, build, pemeriksaan rilis
tests/              Tes perilaku dan regresi
vendor/             Runtime build portable dan pemberitahuan lisensi
```

Dokumentasi rilis berulang, screenshot QA lama, hasil tes yang sudah usang, dan skrip browser khusus versi lama telah dibuang. Tes perilaku yang masih relevan dipertahankan dan diberi nama berdasarkan fitur.

## Verifikasi

```bash
npm test
npm run lint
npm run build
```

Untuk seluruh pemeriksaan yang dipakai CI:

```bash
npm run ci:verify
```

Tes melindungi aturan permainan, migrasi, backup, konfigurasi sesi, dan penilaian. Tes komponen memeriksa alur setup → mulai → checkpoint → unmount/remount → pulih untuk 12 game; tes provider memeriksa pemulihan, reward sekali, serta reset Ranked. Pengujian tersebut belum menggantikan uji browser/perangkat.

Validasi komponen mencakup 40 halaman fitur, 12 game × 6 preset kesulitan, navigasi/menu cepat, zoom dan resize container. Skenario ukuran 320–1440 px diperiksa pada helper ukuran papan dan komponen. Ini bukan pengukuran posisi piksel atau tangkapan layar browser. Uji visual di Android/iPhone masih diperlukan, khususnya portrait/landscape, tema terang/gelap, notch, dan keyboard layar.

Build portable bersifat opsional dan memerlukan TypeScript yang dapat diakses Node:

```bash
npm run build:portable
```

Metadata aplikasi dan cache service worker sudah menggunakan versi 1.21.0. Saat membuat rilis berikutnya, naikkan versi secara konsisten agar pembaruan PWA terdeteksi. Pertahankan `vendor/THIRD-PARTY-NOTICES.txt` saat mendistribusikan runtime portable.
