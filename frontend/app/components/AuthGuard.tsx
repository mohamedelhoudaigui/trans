'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and the user is NOT authenticated, boot them to the login page.
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While loading, or if authenticated, show the children.
  // You could show a spinner here while isLoading is true.
  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return <>{children}</>;
}
