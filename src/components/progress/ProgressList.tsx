import { Progress, Goal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressListProps {
  progress: Progress[];
  goals: Goal[];
}

export function ProgressList({ progress, goals }: ProgressListProps) {
  if (progress.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No progress entries yet</h3>
        <p className="text-muted-foreground">
          Start tracking your progress to see your journey here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {progress.map((entry, index) => {
        const goal = goals.find(g => g.id === entry.goalId);
        
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Goal Color Indicator */}
                  <div
                    className="w-1 h-16 rounded-full flex-shrink-0"
                    style={{ backgroundColor: goal?.color || '#6B7280' }}
                  />
                  
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm">
                          {goal?.title || 'Unknown Goal'}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {goal?.category || 'other'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Value */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-lg">
                          +{entry.value} {goal?.unit || 'units'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Note */}
                    {entry.note && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {entry.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}