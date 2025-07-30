import { initializeMessaging, getToken, onMessage, vapidKey } from './firebase';
import { db } from './database';

export class PushNotificationService {
  private static instance: PushNotificationService;
  private messaging: any = null;
  private fcmToken: string | null = null;
  private isNativeApp: boolean = false;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  constructor() {
    this.detectEnvironment();
    this.initialize();
  }

  private detectEnvironment() {
    // Detect if running in native app wrapper (Median.co)
    this.isNativeApp = !!(
      (window as any).median ||
      (window as any).cordova ||
      (window as any).PhoneGap ||
      navigator.userAgent.includes('wv') || // WebView
      navigator.userAgent.includes('Median')
    );
    
    console.log('Environment detected:', this.isNativeApp ? 'Native App' : 'Web Browser');
  }

  private async initialize() {
    try {
      if (this.isNativeApp) {
        await this.initializeNativeNotifications();
      } else {
        await this.initializeWebNotifications();
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  private async initializeWebNotifications() {
    try {
      this.messaging = await initializeMessaging();
      
      if (this.messaging) {
        // Get FCM token for web
        this.fcmToken = await getToken(this.messaging, {
          vapidKey: vapidKey
        });
        
        console.log('FCM Token (Web):', this.fcmToken);
        
        // Listen for foreground messages
        onMessage(this.messaging, (payload) => {
          console.log('Foreground message received:', payload);
          this.handleForegroundMessage(payload);
        });
      }
    } catch (error) {
      console.error('Web notifications initialization failed:', error);
    }
  }

  private async initializeNativeNotifications() {
    try {
      // For Median.co apps, use their native push notification API
      if ((window as any).median && (window as any).median.push) {
        console.log('Initializing Median.co push notifications');
        
        // Register for push notifications
        (window as any).median.push.register({
          callback: (token: string) => {
            this.fcmToken = token;
            console.log('FCM Token (Native):', token);
            this.sendTokenToServer(token);
          },
          error: (error: any) => {
            console.error('Native push registration failed:', error);
          }
        });

        // Listen for push messages
        (window as any).median.push.onMessage({
          callback: (payload: any) => {
            console.log('Native push message received:', payload);
            this.handleNativeMessage(payload);
          }
        });
      } else {
        // Fallback to web notifications for other native wrappers
        await this.initializeWebNotifications();
      }
    } catch (error) {
      console.error('Native notifications initialization failed:', error);
      // Fallback to web notifications
      await this.initializeWebNotifications();
    }
  }

  private handleForegroundMessage(payload: any) {
    const { notification, data } = payload;
    
    // Show notification using browser API
    if (Notification.permission === 'granted') {
      new Notification(notification?.title || 'ProgressPulse', {
        body: notification?.body,
        icon: notification?.icon || '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        tag: data?.tag || 'default',
        data: data
      });
    }
  }

  private handleNativeMessage(payload: any) {
    // Handle native push message
    console.log('Handling native message:', payload);
    
    // Store notification in database
    if (payload.userId) {
      db.createNotification({
        userId: payload.userId,
        type: payload.type || 'general',
        title: payload.title || 'ProgressPulse',
        message: payload.body || payload.message || '',
        read: false,
        goalId: payload.goalId
      });
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (this.isNativeApp) {
        // For native apps, permission is usually handled during app install
        return true;
      } else {
        // For web, request notification permission
        if (!('Notification' in window)) {
          console.warn('This browser does not support notifications');
          return false;
        }

        if (Notification.permission === 'granted') {
          return true;
        }

        if (Notification.permission === 'denied') {
          return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    return this.fcmToken;
  }

  private async sendTokenToServer(token: string) {
    try {
      // In a real app, send this token to your backend server
      // The server will use this token to send push notifications
      console.log('Token to send to server:', token);
      
      // Store token locally for now
      localStorage.setItem('fcm_token', token);
      
      // You would typically send this to your backend:
      // await fetch('/api/register-push-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userId: currentUserId })
      // });
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  async sendNotificationToServer(data: {
    title: string;
    body: string;
    userId?: string;
    type?: string;
    goalId?: string;
    scheduledTime?: Date;
  }) {
    try {
      // This is where you'd send the notification request to your backend
      // Your backend would then use FCM Admin SDK to send the push notification
      
      console.log('Notification data to send to server:', data);
      
      // Example API call (implement this in your backend):
      // await fetch('/api/send-push-notification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     token: this.fcmToken,
      //     notification: {
      //       title: data.title,
      //       body: data.body
      //     },
      //     data: {
      //       type: data.type,
      //       userId: data.userId,
      //       goalId: data.goalId
      //     }
      //   })
      // });
      
      // For now, show local notification as fallback
      if (this.isNativeApp && (window as any).median?.push) {
        (window as any).median.push.showNotification({
          title: data.title,
          body: data.body,
          data: {
            type: data.type,
            userId: data.userId,
            goalId: data.goalId
          }
        });
      } else {
        // Web fallback
        if (Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-64x64.png',
            tag: data.type || 'default'
          });
        }
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Enhanced methods for different notification types
  async sendGoalCompletedNotification(userId: string, goalTitle: string) {
    await this.sendNotificationToServer({
      title: '🏆 Goal Completed!',
      body: `Congratulations! You've completed "${goalTitle}"!`,
      userId,
      type: 'goal_completed'
    });
  }

  async sendDailyReminderNotification(userId: string, message: string) {
    await this.sendNotificationToServer({
      title: '⏰ Daily Reminder',
      body: message,
      userId,
      type: 'daily_reminder'
    });
  }

  async sendProgressUpdateNotification(userId: string, goalTitle: string, progress: number) {
    await this.sendNotificationToServer({
      title: '📈 Progress Update',
      body: `Great progress on "${goalTitle}"! You're ${progress}% complete.`,
      userId,
      type: 'progress_update'
    });
  }

  async sendStreakNotification(userId: string, days: number) {
    await this.sendNotificationToServer({
      title: '🔥 Streak Alert!',
      body: `Amazing! You're on a ${days}-day streak. Keep it going!`,
      userId,
      type: 'streak_notification'
    });
  }

  async scheduleNotification(data: {
    title: string;
    body: string;
    scheduledTime: Date;
    userId?: string;
    type?: string;
  }) {
    const delay = data.scheduledTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        this.sendNotificationToServer(data);
      }, delay);
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();