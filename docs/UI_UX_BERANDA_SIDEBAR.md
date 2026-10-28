# Rancangan UI/UX Beranda & Sidebar Brain Arena

Status: Implementasi v1 — beranda, navigasi, hub, serta akses fitur lama sudah diterapkan. Hasil validasi dan batas pengujian tercatat di bagian 9.

## 1. Arah desain

**Konsep: arena latihan yang tenang, mudah dijelajahi, dan cepat dimulai.**

Pertahankan identitas merah, ilustrasi game, tema Light/Dark/System, profil lokal, serta seluruh fitur yang sudah ada. Ubah hierarki dan cara mengaksesnya, bukan menghapus kemampuan aplikasi.

Dasar peninjauan sebelum perubahan:
- `src/pages/Home.jsx`: hero promosi, recovery, Daily Challenge, 14 pintasan progres/fitur, kategori, pin, katalog lengkap, riwayat, dan panduan berada di satu halaman.
- `src/components/Layout.jsx`: 35 tujuan navigasi, belum termasuk daftar game dan pin. Rail compact menampilkan 12 tujuan ditambah pintasan game di footer.
- `src/data/games.js`: tersedia 12 game dalam kategori Matematika, Logika, Memori, dan Strategi.

Target pengalaman:
1. Pengunjung langsung memahami tindakan berikutnya.
2. Sesi tersimpan lebih mudah ditemukan daripada promosi.
3. Katalog lengkap dan pengaturan lanjutan tetap mudah diakses, tetapi tidak memenuhi beranda.
4. Label, status aktif, dan hierarki sama pada sidebar expanded, compact, dan mobile.

## 2. Arsitektur navigasi

### Navigasi utama: lima menu

| Menu | Isi | Tujuan klik |
| --- | --- | --- |
| Beranda | Ringkasan personal dan langkah bermain berikutnya | `home`, sudah tersedia |
| Permainan | Katalog, favorit, pin, kategori, pencarian dan filter | `games`, sudah tersedia |
| Tantangan | Harian, Arena Run/Cup, event, season, leaderboard lokal, builder, dan practice lab | Hub `challenges`, sudah diimplementasikan |
| Progres | Statistik, riwayat, pencapaian, misi, rank, mastery, completion, kalender, dan target | Hub `progress`, sudah diimplementasikan |
| Panduan | Perpustakaan aturan dan strategi | `guides`, sudah tersedia |

Profil dan Pengaturan ditempatkan di bagian bawah sidebar, terpisah dari navigasi bermain.

Hub Tantangan dan Progres adalah halaman ringkasan dengan tautan ke halaman yang sudah tersedia. Bukan penggantian sistem progres atau perubahan perhitungan skor. Jangan mengarahkan menu ke route baru sebelum hub tersebut tersedia.

### Penempatan fitur lama

- **Permainan:** `games`, `favorites`, dan pengelolaan pinned games. Favorit dan Pin tidak digabung: Favorit adalah koleksi, Pin adalah akses cepat yang diurutkan.
- **Tantangan:** `daily`, `daily-archive`, `arena-run`, `arena-cup`, `events`, `season`, `leaderboard`, `arena-builder`, `practice-lab`. Builder/Lab masuk bagian “Lanjutan”; arsip berada di dalam Harian.
- **Progres:** `activity`, `history`, `replay`, `achievements`, `missions`, `rank`, `mastery`, `completion`, `statistics`, `activity-calendar`, `goals`. Replay dibuka dari riwayat, bukan menu utama tersendiri.
- **Profil:** `profile`, `customize`, `profiles`, `showcase`, `share-result`. Kartu hasil tetap dibuka dari hasil/riwayat yang relevan.
- **Pengaturan:** `settings`, `controls`, `offline`, `save-slots`, `storage-center`, `data-health`, `diagnostics`, `cloud-readiness`, `feedback`.
- Diagnostics dan Cloud Readiness berada dalam bagian “Alat lanjutan”. Beri keterangan bahwa cloud sync belum tersedia, bukan tombol yang terkesan mengaktifkan sinkronisasi.
- Link challenge dan tautan lama tetap bekerja. Perubahan navigasi tidak mengubah URL game yang sudah ada.

