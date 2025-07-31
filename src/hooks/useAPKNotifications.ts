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
      const isPWABuilder = userAgent.includes('pwabuilder') || userAgent.includes('twa');
      const isWebAPK = userAgent.includes('webapk');
      
      // More aggressive APK detection
      const apkDetected = isAndroidWebView || isCapacitor || isCordova || isPWABuilder || isWebAPK || 
                         (isStandalone && isAndroidChrome) || 
                         (window.location.protocol === 'https:' && isStandalone);
      
      console.log('🔔 APK Detection:', {
        isAndroidWebView,
        isCapacitor,
        isCordova,
        isStandalone,
        isAndroidChrome,
        isPWABuilder,
        isWebAPK,
        apkDetected,
        userAgent,
        protocol: window.location.protocol
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
            
            // Force permission request for APK - more aggressive approach
            console.log('🔔 APK: Current permission status:', Notification.permission);
            
            if (Notification.permission === 'default' || Notification.permission === 'denied') {
              console.log('🔔 APK: Requesting notification permission with dialog');
              
              // Show custom permission dialog first
              const userWantsNotifications = await showAPKPermissionDialog();
              
              if (userWantsNotifications) {
                // Multiple attempts to request permission
                let permission = await requestNotificationPermissionAggressively();
                console.log('🔔 APK: Final permission result:', permission);
                
                if (permission === 'granted') {
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
              } else {
                console.log('🔔 APK: User declined notification permission');
              }
            } else if (Notification.permission === 'granted') {
              console.log('🔔 APK: Notifications already granted');
              await setupAPKBackgroundSync();
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

// Aggressive notification permission request for APK
async function requestNotificationPermissionAggressively(): Promise<NotificationPermission> {
  console.log('🔔 APK: Starting aggressive permission request...');
  
  try {
    // Method 1: Standard request
    let permission = await Notification.requestPermission();
    console.log('🔔 APK: Standard request result:', permission);
    
    if (permission === 'granted') return permission;
    
    // Method 2: Try with user gesture simulation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a user interaction event
    const button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.top = '-1000px';
    button.style.left = '-1000px';
    button.style.opacity = '0';
    button.style.pointerEvents = 'none';
    document.body.appendChild(button);
    
    button.click();
    
    permission = await Notification.requestPermission();
    console.log('🔔 APK: Second attempt result:', permission);
    
    document.body.removeChild(button);
    
    if (permission === 'granted') return permission;
    
    // Method 3: Try with service worker registration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.pushManager) {
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: null
          }).catch(() => {
            console.log('🔔 APK: Push subscription failed, but continuing...');
          });
        }
      } catch (error) {
        console.log('🔔 APK: Service worker push attempt failed:', error);
      }
      
      permission = await Notification.requestPermission();
      console.log('🔔 APK: Third attempt result:', permission);
    }
    
    return permission;
  } catch (error) {
    console.error('🔔 APK: Error in aggressive permission request:', error);
    return Notification.permission;
  }
}

// Custom permission dialog for APK
function showAPKPermissionDialog(): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    dialog.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 320px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">🔔</div>
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px; font-weight: 600;">
          Enable Notifications
        </h2>
        <p style="margin: 0 0 25px 0; color: #666; font-size: 16px; line-height: 1.4;">
          Get daily reminders to track your progress and notifications when app updates are available.
        </p>
        <div style="display: flex; gap: 10px;">
          <button id="deny-btn" style="
            flex: 1;
            padding: 12px;
            border: 2px solid #ddd;
            background: white;
            color: #666;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
          ">Not Now</button>
          <button id="allow-btn" style="
            flex: 1;
            padding: 12px;
            border: none;
            background: #007AFF;
            color: white;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
          ">Allow</button>
        </div>
      </div>
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
  });
}