// Offline support for the installed app / home-screen game.
// - The game page (index.html) is fetched fresh from the internet first, so updates show up straight away;
//   the saved copy is only used when there is no connection.
// - Songs and icons are saved the first time they are played/shown and kept across updates (downloaded once).
const CORE = 'retro-racing-34e262aa0c';            // build stamps a version here, e.g. retro-racing-4512129c1f
const MEDIA = 'retro-racing-media';         // songs + icons, kept across versions
const CORE_FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CORE).then(c => c.addAll(CORE_FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CORE && k !== MEDIA).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const isPage = req => req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (isPage(req)) {   // network first (4 s), saved copy when offline
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fallback = () => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')).then(r => { if (!done && r) { done = true; resolve(r); } });
      const t = setTimeout(fallback, 4000);
      fetch(req, { cache: 'no-store' }).then(res => {
        clearTimeout(t);
        if (res && res.ok) { const copy = res.clone(); caches.open(CORE).then(c => c.put('./index.html', copy)); }
        if (!done) { done = true; resolve(res); }
      }).catch(() => { clearTimeout(t); fallback().then(() => { if (!done) { done = true; resolve(Response.error()); } }); });
    }));
    return;
  }
  // songs, icons, manifest: saved copy first, otherwise download and save
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(res => {
    if (res && res.ok && /\/(music|icons)\//.test(new URL(req.url).pathname)) { const copy = res.clone(); caches.open(MEDIA).then(c => c.put(req, copy)); }
    return res;
  })));
});
