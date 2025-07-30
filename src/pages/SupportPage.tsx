import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function SupportPage() {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create my first goal?',
          answer: 'Navigate to the Goals page and click "Add Goal". Fill in the details like title, target value, deadline, and category. You can also set daily targets and reminders.'
        },
        {
          question: 'Can I use the app offline?',
          answer: 'Yes! ProgressPulse is a Progressive Web App (PWA) that works offline. Your data is stored locally and will sync when you\'re back online.'
        },
        {
          question: 'How do I track my progress?',
          answer: 'Go to the Progress page and select a goal. You can log progress with values, notes, and even attach images. The app will automatically calculate your progress percentage.'
        }
      ]
    },
    {
      category: 'Features',
      questions: [
        {
          question: 'What types of goals can I track?',
          answer: 'You can track various goal types including fitness, learning, finance, health, career, and personal goals. Each category has specific features tailored to that goal type.'
        },
        {
          question: 'How do push notifications work?',
          answer: 'Push notifications work in both web browsers and native mobile apps. You can set daily reminders, milestone celebrations, and progress updates. Make sure to allow notifications when prompted.'
        },
        {
          question: 'Can I export my data?',
          answer: 'Yes! You can export your progress data as PDF reports from the header menu, or export all your data from the Profile settings.'
        }
      ]
    },
    {
      category: 'Technical',
      questions: [
        {
          question: 'Why aren\'t my notifications working?',
          answer: 'Check that you\'ve allowed notifications in your browser/device settings. For mobile apps, ensure the app has notification permissions. Try refreshing the page or restarting the app.'
        },
        {
          question: 'My data isn\'t syncing. What should I do?',
          answer: 'Check your internet connection. The app shows your online status in the header. If you\'re online but data isn\'t syncing, try refreshing the page.'
        },
        {
          question: 'How do I install the app on my phone?',
          answer: 'For web: Use your browser\'s "Add to Home Screen" option. For native apps: Download the APK from our website or app store when available.'
        }
      ]
    }
  ];

  const sendToTelegram = async (formData: typeof contactForm) => {
    const TELEGRAM_BOT_TOKEN = '8366110415:AAGqQ0qoae1fHF7-lCSt6e1isjoOFrqG3ys';
    
    // First, let's get the chat ID by checking recent messages
    try {
      const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      const updatesData = await updatesResponse.json();
      
      console.log('Bot updates:', updatesData);
      
      if (!updatesData.ok || !updatesData.result || updatesData.result.length === 0) {
        throw new Error('No chat found. Please send a message to @retrieval1bot first, then try again.');
      }
      
      // Get the most recent chat ID
      const chatId = updatesData.result[updatesData.result.length - 1].message.chat.id;
      console.log('Using chat ID:', chatId);
      
      const message = `🆘 New Support Request - ProgressPulse\n\n👤 Name: ${formData.name}\n📧 Email: ${formData.email}\n📂 Category: ${formData.category}\n📝 Subject: ${formData.subject}\n\n💬 Message:\n${formData.message}\n\n⏰ Submitted: ${new Date().toLocaleString()}`;

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      const result = await response.json();
      console.log('Send message result:', result);
      
      if (!response.ok) {
        throw new Error(result.description || 'Failed to send message');
      }

      return true;
    } catch (error) {
      console.error('Telegram error:', error);
      throw error;
    }
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const loadingToast = toast.loading('Sending your message...');
    
    try {
      await sendToTelegram(contactForm);
      toast.dismiss(loadingToast);
      toast.success('Support request submitted! We\'ll get back to you within 24 hours.');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      console.error('Support form error:', error);
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.close()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Close
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <HelpCircle className="h-8 w-8 mr-3 text-primary" />
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Get help with ProgressPulse or contact our support team
          </p>
        </div>
      </div>

      {/* Quick Help Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Response Time</h3>
            <p className="text-sm text-muted-foreground">Usually within 24 hours</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Contact Form</h3>
            <p className="text-sm text-muted-foreground">Send us a message below</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Search */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Search our knowledge base for quick answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-6">
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                        {faq.question}
                      </h4>
                      <p className="text-sm text-muted-foreground ml-6">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {searchQuery && filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No FAQs found matching your search.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try different keywords or contact support below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Send us a message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={contactForm.category}
                onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="general">General Question</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="account">Account Issue</option>
                <option value="technical">Technical Problem</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Input
                value={contactForm.subject}
                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Message</label>
              <Textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                placeholder="Please provide as much detail as possible..."
                rows={5}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => window.open('/docs', '_blank')} className="justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button variant="outline" onClick={() => window.open('/releases', '_blank')} className="justify-start">
              <Info className="h-4 w-4 mr-2" />
              Release Notes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}