import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Bug, Plus, ArrowUp, Calendar, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ReleasesPage() {
  const navigate = useNavigate();

  const releases = [
    {
      version: '1.0.0',
      date: '2024-12-20',
      type: 'major',
      title: 'Initial Release',
      description: 'The first stable release of ProgressPulse with all core features.',
      changes: [
        { type: 'feature', text: 'Complete goal tracking system with categories and priorities' },
        { type: 'feature', text: 'Interactive analytics dashboard with charts and insights' },
        { type: 'feature', text: 'Achievement system with unlockable badges' },
        { type: 'feature', text: 'Calendar view for progress visualization' },
        { type: 'feature', text: 'PWA support with offline functionality' },
        { type: 'feature', text: 'Professional PDF export for progress reports' },
        { type: 'feature', text: 'Dark/light theme support with system detection' },
        { type: 'feature', text: 'Local data storage with IndexedDB' },
        { type: 'feature', text: 'Biometric authentication (PIN and fingerprint)' },
        { type: 'feature', text: 'Telegram bot integration for support' }
      ]
    },

  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'fix':
        return <Bug className="h-4 w-4 text-red-500" />;
      case 'improvement':
        return <ArrowUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Zap className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getVersionBadge = (type: string) => {
    switch (type) {
      case 'major':
        return <Badge variant="default">Major</Badge>;
      case 'minor':
        return <Badge variant="secondary">Minor</Badge>;
      case 'patch':
        return <Badge variant="outline">Patch</Badge>;
      default:
        return <Badge variant="outline">Release</Badge>;
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
            <Tag className="h-8 w-8 mr-3 text-primary" />
            Release Notes
          </h1>
          <p className="text-muted-foreground mt-1">
            Latest updates and improvements to ProgressPulse
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {releases.map((release, index) => (
          <Card key={release.version} className={index === 0 ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <span className="text-2xl font-bold">v{release.version}</span>
                  {getVersionBadge(release.type)}
                  {index === 0 && <Badge variant="default">Latest</Badge>}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(release.date).toLocaleDateString()}
                </div>
              </div>
              <CardDescription className="text-base">
                <strong>{release.title}</strong> - {release.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  What's Changed
                </h4>
                <div className="space-y-2">
                  {release.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start space-x-3">
                      {getTypeIcon(change.type)}
                      <span className="text-sm flex-1">{change.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Features we're working on for future releases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <Plus className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Enhanced notification system</span>
            </div>
            <div className="flex items-start space-x-3">
              <Plus className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Goal templates and presets</span>
            </div>
            <div className="flex items-start space-x-3">
              <Plus className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Data import/export improvements</span>
            </div>
            <div className="flex items-start space-x-3">
              <Plus className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Advanced progress analytics</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Have suggestions for new features? Let us know through the support section!</p>
      </div>
    </div>
  );
}