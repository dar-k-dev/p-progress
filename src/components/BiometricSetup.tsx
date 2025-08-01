import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fingerprint, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { biometricService } from '@/lib/biometric';
import { toast } from 'sonner';

interface BiometricSetupProps {
  userId: string;
  onComplete?: () => void;
}

export function BiometricSetup({ userId, onComplete }: BiometricSetupProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePINSetup = () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    biometricService.setupPIN(userId, pin);
    toast.success('PIN setup successfully!');
    setPin('');
    setConfirmPin('');
    onComplete?.();
  };

  const handleFingerprintSetup = async () => {
    setLoading(true);
    const result = await biometricService.setupFingerprint(userId);
    
    if (result.success) {
      toast.success('Fingerprint setup successfully!');
      onComplete?.();
    } else {
      toast.error(result.error || 'Failed to setup fingerprint');
    }
    setLoading(false);
  };

  const handlePinInput = (value: string, setter: (val: string) => void) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Lock className="h-4 w-4" />
            <span>Setup PIN</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Create a 4-digit PIN for quick access to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Enter 4-digit PIN</Label>
            <div className="relative">
              <Input
                type={showPin ? 'text' : 'password'}
                placeholder="••••"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value, setPin)}
                className="text-center text-xl tracking-widest pr-10 h-10"
                maxLength={4}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Confirm PIN</Label>
            <Input
              type={showPin ? 'text' : 'password'}
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
              className="text-center text-xl tracking-widest h-10"
              maxLength={4}
            />
          </div>

          <Button
            onClick={handlePINSetup}
            disabled={pin.length !== 4 || confirmPin.length !== 4}
            className="w-full h-9"
            size="sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            Setup PIN
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Fingerprint className="h-4 w-4" />
            <span>Setup Fingerprint</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Use your device's fingerprint sensor for secure access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleFingerprintSetup}
            disabled={loading}
            className="w-full h-9"
            variant="outline"
            size="sm"
          >
            <Fingerprint className="h-4 w-4 mr-2" />
            {loading ? 'Setting up...' : 'Setup Fingerprint'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}