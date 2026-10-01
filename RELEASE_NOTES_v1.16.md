# Brain Arena v1.16 - Competitive Polish & Reliability

Brain Arena v1.16 melanjutkan v1.15.1 dengan fokus pada stabilitas data lokal, pengalaman kompetitif, replay, analitik, dan personalisasi akses game. Tidak ada game baru; seluruh 12 game dan progression lama tetap dipertahankan.

## Fitur v1.16

### Automatic Backup & Restore Point
- Maksimal 5 restore point lokal.
- Snapshot otomatis dibuat berkala dengan interval minimum 6 jam.
- Restore point manual tersedia di Settings.
- Ringkasan snapshot menampilkan XP, Ranked Points, jumlah completion, match, dan Season XP.
- Restore point dapat dipulihkan atau dihapus secara individual.
- Backup manager tidak memasukkan dirinya sendiri ke dalam payload sehingga snapshot tidak membesar secara rekursif.

### Replay v2 + Timeline Scrubber
- Timeline range scrubber.
- Skip mundur/maju 5 detik.
- Step action sebelumnya/berikutnya.
- Kecepatan 0.5x, 1x, 2x, 4x.
- Marker Brain Coach, system/focus event, dan event peringatan.
- Ranked integrity badge ditampilkan pada replay.
- Brain Coach v2 review ditampilkan langsung di replay.

### Arena Run v2
- Total score seluruh stage.
- Run Grade.
- Average performance.
- Perfect Stage counter.
- Best Stage highlight.
- Total time dan Arena RP tetap dipertahankan.
- Integrasi langsung ke Custom Arena Builder.

### Brain Coach v2
- Review setelah game dengan fokus latihan spesifik untuk 12 game.
- Membandingkan performa dengan beberapa match terbaru pada game yang sama.
- Mendeteksi pembalikan arah langsung pada input keyboard sebagai sinyal backtracking.
- Review penggunaan hint.
- Next Focus muncul pada Result Screen v2.

### Advanced Performance Analytics
- Filter 7 Hari, 30 Hari, Season, dan All Time.
- Match count, win rate, average grade, average performance, PB improvement, dan Ranked RP.
- Performance trend chart.
- Per-game competitive table berisi sessions, performance, win rate, dan average time.

### Streak & Activity Calendar
- Route `#/activity-calendar` dan alias `#/calendar`.
- Heatmap 91 hari / 13 minggu.
- Current streak, longest streak, active days, dan sessions.
- Penanda Daily Challenge pada heatmap.

### Favorites & Pinned Games v2
- Favorite dan Pin dipisahkan.
- Maksimal 6 pinned games.
- Pin dapat diurutkan naik/turun.
- Urutan Pinned Games dipakai Home dan Smart Sidebar.
- Pinned game pertama menjadi quick action pada compact sidebar.

### Search / Filter v2
- Catalog filter untuk difficulty dan status.
- Status: Favorites, Pinned, Not Played, Completed, dan Personal Best.
- Command Palette memahami kata `hard`, `very hard`, dan `impossible` dan membuka game langsung ke University Arena yang sesuai.

### Ranked Session Integrity
- Ranked session mencatat recovery count, visibility changes, focus losses, dan system timeline events.
- Match History menampilkan Clean Run / Recovered / Focus Changed.
- Replay menampilkan integrity state yang sama.
- Sistem ini adalah integrity marker lokal, bukan anti-cheat server-side.

### UI/UX Polish & Micro Interaction
- Transisi hover/press dibuat konsisten dan lebih subtle.
- Loading state menggunakan skeleton ringan.
- Responsive layout diperbarui untuk analytics, restore point, replay, Arena Run, pinned games, dan activity calendar.
- Reduced Motion tetap dihormati.

## Data Migration
- Data schema naik ke v16.
- Favorit lama digunakan sebagai seed awal Pinned Games (maksimal 4) jika user belum memiliki konfigurasi pin.
- Automatic Backup key diinisialisasi tanpa mereset progress lama.

## Compatibility
- 12 game tetap tersedia.
- XP, Rank, Season, Mastery, Mission, Achievement, Match History, Replay lama, Autosave, Recovery, Goals, Accessibility, Challenge Link, dan Custom Arena tetap kompatibel.
