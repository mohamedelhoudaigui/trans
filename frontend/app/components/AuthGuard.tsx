'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthGuard: A client-side component to protect routes.
 * - It checks the authentication state from the AuthContext.
 * - If the context is still loading, it shows a loading indicator.
 * - If loading is complete and the user is not authenticated, it
 *   forcefully redirects them to the '/login' page.
 * - If the user is authenticated, it renders the child components.
 * - This component is the primary mechanism for enforcing route security.
 */

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for the auth state to be resolved.
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to the login page.
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While loading, show a loading screen.
  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <p className="text-white">Loading Authentication...</p>
        </div>
    );
  }

  // If authenticated, render the protected content.
  // If not authenticated, this will be null briefly before the redirect effect runs.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
