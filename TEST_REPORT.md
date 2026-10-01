# Laporan pengujian Brain Arena v1.7.0

Tanggal: 1 Oktober 2026.

## Ringkasan

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit seluruh proyek | **70/70 lulus** | game logic, routes, guide data, progression, achievements, missions |
| Achievement | **Lulus** | katalog unik, progress, auto-complete, badge persistence model |
| Mission / Quest | **Lulus** | daily/weekly window, sessions, distinct games, claim key per periode |
| Leaderboard | **Lulus** | overall/per-game local XP board, ranking current player, simulated-rival labeling |
| PWA files | **Lulus** | manifest, icons 192/512, service worker, install UI, portable copy |
| Browser desktop | **Lulus** | Achievements, Missions, Leaderboard, Profile pada 1440 px |
| Browser mobile | **Lulus** | empat halaman progression pada 390 px tanpa horizontal overflow |
| JavaScript runtime | **0 uncaught error** | skenario browser QA v1.7 |
| Build portable | **Lulus** | 48 module source ditranspilasi |
| HTTP checks | **67 lulus** | 63 asset + gzip/security response checks |

## Achievement & Badge

Diverifikasi:
- katalog achievement memiliki ID unik;
- progress completion/XP/level/game/streak dibatasi ke target;
- achievement yang memenuhi syarat dapat ditemukan tanpa membuka ulang achievement yang sudah tersimpan;
- badge terpilih hanya berasal dari achievement yang telah terbuka;
- bonus XP achievement dicatat sebagai XP event non-game.

## Mission / Quest

Diverifikasi:
- quest harian menghitung aktivitas pada tanggal yang benar;
- quest mingguan dimulai Senin dan berakhir Minggu;
- session count dan jumlah game berbeda dihitung dari completion events;
- claim key berubah pada reset harian/mingguan;
- tombol claim menaikkan XP pada QA browser dan state claim tersimpan.

## Leaderboard

Leaderboard v1.7 tidak mengklaim data pemain online. Rival ditampilkan sebagai **simulated rival / rival simulasi**. Ranking pemain sendiri menggunakan Total XP atau XP per game yang tersimpan lokal. Ini mempertahankan fungsi leaderboard pada deployment statis GitHub Pages tanpa backend.

## PWA

Build menyertakan:

```text
manifest.webmanifest
service-worker.js
pwa-192.png
pwa-512.png
apple-touch-icon.png
```

Service worker menggunakan cache versi `brain-arena-v1.7.0`, cache shell saat install, cache asset same-origin ketika dibuka, dan fallback ke `index.html` untuk navigasi offline.

## Perintah pengujian

```bash
npm test
npm run build:portable
```

Hasil unit: **70 lulus, 0 gagal**.

Portable build: **48 module**.

HTTP check dijalankan terhadap `node scripts/serve.mjs`: **67 check lulus**.

## Catatan build

Build Vite standar tidak berhasil diverifikasi di runtime pengerjaan karena instalasi dependency lokal terhenti sebelum binary Vite tersedia. Build portable berhasil dan telah digunakan untuk browser QA. Workflow GitHub Pages tetap memakai dependency yang tercatat di `package-lock.json` melalui `npm ci` dan `npm run build`.

## Batas pengujian

Belum diverifikasi menyeluruh pada perangkat fisik Android/iOS, Safari/Firefox, install prompt seluruh vendor browser, serta perilaku offline setelah eviction cache. Karena local-first, menghapus site data atau memakai perangkat lain akan membuat progres terpisah.
