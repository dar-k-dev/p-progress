import { ReactNode } from 'react';
import { useDeviceDetection, getResponsiveClasses } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'page' | 'section' | 'card';
}

export function ResponsiveContainer({ 
  children, 
  className,
  variant = 'page' 
}: ResponsiveContainerProps) {
  const deviceInfo = useDeviceDetection();
  const responsiveClasses = getResponsiveClasses(deviceInfo);

  const getVariantClasses = () => {
    switch (variant) {
      case 'page':
        return cn(
          'w-full max-w-none overflow-x-hidden',
          responsiveClasses.container,
          responsiveClasses.spacing.section
        );
      case 'section':
        return cn(
          'w-full max-w-full overflow-x-hidden',
          responsiveClasses.spacing.items
        );
      case 'card':
        return cn(
          responsiveClasses.card,
          'p-4 sm:p-6 lg:p-8'
        );
      default:
        return responsiveClasses.container;
    }
  };

  return (
    <div className={cn(getVariantClasses(), className)}>
      {children}
    </div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: ResponsiveGridProps) {
  const deviceInfo = useDeviceDetection();
  
  const getGridClasses = () => {
    const { isMobile, isTablet } = deviceInfo;
    
    if (isMobile) {
      return `grid grid-cols-${cols.mobile || 1} gap-4`;
    } else if (isTablet) {
      return `grid grid-cols-1 md:grid-cols-${cols.tablet || 2} gap-6`;
    } else {
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols.desktop || 3} xl:grid-cols-${Math.min((cols.desktop || 3) + 1, 4)} gap-6`;
    }
  };

  return (
    <div className={cn(getGridClasses(), 'w-full max-w-full overflow-x-hidden', className)}>
      {children}
    </div>
  );
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}

export function ResponsiveText({ 
  children, 
  as = 'p',
  className 
}: ResponsiveTextProps) {
  const deviceInfo = useDeviceDetection();
  const responsiveClasses = getResponsiveClasses(deviceInfo);
  
  const Component = as;
  
  const getTextClasses = () => {
    switch (as) {
      case 'h1':
        return responsiveClasses.text.h1;
      case 'h2':
        return responsiveClasses.text.h2;
      case 'h3':
        return deviceInfo.isMobile ? 'text-base font-medium' : 'text-lg font-medium';
      case 'p':
        return responsiveClasses.text.body;
      default:
        return responsiveClasses.text.body;
    }
  };

  return (
    <Component className={cn(getTextClasses(), className)}>
      {children}
    </Component>
  );
}