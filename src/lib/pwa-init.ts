// PWA Initialization for APK deployment
export class PWAInitializer {
  private static instance: PWAInitializer;

  static getInstance(): PWAInitializer {
    if (!PWAInitializer.instance) {
      PWAInitializer.instance = new PWAInitializer();
    }
    return PWAInitializer.instance;
  }

  async initialize(): Promise<void> {
    console.log('Initializing PWA for APK environment...');
    
    // 1. Register Service Worker
    await this.registerServiceWorker();
    
    // 2. Initialize Push Notifications
    await this.initializePushNotifications();
    
    // 3. Setup offline capabilities
    await this.setupOfflineCapabilities();
    
    // 4. Handle app install prompt
    this.handleInstallPrompt();
    
    // 5. Setup background sync
    await this.setupBackgroundSync();
    
    console.log('PWA initialization complete');
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Register Firebase messaging service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered:', registration);
        
        // Update service worker when new version available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New service worker available');
                this.showUpdateAvailableNotification();
              }
            });
          }
        });
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private async initializePushNotifications(): Promise<void> {
    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        
        if (permission === 'granted') {
          // Initialize Firebase messaging
          const { getMessaging, getToken, onMessage } = await import('firebase/messaging');
          const { initializeApp } = await import('firebase/app');
          
          const firebaseConfig = {
            apiKey: "AIzaSyBPE9kaWcLofrUh_dT_pswPDNkEhVtSBjU",
            authDomain: "progresspulse-5c1c9.firebaseapp.com",
            projectId: "progresspulse-5c1c9",
            storageBucket: "progresspulse-5c1c9.firebasestorage.app",
            messagingSenderId: "1020367919471",
            appId: "1:1020367919471:web:245125af8144bac9e3b09a"
          };
          
          const app = initializeApp(firebaseConfig);
          const messaging = getMessaging(app);
          
          // Get FCM token
          try {
            const token = await getToken(messaging, {
              vapidKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI'
            });
            
            if (token) {
              console.log('FCM Token:', token);
              localStorage.setItem('fcm_token', token);
            }
          } catch (tokenError) {
            console.warn('Failed to get FCM token:', tokenError);
          }
          
          // Handle foreground messages
          onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            this.showForegroundNotification(payload);
          });
        }
      }
    } catch (error) {
      console.error('Push notification initialization failed:', error);
    }
  }

  private async setupOfflineCapabilities(): Promise<void> {
    // Cache important resources for offline use
    if ('caches' in window) {
      try {
        const cache = await caches.open('progresspulse-v1');
        
        const resourcesToCache = [
          '/',
          '/manifest.json',
          '/pwa-192x192.png',
          '/pwa-512x512.png'
        ];
        
        await cache.addAll(resourcesToCache);
        console.log('Resources cached for offline use');
      } catch (error) {
        console.warn('Offline caching failed:', error);
      }
    }
  }

  private handleInstallPrompt(): void {
    let deferredPrompt: any;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('Install prompt available');
      
      // Show custom install button if needed
      this.showInstallButton(deferredPrompt);
    });
    
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
    });
  }

  private async setupBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Register background sync for offline data
        // Background sync is not available in all browsers
        if ('sync' in registration) {
          await (registration as any).sync.register('background-sync');
        }
        console.log('Background sync registered');
      } catch (error) {
        console.warn('Background sync not supported:', error);
      }
    }
  }

  private showForegroundNotification(payload: any): void {
    const title = payload.notification?.title || 'ProgressPulse';
    const options = {
      body: payload.notification?.body || 'You have a new notification',
      icon: payload.notification?.icon || '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      tag: payload.data?.tag || 'default',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: payload.data
    };
    
    new Notification(title, options);
  }

  private showUpdateAvailableNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of ProgressPulse is available. Refresh to update.',
        icon: '/pwa-192x192.png',
        tag: 'app-update',
        requireInteraction: true
      });
    }
  }

  private showInstallButton(deferredPrompt: any): void {
    // This would show a custom install button in your UI
    console.log('App can be installed');
    
    // Example: dispatch custom event to show install button
    window.dispatchEvent(new CustomEvent('pwa-installable', {
      detail: { prompt: deferredPrompt }
    }));
  }

  // Method to trigger app install
  async installApp(deferredPrompt: any): Promise<boolean> {
    if (!deferredPrompt) return false;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('Install prompt outcome:', outcome);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  }

  // Check if app is running in standalone mode (installed as APK)
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Check if running in APK environment
  isAPK(): boolean {
    return document.referrer.includes('android-app://') ||
           window.location.protocol === 'file:' ||
           (window as any).Android !== undefined;
  }
}

export const pwaInitializer = PWAInitializer.getInstance();