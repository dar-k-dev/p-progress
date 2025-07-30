import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProgressStore } from '@/stores/useProgressStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Trophy, 
  Calendar,
  Flame,
  Star,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function AnalyticsPage() {
  const { user } = useAuth();
  const { goals, recentProgress, analytics, loadGoals, loadRecentProgress, loadAnalytics } = useProgressStore();

  useEffect(() => {
    if (user) {
      loadGoals(user.id);
      loadRecentProgress(user.id);
      loadAnalytics(user.id);
    }
  }, [user, loadGoals, loadRecentProgress, loadAnalytics]);

  // Prepare chart data
  const categoryData = goals.reduce((acc, goal) => {
    const existing = acc.find(item => item.category === goal.category);
    if (existing) {
      existing.count += 1;
      existing.completed += goal.status === 'completed' ? 1 : 0;
    } else {
      acc.push({
        category: goal.category,
        count: 1,
        completed: goal.status === 'completed' ? 1 : 0,
      });
    }
    return acc;
  }, [] as Array<{ category: string; count: number; completed: number }>);

  const progressTrendData = (() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    return last30Days.map(date => {
      const dayProgress = recentProgress.filter(p => 
        format(new Date(p.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'MMM dd'),
        entries: dayProgress.length,
        value: dayProgress.reduce((sum, p) => sum + p.value, 0)
      };
    });
  })();

  const goalStatusData = [
    { name: 'Active', value: goals.filter(g => g.status === 'active').length, color: '#10B981' },
    { name: 'Completed', value: goals.filter(g => g.status === 'completed').length, color: '#3B82F6' },
    { name: 'Paused', value: goals.filter(g => g.status === 'paused').length, color: '#F59E0B' },
    { name: 'Archived', value: goals.filter(g => g.status === 'archived').length, color: '#6B7280' },
  ].filter(item => item.value > 0);

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
    <div className="w-full h-full min-h-screen p-0 m-0 space-y-6">
      {/* Header */}
      <div className="content-section">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and trends from your progress data
        </p>
      </div>

      {/* Key Metrics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 content-section"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalGoals || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics?.completedGoals || 0}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Flame className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics?.streakDays || 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{recentProgress.length}</p>
                  <p className="text-xs text-muted-foreground">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 content-section">
        {/* Progress Trend */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Progress Trend (30 Days)
              </CardTitle>
              <CardDescription>
                Daily progress entries over the last month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--card-foreground))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="entries"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goal Status Distribution */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Goal Status Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of your goals by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={goalStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {goalStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--card-foreground))',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Goals by Category
              </CardTitle>
              <CardDescription>
                Distribution of goals across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--card-foreground))',
                      }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goal Progress Overview */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Active Goals Progress
              </CardTitle>
              <CardDescription>
                Current progress on your active goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.filter(g => g.status === 'active').slice(0, 5).map((goal) => {
                  const progressPercentage = goal.targetValue 
                    ? Math.round((goal.currentValue / goal.targetValue) * 100)
                    : 0;

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: goal.color }}
                          />
                          <span className="font-medium text-sm truncate">
                            {goal.title}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {progressPercentage}%
                        </Badge>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.currentValue} {goal.unit}</span>
                        <span>{goal.targetValue} {goal.unit}</span>
                      </div>
                    </div>
                  );
                })}
                
                {goals.filter(g => g.status === 'active').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active goals to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}