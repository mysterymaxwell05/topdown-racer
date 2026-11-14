// Offline cache so the installed app works without internet.
const CACHE = 'retro-racing-583aaec6d5';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './music/empty.mp3', './music/pocket_2.mp3', './music/rally.mp3', './music/rally3.mp3', './music/stored2.mp3', './music/wasted_time.mp3', './music/waves.mp3'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request))));
