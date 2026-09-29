/** Optional offline ESM build. Requires TypeScript locally or globally.
 *  Standard build: npm ci && npm run build (Vite).
 *  React production runtime is unchanged from the uploaded v1.0 package.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); }
catch { try { ts = require(path.join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'typescript')); } catch { throw new Error('TypeScript is required for the optional offline build. Use npm ci and npm run build for the standard Vite build.'); } }
const list = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? list(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const source = list(path.join(root, 'src')).filter(f => /\.(jsx?|css)$/.test(f)).sort();
const hash = crypto.createHash('sha256');
for (const file of source) hash.update(path.relative(root, file)).update(fs.readFileSync(file));
const id = hash.digest('hex').slice(0, 12);
const runtimeDir = path.join(root, 'vendor/react-runtime');
const runtimeHash = crypto.createHash('sha256');
for (const file of list(runtimeDir).sort()) runtimeHash.update(fs.readFileSync(file));
const runtimeId = runtimeHash.digest('hex').slice(0, 12);
const stage = path.join(root, '.dist-next');
fs.rmSync(stage, { recursive: true, force: true });
const base = `assets/arena-${id}`;
const vendor = `assets/vendor-${runtimeId}`;
fs.mkdirSync(path.join(stage, base), { recursive: true });
let modules = 0;
for (const file of source.filter(f => /\.jsx?$/.test(f))) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/^import\s+['"][^'"]+\.css['"];?\s*$/gm, '');
  const result = ts.transpileModule(text, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, jsx: ts.JsxEmit.React, allowJs: true, removeComments: false },
  });
  const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  if (errors.length) throw new Error(`${file}: ${errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n')}`);
  const code = result.outputText.replace(/((?:from\s*|import\s*\(\s*)['"])(\.{1,2}\/[^'"]+)(['"])/g, (all, prefix, spec, end) => {
    const resolved = path.resolve(path.dirname(file), spec);
    const candidates = [resolved, `${resolved}.jsx`, `${resolved}.js`];
    if (!candidates.some(f => fs.existsSync(f) && fs.statSync(f).isFile())) throw new Error(`Unresolved import ${spec} in ${file}`);
    return prefix + spec.replace(/\.jsx?$/, '') + '.js' + end;
  });
  const out = path.join(stage, base, path.relative(path.join(root, 'src'), file).replace(/\.jsx$/, '.js'));
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, code); modules++;
}
fs.cpSync(runtimeDir, path.join(stage, vendor), { recursive: true });
fs.cpSync(path.join(root, 'public'), stage, { recursive: true });
fs.copyFileSync(path.join(root, 'vendor/THIRD-PARTY-NOTICES.txt'), path.join(stage, 'THIRD-PARTY-NOTICES.txt'));
fs.writeFileSync(path.join(stage, `assets/style-${id}.css`), ['index.css', 'arena.css', 'game-theme.css'].map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('\n'));
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script type="module" src="\/src\/main.jsx"><\/script>/, `<script type="importmap">${JSON.stringify({ imports: { react: `./${vendor}/react.js`, 'react-dom': `./${vendor}/react-dom.js`, 'react-dom/client': `./${vendor}/react-dom-client.js` } })}</script>\n    <script type="module" src="./${base}/main.js"></script>`);
html = html.replace('</head>', `  <link rel="stylesheet" href="./assets/style-${id}.css" />\n  </head>`).replace('href="/favicon.svg"', 'href="./favicon.svg"');
fs.writeFileSync(path.join(stage, 'index.html'), html);
fs.writeFileSync(path.join(stage, 'BUILD_INFO.json'), JSON.stringify({ type: 'portable-esm-production', version: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version, sourceHash: id, compiler: `TypeScript ${ts.version}`, runtime: '19.2.7', modules, note: 'Offline ESM build; not a Vite build. React production runtime is unchanged from the uploaded v1.0 package. Standard Vite build is not verified in this environment. Run npm ci and npm run build in your development environment.' }, null, 2));
fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true }); fs.renameSync(stage, path.join(root, 'dist'));
console.log(`Portable build ready: ${modules} modules, source ${id}`);
