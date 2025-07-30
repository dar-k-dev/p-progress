// Firebase Messaging Service Worker - Enhanced for APK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPE9kaWcLofrUh_dT_pswPDNkEhVtSBjU",
  authDomain: "progresspulse-5c1c9.firebaseapp.com",
  projectId: "progresspulse-5c1c9",
  storageBucket: "progresspulse-5c1c9.firebasestorage.app",
  messagingSenderId: "1020367919471",
  appId: "1:1020367919471:web:245125af8144bac9e3b09a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Enhanced for mobile APK environment
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle background messages - Enhanced for APK
messaging.onBackgroundMessage((payload) => {
  console.log('Background Message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'ProgressPulse';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    tag: payload.data?.tag || 'default',
    requireInteraction: true,
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ],
    // Enhanced for mobile
    vibrate: [200, 100, 200],
    silent: false,
    renotify: true
  };

  // Force notification display in APK environment
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          const targetUrl = event.notification.data?.url || '/';
          return clients.openWindow(targetUrl);
        }
      })
  );
});