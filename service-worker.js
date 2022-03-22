const cacheName = "tic-tac-toc-pwa";
const filesToCache = [
  "index.html",
  "manifest.json",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "scripts/game.js",
  "scripts/custom-elements-polyfill.min.js",
];

self.addEventListener("install", (e) =>
  e.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(filesToCache))
  )
);

self.addEventListener("fetch", (e) =>
  e.respondWith(
    caches
      .match(e.request)
      .then((cachedResponse) => cachedResponse || fetch(e.request))
  )
);

