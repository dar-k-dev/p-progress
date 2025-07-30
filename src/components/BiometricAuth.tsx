import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fingerprint, Lock, Eye, EyeOff } from 'lucide-react';
import { biometricService } from '@/lib/biometric';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface BiometricAuthProps {
  userId: string;
  onSuccess: () => void;
  onSkip?: () => void;
}

export function BiometricAuth({ userId, onSuccess, onSkip }: BiometricAuthProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [hasPIN, setHasPIN] = useState(false);

  useEffect(() => {
    setHasFingerprint(biometricService.hasFingerprint(userId));
    setHasPIN(biometricService.hasPIN(userId));
  }, [userId]);

  const handleFingerprintAuth = async () => {
    setLoading(true);
    const result = await biometricService.verifyFingerprint(userId);
    
    if (result.success) {
      toast.success('Fingerprint verified!');
      onSuccess();
    } else {
      toast.error(result.error || 'Fingerprint verification failed');
    }
    setLoading(false);
  };

  const handlePINAuth = () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    if (biometricService.verifyPIN(userId, pin)) {
      toast.success('PIN verified!');
      onSuccess();
    } else {
      toast.error('Incorrect PIN');
      setPin('');
    }
  };

  const handlePinInput = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm px-6"
      >
        <div className="bg-card/80 backdrop-blur-sm border rounded-3xl shadow-xl p-8">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Enter your passcode to continue</p>
          </div>

          <div className="space-y-8">
            {hasPIN && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative w-48">
                    <Input
                      type={showPin ? 'text' : 'password'}
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => handlePinInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && pin.length === 4 && handlePINAuth()}
                      className="text-center text-3xl tracking-[0.5em] h-14 rounded-xl border-2 bg-background/50 focus:bg-background focus:border-primary w-full pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                      maxLength={4}
                      autoComplete="off"
                      data-lpignore="true"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {pin.length === 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button
                      onClick={handlePINAuth}
                      className="w-full h-12 text-base font-medium rounded-xl"
                    >
                      Unlock ProgressPulse
                    </Button>
                  </motion.div>
                )}
              </div>
            )}

            {hasFingerprint && (
              <div className="flex justify-center">
                {hasPIN && (
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">or</span>
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleFingerprintAuth}
                  disabled={loading}
                  variant="outline"
                  className="h-14 px-8 rounded-xl border-2"
                >
                  <Fingerprint className="h-5 w-5 mr-2" />
                  {loading ? 'Verifying...' : 'Use Biometric'}
                </Button>
              </div>
            )}

            {!hasFingerprint && !hasPIN && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">No authentication method setup</p>
                <p className="text-sm text-muted-foreground">Configure PIN or biometric in Profile settings</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}