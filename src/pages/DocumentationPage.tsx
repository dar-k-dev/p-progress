import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  BarChart3, 
  Calendar, 
  Trophy, 
  Settings, 
  FileSpreadsheet, 
  Award, 
  Bell, 
  User, 
  Shield,
  Download,
  BookOpen,
  Code,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Target className="h-5 w-5" />,
    content: [
      {
        title: 'Creating Your First Goal',
        description: 'Learn how to set up and track your first goal in ProgressPulse.',
        steps: [
          'Navigate to the Goals page',
          'Click "Create New Goal"',
          'Fill in your goal details (title, category, target)',
          'Set a target date and priority level',
          'Choose a color theme for your goal',
          'Click "Create Goal" to save'
        ]
      },
      {
        title: 'Understanding Goal Categories',
        description: 'Different goal types and how to use them effectively.',
        steps: [
          'Fitness: Track workouts, running distance, weight loss',
          'Learning: Monitor study hours, courses completed, skills acquired',
          'Career: Professional development, certifications, promotions',
          'Health: Medical appointments, medication tracking, wellness goals',
          'Finance: Savings targets, investment goals, debt reduction',
          'Personal: Habits, hobbies, personal development',
          'Creative: Art projects, writing goals, creative challenges',
          'Social: Networking, relationships, community involvement'
        ]
      }
    ]
  },
  {
    id: 'tracking-progress',
    title: 'Tracking Progress',
    icon: <BarChart3 className="h-5 w-5" />,
    content: [
      {
        title: 'Daily Progress Logging',
        description: 'How to effectively log your daily progress.',
        steps: [
          'Go to the Progress page',
          'Click "Add Progress" for your goal',
          'Enter the amount of progress made',
          'Add notes about your experience',
          'Upload photos if relevant',
          'Save your progress entry'
        ]
      },
      {
        title: 'Progress Visualization',
        description: 'Understanding your progress charts and metrics.',
        steps: [
          'View progress charts on the dashboard',
          'Check completion percentages',
          'Monitor daily, weekly, and monthly trends',
          'Identify patterns in your progress',
          'Use insights to adjust your approach'
        ]
      }
    ]
  },
  {
    id: 'financial-goals',
    title: 'Financial Goal Spreadsheet',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    content: [
      {
        title: 'Setting Up Financial Goals',
        description: 'How to use the advanced spreadsheet calculator for financial goals.',
        steps: [
          'Create a goal with "Finance" category',
          'Set your starting capital amount',
          'Define your target value',
          'Choose your target date',
          'Set daily growth rate percentage',
          'The system calculates daily quotas automatically'
        ]
      },
      {
        title: 'Using the Spreadsheet',
        description: 'Navigate and use the financial spreadsheet effectively.',
        steps: [
          'Access the Spreadsheet page',
          'Select your financial goal',
          'View daily quota requirements',
          'Mark days as complete when targets are met',
          'Track cumulative progress',
          'Export spreadsheet as PDF for records'
        ]
      }
    ]
  },
  {
    id: 'achievements',
    title: 'Achievements & Certificates',
    icon: <Trophy className="h-5 w-5" />,
    content: [
      {
        title: 'Unlocking Achievements',
        description: 'How the achievement system works.',
        steps: [
          'Complete goals to unlock achievements',
          'Maintain streaks for streak-based badges',
          'Reach milestones for milestone achievements',
          'View all achievements on the Achievements page',
          'Share your achievements with others'
        ]
      },
      {
        title: 'Downloading Certificates',
        description: 'Generate professional certificates for completed goals.',
        steps: [
          'Complete a goal successfully',
          'Go to the Certificates page',
          'Select the completed goal',
          'Click "Generate Certificate"',
          'Download as high-quality PNG image',
          'Share or print your certificate'
        ]
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications & Reminders',
    icon: <Bell className="h-5 w-5" />,
    content: [
      {
        title: 'Setting Up Notifications',
        description: 'Configure push notifications and reminders.',
        steps: [
          'Go to Settings page',
          'Enable notifications permission',
          'Set your preferred reminder time',
          'Choose notification types to receive',
          'Configure daily quota reminders',
          'Set milestone achievement alerts'
        ]
      },
      {
        title: 'Managing Notifications',
        description: 'View and manage your notification history.',
        steps: [
          'Access the Notifications page',
          'View recent notifications',
          'Mark notifications as read',
          'Delete unwanted notifications',
          'Filter by notification type',
          'Clear all notifications at once'
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Account Security',
    icon: <Shield className="h-5 w-5" />,
    content: [
      {
        title: 'Biometric Authentication',
        description: 'Secure your account with PIN or fingerprint.',
        steps: [
          'Go to Profile page',
          'Click "Setup Biometric Auth"',
          'Setup 4-digit PIN or fingerprint',
          'Confirm your setup',
          'Use PIN/fingerprint when opening app',
          'Manage settings in Profile page'
        ]
      },
      {
        title: 'Account Management',
        description: 'Manage your account settings and data.',
        steps: [
          'Update profile information',
          'Change password regularly',
          'Review login activity',
          'Export your data if needed',
          'Delete account if necessary'
        ]
      }
    ]
  }
];

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'You can change your password in the Profile page under Security settings. Enter your current password and set a new one.'
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes, you can export progress reports as professional PDF statements from the header menu, or export all data from Profile settings.'
  },
  {
    question: 'How does progress tracking work?',
    answer: 'Create goals with target values, then log progress entries with values and notes. The app automatically calculates completion percentages and shows visual progress.'
  },
  {
    question: 'Why am I not receiving notifications?',
    answer: 'Make sure you have granted notification permissions in your browser and enabled notifications in the Settings page. The app supports both web and native push notifications.'
  },
  {
    question: 'Can I change my goal after creating it?',
    answer: 'Yes, you can edit most goal properties by clicking the edit button on your goal card. However, changing target values may affect your progress calculations.'
  },
  {
    question: 'How do achievements work?',
    answer: 'Achievements are automatically unlocked based on your progress. Complete goals, maintain streaks, and reach milestones to unlock different badges and certificates.'
  }
];

export function DocumentationPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Documentation
          </h1>
          <p className="text-muted-foreground">
            Complete guide to using ProgressPulse effectively
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
          <CardDescription>Jump to specific sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {documentationSections.map((section) => (
              <Button
                key={section.id}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => {
                  const element = document.getElementById(section.id);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="text-sm">{section.title}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Sections */}
      <div className="space-y-8">
        {documentationSections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      {item.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm">
                          {step}
                        </li>
                      ))}
                    </ol>
                    {itemIndex < section.content.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Code className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions and answers about ProgressPulse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
                {index < faqs.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              Additional resources and support options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 justify-start">
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Video Tutorials</div>
                    <div className="text-sm text-muted-foreground">
                      Watch step-by-step guides
                    </div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 justify-start">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Download Guide</div>
                    <div className="text-sm text-muted-foreground">
                      Get the complete PDF guide
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}