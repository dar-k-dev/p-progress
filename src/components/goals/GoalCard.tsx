import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/stores/useProgressStore';
import { Goal } from '@/types';
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  Check, 
  Archive,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { updateGoal, deleteGoal } = useProgressStore();
  const [isLoading, setIsLoading] = useState(false);

  const progressPercentage = goal.targetValue 
    ? Math.round((goal.currentValue / goal.targetValue) * 100)
    : 0;

  const handleStatusChange = async (status: Goal['status']) => {
    setIsLoading(true);
    try {
      await updateGoal(goal.id, { status });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await deleteGoal(goal.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full border-l-4" style={{ borderLeftColor: goal.color }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge 
                  variant="outline" 
                  className="capitalize text-xs"
                >
                  {goal.category}
                </Badge>
                <Badge 
                  variant={getPriorityColor(goal.priority)}
                  className="capitalize text-xs"
                >
                  {goal.priority}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-6 truncate">
                {goal.title}
              </CardTitle>
              {goal.description && (
                <CardDescription className="line-clamp-2 mt-1">
                  {goal.description}
                </CardDescription>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Progress
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {goal.status === 'active' && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Goal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                      <Check className="mr-2 h-4 w-4" />
                      Mark Complete
                    </DropdownMenuItem>
                  </>
                )}
                
                {goal.status === 'paused' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                    <Play className="mr-2 h-4 w-4" />
                    Resume Goal
                  </DropdownMenuItem>
                )}
                
                {goal.status !== 'archived' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('archived')}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Goal
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress */}
          {goal.targetValue && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2"
                style={{ backgroundColor: `${goal.color}20` }}
              />
              <div className="text-right">
                <span className="text-xs text-muted-foreground">
                  {progressPercentage}% complete
                </span>
              </div>
            </div>
          )}

          {/* Status and Target Date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)}`}
              />
              <span className="capitalize text-muted-foreground">
                {goal.status}
              </span>
            </div>
            
            {goal.targetDate && (
              <span className="text-muted-foreground">
                Due {formatDistanceToNow(new Date(goal.targetDate), { addSuffix: true })}
              </span>
            )}
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(goal.updatedAt), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}