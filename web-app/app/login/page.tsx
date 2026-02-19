'use client';

import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { AuthForm } from '@/components/auth/AuthForm';
import { TextField, SubmitButton } from '@/components/forms';
import { AuthLink } from '@/components/auth/AuthLink';
import { getUserFacingError } from '@/lib/errors/errorHandler';
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute';

interface LoginFormData {
  email: string;
  password: string;
}

function LoginPageContent() {
  const router = useRouter();
  const [login, { loading, error }] = useLoginMutation();

  const handleSubmit = async (data: LoginFormData) => {
    try {
      const result = await login({
        variables: {
          input: {
            email: data.email,
            password: data.password,
          },
        },
      });

      if (result.data?.login) {
        // Store token and user
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', result.data.login.token);
          localStorage.setItem('user', JSON.stringify(result.data.login.user));
          // Dispatch custom event to update AuthProvider
          window.dispatchEvent(new Event('auth-token-updated'));
        }
        router.push('/');
      }
    } catch {
      // Error is handled by Apollo
    }
  };

  const errorMessage = error ? getUserFacingError(error) : null;

  return (
    <AuthForm<LoginFormData>
      title="Welcome back"
      subtitle="Sign in to your account"
      onSubmit={handleSubmit}
      error={errorMessage}
      footer={
        <>
          Don't have an account? <AuthLink href="/signup">Sign up</AuthLink>
        </>
      }
    >
      <div className="flex items-center justify-between text-sm">
        <AuthLink href="/forgot-password">Forgot password?</AuthLink>
      </div>

      <TextField
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        disabled={loading}
      />

      <TextField
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        disabled={loading}
      />

      <SubmitButton
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        loadingLabel="Signing in..."
        externalLoading={loading}
      >
        Sign in
      </SubmitButton>
    </AuthForm>
  );
}

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <LoginPageContent />
    </PublicOnlyRoute>
  );
}
