import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ArrowRight,
  X,
  Target,
  BarChart3,
  Calendar,
  Trophy,
  Settings,
  FileSpreadsheet,
  Award,
  Bell,
  User,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: string;
  position?: { x: number; y: number };
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ProgressPulse!',
    description: 'Let\'s take a quick tour of the app to help you get started with tracking your goals and achievements.',
    icon: <Zap className="h-8 w-8" />,
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Your dashboard shows a summary of all your goals, recent progress, and key metrics at a glance.',
    icon: <BarChart3 className="h-8 w-8" />,
    route: '/dashboard',
    highlight: 'main-content'
  },
  {
    id: 'goals',
    title: 'Manage Your Goals',
    description: 'Create, edit, and track your personal goals. Set targets, deadlines, and categorize them for better organization.',
    icon: <Target className="h-8 w-8" />,
    route: '/goals',
    highlight: 'goals-section'
  },
  {
    id: 'progress',
    title: 'Track Progress',
    description: 'Log your daily progress with notes and photos. See your journey unfold with detailed tracking.',
    icon: <BarChart3 className="h-8 w-8" />,
    route: '/progress',
    highlight: 'progress-section'
  },
  {
    id: 'calendar',
    title: 'Calendar View',
    description: 'View your progress and milestones in a calendar format. Perfect for seeing patterns and planning ahead.',
    icon: <Calendar className="h-8 w-8" />,
    route: '/calendar',
    highlight: 'calendar-view'
  },
  {
    id: 'achievements',
    title: 'Celebrate Achievements',
    description: 'Unlock badges and achievements as you complete goals and maintain streaks. Celebrate your wins!',
    icon: <Trophy className="h-8 w-8" />,
    route: '/achievements',
    highlight: 'achievements-section'
  },
  {
    id: 'spreadsheet',
    title: 'Financial Goal Spreadsheet',
    description: 'For financial goals, use our advanced spreadsheet calculator to determine daily quotas and compound growth.',
    icon: <FileSpreadsheet className="h-8 w-8" />,
    route: '/spreadsheet',
    highlight: 'spreadsheet-feature'
  },
  {
    id: 'certificates',
    title: 'Download Certificates',
    description: 'Generate and download professional certificates for your completed goals. Perfect for sharing achievements!',
    icon: <Award className="h-8 w-8" />,
    route: '/certificates',
    highlight: 'certificates-section'
  },
  {
    id: 'notifications',
    title: 'Stay Updated',
    description: 'Receive notifications for daily reminders, milestone achievements, and important updates.',
    icon: <Bell className="h-8 w-8" />,
    route: '/notifications',
    highlight: 'notifications-button'
  },
  {
    id: 'profile',
    title: 'Manage Your Profile',
    description: 'Update your profile information, preferences, and account settings. Enable two-factor authentication for security.',
    icon: <User className="h-8 w-8" />,
    route: '/profile',
    highlight: 'profile-menu'
  },
  {
    id: 'settings',
    title: 'Customize Settings',
    description: 'Personalize your experience with theme settings, notification preferences, and reminder times.',
    icon: <Settings className="h-8 w-8" />,
    route: '/settings',
    highlight: 'settings-section'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You\'ve completed the tutorial! Start creating your first goal and begin your progress tracking journey.',
    icon: <Target className="h-8 w-8" />
  }
];

export function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const currentTutorialStep = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleViewPage = () => {
    const currentStepData = tutorialSteps[currentStep];
    if (currentStepData.route) {
      navigate(currentStepData.route);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      {currentTutorialStep.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{currentTutorialStep.title}</h2>
                      <Badge variant="outline" className="mt-1">
                        Step {currentStep + 1} of {tutorialSteps.length}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSkip}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="mb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {currentTutorialStep.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Progress
                    </span>
                    <span className="text-sm font-medium">
                      {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div 
                      className="bg-primary rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {tutorialSteps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-primary scale-125'
                          : index < currentStep
                          ? 'bg-primary/60'
                          : 'bg-muted hover:bg-muted-foreground/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="text-muted-foreground"
                    >
                      Skip Tutorial
                    </Button>

                    <Button
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      {currentStep === tutorialSteps.length - 1 ? (
                        <>
                          Get Started
                          <Zap className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Additional Info for Current Step */}
                {currentTutorialStep.route && currentStep > 0 && currentStep < tutorialSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <p className="text-sm text-muted-foreground mb-3">
                      💡 <strong>Tip:</strong> This step covers the {currentTutorialStep.title.toLowerCase()} section. 
                      Click the button below to view the actual page while following the tutorial.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleViewPage}
                      className="w-full"
                    >
                      View {currentTutorialStep.title}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
