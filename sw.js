const CACHE_NAME = '2s-fiber-v49';
const ASSETS_TO_CACHE = [
    'index.html?v=49',
    'style.css?v=49',
    'script.js?v=49',
    'live.html?v=4',
    'logo.png?v=49',
     'mbc2.svg?v=49',
'mbcmaser.svg?v=49',
'jazera.svg?v=49',
'skynews.svg?v=49',
'arabia.png?v=49',
    'live.png?v=49'
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
