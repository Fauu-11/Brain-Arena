# Changelog

## v1.18.0 — Stability Release

- Added transactional backup import with rollback on partial storage-write failure.
- Added runtime health tracking for app starts, clean exits, React errors, global errors, and unhandled promise rejections.
- Added safer Schema v18 migration markers and release rollback metadata.
- Added corrupt-JSON quarantine before Data Health repair removes broken Brain Arena entries.
- Hardened PWA caching with separate versioned core/runtime caches, bounded runtime cache size, network-first navigation, and stale-while-revalidate static assets.
- Improved PWA update flow to avoid duplicate reloads and retry update checks when connectivity returns.
- Upgraded System Diagnostics with Data Health and Runtime Health summaries.
- Improved Error Boundary recovery actions.
- Added mobile/tablet safe-area, touch-target, overflow, reduced-motion, and forced-colors accessibility polish.
- Updated app version, manifest metadata, theme color, local data schema, and PWA cache to v1.18.0.

## v1.17.0 - Player Experience & Release Hardening

- Added Multi Local Profile with isolated local progress slots and profile switching.
- Added Player Showcase with featured game, result, rank, streak, mastery, and badge display.
- Added Shareable Result Card with browser-generated PNG and Web Share support.
- Added Arena Cup, a seven-stage local tournament bracket from Quarterfinal to Final.
- Added Practice Lab drills for all 12 games, always launched in Practice mode.
- Added named Save Slots with create, overwrite, rename, restore, delete, and export actions.
- Added Storage Optimization Center for replay/history/backups/recovery/PWA-cache cleanup.
- Added System Diagnostics v3 and persisted last-crash reports.
- Added Gamepad bridge for D-Pad/stick and primary action keyboard mapping.
- Added release migration safety snapshot and rollback support.
- Migrated local data schema to v17 and updated PWA cache to `brain-arena-v1.17.0`.

## v1.16.0 - Competitive Polish & Reliability

- Added Automatic Backup & Restore Point with up to 5 local snapshots.
- Added Replay v2 timeline scrubber, 5-second jumps, 0.5x/1x/2x/4x playback and event markers.
- Upgraded Arena Run with scorecard, run grade, best stage and perfect-stage counters.
- Added Brain Coach v2 post-game reviews and game-specific next-focus guidance.
- Added Advanced Performance Analytics filters and competitive per-game metrics.
- Added 91-day Streak & Activity Calendar.
- Added Favorites & Pinned Games v2 with separate pin state and reorder controls.
- Added catalog Search / Filter v2 and University difficulty parsing in Command Palette.
- Added local Ranked Session Integrity markers for recovery and visibility changes.
- Added responsive UI polish and micro interactions.
- Migrated local data schema to v16 without resetting existing progression.
- Updated app version and PWA cache to `1.16.0`.

## v1.15.1 - Sharing, Stability & Onboarding

- Added Challenge Link & QR route for seeded challenges.
- Added Custom Arena Builder for 3-12 selected games with mode, level, university difficulty, and order controls.
- Added first-time onboarding tour with one-time welcome XP.
- Added Data Health & Repair with restore points and invalid Brain Arena JSON cleanup.
- Added 30-day Daily Challenge Archive; archive replay does not extend the current Daily Streak.
- Added Accessibility 2.0: color vision modes, enhanced focus, screen reader hints, and reduced timer pressure.
- Added Offline Content Manager backed by lazy module prefetch + existing service-worker caching.
- Upgraded feedback diagnostics to include seed/mode/difficulty/PWA/last actions while excluding local-storage contents.
- Added Personal Goal System for sessions, XP, Ranked matches, and Daily completions.
- Added v15 data migration defaults for new local-first features.
- Updated PWA cache and app version to `1.15.1`.
- Added v1.15 utility/unit QA and responsive browser QA.

## v1.13.1 - Player Feedback & Suggestions
- Added a dedicated **Feedback & Saran** page at `#/feedback` with Indonesian and English copy.
- Added **Feedback & Saran** to the desktop sidebar and the shared mobile navigation drawer.
- Added feedback categories for feature suggestions, bugs, gameplay, UI/UX, content/guides, and other topics.
- Added optional game/area targeting, 1-5 experience rating, subject, detailed message, player name, and optional reply email.
- Added optional lightweight diagnostics: Brain Arena version, viewport size, browser user agent, interface language, online state, and source route.
- Added a privacy reminder that players should not submit passwords, tokens, identity numbers, or other sensitive information.
- Added local submission receipts so the player can see recent messages sent from the current device without storing the message body locally.
- Added validation, honeypot anti-spam field, sending/success/error states, and duplicate-click protection while a request is in flight.
- Added a static-host-compatible AJAX form relay to deliver feedback to the developer while keeping the developer address out of the visible interface.
- Updated the PWA cache to `brain-arena-v1.13.1` and added a Feedback app shortcut.
- Added v1.12 unit tests and responsive browser QA at 1440 px and 390 px.

