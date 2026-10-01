# Brain Arena v1.19.1 Test Report

## CI / lint hotfix

- `vendor/` tidak lagi masuk target Oxlint; lint hanya menjalankan `oxlint src tests scripts`.
- Warning `no-unused-vars` pada Leaderboard, OnboardingTour, dan season utility diperbaiki.
- Warning `react-hooks/exhaustive-deps` pada Layout, Memory Matrix, dan Minesweeper diperbaiki dengan callback yang stabil.
- GitHub Actions memakai `actions/checkout@v7`, `actions/setup-node@v7`, Node 24, dan runner `ubuntu-24.04`.
- Workflow CI utama hanya berjalan untuk pull request sehingga push ke `main` tidak menjalankan verifikasi yang sama dua kali; deploy workflow tetap melakukan seluruh gate sebelum Pages deploy.

## Automated tests

- **137 / 137 Node tests passed**.
- `npm run check:release`: **10 / 10 checks passed**.
- Portable ESM build berhasil: **131 modules**.
- Build version: **1.19.1**.

## Lint note

Dependency install dari npm registry tidak tersedia pada environment pengerjaan patch ini, sehingga executable Oxlint lokal tidak dapat dijalankan ulang di sini. Namun target lint sudah dipersempit ke first-party code dan setiap warning source yang terlihat pada GitHub annotations telah diperbaiki satu per satu. GitHub Actions akan menjalankan `npm ci`, `npm run lint`, dan `npm run build` menggunakan Node 24 saat patch didorong ke repository.

## Regression note

Patch ini tidak mengubah gameplay, Schema v19, IndexedDB layout, sync queue, mutation journal, atau format Supabase migration export.
