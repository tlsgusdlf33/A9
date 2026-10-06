// 오프라인 대비: 페이지는 네트워크 우선(최신 일정 반영), 정적 파일은 캐시 우선.
// 광고·제휴 요청(googlesyndication, coupang 등 외부 도메인)은 가로채지 않습니다.
const CACHE = 'nadeuli-v1';
const PRECACHE = ['/', '/styles.css', '/app.js', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/'))),
    );
    return;
  }

  event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request)));
});
