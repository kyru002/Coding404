const CACHE_NAME = "coding404-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/src/main.js",
  "/images/logo-192x192-px.png",
  "/images/logo-512x512-px.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});