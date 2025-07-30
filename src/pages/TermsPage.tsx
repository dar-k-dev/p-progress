import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, AlertTriangle, Users, Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsPage() {
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
            <FileText className="h-8 w-8 mr-3 text-primary" />
            Terms of Service
          </h1>
          <p className="text-muted-foreground mt-1">
            Terms and conditions for using ProgressPulse
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Acceptance of Terms
            </CardTitle>
            <CardDescription>
              By using ProgressPulse, you agree to these terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By accessing and using ProgressPulse ("the App"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <div>
              <h4 className="font-semibold mb-2">Eligibility</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• You must be at least 13 years old to use this app</li>
                <li>• You must provide accurate and complete information</li>
                <li>• You are responsible for maintaining account security</li>
                <li>• One account per person</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Responsibilities
            </CardTitle>
            <CardDescription>
              What we expect from our users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Acceptable Use</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Use the app for personal goal tracking only</li>
                <li>• Do not share inappropriate or harmful content</li>
                <li>• Respect other users and their privacy</li>
                <li>• Do not attempt to hack or exploit the app</li>
                <li>• Follow all applicable laws and regulations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Account Security</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Keep your login credentials secure</li>
                <li>• Notify us immediately of any security breaches</li>
                <li>• You are responsible for all activity on your account</li>
                <li>• Use strong, unique passwords</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gavel className="h-5 w-5 mr-2" />
              Service Availability
            </CardTitle>
            <CardDescription>
              What you can expect from our service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Service Provision</h4>
              <p className="text-sm text-muted-foreground">
                We strive to provide reliable service but cannot guarantee 100% uptime. 
                The app may be temporarily unavailable for maintenance or updates.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Local Data Storage</h4>
              <p className="text-sm text-muted-foreground">
                Your data is stored locally on your device. You are responsible for maintaining 
                backups of important data. Use the export feature to backup your progress.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Feature Changes</h4>
              <p className="text-sm text-muted-foreground">
                We may add, modify, or remove features at any time. We'll notify users of 
                significant changes that affect functionality.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Limitations & Disclaimers
            </CardTitle>
            <CardDescription>
              Important limitations of our service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Disclaimer of Warranties</h4>
              <p className="text-sm text-muted-foreground">
                The app is provided "as is" without warranties of any kind. We do not guarantee 
                that the service will be error-free or uninterrupted.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Limitation of Liability</h4>
              <p className="text-sm text-muted-foreground">
                We shall not be liable for any indirect, incidental, special, or consequential 
                damages resulting from the use or inability to use the app.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">User Content</h4>
              <p className="text-sm text-muted-foreground">
                You retain full ownership of your content. All data stays on your device. 
                You are responsible for the content you create and its backup.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termination</CardTitle>
            <CardDescription>
              How accounts can be terminated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">By You</h4>
              <p className="text-sm text-muted-foreground">
                You may delete your account at any time from the app settings. 
                This will permanently remove all your data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">By Us</h4>
              <p className="text-sm text-muted-foreground">
                We may terminate accounts that violate these terms or engage in harmful behavior. 
                We'll provide notice when possible.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We may update these terms from time to time. Significant changes will be communicated 
              through the app or email. Continued use after changes constitutes acceptance.
            </p>
            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>Version: 1.0</p>
              <p>Effective date: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}