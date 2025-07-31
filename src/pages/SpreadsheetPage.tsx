import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/database';
import { Goal } from '@/types';
import { notificationService } from '@/lib/notifications';
import { 
  FileSpreadsheet, 
  Download, 
  Calculator,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Percent,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, differenceInDays, isWeekend, addBusinessDays, getDay } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface DailyQuota {
  day: number;
  date: Date;
  requiredAmount: number;
  cumulativeAmount: number;
  completed: boolean;
  percentage: number;
  isWeekend?: boolean;
  isSkipped?: boolean;
}

interface SpreadsheetData {
  goal: Goal;
  dailyQuotas: DailyQuota[];
  totalDays: number;
  workingDays: number;
  dailyGrowthRate: number;
  excludeWeekends: boolean;
}

export function SpreadsheetPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGoalSelection, setShowGoalSelection] = useState(true);
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    loadGoals();
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;
    
    try {
      const userGoals = await db.getGoalsByUser(user.id);
      // Filter for financial goals or goals with target values
      const calculableGoals = userGoals.filter(goal => 
        goal.category === 'finance' || (goal.targetValue && goal.targetValue > 0)
      );
      setGoals(calculableGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const calculateSpreadsheet = async (goal: Goal, options: {
    excludeWeekends?: boolean;
    customStartDate?: string;
    customEndDate?: string;
  } = {}): Promise<SpreadsheetData> => {
    const startValue = goal.startingCapital || goal.currentValue || 1;
    const targetValue = goal.targetValue || 1000;
    
    // Use custom dates if provided, otherwise use goal dates or defaults
    let startDate: Date;
    let endDate: Date;
    
    if (options.customStartDate) {
      startDate = new Date(options.customStartDate);
    } else {
      startDate = new Date();
    }
    
    if (options.customEndDate) {
      endDate = new Date(options.customEndDate);
    } else if (goal.targetDate) {
      endDate = new Date(goal.targetDate);
    } else {
      endDate = addDays(startDate, 90); // Default 90 days
    }
    
    // Ensure end date is after start date
    if (endDate <= startDate) {
      endDate = addDays(startDate, 30); // Minimum 30 days
    }
    
    const totalCalendarDays = Math.max(1, differenceInDays(endDate, startDate));
    
    // Calculate working days (excluding weekends if option is enabled)
    let workingDays = totalCalendarDays;
    if (options.excludeWeekends) {
      workingDays = 0;
      let currentDate = new Date(startDate);
      
      for (let i = 0; i < totalCalendarDays; i++) {
        if (!isWeekend(currentDate)) {
          workingDays++;
        }
        currentDate = addDays(currentDate, 1);
      }
    }
    
    // Ensure at least 1 working day
    workingDays = Math.max(1, workingDays);
    
    // Calculate daily growth rate based on working days only
    const dailyGrowthRate = workingDays > 1 ? Math.pow(targetValue / startValue, 1 / workingDays) - 1 : 0;
    
    // Load existing spreadsheet data from database
    const existingData = await db.getSpreadsheetDataByGoal(goal.id);
    const existingDataMap = new Map(existingData.map(d => [d.day, d.completed]));
    
    const dailyQuotas: DailyQuota[] = [];
    let workingDayCounter = 0;
    
    for (let calendarDay = 1; calendarDay <= totalCalendarDays; calendarDay++) {
      const date = addDays(startDate, calendarDay - 1);
      const isWeekendDay = isWeekend(date);
      const isSkipped = options.excludeWeekends && isWeekendDay;
      
      let requiredAmount = 0;
      let cumulativeAmount = startValue;
      let percentage = (startValue / targetValue) * 100;
      
      if (!isSkipped) {
        workingDayCounter++;
        cumulativeAmount = startValue * Math.pow(1 + dailyGrowthRate, workingDayCounter - 1);
        const previousAmount = workingDayCounter === 1 ? startValue : startValue * Math.pow(1 + dailyGrowthRate, workingDayCounter - 2);
        requiredAmount = cumulativeAmount - previousAmount;
        percentage = (cumulativeAmount / targetValue) * 100;
      }
      
      const completed = existingDataMap.get(calendarDay) || false;
      
      const quotaData: DailyQuota = {
        day: calendarDay,
        date,
        requiredAmount,
        cumulativeAmount,
        completed,
        percentage,
        isWeekend: isWeekendDay,
        isSkipped
      };
      
      dailyQuotas.push(quotaData);
      
      // Save to database if not exists
      if (!existingDataMap.has(calendarDay)) {
        await db.saveSpreadsheetData({
          goalId: goal.id,
          userId: goal.userId,
          day: calendarDay,
          date,
          requiredAmount,
          cumulativeAmount,
          completed,
          percentage
        });
      }
    }
    
    return {
      goal,
      dailyQuotas,
      totalDays: totalCalendarDays,
      workingDays,
      dailyGrowthRate: dailyGrowthRate * 100, // Convert to percentage
      excludeWeekends: options.excludeWeekends || false
    };
  };

  const handleGoalSelect = async (goal: Goal) => {
    setSelectedGoal(goal);
    const data = await calculateSpreadsheet(goal, {
      excludeWeekends,
      customStartDate,
      customEndDate
    });
    setSpreadsheetData(data);
    setShowGoalSelection(false);
  };

  const recalculateSpreadsheet = async () => {
    if (!selectedGoal) return;
    
    const data = await calculateSpreadsheet(selectedGoal, {
      excludeWeekends,
      customStartDate,
      customEndDate
    });
    setSpreadsheetData(data);
    toast.success('Spreadsheet recalculated with new settings!');
  };

  const handleBackToSelection = () => {
    setShowGoalSelection(true);
    setSelectedGoal(null);
    setSpreadsheetData(null);
  };

  const toggleDayCompleted = async (dayIndex: number) => {
    if (!spreadsheetData || !user) return;

    const quota = spreadsheetData.dailyQuotas[dayIndex];
    const newCompletedStatus = !quota.completed;

    try {
      // Update database
      await db.updateSpreadsheetData({
        goalId: spreadsheetData.goal.id,
        userId: user.id,
        day: quota.day,
        completed: newCompletedStatus
      });

      // Update local state
      const updatedData = { ...spreadsheetData };
      updatedData.dailyQuotas[dayIndex].completed = newCompletedStatus;
      setSpreadsheetData(updatedData);

      // Show success message
      toast.success(newCompletedStatus ? 'Day marked as complete!' : 'Day marked as incomplete');

      // Send push notification for completion
      if (newCompletedStatus) {
        await notificationService.sendSpreadsheetCompletedNotification(
          user.id,
          spreadsheetData.goal.title
        );
        // Cancel any existing reminder for this day
        await notificationService.cancelScheduledNotification(`quota-reminder-${spreadsheetData.goal.id}-${quota.day}`);
      } else {
        // Potentially reschedule reminder (optional)
        const reminderTime = new Date(quota.date);
        reminderTime.setHours(9, 0, 0, 0); // 9 AM reminder
        
        if (reminderTime > new Date()) {
          await notificationService.showNotification(
            'Daily Quota Reminder',
            {
              body: `Don't forget your daily quota for ${spreadsheetData.goal.title}!`,
              tag: `quota-reminder-${spreadsheetData.goal.id}-${quota.day}`
            },
            user.id,
            'daily_quota'
          );
        }
      }
    } catch (error) {
      console.error('Failed to update completion status:', error);
      toast.error('Failed to update completion status');
    }
  };

  const exportToPDF = () => {
    if (!spreadsheetData || !user) return;

    try {
      const pdf = new jsPDF();
      const { goal, dailyQuotas, dailyGrowthRate } = spreadsheetData;
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;

      // Bank Statement Header
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROGRESSPULSE', 20, yPosition);
      pdf.text('GOAL PROGRESS STATEMENT', pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 10;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      
      yPosition += 15;
      
      // Account Information
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Account Holder: ${user.name}`, 20, yPosition);
      pdf.text(`Statement Date: ${format(new Date(), 'MM/dd/yyyy')}`, pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 8;
      pdf.text(`Goal: ${goal.title}`, 20, yPosition);
      pdf.text(`Category: ${goal.category.toUpperCase()}`, pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 8;
      pdf.text(`Target Amount: ${goal.targetValue}${goal.unit || ''}`, 20, yPosition);
      pdf.text(`Daily Growth Rate: ${dailyGrowthRate.toFixed(2)}%`, pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 20;
      
      // Summary Section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACCOUNT SUMMARY', 20, yPosition);
      yPosition += 10;
      
      // Summary Table
      const summaryData = [
        ['Total Days', dailyQuotas.length.toString()],
        ['Completed Days', dailyQuotas.filter(q => q.completed).length.toString()],
        ['Completion Rate', `${((dailyQuotas.filter(q => q.completed).length / dailyQuotas.length) * 100).toFixed(1)}%`],
        ['Current Progress', `${goal.targetValue ? ((goal.currentValue / goal.targetValue) * 100).toFixed(1) : '0'}%`]
      ];
      
      // Draw summary table
      const colWidth = (pageWidth - 40) / 2;
      summaryData.forEach((row, index) => {
        if (index % 2 === 1) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(20, yPosition - 3, pageWidth - 40, 8, 'F');
        }
        
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(20, yPosition - 3, pageWidth - 40, 8, 'S');
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(row[0], 22, yPosition + 2);
        pdf.text(row[1], 22 + colWidth, yPosition + 2);
        
        pdf.line(20 + colWidth, yPosition - 3, 20 + colWidth, yPosition + 5);
        yPosition += 8;
      });
      
      yPosition += 15;
      
      // Transaction History
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DAILY QUOTA TRANSACTIONS', 20, yPosition);
      yPosition += 10;
      
      // Table headers
      const headers = ['Day', 'Date', 'Required', 'Cumulative', 'Progress', 'Status'];
      const colWidths = [25, 35, 35, 35, 30, 30];
      let xPos = 20;
      
      // Header background
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition - 3, pageWidth - 40, 8, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.rect(20, yPosition - 3, pageWidth - 40, 8, 'S');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      headers.forEach((header, i) => {
        pdf.text(header, xPos + 2, yPosition + 2);
        if (i < headers.length - 1) {
          pdf.line(xPos + colWidths[i], yPosition - 3, xPos + colWidths[i], yPosition + 5);
        }
        xPos += colWidths[i];
      });
      
      yPosition += 8;
      
      // Table rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      
      dailyQuotas.forEach((quota, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
          
          // Repeat header on new page
          pdf.setFillColor(240, 240, 240);
          pdf.rect(20, yPosition - 3, pageWidth - 40, 8, 'F');
          pdf.setDrawColor(0, 0, 0);
          pdf.rect(20, yPosition - 3, pageWidth - 40, 8, 'S');
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          
          xPos = 20;
          headers.forEach((header, i) => {
            pdf.text(header, xPos + 2, yPosition + 2);
            if (i < headers.length - 1) {
              pdf.line(xPos + colWidths[i], yPosition - 3, xPos + colWidths[i], yPosition + 5);
            }
            xPos += colWidths[i];
          });
          
          yPosition += 8;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
        }
        
        // Alternating row colors
        if (index % 2 === 1) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(20, yPosition - 2, pageWidth - 40, 6, 'F');
        }
        
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(20, yPosition - 2, pageWidth - 40, 6, 'S');
        
        // Row data
        const rowData = [
          quota.day.toString(),
          format(quota.date, 'MM/dd/yy'),
          `+${quota.requiredAmount.toFixed(2)}`,
          quota.cumulativeAmount.toFixed(2),
          `${quota.percentage.toFixed(1)}%`,
          quota.completed ? 'COMPLETE' : 'PENDING'
        ];
        
        xPos = 20;
        rowData.forEach((data, i) => {
          pdf.setTextColor(0, 0, 0);
          if (i === 5) { // Status column
            pdf.setTextColor(quota.completed ? 0 : 100, quota.completed ? 150 : 100, quota.completed ? 0 : 100);
          }
          pdf.text(data, xPos + 2, yPosition + 2);
          if (i < rowData.length - 1) {
            pdf.line(xPos + colWidths[i], yPosition - 2, xPos + colWidths[i], yPosition + 4);
          }
          xPos += colWidths[i];
        });
        
        yPosition += 6;
      });
      
      // Footer on all pages
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        pdf.text('ProgressPulse - Goal Progress Tracking Platform', 20, pageHeight - 10);
      }

      pdf.save(`${goal.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-statement.pdf`);
      toast.success('Professional statement exported to PDF!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export statement');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-screen p-0 m-0">
        <div className="animate-pulse space-y-4 content-section">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showGoalSelection) {
    return (
      <div className="w-full h-full min-h-screen p-0 m-0">
        {/* Header */}
        <div className="content-section">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8" />
            Goal Spreadsheet
          </h1>
          <p className="text-muted-foreground">
            Calculate daily quotas and track progress for your goals
          </p>
        </div>

        {/* Goal Selection */}
        <div className="grid gap-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No calculable goals found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create a financial goal or a goal with a target value to use the spreadsheet feature.
                </p>
                <Button onClick={() => window.location.href = '/goals'}>
                  Create Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-6" onClick={() => handleGoalSelect(goal)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          {goal.category === 'finance' ? (
                            <DollarSign className="h-6 w-6 text-primary" />
                          ) : (
                            <Target className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <p className="text-muted-foreground">
                            {goal.currentValue}{goal.unit || ''} → {goal.targetValue}{goal.unit || ''}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="capitalize">
                              {goal.category}
                            </Badge>
                            <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                              {goal.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {((goal.currentValue / (goal.targetValue || 1)) * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (!spreadsheetData) return null;

  const { goal, dailyQuotas, dailyGrowthRate, workingDays, excludeWeekends: weekendsExcluded } = spreadsheetData;
  const completedDays = dailyQuotas.filter(q => q.completed && !q.isSkipped).length;
  const totalWorkingDays = dailyQuotas.filter(q => !q.isSkipped).length;
  const completionRate = totalWorkingDays > 0 ? (completedDays / totalWorkingDays) * 100 : 0;

  return (
    <div className="w-full h-full min-h-screen p-0 m-0">
      {/* Header */}
      <div className="space-y-4 content-section">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleBackToSelection}
              className="w-fit text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Goals
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{goal.title} Spreadsheet</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Daily quota calculator for reaching your goal
              </p>
            </div>
          </div>

          <Button 
            onClick={exportToPDF} 
            className="w-fit text-sm sm:text-base flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Spreadsheet Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weekend Exclusion */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Weekend Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exclude-weekends"
                  checked={excludeWeekends}
                  onCheckedChange={(checked) => setExcludeWeekends(checked as boolean)}
                />
                <Label htmlFor="exclude-weekends" className="text-sm">
                  Exclude weekends
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Skip Saturdays and Sundays from calculations
              </p>
            </div>

            {/* Custom Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Custom Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Override default start date
              </p>
            </div>

            {/* Custom End Date */}
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">
                Custom End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Override goal target date
              </p>
            </div>

            {/* Recalculate Button */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Apply Changes</Label>
              <Button
                onClick={recalculateSpreadsheet}
                className="w-full"
                size="sm"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
              <p className="text-xs text-muted-foreground">
                Update spreadsheet with new settings
              </p>
            </div>
          </div>

          {/* Current Settings Display */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Days:</span> {dailyQuotas.length}
              </div>
              <div>
                <span className="font-medium">Working Days:</span> {totalWorkingDays}
              </div>
              <div>
                <span className="font-medium">Weekends:</span> {weekendsExcluded ? 'Excluded' : 'Included'}
              </div>
              <div>
                <span className="font-medium">Weekend Days:</span> {dailyQuotas.filter(q => q.isWeekend).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="font-semibold">{goal.targetValue}{goal.unit || ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Daily Growth</p>
                <p className="font-semibold">{dailyGrowthRate.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Days Completed</p>
                <p className="font-semibold">{completedDays} / {totalWorkingDays}</p>
                {weekendsExcluded && (
                  <p className="text-xs text-muted-foreground">Weekends excluded</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="font-semibold">{completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spreadsheet Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Daily Quota Spreadsheet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Required Amount</TableHead>
                  <TableHead>Cumulative</TableHead>
                  <TableHead>Progress %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyQuotas.slice(0, 30).map((quota, index) => {
                  const rowClassName = quota.isSkipped 
                    ? 'bg-gray-50 dark:bg-gray-900/20 opacity-60' 
                    : quota.completed 
                      ? 'bg-green-50 dark:bg-green-950/20' 
                      : '';
                  
                  return (
                    <TableRow key={quota.day} className={rowClassName}>
                      <TableCell className="font-medium">{quota.day}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {format(quota.date, 'MMM dd')}
                          {quota.isWeekend && (
                            <Badge variant="secondary" className="text-xs">
                              {format(quota.date, 'EEE')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {quota.isSkipped ? (
                          <span className="text-muted-foreground text-sm">Skipped</span>
                        ) : (
                          `+${quota.requiredAmount.toFixed(2)}${goal.unit || ''}`
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {quota.isSkipped ? (
                          <span className="text-muted-foreground text-sm">-</span>
                        ) : (
                          `${quota.cumulativeAmount.toFixed(2)}${goal.unit || ''}`
                        )}
                      </TableCell>
                      <TableCell>
                        {quota.isSkipped ? (
                          <span className="text-muted-foreground text-sm">-</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ width: `${Math.min(quota.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {quota.percentage.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {quota.isSkipped ? (
                          <Badge variant="secondary" className="bg-gray-400">
                            Weekend
                          </Badge>
                        ) : quota.completed ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {quota.isSkipped ? (
                          <span className="text-muted-foreground text-sm">-</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDayCompleted(index)}
                            className="h-8 px-2"
                          >
                            {quota.completed ? 'Undo' : 'Mark Done'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {dailyQuotas.length > 30 && (
            <div className="text-center py-4 text-muted-foreground">
              Showing first 30 days. Export to PDF to see all days.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
