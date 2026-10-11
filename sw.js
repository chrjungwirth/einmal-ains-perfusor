// Einmal AINS · Perfusor – Service Worker: App vollständig offline, Updates auf Nachfrage
const VERSION = 'perfusor-1.1.0';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './css/app.css', './js/app.js', './js/calc.js', './js/drugs.js', './js/store.js',
  './icons/mark.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  './fonts/BricolageGrotesque-700.woff2', './fonts/BricolageGrotesque-800.woff2',
  './fonts/IBMPlexSans-400.woff2', './fonts/IBMPlexSans-500.woff2', './fonts/IBMPlexSans-600.woff2',
  './fonts/IBMPlexMono-400.woff2', './fonts/IBMPlexMono-500.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (req.mode === 'navigate') return (await cache.match('./index.html')) || fetch(req);
    const hit = await cache.match(req, { ignoreSearch: true });
    return hit || fetch(req);
  })());
});
