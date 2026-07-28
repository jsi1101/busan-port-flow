const CACHE = 'busan-port-flow-v4';
const ASSETS = ['/', '/index.html', '/style.css', '/script.js', '/map-service.js', '/data-service.js', '/route-service.js', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// 항상 최신 앱 파일을 먼저 요청하여 배포 후 이전 화면이 남지 않게 합니다.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
