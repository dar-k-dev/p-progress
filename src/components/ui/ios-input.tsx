import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface IOSInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  animated?: boolean
}

const IOSInput = React.forwardRef<HTMLInputElement, IOSInputProps>(
  ({ className, type, label, error, icon, animated = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    const inputElement = (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            "input-ios w-full text-ios-body",
            icon && "pl-12",
            error && "border-red-500 ring-red-500/20",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {label && (
          <motion.label
            className={cn(
              "absolute left-4 text-ios-body text-muted-foreground pointer-events-none transition-all duration-200",
              icon && "left-12",
              (isFocused || hasValue) 
                ? "top-2 text-xs text-primary transform -translate-y-1" 
                : "top-1/2 transform -translate-y-1/2"
            )}
            animate={
              animated
                ? {
                    y: isFocused || hasValue ? -8 : 0,
                    scale: isFocused || hasValue ? 0.85 : 1,
                    color: isFocused ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  }
                : {}
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {label}
          </motion.label>
        )}

        {/* Focus ring animation */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isFocused ? 1 : 0,
              scale: isFocused ? 1 : 0.95,
            }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    )

    return (
      <div className="space-y-2">
        {animated ? (
          <motion.div
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {inputElement}
          </motion.div>
        ) : (
          inputElement
        )}
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ios-caption text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
IOSInput.displayName = "IOSInput"

export { IOSInput }