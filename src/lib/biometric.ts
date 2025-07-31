export class BiometricService {
  private static instance: BiometricService;

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  async isSupported(): Promise<boolean> {
    console.log('🔐 Checking biometric support...');
    
    // Check for WebAuthn support first (works in modern browsers and some APKs)
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      try {
        // Check if platform authenticator is available
        const available = await (navigator.credentials as any).isUserVerifyingPlatformAuthenticatorAvailable?.();
        if (available) {
          console.log('🔐 WebAuthn platform authenticator available');
          return true;
        }
      } catch (error) {
        console.log('🔐 WebAuthn check failed:', error);
      }
    }
    
    // Detect APK environment
    const userAgent = navigator.userAgent.toLowerCase();
    const isAPK = userAgent.includes('wv') || 
                  userAgent.includes('pwabuilder') || 
                  userAgent.includes('webapk') ||
                  !!(window as any).Capacitor ||
                  !!(window as any).cordova ||
                  window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('🔐 Environment detection:', { isAPK, userAgent });
    
    // For APK environments, check native methods
    if (isAPK) {
      // Check for Capacitor biometric plugin
      if ((window as any).Capacitor && (window as any).BiometricAuth) {
        console.log('🔐 Capacitor biometric available');
        return true;
      }
      
      // Check for Cordova fingerprint plugin
      if ((window as any).cordova && (window as any).FingerprintAuth) {
        console.log('🔐 Cordova fingerprint available');
        return true;
      }
      
      // For APK, always return true (PIN fallback available)
      console.log('🔐 APK detected - biometric/PIN available');
      return true;
    }
    
    // For web browsers, require WebAuthn
    console.log('🔐 Web browser - checking WebAuthn...');
    return 'credentials' in navigator && 'create' in navigator.credentials;
  }

  async setupFingerprint(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Setting up biometric authentication for:', userId);
      
      if (!await this.isSupported()) {
        return { success: false, error: 'Biometric authentication not supported' };
      }

      // Detect environment
      const userAgent = navigator.userAgent.toLowerCase();
      const isAPK = userAgent.includes('wv') || 
                    userAgent.includes('pwabuilder') || 
                    userAgent.includes('webapk') ||
                    !!(window as any).Capacitor ||
                    !!(window as any).cordova ||
                    window.matchMedia('(display-mode: standalone)').matches;

      // Try APK-specific methods first
      if (isAPK) {
        console.log('🔐 APK environment detected, trying native methods...');
        
        // Capacitor Biometric
        if ((window as any).Capacitor && (window as any).BiometricAuth) {
          try {
            console.log('🔐 Trying Capacitor biometric...');
            const result = await (window as any).BiometricAuth.isAvailable();
            if (result.isAvailable) {
              localStorage.setItem(`biometric_${userId}`, JSON.stringify({
                method: 'capacitor',
                enabled: true,
                setupTime: Date.now()
              }));
              console.log('🔐 Capacitor biometric setup successful');
              return { success: true };
            }
          } catch (error) {
            console.log('🔐 Capacitor biometric setup failed:', error);
          }
        }
        
        // Cordova Fingerprint
        if ((window as any).cordova && (window as any).FingerprintAuth) {
          try {
            console.log('🔐 Trying Cordova fingerprint...');
            await new Promise((resolve, reject) => {
              (window as any).FingerprintAuth.isAvailable((result: any) => {
                if (result.isAvailable) {
                  resolve(true);
                } else {
                  reject(new Error('Fingerprint not available'));
                }
              }, reject);
            });
            
            localStorage.setItem(`biometric_${userId}`, JSON.stringify({
              method: 'cordova',
              enabled: true,
              setupTime: Date.now()
            }));
            console.log('🔐 Cordova fingerprint setup successful');
            return { success: true };
          } catch (error) {
            console.log('🔐 Cordova fingerprint setup failed:', error);
          }
        }
      }

      // WebAuthn for web browsers and compatible APKs
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        try {
          console.log('🔐 Trying WebAuthn setup...');
          
          // Check if platform authenticator is available
          const available = await (navigator.credentials as any).isUserVerifyingPlatformAuthenticatorAvailable?.();
          if (!available) {
            console.log('🔐 Platform authenticator not available');
            return { success: false, error: 'Biometric authentication not available on this device' };
          }
          
          // Generate secure challenge
          const challenge = crypto.getRandomValues(new Uint8Array(32));
          const userIdBytes = new TextEncoder().encode(userId);
          
          console.log('🔐 Creating WebAuthn credential...');
          const credential = await navigator.credentials.create({
            publicKey: {
              challenge,
              rp: { 
                name: 'ProgressPulse',
                id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
              },
              user: {
                id: userIdBytes,
                name: userId,
                displayName: 'ProgressPulse User'
              },
              pubKeyCredParams: [
                { alg: -7, type: 'public-key' },   // ES256
                { alg: -257, type: 'public-key' }  // RS256
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
            const credentialData = {
              credentialId: Array.from(new Uint8Array(credential.rawId as ArrayBuffer)),
              method: 'webauthn',
              enabled: true,
              setupTime: Date.now()
            };
            
            localStorage.setItem(`biometric_${userId}`, JSON.stringify(credentialData));
            console.log('🔐 WebAuthn setup successful');
            return { success: true };
          }
        } catch (error: any) {
          console.log('🔐 WebAuthn setup failed:', error);
          
          // Handle specific WebAuthn errors
          if (error.name === 'NotAllowedError') {
            return { success: false, error: 'Biometric setup was cancelled' };
          } else if (error.name === 'NotSupportedError') {
            return { success: false, error: 'Biometric authentication not supported' };
          } else if (error.name === 'SecurityError') {
            return { success: false, error: 'Security error - please try again' };
          }
          
          return { success: false, error: 'Failed to setup biometric authentication' };
        }
      }
      
      return { success: false, error: 'No biometric method available' };
    } catch (error: any) {
      console.error('🔐 Biometric setup error:', error);
      return { success: false, error: error.message || 'Biometric setup failed' };
    }
  }

  async verifyFingerprint(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Verifying biometric authentication for:', userId);
      
      const stored = localStorage.getItem(`biometric_${userId}`);
      if (!stored) {
        return { success: false, error: 'No biometric authentication setup found' };
      }

      const biometricData = JSON.parse(stored);
      console.log('🔐 Using biometric method:', biometricData.method);
      
      // Handle APK-specific biometric methods
      if (biometricData.method === 'capacitor' && (window as any).Capacitor && (window as any).BiometricAuth) {
        try {
          console.log('🔐 Verifying with Capacitor biometric...');
          const result = await (window as any).BiometricAuth.verify({
            reason: 'Authenticate to access ProgressPulse',
            title: 'Biometric Authentication',
            subtitle: 'Use your fingerprint or face to unlock',
            description: 'Place your finger on the sensor or look at the camera'
          });
          console.log('🔐 Capacitor verification result:', result);
          return { success: result.verified };
        } catch (error) {
          console.log('🔐 Capacitor verification failed:', error);
          return { success: false, error: 'Biometric verification failed' };
        }
      }
      
      if (biometricData.method === 'cordova' && (window as any).cordova && (window as any).FingerprintAuth) {
        try {
          console.log('🔐 Verifying with Cordova fingerprint...');
          await new Promise((resolve, reject) => {
            (window as any).FingerprintAuth.show({
              clientId: 'ProgressPulse',
              clientSecret: 'password'
            }, resolve, reject);
          });
          console.log('🔐 Cordova verification successful');
          return { success: true };
        } catch (error) {
          console.log('🔐 Cordova verification failed:', error);
          return { success: false, error: 'Fingerprint verification failed' };
        }
      }

      // WebAuthn verification
      if (biometricData.method === 'webauthn' && biometricData.credentialId) {
        try {
          console.log('🔐 Verifying with WebAuthn...');
          
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
              rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
            }
          });

          if (assertion) {
            console.log('🔐 WebAuthn verification successful');
            return { success: true };
          } else {
            console.log('🔐 WebAuthn verification failed - no assertion');
            return { success: false, error: 'Biometric verification failed' };
          }
        } catch (error: any) {
          console.log('🔐 WebAuthn verification failed:', error);
          
          // Handle specific WebAuthn errors
          if (error.name === 'NotAllowedError') {
            return { success: false, error: 'Biometric verification was cancelled' };
          } else if (error.name === 'SecurityError') {
            return { success: false, error: 'Security error - please try again' };
          }
          
          return { success: false, error: 'Biometric verification failed' };
        }
      }
      
      console.log('🔐 No valid biometric method found for verification');
      return { success: false, error: 'No valid biometric method found' };
    } catch (error: any) {
      console.error('🔐 Biometric verification error:', error);
      return { success: false, error: error.message || 'Biometric verification failed' };
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