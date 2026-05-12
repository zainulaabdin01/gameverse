/**
 * PWA Service Worker
 * Handles offline support, caching, and background sync
 */

const CACHE_NAME = 'gameverse-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png'
];

// API endpoints to cache
const CACHEABLE_ENDPOINTS = [
  '/api/games',
  '/api/articles',
  '/api/esports/matches',
  '/api/search'
];

/**
 * Install service worker and cache static assets
 */
self.addEventListener('install', (event: any) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache: any) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        self.skipWaiting();
      })
  );
});

/**
 * Activate service worker and clean old caches
 */
self.addEventListener('activate', (event: any) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames: any[]) => {
        return Promise.all(
          cacheNames
            .filter((cacheName: string) => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== CACHE_NAME
            )
            .map((cacheName: string) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Handle fetch requests with caching strategy
 */
self.addEventListener('fetch', (event: any) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request)
        .then((response: any) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((response: any) => {
              // Cache successful responses
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache: any) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
    );
    return;
  }
  
  // Handle API requests with network-first strategy
  if (isCacheableEndpoint(request)) {
    event.respondWith(
      fetch(request)
        .then((response: any) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache: any) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // Default: network-only strategy
  event.respondWith(fetch(request));
});

/**
 * Handle background sync for offline actions
 */
self.addEventListener('sync', (event: any) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      processOfflineActions()
    );
  }
});

/**
 * Handle push notifications
 */
self.addEventListener('push', (event: any) => {
  console.log('[Service Worker] Push notification received:', event);
  
  const options = {
    body: event.data?.message || 'New update available',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: event.data?.tag || 'general',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(event.data?.title || 'Gameverse Update', options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event: any) => {
  console.log('[Service Worker] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    // Default action: open main app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request: Request): boolean {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return pathname.startsWith('/assets/') ||
         pathname.startsWith('/images/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.jpeg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2');
}

/**
 * Check if request is for a cacheable API endpoint
 */
function isCacheableEndpoint(request: Request): boolean {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return CACHEABLE_ENDPOINTS.some(endpoint => 
    pathname.startsWith(endpoint) || 
    pathname === endpoint
  );
}

/**
 * Process offline actions stored in IndexedDB
 */
async function processOfflineActions(): Promise<void> {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      console.log('[Service Worker] Processing offline action:', action);
      
      try {
        // Process the action when online
        await processAction(action);
        
        // Remove processed action
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('[Service Worker] Failed to process offline action:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to process offline actions:', error);
  }
}

/**
 * Get offline actions from IndexedDB
 */
async function getOfflineActions(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GameverseOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
      getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
    };
  });
}

/**
 * Remove offline action from IndexedDB
 */
async function removeOfflineAction(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GameverseOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    };
  });
}

/**
 * Process an offline action
 */
async function processAction(action: any): Promise<void> {
  switch (action.type) {
    case 'search':
      // Queue search for when online
      console.log('[Service Worker] Queued search:', action.query);
      break;
      
    case 'bookmark':
      // Queue bookmark action
      console.log('[Service Worker] Queued bookmark:', action.data);
      break;
      
    case 'notification':
      // Queue notification preference update
      console.log('[Service Worker] Queued notification update:', action.data);
      break;
      
    default:
      console.log('[Service Worker] Unknown action type:', action.type);
  }
}

// Service Worker message handling
self.addEventListener('message', (event: any) => {
  console.log('[Service Worker] Message received:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_UPDATE':
      // Update specific cache
      updateCache(event.data.cacheName, event.data.url);
      break;
      
    default:
      console.log('[Service Worker] Unknown message type:', event.data.type);
  }
});

/**
 * Update specific cache
 */
async function updateCache(cacheName: string, url: string): Promise<void> {
  try {
    const cache = await caches.open(cacheName);
    const response = await fetch(url);
    
    if (response.ok) {
      await cache.put(url, response);
      console.log(`[Service Worker] Updated cache: ${url}`);
    }
  } catch (error) {
    console.error(`[Service Worker] Failed to update cache: ${url}`, error);
  }
}

// Export for TypeScript
declare const self: ServiceWorkerGlobalScope;
