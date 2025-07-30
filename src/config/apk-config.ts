// APK-specific configuration
export const APK_CONFIG = {
  // Firebase configuration for APK
  firebase: {
    apiKey: "AIzaSyBPE9kaWcLofrUh_dT_pswPDNkEhVtSBjU",
    authDomain: "progresspulse-5c1c9.firebaseapp.com",
    projectId: "progresspulse-5c1c9",
    storageBucket: "progresspulse-5c1c9.firebasestorage.app",
    messagingSenderId: "1020367919471",
    appId: "1:1020367919471:web:245125af8144bac9e3b09a"
  },
  
  // VAPID key for push notifications
  vapidKey: "BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI",
  
  // APK-specific settings
  apk: {
    // Force HTTPS context for WebAuthn
    forceSecureContext: true,
    
    // Enhanced notification settings
    notifications: {
      vibrate: [200, 100, 200],
      requireInteraction: true,
      silent: false,
      renotify: true
    },
    
    // Biometric authentication settings
    biometric: {
      timeout: 60000,
      userVerification: 'required' as const,
      authenticatorAttachment: 'platform' as const,
      requireResidentKey: false
    },
    
    // Service Worker settings
    serviceWorker: {
      scope: '/',
      updateViaCache: 'none' as const
    }
  },
  
  // Feature detection
  features: {
    // Check if running in APK environment
    isAPK: () => {
      return document.referrer.includes('android-app://') ||
             window.location.protocol === 'file:' ||
             (window as any).Android !== undefined ||
             navigator.userAgent.includes('wv'); // WebView
    },
    
    // Check if running in standalone mode
    isStandalone: () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone === true ||
             document.referrer.includes('android-app://');
    },
    
    // Check if WebAuthn is supported
    isWebAuthnSupported: () => {
      return 'credentials' in navigator && 
             'create' in navigator.credentials &&
             typeof (navigator.credentials as any).isUserVerifyingPlatformAuthenticatorAvailable === 'function';
    },
    
    // Check if push notifications are supported
    isPushSupported: () => {
      return 'serviceWorker' in navigator &&
             'PushManager' in window &&
             'Notification' in window;
    }
  }
};

// Environment-specific overrides
export const getEnvironmentConfig = () => {
  const isAPK = APK_CONFIG.features.isAPK();
  const isStandalone = APK_CONFIG.features.isStandalone();
  
  return {
    ...APK_CONFIG,
    environment: {
      isAPK,
      isStandalone,
      isWeb: !isAPK && !isStandalone,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  };
};