import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait'
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}

// Utility function to get responsive classes based on device
export function getResponsiveClasses(deviceInfo: DeviceInfo) {
  const { isMobile, isTablet, isDesktop } = deviceInfo;
  
  return {
    container: isMobile 
      ? 'w-full max-w-full px-4 py-4 overflow-x-hidden' 
      : isTablet 
        ? 'w-full max-w-full px-6 py-6 overflow-x-hidden'
        : 'w-full max-w-none px-8 py-8 overflow-x-hidden',
    
    grid: isMobile 
      ? 'grid grid-cols-1 gap-4' 
      : isTablet 
        ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    
    text: {
      h1: isMobile ? 'text-xl font-bold' : isTablet ? 'text-2xl font-bold' : 'text-3xl font-bold',
      h2: isMobile ? 'text-lg font-semibold' : isTablet ? 'text-xl font-semibold' : 'text-2xl font-semibold',
      body: isMobile ? 'text-sm' : 'text-base'
    },
    
    spacing: {
      section: isMobile ? 'space-y-4' : isTablet ? 'space-y-5' : 'space-y-6',
      items: isMobile ? 'space-y-2' : isTablet ? 'space-y-3' : 'space-y-4'
    },
    
    card: isMobile 
      ? 'w-full max-w-full overflow-hidden' 
      : 'w-full max-w-none overflow-hidden'
  };
}