# Brain Arena v1.17 Test Report

## Automated unit / utility tests

- **124 / 124 passed** using Node's built-in test runner.
- Added v1.17 coverage for Multi Local Profile isolation, named Save Slots, Arena Cup progression, storage compaction, schema v17 migration/rollback snapshot, and new routes.

## Portable build

- Portable ESM production build completed successfully.
- **114 JavaScript modules** transpiled with TypeScript 5.8.3.
- Build version: **1.17.0**.

## Browser QA

Playwright smoke tests passed for:

- Multi Local Profile
- Player Showcase
- Shareable Result Card
- Arena Cup
- Practice Lab
- Save Slots
- Storage Optimization Center
- System Diagnostics v3
- Keyboard & Controller page
- Settings v1.17 tools
- Replay v2
- Advanced Analytics
- Automatic Backup UI
- Activity Calendar
- Setup-page smoke checks for all **12 / 12 games**

No JavaScript page errors were observed in the successful v1.17 browser QA runs.

## HTTP verification

- **133 HTTP checks passed** against the generated `dist/` served by the included local preview server.
- Includes byte-for-byte asset checks, MIME checks, gzip verification, 404, method rejection, and traversal rejection.

## Build note

The included hosting package is the project's portable ESM production build. Standard Vite deployment should continue to use `npm ci` followed by `npm run build` in GitHub Actions / the developer environment.
