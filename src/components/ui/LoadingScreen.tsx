import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="page-ios fixed inset-0 flex items-center justify-center">
      <div className="text-center animate-ios-fade-in relative">
        {/* iPhone-style animated logo */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 border-4 border-primary/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner spinning element */}
          <motion.div
            className="absolute inset-3 border-4 border-transparent border-t-primary rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center icon with pulse */}
          <motion.div
            className="absolute inset-8 bg-primary rounded-full flex items-center justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.9, 0.6, 0.9]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <Target className="w-8 h-8 text-primary-foreground" />
          </motion.div>
        </motion.div>

        {/* App name with staggered animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-ios-title mb-3">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Progress
            </motion.span>
            <motion.span
              className="text-primary ml-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              Pulse
            </motion.span>
          </h1>
        </motion.div>

        {/* Loading text with dots animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="text-ios-body text-muted-foreground mb-6"
        >
          Preparing your dashboard
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          >
            ...
          </motion.span>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="progress-ios w-48 mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        >
          <motion.div
            className="progress-ios-bar"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              delay: 1.3,
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${20 + i * 10}%`,
              top: `${40 + (i % 2) * 20}%`,
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}