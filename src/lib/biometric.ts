export class BiometricService {
  private static instance: BiometricService;

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  async isSupported(): Promise<boolean> {
    // Detect APK environment
    const userAgent = navigator.userAgent.toLowerCase();
    const isAPK = userAgent.includes('wv') || 
                  userAgent.includes('pwabuilder') || 
                  userAgent.includes('webapk') ||
                  !!(window as any).Capacitor ||
                  !!(window as any).cordova ||
                  window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('🔐 Biometric detection:', { isAPK, userAgent });
    
    // For APK environments, check multiple methods
    if (isAPK) {
      // Method 1: Check for Capacitor biometric plugin
      if ((window as any).Capacitor && (window as any).BiometricAuth) {
        console.log('🔐 Capacitor biometric available');
        return true;
      }
      
      // Method 2: Check for Cordova fingerprint plugin
      if ((window as any).cordova && (window as any).FingerprintAuth) {
        console.log('🔐 Cordova fingerprint available');
        return true;
      }
      
      // Method 3: Check for Android biometric API
      if ((window as any).AndroidBiometric) {
        console.log('🔐 Android biometric API available');
        return true;
      }
      
      // Method 4: WebAuthn in APK (may work in some APK builders)
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        try {
          const available = await (navigator.credentials as any).isUserVerifyingPlatformAuthenticatorAvailable?.();
          if (available) {
            console.log('🔐 WebAuthn available in APK');
            return true;
          }
        } catch (error) {
          console.log('🔐 WebAuthn not available in APK:', error);
        }
      }
      
      // For APK, always return true and fallback to PIN
      console.log('🔐 APK detected - enabling PIN fallback');
      return true;
    }
    
    // For web browsers
    if (!('credentials' in navigator) || !('create' in navigator.credentials)) {
      return false;
    }
    
    // Check for platform authenticator (fingerprint/face)
    try {
      const available = await (navigator.credentials as any).isUserVerifyingPlatformAuthenticatorAvailable?.();
      return available === true;
    } catch {
      // Fallback for older browsers
      return 'credentials' in navigator && 'create' in navigator.credentials;
    }
  }

  async setupFingerprint(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!await this.isSupported()) {
        return { success: false, error: 'Biometric authentication not supported' };
      }

      // Detect APK environment
      const userAgent = navigator.userAgent.toLowerCase();
      const isAPK = userAgent.includes('wv') || 
                    userAgent.includes('pwabuilder') || 
                    userAgent.includes('webapk') ||
                    !!(window as any).Capacitor ||
                    !!(window as any).cordova ||
                    window.matchMedia('(display-mode: standalone)').matches;

      // Try APK-specific biometric methods first
      if (isAPK) {
        // Method 1: Capacitor Biometric
        if ((window as any).Capacitor && (window as any).BiometricAuth) {
          try {
            const result = await (window as any).BiometricAuth.isAvailable();
            if (result.isAvailable) {
              localStorage.setItem(`biometric_${userId}`, JSON.stringify({
                method: 'capacitor',
                enabled: true
              }));
              return { success: true };
            }
          } catch (error) {
            console.log('🔐 Capacitor biometric setup failed:', error);
          }
        }
        
        // Method 2: Cordova Fingerprint
        if ((window as any).cordova && (window as any).FingerprintAuth) {
          try {
            await new Promise((resolve, reject) => {
              (window as any).FingerprintAuth.isAvailable((result: any) => {
                if (result.isAvailable) {
                  localStorage.setItem(`biometric_${userId}`, JSON.stringify({
                    method: 'cordova',
                    enabled: true
                  }));
                  resolve(true);
                } else {
                  reject(new Error('Fingerprint not available'));
                }
              }, reject);
            });
            return { success: true };
          } catch (error) {
            console.log('🔐 Cordova fingerprint setup failed:', error);
          }
        }
        
        // Method 3: Android Biometric API
        if ((window as any).AndroidBiometric) {
          try {
            const available = await (window as any).AndroidBiometric.isAvailable();
            if (available) {
              localStorage.setItem(`biometric_${userId}`, JSON.stringify({
                method: 'android',
                enabled: true
              }));
              return { success: true };
            }
          } catch (error) {
            console.log('🔐 Android biometric setup failed:', error);
          }
        }
      }

      // Fallback to WebAuthn for web and some APK environments
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        // Generate random challenge
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        
        const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { 
            name: 'ProgressPulse',
            id: window.location.hostname || 'progresspulse.app'
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userId,
            displayName: 'ProgressPulse User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'none'
        }
      });

      if (credential && 'rawId' in credential) {
        localStorage.setItem(`biometric_${userId}`, JSON.stringify({
          credentialId: Array.from(new Uint8Array(credential.rawId as ArrayBuffer)),
          enabled: true
        }));
        return { success: true };
      }

        return { success: false, error: 'Failed to setup fingerprint' };
      }
      
      return { success: false, error: 'No biometric method available' };
    } catch (error) {
      return { success: false, error: 'Fingerprint setup cancelled or failed' };
    }
  }

  async verifyFingerprint(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const stored = localStorage.getItem(`biometric_${userId}`);
      if (!stored) {
        return { success: false, error: 'No fingerprint setup found' };
      }

      const biometricData = JSON.parse(stored);
      
      // Handle APK-specific biometric methods
      if (biometricData.method === 'capacitor' && (window as any).Capacitor && (window as any).BiometricAuth) {
        try {
          const result = await (window as any).BiometricAuth.verify({
            reason: 'Authenticate to access ProgressPulse',
            title: 'Biometric Authentication',
            subtitle: 'Use your fingerprint or face to unlock',
            description: 'Place your finger on the sensor or look at the camera'
          });
          return { success: result.verified };
        } catch (error) {
          return { success: false, error: 'Biometric verification failed' };
        }
      }
      
      if (biometricData.method === 'cordova' && (window as any).cordova && (window as any).FingerprintAuth) {
        try {
          await new Promise((resolve, reject) => {
            (window as any).FingerprintAuth.show({
              clientId: 'ProgressPulse',
              clientSecret: 'password'
            }, resolve, reject);
          });
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Fingerprint verification failed' };
        }
      }
      
      if (biometricData.method === 'android' && (window as any).AndroidBiometric) {
        try {
          const result = await (window as any).AndroidBiometric.authenticate({
            title: 'Authenticate',
            subtitle: 'Use your biometric to unlock ProgressPulse'
          });
          return { success: result.success };
        } catch (error) {
          return { success: false, error: 'Android biometric verification failed' };
        }
      }

      // Fallback to WebAuthn
      if (biometricData.credentialId) {
        const { credentialId } = biometricData;
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        
        const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            id: new Uint8Array(credentialId),
            type: 'public-key'
          }],
          userVerification: 'required',
          timeout: 60000,
          rpId: window.location.hostname || 'progresspulse.app'
        }
      });

        return assertion ? { success: true } : { success: false, error: 'Verification failed' };
      }
      
      return { success: false, error: 'No valid biometric method found' };
    } catch (error) {
      return { success: false, error: 'Fingerprint verification failed' };
    }
  }

  setupPIN(userId: string, pin: string): void {
    localStorage.setItem(`pin_${userId}`, btoa(pin));
  }

  verifyPIN(userId: string, pin: string): boolean {
    const stored = localStorage.getItem(`pin_${userId}`);
    return stored === btoa(pin);
  }

  hasPIN(userId: string): boolean {
    return !!localStorage.getItem(`pin_${userId}`);
  }

  hasFingerprint(userId: string): boolean {
    const stored = localStorage.getItem(`biometric_${userId}`);
    return stored ? JSON.parse(stored).enabled : false;
  }

  setSessionAuthenticated(userId: string): void {
    sessionStorage.setItem(`auth_session_${userId}`, 'true');
  }

  isSessionAuthenticated(userId: string): boolean {
    return sessionStorage.getItem(`auth_session_${userId}`) === 'true';
  }

  clearSession(userId: string): void {
    sessionStorage.removeItem(`auth_session_${userId}`);
  }

  removePIN(userId: string): void {
    localStorage.removeItem(`pin_${userId}`);
  }

  removeFingerprint(userId: string): void {
    localStorage.removeItem(`biometric_${userId}`);
  }
}

export const biometricService = BiometricService.getInstance();