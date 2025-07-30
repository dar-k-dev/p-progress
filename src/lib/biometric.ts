export class BiometricService {
  private static instance: BiometricService;

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  async isSupported(): Promise<boolean> {
    // Enhanced detection for APK environment
    if (!('credentials' in navigator) || !('create' in navigator.credentials)) {
      return false;
    }
    
    // Check for platform authenticator (fingerprint/face)
    try {
      const available = await (navigator.credentials as any).isUserVerifyingPlatformAuthenticatorAvailable?.();
      return available === true;
    } catch {
      // Fallback for older browsers/APK environments
      return 'credentials' in navigator && 'create' in navigator.credentials;
    }
  }

  async setupFingerprint(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!await this.isSupported()) {
        return { success: false, error: 'Biometric authentication not supported' };
      }

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

      const { credentialId } = JSON.parse(stored);
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