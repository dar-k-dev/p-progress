// Push notification service worker
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

    const options = {
      body: data.body || 'New update available',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      image: data.image,
      data: data.data || {},
      tag: data.data?.type || 'general',
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      actions: data.data?.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'ProgressPulse', options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('ProgressPulse', {
        body: 'New update available',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  if (action === 'update') {
    // Handle update action
    event.waitUntil(
      clients.openWindow('/settings?tab=updates&action=update')
    );
  } else if (action === 'later') {
    // Handle later action - just close
    console.log('User chose to update later');
  } else {
    // Default click - open the app
    const urlToOpen = data.url || '/settings?tab=updates';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Check if app is already open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(self.location.origin)) {
              // Focus existing window and navigate
              return client.focus().then(() => {
                return client.navigate(urlToOpen);
              });
            }
          }
          
          // Open new window
          return clients.openWindow(urlToOpen);
        })
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  
  // Track notification dismissal if needed
  const data = event.notification.data || {};
  if (data.type === 'update') {
    console.log('Update notification dismissed');
  }
});

// Background sync for update checks
self.addEventListener('sync', function(event) {
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/update-manifest.json?' + Date.now());
    if (response.ok) {
      const updateInfo = await response.json();
      
      // Get current version from cache or storage
      const currentVersion = await getCurrentVersion();
      
      if (updateInfo.version !== currentVersion) {
        // Show update notification
        await self.registration.showNotification('🚀 Update Available', {
          body: `Version ${updateInfo.version} is ready to install`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'update-available',
          requireInteraction: true,
          data: {
            type: 'update',
            version: updateInfo.version,
            url: '/settings?tab=updates'
          },
          actions: [
            {
              action: 'update',
              title: 'Update Now',
              icon: '/icons/update-icon.png'
            },
            {
              action: 'later',
              title: 'Later',
              icon: '/icons/later-icon.png'
            }
          ]
        });
      }
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

async function getCurrentVersion() {
  try {
    // Try to get version from IndexedDB or localStorage
    const version = localStorage.getItem('app-version') || '1.0.0';
    return version;
  } catch (error) {
    return '1.0.0';
  }
}

// Install event
self.addEventListener('install', function(event) {
  console.log('Push service worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Push service worker activated');
  event.waitUntil(self.clients.claim());
});