## v1.11.0 - Competitive Arena, Seed Challenges & Replay
- Added deterministic **Seed & Challenge Code** support across all 12 games so the same game/code combination can reproduce the same random sequence.
- Added **Practice / Ranked** setup on every game, with Ranked RP progression and a two-hint Brain Coach limit.
- Added **Arena Run / Tournament** formats for 3, 5, 8, or all 12 unique games with per-stage challenge codes and aggregate results.
- Added **Match History** with up to 300 local competitive records, filters, level metadata, performance, RP, PB, seed, and replay links.
- Added an **Action Replay** viewer with click/key/hint timeline, Play/Pause, previous/next, and 1x/2x/4x playback speed.
- Added per-game/per-level **Personal Best / Ghost** timing and Result Screen PB delta.
- Added bilingual **Brain Coach / Smart Hint** banks for all 12 games.
- Added **Performance Rating** from S through D and integrated it with Ranked RP calculation.
- Added **Game Completion** tracking for SD, SMP, SMA, University Hard, Very Hard, and Impossible across 12 games (72 targets).
- Extended the competitive HUD with mode, timer, Ghost PB, Challenge Code, Arena Run stage, and Brain Coach quota.
- Added new navigation/routes for Arena Run, Match History, Replay, and Game Completion.
- Updated Arena Rating to include Ranked RP contribution.
- Updated PWA cache, manifest shortcuts, backup metadata, README, and QA coverage to v1.11.0.

## v1.10.0 - Random Arena, Impossible Mode & Random Maze Endpoints
- Standardized **University Arena Mode** across all 12 games with exactly **Hard, Very Hard, and Impossible**.
- Renamed the active University label `Extreme` to `Impossible`; legacy `extreme` data is normalized where needed for compatibility.
- Audited every game so a new run creates fresh randomized content instead of replaying one fixed board/question set.
- Maze Escape now randomizes both the perfect-maze layout and the START/EXIT perimeter cells; START is no longer pinned to top-left and EXIT is no longer pinned to bottom-right.
- Added distinct University Arena scaling to Blitz Aritmatika, Perburuan Prima, Digit Piksel, Match & Mix, Hitung Kubus, Duel Dadu, Sudoku Buta, and Minesweeper.
- Expanded University Minesweeper through 24×36 / 240 mines, Hitung Kubus through 7×7, and Match & Mix through 45 randomized pairs on Impossible.
- Updated guides, quick-help text, adaptive difficulty naming, record activity lookup, and mobile copy for Impossible mode.
- Added v1.10 unit coverage for Maze endpoint randomization and source-level checks that all 12 games expose the University Arena selector.
- Added responsive browser QA for all 12 University Arena selectors plus Impossible-mode smoke coverage at 390 px.
- Updated PWA cache and progress backup metadata to v1.10.0.

## v1.9.0 - Season, Events, Mastery, Accessibility & 12 Games
- Added Season System with the Mind Explorer season, Season XP, season levels, six reward milestones, and one-time account-XP claims.
- Added weekly Event System rotating Logic, Memory, Mathematics, and Strategy categories with +50% base-session XP for eligible games.
- Added per-game Mastery XP, mastery levels, six mastery tiers, and a dedicated 12-game Mastery dashboard.
- Added Adaptive Difficulty recommendations based on completions and per-game mastery while preserving player choice.
- Added Settings & Data with System/Light/Dark themes, reduced motion, high contrast, larger text, and local persistence.
- Added safe Export/Import Progress using a versioned JSON backup with an allowlist of Brain Arena storage keys.
- Upgraded every shared Solo/Multi result card to Result Screen v2 with account XP breakdown, Event bonus, Mastery XP, Season XP, and level-up feedback.
- Added Nonogram with 5×5 through 20×20 puzzles, row/column clues, Fill/X modes, desktop right-click, mobile controls, and clue-consistent solution validation.
- Added 2048 with standard 4×4 merging, Arrow/WASD/swipe/D-pad controls, score/moves, and targets from 128 through University Extreme 4096.
- Expanded the catalog, guides, tips, home filters, navigation, achievements exploration target, profile counters, and statistics from 10 to 12 games.
- Updated PWA cache to `brain-arena-v1.9.0` and refreshed app shortcuts.
- Improved mobile Season filter sizing and large Nonogram boards with local horizontal scrolling to prevent page-level overflow.
- Added v1.9 unit and browser QA coverage.

