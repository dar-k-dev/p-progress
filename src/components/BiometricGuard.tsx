import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BiometricAuth } from './BiometricAuth';
import { biometricService } from '@/lib/biometric';
import { useLocation } from 'react-router-dom';

interface BiometricGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/docs', '/documentation', '/privacy', '/terms', '/releases', '/support'];

export function BiometricGuard({ children }: BiometricGuardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsBiometric, setNeedsBiometric] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Always allow public routes without any authentication
    if (PUBLIC_ROUTES.includes(location.pathname)) {
      setIsAuthenticated(true);
      setNeedsBiometric(false);
      setLoading(false);
      return;
    }

    const hasPIN = biometricService.hasPIN(user.id);
    const hasFingerprint = biometricService.hasFingerprint(user.id);
    
    if (hasPIN || hasFingerprint) {
      // Check if already authenticated in this session
      if (biometricService.isSessionAuthenticated(user.id)) {
        setIsAuthenticated(true);
        setNeedsBiometric(false);
      } else {
        // Store intended destination before showing auth
        sessionStorage.setItem('intended_route', location.pathname);
        setNeedsBiometric(true);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(true);
      setNeedsBiometric(false);
    }
    
    setLoading(false);
  }, [user, location.pathname]);

  const handleBiometricSuccess = () => {
    if (user) {
      biometricService.setSessionAuthenticated(user.id);
      
      // Navigate to intended route or stay on current page
      const intendedRoute = sessionStorage.getItem('intended_route');
      if (intendedRoute && intendedRoute !== location.pathname) {
        sessionStorage.removeItem('intended_route');
        window.location.href = intendedRoute;
        return;
      }
    }
    setIsAuthenticated(true);
    setNeedsBiometric(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  // Always allow access to public routes
  if (PUBLIC_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  if (needsBiometric && !isAuthenticated) {
    return (
      <BiometricAuth
        userId={user.id}
        onSuccess={handleBiometricSuccess}
      />
    );
  }

  return <>{children}</>;
}