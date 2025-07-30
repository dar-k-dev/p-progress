import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export function AuthPage() {
  return (
    <AuthLayout>
      <AuthForm />
    </AuthLayout>
  );
}