import { useEffect, useState } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';

export function useAPKNotifications() {
  const [isAPK, setIsAPK] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    const checkAPKEnvironment = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroidWebView = userAgent.includes('wv') && userAgent.includes('android');
      const isCapacitor = !!(window as any).Capacitor;
      const isCordova = !!(window as any).cordova;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isAndroidChrome = userAgent.includes('android') && userAgent.includes('chrome');
      
      const apkDetected = isAndroidWebView || isCapacitor || isCordova || (isStandalone && isAndroidChrome);
      
      console.log('🔔 APK Detection:', {
        isAndroidWebView,
        isCapacitor,
        isCordova,
        isStandalone,
        isAndroidChrome,
        apkDetected,
        userAgent
      });
      
      setIsAPK(apkDetected);
      return apkDetected;
    };

    const initializeAPKNotifications = async () => {
      const isAPKEnv = checkAPKEnvironment();
      
      if (isAPKEnv && !permissionRequested) {
        console.log('🔔 APK detected, initializing notifications...');
        
        // Wait for app to fully load
        setTimeout(async () => {
          try {
            // Register enhanced service worker for APK
            if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
                scope: '/'
              });
              
              console.log('🔔 APK notification service worker registered:', registration);
              
              // Wait for service worker to be ready
              await navigator.serviceWorker.ready;
            }
            
            // Request permission automatically for APK
            if (Notification.permission === 'default') {
              console.log('🔔 APK: Auto-requesting notification permission');
              const granted = await pushNotificationService.requestPermission();
              
              if (granted) {
                console.log('🔔 APK: Notification permission granted');
                
                // Set up background sync for APK
                await setupAPKBackgroundSync();
                
                // Show welcome notification
                setTimeout(() => {
                  pushNotificationService.showNotification('🎯 ProgressPulse Ready!', {
                    body: 'Notifications enabled! You\'ll receive updates and reminders.',
                    tag: 'apk-welcome',
                    requireInteraction: false
                  });
                }, 1000);
              } else {
                console.log('🔔 APK: Notification permission denied');
              }
            }
            
            setPermissionRequested(true);
          } catch (error) {
            console.error('🔔 APK notification initialization error:', error);
          }
        }, 3000); // Wait 3 seconds for app to load
      }
    };

    initializeAPKNotifications();
  }, [permissionRequested]);

  return {
    isAPK,
    permissionRequested
  };
}

async function setupAPKBackgroundSync() {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Try to register background sync (may not be available in all browsers)
      try {
        const syncRegistration = (registration as any).sync;
        if (syncRegistration) {
          await syncRegistration.register('daily-reminder');
          console.log('🔔 APK: Background sync registered for daily reminders');
          
          await syncRegistration.register('check-updates');
          console.log('🔔 APK: Background sync registered for update checks');
        }
      } catch (error) {
        console.log('🔔 APK: Background sync not available:', (error as Error).message);
      }
      
      // Try to register periodic sync if available (experimental)
      try {
        const periodicSync = (registration as any).periodicSync;
        if (periodicSync) {
          await periodicSync.register('daily-reminder', {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours
          });
          console.log('🔔 APK: Periodic sync registered for daily reminders');
        }
      } catch (error) {
        console.log('🔔 APK: Periodic sync not available:', (error as Error).message);
      }
    }
  } catch (error) {
    console.error('🔔 APK: Error setting up background sync:', error);
  }
}