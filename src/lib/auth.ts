import { db } from './database';
import { User } from '@/types';
import { toast } from 'sonner';
import { notificationService } from './notifications';

const CURRENT_USER_KEY = 'progresspulse_current_user';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const user = await db.users.get(userData.id);
        if (user) {
          this.setCurrentUser(user);
        } else {
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      } catch (error) {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }

  async signUp(email: string, name: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      const userId = await db.createUser({
        email,
        name,
        passwordHash: btoa(password),
        preferences: {
          theme: 'system',
          notifications: true,
          weekStartsOn: 1
        }
      });

      const user = await db.users.get(userId);
      if (user) {
        this.setCurrentUser(user);
        await notificationService.sendAccountCreatedNotification(userId, name);
        toast.success('Account created successfully!');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
        return { success: true };
      }

      return { success: false, error: 'Failed to create user' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await db.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'No account found with this email' };
      }

      if (user.passwordHash !== btoa(password)) {
        return { success: false, error: 'Invalid password' };
      }

      this.setCurrentUser(user);
      toast.success('Signed in successfully!');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  async signOut(): Promise<void> {
    this.setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    toast.success('Signed out successfully');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'No user signed in' };
    }

    try {
      // Verify current password
      if (this.currentUser.passwordHash !== btoa(currentPassword)) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Validate new password
      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Update password
      await db.users.update(this.currentUser.id, { 
        passwordHash: btoa(newPassword),
        updatedAt: new Date()
      });

      const updatedUser = await db.users.get(this.currentUser.id);
      if (updatedUser) {
        this.setCurrentUser(updatedUser);
      }

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'No user signed in' };
    }

    try {
      await db.deleteUserData(this.currentUser.id);
      await this.signOut();
      toast.success('Account deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private setCurrentUser(user: User | null) {
    this.currentUser = user;
    
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }

    this.listeners.forEach(callback => callback(user));
  }

  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<void> {
    if (!this.currentUser) return;

    try {
      const updatedPreferences = { ...this.currentUser.preferences, ...preferences };
      await db.users.update(this.currentUser.id, { preferences: updatedPreferences });
      
      const updatedUser = await db.users.get(this.currentUser.id);
      if (updatedUser) {
        this.setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
}

export const authService = AuthService.getInstance();