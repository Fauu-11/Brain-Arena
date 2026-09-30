# Changelog

## 1.4.0 — Maze Escape + Memory Matrix

- Menambahkan Maze Escape dan Memory Matrix sebagai game ke-9 dan ke-10.
- Menambahkan Musim 3 dan membuat filter musim beranda dinamis dari katalog.
- Maze Escape: perfect-maze generator, Arrow/WASD, D-pad mobile, timer, langkah, pause, efisiensi, dan rekor waktu.
- Memory Matrix: fase menghafal/recall, ronde progresif, tiga nyawa, skor, dan rekor skor lokal.
- Mode Universitas pada kedua game memiliki **Hard, Very Hard, dan Extreme**.
- Maze Universitas: 18×18, 24×24, dan 32×32.
- Memory Matrix Universitas: 6×6, 7×7, dan 8×8 dengan preview makin singkat.
- Menambahkan ikon SVG, artwork, panduan singkat, tips, pencarian, favorit, riwayat, dan record activity untuk dua game baru.
- Menambahkan unit test generator maze dan pola Memory Matrix serta QA browser desktop/mobile.
- Total katalog menjadi 10 game.

## 1.3.0 — Minesweeper

- Menambahkan Minesweeper sebagai game ke-8 Brain Arena.
- Empat jenjang: 9×9/10, 12×12/20, 16×16/40, dan 30×16/99 ranjau.
- First-click protection dan prioritas area aman 3×3.
- Flood reveal untuk petak kosong dan chord pada angka terbuka.
- Klik kanan, long-press, dan Mode Bendera untuk kontrol mobile.
- Timer, pause, restart, hasil menang/kalah, dan rekor lokal per jenjang.
- Papan ahli memakai scroll internal sehingga tidak menimbulkan overflow halaman.
- Ikon SVG ranjau/bendera dan artwork baru mengikuti tema Brain Arena.
- Minesweeper masuk pencarian, favorit, riwayat, panduan, tips, dan rekor aktivitas.
- Jumlah game/panduan pada UI dibuat dinamis dari katalog.
- Menambahkan unit test dan browser smoke khusus Minesweeper.
- Menyertakan workflow `.github/workflows/deploy.yml` untuk GitHub Pages.

## 1.2.0 — Duel Dadu sesuai referensi video

- Gameplay Duel Dadu disesuaikan dengan referensi video.
- Pemetaan jaring-jaring diperbaiki: tengah menjadi sisi atas, ujung menjadi bawah.
- Ikon SVG outline gunting, batu, kertas menggantikan emoji.
- Posisi/orientasi dadu diteruskan antar pemain dan skor kalah dapat negatif.
- Timer, hasil duel, pause, dan state reducer diperkuat.

## 1.1.0 — Unified game theme

- Menyatukan tujuh game awal dengan tema halaman utama Brain Arena.
- Menyatukan hero, setup, scoreboard, timer, panduan, strategi, dan hasil.
- Memperbaiki layout mobile Sudoku, Match & Mix, dan game lain.

## 1.0.0 — Portal Brain Arena

- Dashboard, sidebar, katalog, pencarian, filter, favorit, aktivitas, panduan,
  bahasa ID/EN, mode fokus, audio global, dan tujuh game awal.
