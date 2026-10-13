/* Service worker for the Asbestos Threshold & Disposal Guide.
   Network-first for the page (fresh when online, cached when offline),
   cache-first for static assets. Small and dependency-free.
   Bump CACHE_VERSION to force clients to fetch a fresh copy. */
const CACHE_VERSION = 'asbregref-v4';

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
  './fonts/inter-latin.woff2',
  './fonts/jetbrainsmono-latin.woff2'
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

  const put = (key, res) => {
    if (res && res.ok && res.type === 'basic') {
      const copy = res.clone();
      caches.open(CACHE_VERSION).then(c => c.put(key, copy));
    }
    return res;
  };

  // The page itself (and the manifest): NETWORK-FIRST, so a deploy shows up on
  // the next load whenever there's signal; the cached copy is the offline fallback.
  // (Cache-first here pinned clients to whatever page they first cached.)
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('.html') ||
                 url.pathname.endsWith('/') || url.pathname.endsWith('.webmanifest');
  if (isPage) {
    event.respondWith(
      fetch(req).then(res => put(req, res))
        .catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // Fonts, icons and other static assets: cache-first (they rarely change).
  event.respondWith(
    caches.match(req).then(cached => cached ||
      fetch(req).then(res => put(req, res)).catch(() => Response.error()))
  );
});
