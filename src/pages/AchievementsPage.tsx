import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProgressStore } from '@/stores/useProgressStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award,
  Medal,
  Crown,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function AchievementsPage() {
  const { user } = useAuth();
  const { goals, recentProgress, analytics, loadGoals, loadRecentProgress, loadAnalytics } = useProgressStore();

  useEffect(() => {
    if (user) {
      loadGoals(user.id);
      loadRecentProgress(user.id);
      loadAnalytics(user.id);
    }
  }, [user, loadGoals, loadRecentProgress, loadAnalytics]);

  // Calculate achievements based on user data
  const achievements: Achievement[] = [
    {
      id: 'first-goal',
      title: 'Getting Started',
      description: 'Create your first goal',
      icon: <Target className="h-6 w-6" />,
      unlocked: goals.length > 0,
      rarity: 'common',
    },
    {
      id: 'goal-master',
      title: 'Goal Master',
      description: 'Create 10 goals',
      icon: <Trophy className="h-6 w-6" />,
      unlocked: goals.length >= 10,
      progress: Math.min(goals.length, 10),
      maxProgress: 10,
      rarity: 'rare',
    },
    {
      id: 'first-progress',
      title: 'First Steps',
      description: 'Log your first progress entry',
      icon: <Star className="h-6 w-6" />,
      unlocked: recentProgress.length > 0,
      rarity: 'common',
    },
    {
      id: 'consistent-tracker',
      title: 'Consistent Tracker',
      description: 'Log progress for 7 consecutive days',
      icon: <Flame className="h-6 w-6" />,
      unlocked: (analytics?.streakDays || 0) >= 7,
      progress: Math.min(analytics?.streakDays || 0, 7),
      maxProgress: 7,
      rarity: 'epic',
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 30-day streak',
      icon: <Crown className="h-6 w-6" />,
      unlocked: (analytics?.streakDays || 0) >= 30,
      progress: Math.min(analytics?.streakDays || 0, 30),
      maxProgress: 30,
      rarity: 'legendary',
    },
    {
      id: 'goal-completer',
      title: 'Goal Completer',
      description: 'Complete your first goal',
      icon: <Award className="h-6 w-6" />,
      unlocked: (analytics?.completedGoals || 0) > 0,
      rarity: 'rare',
    },
    {
      id: 'overachiever',
      title: 'Overachiever',
      description: 'Complete 5 goals',
      icon: <Medal className="h-6 w-6" />,
      unlocked: (analytics?.completedGoals || 0) >= 5,
      progress: Math.min(analytics?.completedGoals || 0, 5),
      maxProgress: 5,
      rarity: 'epic',
    },
    {
      id: 'progress-warrior',
      title: 'Progress Warrior',
      description: 'Log 100 progress entries',
      icon: <Zap className="h-6 w-6" />,
      unlocked: recentProgress.length >= 100,
      progress: Math.min(recentProgress.length, 100),
      maxProgress: 100,
      rarity: 'legendary',
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-200';
      case 'rare': return 'text-blue-500 border-blue-200';
      case 'epic': return 'text-purple-500 border-purple-200';
      case 'legendary': return 'text-yellow-500 border-yellow-200';
      default: return 'text-gray-500 border-gray-200';
    }
  };

  const getRarityBg = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-50 dark:bg-gray-900/20';
      case 'rare': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'epic': return 'bg-purple-50 dark:bg-purple-900/20';
      case 'legendary': return 'bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full h-full min-h-screen p-0 m-0">
      {/* Header */}
      <div className="px-6 py-6">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Celebrate your milestones and unlock new badges
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{analytics?.streakDays || 0}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">Unlocked Achievements</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {unlockedAchievements.map((achievement) => (
              <motion.div key={achievement.id} variants={itemVariants}>
                <Card className={`${getRarityBg(achievement.rarity)} border-2 ${getRarityColor(achievement.rarity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getRarityBg(achievement.rarity)}`}>
                        <div className={getRarityColor(achievement.rarity)}>
                          {achievement.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-green-600">
                            Unlocked!
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-4">Locked Achievements</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {lockedAchievements.map((achievement) => (
              <motion.div key={achievement.id} variants={itemVariants}>
                <Card className="opacity-60 hover:opacity-80 transition-opacity">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <div className="text-muted-foreground">
                          {achievement.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        {achievement.maxProgress && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{achievement.progress || 0} / {achievement.maxProgress}</span>
                            </div>
                            <Progress 
                              value={((achievement.progress || 0) / achievement.maxProgress) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}