export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  reminderTime?: string;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue?: number;
  currentValue: number;
  startingCapital?: number; // For financial goals
  unit?: string;
  targetDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'archived';
  priority: 'low' | 'medium' | 'high';
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  id: string;
  goalId: string;
  userId: string;
  value: number;
  note?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  date: Date;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  targetValue: number;
  achieved: boolean;
  achievedAt?: Date;
  reward?: string;
}

export interface Analytics {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  totalProgress: number;
  weeklyProgress: Progress[];
  monthlyProgress: Progress[];
  streakDays: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'streak' | 'goal' | 'milestone' | 'special';
}

export type GoalCategory = 
  | 'fitness' 
  | 'learning' 
  | 'career' 
  | 'health' 
  | 'finance' 
  | 'personal' 
  | 'creative' 
  | 'social' 
  | 'other';

export interface MediaUpload {
  file: File;
  preview?: string;
  type: 'image' | 'video';
}

export interface AppState {
  isOnline: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  syncInProgress: boolean;
}