### Aturan menu aktif dan badge

- Saat membuka game, tips dari katalog, atau Favorit, menu induk mengikuti konteks yang jelas: game → Permainan; perpustakaan tips → Panduan.
- Daily, Run, Cup, Event, Season, dan leaderboard mengaktifkan Tantangan.
- Statistik, replay, misi, achievement, dan rank mengaktifkan Progres.
- Tandai item aktif dengan latar aksen lembut, bobot teks, indikator posisi, dan `aria-current="page"`; jangan mengandalkan merah saja.
- Badge hanya untuk tindakan: misalnya hadiah misi siap diklaim. Jumlah total 12 game bukan badge notifikasi.
- Badge angka disertai konteks aksesibel, misalnya “Progres, 2 hadiah siap diklaim”.

## 3. Sidebar desktop

### Expanded

```text
┌──────────────────────────┐
│ [Logo] Brain Arena   [‹] │
│                          │
│ ▍ Beranda                │
│   Permainan              │
│   Tantangan              │
│   Progres            [2] │
│   Panduan                │
│                          │
│ DIPIN             Kelola │
│   Hitung Kubus           │
│   Duel Dadu              │
│   Memory Matrix          │
│                          │
│                          │
│ ──────────────────────── │
│ Pengaturan               │
│ [Avatar] Nama pemain     │
│          Level 8 · Lokal │
└──────────────────────────┘
```

Angka dan game pada wireframe adalah contoh, bukan data pemain sebenarnya.

- Lebar awal 240 px; maksimal tiga game dipin dalam sidebar. “Kelola” membuka pengelolaan pin di Permainan, bukan menghapus pin selebihnya.
- Urutan pin memakai data yang sudah tersimpan. Jika belum ada pin, bagian DIPIN tidak ditampilkan; bantuan pin tersedia di katalog.
- Pindahkan tombol urutkan/lepas pin ke mode Kelola agar sidebar tidak penuh kontrol kecil.
- Pengaturan dan profil tidak ikut tenggelam dalam daftar menu yang panjang. Area menu boleh scroll jika tinggi layar terbatas.
- Hapus kartu motivasi/promosi dari sidebar. Bantuan dan pemasangan PWA dipindahkan ke menu yang sesuai.
- Pilihan expanded/compact tetap tersimpan. Shortcut Ctrl+Shift+S dipertahankan.

### Compact

```text
┌────────┐
│ [Logo] │
│        │
│ [Home] │
│ [Grid] │
│ [Bolt] │
│ [Chart]│
│ [Book] │
│        │
│        │
│ [Gear] │
│ [User] │
└────────┘
```

- Lebar 72 px; lima ikon utama, Pengaturan, dan Profil. Tidak ada daftar 12 ikon maupun tombol game tanpa label yang ambigu di footer.
- Ikon sama dengan versi expanded. Tooltip tampil pada hover **dan keyboard focus**, dapat ditutup dengan Escape, dan bukan satu-satunya nama aksesibel.
- Tombol membuka hub/halaman langsung; jangan membuat submenu yang hanya bisa dibuka dengan hover.
- Kontrol expand berada di topbar agar rail tidak menambah banyak tombol.
- Warna container, ikon, badge, divider, hover, aktif, dan focus menggunakan token tema yang sama dengan sidebar expanded.

## 4. Beranda desktop

### Pemain kembali dengan sesi tersimpan

