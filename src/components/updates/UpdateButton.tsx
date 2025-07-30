import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useUpdateStore } from '@/stores/useUpdateStore';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSProgress } from '@/components/ui/ios-progress';
import { cn } from '@/lib/utils';

export function UpdateButton() {
  const {
    availableUpdate,
    updateProgress,
    downloadUpdate,
    checkForUpdates,
    dismissUpdate,
    wifiOnlyUpdates
  } = useUpdateStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleUpdate = async () => {
    if (!availableUpdate) return;
    
    setIsExpanded(true);
    await downloadUpdate(availableUpdate);
  };
  
  const handleCheckUpdates = async () => {
    await checkForUpdates();
  };
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };
  
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds <= 0) return '0s';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };
  
  const getPhaseIcon = () => {
    switch (updateProgress.phase) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'downloading':
        return <Download className="h-4 w-4" />;
      case 'installing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };
  
  const getPhaseText = () => {
    switch (updateProgress.phase) {
      case 'checking':
        return 'Checking for updates...';
      case 'downloading':
        return 'Downloading update...';
      case 'installing':
        return 'Installing update...';
      case 'complete':
        return 'Update complete!';
      case 'error':
        return 'Update failed';
      default:
        return availableUpdate ? 'Update available' : 'Check for updates';
    }
  };
  
  const isNetworkSuitable = () => {
    if (!wifiOnlyUpdates) return true;
    if (!('connection' in navigator)) return true;
    
    const connection = (navigator as any).connection;
    return !connection || connection.type === 'wifi';
  };
  
  const isUpdating = ['checking', 'downloading', 'installing'].includes(updateProgress.phase);
  
  return (
    <div className="space-y-4">
      {/* Main Update Button */}
      <motion.div
        layout
        className={cn(
          "card-ios p-4 transition-all duration-300",
          availableUpdate && "border-primary/30 bg-primary/5",
          updateProgress.phase === 'error' && "border-red-500/30 bg-red-500/5"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={isUpdating ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: isUpdating ? Infinity : 0, ease: "linear" }}
            >
              {getPhaseIcon()}
            </motion.div>
            
            <div>
              <h3 className="text-ios-body font-semibold">
                {getPhaseText()}
              </h3>
              
              {availableUpdate && (
                <p className="text-ios-caption text-muted-foreground">
                  Version {availableUpdate.version} • {formatBytes(availableUpdate.size)}
                </p>
              )}
              
              {updateProgress.phase === 'error' && updateProgress.error && (
                <p className="text-ios-caption text-red-500">
                  {updateProgress.error}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Network indicator */}
            {availableUpdate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-1 rounded-lg",
                  isNetworkSuitable() ? "text-green-500" : "text-orange-500"
                )}
              >
                {isNetworkSuitable() ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
              </motion.div>
            )}
            
            {/* Action Button */}
            {availableUpdate ? (
              <IOSButton
                size="sm"
                variant={updateProgress.phase === 'error' ? 'destructive' : 'primary'}
                onClick={handleUpdate}
                disabled={isUpdating || !isNetworkSuitable()}
              >
                {updateProgress.phase === 'error' ? 'Retry' : 'Update'}
              </IOSButton>
            ) : (
              <IOSButton
                size="sm"
                variant="secondary"
                onClick={handleCheckUpdates}
                disabled={updateProgress.phase === 'checking'}
              >
                Check
              </IOSButton>
            )}
          </div>
        </div>
        
        {/* Progress Section */}
        <AnimatePresence>
          {(isUpdating || updateProgress.phase === 'complete') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3"
            >
              {/* Progress Bar */}
              <IOSProgress
                value={updateProgress.progress}
                variant={
                  updateProgress.phase === 'complete' ? 'success' :
                  updateProgress.phase === 'error' ? 'error' : 'default'
                }
                showValue
                animated
              />
              
              {/* Download Stats */}
              {updateProgress.phase === 'downloading' && (
                <div className="flex justify-between text-ios-caption text-muted-foreground">
                  <span>
                    {formatBytes(updateProgress.downloadedBytes)} / {formatBytes(updateProgress.totalBytes)}
                  </span>
                  <span>
                    {formatSpeed(updateProgress.speed)} • {formatTime(updateProgress.timeRemaining)} remaining
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Update Details */}
      <AnimatePresence>
        {availableUpdate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-ios p-4"
          >
            <h4 className="text-ios-body font-semibold mb-3">What's New</h4>
            <ul className="space-y-2">
              {availableUpdate.changes.map((change, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2 text-ios-caption"
                >
                  <span className="text-primary mt-1">•</span>
                  <span>{change}</span>
                </motion.li>
              ))}
            </ul>
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
              <span className="text-ios-caption text-muted-foreground">
                Released {new Date(availableUpdate.timestamp).toLocaleDateString()}
              </span>
              
              <IOSButton
                size="sm"
                variant="ghost"
                onClick={dismissUpdate}
              >
                Dismiss
              </IOSButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}