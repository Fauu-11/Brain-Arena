# Brain Arena v1.14 – UX & Recovery Update

## Fokus release

1. Continue Playing / Autosave
2. Session Recovery
3. Smart Sidebar v2
4. Notification Center
5. Universal Command Palette
6. Post-Game Insights
7. PWA Update Manager
8. Lazy Loading & Performance
9. Progress Data Migration

## QA

- 106/106 Node unit tests passed.
- Portable ESM build passed: 80 modules.
- HTTP verification passed: 99 checks.
- Browser UI smoke passed at 1440px and 390px for Smart Sidebar, mobile drawer, Command Palette, and Notification Center with 0 page errors.
- Recovery logic is unit/build verified; the in-memory QA harness cannot fully validate lazy route transition recovery, so standard Vite/browser verification is still recommended after `npm ci && npm run build`.
