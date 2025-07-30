import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Progress, Goal } from '@/types';
import { format, parseISO } from 'date-fns';

interface ProgressChartProps {
  data: Progress[];
  goals: Goal[];
}

export function ProgressChart({ data, goals }: ProgressChartProps) {
  const chartData = useMemo(() => {
    // Group progress by date and goal
    const groupedData = data.reduce((acc, progress) => {
      const dateKey = format(new Date(progress.date), 'yyyy-MM-dd');
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          displayDate: format(new Date(progress.date), 'MMM dd'),
        };
      }
      
      const goal = goals.find(g => g.id === progress.goalId);
      if (goal) {
        const goalKey = goal.title.substring(0, 20); // Truncate for display
        acc[dateKey][goalKey] = (acc[dateKey][goalKey] || 0) + progress.value;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data, goals]);

  const goalColors = useMemo(() => {
    return goals.reduce((acc, goal) => {
      acc[goal.title.substring(0, 20)] = goal.color;
      return acc;
    }, {} as Record<string, string>);
  }, [goals]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No progress data to display</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="displayDate" 
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
          <Legend />
          {goals.map((goal) => {
            const goalKey = goal.title.substring(0, 20);
            return (
              <Line
                key={goal.id}
                type="monotone"
                dataKey={goalKey}
                stroke={goal.color}
                strokeWidth={2}
                dot={{ fill: goal.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: goal.color, strokeWidth: 2 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}