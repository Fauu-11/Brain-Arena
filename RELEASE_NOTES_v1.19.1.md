# Brain Arena v1.19.1 — CI / Lint Hotfix

Patch ini membersihkan GitHub Actions annotations yang muncul setelah v1.19.

- `vendor/` tidak lagi ikut lint karena berisi runtime React pihak ketiga.
- Warning hook dependencies pada Layout, Memory Matrix, dan Minesweeper diperbaiki.
- Binding/parameter yang tidak digunakan dibersihkan.
- Workflow menggunakan `actions/checkout@v5`, `actions/setup-node@v5`, Node 24, dan `ubuntu-24.04`.
- CI untuk `push main` tidak lagi diduplikasi oleh workflow PR.
- PWA/app version dinaikkan ke 1.19.1.
