import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.close()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Close
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="h-8 w-8 mr-3 text-primary" />
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-1">
            How we protect and handle your personal information
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Information We Collect
            </CardTitle>
            <CardDescription>
              What data we collect and how we use it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Name and email address (for account creation)</li>
                <li>• Profile information you choose to provide</li>
                <li>• Goals and progress data you create</li>
                <li>• Usage analytics to improve the app</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Technical Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Device information and browser type</li>
                <li>• IP address and location data</li>
                <li>• App usage patterns and performance data</li>
                <li>• Push notification tokens</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Storage & Security
            </CardTitle>
            <CardDescription>
              How we store and protect your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Local Storage</h4>
              <p className="text-sm text-muted-foreground">
                Your data is primarily stored locally on your device using encrypted IndexedDB. 
                This ensures your information remains private and accessible offline.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">No Cloud Storage</h4>
              <p className="text-sm text-muted-foreground">
                All your data stays on your device. We don't store your personal information 
                on external servers, ensuring complete privacy.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Security Measures</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• End-to-end encryption for sensitive data</li>
                <li>• Secure HTTPS connections</li>
                <li>• Regular security audits and updates</li>
                <li>• No third-party data sharing</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Your Rights
            </CardTitle>
            <CardDescription>
              What you can do with your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Access & Export</h4>
                <p className="text-sm text-muted-foreground">
                  Download all your data in a portable format anytime from your profile settings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data with one click.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Correction</h4>
                <p className="text-sm text-muted-foreground">
                  Update or correct your personal information directly in the app.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Opt-out</h4>
                <p className="text-sm text-muted-foreground">
                  Disable analytics, notifications, or other optional features anytime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Third-Party Services
            </CardTitle>
            <CardDescription>
              External services we use and their privacy implications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Telegram Bot</h4>
              <p className="text-sm text-muted-foreground">
                Support messages are sent via Telegram bot for customer service. Only support inquiries are transmitted.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">No Analytics</h4>
              <p className="text-sm text-muted-foreground">
                We don't use any analytics or tracking services. Your usage patterns remain completely private.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Contact & Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Privacy Questions</h4>
              <p className="text-sm text-muted-foreground">
                If you have questions about this privacy policy or how we handle your data, 
                please contact us through the app's support section.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Policy Updates</h4>
              <p className="text-sm text-muted-foreground">
                We may update this privacy policy occasionally. You'll be notified of significant 
                changes through the app or email.
              </p>
            </div>
            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>Version: 1.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}