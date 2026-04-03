const CACHE_NAME = '2s-fiber-v17'; // تم التحديث ليتوافق مع النسخة الجديدة

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  './manifest.json?v=17', // تحديث الرقم هنا ليتطابق مع المانيفست
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// التثبيت: حفظ الملفات فوراً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// التنشيط: تنظيف النسخ القديمة لضمان ظهور التعديلات الجديدة (مثل حركة النقاط وتنبيه الجمعة)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Cleaning old cache:', key);
          return caches.delete(key);
        }
      })
    ))
  );
  return self.clients.claim();
});

// استراتيجية الاستجابة (بقية الكود تبقى كما هي لأنها ذكية وتدعم الأوفلاين)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.hostname !== location.hostname || url.pathname.endsWith('.php')) {
    event.respondWith(fetch(event.request).catch(() => null));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse || caches.match(event.request, { ignoreSearch: true });
      });
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

