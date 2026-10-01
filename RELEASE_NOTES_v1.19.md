# Brain Arena v1.19.0 — Supabase Readiness

v1.19 menyiapkan fondasi data Brain Arena untuk transisi ke v2.0 + Supabase tanpa mengaktifkan backend online lebih dulu.

## Implementasi

1. **IndexedDB Local Data Layer**
   - Database: `brain-arena-local`
   - Stores: `records`, `sync_queue`, `mutations`, `meta`
   - Memory fallback tersedia jika IndexedDB diblokir browser/context.
   - Data berat lama mulai dimirror ke IndexedDB untuk transisi bertahap.

2. **Repository Layer**
   - `profileRepository`
   - `progressRepository`
   - `matchRepository`
   - `settingsRepository`

3. **Guest Identity**
   - Key: `ba_guest_identity_v1`
   - UUID persisten digunakan sebagai local player identity sebelum Supabase Auth tersedia.

4. **Sync Queue & Mutation Journal**
   - Perubahan localStorage yang relevan dapat dicatat sebagai mutation.
   - Queue bersifat `deferred`; tidak ada request cloud pada v1.19.
   - Mutation journal dibatasi agar tidak bertambah tanpa batas.

5. **Normalized Player Model**
   - Menyatukan profile, progress, matches, records, favorites, pinned, dan settings dalam format migrasi v2.0.

6. **Supabase Migration Export**
   - Export JSON melalui Settings atau `#/cloud-readiness`.
   - Format: `brain-arena-supabase-migration` v1.

7. **Feature Flags**
   - `cloudSync=false`
   - `onlineProfile=false`
   - `globalLeaderboard=false`
   - `social=false`
   - Local readiness flags tetap aktif.

8. **Migration Simulator & Integrity Check**
   - Route baru `#/cloud-readiness`
   - Memeriksa Schema v19, guest identity, IndexedDB, normalized model, sync queue, mutation journal, feature flags, dan repository mirror.

9. **CI / Release Hardening**
   - `npm run check:release`
   - GitHub CI menjalankan release consistency, unit tests, lint, dan build.
   - GitHub Pages deploy juga menjalankan checks sebelum upload `dist`.

## Catatan kompatibilitas

v1.19 belum terhubung ke Supabase. Semua fitur online sengaja tetap OFF. localStorage tetap dipertahankan sebagai compatibility source selama masa transisi, sedangkan IndexedDB menjadi layer lokal baru untuk fondasi v2.0.
