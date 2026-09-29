# Laporan pengujian Brain Arena v1.2.0

Tanggal: 29 September 2026. Source hash build: `4c50deb2d0e3`.
Hasil di bawah berasal dari pengujian rilis v1.2 ini, bukan hitungan yang disalin
dari rilis sebelumnya. Log historis v1.1 dipisahkan di `qa-results/history-v1.1`.

## Hasil akhir

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit Duel Dadu | 30/30 | Rotasi, orientasi ikon, jalur, hasil, skor, timer, reducer |
| Unit regresi sebelumnya | 14/14 | Rute/alias dan validitas 1.500 papan Sudoku |
| Browser Duel Dadu | 10/10 | Responsif, kontrol, hasil, timeout, pertandingan penuh, restart |
| Browser smoke tujuh game | 21/21 | 7 game pada 1440, 390, dan 320 px |
| Browser fungsi/regresi | 20/20 | Game lain, RPS, papan terbesar, bahasa dan favorit |
| Pemeriksaan HTTP | 46/46 | 42 asset dan 4 respons HTTP tambahan |
| Pemeriksaan source lama | 9/9 identik | Enam game lain, Home.jsx, Layout.jsx, arena.css |

Tidak ada uncaught JavaScript exception pada skenario browser akhir yang diuji.

## Verifikasi terhadap video

Tiga giliran yang terlihat dalam video direkonstruksi pada fixture uji dari
jaring-jaring dan simbol papan yang dibaca secara visual. Fixture hanya untuk
tes; permainan normal tetap mengacak papan dan dadu.

| Giliran | Jalur | Sisi bawah / ubin | Hasil dan skor |
| --- | --- | --- | --- |
| Pemain 1 | Bawah, Bawah, Bawah, Kanan | Kertas / Gunting | Kalah; -1 : 0 |
| Pemain 2 | Bawah, Kiri, Bawah | Batu / Gunting | Menang; -1 : 1 |
| Pemain 1 | Bawah, Bawah, Kanan, Atas, Kanan | Batu / Batu | Seri; -1 : 1 |

Tes ini memastikan tengah jaring-jaring menjadi sisi ATAS; langkah-langkah,
sisi bawah, posisi akhir, dan orientasi yang diteruskan cocok dengan urutan
tersebut. Warna UI/video tidak dibandingkan pixel-identik: warna dan layout
Brain Arena dipertahankan sesuai permintaan, dan ikon outline digambar ulang.

Video tidak memperlihatkan akhir pertandingan atau timeout. Target akhir 4 poin
dan penalti timeout -1 dipertahankan dari implementasi lama. Aturan jeda saat
modal/tab tersembunyi dan pilihan jenjang adalah perilaku aplikasi, bukan klaim
bahwa seluruhnya tampak dalam video.

## Rincian pengujian Duel Dadu

Uji unit meliputi identitas setelah empat gulingan, rotasi dan inversnya,
10.000 gulingan acak yang mempertahankan enam sisi dan rotasi ikon valid,
sembilan kombinasi suwit, 400 papan awal acak, larangan keluar batas/reverse,
Undo/Clear, urutan pelipatan, hanya sisi bawah terakhir yang berduel,
input terkunci ketika bergulir, skor negatif, konfirmasi idempoten, timeout,
callback giliran lama, kemenangan 4 poin, reset, dan tidak ada mutasi input reducer.

Sepuluh skenario browser khusus mencakup:

- Universitas pada 320, 390, 768, dan 1440 px: net, 49 ikon SVG, batas kontrol,
  memutar dadu, hasil, dan pergantian ke pemain kedua.
- Kontrol arah/WASD, Backspace, Delete, Enter, larangan arah ilegal, pembatasan
  jumlah langkah, serta fokus tombol utama pada dialog hasil.
- Timer dijeda ketika aturan terbuka, input tidak menembus dialog, timeout -1,
  dan giliran berikutnya dimulai tanpa memindahkan dadu.
- Hasil kalah, menang, seri; skor akhir negatif ditampilkan dengan benar.
- Pertandingan lengkap: mencapai kemenangan dalam tujuh giliran pada seed
  pengujian, lalu restart mereset skor dan kembali ke fase jaring-jaring.
- Navigasi keluar saat animasi berlangsung membatalkan callback yang tertunda.
- Bahasa Inggris dari setup sampai hasil, lalu berganti Indonesia tanpa
  mereset pertandingan.

Pengujian memakai seed deterministik dan, pada skenario timeout, jam virtual.
Sebagian tes interaksi memakai preferensi reduced-motion untuk mempercepat
animasi. Navigasi keluar saat bergulir diuji dengan animasi normal. Pengaturan
ini hanya ada pada harness QA, tidak disisipkan ke aplikasi produksi.

QA awal menemukan fokus native dialog jatuh ke tombol tutup; fokus awal sekarang
dipindah ke tombol konfirmasi. Pengambilan sampel timer pada tes diperbaiki agar
diambil setelah PUTAR mulai, bukan sebelum klik saat timer masih sah berjalan.
Seluruh sepuluh skenario khusus kemudian dijalankan ulang dan lulus.

## Build dan batas pengujian

Build portable ESM: TypeScript 5.8.3, 32 modul aplikasi; runtime React/ReactDOM
produksi 19.2.7 dibawa dari paket sebelumnya. Ini **bukan hasil Vite build yang
terverifikasi**. `npm ci`, build Vite, lint, dan audit dependency tidak diklaim lulus.

Browser Chromium pada lingkungan pengerjaan menolak navigasi localhost.
Pengujian UI memakai Blob URL dan import map in-memory dari build yang sama.
LocalStorage menggunakan fixture memori. HTTP diperiksa terpisah terhadap
server Node lokal: ini **bukan uji browser end-to-end dari origin hosting**.

Belum diverifikasi: Firefox/Safari, HP fisik Android/iOS, persistensi native
lintas reload, sinkronisasi tab nyata, audio secara auditori, aksesibilitas
menyeluruh dengan screen reader, performa produksi, keamanan dependency, dan
seluruh kombinasi level/mode setiap game. Lebar HP di laporan ini merupakan
emulasi viewport Chromium. Tidak ada klaim cakupan menyeluruh semua kemungkinan.

## Menjalankan ulang

```bash
npm test
python tests/browser/duel.py
python tests/browser/smoke.py
python tests/browser/functional.py
```

Tes Node tidak memerlukan dependency npm. Skrip browser memerlukan Python
Playwright dan Chromium. Untuk HTTP, jalankan `node scripts/serve.mjs` dahulu,
lalu `python tests/http.test.py` di terminal lain. Hasil akhir tersedia di
`qa-results/duel-browser/results.json`, `qa-results/browser/`, dan
`qa-results/http-results.json`.
