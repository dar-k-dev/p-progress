import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, X } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { updateAvailable, setUpdateAvailable } = useAppStore();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          setUpdateAvailable(true);
          setShowPrompt(true);
        }
      });
    }
  }, [setUpdateAvailable]);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setUpdateAvailable(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && updateAvailable && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:bottom-20 lg:max-w-sm"
        >
          <Alert className="border-primary/20 bg-card shadow-lg">
            <RefreshCw className="h-4 w-4" />
            <div className="flex items-center justify-between flex-1">
              <AlertDescription className="font-medium flex-1 mr-4">
                A new version is available. Update to get the latest features and improvements.
              </AlertDescription>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleUpdate}>
                  Update
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}