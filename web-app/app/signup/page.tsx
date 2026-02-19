'use client';

import { useRouter } from 'next/navigation';
import { useSignupMutation } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { AuthForm } from '@/components/auth/AuthForm';
import { TextField, SubmitButton } from '@/components/forms';
import { AuthLink } from '@/components/auth/AuthLink';
import { getUserFacingError } from '@/lib/errors/errorHandler';
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute';

interface SignupFormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function SignupPageContent() {
  const router = useRouter();
  const [signup, { loading, error }] = useSignupMutation();

  const handleSubmit = async (data: SignupFormData) => {
    try {
      const result = await signup({
        variables: {
          input: {
            email: data.email,
            password: data.password,
            name: data.name || undefined,
          },
        },
      });

      if (result.data?.signup) {
        // Store token and user
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', result.data.signup.token);
          localStorage.setItem('user', JSON.stringify(result.data.signup.user));
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
    <AuthForm<SignupFormData>
      title="Create an account"
      subtitle="Sign up to get started"
      onSubmit={handleSubmit}
      error={errorMessage}
      footer={
        <>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <TextField
        name="name"
        label="Name"
        type="text"
        placeholder="John Doe"
        disabled={loading}
        helperText="(optional)"
      />

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
        minLength={6}
      />

      <TextField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        required
        disabled={loading}
        minLength={6}
        rules={{
          validate: (value: string, formValues: { password?: string }) => {
            if (value !== formValues.password) {
              return 'Passwords do not match';
            }
            return true;
          },
        }}
      />

      <SubmitButton
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        loadingLabel="Creating account..."
        externalLoading={loading}
      >
        Sign up
      </SubmitButton>
    </AuthForm>
  );
}

export default function SignupPage() {
  return (
    <PublicOnlyRoute>
      <SignupPageContent />
    </PublicOnlyRoute>
  );
}
