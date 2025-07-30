import { useAppStore } from '@/stores/useAppStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
  const { isOnline } = useAppStore();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Alert className="rounded-none border-0 bg-destructive text-destructive-foreground">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="font-medium">
              You're offline. Don't worry - your progress is saved locally and will sync when you're back online.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}