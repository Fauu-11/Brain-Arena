import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(project,'dist');
const port=Number(process.env.PORT || 4173);
if(!fs.existsSync(path.join(root,'index.html'))) { console.error('Folder dist tidak ditemukan. Jalankan npm run build terlebih dahulu.');process.exit(1); }
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
 if(req.method!=='GET' && req.method!=='HEAD') { res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return; }
 let requestPath;
 try { requestPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400);res.end('Bad request');return; }
 if(requestPath.includes('\0')) {res.writeHead(400);res.end('Bad request');return;}
 const target=path.resolve(root,'.'+requestPath);
 if(target!==root && !target.startsWith(root+path.sep)) {res.writeHead(403);res.end('Forbidden');return;}
 let file=target;
 try {if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.statSync(file).isFile())throw new Error();} catch {res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Cache-Control','no-cache');
 if(req.method==='HEAD') {res.writeHead(200);res.end();return;}
 const stream=fs.createReadStream(file);stream.on('error',()=>{if(!res.headersSent)res.writeHead(500);res.end();});
 if(/\bgzip\b/.test(req.headers['accept-encoding'] || '') && /\.(js|css|html|json|svg|txt)$/.test(file)) {res.setHeader('Content-Encoding','gzip');res.setHeader('Vary','Accept-Encoding');stream.pipe(createGzip()).pipe(res);} else stream.pipe(res);
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} sedang dipakai. Tutup server lain atau atur PORT.`:e.message);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log(`\nBrain Arena siap dibuka: http://localhost:${port}\nTekan Ctrl+C untuk berhenti. Server hanya untuk preview lokal.\n`));
