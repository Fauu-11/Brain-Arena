import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const pkg=JSON.parse(read('package.json'));const expected=pkg.version;
const deploy=read('.github/workflows/deploy.yml');
const ci=read('.github/workflows/ci.yml');
const checks=[
  ['package-lock',JSON.parse(read('package-lock.json')).version===expected],
  ['service-worker',read('public/service-worker.js').includes(`const VERSION = '${expected}'`)],
  ['system-diagnostics',read('src/utils/systemDiagnostics.js').includes(`APP_VERSION='${expected}'`)],
  ['runtime-health',read('src/utils/runtimeHealth.js').includes(`APP_VERSION = '${expected}'`)],
  ['feedback',read('src/pages/Feedback.jsx').includes(`APP_VERSION = '${expected}'`)],
  ['schema-v19',/DATA_SCHEMA_VERSION\s*=\s*19/.test(read('src/utils/migration.js'))],
  ['manifest-v1.19',read('public/manifest.webmanifest').includes('v1.19')],
  ['lint-first-party',pkg.scripts?.lint==='oxlint src tests scripts'],
  ['actions-node24',deploy.includes('actions/checkout@v7')&&deploy.includes('actions/setup-node@v7')&&deploy.includes('node-version: 24')&&ci.includes('actions/checkout@v7')&&ci.includes('actions/setup-node@v7')],
  ['ubuntu-24.04',deploy.includes('runs-on: ubuntu-24.04')&&ci.includes('runs-on: ubuntu-24.04')],
];
const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error(`Release consistency failed for ${expected}: ${failed.join(', ')}`);process.exit(1);}
console.log(`Release consistency OK: v${expected}; ${checks.length} checks`);
