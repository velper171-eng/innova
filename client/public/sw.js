const CACHE_NAME = "innova-cache-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/favicon.svg"
];

// Install Event
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching shell assets");
      return cache.addAll(ASSETS).catch(err => console.log("Cache pre-fill skipped: ", err));
    })
  );
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener("fetch", (e) => {
  // Let API requests and non-GET requests go directly to network
  if (e.request.url.includes("/api/") || e.request.method !== "GET") {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cache the new response if it was fetched successfully
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(e.request);
      })
  );
});
