import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  Target, 
  BarChart3, 
  User,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="nav-ios fixed bottom-0 left-0 right-0 z-50 safe-bottom"
    >
      <div className="grid grid-cols-5 h-20 px-2">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className="nav-item-ios relative"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              {/* Icon with bounce animation */}
              <motion.div
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-primary scale-110" 
                    : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.9 }}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <item.icon className="h-5 w-5" />
              </motion.div>
              
              {/* Label with fade animation */}
              <motion.span 
                className={cn(
                  "text-ios-caption font-medium transition-all duration-200",
                  isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-80"
                )}
                animate={isActive ? { y: [0, -2, 0] } : {}}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {item.name}
              </motion.span>

              {/* Haptic feedback simulation */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                whileTap={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                transition={{ duration: 0.1 }}
              />
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}