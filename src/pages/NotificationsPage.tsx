import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { db, Notification as DBNotification } from '@/lib/database';
import { 
  Bell, 
  Check, 
  Trash2, 
  Settings,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'achievement' | 'milestone' | 'goal_completed' | 'daily_quota';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  goalId?: string;
}

const mockNotifications: DBNotification[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'reminder',
    title: 'Daily Check-in Reminder',
    message: 'Don\'t forget to update your progress today!',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    actionUrl: '/progress'
  },
  {
    id: '2',
    userId: 'user1',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You\'ve completed 7 days in a row! Keep up the great work!',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    actionUrl: '/achievements'
  },
  {
    id: '3',
    userId: 'user1',
    type: 'milestone',
    title: 'Milestone Reached',
    message: 'You\'ve reached 50% of your fitness goal!',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    goalId: 'goal1'
  },
  {
    id: '4',
    userId: 'user1',
    type: 'daily_quota',
    title: 'Daily Quota Reminder',
    message: 'You need to add $12.50 to reach today\'s financial goal target.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    goalId: 'goal2'
  }
];

export function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const userNotifications = await db.getNotificationsByUser(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const createSampleNotifications = async () => {
    if (!user) return;
    
    const sampleNotifications = [
      {
        userId: user.id,
        type: 'reminder' as const,
        title: 'Daily Check-in Reminder',
        message: "Don't forget to update your progress today!",
        read: false,
        actionUrl: '/progress'
      },
      {
        userId: user.id,
        type: 'achievement' as const,
        title: 'Welcome to ProgressPulse!',
        message: 'Your account has been created successfully. Start tracking your goals now!',
        read: false,
        actionUrl: '/goals'
      }
    ];

    for (const notification of sampleNotifications) {
      await db.createNotification(notification);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await db.notifications.update(notificationId, { read: true });
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await db.notifications.update(notification.id, { read: true });
      }
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await db.notifications.delete(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'goal_completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'daily_quota':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="w-full h-full min-h-screen p-0 m-0">
        <div className="animate-pulse space-y-4 content-section">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen p-0 m-0">
      {/* Header */}
      <div className="flex items-center justify-between content-section">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your progress and achievements
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-center">
                You're all caught up! We'll notify you when there's something new.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all hover:shadow-md ${
                !notification.read ? 'border-primary/50 bg-primary/5' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">
                            {notification.title}
                            {!notification.read && (
                              <span className="inline-block w-2 h-2 bg-primary rounded-full ml-2"></span>
                            )}
                          </h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(notification.createdAt, 'MMM d, h:mm a')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {notification.actionUrl && (
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(notification.actionUrl!)}
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage your notification settings to get updates that matter to you.
          </p>
          <Button onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Configure Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
