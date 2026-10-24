const CACHE = 'lifequest-v1';
const ASSETS = [
  './',
  './index.html',
  './echarts.min.js',
  './manifest.json',
  './icon.svg',
  './fonts/inter-latin.woff2',
  './fonts/jetbrainsmono-latin.woff2',
  './fonts/amiri-400-arabic.woff2',
  './fonts/amiri-400-latin.woff2',
  './fonts/amiri-700-arabic.woff2',
  './fonts/amiri-700-latin.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
