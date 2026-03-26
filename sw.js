const CACHE_NAME = '2s-fiber-v8'; // تم التحديث لـ v8 لتفعيل لون النص الأبيض الجديد
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
      console.log('تم حفظ التحديثات الجديدة v8');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
});

// تفعيل الـ Service Worker وتنظيف الإصدارات القديمة (v7 وما قبلها)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('حذف التخزين القديم:', key);
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
