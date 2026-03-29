const CACHE_NAME = '2s-fiber-v15';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  './manifest.json?v=11',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// التثبيت: حفظ الملفات فوراً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// التنشيط: تنظيف النسخ القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// الاستراتيجية الذكية المحدثة
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. استثناء روابط الـ PHP والروابط الخارجية
  if (url.hostname !== location.hostname || url.pathname.endsWith('.php')) {
    event.respondWith(fetch(event.request).catch(() => {
      return null; 
    }));
    return;
  }

  // 2. معالجة ملفات التطبيق المحلية مع دعم الأوفلاين الذكي
  event.respondWith(
    // نحاول البحث عن تطابق تام أولاً (بما في ذلك Query Strings مثل ?v=14)
    caches.match(event.request).then((cachedResponse) => {
      
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // إذا نجح الاتصال، نحدث الذاكرة بالنسخة الجديدة
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // [التعديل المدمج]: في حالة الأوفلاين وفشل العثور على تطابق تام
        // نبحث عن الملف بدون الـ Query String لضمان فتح التطبيق
        return cachedResponse || caches.match(event.request, { ignoreSearch: true });
      });

      // نُعيد النسخة المخزنة فوراً للسرعة، أو ننتظر طلب الشبكة
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

