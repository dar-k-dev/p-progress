import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProgressStore } from '@/stores/useProgressStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddProgressDialog } from '@/components/progress/AddProgressDialog';
import { ProgressChart } from '@/components/progress/ProgressChart';
import { ProgressList } from '@/components/progress/ProgressList';
import { TrendingUp, Plus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProgressPage() {
  const { user } = useAuth();
  const { goals, recentProgress, loadGoals, loadRecentProgress } = useProgressStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadGoals(user.id);
      loadRecentProgress(user.id);
    }
  }, [user, loadGoals, loadRecentProgress]);

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const filteredProgress = selectedGoal === 'all' 
    ? recentProgress 
    : recentProgress.filter(p => p.goalId === selectedGoal);

  return (
    <div className="w-full h-full min-h-screen p-0 m-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between content-section">
        <div>
          <h1 className="text-3xl font-bold">Progress</h1>
          <p className="text-muted-foreground">
            Track and visualize your journey
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Progress
        </Button>
      </div>

      {/* Filter */}
      <div className="content-section">
        <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Filter by goal:</label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                {activeGoals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">
              {filteredProgress.length} entries
            </Badge>
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      {filteredProgress.length > 0 && (
        <div className="content-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Progress Overview
              </CardTitle>
              <CardDescription>
                Visual representation of your progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressChart 
                data={filteredProgress}
                goals={selectedGoal === 'all' ? activeGoals : activeGoals.filter(g => g.id === selectedGoal)}
              />
            </CardContent>
          </Card>
          </motion.div>
        </div>
      )}

      {/* Progress List */}
      <div className="content-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Progress
            </CardTitle>
            <CardDescription>
              Your latest progress entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressList 
              progress={filteredProgress}
              goals={goals}
            />
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Add Progress Dialog */}
      <AddProgressDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        goals={activeGoals}
      />
    </div>
  );
}