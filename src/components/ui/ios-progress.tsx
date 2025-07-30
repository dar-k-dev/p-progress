import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface IOSProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error"
  animated?: boolean
  showValue?: boolean
  label?: string
}

const IOSProgress = React.forwardRef<HTMLDivElement, IOSProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = "md", 
    variant = "default",
    animated = true,
    showValue = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: "h-2",
      md: "h-3", 
      lg: "h-4"
    }

    const variantClasses = {
      default: "from-primary to-primary/80",
      success: "from-green-500 to-green-400",
      warning: "from-yellow-500 to-yellow-400", 
      error: "from-red-500 to-red-400"
    }

    return (
      <div className="space-y-2">
        {(label || showValue) && (
          <div className="flex justify-between items-center">
            {label && (
              <span className="text-ios-caption text-muted-foreground">
                {label}
              </span>
            )}
            {showValue && (
              <motion.span 
                className="text-ios-caption font-medium"
                animate={animated ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
                key={percentage}
              >
                {Math.round(percentage)}%
              </motion.span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(
            "progress-ios overflow-hidden",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <motion.div
            className={cn(
              "h-full rounded-full bg-gradient-to-r",
              variantClasses[variant]
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={
              animated
                ? {
                    duration: 0.8,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }
                : { duration: 0 }
            }
          />
          
          {/* Shimmer effect */}
          {animated && percentage > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 0.5,
              }}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    )
  }
)
IOSProgress.displayName = "IOSProgress"

// Circular progress variant
export interface IOSCircularProgressProps {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: "default" | "success" | "warning" | "error"
  animated?: boolean
  showValue?: boolean
  className?: string
}

const IOSCircularProgress: React.FC<IOSCircularProgressProps> = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = "default",
  animated = true,
  showValue = true,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colors = {
    default: "hsl(var(--primary))",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444"
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset }}
          transition={
            animated
              ? {
                  duration: 1,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }
              : { duration: 0 }
          }
        />
      </svg>
      
      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={animated ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
          key={percentage}
        >
          <span className="text-ios-headline font-semibold">
            {Math.round(percentage)}%
          </span>
        </motion.div>
      )}
    </div>
  )
}

export { IOSProgress, IOSCircularProgress }