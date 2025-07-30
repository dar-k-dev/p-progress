import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProgressStore } from '@/stores/useProgressStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/types';
import { Calendar as CalendarIcon, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';

export function CalendarPage() {
  const { user } = useAuth();
  const { goals, recentProgress, loadGoals, loadRecentProgress } = useProgressStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      loadGoals(user.id);
      loadRecentProgress(user.id);
    }
  }, [user, loadGoals, loadRecentProgress]);

  // Get progress for selected date
  const selectedDateProgress = recentProgress.filter(progress =>
    isSameDay(new Date(progress.date), selectedDate)
  );

  // Get dates with progress for calendar highlighting
  const progressDates = recentProgress.map(progress => new Date(progress.date));

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
    <div className="w-full h-full min-h-screen p-0 m-0">
      {/* Header */}
      <div className="content-section">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          View your progress timeline and track daily activities
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 content-section"
      >
        {/* Calendar */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Progress Calendar
              </CardTitle>
              <CardDescription>
                Click on any date to view progress entries
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasProgress: progressDates,
                }}
                modifiersStyles={{
                  hasProgress: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold',
                  },
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected Date Details */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'MMMM dd, yyyy')}
              </CardTitle>
              <CardDescription>
                Progress entries for this date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateProgress.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No progress entries for this date
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateProgress.map((progress) => {
                    const goal = goals.find(g => g.id === progress.goalId);
                    
                    return (
                      <div
                        key={progress.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50"
                      >
                        <div
                          className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: goal?.color || '#6B7280' }}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">
                              {goal?.title || 'Unknown Goal'}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {goal?.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium">
                              +{progress.value} {goal?.unit || 'units'}
                            </span>
                          </div>
                          {progress.note && (
                            <p className="text-xs text-muted-foreground">
                              {progress.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Monthly Summary */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="content-section"
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>
              Overview of your progress this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="text-2xl font-bold text-primary">
                  {recentProgress.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Entries
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-green-500/5">
                <div className="text-2xl font-bold text-green-500">
                  {new Set(recentProgress.map(p => format(new Date(p.date), 'yyyy-MM-dd'))).size}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Days
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-blue-500/5">
                <div className="text-2xl font-bold text-blue-500">
                  {new Set(recentProgress.map(p => p.goalId)).size}
                </div>
                <div className="text-sm text-muted-foreground">
                  Goals Worked On
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}