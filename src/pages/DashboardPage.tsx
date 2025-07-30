import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProgressStore } from '@/stores/useProgressStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { AddProgressDialog } from '@/components/progress/AddProgressDialog';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Trophy, 
  Plus,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();
  const { goals, analytics, loadGoals, loadAnalytics } = useProgressStore();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showAddProgress, setShowAddProgress] = useState(false);

  useEffect(() => {
    if (user) {
      loadGoals(user.id);
      loadAnalytics(user.id);
    }
  }, [user, loadGoals, loadAnalytics]);

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const recentGoals = activeGoals.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="page-ios">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="content-section-ios animate-ios-fade-in"
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-ios-title">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <motion.div
            animate={{ rotate: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-2xl"
          >
            👋
          </motion.div>
        </div>
        <p className="text-ios-body text-muted-foreground mt-2">
          Track your progress and achieve your goals with data-driven insights.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 content-section-ios"
      >
        <motion.div variants={itemVariants} className="animate-ios-slide-up">
          <div className="card-ios bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-ios-headline">{analytics?.totalGoals || 0}</p>
                  <p className="text-ios-caption">Total Goals</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="animate-ios-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="card-ios bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-ios-headline">{analytics?.completedGoals || 0}</p>
                  <p className="text-ios-caption">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="animate-ios-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-ios bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-ios-headline">{analytics?.streakDays || 0}</p>
                  <p className="text-ios-caption">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="animate-ios-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="card-ios bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-ios-headline">{Array.isArray(analytics?.weeklyProgress) ? analytics.weeklyProgress.length : analytics?.weeklyProgress || 0}</p>
                  <p className="text-ios-caption">This Week</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Active Goals */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="content-section-ios animate-ios-bounce"
      >
        <div className="card-ios">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-ios-headline">Active Goals</h2>
                <p className="text-ios-body text-muted-foreground mt-1">
                  Keep pushing towards your targets
                </p>
              </div>
              <button 
                className="btn-ios-secondary"
                onClick={() => setShowCreateGoal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </button>
            </div>
            {recentGoals.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/20 rounded-2xl w-fit mx-auto mb-4">
                  <Target className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-ios-headline mb-2">No active goals yet</h3>
                <p className="text-ios-body text-muted-foreground mb-6">
                  Create your first goal to start tracking your progress
                </p>
                <button 
                  className="btn-ios-primary"
                  onClick={() => setShowCreateGoal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentGoals.map((goal, index) => {
                  const progressPercentage = goal.targetValue 
                    ? Math.round((goal.currentValue / goal.targetValue) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card-ios p-4 hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-1 h-16 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-ios-body font-semibold">{goal.title}</h4>
                            <span className={`status-ios-${goal.priority === 'high' ? 'error' : goal.priority === 'medium' ? 'warning' : 'success'} text-xs font-medium`}>
                              {goal.priority}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-ios-caption">Progress</span>
                              <span className="text-ios-caption font-medium">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </span>
                            </div>
                            <div className="progress-ios">
                              <div 
                                className="progress-ios-bar"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <Link to="/goals">
                          <button className="p-2 hover:bg-muted/20 rounded-xl transition-colors">
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
                
                {activeGoals.length > 3 && (
                  <Link to="/goals">
                    <button className="btn-ios-secondary w-full">
                      View All Goals ({activeGoals.length - 3} more)
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="grid-ios content-section-ios"
      >
        <motion.div 
          className="card-ios cursor-pointer animate-ios-scale"
          onClick={() => setShowAddProgress(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="p-6 text-center">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-ios-body font-semibold mb-2">Log Progress</h3>
            <p className="text-ios-caption text-muted-foreground">
              Update your goals with new progress
            </p>
          </div>
        </motion.div>

        <Link to="/analytics">
          <motion.div 
            className="card-ios cursor-pointer animate-ios-scale"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="p-6 text-center">
              <div className="p-4 bg-yellow-500/10 rounded-2xl w-fit mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-ios-body font-semibold mb-2">View Analytics</h3>
              <p className="text-ios-caption text-muted-foreground">
                Insights and trends from your data
              </p>
            </div>
          </motion.div>
        </Link>

        <Link to="/calendar">
          <motion.div 
            className="card-ios cursor-pointer animate-ios-scale"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="p-6 text-center">
              <div className="p-4 bg-blue-500/10 rounded-2xl w-fit mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-ios-body font-semibold mb-2">Calendar View</h3>
              <p className="text-ios-caption text-muted-foreground">
                See your progress timeline
              </p>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Dialogs */}
      <CreateGoalDialog 
        open={showCreateGoal}
        onOpenChange={setShowCreateGoal}
      />
      
      <AddProgressDialog 
        open={showAddProgress}
        onOpenChange={setShowAddProgress}
        goals={activeGoals}
      />
    </div>
  );
}