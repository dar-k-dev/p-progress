import Dexie, { Table } from 'dexie';
import { User, Goal, Progress, Milestone, Achievement } from '@/types';

export interface Notification {
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

export interface SpreadsheetData {
  id: string;
  goalId: string;
  userId: string;
  day: number;
  date: Date;
  requiredAmount: number;
  cumulativeAmount: number;
  completed: boolean;
  percentage: number;
  createdAt: Date;
}

export class ProgressPulseDB extends Dexie {
  users!: Table<User>;
  goals!: Table<Goal>;
  progress!: Table<Progress>;
  milestones!: Table<Milestone>;
  achievements!: Table<Achievement>;
  notifications!: Table<Notification>;
  spreadsheetData!: Table<SpreadsheetData>;

  constructor() {
    super('ProgressPulseDB');
    
    this.version(2).stores({
      users: '++id, email, createdAt',
      goals: '++id, userId, status, category, createdAt, updatedAt',
      progress: '++id, goalId, userId, date, createdAt',
      milestones: '++id, goalId, achieved, achievedAt',
      achievements: '++id, type, unlockedAt',
      notifications: '++id, userId, type, read, createdAt',
      spreadsheetData: '++id, goalId, userId, day, date, completed, createdAt'
    });

    // Add hooks for automatic timestamps
    this.goals.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.goals.hook('updating', (modifications) => {
      (modifications as any).updatedAt = new Date();
    });

    this.progress.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
    });

    this.users.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.users.hook('updating', (modifications) => {
      (modifications as any).updatedAt = new Date();
    });
  }

  // User operations
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    await this.users.add({
      ...userData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return id;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await this.users.where('email').equals(email).first();
  }

  // Goal operations
  async createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = await this.goals.add({
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return id.toString();
  }

  async getGoalsByUser(userId: string): Promise<Goal[]> {
    return await this.goals.where('userId').equals(userId).toArray();
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    await this.goals.update(goalId, { ...updates, updatedAt: new Date() });
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.transaction('rw', [this.goals, this.progress, this.milestones], async () => {
      await this.goals.delete(goalId);
      await this.progress.where('goalId').equals(goalId).delete();
      await this.milestones.where('goalId').equals(goalId).delete();
    });
  }

  // Progress operations
  async addProgress(progressData: Omit<Progress, 'id' | 'createdAt'>): Promise<string> {
    const id = await this.progress.add({
      ...progressData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    });
    
    // Update goal's current value
    const goal = await this.goals.get(progressData.goalId);
    if (goal) {
      await this.updateGoal(progressData.goalId, {
        currentValue: goal.currentValue + progressData.value
      });
    }

    return id.toString();
  }

  async getProgressByGoal(goalId: string): Promise<Progress[]> {
    return await this.progress.where('goalId').equals(goalId).toArray();
  }

  async getRecentProgress(userId: string, limit: number = 10): Promise<Progress[]> {
    return await this.progress
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('createdAt')
      .then(results => results.slice(0, limit));
  }

  // Analytics
  async getAnalytics(userId: string): Promise<any> {
    const goals = await this.getGoalsByUser(userId);
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;

    const progress = await this.progress.where('userId').equals(userId).toArray();
    const totalProgress = progress.reduce((sum, p) => sum + p.value, 0);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyProgress = progress.filter(p => p.date >= weekAgo);

    return {
      totalGoals,
      completedGoals,
      activeGoals,
      totalProgress,
      weeklyProgress: weeklyProgress.length,
      streakDays: await this.calculateStreak(userId),
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const progress = await this.progress
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('date');

    if (progress.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < progress.length; i++) {
      const progressDate = new Date(progress[i].date);
      progressDate.setHours(0, 0, 0, 0);

      if (progressDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (progressDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  // Data export
  async exportUserData(userId: string): Promise<any> {
    const user = await this.users.get(userId);
    const goals = await this.getGoalsByUser(userId);
    const progress = await this.progress.where('userId').equals(userId).toArray();
    const achievements = await this.achievements.toArray();

    return {
      user,
      goals,
      progress,
      achievements,
      exportedAt: new Date().toISOString()
    };
  }

  // Notification operations
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    await this.notifications.add({
      ...notificationData,
      id,
      createdAt: new Date()
    });
    return id;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await this.notifications.where('userId').equals(userId).reverse().sortBy('createdAt');
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notifications.update(notificationId, { read: true });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notifications.delete(notificationId);
  }

  // Spreadsheet operations
  async saveSpreadsheetData(data: Omit<SpreadsheetData, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    await this.spreadsheetData.add({
      ...data,
      id,
      createdAt: new Date()
    });
    return id;
  }

  async getSpreadsheetDataByGoal(goalId: string): Promise<SpreadsheetData[]> {
    return await this.spreadsheetData.where('goalId').equals(goalId).sortBy('day');
  }

  async updateSpreadsheetDay(goalId: string, day: number, completed: boolean): Promise<void> {
    const existingData = await this.spreadsheetData.where({ goalId, day }).first();
    if (existingData) {
      await this.spreadsheetData.update(existingData.id, { completed });
    } else {
      // Create new entry if it doesn't exist
      const goal = await this.goals.get(goalId);
      if (goal) {
        await this.saveSpreadsheetData({
          goalId,
          userId: goal.userId,
          day,
          date: new Date(),
          requiredAmount: 0,
          cumulativeAmount: 0,
          completed,
          percentage: 0
        });
      }
    }
  }

  // Enhanced method to update spreadsheet data with proper persistence
  async updateSpreadsheetData(data: {
    goalId: string;
    userId: string;
    day: number;
    completed: boolean;
  }): Promise<void> {
    const existingData = await this.spreadsheetData.where({ goalId: data.goalId, day: data.day }).first();
    if (existingData) {
      await this.spreadsheetData.update(existingData.id, { 
        completed: data.completed
      });
    } else {
      await this.saveSpreadsheetData({
        goalId: data.goalId,
        userId: data.userId,
        day: data.day,
        date: new Date(),
        requiredAmount: 0,
        cumulativeAmount: 0,
        completed: data.completed,
        percentage: 0
      });
    }
  }

  async clearSpreadsheetData(goalId: string): Promise<void> {
    await this.spreadsheetData.where('goalId').equals(goalId).delete();
  }

  // Clean up user data
  async deleteUserData(userId: string): Promise<void> {
    await this.transaction('rw', [this.users, this.goals, this.progress, this.milestones, this.notifications, this.spreadsheetData], async () => {
      const goals = await this.getGoalsByUser(userId);
      const goalIds = goals.map(g => g.id);
      
      await this.users.delete(userId);
      await this.goals.where('userId').equals(userId).delete();
      await this.progress.where('userId').equals(userId).delete();
      await this.notifications.where('userId').equals(userId).delete();
      await this.spreadsheetData.where('userId').equals(userId).delete();
      
      for (const goalId of goalIds) {
        await this.milestones.where('goalId').equals(goalId).delete();
      }
    });
  }
}

export const db = new ProgressPulseDB();