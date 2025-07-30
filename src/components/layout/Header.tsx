import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/useAppStore';
import { useTheme } from 'next-themes';
import {
  Bell,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Download,

  Settings,
  User,
  MoreVertical,
  FileSpreadsheet,
  Award,
  HelpCircle,
  FileText,
  Shield,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user } = useAuth();
  const { isOnline, syncInProgress } = useAppStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleExportPDF = async () => {
    try {
      // Import PDF generation functionality
      const { generateProgressReport } = await import('@/lib/pdfExport');
      await generateProgressReport(user!.id);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const openInNewTab = (path: string) => {
    const url = window.location.origin + path;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="h-16 bg-card/95 backdrop-blur-lg border-b border-border px-4 lg:px-6 flex items-center justify-between">
      {/* Left side - Status indicators */}
      <div className="flex items-center space-x-4">
        <motion.div
          animate={{ scale: syncInProgress ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: syncInProgress ? Infinity : 0, duration: 1.5 }}
          className="flex items-center space-x-2"
        >
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <Badge variant={isOnline ? 'default' : 'destructive'} className="text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </motion.div>

        {syncInProgress && (
          <Badge variant="outline" className="text-xs">
            Syncing...
          </Badge>
        )}
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="h-9 w-9 p-0"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications - Fixed clickable */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 p-0 relative"
          onClick={handleNotificationClick}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></span>
        </Button>

        {/* More Options Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>More Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/spreadsheet')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Spreadsheet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/certificates')}>
              <Award className="mr-2 h-4 w-4" /> Certificates
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/tutorial')}>
              <Zap className="mr-2 h-4 w-4" /> What's New
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openInNewTab('/privacy')}>
              <Shield className="mr-2 h-4 w-4" /> Privacy Policy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openInNewTab('/terms')}>
              <FileText className="mr-2 h-4 w-4" /> Terms of Service
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openInNewTab('/releases')}>
              <FileText className="mr-2 h-4 w-4" /> Release Notes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openInNewTab('/support')}>
              <HelpCircle className="mr-2 h-4 w-4" /> Help & Support
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openInNewTab('/docs')}>
              <FileText className="mr-2 h-4 w-4" /> Documentation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar || ''} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-48">
            <DropdownMenuLabel className="text-xs font-semibold">
              {user?.name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
