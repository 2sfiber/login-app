const CACHE_NAME = '2s-fiber-v46';
const ASSETS_TO_CACHE = [
    'index.html?v=46',
    'style.css?v=46',
    'script.js?v=46',
    'live.html?v=46',
    'logo.png?v=46'
];

// عند التثبيت: تحميل الملفات الجديدة فوراً
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// عند التفعيل: مسح كل الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// جلب الملفات: استراتيجية الشبكة أولاً مع منع التخزين المؤقت للطلب نفسه
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request, { cache: 'no-store' }).catch(() => {
            return caches.match(event.request);
        })
    );
});
