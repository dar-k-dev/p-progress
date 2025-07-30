import { create } from 'zustand';
import { db } from '@/lib/database';
import { Goal, Progress, Analytics } from '@/types';
import { toast } from 'sonner';

interface ProgressStore {
  goals: Goal[];
  recentProgress: Progress[];
  analytics: Analytics | null;
  isLoading: boolean;
  
  // Actions
  loadGoals: (userId: string) => Promise<void>;
  createGoal: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addProgress: (progressData: Omit<Progress, 'id' | 'createdAt'>) => Promise<void>;
  loadRecentProgress: (userId: string) => Promise<void>;
  loadAnalytics: (userId: string) => Promise<void>;
  syncData: (userId: string) => Promise<void>;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  goals: [],
  recentProgress: [],
  analytics: null,
  isLoading: false,

  loadGoals: async (userId: string) => {
    set({ isLoading: true });
    try {
      const goals = await db.getGoalsByUser(userId);
      set({ goals });
    } catch (error) {
      console.error('Failed to load goals:', error);
      toast.error('Failed to load goals');
    } finally {
      set({ isLoading: false });
    }
  },

  createGoal: async (goalData) => {
    try {
      const newGoalData = {
        ...goalData,
        currentValue: 0,
      };
      
      const goalId = await db.createGoal(newGoalData);
      const createdGoal = await db.goals.get(goalId);
      
      if (createdGoal) {
        set(state => ({ 
          goals: [...state.goals, createdGoal] 
        }));
        toast.success('Goal created successfully!');
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
      toast.error('Failed to create goal');
    }
  },

  updateGoal: async (goalId: string, updates: Partial<Goal>) => {
    try {
      const originalGoal = get().goals.find(g => g.id === goalId);
      await db.updateGoal(goalId, updates);
      const updatedGoal = await db.goals.get(goalId);
      
      if (updatedGoal) {
        set(state => ({
          goals: state.goals.map(goal => 
            goal.id === goalId ? updatedGoal : goal
          )
        }));

        // Send notification if goal was marked as completed
        if (originalGoal && originalGoal.status !== 'completed' && updates.status === 'completed') {
          const { notificationService } = await import('@/lib/notifications');
          await notificationService.sendGoalCompletedNotification(updatedGoal.userId, updatedGoal.title);
        }

        toast.success('Goal updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal');
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      await db.deleteGoal(goalId);
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== goalId)
      }));
      toast.success('Goal deleted successfully!');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    }
  },

  addProgress: async (progressData) => {
    try {
      await db.addProgress(progressData);
      
      // Show progress celebration notification
      const { notificationService } = await import('@/lib/notifications');
      const goal = get().goals.find(g => g.id === progressData.goalId);
      if (goal) {
        await notificationService.showProgressCelebration(goal.title, progressData.value);
        
        // Check if goal is completed
        if (goal.targetValue && (goal.currentValue + progressData.value) >= goal.targetValue) {
          await notificationService.showGoalCompleted(goal.title);
        }
      }
      
      // Refresh goals to get updated current values
      const { loadGoals, loadRecentProgress, loadAnalytics } = get();
      await Promise.all([
        loadGoals(progressData.userId),
        loadRecentProgress(progressData.userId),
        loadAnalytics(progressData.userId)
      ]);
      
      toast.success('Progress updated!');
    } catch (error) {
      console.error('Failed to add progress:', error);
      toast.error('Failed to update progress');
    }
  },

  loadRecentProgress: async (userId: string) => {
    try {
      const recentProgress = await db.getRecentProgress(userId, 20);
      set({ recentProgress });
    } catch (error) {
      console.error('Failed to load recent progress:', error);
    }
  },

  loadAnalytics: async (userId: string) => {
    try {
      const analytics = await db.getAnalytics(userId);
      set({ analytics });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  },

  syncData: async (userId: string) => {
    const { loadGoals, loadRecentProgress, loadAnalytics } = get();
    
    try {
      await Promise.all([
        loadGoals(userId),
        loadRecentProgress(userId),
        loadAnalytics(userId)
      ]);
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }
}));