```text
┌────────────┬───────────────────────────────────────────────┐
│            │ [Cari game, halaman, atau aksi…] [Notif] [ID] │
│ SIDEBAR    ├───────────────────────────────────────────────┤
│            │ Halo, Nara. Siap melanjutkan?                  │
│            │ Level 8 · Streak 3 hari                        │
│            │                                               │
│            │ ┌────────────────────────┐ ┌────────────────┐ │
│            │ │ LANJUTKAN SESI         │ │ HARIAN         │ │
│            │ │ Hitung Kubus           │ │ Memory Matrix  │ │
│            │ │ SMP · Practice         │ │ Bonus +… XP    │ │
│            │ │ Tersimpan … lalu       │ │                │ │
│            │ │ [Lanjutkan sesi →]     │ │ [Lihat harian] │ │
│            │ └────────────────────────┘ └────────────────┘ │
│            │                                               │
│            │ Pilihanmu                    [Kelola pin →]   │
│            │ [Game dipin] [Game dipin] [Game dipin]          │
│            │                                               │
│            │ Pilih permainan           [Lihat semua 12 →]   │
│            │ [Semua] [Matematika] [Logika] [Memori] […]      │
│            │ [Kartu game] [Kartu game] [Kartu game]          │
│            │ [Kartu game] [Kartu game] [Kartu game]          │
│            │                                               │
│            │ Progresmu                  [Lihat progres →]   │
│            │ [Level & XP] [Streak] [Misi siap diklaim]       │
│            │                                               │
│            │ Belum paham aturannya?        [Buka panduan]   │
└────────────┴───────────────────────────────────────────────┘
```

Satu tombol filled dominan pada area tindakan utama; tindakan pendamping menggunakan outline atau text link. Ini bukan larangan adanya tombol utama pada tiap kartu game, melainkan pembatasan persaingan perhatian di bagian atas halaman.

### Urutan konten

1. **Sapaan ringkas:** nama jika tersedia, level, streak. Tanpa deretan metrik yang belum dibutuhkan.
2. **Aksi utama kontekstual:** sesi tersimpan, Harian, atau pilihan bermain baru sesuai aturan di bawah.
3. **Pilihanmu:** maksimal tiga pin; jika tidak ada, tiga game terakhir dibuka. Sembunyikan jika keduanya belum tersedia.
4. **Pilih permainan:** maksimal enam kartu dengan kategori sederhana dan tautan katalog lengkap.
5. **Progresmu:** maksimal tiga ringkasan yang bisa diklik. Statistik rinci dan 14 pintasan lama pindah ke hub terkait.
6. **Panduan:** callout pendek di bagian bawah, bukan banner promosi besar kedua.

### Aturan aksi utama

| Kondisi | Tindakan utama | Pendamping |
| --- | --- | --- |
| Ada recovery valid | Lanjutkan sesi | Harian, jika belum selesai |
| Tidak ada recovery; Harian belum selesai; pemain sudah pernah bermain | Mulai tantangan harian | Jelajahi permainan |
| Harian selesai; pemain sudah pernah bermain | Pilih permainan berikutnya | Status “Harian selesai ✓” dan tautan detail |
| Pemain baru | Coba Hitung Kubus | Jelajahi 12 permainan |

- “Coba Hitung Kubus” membuka pengaturan game yang sudah ada; tidak diam-diam memulai timer atau menentukan jenjang pemain.
- Penentuan pemain baru menggunakan riwayat penyelesaian/progres lokal, bukan sekadar apakah nama profil terisi. Kunjungan halaman saja bukan bukti pernah bermain.
- Sesi recovery valid harus merujuk ke game yang tersedia dan data yang dapat dipulihkan. Jika gagal, tampilkan penjelasan dan pilihan memulai baru.
- Dalam recovery, tampilkan jenjang, mode, serta waktu simpan jika datanya tersedia. Jangan menyamakan durasi bermain dengan waktu terakhir disimpan.
- Seed/code dipindahkan ke detail sesi. “Buang sesi” masuk menu opsi dan memerlukan konfirmasi; tidak ditempatkan sejajar sebagai pesaing tombol Lanjutkan.
- Jangan menampilkan kembali tombol “Mulai harian” sebagai tugas belum selesai setelah bonus harian diklaim.

### Pemain baru

