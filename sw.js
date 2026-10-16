// Sparar appens filer så att den startar snabbt och fungerar utan nät.
// Hushållets data hämtas alltid från kalkylarket.
const VERSION = 'ht-v86';
const SHELL = ['./', './index.html', './matvaror.js?v=3', './matpoang.js?v=1', './kottveg.js?v=2', './app.js?v=81', './config.js?v=37', './manifest.webmanifest', './icons/icon-192.png?v=6', './icons/icon-192-dark.png?v=6', './icons/apple-touch-icon.png?v=6', './icons/apple-touch-icon-dark.png?v=6'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Nätet först, så att uppdateringar syns direkt. Sparad kopia om nätet saknas.
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
