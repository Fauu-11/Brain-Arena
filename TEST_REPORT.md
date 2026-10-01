# Laporan pengujian Brain Arena v1.13.1

Tanggal: 1 Oktober 2026.

## Ringkasan v1.12

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit seluruh proyek | **102/102 lulus** | logic lama + feedback v1.12 |
| Feedback routes | **Lulus** | `#/feedback`, `#/saran`, `#/masukan` |
| Validation | **Lulus** | subject, message, email, rating bounds |
| Relay payload | **Lulus** | JSON payload + context + diagnostics |
| Browser desktop | **Lulus** | 1440 px, no horizontal overflow, no JS error |
| Browser mobile | **Lulus** | 390 px, no horizontal overflow, no JS error |
| Feedback UI privacy | **Lulus** | developer email tidak tampil pada visible page text |
| Submit flow QA | **Lulus** | fetch di-mock; success state + local receipt |
| Portable build | **Lulus** | **76 modules** |
| HTTP verification | **95 checks lulus** | 91 assets + 4 response/security checks |

Browser QA sengaja me-mock request submit sehingga pengujian tidak mengirim email sungguhan ke developer. Pengiriman produksi menggunakan relay FormSubmit.

---

# Laporan pengujian Brain Arena v1.11.0

Tanggal: 1 Oktober 2026.

## Ringkasan

| Kelompok | Hasil | Cakupan |
| --- | --- | --- |
| Unit seluruh proyek | **97/97 lulus** | seluruh game logic lama + competitive utility v1.11 |
| Challenge Code | **12/12 valid** | semua ID game menghasilkan kode yang tervalidasi untuk game yang tepat |
| Deterministic seed | **Lulus** | seed sama = sequence sama; seed berbeda = sequence berbeda |
| Ranked / Performance | **Lulus** | grade bounded, PB grade, hint penalty, loss RP |
| Arena Run presets | **Lulus** | 3 / 5 / 8 / 12 stage |
| Game Completion | **Lulus** | 6 level key × 12 game = 72 target |
| Browser responsive | **Lulus** | Arena Run, seeded Maze, History, Replay, Completion |
| Seeded Maze browser | **Lulus** | Challenge Code sama menghasilkan START/EXIT yang sama pada 1440 dan 390 px |
| Portable build | **Lulus** | **74 modules** |
| HTTP verification | **93 checks lulus** | 89 assets + 4 response/security checks |

## Seed & Challenge Code

Unit test memverifikasi seluruh 12 game dapat membuat Challenge Code yang valid dan kode suatu game tidak diterima untuk game lain. Generator `mulberry32` dengan hasil hash Challenge Code memproduksi sequence identik untuk input seed identik.

Browser QA menggunakan kode:

```text
BA-MAZE-QA11111
```

pada Maze Escape Ranked Universitas Hard. Dua sesi terpisah pada viewport 1440 px dan 390 px menghasilkan pasangan endpoint yang sama pada QA tersebut:

```text
START cell: 3
EXIT cell: 144
```

Ini memverifikasi seeded RNG sudah aktif sebelum generator Maze dijalankan. Pengujian utilitas memastikan mekanisme seed yang sama tersedia untuk seluruh game melalui patch `Math.random` selama sesi kompetitif.

## Practice / Ranked

Setup bersama seluruh game sekarang memiliki pilihan Practice / Ranked. QA source/unit memverifikasi Ranked RP:

- grade lebih tinggi memberi RP lebih besar;
- penggunaan Brain Coach mengurangi RP;
- loss dapat menghasilkan RP negatif;
- Practice tidak menambahkan Ranked RP.

Competitive HUD menampilkan mode, timer sesi, Challenge Code, Ghost PB bila ada, Arena Run stage bila aktif, dan kuota Brain Coach untuk Ranked.

## Arena Run

Halaman Arena Run diuji pada 1440 px dan 390 px tanpa page-level horizontal overflow atau uncaught JavaScript error.

Preset yang diverifikasi:

```text
Quick Run      3
Standard Run   5
Master Run     8
Ultimate Run  12
```

Urutan game menggunakan shuffle tanpa duplikasi, dan setiap stage mendapat Challenge Code tersendiri.

## Match History & Replay

Browser QA menyuntikkan satu match lokal realistis lalu memverifikasi:

- row Match History tampil;
- Challenge Code, mode, durasi, grade, RP, dan PB terbaca;
- tombol Replay membuka viewer;
- Replay menampilkan 4 action timeline pada fixture QA;
- Play/Pause dan timeline tersedia;
- halaman tidak overflow pada desktop.

Replay v1.11 adalah **action replay**, bukan video atau rekonstruksi frame-by-frame papan.

## Personal Best / Ghost

PB disimpan dengan key gabungan:

```text
gameId + levelCompletionKey
```

University membedakan Hard, Very Hard, dan Impossible. Performance test memverifikasi sesi yang lebih cepat dari PB mendapat skor minimal 96 dan grade S pada kondisi tanpa penalti hint.

## Brain Coach

Seluruh 12 game memiliki tip bilingual. Ranked membatasi maksimal dua hint per sesi. Penggunaan hint direkam pada replay dan ikut memengaruhi Performance/Ranked RP.

## Performance Rating

Rentang yang diverifikasi:

```text
35..100
```

Grade:

```text
S >= 96
A >= 88
B >= 78
C >= 65
D < 65
```

Loss, draw/completed, PB sebelumnya, durasi, dan hint diproses oleh utility kompetitif.

## Game Completion

Halaman Completion menampilkan **12 kartu game** dan **72 target level**:

```text
SD
SMP
SMA
University Hard
University Very Hard
University Impossible
```

Browser QA desktop dan mobile 390 px tidak menunjukkan document-level horizontal overflow.

## Browser QA v1.11

Skenario yang lulus:

```text
Arena Run desktop 1440
Arena Run mobile 390
Seeded Ranked Maze desktop 1440
Seeded Ranked Maze mobile 390
Game Completion desktop 1440
Game Completion mobile 390
Match History desktop 1440
Replay desktop 1440
```

Hasil:

```text
0 uncaught JavaScript errors
0 page-level horizontal overflow
```

Screenshot QA tersimpan di `qa-results/v1.11/`.

## Build & HTTP

Perintah yang berhasil:

```bash
npm test
npm run build:portable
python3 tests/browser/v111.py
ARENA_TEST_URL=http://127.0.0.1:4188 python3 tests/http.test.py
```

Hasil akhir:

```text
97 unit tests passed
74 portable modules
93 HTTP checks passed
```

`npm run lint` dan `npm run build` standar tidak dapat dijalankan pada environment QA ini karena executable `oxlint` dan `vite` tidak tersedia di `node_modules` lokal. Ini merupakan keterbatasan environment dependency yang tersedia, bukan hasil lint/build yang diklaim lulus. Workflow GitHub Pages tetap memakai `npm ci` lalu `npm run build`.

## Metadata

Backup metadata:

```text
appVersion: 1.11.0
```

PWA service-worker cache:

```text
brain-arena-v1.11.0
```

## v1.13.1 Sidebar Toggle verification
- Existing project unit tests: **102/102 passed**.
- Portable ESM build: **76 modules**.
- Desktop browser QA at 1440 px confirmed:
  - full sidebar visible by default;
  - compact rail hidden by default;
  - topbar toggle changes Full -> Compact;
  - content margin changes from 266 px -> 118 px;
  - `Ctrl + Shift + S` restores Full mode;
  - preference stored in `ba_sidebar_collapsed`;
  - uncaught JavaScript errors: **0**.
