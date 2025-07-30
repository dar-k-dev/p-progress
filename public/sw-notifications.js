// Enhanced Service Worker for Background Notifications
// Works for both Web and APK environments

const CACHE_NAME = 'progresspulse-notifications-v1';
const NOTIFICATION_TAG_PREFIX = 'progresspulse-';

// Install event
self.addEventListener('install', (event) => {
  console.log('🔔 Notification Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🔔 Notification Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  console.log('🔔 Background sync triggered:', event.tag);
  
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  } else if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

// Push event handler
self.addEventListener('push', (event) => {
  console.log('🔔 Push message received:', event);
  
  let notificationData = {
    title: '🎯 ProgressPulse',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    requireInteraction: false,
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions || [],
      vibrate: [200, 100, 200], // Works better on APK
      silent: false
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action || notificationData.action || 'open-app';

  event.waitUntil(
    handleNotificationClick(action, notificationData)
  );
});

// Handle notification clicks
async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // Try to focus existing window first
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      await client.focus();
      
      // Send message to client about the action
      client.postMessage({
        type: 'NOTIFICATION_CLICK',
        action: action,
        data: data
      });
      
      return;
    }
  }

  // No existing window, open new one
  let url = '/';
  
  if (action === 'open-settings' || data.type === 'update') {
    url = '/settings?tab=updates';
  } else if (action === 'open-goals') {
    url = '/goals';
  } else if (action === 'open-progress') {
    url = '/progress';
  }

  await self.clients.openWindow(url);
}

// Daily reminder function
async function sendDailyReminder() {
  console.log('🔔 Sending daily reminder...');
  
  const reminders = [
    {
      title: '🎯 Daily Progress Check',
      body: 'How are your goals coming along today?',
      data: { type: 'reminder', action: 'open-progress' }
    },
    {
      title: '📊 Track Your Progress',
      body: 'Take a moment to update your achievements!',
      data: { type: 'reminder', action: 'open-goals' }
    },
    {
      title: '🚀 Keep Going!',
      body: 'You\'re doing great! Check your progress.',
      data: { type: 'reminder', action: 'open-progress' }
    },
    {
      title: '⭐ Goal Reminder',
      body: 'Don\'t forget to work on your goals today!',
      data: { type: 'reminder', action: 'open-goals' }
    }
  ];

  const reminder = reminders[Math.floor(Math.random() * reminders.length)];
  
  await self.registration.showNotification(reminder.title, {
    body: reminder.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'daily-reminder',
    requireInteraction: false,
    data: reminder.data,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open-app',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  });
}

// Check for updates function
async function checkForUpdates() {
  console.log('🔔 Checking for updates in background...');
  
  try {
    const response = await fetch('/update-manifest.json?' + Date.now());
    if (!response.ok) return;
    
    const updateInfo = await response.json();
    const currentVersion = await getCurrentVersion();
    
    if (updateInfo.version !== currentVersion) {
      await self.registration.showNotification('🚀 ProgressPulse Update Available', {
        body: `Version ${updateInfo.version} is ready to install!`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'app-update',
        requireInteraction: true,
        data: {
          type: 'update',
          version: updateInfo.version,
          action: 'open-settings'
        },
        actions: [
          {
            action: 'update-now',
            title: 'Update Now',
            icon: '/icons/action-update.png'
          },
          {
            action: 'later',
            title: 'Later',
            icon: '/icons/action-later.png'
          }
        ],
        vibrate: [200, 100, 200, 100, 200]
      });
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

// Get current version from storage
async function getCurrentVersion() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/version.json');
    if (response) {
      const data = await response.json();
      return data.version;
    }
  } catch (error) {
    console.error('Error getting current version:', error);
  }
  return '1.0.0'; // fallback
}

// Periodic background sync (for APK)
self.addEventListener('periodicsync', (event) => {
  console.log('🔔 Periodic sync triggered:', event.tag);
  
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  } else if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('🔔 Service worker received message:', event.data);
  
  const { type, data } = event.data;
  
  if (type === 'SCHEDULE_REMINDER') {
    scheduleReminder(data.time);
  } else if (type === 'SEND_TEST_NOTIFICATION') {
    sendTestNotification();
  } else if (type === 'UPDATE_VERSION') {
    updateStoredVersion(data.version);
  }
});

// Schedule reminder using setTimeout (for immediate scheduling)
function scheduleReminder(time) {
  console.log('🔔 Scheduling reminder for:', time);
  
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, set for tomorrow
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const msUntilReminder = reminderTime.getTime() - now.getTime();
  
  setTimeout(() => {
    sendDailyReminder();
    
    // Set up daily interval
    setInterval(() => {
      sendDailyReminder();
    }, 24 * 60 * 60 * 1000);
  }, msUntilReminder);
}

// Send test notification
async function sendTestNotification() {
  await self.registration.showNotification('🧪 Test Notification', {
    body: 'This is a test notification to verify the system works!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'test-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { type: 'test' }
  });
}

// Update stored version
async function updateStoredVersion(version) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const versionData = { version, timestamp: Date.now() };
    
    await cache.put('/version.json', new Response(JSON.stringify(versionData), {
      headers: { 'Content-Type': 'application/json' }
    }));
    
    console.log('🔔 Version updated to:', version);
  } catch (error) {
    console.error('Error updating version:', error);
  }
}

console.log('🔔 Notification Service Worker loaded and ready!');