const CACHE_NAME = '2s-fiber-v11'; // تم تحديث الإصدار لضمان تنشيط التعديلات
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// مرحلة التثبيت: حفظ الملفات الأساسية في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('2S Fiber: Caching system v11 ready');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
});

// مرحلة التنشيط: حذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// الاستراتيجية المعدلة: الكاش أولاً لسرعة البرق
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // إذا وجد الملف في الكاش، أرجعه فوراً
      if (cachedResponse) {
        return cachedResponse;
      }
      // إذا لم يوجد، اطلبه من الشبكة
      return fetch(event.request).then((networkResponse) => {
        // اختياري: يمكنك هنا إضافة الملفات الجديدة للكاش تلقائياً
        return networkResponse;
      });
    })
  );
});
