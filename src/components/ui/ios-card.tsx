import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface IOSCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onDragOver' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: "default" | "glass" | "elevated"
  interactive?: boolean
}

const IOSCard = React.forwardRef<HTMLDivElement, IOSCardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
  const baseClasses = cn(
    "rounded-2xl transition-all duration-300",
    {
      "card-ios": variant === "default",
      "card-ios-glass": variant === "glass", 
      "card-ios shadow-ios-lg": variant === "elevated",
    },
    className
  )

  if (interactive) {
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        whileHover={{ 
          scale: 1.02,
          y: -2,
          transition: { duration: 0.2 }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      ref={ref}
      className={baseClasses}
      {...props}
    >
      {children}
    </div>
  )
})
IOSCard.displayName = "IOSCard"

const IOSCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
IOSCardHeader.displayName = "IOSCardHeader"

const IOSCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-ios-headline leading-none tracking-tight", className)}
    {...props}
  />
))
IOSCardTitle.displayName = "IOSCardTitle"

const IOSCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-ios-body text-muted-foreground", className)}
    {...props}
  />
))
IOSCardDescription.displayName = "IOSCardDescription"

const IOSCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
IOSCardContent.displayName = "IOSCardContent"

const IOSCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
IOSCardFooter.displayName = "IOSCardFooter"

export { 
  IOSCard, 
  IOSCardHeader, 
  IOSCardFooter, 
  IOSCardTitle, 
  IOSCardDescription, 
  IOSCardContent 
}