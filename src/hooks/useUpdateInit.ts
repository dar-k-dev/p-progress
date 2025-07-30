import { useEffect } from 'react';
import { useUpdateStore } from '@/stores/useUpdateStore';
import { pushNotificationService } from '@/services/pushNotificationService';
import { toast } from 'sonner';

export function useUpdateInit() {
  const { 
    checkForUpdates, 
    updateNotifications, 
    autoUpdate,
    availableUpdate,
    downloadUpdate 
  } = useUpdateStore();

  useEffect(() => {
    // Initialize push notifications
    const initializePushNotifications = async () => {
      if (updateNotifications) {
        try {
          // Request permission
          const hasPermission = await pushNotificationService.requestPermission();
          
          if (hasPermission) {
            // Subscribe to updates
            await pushNotificationService.subscribeToUpdates();
            
            // Set up message listener
            pushNotificationService.setupMessageListener((payload) => {
              console.log('Update notification received:', payload);
              
              if (payload.data?.type === 'update') {
                // Trigger update check
                checkForUpdates();
                
                // Show toast notification
                toast.info('🚀 New update available!', {
                  description: `Version ${payload.data.version} is ready to install`,
                  action: {
                    label: 'Update Now',
                    onClick: () => {
                      window.location.href = '/settings?tab=updates';
                    }
                  },
                  duration: 10000
                });
              }
            });
          }
        } catch (error) {
          console.error('Failed to initialize push notifications:', error);
        }
      }
    };

    initializePushNotifications();
  }, [updateNotifications, checkForUpdates]);

  useEffect(() => {
    // Auto-update logic
    if (autoUpdate && availableUpdate) {
      const handleAutoUpdate = async () => {
        try {
          // Check if it's a critical update or user has auto-update enabled
          if (availableUpdate.critical || autoUpdate) {
            toast.info('🔄 Auto-updating app...', {
              description: `Installing version ${availableUpdate.version}`,
              duration: 5000
            });
            
            await downloadUpdate(availableUpdate);
          }
        } catch (error) {
          console.error('Auto-update failed:', error);
          toast.error('Auto-update failed', {
            description: 'Please update manually from settings'
          });
        }
      };

      // Delay auto-update to avoid interrupting user
      const timer = setTimeout(handleAutoUpdate, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoUpdate, availableUpdate, downloadUpdate]);

  useEffect(() => {
    // Check for updates on app start
    const checkOnStart = async () => {
      try {
        await checkForUpdates();
      } catch (error) {
        console.error('Failed to check for updates on start:', error);
      }
    };

    checkOnStart();

    // Set up periodic update checks (every 30 minutes)
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  useEffect(() => {
    // Register service worker for push notifications (only once)
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Check if service worker is already registered
          const existingRegistration = await navigator.serviceWorker.getRegistration('/sw-push.js');
          if (existingRegistration) {
            console.log('Push service worker already registered');
            return;
          }

          const registration = await navigator.serviceWorker.register('/sw-push.js');
          console.log('Push service worker registered:', registration);
          
          // Listen for service worker updates (only once per session)
          let updateNotificationShown = false;
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker && !updateNotificationShown) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !updateNotificationShown) {
                  updateNotificationShown = true;
                  // New service worker is available
                  toast.info('🔄 App update ready', {
                    description: 'Restart the app to apply updates',
                    action: {
                      label: 'Restart',
                      onClick: () => window.location.reload()
                    },
                    duration: 10000
                  });
                }
              });
            }
          });
        } catch (error) {
          console.error('Failed to register push service worker:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  // Handle URL parameters for update actions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'update' && availableUpdate) {
      // Auto-trigger update if coming from notification
      downloadUpdate(availableUpdate);
    }
  }, [availableUpdate, downloadUpdate]);
}