import { db } from './database';
import { pushNotificationService } from './pushNotifications';

export class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: Map<string, number> = new Map();
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private dailyReminderInterval: number | null = null;
  private vapidPublicKey: string = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI'; // Replace with your VAPID key
  private pushSubscription: PushSubscription | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.initializeServiceWorker();
    this.initializeDailyReminders();
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker if not already registered
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        // Wait for service worker to be ready
        this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
        
        console.log('Service Worker registered successfully');
        await this.initializePushSubscription();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        
        // Fallback: try to get existing registration
        try {
          this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
          await this.initializePushSubscription();
        } catch (fallbackError) {
          console.error('Service Worker fallback failed:', fallbackError);
        }
      }
    }
  }

  private async initializePushSubscription() {
    if (!this.serviceWorkerRegistration) return;

    try {
      // Check if already subscribed
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (!this.pushSubscription) {
        // Subscribe to push notifications
        this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
        
        // Send subscription to server (in real app)
        console.log('Push subscription:', JSON.stringify(this.pushSubscription));
      }
    } catch (error) {
      console.error('Failed to initialize push subscription:', error);
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

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      console.error('Service Worker not available');
      return null;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });
      
      this.pushSubscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async sendPushNotification(data: {
    title: string;
    body: string;
    tag?: string;
    url?: string;
    icon?: string;
  }): Promise<void> {
    // In a real app, this would send to your server which then sends via FCM
    // For demo, we'll simulate a local push
    if (this.serviceWorkerRegistration) {
      await this.serviceWorkerRegistration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        tag: data.tag || 'default',
        requireInteraction: true,
        data: { url: data.url }
      });
    }
  }

  private initializeDailyReminders() {
    // Set up daily reminder check every minute
    this.dailyReminderInterval = window.setInterval(() => {
      this.checkAndSendDailyReminders();
    }, 60000); // Check every minute
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      // Enhanced permission request for APK
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Also request push notification permission
        if (this.serviceWorkerRegistration) {
          try {
            await this.subscribeToPush();
          } catch (error) {
            console.warn('Push subscription failed:', error);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async showNotification(title: string, options?: NotificationOptions, userId?: string, type?: string, goalId?: string): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    // Store notification in database
    if (userId) {
      await db.createNotification({
        userId,
        type: type as any || 'reminder',
        title,
        message: options?.body || '',
        read: false,
        goalId
      });
    }
    
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    // Use enhanced push notification service for both web and native
    await pushNotificationService.sendNotificationToServer({
      title,
      body: options?.body || '',
      userId,
      type,
      goalId
    });

    // Fallback to original method for web compatibility
    const defaultOptions: NotificationOptions = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      requireInteraction: true,
      ...options
    };

    await this.sendPushNotification({
      title,
      body: options?.body || '',
      tag: options?.tag,
      icon: options?.icon,
      url: '/'
    });
  }

  async scheduleReminder(time: string, message: string): Promise<void> {
    // In a real app, you'd use service worker for background notifications
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification('ProgressPulse Reminder', {
        body: message,
        tag: 'daily-reminder'
      });
    }, timeUntilReminder);
  }

  async showProgressCelebration(goalTitle: string, progress: number): Promise<void> {
    await this.showNotification('🎉 Progress Update!', {
      body: `Great job! You've made progress on "${goalTitle}". Keep it up!`,
      tag: 'progress-celebration'
    });
  }

  async showGoalCompleted(goalTitle: string): Promise<void> {
    await this.showNotification('🏆 Goal Completed!', {
      body: `Congratulations! You've completed "${goalTitle}"!`,
      tag: 'goal-completed'
    });
  }

  async showDailyQuotaReminder(goalTitle: string, amount: number, unit: string): Promise<void> {
    await this.showNotification('📊 Daily Quota Reminder', {
      body: `Don't forget your daily quota for "${goalTitle}": ${amount} ${unit}`,
      tag: 'daily-quota'
    });
  }

  async showMilestoneAchieved(goalTitle: string, milestone: string): Promise<void> {
    await this.showNotification('🎯 Milestone Achieved!', {
      body: `You've reached ${milestone} for "${goalTitle}"!`,
      tag: 'milestone-achieved'
    });
  }

  async showStreakNotification(days: number): Promise<void> {
    await this.showNotification('🔥 Streak Alert!', {
      body: `Amazing! You're on a ${days}-day streak. Keep it going!`,
      tag: 'streak-notification'
    });
  }

  async scheduleDailyQuotaReminders(goals: any[], morningTime: string = '09:00', eveningTime: string = '18:00'): Promise<void> {
    // Clear existing reminders
    this.clearAllReminders();

    for (const goal of goals) {
      if (goal.category === 'finance' && goal.status === 'active') {
        // Schedule morning reminder
        this.scheduleNotificationInternal(`morning-${goal.id}`, morningTime, () => {
          this.showDailyQuotaReminder(goal.title, goal.dailyTarget || 0, goal.unit || '');
        });

        // Schedule evening reminder
        this.scheduleNotificationInternal(`evening-${goal.id}`, eveningTime, () => {
          this.showDailyQuotaReminder(goal.title, goal.dailyTarget || 0, goal.unit || '');
        });
      }
    }
  }

  private scheduleNotificationInternal(id: string, time: string, callback: () => void): void {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const delay = targetTime.getTime() - now.getTime();
    const timeoutId = setTimeout(callback, delay);
    
    this.scheduledNotifications.set(id, timeoutId as any);
  }

  clearAllReminders(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  clearReminder(id: string): void {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
    }
  }

  async sendAllNotificationTypes(data: any): Promise<void> {
    // This method ensures EVERY notification is sent as push notification
    const { type, title, message, goalTitle, userId, ...extra } = data;

    switch (type) {
      case 'daily_reminder':
        await this.scheduleReminder(extra.time || '09:00', message);
        break;
      case 'progress_update':
        await this.showProgressCelebration(goalTitle, extra.progress);
        break;
      case 'goal_completed':
        await this.showGoalCompleted(goalTitle);
        break;
      case 'milestone_achieved':
        await this.showMilestoneAchieved(goalTitle, extra.milestone);
        break;
      case 'daily_quota':
        await this.showDailyQuotaReminder(goalTitle, extra.amount, extra.unit);
        break;
      case 'streak_notification':
        await this.showStreakNotification(extra.days);
        break;
      default:
        await this.showNotification(title, {
          body: message,
          tag: type
        }, userId, type);
    }
  }

  private async checkAndSendDailyReminders(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Get all users and check their reminder preferences
      const users = await db.users.toArray();
      
      for (const user of users) {
        if (user.preferences?.notifications && user.preferences?.reminderTime === currentTime) {
          await this.showNotification(
            '⏰ Daily Progress Reminder',
            {
              body: "Don't forget to update your progress today! Keep your momentum going!",
              tag: 'daily-reminder',
              requireInteraction: true
            },
            user.id,
            'reminder'
          );
        }
      }
    } catch (error) {
      console.error('Failed to check daily reminders:', error);
    }
  }

  async scheduleNotification(data: {
    id: string;
    title: string;
    body: string;
    scheduledTime: Date;
    data?: any;
  }): Promise<void> {
    const delay = data.scheduledTime.getTime() - Date.now();
    
    if (delay > 0) {
      const timeoutId = setTimeout(async () => {
        await this.showNotification(data.title, {
          body: data.body,
          tag: data.id,
          data: data.data
        });
        this.scheduledNotifications.delete(data.id);
      }, delay);
      
      this.scheduledNotifications.set(data.id, timeoutId as any);
    }
  }

  async cancelScheduledNotification(id: string): Promise<void> {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
    }
  }

  // Enhanced notification methods with proper push notification support
  async sendAccountCreatedNotification(userId: string, userName: string): Promise<void> {
    await this.showNotification(
      '🎉 Welcome to ProgressPulse!',
      {
        body: `Hi ${userName}! Your account has been created successfully. Start tracking your goals now!`,
        tag: 'account-created',
        requireInteraction: true
      },
      userId,
      'achievement'
    );
  }

  async sendGoalCompletedNotification(userId: string, goalTitle: string): Promise<void> {
    await this.showNotification(
      '🏆 Goal Completed!',
      {
        body: `Congratulations! You've successfully completed "${goalTitle}"!`,
        tag: 'goal-completed',
        requireInteraction: true
      },
      userId,
      'goal_completed'
    );
  }

  async sendSpreadsheetCompletedNotification(userId: string, goalTitle: string): Promise<void> {
    await this.showNotification(
      '📊 Daily Quota Completed!',
      {
        body: `Great job! You've completed today's quota for "${goalTitle}"!`,
        tag: 'spreadsheet-completed',
        requireInteraction: true
      },
      userId,
      'daily_quota'
    );
  }

  async sendAchievementUnlockedNotification(userId: string, achievementTitle: string): Promise<void> {
    await this.showNotification(
      '🏅 Achievement Unlocked!',
      {
        body: `You've unlocked the "${achievementTitle}" achievement! Keep up the great work!`,
        tag: 'achievement-unlocked',
        requireInteraction: true
      },
      userId,
      'achievement'
    );
  }

  destroy(): void {
    if (this.dailyReminderInterval) {
      clearInterval(this.dailyReminderInterval);
      this.dailyReminderInterval = null;
    }
    this.clearAllReminders();
  }
}

export const notificationService = NotificationService.getInstance();
