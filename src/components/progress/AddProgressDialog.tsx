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
import { Goal } from '@/types';
import { CalendarIcon, TrendingUp, Upload, X, Image, Video } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const progressSchema = z.object({
  goalId: z.string().min(1, 'Please select a goal'),
  value: z.number().positive('Value must be positive'),
  note: z.string().optional(),
  date: z.date(),
});

type ProgressFormData = z.infer<typeof progressSchema>;

interface AddProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: Goal[];
}

export function AddProgressDialog({ open, onOpenChange, goals }: AddProgressDialogProps) {
  const { user } = useAuth();
  const { addProgress } = useProgressStore();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const selectedGoalId = watch('goalId');
  const selectedGoal = goals.find(goal => goal.id === selectedGoalId);
  const date = watch('date');

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} file(s) uploaded successfully`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProgressFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Create progress entry
      await addProgress({
        ...data,
        userId: user.id,
      });

      // Handle file uploads (simulate storage)
      if (uploadedFiles.length > 0) {
        // In a real app, you'd upload to cloud storage here
        const fileUrls = uploadedFiles.map(file => URL.createObjectURL(file));
        toast.success(`Progress saved with ${uploadedFiles.length} media file(s)`);
      }
      
      reset({ date: new Date() });
      setUploadedFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add progress:', error);
      toast.error('Failed to add progress');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset({ date: new Date() });
    setUploadedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Add Progress</span>
          </DialogTitle>
          <DialogDescription>
            Record your latest progress towards your goals
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Goal Selection */}
          <div className="space-y-2">
            <Label>Goal *</Label>
            <Select
              value={selectedGoalId}
              onValueChange={(value) => setValue('goalId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                      <span>{goal.title}</span>
                      {goal.unit && (
                        <span className="text-muted-foreground">({goal.unit})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.goalId && (
              <p className="text-sm text-destructive">{errors.goalId.message}</p>
            )}
          </div>

          {/* Progress Value */}
          <div className="space-y-2">
            <Label htmlFor="value">
              Progress Value * 
              {selectedGoal?.unit && (
                <span className="text-muted-foreground ml-1">({selectedGoal.unit})</span>
              )}
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder={selectedGoal?.unit ? `e.g. 5 ${selectedGoal.unit}` : '10'}
              {...register('value', { valueAsNumber: true })}
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setValue('date', date)}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Add any notes about your progress..."
              rows={3}
              {...register('note')}
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Media Upload</Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Images and videos up to 10MB
                </p>
              </label>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files ({uploadedFiles.length})</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-muted rounded-lg"
                    >
                      {file.type.startsWith('image/') ? (
                        <Image className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Video className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Goal Progress Preview */}
          {selectedGoal && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Goal Progress</h4>
              <div className="text-sm text-muted-foreground">
                Current: {selectedGoal.currentValue} {selectedGoal.unit}
                {selectedGoal.targetValue && (
                  <> / Target: {selectedGoal.targetValue} {selectedGoal.unit}</>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedGoalId}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : null}
              Add Progress
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}