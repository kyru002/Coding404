const CACHE_NAME = "coding404-cache-v1";

const getBaseUrl = () => {
  try {
    return self.registration?.scope || `${self.location.origin}/`;
  } catch (_error) {
    return `${self.location.origin}/`;
  }
};

const withBase = (path) => new URL(String(path || '').replace(/^\/+/, ''), getBaseUrl()).href;

const urlsToCache = [
  withBase('/'),
  withBase('/index.html'),
  withBase('/images/logo-192x192-px.png'),
  withBase('/images/logo-512x512-px.png')
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