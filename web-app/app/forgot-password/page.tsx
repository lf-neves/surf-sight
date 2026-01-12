'use client';

import { useState } from 'react';
import { useRequestPasswordResetMutation } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { AuthForm } from '@/components/auth/AuthForm';
import { TextField, SubmitButton } from '@/components/forms';
import { AuthLink } from '@/components/auth/AuthLink';
import { Button } from '@/components/ui/button';
import { getUserFacingError } from '@/lib/errors/errorHandler';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [requestPasswordReset, { loading, error }] =
    useRequestPasswordResetMutation();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setEmail(data.email);
    try {
      await requestPasswordReset({
        variables: {
          email: data.email,
        },
      });
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled by Apollo
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Check your email
              </h1>
              <p className="text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <AuthLink href="/login">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                Back to login
              </Button>
            </AuthLink>
          </div>
        </div>
      </div>
    );
  }

  const errorMessage = error ? getUserFacingError(error) : null;

  return (
    <AuthForm<ForgotPasswordFormData>
      title="Reset password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      onSubmit={handleSubmit}
      error={errorMessage}
      footer={<AuthLink href="/login">Back to login</AuthLink>}
    >
      <TextField
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        disabled={loading}
      />

      <SubmitButton
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        loadingLabel="Sending..."
        externalLoading={loading}
      >
        Send reset link
      </SubmitButton>
    </AuthForm>
  );
}
