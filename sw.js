const CACHE_NAME = 'ki-jambi-v1';
const URLS_TO_CACHE = [
  '/Jadwal-Sidang-KI-Jambi/',
  '/Jadwal-Sidang-KI-Jambi/index.html',
  '/Jadwal-Sidang-KI-Jambi/icon-192.png',
  '/Jadwal-Sidang-KI-Jambi/icon-512.png'
];

// Install: cache semua file penting
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback ke cache
self.addEventListener('fetch', event => {
  // Google Sheets API tetap online (data real-time)
  if (event.request.url.includes('sheets.googleapis.com') ||
      event.request.url.includes('drive.google.com')) {
    return; // biarkan browser handle langsung
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan response baru ke cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // offline fallback
  );
});
