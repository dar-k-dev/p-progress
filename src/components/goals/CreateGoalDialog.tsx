import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProgressStore } from '@/stores/useProgressStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Goal, GoalCategory } from '@/types';
import { CalendarIcon, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  category: z.enum(['fitness', 'learning', 'career', 'health', 'finance', 'personal', 'creative', 'social', 'other']),
  targetValue: z.number().positive('Target value must be positive').optional(),
  startingCapital: z.number().positive('Starting capital must be positive').optional(),
  unit: z.string().optional(),
  targetDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  color: z.string(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const goalColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
];

const categories: { value: GoalCategory; label: string; emoji: string }[] = [
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'career', label: 'Career', emoji: '💼' },
  { value: 'health', label: 'Health', emoji: '🏥' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'personal', label: 'Personal', emoji: '🌟' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'other', label: 'Other', emoji: '📝' },
];

export function CreateGoalDialog({ open, onOpenChange }: CreateGoalDialogProps) {
  const { user } = useAuth();
  const { createGoal } = useProgressStore();
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(goalColors[0]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      priority: 'medium',
      color: goalColors[0],
      category: 'personal',
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await createGoal({
        ...data,
        userId: user.id,
        status: 'active',
        color: selectedColor,
      });
      
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const targetDate = watch('targetDate');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Create New Goal</span>
          </DialogTitle>
          <DialogDescription>
            Set a new target and start tracking your progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Run 5km daily, Learn Spanish, Save $10,000"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details about your goal..."
              rows={3}
              {...register('description')}
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value: GoalCategory) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center space-x-2">
                        <span>{category.emoji}</span>
                        <span>{category.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value: Goal['priority']) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Value & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                type="number"
                placeholder="100"
                {...register('targetValue', { valueAsNumber: true })}
              />
              {errors.targetValue && (
                <p className="text-sm text-destructive">{errors.targetValue.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="km, hours, $, books, etc."
                {...register('unit')}
              />
            </div>
          </div>

          {/* Starting Capital (for finance goals only) */}
          {watch('category') === 'finance' && (
            <div className="space-y-2">
              <Label htmlFor="startingCapital">Starting Capital</Label>
              <Input
                id="startingCapital"
                type="number"
                placeholder="1000"
                {...register('startingCapital', { valueAsNumber: true })}
              />
              {errors.startingCapital && (
                <p className="text-sm text-destructive">{errors.startingCapital.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The initial amount you're starting with for this financial goal
              </p>
            </div>
          )}

          {/* Target Date */}
          <div className="space-y-2">
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !targetDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, 'PPP') : 'Select target date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={(date) => setValue('targetDate', date)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Goal Color</Label>
            <div className="flex flex-wrap gap-2">
              {goalColors.map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    selectedColor === color 
                      ? 'border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground/20' 
                      : 'border-border hover:border-foreground/50'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    setValue('color', color);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : null}
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}