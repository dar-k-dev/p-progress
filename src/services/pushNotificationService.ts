import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { toast } from 'sonner';

const VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BzcOKiMMkXYdMiPnssSKCjxotkJsqFhD7SsVJjevVdqbve6vFgudZWI';

export class PushNotificationService {
  private messaging: any;
  private isSupported: boolean;
  private isAPK: boolean;
  private reminderIntervals: Map<string, NodeJS.Timeout> = new Map();
  private hasRequestedPermission: boolean = false;

  constructor() {
    this.isAPK = this.detectAPK();
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    
    console.log('🔔 Push Service initialized:', {
      isAPK: this.isAPK,
      isSupported: this.isSupported,
      userAgent: navigator.userAgent
    });
    
    if (this.isSupported && !this.isAPK) {
      try {
        this.messaging = getMessaging(app);
      } catch (error) {
        console.warn('Firebase messaging not available:', error);
        this.isSupported = false;
      }
    }

    // Auto-request permission for APK on first launch
    if (this.isAPK) {
      this.autoRequestAPKPermission();
    }
  }

  private detectAPK(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidWebView = userAgent.includes('wv') && userAgent.includes('android');
    const isCapacitor = !!(window as any).Capacitor;
    const isCordova = !!(window as any).cordova;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isAndroidChrome = userAgent.includes('android') && userAgent.includes('chrome');
    const hasAndroidPackage = userAgent.includes('android') && !userAgent.includes('mobile safari');
    
    return isAndroidWebView || isCapacitor || isCordova || (isStandalone && isAndroidChrome) || hasAndroidPackage;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔔 Initializing push notification service...');
      
      if (this.isAPK) {
        await this.initializeAPKNotifications();
      } else {
        await this.initializeWebNotifications();
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  private async initializeAPKNotifications(): Promise<void> {
    // For APK, we'll use local notifications and service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log('APK: Service worker ready for notifications');
    }
  }

  private async initializeWebNotifications(): Promise<void> {
    // For web, we can use Firebase messaging if needed
    console.log('Web: Notification service initialized');
  }

  private async autoRequestAPKPermission(): Promise<void> {
    // Wait a bit for the app to load, then request permission
    setTimeout(async () => {
      if (!this.hasRequestedPermission && Notification.permission === 'default') {
        console.log('🔔 APK: Auto-requesting notification permission');
        await this.requestPermission();
      }
    }, 2000);
  }

  async requestPermission(): Promise<boolean> {
    if (this.hasRequestedPermission && Notification.permission !== 'default') {
      return Notification.permission === 'granted';
    }

    this.hasRequestedPermission = true;

    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      console.log('🔔 Requesting notification permission for:', this.isAPK ? 'APK' : 'Web');
      
      if (this.isAPK) {
        return await this.requestAPKPermission();
      } else {
        return await this.requestWebPermission();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  private async requestAPKPermission(): Promise<boolean> {
    // For APK, show custom dialog first
    const userWantsNotifications = await this.showAPKPermissionDialog();
    if (!userWantsNotifications) {
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('🔔 APK: Notification permission granted');
      // Show welcome notification
      setTimeout(() => {
        this.showWelcomeNotification();
      }, 1000);
      return true;
    } else {
      console.log('🔔 APK: Notification permission denied');
      return false;
    }
  }

  private async requestWebPermission(): Promise<boolean> {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('🔔 Web: Notification permission granted');
      return true;
    } else {
      console.log('🔔 Web: Notification permission denied');
      return false;
    }
  }

  private async showAPKPermissionDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        backdrop-filter: blur(10px);
      `;
      
      dialog.innerHTML = `
        <div style="
          background: white;
          border-radius: 20px;
          padding: 30px;
          max-width: 320px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease-out;
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">🎯</div>
          <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">Stay Updated</h3>
          <p style="margin: 0 0 25px 0; color: #666; line-height: 1.5; font-size: 15px;">
            Get notified about:<br>
            • 🚀 App updates<br>
            • 📊 Daily progress reminders<br>
            • 🎯 Goal achievements
          </p>
          <div style="display: flex; gap: 12px;">
            <button id="deny-btn" style="
              flex: 1;
              padding: 14px;
              border: 1px solid #ddd;
              border-radius: 12px;
              background: white;
              font-size: 16px;
              cursor: pointer;
              color: #666;
              font-weight: 500;
            ">Not Now</button>
            <button id="allow-btn" style="
              flex: 1;
              padding: 14px;
              border: none;
              border-radius: 12px;
              background: #007AFF;
              color: white;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0,122,255,0.3);
            ">Allow</button>
          </div>
        </div>
        <style>
          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
      `;
      
      document.body.appendChild(dialog);
      
      const allowBtn = dialog.querySelector('#allow-btn');
      const denyBtn = dialog.querySelector('#deny-btn');
      
      allowBtn?.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(true);
      });
      
      denyBtn?.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(false);
      });

      // Auto-close after 30 seconds
      setTimeout(() => {
        if (document.body.contains(dialog)) {
          document.body.removeChild(dialog);
          resolve(false);
        }
      }, 30000);
    });
  }

  private async showWelcomeNotification(): Promise<void> {
    try {
      await this.showNotification('🎯 ProgressPulse Ready!', {
        body: 'Notifications enabled! You\'ll receive updates and daily reminders.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'welcome',
        requireInteraction: false,
        silent: false
      });
    } catch (error) {
      console.error('Failed to show welcome notification:', error);
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.isSupported || (!this.messaging && !this.isAPK)) {
      return null;
    }

    try {
      if (this.isAPK) {
        // For APK, generate a unique device token
        const deviceId = this.getDeviceId();
        return `apk_${deviceId}`;
      } else {
        const token = await getToken(this.messaging, {
          vapidKey: VAPID_KEY
        });
        return token;
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  async subscribeToUpdates(): Promise<PushSubscription | null> {
    if (!this.isSupported) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_KEY)
      });

      await this.storeSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromUpdates(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscription(subscription);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  setupMessageListener(callback: (payload: any) => void) {
    if (!this.isSupported) {
      return;
    }

    if (this.messaging) {
      onMessage(this.messaging, (payload) => {
        console.log('🔔 Message received:', payload);
        callback(payload);
        
        if (payload.notification) {
          this.showNotification(
            payload.notification.title || 'ProgressPulse',
            {
              body: payload.notification.body,
              icon: payload.notification.icon || '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png',
              data: payload.data,
              tag: payload.data?.type || 'general',
              requireInteraction: payload.data?.critical === 'true'
            }
          );
        }
      });
    }
  }

  // Daily reminder system
  async setupDailyReminders(time: string = '09:00'): Promise<void> {
    console.log('🔔 Setting up daily reminders for', time);
    
    // Clear existing reminders
    this.reminderIntervals.forEach(interval => clearInterval(interval));
    this.reminderIntervals.clear();

    if (Notification.permission !== 'granted') {
      console.log('🔔 Cannot setup reminders: permission not granted');
      return;
    }

    // Parse time (format: "HH:MM")
    const [hours, minutes] = time.split(':').map(Number);
    
    // Calculate milliseconds until next reminder
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, set for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const msUntilReminder = reminderTime.getTime() - now.getTime();
    
    // Set initial timeout
    setTimeout(() => {
      this.sendDailyReminder();
      
      // Set daily interval
      const dailyInterval = setInterval(() => {
        this.sendDailyReminder();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      this.reminderIntervals.set('daily', dailyInterval);
    }, msUntilReminder);

    console.log(`🔔 Daily reminder scheduled for ${time} (in ${Math.round(msUntilReminder / 1000 / 60)} minutes)`);
  }

  private async sendDailyReminder(): Promise<void> {
    const reminders = [
      {
        title: '🎯 Daily Progress Check',
        body: 'How are your goals coming along today?'
      },
      {
        title: '📊 Track Your Progress',
        body: 'Take a moment to update your achievements!'
      },
      {
        title: '🚀 Keep Going!',
        body: 'You\'re doing great! Check your progress.'
      },
      {
        title: '⭐ Goal Reminder',
        body: 'Don\'t forget to work on your goals today!'
      }
    ];

    const reminder = reminders[Math.floor(Math.random() * reminders.length)];
    
    await this.showNotification(reminder.title, {
      body: reminder.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'daily-reminder',
      requireInteraction: false,
      data: {
        type: 'reminder',
        action: 'open-app'
      }
    });

    console.log('🔔 Daily reminder sent:', reminder.title);
  }

  // Update notification system
  async sendUpdateNotification(version: string, changes: string[]): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.log('🔔 Cannot send update notification: permission not granted');
      return;
    }

    const changesList = changes.slice(0, 3).join('\n• ');
    
    await this.showNotification('🚀 ProgressPulse Update Available', {
      body: `Version ${version} is ready!\n\n• ${changesList}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'app-update',
      requireInteraction: true,
      data: {
        type: 'update',
        version: version,
        action: 'open-settings'
      }
    });

    console.log('🔔 Update notification sent for version:', version);
  }

  async showNotification(title: string, options: NotificationOptions = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.log('🔔 Cannot show notification: not supported or permission denied');
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        const notificationOptions: any = {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          ...options
        };
        
        // Add vibration for APK (not in TypeScript types but works)
        if (this.isAPK) {
          notificationOptions.vibrate = [200, 100, 200];
        }
        
        await registration.showNotification(title, notificationOptions);
        
        console.log('🔔 Notification shown:', title);
      } else {
        // Fallback for environments without service worker
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          ...options
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private async storeSubscription(subscription: PushSubscription) {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        isAPK: this.isAPK
      };

      localStorage.setItem('push-subscription', JSON.stringify(subscriptionData));
      console.log('🔔 Push subscription stored:', subscriptionData);
    } catch (error) {
      console.error('Error storing subscription:', error);
    }
  }

  private async removeSubscription(subscription: PushSubscription) {
    try {
      localStorage.removeItem('push-subscription');
      console.log('🔔 Push subscription removed');
    } catch (error) {
      console.error('Error removing subscription:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Getters
  get isNotificationSupported(): boolean {
    return this.isSupported && 'Notification' in window;
  }

  get notificationPermission(): NotificationPermission {
    return this.isNotificationSupported ? Notification.permission : 'denied';
  }

  get isRunningAsAPK(): boolean {
    return this.isAPK;
  }

  // Test notification for debugging
  async sendTestNotification(): Promise<void> {
    await this.showNotification('🧪 Test Notification', {
      body: 'This is a test notification to verify the system works!',
      tag: 'test',
      requireInteraction: false
    });
  }
}

export const pushNotificationService = new PushNotificationService();