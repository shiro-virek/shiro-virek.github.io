const CACHE_NAME = 'creative-coding-lab-v2';

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/fonts/BULKYPIX.TTF',
    '/manifest.json',
    '/regist_serviceWorker.js',
    '/favicon.ico',
    '/icon512_rounded.png',
    '/icon512_maskable.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/assets/Spinner.png',
    '/scripts/main/main.js',
    '/scripts/main/manage-scripts.js',
    '/scripts/utils/utils.js',
    '/scripts/utils/3d.js',
    '/scripts/utils/browser.js',
    '/scripts/utils/ca.js',
    '/scripts/utils/color.js',
    '/scripts/utils/effects.js',
    '/scripts/utils/drawing.js',
    '/scripts/utils/fractals.js',
    '/scripts/utils/numbers.js',
    '/scripts/utils/noise.js',
    '/scripts/utils/objects.js',
    '/scripts/utils/physics.js',
    '/scripts/utils/quadtree.js',
    '/scripts/utils/random.js',
    '/scripts/utils/screen.js',
    '/scripts/utils/sound.js',
    '/scripts/utils/text.js',
    '/scripts/utils/touch.js',
    '/scripts/utils/trigonometry.js',
    '/scripts/utils/pixels.js',
    '/scripts/utils/url.js',
    '/scripts/utils/specialPixels.js',
    '/scripts/utils/joystick.js',
    '/scripts/utils/collisions.js',
    '/scripts/art/art-3d-fps.js',
    '/scripts/art/art-3d-rotation.js',
    '/scripts/art/art-base.js',
    '/scripts/art/art-blinkenlights.js',
    '/scripts/art/art-blinkenlights-mn.js',
    '/scripts/art/art-blinkenlights-mono.js',
    '/scripts/art/art-bokeh.js',
    '/scripts/art/art-bouncing-balls.js',
    '/scripts/art/art-chaos.js',
    '/scripts/art/art-clay.js',
    '/scripts/art/art-clay-2.js',
    '/scripts/art/art-confetti.js',
    '/scripts/art/art-conway.js',
    '/scripts/art/art-crt.js',
    '/scripts/art/art-cthulhu.js',
    '/scripts/art/art-distortion.js',
    '/scripts/art/art-filters.js',
    '/scripts/art/art-fire.js',
    '/scripts/art/art-fractals.js',
    '/scripts/art/art-gravity-balls.js',
    '/scripts/art/art-hopalong.js',
    '/scripts/art/art-joystick.js',
    '/scripts/art/art-lyapunov.js',
    '/scripts/art/art-chaos-2.js',
    '/scripts/art/art-metro.js',
    '/scripts/art/art-trail.js',
    '/scripts/art/art-particles.js',
    '/scripts/art/art-noise.js',
    '/scripts/art/art-rotators.js',
    '/scripts/art/art-rotators-solid.js',
    '/scripts/art/art-screen.js',
    '/scripts/art/art-screen-tones.js',
    '/scripts/art/art-screen-video.js',
    '/scripts/art/art-shader.js',
    '/scripts/art/art-skyscrapers.js',
    '/scripts/art/art-streets.js',
    '/scripts/art/art-tree.js',
    '/scripts/art/art-walker.js',
    '/scripts/art/art-webcam.js',
    '/scripts/art/art-screen-led.js',
    '/scripts/art/art-cubes.js',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.mode === 'navigate') {
        e.respondWith(
            caches.match('/index.html')
        );
        return;
    }

    e.respondWith(
        caches.match(e.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(e.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(e.request, responseToCache);
                    });
                    return networkResponse;
                }).catch(() => {
                    return new Response('', { status: 503 });
                });
            })
    );
});

self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_NAME];
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
