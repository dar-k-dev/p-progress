import { motion } from 'framer-motion';
import { Bell, Download, Wifi, History, Info, Clock, TestTube } from 'lucide-react';
import { useUpdateStore } from '@/stores/useUpdateStore';
import { IOSCard } from '@/components/ui/ios-card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pushNotificationService } from '@/services/pushNotificationService';
import { useState, useEffect } from 'react';

export function UpdateSettings() {
  const {
    currentVersion,
    updateHistory,
    autoUpdate,
    updateNotifications,
    wifiOnlyUpdates,
    setAutoUpdate,
    setUpdateNotifications,
    setWifiOnlyUpdates,
  } = useUpdateStore();

  const [dailyReminders, setDailyReminders] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load settings from localStorage
    const savedReminders = localStorage.getItem('daily-reminders') === 'true';
    const savedTime = localStorage.getItem('reminder-time') || '09:00';
    
    setDailyReminders(savedReminders);
    setReminderTime(savedTime);
    setNotificationPermission(pushNotificationService.notificationPermission);

    // Set up reminders if enabled
    if (savedReminders && pushNotificationService.notificationPermission === 'granted') {
      pushNotificationService.setupDailyReminders(savedTime);
    }
  }, []);

  const handleDailyRemindersChange = async (enabled: boolean) => {
    if (enabled && pushNotificationService.notificationPermission !== 'granted') {
      const granted = await pushNotificationService.requestPermission();
      if (!granted) {
        return;
      }
      setNotificationPermission('granted');
    }

    setDailyReminders(enabled);
    localStorage.setItem('daily-reminders', enabled.toString());

    if (enabled) {
      await pushNotificationService.setupDailyReminders(reminderTime);
    }
  };

  const handleReminderTimeChange = async (time: string) => {
    setReminderTime(time);
    localStorage.setItem('reminder-time', time);

    if (dailyReminders) {
      await pushNotificationService.setupDailyReminders(time);
    }
  };

  const handleTestNotification = async () => {
    if (pushNotificationService.notificationPermission !== 'granted') {
      const granted = await pushNotificationService.requestPermission();
      if (!granted) {
        return;
      }
      setNotificationPermission('granted');
    }

    await pushNotificationService.sendTestNotification();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Current Version */}
      <IOSCard>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-ios-body font-semibold">Current Version</h3>
                <p className="text-ios-caption text-muted-foreground">
                  ProgressPulse v{currentVersion}
                </p>
              </div>
            </div>
            <Badge variant="secondary">Latest</Badge>
          </div>
        </div>
      </IOSCard>

      {/* Update Settings */}
      <IOSCard>
        <div className="p-6">
          <h3 className="text-ios-headline mb-4">Update Preferences</h3>
          
          <div className="space-y-4">
            {/* Auto Update */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Download className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-ios-body font-medium">Automatic Updates</p>
                  <p className="text-ios-caption text-muted-foreground">
                    Install updates automatically
                  </p>
                </div>
              </div>
              <Switch
                checked={autoUpdate}
                onCheckedChange={setAutoUpdate}
              />
            </div>

            {/* Update Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Bell className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-ios-body font-medium">Update Notifications</p>
                  <p className="text-ios-caption text-muted-foreground">
                    Get notified when updates are available
                  </p>
                </div>
              </div>
              <Switch
                checked={updateNotifications}
                onCheckedChange={setUpdateNotifications}
              />
            </div>

            {/* WiFi Only Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <Wifi className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-ios-body font-medium">WiFi Only</p>
                  <p className="text-ios-caption text-muted-foreground">
                    Download updates only on WiFi
                  </p>
                </div>
              </div>
              <Switch
                checked={wifiOnlyUpdates}
                onCheckedChange={setWifiOnlyUpdates}
              />
            </div>
          </div>
        </div>
      </IOSCard>

      {/* Daily Reminders */}
      <IOSCard>
        <div className="p-6">
          <h3 className="text-ios-headline mb-4">Daily Reminders</h3>
          
          <div className="space-y-4">
            {/* Daily Reminders Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-ios-body font-medium">Daily Progress Reminders</p>
                  <p className="text-ios-caption text-muted-foreground">
                    Get reminded to check your progress
                  </p>
                </div>
              </div>
              <Switch
                checked={dailyReminders}
                onCheckedChange={handleDailyRemindersChange}
              />
            </div>

            {/* Reminder Time */}
            {dailyReminders && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-11"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="text-ios-body font-medium mb-2">Reminder Time</p>
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => handleReminderTimeChange(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Test Notification */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-500/10 rounded-xl">
                  <TestTube className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-ios-body font-medium">Test Notifications</p>
                  <p className="text-ios-caption text-muted-foreground">
                    Send a test notification
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={notificationPermission === 'denied'}
              >
                Test
              </Button>
            </div>

            {/* Notification Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${
                  notificationPermission === 'granted' 
                    ? 'bg-green-500/10' 
                    : notificationPermission === 'denied'
                    ? 'bg-red-500/10'
                    : 'bg-yellow-500/10'
                }`}>
                  <Bell className={`h-4 w-4 ${
                    notificationPermission === 'granted' 
                      ? 'text-green-500' 
                      : notificationPermission === 'denied'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }`} />
                </div>
                <div>
                  <p className="text-ios-body font-medium">Notification Permission</p>
                  <p className="text-ios-caption text-muted-foreground">
                    {notificationPermission === 'granted' && 'Notifications enabled'}
                    {notificationPermission === 'denied' && 'Notifications blocked'}
                    {notificationPermission === 'default' && 'Permission not requested'}
                  </p>
                </div>
              </div>
              <Badge variant={
                notificationPermission === 'granted' 
                  ? 'default' 
                  : notificationPermission === 'denied'
                  ? 'destructive'
                  : 'secondary'
              }>
                {notificationPermission === 'granted' && '✅ Enabled'}
                {notificationPermission === 'denied' && '❌ Blocked'}
                {notificationPermission === 'default' && '⏳ Pending'}
              </Badge>
            </div>

            {/* APK Status */}
            {pushNotificationService.isRunningAsAPK && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <Info className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-ios-body font-medium">Running as APK</p>
                    <p className="text-ios-caption text-muted-foreground">
                      Enhanced notification support
                    </p>
                  </div>
                </div>
                <Badge variant="outline">📱 APK</Badge>
              </div>
            )}
          </div>
        </div>
      </IOSCard>

      {/* Update History */}
      <IOSCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <History className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="text-ios-headline">Update History</h3>
          </div>

          {updateHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-ios-body text-muted-foreground">No update history yet</p>
              <p className="text-ios-caption text-muted-foreground">
                Updates will appear here once installed
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {updateHistory.map((update, index) => (
                <motion.div
                  key={`${update.version}-${update.timestamp}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-muted/20 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-ios-body font-semibold">
                        v{update.version}
                      </span>
                      {update.critical && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <span className="text-ios-caption text-muted-foreground">
                      {formatBytes(update.size)}
                    </span>
                  </div>
                  
                  <p className="text-ios-caption text-muted-foreground mb-2">
                    Installed {formatDate(update.timestamp)}
                  </p>
                  
                  {update.changes.length > 0 && (
                    <div className="space-y-1">
                      {update.changes.slice(0, 2).map((change, changeIndex) => (
                        <p key={changeIndex} className="text-ios-caption flex items-start space-x-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{change}</span>
                        </p>
                      ))}
                      {update.changes.length > 2 && (
                        <p className="text-ios-caption text-muted-foreground">
                          +{update.changes.length - 2} more changes
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </IOSCard>

      {/* Update Info */}
      <IOSCard variant="glass">
        <div className="p-6">
          <h4 className="text-ios-body font-semibold mb-3">About Updates</h4>
          <div className="space-y-2 text-ios-caption text-muted-foreground">
            <p>• Updates are delivered securely and verified before installation</p>
            <p>• Critical security updates are installed automatically</p>
            <p>• You can always check for updates manually</p>
            <p>• Update history is kept for your reference</p>
          </div>
        </div>
      </IOSCard>
    </div>
  );
}