## v1.8.0 - Arena Rank, Profile Customization & Advanced Statistics
- Preserved v1.7 Achievement & Badge, Daily/Weekly Missions, Leaderboard, and PWA without duplicating those systems.
- Added Arena Rating with 17 tiers from Bronze III through Grandmaster.
- Added transparent Arena Rating breakdown from XP, completions, badges, best Daily Streak, and explored games.
- Added Profile Customization with 8 avatars, 6 frames, 6 player titles, and 4 banner styles.
- Added progression-based customization unlock rules for levels, ranks, badges, streaks, sessions, exploration, and selected game milestones.
- Integrated the selected avatar/frame into Profile, Home, sidebar, top bar, and local Leaderboard player rendering.
- Added Advanced Statistics with 7-day session/XP charts, 28-day activity heatmap, category distribution, exploration, activity streak, and per-game performance.
- Added routes and Indonesian aliases for Rank, Customization, and Statistics.
- Updated the PWA cache to `brain-arena-v1.8.0` and added a Player Statistics shortcut.
- Added unit tests and responsive browser QA for all v1.8 progression pages.

## v1.7.0 - Achievements, Missions, Leaderboard & PWA
- Added 12 automatic achievements with equippable profile badges and one-time XP rewards.
- Added Daily and Weekly Mission / Quest pages with progress tracking and claim-once XP rewards.
- Added an offline practice leaderboard for overall XP and per-game XP, clearly labeled with simulated rivals so it works without a backend.
- Added profile and home shortcuts for achievements, missions, and leaderboard.
- Added PWA manifest, 192/512 icons, install controls, service worker caching, offline navigation fallback, and app shortcuts.
- Added bilingual routes and navigation for `#/achievements`, `#/missions`, and `#/leaderboard` plus Indonesian aliases.
- Extended local progression migration with completion events so new quests can track daily/weekly activity without changing existing game rules.
- Added progression tests and responsive browser QA for desktop 1440 px and mobile 390 px.

## v1.6.0 - Daily Challenge & Player Progression
- Added a deterministic Daily Challenge that rotates one Brain Arena game every local calendar day.
- Completing the featured game once per day awards +150 bonus XP and extends the daily streak.
- Added XP progression: +60 XP for each completed session and +25 XP for the first completion of the day.
- Added 99-level progression with progressive XP requirements and rank titles.
- Added an editable local player profile with level progress, total XP, session count, game completion stats, streaks, and recent XP history.
- Added Daily Challenge and Player Profile navigation, home dashboard cards, and compact level status in the top bar/sidebar.
- Result screens now show XP earned, daily bonuses, and level-up feedback automatically.
- All progression data is stored locally in the browser so GitHub Pages remains backend-free.


## 1.5.0 — Complete Game Guides

- Mendesain ulang halaman **Panduan Bermain** menjadi Brain Arena Learning Hub.
- Menambahkan empat bagian pada setiap panduan: Ringkasan, Tutorial langkah, Cara memecahkan, dan Strategi & trik.
- Menambahkan tutorial lengkap untuk seluruh 10 game dalam Bahasa Indonesia dan English.
- Menambahkan penjelasan tujuan, cara menang, kontrol, perbedaan tingkat, dan fakta cepat tiap game.
- Menambahkan metode pemecahan langkah demi langkah dan worked example untuk semua game.
- Menambahkan daftar kesalahan umum yang perlu dihindari.
- Menambahkan checklist tutorial interaktif dan indikator progres selama halaman terbuka.
- Mempertahankan strategi/rangkuman rumus lama dan mengemasnya dalam tab dengan filter tingkat serta pencarian.
- Menambahkan selector antar-panduan dan tombol langsung kembali bermain.
- Menambahkan test kelengkapan konten panduan untuk seluruh katalog.
- Gameplay 10 game tidak diubah.

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

## v1.13.1 - Sidebar Toggle
- Added a desktop **Ubah Sidebar / Toggle Sidebar** button in the top bar.
- Full sidebar and compact rail now switch instead of rendering together.
- Added `Ctrl + Shift + S` / `Cmd + Shift + S` shortcut.
- Sidebar preference is saved in localStorage and restored on reload.
- Mobile keeps the existing hamburger drawer and hides the desktop toggle.
- Preserved the v1.13 red visual system and all gameplay/progression features.
## v1.15.1 - SetupCard hotfix
- Fixed `ReferenceError: cardRef is not defined` when opening game setup screens.
- Moved `cardRef` to `SetupCard`, where it is actually used for autosave/session recovery.
- Updated PWA cache version so deployed clients can receive the corrected build.
