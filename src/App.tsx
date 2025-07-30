import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateInit } from '@/hooks/useUpdateInit';
import { useAPKNotifications } from '@/hooks/useAPKNotifications';
import { pushNotificationService } from '@/services/pushNotificationService';
import { pwaInitializer } from '@/lib/pwa-init';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SpreadsheetPage } from '@/pages/SpreadsheetPage';
import { CertificatesPage } from '@/pages/CertificatesPage';
import { TutorialPage } from '@/pages/TutorialPage';
import { PushTestPage } from '@/pages/PushTestPage';
import { DocumentationPage } from '@/pages/DocumentationPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { ReleasesPage } from '@/pages/ReleasesPage';
import { SupportPage } from '@/pages/SupportPage';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { BiometricGuard } from '@/components/BiometricGuard';
import { AnimatePresence } from 'framer-motion';

// Service Worker registration is handled by the update system

function App() {
  const { user, loading } = useAuth();
  
  // Initialize update system
  useUpdateInit();
  
  // Initialize APK notifications (handles permission requests for APK)
  const { isAPK } = useAPKNotifications();

  // Initialize PWA features
  useEffect(() => {
    const initializePWA = async () => {
      try {
        console.log('🚀 Initializing PWA...', { isAPK });
        
        // Initialize PWA features
        await pwaInitializer.initialize();
        
        // Initialize push notifications (enhanced service handles APK vs Web)
        await pushNotificationService.initialize();
        
        // For web (non-APK), request permission normally
        if (!isAPK) {
          const hasPermission = await pushNotificationService.requestPermission();
          if (hasPermission) {
            const token = await pushNotificationService.getToken();
            console.log('🔔 Web push token:', token);
          }
        }
        
        // Set up message listener for foreground notifications
        pushNotificationService.setupMessageListener((payload) => {
          console.log('🔔 Foreground notification received:', payload);
        });
        
        // Log environment info
        console.log('🚀 PWA Environment:', {
          isStandalone: pwaInitializer.isStandalone(),
          isAPK: pwaInitializer.isAPK(),
          isRunningAsAPK: pushNotificationService.isRunningAsAPK,
          notificationPermission: pushNotificationService.notificationPermission,
          userAgent: navigator.userAgent
        });
        
      } catch (error) {
        console.error('❌ PWA initialization failed:', error);
      }
    };

    initializePWA();
  }, [isAPK]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Router>
        <div className="w-full h-full min-h-screen bg-background text-foreground">
          <AnimatePresence mode="wait">
            {user ? (
              <BiometricGuard>
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/spreadsheet" element={<SpreadsheetPage />} />
                    <Route path="/certificates" element={<CertificatesPage />} />
                    <Route path="/tutorial" element={<TutorialPage />} />
                    <Route path="/push-test" element={<PushTestPage />} />
                    <Route path="/docs" element={<DocumentationPage />} />
                    <Route path="/documentation" element={<DocumentationPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/releases" element={<ReleasesPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AppLayout>
              </BiometricGuard>
            ) : (
              <Routes>
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/auth" element={<Navigate to="/signup" replace />} />
                {/* Public pages - accessible without authentication */}
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/releases" element={<ReleasesPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="*" element={<Navigate to="/signup" replace />} />
              </Routes>
            )}
          </AnimatePresence>
        </div>
        
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;