- Hero singkat dengan judul “Mulai latihan pertamamu.” dan deskripsi satu kalimat.
- Pertahankan ilustrasi, tetapi tidak sampai mendorong pilihan game jauh di bawah layar.
- Ringkas jaminan menjadi “Gratis · Tanpa akun · Progres lokal”, tanpa tiga kartu statistik promosi tersendiri.
- Ganti panel progres kosong dengan penjelasan singkat: “Selesaikan satu permainan untuk mulai mencatat progresmu.”
- Jangan menampilkan angka nol berulang-ulang atau rekomendasi yang mengklaim sudah memahami kemampuan pemain.

### Kartu game dan filter

- Isi: ilustrasi, nama, kategori, deskripsi satu baris, mode yang akurat, tombol Main, serta menu simpan.
- Main selalu membuka setup, bukan menyalakan timer langsung dari beranda.
- Favorit/Pin mempunyai label dan status terpilih; jangan menaruh dua ikon kecil tanpa penjelasan di semua kartu.
- Kesulitan umum game tidak disamakan dengan jenjang SD/SMP/SMA/Universitas. Label dan kontrolnya harus dibedakan.
- Jangan menampilkan estimasi durasi sebelum tersedia data yang mendukungnya.
- Beranda cukup memiliki filter kategori. Pencarian katalog, season, kesulitan, dan status lengkap berada di Permainan.
- Jika suatu kategori punya kurang dari enam game, tampilkan jumlah sebenarnya; jangan menambah kartu duplikat.
- Kartu beranda dipilih secara deterministik dari metadata, pin, dan riwayat lokal. Tidak perlu sistem AI baru.

## 5. Mobile dan layar menengah

```text
┌────────────────────────────┐
│ [Menu] Brain Arena [Cari]   │
│                      [Notif]│
│                            │
│ Halo, Nara                 │
│ Level 8 · Streak 3 hari     │
│                            │
│ LANJUTKAN SESI             │
│ Hitung Kubus · SMP          │
│ [Lanjutkan sesi →          ]│
│                            │
│ Harian · Memory Matrix     │
│ Bonus +… XP    [Lihat →]    │
│                            │
│ Pilihanmu                  │
│ [Game]                     │
│ [Game]                     │
│                            │
│ Pilih permainan [Semua →]  │
│ [Semua][Logika][Memori] …   │
│ [Kartu game               ]│
│ [Kartu game               ]│
│                            │
│ Progresmu                  │
│ [Level] [Streak] [Misi]     │
└────────────────────────────┘
```

- **Tahap pertama tetap menggunakan drawer navigasi yang sudah ada**, bukan menambahkan bottom navigation sekaligus. Tombol Menu membuka lima tujuan utama, pin, Pengaturan, dan Profil dengan label teks.
- Drawer menutup setelah memilih tujuan; fokus kembali dengan benar setelah ditutup; Escape dan tombol Tutup tersedia.
- Usulan breakpoint: ≥1200 px expanded secara default; 801–1199 px compact secara default jika belum ada preferensi tersimpan; ≤800 px drawer. Preferensi eksplisit pengguna tetap dihormati di desktop/tablet.
- Susunan hero dua kolom hanya saat ruang cukup. Di mobile, aksi utama berada di atas kartu Harian.
- Kartu game satu kolom pada layar sempit; dua kolom hanya jika judul, deskripsi, dan tombol tetap terbaca. Jangan mengecilkan font demi mempertahankan grid.
- Kategori dapat scroll horizontal, tetapi urutan konten utama tidak bergantung pada carousel.
- Pastikan kontrol tidak tertutup safe-area, keyboard, dialog, atau banner pembaruan PWA.
- Bottom navigation dapat dievaluasi terpisah setelah alur mobile ini diuji; bukan bagian wajib rancangan awal.

## 6. Pedoman visual dan aksesibilitas

