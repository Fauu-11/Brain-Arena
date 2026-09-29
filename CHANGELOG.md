# 1.2.0 - Gameplay Duel Dadu sesuai referensi, UI Brain Arena tetap

- Perbaikan pemetaan jaring-jaring: tengah menjadi atas dan ujung menjadi bawah.
- Ikon SVG outline tangan menggantikan emoji di semua area Duel Dadu.
- Pelipatan dan gulingan 3D, termasuk rotasi arah gambar pada setiap sisi fisik.
- Jumlah langkah awal diacak; default SMA 20 detik.
- Skor kalah dapat negatif; posisi dan orientasi berlanjut antar pemain.
- State reducer mencegah aksi rangkap, callback giliran lama, dan input saat bergulir.
- Timer/jalur timeout diperbaiki; jeda saat modal, animasi, hasil, dan tab tidak aktif.
- Hasil memakai dialog native dengan fokus tombol konfirmasi.
- Aturan/panduan, tes unit, tes browser, dan build portable diperbarui.
- Tema, layout global, dan keenam komponen game lain tetap dari v1.1.

---

# Changelog

## 1.1.0 - Unified game theme

- Menyatukan tujuh game dengan tema halaman utama melalui GameScreen.
- Menyatukan pemilihan level/mode, tombol, scoreboard, timer, status, dan hasil.
- Menambahkan panduan singkat, strategi, kontrol, dan favorit pada setiap game.
- Mengganti arena gelap Duel Dadu dengan arena terang; warna sisi dadu tetap bermakna.
- Memperbarui papan Prime, Pixel, MnM, Sudoku, area Aritmatika, dan render Kubus.
- Memperbaiki Sudoku 9x9 dan MnM level terbesar pada viewport 320 px.
- Memperbaiki aktivasi keyboard serta label elemen interaktif Pixel/Sudoku.
- Menambahkan builder ESM alternatif dan skrip QA yang bisa dijalankan ulang.
- Aturan/mode/generator/skor dari versi sebelumnya dipertahankan.

## Riwayat versi sebelumnya

# Changelog 1.0.0

## Portal dan desain

Dashboard terang dengan aksen ungu, hero dan ilustrasi SVG; sidebar desktop,
menu mobile, katalog 7 game, filter musim/kategori, pencarian katalog/global,
favorit, riwayat aktivitas lokal, panduan, bahasa ID/EN, bantuan, mode fokus,
serta halaman tidak ditemukan. Semua aksi utama terhubung ke game/fitur nyata.

## Perbaikan

Rute `game-*`, ID asli dan slug disatukan. Favorit dan history divalidasi;
penyimpanan rusak/terblokir ditangani dengan fallback. AudioContext bersama
membuat sakelar suara memengaruhi audio game. Modal memakai dialog native.
Generator Sudoku yang dapat mengembalikan 0 diganti dengan generator solusi
valid dan diuji untuk 4x4, 6x6, 9x9. Sel Sudoku mendapat label keyboard.
Rekor nol detik tidak lagi dianggap rekor kosong ketika membandingkan waktu.
Tombol aturan Duel Dadu di header kini memanggil modal aturan.

## Paket

Source React dan ketujuh komponen game tetap disertakan. Modul game dimuat
secara lazy. CSS tidak lagi meminta Google Fonts. Paket berisi build ESM
portable, preview server Node tanpa dependency, panduan Windows, dan tes Node.
Versi dependency asal dipertahankan. Lihat README dan TEST_REPORT untuk batas
pengujian serta perbedaan build portable dan build Vite standar.
