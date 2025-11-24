// Simple service worker for PWA functionality
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle the request as usual
  event.respondWith(fetch(event.request));
});
