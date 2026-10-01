const VERSION = '1.19.0';
const CACHE = `brain-arena-v${VERSION}`;
const RUNTIME = `brain-arena-runtime-v${VERSION}`;
const CORE = ['','index.html','manifest.webmanifest','favicon.svg','icons.svg','pwa-192.png','pwa-512.png'];
const RUNTIME_LIMIT = 90;
const scoped = path => new URL(path, self.registration.scope).href;

async function safePrecache() {
  const cache = await caches.open(CACHE);
  await Promise.allSettled(CORE.map(async path => {
    const url=scoped(path);
    const response=await fetch(url,{cache:'reload'});
    if(response.ok) await cache.put(url,response);
  }));
}

async function trimRuntime() {
  const cache=await caches.open(RUNTIME);
  const keys=await cache.keys();
  if(keys.length<=RUNTIME_LIMIT)return;
  await Promise.all(keys.slice(0,keys.length-RUNTIME_LIMIT).map(key=>cache.delete(key)));
}

async function networkFirst(request, fallbackUrl=scoped('index.html')) {
  try {
    const response=await Promise.race([
      fetch(request),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('network-timeout')),4500)),
    ]);
    if(response?.ok){const cache=await caches.open(RUNTIME);await cache.put(request,response.clone());trimRuntime();}
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match(fallbackUrl)) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cached=await caches.match(request);
  const refresh=fetch(request).then(async response=>{
    if(response.ok && response.type!=='opaque'){
      const cache=await caches.open(RUNTIME);
      await cache.put(request,response.clone());
      trimRuntime();
    }
    return response;
  }).catch(()=>null);
  return cached || (await refresh) || Response.error();
}

self.addEventListener('install', event => {
  // Keep the waiting-worker flow so the UI can ask before reloading.
  event.waitUntil(safePrecache());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_RUNTIME_CACHE') event.waitUntil(caches.delete(RUNTIME));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('brain-arena-') && ![CACHE,RUNTIME].includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/service-worker.js')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (/\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
