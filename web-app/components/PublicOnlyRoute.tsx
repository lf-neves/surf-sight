'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/auth/useCurrentUser';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * PublicOnlyRoute - Wrapper component that redirects authenticated users away from public pages
 * Use this to wrap pages that should only be accessible when not logged in (e.g., login, signup)
 */
export function PublicOnlyRoute({ 
  children, 
  redirectTo = '/' 
}: PublicOnlyRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCurrentUser();

  useEffect(() => {
    // Redirect authenticated users away from public pages
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show nothing while checking authentication or if authenticated
  if (isLoading || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
