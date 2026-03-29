const CACHE_NAME = '2s-fiber-cache-v13'; // تأكد أن الإصدار هنا يطابق v11 في ملف html
const assetsToCache = [
  './',
  './index.html',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// 1. مرحلة التثبيت: حفظ الملفات الأساسية في الذاكرة المؤقتة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: تم فتح الذاكرة المؤقتة وحفظ الأصول');
      return cache.addAll(assetsToCache);
    })
  );
  // أزلنا self.skipWaiting() من هنا ووضعناها في مستمع الرسائل بالأسفل لضمان تحكم المستخدم
});

// 2. مرحلة التنشيط: حذف الملفات القديمة (v10, v9...) لضمان عمل التحديث الجديد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: جاري حذف الذاكرة القديمة:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // السيطرة على المتصفح فوراً
});

// 3. معالجة الطلبات: جلب الملفات من الذاكرة إذا كانت متوفرة، وإلا من الإنترنت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// --- التعديل الجديد المدمج ---
// 4. الاستماع لرسالة التحديث اليدوي من ملف index.html
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting(); // تفعيل النسخة الجديدة فوراً عند طلب المستخدم
  }
});
