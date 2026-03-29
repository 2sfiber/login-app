const CACHE_NAME = '2s-fiber-v14';

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

// الاستراتيجية الذكية: السرعة أولاً للملفات المحلية، والشبكة فقط للروابط الخارجية
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. إذا كان الطلب لصفحة الـ PHP أو أي رابط خارجي: اذهب للشبكة مباشرة ولا تخزن شيئاً
  if (url.hostname !== location.hostname || url.pathname.endsWith('.php')) {
    event.respondWith(fetch(event.request).catch(() => {
      // هنا يمكننا إرجاع "فشل" ليظهر تنبيه الأوفلاين في الـ HTML
      return null; 
    }));
    return;
  }

  // 2. لملفات تطبيقك (HTML, CSS, Images): أظهرها فوراً من الذاكرة ثم حدثها في الخلفية
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // تحديث الذاكرة بالنسخة الجديدة في الخلفية
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });

      // أعد النسخة المخزنة فوراً (للسرعة) أو انتظر الشبكة إذا لم تكن موجودة
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
