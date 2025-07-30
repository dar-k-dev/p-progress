import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/database';
import { certificateGenerator } from '@/lib/certificateGenerator';
import { Goal } from '@/types';
import { 
  Award, 
  Download, 
  Trophy,
  Calendar,
  Target,
  Star,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function CertificatesPage() {
  const { user } = useAuth();
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCertificate, setGeneratingCertificate] = useState<string | null>(null);

  useEffect(() => {
    loadCompletedGoals();
  }, [user]);

  const loadCompletedGoals = async () => {
    if (!user) return;
    
    try {
      const userGoals = await db.getGoalsByUser(user.id);
      const completed = userGoals.filter(goal => goal.status === 'completed');
      setCompletedGoals(completed);
    } catch (error) {
      console.error('Failed to load completed goals:', error);
      toast.error('Failed to load completed goals');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (goal: Goal) => {
    if (generatingCertificate || !user) return;
    
    setGeneratingCertificate(goal.id);
    try {
      const dataUrl = await certificateGenerator.generateCertificate(goal, user);
      certificateGenerator.downloadCertificate(dataUrl, goal.title);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      toast.error('Failed to generate certificate');
    } finally {
      setGeneratingCertificate(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness':
        return '💪';
      case 'learning':
        return '📚';
      case 'career':
        return '💼';
      case 'health':
        return '🏥';
      case 'finance':
        return '💰';
      case 'personal':
        return '🌱';
      case 'creative':
        return '🎨';
      case 'social':
        return '👥';
      default:
        return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness':
        return 'bg-red-500';
      case 'learning':
        return 'bg-blue-500';
      case 'career':
        return 'bg-purple-500';
      case 'health':
        return 'bg-green-500';
      case 'finance':
        return 'bg-yellow-500';
      case 'personal':
        return 'bg-pink-500';
      case 'creative':
        return 'bg-orange-500';
      case 'social':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-screen p-0 m-0">
        <div className="animate-pulse space-y-4 content-section">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen p-0 m-0">
      {/* Header */}
      <div className="content-section">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Award className="h-8 w-8 text-yellow-500" />
          Certificates
        </h1>
        <p className="text-muted-foreground">
          Download certificates for your completed goals and celebrate your achievements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
                <p className="text-sm text-muted-foreground">Goals Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(completedGoals.map(g => g.category)).size}
                </p>
                <p className="text-sm text-muted-foreground">Categories Mastered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
                <p className="text-sm text-muted-foreground">Certificates Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Grid */}
      {completedGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No certificates available yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Complete your goals to earn certificates that you can download and share.
            </p>
            <Button onClick={() => window.location.href = '/goals'}>
              <Target className="h-4 w-4 mr-2" />
              View Your Goals
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                <div className={`h-2 ${getCategoryColor(goal.category)}`}></div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getCategoryIcon(goal.category)}</div>
                      <div>
                        <Badge variant="outline" className="mb-2 capitalize">
                          {goal.category}
                        </Badge>
                        <CardTitle className="text-lg line-clamp-2">
                          {goal.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {goal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Achieved: {goal.currentValue}/{goal.targetValue}
                        {goal.unit && ` ${goal.unit}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Completed: {format(new Date(goal.updatedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      onClick={() => handleDownloadCertificate(goal)}
                      disabled={generatingCertificate === goal.id}
                      className="w-full"
                    >
                      {generatingCertificate === goal.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download Certificate
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">About Your Certificates</h3>
              <p className="text-muted-foreground mb-4">
                Each certificate is uniquely generated for your completed goals and includes:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Your name and goal achievement details
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completion date and unique certificate ID
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Professional design suitable for sharing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  PNG format for easy printing and sharing
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
