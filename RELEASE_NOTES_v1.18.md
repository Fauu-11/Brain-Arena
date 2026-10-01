# Brain Arena v1.18.0 — Stability Release

## Tujuan release

v1.18 tidak menambah game baru. Release ini menstabilkan fondasi local-first sebelum pengembangan backend/cloud berikutnya.

## Perbaikan utama

### Progress & storage
- Schema data lokal naik ke v18.
- Backup import bersifat transaksional: data lama disnapshot sebelum replace/merge dan dipulihkan jika penulisan gagal.
- Data Health membuat restore point dan quarantine raw JSON rusak sebelum repair.
- Release rollback v1.17 tetap dipertahankan dan diarahkan ke migrasi v18.

### Runtime & recovery
- React Error Boundary mencatat crash melalui runtime health logger.
- Global `error` dan `unhandledrejection` ikut dicatat secara ringan.
- Error screen menyediakan aksi kembali ke Beranda atau reload aplikasi.
- Runtime health menyimpan hitungan start, issue terakhir, dan clean exit.

### PWA & cache
- Cache utama: `brain-arena-v1.18.0`.
- Runtime cache dipisahkan dan dibatasi maksimal 90 request.
- Navigasi: network-first dengan timeout dan fallback offline.
- Asset statis: stale-while-revalidate.
- Cache Brain Arena versi lama dibersihkan saat service worker baru aktif.
- Update manager mencegah reload ganda dan memeriksa update lagi saat koneksi kembali online.

### UI, responsive & accessibility
- Perbaikan tablet 768–920 px dan mobile 390 px.
- Dukungan safe-area PWA untuk perangkat dengan notch/home indicator.
- Touch target utama diperbesar pada mobile.
- Reduced Motion dan forced-colors/high-contrast diperkuat.
- Long text / diagnostic output diberi overflow wrapping agar tidak memecah layout.

## Catatan deployment
Paket hosting menggunakan portable ESM build yang sudah diverifikasi di environment pengerjaan. Untuk repository GitHub Pages tetap disarankan memakai workflow project: `npm ci` lalu `npm run build`.
