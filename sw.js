/* Service worker for the Asbestos Threshold & Disposal Guide.
   Cache-first with a network fallback. Small and dependency-free.
   Bump CACHE_VERSION to force clients to fetch a fresh copy. */
const CACHE_VERSION = 'asbregref-v1';

/* Files to precache on install. Missing entries are tolerated (allSettled)
   so a single 404 never breaks the install. */
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './fonts/inter-latin-400.woff2',
  './fonts/inter-latin-500.woff2',
  './fonts/inter-latin-600.woff2',
  './fonts/inter-latin-700.woff2',
  './fonts/inter-latin-800.woff2',
  './fonts/jetbrainsmono-latin-400.woff2',
  './fonts/jetbrainsmono-latin-500.woff2',
  './fonts/jetbrainsmono-latin-600.woff2',
  './fonts/jetbrainsmono-latin-700.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => Promise.allSettled(PRECACHE.map(u => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave cross-origin to the network

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        // offline and not cached: fall back to the app shell for navigations
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
