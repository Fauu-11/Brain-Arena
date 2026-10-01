# Brain Arena v1.13 – Red Sidebar Refresh

Update utama yang sudah diterapkan:

- Warna utama UI diubah menjadi dominan merah.
- Sidebar utama dipertahankan dan disegarkan tampilannya.
- Ditambahkan sidebar rail / collapsed sidebar seperti mockup.
- Hero section dan CTA dibuat mengikuti nuansa merah gelap seperti referensi.
- Topbar, card, tombol, dan aksen progres disesuaikan agar konsisten.
- Theme color PWA diperbarui ke merah.
- Versi aplikasi diperbarui menjadi `1.13.0`.

File utama yang diubah:
- `src/components/Layout.jsx`
- `src/arena.css`
- `src/pages/Feedback.jsx`
- `public/manifest.webmanifest`
- `public/service-worker.js`
- `package.json`
- `package-lock.json`

Catatan:
- Folder `dist/` sengaja tidak disertakan ulang sebagai hasil build baru belum digenerate di lingkungan ini.
- Untuk generate hasil hosting terbaru, jalankan:
  - `npm install`
  - `npm run build`
