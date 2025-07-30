import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const iosButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "btn-ios-primary",
        secondary: "btn-ios-secondary",
        ghost: "hover:bg-muted/20 text-foreground rounded-2xl",
        destructive: "bg-red-500 text-white hover:bg-red-600 rounded-2xl shadow-lg",
        outline: "border-2 border-border bg-transparent hover:bg-muted/20 rounded-2xl",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface IOSButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iosButtonVariants> {
  asChild?: boolean
  haptic?: boolean
}

const IOSButton = React.forwardRef<HTMLButtonElement, IOSButtonProps>(
  ({ className, variant, size, asChild = false, haptic = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const buttonContent = (
      <Comp
        className={cn(iosButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )

    if (haptic) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="inline-block"
        >
          {buttonContent}
        </motion.div>
      )
    }

    return buttonContent
  }
)
IOSButton.displayName = "IOSButton"

export { IOSButton, iosButtonVariants }