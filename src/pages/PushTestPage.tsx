import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pushNotificationService } from '@/lib/pushNotifications';
import { notificationService } from '@/lib/notifications';
import { useAuth } from '@/hooks/useAuth';

export function PushTestPage() {
  const { user } = useAuth();
  const [environment, setEnvironment] = useState<'web' | 'native' | 'unknown'>('unknown');
  const [token, setToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  useEffect(() => {
    const detectEnvironment = () => {
      const isNative = !!(
        (window as any).median ||
        (window as any).cordova ||
        (window as any).PhoneGap ||
        navigator.userAgent.includes('wv') ||
        navigator.userAgent.includes('Median')
      );
      
      setEnvironment(isNative ? 'native' : 'web');
    };

    const initializeNotifications = async () => {
      try {
        const hasPermission = await pushNotificationService.requestPermission();
        setPermissionStatus(hasPermission ? 'granted' : 'denied');
        
        const fcmToken = await pushNotificationService.getToken();
        setToken(fcmToken);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        setPermissionStatus('error');
      }
    };

    detectEnvironment();
    initializeNotifications();
  }, []);

  const testNotifications = [
    {
      id: 'goal_completed',
      title: 'Test Goal Completion',
      action: () => notificationService.sendGoalCompletedNotification(user?.id || 'test', 'Test Goal'),
      description: 'Tests goal completion notification'
    },
    {
      id: 'daily_reminder',
      title: 'Test Daily Reminder',
      action: () => pushNotificationService.sendDailyReminderNotification(user?.id || 'test', 'Don\'t forget to update your progress!'),
      description: 'Tests daily reminder notification'
    },
    {
      id: 'progress_update',
      title: 'Test Progress Update',
      action: () => pushNotificationService.sendProgressUpdateNotification(user?.id || 'test', 'Test Goal', 75),
      description: 'Tests progress update notification'
    },
    {
      id: 'streak_notification',
      title: 'Test Streak Alert',
      action: () => pushNotificationService.sendStreakNotification(user?.id || 'test', 7),
      description: 'Tests streak notification'
    },
    {
      id: 'custom_notification',
      title: 'Test Custom Notification',
      action: () => notificationService.showNotification(
        '🧪 Test Notification',
        {
          body: 'This is a test notification to verify push notifications work in both web and APK!',
          tag: 'test-notification',
          requireInteraction: true
        },
        user?.id,
        'test'
      ),
      description: 'Tests custom notification'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Push Notification Test</h1>
        <p className="text-muted-foreground">
          Test push notifications for both web and native APK environments
        </p>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>Current app environment and notification status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Environment:</span>
            <Badge variant={environment === 'native' ? 'default' : 'secondary'}>
              {environment.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Permission Status:</span>
            <Badge variant={permissionStatus === 'granted' ? 'default' : 'destructive'}>
              {permissionStatus.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">FCM Token:</span>
            <span className="text-sm text-muted-foreground">
              {token ? `${token.substring(0, 20)}...` : 'Not available'}
            </span>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Web:</strong> Uses Firebase Web SDK + Service Workers</p>
            <p><strong>Native:</strong> Uses Median.co native push API + Firebase</p>
            <p><strong>Note:</strong> APK notifications will only work after conversion via Median.co</p>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>
            Click any button below to test different types of notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {testNotifications.map((test) => (
              <div key={test.id} className="space-y-2">
                <Button
                  onClick={test.action}
                  className="w-full"
                  disabled={permissionStatus !== 'granted'}
                >
                  {test.title}
                </Button>
                <p className="text-sm text-muted-foreground">{test.description}</p>
              </div>
            ))}
          </div>
          
          {permissionStatus !== 'granted' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Notification permission is required to test push notifications.
                Please allow notifications when prompted.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">For Web Testing:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Click any test button above</li>
              <li>• Notifications should appear in your browser</li>
              <li>• Check browser console for debug information</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">For APK Testing (after Median.co conversion):</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Install the APK on your Android device</li>
              <li>• Open the app and navigate to this test page</li>
              <li>• Click test buttons - notifications should appear as native Android notifications</li>
              <li>• Environment should show "NATIVE" instead of "WEB"</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Pro Tip:</strong> The same notification code works for both web and APK. 
              The system automatically detects the environment and uses the appropriate method.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}