- Merah = aksi utama/status aktif; surface netral = konten. Warna sukses, peringatan, dan kesalahan tetap punya identitas terpisah.
- Gunakan token semantik yang sama untuk Light, Dark, dan System; jangan menambahkan warna light langsung pada rail atau dialog.
- Ukuran awal: body 16 px, menu 14–15 px, teks sekunder 13–14 px, heading section 20–24 px, judul utama 28–36 px. Ikuti zoom dan preferensi teks besar.
- Target sentuh kontrol umum minimal 44 × 44 px. Ini tidak berarti semua petak puzzle harus dipaksa menjadi ukuran tersebut.
- Grid spacing 8 px; padding kartu 20–24 px desktop, 16–20 px mobile; jarak antarsection 24–32 px.
- Radius konsisten: kontrol 10–12 px, kartu 16 px. Hindari shadow pada setiap lapisan bertumpuk.
- Kontras teks normal minimal 4.5:1; elemen UI/fokus yang relevan minimal 3:1.
- Fokus keyboard terlihat di kedua tema. Status tidak disampaikan melalui warna saja.
- Animasi singkat dan opsional; hormati reduced motion.
- Gunakan istilah Indonesia secara konsisten saat bahasa ID dipilih: misalnya “Dipin”, “Riwayat”, “Tantangan Harian”. Nama game dan brand boleh tetap.

## 7. State yang wajib dirancang

| State | Perilaku |
| --- | --- |
| Loading | Skeleton pada area yang sedang memuat; jangan mengganti seluruh halaman dengan flash light |
| Tanpa pin/riwayat | Hilangkan Pilihanmu, tanpa slot kosong besar |
| Filter tidak cocok | Pesan jelas dan Reset kategori/filter |
| Recovery tidak dapat dipulihkan | Jelaskan kegagalan; beri opsi mencoba lagi atau mulai baru dengan konfirmasi yang sesuai |
| Harian selesai | Tanda selesai dan informasi bahwa bonus sudah diklaim |
| Tidak ada hadiah misi | Tidak ada badge notifikasi; ringkasan tetap dapat dibuka |
| Storage tidak tersedia | Peringatan persisten bahwa progres hanya bertahan pada sesi tab |
| Offline | Jelaskan konten yang benar-benar tersedia; jangan menjanjikan semua game offline sebelum cache siap |
| Cloud belum aktif | Label “Progres tersimpan di perangkat ini”; jangan memakai indikator sinkronisasi palsu |

## 8. Tahapan implementasi dan kriteria penerimaan

### Tahap A — struktur navigasi
- Buat hub Tantangan dan Progres dengan tautan ke route lama.
- Ubah sidebar expanded, rail compact, drawer, dan penentuan menu aktif sebagai satu perubahan terkoordinasi.
- Pastikan seluruh fitur lama tetap dapat dicapai lewat hub, profil, pengaturan, atau command palette.

### Tahap B — hierarki beranda
- Pindahkan recovery/aksi kontekstual ke bagian teratas.
- Ringkas hero, gabungkan pin/recent menjadi Pilihanmu, dan tampilkan preview katalog.
- Pindahkan pintasan progres yang panjang ke hub tanpa menghapus data.

### Tahap C — visual dan validasi
- Terapkan typography/spacing/tokens secara konsisten.
- Uji dengan pemain baru, pemain kembali, recovery valid/rusak, dan Harian selesai.
- Uji expanded/compact/drawer, keyboard, zoom 200%, reduced motion, dan pergantian tema secara langsung.
- Uji viewport 360, 390, 768, 820, 1024, dan 1440 px, serta tinggi layar desktop 600 px.

Kriteria penerimaan:
1. Menu utama konsisten berjumlah lima dan satu menu induk aktif pada halaman turunannya.
2. Pemain kembali dengan recovery dapat menemukannya tanpa melewati hero promosi besar.
3. Tidak ada horizontal overflow pada layout utama; scroller kategori dikecualikan secara sengaja.
4. Tidak ada panel light yang tidak disengaja pada tema Dark/System-dark, termasuk state hover, loading, dan drawer.
5. Semua tujuan lama tetap dapat ditemukan dan deep link tetap valid.
6. Data progres, pin, favorit, challenge seed, dan preferensi tema/sidebar tidak terhapus karena perubahan presentasi.
7. Pengunjung dapat menyebutkan cara mulai bermain, melanjutkan sesi, dan membuka progres dalam uji tugas sederhana. Waktu penyelesaian diukur sebelum/sesudah; belum ada klaim peningkatan terukur.

