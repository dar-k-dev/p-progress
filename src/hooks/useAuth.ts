import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Initial load complete
    setLoading(false);

    return unsubscribe;
  }, []);

  const signUp = async (email: string, name: string, password: string) => {
    return await authService.signUp(email, name, password);
  };



  const signOut = async () => {
    await authService.signOut();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  const deleteAccount = async () => {
    return await authService.deleteAccount();
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    await authService.updateUserPreferences(preferences);
    
    // Handle notification preferences
    if (preferences.notifications !== undefined) {
      const { notificationService } = await import('@/lib/notifications');
      if (preferences.notifications) {
        await notificationService.requestPermission();
        if (preferences.reminderTime) {
          await notificationService.scheduleReminder(
            preferences.reminderTime,
            'Time to check your progress!'
          );
        }
      }
    }
  };



  return {
    user,
    loading,
    isAuthenticated: !!user,
    signUp,
    signOut,
    changePassword,
    deleteAccount,
    updatePreferences,
    validatePassword: authService.validatePassword,
    getPasswordStrength: authService.getPasswordStrength,
  };
}