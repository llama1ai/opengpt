const CACHE_NAME = "ai-assistant-v1"
const STATIC_CACHE_NAME = "ai-assistant-static-v1"
const DYNAMIC_CACHE_NAME = "ai-assistant-dynamic-v1"

const STATIC_FILES = ["/", "/manifest.json", "/favicon.png", "/favicon.ico", "/icon-192.png", "/icon-512.png"]

// Install event
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching static files")
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log("✅ Static files cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("❌ Failed to cache static files:", error)
      }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log("🗑️ Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("✅ Service Worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  event.respondWith(
    caches
      .match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone response for caching
          const responseToCache = response.clone()

          // Cache dynamic content
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
      })
      .catch(() => {
        // Return offline fallback for navigation requests
        if (request.destination === "document") {
          return caches.match("/")
        }
      }),
  )
})

// Handle messages from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Background sync (future feature)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("🔄 Background sync triggered")
  }
})

// Push notifications (future feature)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/favicon.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "explore",
          title: "Otwórz aplikację",
          icon: "/icon-192.png",
        },
        {
          action: "close",
          title: "Zamknij",
        },
      ],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus()
          }
        }

        // Open new window in standalone mode
        if (clients.openWindow) {
          return clients.openWindow("/")
        }
      }),
    )
  }
})
