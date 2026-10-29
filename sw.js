// Network first, cache as fallback: updates show up right away when online, and the app still opens offline.
const CACHE = 'pumpelek-v11';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/util.js', 'js/seed.js', 'js/avatar-art.js', 'js/avatar.js', 'js/store.js', 'js/srs.js', 'js/csv.js',
  'js/game.js', 'js/study.js', 'js/screens.js', 'js/main.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  // the first look of the avatar; the other pictures are saved the first time they are shown
  'img/avatar/hair_topknot_back_darkbrown.webp', 'img/avatar/hair_topknot_front_darkbrown.webp',
  'img/avatar/outfit_kimono_s0.webp', 'img/avatar/head_s0.webp',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
  );
});