Di luar lingkup rancangan ini: implementasi cloud sync, perubahan aturan/algoritma game, penambahan game, atau perombakan database.

## 9. Implementasi dan validasi

- `src/data/navigation.js` menjadi sumber menu, tujuan command palette, dan pemetaan induk aktif. Alias URL lama dipertahankan.
- `src/navigation.css` menerapkan expanded 240 px, compact 72 px, serta drawer hingga 800 px. Preferensi manual tetap dihormati; nilai full yang dibuat otomatis oleh migrasi lama bukan pilihan manual.
- `src/pages/Home.jsx` dan `src/dashboard.css` memisahkan dashboard ringkas dari katalog lengkap. Favorit/pin tetap terpisah dalam disclosure Simpan; pengurutan seluruh pin berada di Permainan.
- `src/utils/homeDashboard.js` menguji status pemain berdasarkan sesi selesai, bukan kunjungan atau XP onboarding. Recovery valid didahulukan dan waktu simpan memakai timestamp, bukan durasi bermain.
- Konfirmasi pembuangan sesi mempertahankan XP/hasil selesai dan mengembalikan fokus ke aksi utama. Recovery yang kodenya tidak sesuai diberi penjelasan dan opsi pembuangan dengan konfirmasi.
- Hub Tantangan/Progres serta grup akses Profil/Pengaturan membuka fitur yang sudah ada; tidak menambah sinkronisasi cloud atau mengubah aturan game.

Validasi otomatis:

```sh
npm run lint
npm test
npm run build
node tests/browser/dashboard.mjs --playwright=<path-ke-playwright/index.mjs>
node tests/browser/theme.mjs --playwright=<path-ke-playwright/index.mjs>
node tests/browser/mnm.mjs --playwright=<path-ke-playwright/index.mjs>
```

Playwright adalah alat uji opsional, bukan dependensi runtime baru. Jalankan build sebelum tes browser. Tambahkan `--screenshots` pada tes dashboard jika ingin menghasilkan screenshot di `qa-results/`.

- Hasil akhir: 247 unit test lulus; lint tanpa warning/error; build produksi lulus; tes dashboard dan regresi tema browser lulus.
- Unit test mencakup status beranda, preview/pin, timestamp recovery, route/alias, dan pemetaan menu aktif.
- Tes dashboard mencakup pemain baru/kembali, daily selesai, seed harian, recovery valid/rusak, konfirmasi, pin/favorit, keyboard/tooltip, drawer, preferensi sidebar, dan horizontal overflow.
- Matriks browser: Light/Dark/System-dark, ID/EN, viewport 360/390/768/820/1024/1440 px, serta tinggi 600 px. Reflow ekuivalen zoom 200% desktop diuji melalui viewport 720 CSS px; ini bukan pengujian zoom native seluruh browser atau pembaca layar manusia.
- Regresi tema memeriksa 53 rute, hover rail, dialog, drawer, persistensi, dan perubahan tema sistem secara langsung. Setelah perbaikan MnM, seluruh gameplay ikut diuji tanpa pengecualian. Keping MnM terbuka yang sengaja putih tetap dianggap state permainan, bukan kebocoran panel tema light.
- Perbaikan MnM mengambil jumlah pasangan dari konfigurasi, memulai AI setelah perubahan giliran diterapkan, dan membatalkan aksi tertunda saat restart/keluar/timeout. Tes browser khusus mencakup keenam tingkat, duel lokal, pasangan dan skor AI, geser otomatis, kemenangan, main lagi, timeout, serta pembatalan callback saat restart.
- Tes Python legacy `tests/browser/v116_home.py` diperbarui mengikuti katalog baru tetapi belum dijalankan; validasi browser memakai Playwright JavaScript di atas.
- Screenshot desktop/mobile Light/Dark diperiksa secara visual. Uji kegunaan dengan pemain sungguhan, waktu penyelesaian tugas sebelum/sesudah, dan audit pembaca layar tetap belum dilakukan; tidak ada klaim peningkatan terukur.
