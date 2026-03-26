const CACHE_NAME = '2s-fiber-v7'; // النسخة v7 تضمن تحديث تدرج الخلفية والساعة
const ASSETS = [
  './',
  './index.html',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// تثبيت الـ Service Worker وحفظ الملفات في الذاكرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('تم حفظ الملفات الجديدة في الذاكرة المؤقتة');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
});

// تفعيل الـ Service Worker وتنظيف الإصدارات القديمة (v4, v5, v6)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('جاري حذف التخزين المؤقت القديم:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية الاستجابة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
